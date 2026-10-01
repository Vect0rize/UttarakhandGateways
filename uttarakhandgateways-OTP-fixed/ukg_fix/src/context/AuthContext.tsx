import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  username: string;
  contact: string; // email or phone number
  contactType: 'email' | 'phone';
  avatar?: string;
  isVerified?: boolean;
  createdAt: string;
}

interface StoredUserAccount extends User {
  passwordHash: string; // simple stored password representation
}

interface PendingOtp {
  contact: string;
  code: string;
  expiresAt: number;
}

export interface TransmittedOtpNotification {
  contact: string;
  code: string;
  channel: 'email' | 'phone';
  timestamp: string;
  emailPreviewUrl?: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  authActionReason: string | null;
  lastDeliveredMessage: TransmittedOtpNotification | null;
  openAuthModal: (mode?: 'login' | 'register', reason?: string, onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  login: (contact: string, password: string) => { success: boolean; error?: string };
  register: (username: string, contact: string, password: string) => { success: boolean; error?: string };
  sendRegistrationOtp: (contact: string, username: string) => Promise<{ success: boolean; error?: string; contactType?: 'email' | 'phone' }>;
  verifyRegistrationOtp: (code: string, contact: string, username: string, password: string) => { success: boolean; error?: string };
  deleteAccount: (contact?: string) => { success: boolean; message: string };
  clearAllAccounts: () => { success: boolean; message: string };
  updateProfile: (updates: { username?: string; avatar?: string }) => { success: boolean; error?: string };
  logout: () => void;
  requireAuth: <T>(action: () => T, reason?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'uk_gateways_auth_user';
const REGISTERED_USERS_KEY = 'uk_gateways_registered_users';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authActionReason, setAuthActionReason] = useState<string | null>(null);
  const [pendingSuccessCallback, setPendingSuccessCallback] = useState<(() => void) | null>(null);
  const [lastDeliveredMessage, setLastDeliveredMessage] = useState<TransmittedOtpNotification | null>(() => {
    try {
      const saved = sessionStorage.getItem('uk_gateways_last_delivered_otp');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Only open auth modal when user explicitly triggers an authenticated action
  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login', reason?: string, onSuccess?: () => void) => {
    setAuthModalMode(mode);
    setAuthActionReason(reason || null);
    if (onSuccess) {
      setPendingSuccessCallback(() => onSuccess);
    } else {
      setPendingSuccessCallback(null);
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthActionReason(null);
    setPendingSuccessCallback(null);
  }, []);

  // Helper to get all registered users
  const getRegisteredUsers = (): StoredUserAccount[] => {
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const login = (contact: string, password: string) => {
    const trimmedContact = contact.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedContact) {
      return { success: false, error: 'Please enter your email or phone number.' };
    }
    if (!trimmedPass) {
      return { success: false, error: 'Please enter your password.' };
    }

    const users = getRegisteredUsers();
    const found = users.find(
      (u) => u.contact.toLowerCase() === trimmedContact || u.username.toLowerCase() === trimmedContact
    );

    if (!found) {
      return {
        success: false,
        error: 'No account found with this email or phone number. Please register first.'
      };
    }

    if (found.passwordHash !== trimmedPass) {
      return {
        success: false,
        error: 'Incorrect password. Please verify and try again.'
      };
    }

    const safeUser: User = {
      id: found.id,
      username: found.username,
      contact: found.contact,
      contactType: found.contactType,
      createdAt: found.createdAt,
    };

    setCurrentUser(safeUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    setIsAuthModalOpen(false);

    if (pendingSuccessCallback) {
      const cb = pendingSuccessCallback;
      setPendingSuccessCallback(null);
      setTimeout(() => cb(), 100);
    }

    return { success: true };
  };

  const register = (username: string, contact: string, password: string) => {
    const trimmedUsername = username.trim();
    const trimmedContact = contact.trim();
    const trimmedPass = password.trim();

    if (!trimmedUsername || trimmedUsername.length < 2) {
      return { success: false, error: 'Please enter a valid username (at least 2 characters).' };
    }
    if (!trimmedContact || trimmedContact.length < 5) {
      return { success: false, error: 'Please enter a valid email address or phone number.' };
    }
    if (!trimmedPass || trimmedPass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    const isEmail = trimmedContact.includes('@');
    const contactType: 'email' | 'phone' = isEmail ? 'email' : 'phone';

    const users = getRegisteredUsers();
    const existingIndex = users.findIndex(
      (u) => u.contact.toLowerCase() === trimmedContact.toLowerCase()
    );

    let safeUser: User;

    if (existingIndex >= 0) {
      // Existing account: update password and log in immediately without blocking!
      users[existingIndex].passwordHash = trimmedPass;
      if (trimmedUsername) users[existingIndex].username = trimmedUsername;
      users[existingIndex].isVerified = true;
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

      safeUser = {
        id: users[existingIndex].id,
        username: users[existingIndex].username,
        contact: users[existingIndex].contact,
        contactType: users[existingIndex].contactType,
        isVerified: true,
        createdAt: users[existingIndex].createdAt,
      };
    } else {
      let finalUsername = trimmedUsername;
      const usernameExists = users.some(
        (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
      );
      if (usernameExists) {
        finalUsername = `${trimmedUsername}_${Math.floor(100 + Math.random() * 900)}`;
      }

      const newUser: StoredUserAccount = {
        id: `user-${Date.now()}`,
        username: finalUsername,
        contact: trimmedContact,
        contactType,
        isVerified: true,
        passwordHash: trimmedPass,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

      safeUser = {
        id: newUser.id,
        username: newUser.username,
        contact: newUser.contact,
        contactType: newUser.contactType,
        isVerified: true,
        createdAt: newUser.createdAt,
      };
    }

    setCurrentUser(safeUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    setIsAuthModalOpen(false);

    if (pendingSuccessCallback) {
      const cb = pendingSuccessCallback;
      setPendingSuccessCallback(null);
      setTimeout(() => cb(), 100);
    }

    return { success: true };
  };

  const sendRegistrationOtp = async (contact: string, username: string) => {
    const trimmedContact = contact.trim();
    const trimmedUsername = username.trim();

    if (!trimmedContact || trimmedContact.length < 5) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const isEmail = trimmedContact.includes('@');
    if (!isEmail) {
      return { success: false, error: 'Please register using an email address.' };
    }

    const contactType: 'email' = 'email';

    // Generate a 6-digit OTP locally for the current verification flow.
    // The server receives this code only to send it by email.
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const otpData: PendingOtp = {
      contact: trimmedContact,
      code: otpCode,
      expiresAt,
    };

    const notificationPayload: TransmittedOtpNotification = {
      contact: trimmedContact,
      code: otpCode,
      channel: contactType,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      emailPreviewUrl: null,
    };

    try {
      sessionStorage.setItem('uk_gateways_pending_otp', JSON.stringify(otpData));
      sessionStorage.setItem('uk_gateways_last_delivered_otp', JSON.stringify(notificationPayload));
    } catch {}

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: trimmedContact,
          username: trimmedUsername,
          code: otpCode,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        return {
          success: false,
          error: data?.error || 'Failed to send verification email.',
        };
      }

      setLastDeliveredMessage(notificationPayload);

      return {
        success: true,
        contactType,
      };
    } catch (error) {
      console.error('[UKG OTP] Email request failed:', error);
      return {
        success: false,
        error: 'Could not connect to the email server. Please try again.',
      };
    }
  };

  const verifyRegistrationOtp = (code: string, contact: string, username: string, password: string) => {
    const trimmedCode = code.trim();
    const trimmedContact = contact.trim();
    const trimmedUsername = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedCode) {
      return { success: false, error: 'Please enter the 6-digit verification code.' };
    }

    let activeOtp: PendingOtp | null = null;
    try {
      const saved = sessionStorage.getItem('uk_gateways_pending_otp');
      if (saved) activeOtp = JSON.parse(saved);
    } catch {}

    if (!activeOtp || activeOtp.contact.toLowerCase() !== trimmedContact.toLowerCase()) {
      return { success: false, error: 'No active OTP found for this contact. Please request a new OTP.' };
    }

    if (Date.now() > activeOtp.expiresAt) {
      return { success: false, error: 'The verification code has expired. Please request a new OTP.' };
    }

    if (activeOtp.code !== trimmedCode) {
      return { success: false, error: 'Incorrect verification code. Please check and try again.' };
    }

    // OTP verified! Proceed with registration or login
    const isEmail = trimmedContact.includes('@');
    const contactType: 'email' | 'phone' = isEmail ? 'email' : 'phone';

    const users = getRegisteredUsers();
    const existingIndex = users.findIndex(
      (u) => u.contact.toLowerCase() === trimmedContact.toLowerCase()
    );

    let safeUser: User;

    if (existingIndex >= 0) {
      // Existing user: mark verified and update password if provided
      const existing = users[existingIndex];
      existing.isVerified = true;
      if (trimmedPass) existing.passwordHash = trimmedPass;
      if (trimmedUsername && (!existing.username || existing.username === 'user')) {
        existing.username = trimmedUsername;
      }
      users[existingIndex] = existing;
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

      safeUser = {
        id: existing.id,
        username: existing.username,
        contact: existing.contact,
        contactType: existing.contactType,
        isVerified: true,
        createdAt: existing.createdAt,
      };
    } else {
      // New user: make sure username is unique if taken by someone else
      let finalUsername = trimmedUsername || (isEmail ? trimmedContact.split('@')[0] : `user_${trimmedContact.slice(-4)}`);
      const usernameTaken = users.some(
        (u) => u.username.toLowerCase() === finalUsername.toLowerCase()
      );
      if (usernameTaken) {
        finalUsername = `${finalUsername}_${Math.floor(100 + Math.random() * 900)}`;
      }

      const newUser: StoredUserAccount = {
        id: `user-${Date.now()}`,
        username: finalUsername,
        contact: trimmedContact,
        contactType,
        isVerified: true,
        passwordHash: trimmedPass || 'ukg1234',
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

      safeUser = {
        id: newUser.id,
        username: newUser.username,
        contact: newUser.contact,
        contactType: newUser.contactType,
        isVerified: true,
        createdAt: newUser.createdAt,
      };
    }

    setCurrentUser(safeUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    try {
      sessionStorage.removeItem('uk_gateways_pending_otp');
    } catch {}

    setIsAuthModalOpen(false);

    if (pendingSuccessCallback) {
      const cb = pendingSuccessCallback;
      setPendingSuccessCallback(null);
      setTimeout(() => cb(), 100);
    }

    return { success: true };
  };

  const deleteAccount = useCallback((targetContact?: string): { success: boolean; message: string } => {
    const contactToDelete = (targetContact || currentUser?.contact || currentUser?.username || '').trim().toLowerCase();
    
    if (!contactToDelete) {
      // Clear all accounts if none specified
      localStorage.removeItem(REGISTERED_USERS_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      try { sessionStorage.removeItem('uk_gateways_pending_otp'); } catch {}
      setCurrentUser(null);
      return { success: true, message: 'All test accounts cleared. You can now register fresh.' };
    }

    const users = getRegisteredUsers();
    const remaining = users.filter(
      (u) => u.contact.toLowerCase() !== contactToDelete && u.username.toLowerCase() !== contactToDelete
    );

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(remaining));

    if (currentUser && (currentUser.contact.toLowerCase() === contactToDelete || currentUser.username.toLowerCase() === contactToDelete)) {
      setCurrentUser(null);
      localStorage.removeItem(AUTH_USER_KEY);
    }
    try { sessionStorage.removeItem('uk_gateways_pending_otp'); } catch {}

    return { success: true, message: `Account (${contactToDelete}) deleted successfully.` };
  }, [currentUser]);

  const clearAllAccounts = useCallback((): { success: boolean; message: string } => {
    localStorage.removeItem(REGISTERED_USERS_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    try { sessionStorage.removeItem('uk_gateways_pending_otp'); } catch {}
    setCurrentUser(null);
    return { success: true, message: 'All stored accounts deleted from this browser.' };
  }, []);

  const updateProfile = useCallback((updates: { username?: string; avatar?: string }): { success: boolean; error?: string } => {
    if (!currentUser) {
      return { success: false, error: 'No user is currently logged in' };
    }

    const newUsername = updates.username !== undefined ? updates.username.trim() : currentUser.username;
    if (!newUsername || newUsername.length < 2) {
      return { success: false, error: 'Username must be at least 2 characters long.' };
    }

    const updatedUser: User = {
      ...currentUser,
      username: newUsername,
      avatar: updates.avatar !== undefined ? updates.avatar : currentUser.avatar,
    };

    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      const registered = getRegisteredUsers();
      const updatedList = registered.map((u) => {
        if (u.id === currentUser.id || u.contact.toLowerCase() === currentUser.contact.toLowerCase()) {
          return {
            ...u,
            username: newUsername,
            avatar: updatedUser.avatar,
          };
        }
        return u;
      });
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));
    } catch {}

    return { success: true };
  }, [currentUser]);

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  /**
   * Action Guard: Checks if user is authenticated.
   * If yes, executes action immediately.
   * If not, opens Auth Modal with explanation and executes action once logged in.
   */
  const requireAuth = useCallback(<T,>(action: () => T, reason?: string): boolean => {
    if (currentUser) {
      action();
      return true;
    }

    openAuthModal(
      'login',
      reason || 'You must log in or register before performing this action.',
      () => {
        action();
      }
    );
    return false;
  }, [currentUser, openAuthModal]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAuthModalOpen,
        authModalMode,
        authActionReason,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        sendRegistrationOtp,
        verifyRegistrationOtp,
        lastDeliveredMessage,
        deleteAccount,
        clearAllAccounts,
        updateProfile,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
