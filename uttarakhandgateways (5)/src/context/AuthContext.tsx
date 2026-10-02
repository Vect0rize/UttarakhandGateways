import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { deletePropertiesForAccount, isAppOwner } from '../utils/propertyOwnership';

export interface User {
  id: string;
  username: string;
  contact: string; // email or phone number
  contactType: 'email' | 'phone';
  avatar?: string;
  isVerified?: boolean;
  createdAt: string;
  usernameChangeTimestamps?: number[]; // rolling 7-day timestamps for 2 changes/week limit
  isOwner?: boolean;
}

export interface StoredUserAccount extends User {
  passwordHash: string;
}

export interface SavedAccount {
  id: string;
  username: string;
  contact: string;
  contactType: 'email' | 'phone';
  avatar?: string;
  lastLoginAt: number;
  passwordHash?: string;
  isOwner?: boolean;
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
  isOwner: boolean;
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
  
  // Multi-Account Switching & Save Info features
  savedAccounts: SavedAccount[];
  switchAccount: (accountId: string) => void;
  removeSavedAccount: (accountId: string) => void;
  isSavePromptOpen: boolean;
  pendingSaveAccount: User | null;
  saveCurrentAccountToDevice: () => void;
  dismissSavePrompt: () => void;

  // Platform Owner Management (Amit Tyagi)
  getAllRegisteredUsers: () => StoredUserAccount[];
  deleteUserByOwner: (userIdOrContact: string) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'uk_gateways_auth_user';
const REGISTERED_USERS_KEY = 'uk_gateways_registered_users';
const SAVED_ACCOUNTS_KEY = 'uk_gateways_saved_accounts';
const ACCOUNTS_WIPED_V3_KEY = 'uk_gateways_accounts_wiped_v3';

// One-time execution: "Delete every account right now"
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(ACCOUNTS_WIPED_V3_KEY) !== 'true') {
      localStorage.removeItem(REGISTERED_USERS_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(SAVED_ACCOUNTS_KEY);
      sessionStorage.removeItem('uk_gateways_pending_otp');
      localStorage.setItem(ACCOUNTS_WIPED_V3_KEY, 'true');
    }
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) {
        const u: User = JSON.parse(saved);
        u.isOwner = isAppOwner(u);
        return u;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSavePromptOpen, setIsSavePromptOpen] = useState(false);
  const [pendingSaveAccount, setPendingSaveAccount] = useState<User | null>(null);

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

  // Sync saved accounts to storage
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(savedAccounts));
    } catch {}
  }, [savedAccounts]);

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

  const handlePostLoginSaveCheck = (user: User, passwordHash?: string) => {
    // Check if account already exists in saved accounts
    const exists = savedAccounts.some((a) => a.id === user.id || a.contact.toLowerCase() === user.contact.toLowerCase());
    if (!exists) {
      setPendingSaveAccount(user);
      setIsSavePromptOpen(true);
    } else {
      // Update last login
      setSavedAccounts((prev) => 
        prev.map((a) => 
          a.id === user.id || a.contact.toLowerCase() === user.contact.toLowerCase()
            ? { ...a, lastLoginAt: Date.now(), username: user.username, avatar: user.avatar }
            : a
        )
      );
    }
  };

  const saveCurrentAccountToDevice = () => {
    const userToSave = pendingSaveAccount || currentUser;
    if (!userToSave) {
      setIsSavePromptOpen(false);
      return;
    }

    const newSaved: SavedAccount = {
      id: userToSave.id,
      username: userToSave.username,
      contact: userToSave.contact,
      contactType: userToSave.contactType,
      avatar: userToSave.avatar,
      lastLoginAt: Date.now(),
      isOwner: isAppOwner(userToSave),
    };

    setSavedAccounts((prev) => {
      const filtered = prev.filter((a) => a.id !== userToSave.id && a.contact.toLowerCase() !== userToSave.contact.toLowerCase());
      return [newSaved, ...filtered];
    });

    setIsSavePromptOpen(false);
    setPendingSaveAccount(null);
  };

  const dismissSavePrompt = () => {
    setIsSavePromptOpen(false);
    setPendingSaveAccount(null);
  };

  const switchAccount = (accountId: string) => {
    const found = savedAccounts.find((a) => a.id === accountId);
    if (found) {
      const safeUser: User = {
        id: found.id,
        username: found.username,
        contact: found.contact,
        contactType: found.contactType,
        avatar: found.avatar,
        isVerified: true,
        createdAt: new Date().toISOString(),
        isOwner: isAppOwner(found),
      };
      setCurrentUser(safeUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
      // Update last login
      setSavedAccounts((prev) => 
        prev.map((a) => a.id === accountId ? { ...a, lastLoginAt: Date.now() } : a)
      );
      return;
    }

    // Fallback: check registered users
    const allUsers = getRegisteredUsers();
    const regUser = allUsers.find((u) => u.id === accountId);
    if (regUser) {
      const safeUser: User = {
        id: regUser.id,
        username: regUser.username,
        contact: regUser.contact,
        contactType: regUser.contactType,
        avatar: regUser.avatar,
        isVerified: true,
        createdAt: regUser.createdAt,
        isOwner: isAppOwner(regUser),
      };
      setCurrentUser(safeUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    }
  };

  const removeSavedAccount = (accountId: string) => {
    setSavedAccounts((prev) => prev.filter((a) => a.id !== accountId));
    if (currentUser?.id === accountId) {
      logout();
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
      avatar: found.avatar,
      createdAt: found.createdAt,
      usernameChangeTimestamps: found.usernameChangeTimestamps || [],
      isOwner: isAppOwner(found),
    };

    setCurrentUser(safeUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    setIsAuthModalOpen(false);

    handlePostLoginSaveCheck(safeUser, trimmedPass);

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
      users[existingIndex].passwordHash = trimmedPass;
      if (trimmedUsername) users[existingIndex].username = trimmedUsername;
      users[existingIndex].isVerified = true;
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

      safeUser = {
        id: users[existingIndex].id,
        username: users[existingIndex].username,
        contact: users[existingIndex].contact,
        contactType: users[existingIndex].contactType,
        avatar: users[existingIndex].avatar,
        isVerified: true,
        createdAt: users[existingIndex].createdAt,
        usernameChangeTimestamps: users[existingIndex].usernameChangeTimestamps || [],
        isOwner: isAppOwner(users[existingIndex]),
      };
    } else {
      let finalUsername = trimmedUsername;
      // Allow Amit Tyagi without altering name
      if (trimmedUsername.toLowerCase() !== 'amit tyagi') {
        const usernameExists = users.some(
          (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
        );
        if (usernameExists) {
          finalUsername = `${trimmedUsername}_${Math.floor(100 + Math.random() * 900)}`;
        }
      }

      const newUser: StoredUserAccount = {
        id: `user-${Date.now()}`,
        username: finalUsername,
        contact: trimmedContact,
        contactType,
        isVerified: true,
        passwordHash: trimmedPass,
        createdAt: new Date().toISOString(),
        usernameChangeTimestamps: [],
        isOwner: isAppOwner({ username: finalUsername } as any),
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
        usernameChangeTimestamps: [],
        isOwner: isAppOwner(newUser),
      };
    }

    setCurrentUser(safeUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    setIsAuthModalOpen(false);

    handlePostLoginSaveCheck(safeUser, trimmedPass);

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

    const isEmail = trimmedContact.includes('@');
    const contactType: 'email' | 'phone' = isEmail ? 'email' : 'phone';

    const users = getRegisteredUsers();
    const existingIndex = users.findIndex(
      (u) => u.contact.toLowerCase() === trimmedContact.toLowerCase()
    );

    let safeUser: User;

    if (existingIndex >= 0) {
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
        avatar: existing.avatar,
        isVerified: true,
        createdAt: existing.createdAt,
        usernameChangeTimestamps: existing.usernameChangeTimestamps || [],
        isOwner: isAppOwner(existing),
      };
    } else {
      let finalUsername = trimmedUsername || (isEmail ? trimmedContact.split('@')[0] : `user_${trimmedContact.slice(-4)}`);
      if (finalUsername.toLowerCase() !== 'amit tyagi') {
        const usernameTaken = users.some(
          (u) => u.username.toLowerCase() === finalUsername.toLowerCase()
        );
        if (usernameTaken) {
          finalUsername = `${finalUsername}_${Math.floor(100 + Math.random() * 900)}`;
        }
      }

      const newUser: StoredUserAccount = {
        id: `user-${Date.now()}`,
        username: finalUsername,
        contact: trimmedContact,
        contactType,
        isVerified: true,
        passwordHash: trimmedPass || 'ukg1234',
        createdAt: new Date().toISOString(),
        usernameChangeTimestamps: [],
        isOwner: isAppOwner({ username: finalUsername } as any),
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
        usernameChangeTimestamps: [],
        isOwner: isAppOwner(newUser),
      };
    }

    setCurrentUser(safeUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    try {
      sessionStorage.removeItem('uk_gateways_pending_otp');
    } catch {}

    setIsAuthModalOpen(false);

    handlePostLoginSaveCheck(safeUser, trimmedPass);

    if (pendingSuccessCallback) {
      const cb = pendingSuccessCallback;
      setPendingSuccessCallback(null);
      setTimeout(() => cb(), 100);
    }

    return { success: true };
  };

  /**
   * Delete Account:
   * When an account is deleted, delete all properties uploaded by this account!
   */
  const deleteAccount = useCallback((targetContact?: string): { success: boolean; message: string } => {
    const contactToDelete = (targetContact || currentUser?.contact || currentUser?.username || '').trim().toLowerCase();
    
    if (!contactToDelete) {
      // Clear all accounts
      localStorage.removeItem(REGISTERED_USERS_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(SAVED_ACCOUNTS_KEY);
      setSavedAccounts([]);
      try { sessionStorage.removeItem('uk_gateways_pending_otp'); } catch {}
      setCurrentUser(null);
      return { success: true, message: 'All accounts cleared.' };
    }

    const users = getRegisteredUsers();
    const targetUser = users.find((u) => u.contact.toLowerCase() === contactToDelete || u.username.toLowerCase() === contactToDelete || u.id === contactToDelete);
    
    // Delete all properties from this account as requested!
    if (targetUser) {
      deletePropertiesForAccount({ id: targetUser.id, username: targetUser.username, contact: targetUser.contact });
    } else if (currentUser) {
      deletePropertiesForAccount({ id: currentUser.id, username: currentUser.username, contact: currentUser.contact });
    }

    const remaining = users.filter(
      (u) => u.contact.toLowerCase() !== contactToDelete && u.username.toLowerCase() !== contactToDelete && u.id !== contactToDelete
    );

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(remaining));

    // Remove from saved accounts
    setSavedAccounts((prev) => prev.filter((a) => a.contact.toLowerCase() !== contactToDelete && a.username.toLowerCase() !== contactToDelete && a.id !== contactToDelete));

    if (currentUser && (currentUser.contact.toLowerCase() === contactToDelete || currentUser.username.toLowerCase() === contactToDelete || currentUser.id === contactToDelete)) {
      setCurrentUser(null);
      localStorage.removeItem(AUTH_USER_KEY);
    }
    try { sessionStorage.removeItem('uk_gateways_pending_otp'); } catch {}

    return { success: true, message: `Account (${contactToDelete}) and all its listed properties deleted.` };
  }, [currentUser]);

  const clearAllAccounts = useCallback((): { success: boolean; message: string } => {
    localStorage.removeItem(REGISTERED_USERS_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(SAVED_ACCOUNTS_KEY);
    setSavedAccounts([]);
    try { sessionStorage.removeItem('uk_gateways_pending_otp'); } catch {}
    setCurrentUser(null);
    return { success: true, message: 'All stored accounts deleted from this browser.' };
  }, []);

  /**
   * Update Profile with Username Changes Limit:
   * "limit username changes 2 to per week"
   */
  const updateProfile = useCallback((updates: { username?: string; avatar?: string }): { success: boolean; error?: string } => {
    if (!currentUser) {
      return { success: false, error: 'No user is currently logged in' };
    }

    const newUsername = updates.username !== undefined ? updates.username.trim() : currentUser.username;
    if (!newUsername || newUsername.length < 2) {
      return { success: false, error: 'Username must be at least 2 characters long.' };
    }

    let updatedTimestamps = currentUser.usernameChangeTimestamps || [];

    // Check if username is being changed
    if (newUsername.toLowerCase() !== currentUser.username.toLowerCase()) {
      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
      const now = Date.now();
      const recentChanges = updatedTimestamps.filter((ts) => now - ts < ONE_WEEK_MS);

      if (recentChanges.length >= 2) {
        const oldest = Math.min(...recentChanges);
        const daysLeft = Math.ceil((oldest + ONE_WEEK_MS - now) / (24 * 60 * 60 * 1000));
        return {
          success: false,
          error: `Username changes are limited to 2 per week. Next change available in ${daysLeft} day${daysLeft > 1 ? 's' : ''}.`
        };
      }

      updatedTimestamps = [...recentChanges, now];
    }

    const updatedUser: User = {
      ...currentUser,
      username: newUsername,
      avatar: updates.avatar !== undefined ? updates.avatar : currentUser.avatar,
      usernameChangeTimestamps: updatedTimestamps,
      isOwner: isAppOwner({ username: newUsername } as any),
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
            usernameChangeTimestamps: updatedTimestamps,
          };
        }
        return u;
      });
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));

      // Also update saved accounts list if present
      setSavedAccounts((prev) => 
        prev.map((a) => 
          a.id === currentUser.id || a.contact.toLowerCase() === currentUser.contact.toLowerCase()
            ? { ...a, username: newUsername, avatar: updatedUser.avatar, isOwner: updatedUser.isOwner }
            : a
        )
      );
    } catch {}

    return { success: true };
  }, [currentUser]);

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

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

  // Platform Owner Functions
  const getAllRegisteredUsers = useCallback((): StoredUserAccount[] => {
    return getRegisteredUsers();
  }, []);

  const deleteUserByOwner = useCallback((userIdOrContact: string): { success: boolean; message: string } => {
    if (!isAppOwner(currentUser)) {
      return { success: false, message: 'Owner privileges required.' };
    }
    return deleteAccount(userIdOrContact);
  }, [currentUser, deleteAccount]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isOwner: isAppOwner(currentUser),
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
        savedAccounts,
        switchAccount,
        removeSavedAccount,
        isSavePromptOpen,
        pendingSaveAccount,
        saveCurrentAccountToDevice,
        dismissSavePrompt,
        getAllRegisteredUsers,
        deleteUserByOwner,
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
