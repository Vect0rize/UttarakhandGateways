import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { deletePropertiesForAccount, isAppOwner } from '../utils/propertyOwnership';

export interface User {
  id: string;
  username: string;
  contact: string; // verified email address
  contactType: 'email';
  avatar?: string;
  isVerified?: boolean;
  createdAt: string;
  usernameChangeTimestamps?: number[]; // rolling 7-day timestamps for 2 changes/week limit
  isOwner?: boolean;
  provider?: 'email' | 'google' | 'microsoft' | 'apple';
}

export interface StoredUserAccount extends User {
  passwordHash: string;
}

export interface SavedAccount {
  id: string;
  username: string;
  contact: string;
  contactType: 'email';
  avatar?: string;
  lastLoginAt: number;
  passwordHash?: string;
  isOwner?: boolean;
  provider?: 'email' | 'google' | 'microsoft' | 'apple';
}

interface PendingOtp {
  contact: string;
  code: string;
  expiresAt: number;
}

export interface TransmittedOtpNotification {
  contact: string;
  code: string;
  channel: 'email';
  timestamp: string;
  emailPreviewUrl?: string | null;
}

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register' | 'forgot-password' | 'reset-password';
  authActionReason: string | null;
  lastDeliveredMessage: TransmittedOtpNotification | null;
  openAuthModal: (mode?: 'login' | 'register' | 'forgot-password' | 'reset-password', reason?: string, onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  login: (contact: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, contact: string, password: string) => Promise<{ success: boolean; error?: string }>;
  checkEmailRegistered: (email: string) => Promise<boolean>;
  requestPasswordReset: (contact: string) => Promise<{ success: boolean; error?: string; message?: string; devResetToken?: string }>;
  verifyResetToken: (token: string) => Promise<{ success: boolean; error?: string; email?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  loginWithSocialProvider: (provider: 'google' | 'microsoft' | 'apple', accountDetails?: { email: string; name: string; avatar?: string }) => { success: boolean; error?: string };
  sendRegistrationOtp: (contact: string, username: string) => Promise<{ success: boolean; error?: string; contactType?: 'email'; devCode?: string }>;
  verifyRegistrationOtp: (code: string, contact: string, username: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  sendOtp: (contact: string, username?: string) => Promise<{ success: boolean; error?: string; contactType?: 'email'; isExistingUser?: boolean; devCode?: string; notRegistered?: boolean }>;
  verifyOtp: (code: string, contact: string, username?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: (contact?: string) => { success: boolean; message: string };
  clearAllAccounts: () => { success: boolean; message: string };
  updateProfile: (updates: { username?: string; avatar?: string }) => { success: boolean; error?: string };
  logout: () => Promise<void>;
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

  // Login Success Celebration Animation
  showLoginAnimation: boolean;
  loginAnimationUser?: string;
  triggerLoginAnimation: (username?: string) => void;
  dismissLoginAnimation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'uk_gateways_auth_user';
const REGISTERED_USERS_KEY = 'uk_gateways_registered_users';
const SAVED_ACCOUNTS_KEY = 'uk_gateways_saved_accounts';

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
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>('login');
  const [authActionReason, setAuthActionReason] = useState<string | null>(null);
  const [pendingSuccessCallback, setPendingSuccessCallback] = useState<(() => void) | null>(null);
  
  // Login Celebration Animation State
  const [showLoginAnimation, setShowLoginAnimation] = useState(false);
  const [loginAnimationUser, setLoginAnimationUser] = useState<string | undefined>(undefined);

  const triggerLoginAnimation = useCallback((username?: string) => {
    setLoginAnimationUser(username);
    setShowLoginAnimation(true);
  }, []);

  const dismissLoginAnimation = useCallback(() => {
    setShowLoginAnimation(false);
  }, []);

  const [lastDeliveredMessage, setLastDeliveredMessage] = useState<TransmittedOtpNotification | null>(() => {
    try {
      const saved = sessionStorage.getItem('uk_gateways_last_delivered_otp');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Check persistent session cookie on server mount (/api/auth/me)
  useEffect(() => {
    let isMounted = true;
    const checkServerSession = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const serverUser: User = {
              id: data.user.id,
              username: data.user.username,
              contact: data.user.contact,
              contactType: 'email',
              avatar: data.user.avatar,
              isVerified: Boolean(data.user.isVerified),
              createdAt: data.user.createdAt || new Date().toISOString(),
              isOwner: isAppOwner(data.user),
            };
            setCurrentUser(serverUser);
            try {
              localStorage.setItem(AUTH_USER_KEY, JSON.stringify(serverUser));
            } catch {}
          }
        }
      } catch (err) {
        // Network offline or local dev without server
        console.warn('Session check warning:', err);
      }
    };

    void checkServerSession();
    return () => { isMounted = false; };
  }, []);

  // Sync saved accounts to storage
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(savedAccounts));
    } catch {}
  }, [savedAccounts]);

  const openAuthModal = useCallback((
    mode: 'login' | 'register' | 'forgot-password' | 'reset-password' = 'login', 
    reason?: string, 
    onSuccess?: () => void
  ) => {
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

  // Helper to get registered users from localStorage
  const getRegisteredUsers = (): StoredUserAccount[] => {
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      if (!data) return [];
      const parsed: StoredUserAccount[] = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      const sanitized: StoredUserAccount[] = [];
      const seenUsernames = new Set<string>();
      const seenContacts = new Set<string>();
      let ownerEncountered = false;

      for (const u of parsed) {
        if (!u || !u.username || !u.contact) continue;
        const normU = u.username.trim().toLowerCase();
        const normC = u.contact.trim().toLowerCase();
        const isOwnerAcc = normU === 'amit tyagi' || normC === 'amit1986.delhi@gmail.com';

        if (isOwnerAcc) {
          if (ownerEncountered) continue;
          ownerEncountered = true;
        }

        if (seenUsernames.has(normU) || seenContacts.has(normC)) {
          continue;
        }

        seenUsernames.add(normU);
        seenContacts.add(normC);
        sanitized.push({
          ...u,
          isOwner: isOwnerAcc || isAppOwner(u),
        });
      }

      return sanitized;
    } catch {
      return [];
    }
  };

  const checkEmailRegistered = useCallback(async (email: string): Promise<boolean> => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) return false;

    // Check server database endpoint
    try {
      const res = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        return Boolean(data.exists);
      }
    } catch (err) {
      console.warn('Server email check error:', err);
    }

    // Fallback: check registered accounts in localStorage
    const localUsers = getRegisteredUsers();
    return localUsers.some((u) => u.contact.trim().toLowerCase() === trimmed);
  }, []);

  const handlePostLoginSaveCheck = (user: User) => {
    const exists = savedAccounts.some((a) => a.id === user.id || a.contact.toLowerCase() === user.contact.toLowerCase());
    if (!exists) {
      setSavedAccounts((prev) => [
        {
          id: user.id,
          username: user.username,
          contact: user.contact,
          contactType: user.contactType,
          isOwner: user.isOwner,
          avatar: user.avatar,
          lastLoginAt: Date.now(),
        },
        ...prev.filter((a) => a.id !== user.id && a.contact.toLowerCase() !== user.contact.toLowerCase()),
      ]);
    } else {
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
      setSavedAccounts((prev) => 
        prev.map((a) => a.id === accountId ? { ...a, lastLoginAt: Date.now() } : a)
      );
      return;
    }

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
      void logout();
    }
  };

  // Real backend login with secure session cookie
  const login = async (contact: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedContact = contact.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedContact) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!trimmedContact.includes('@') || !trimmedContact.includes('.')) {
      return { success: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
    }
    if (!trimmedPass) {
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ contact: trimmedContact, password: trimmedPass }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          error: data?.error || 'Login failed. Please check your email and password.',
        };
      }

      if (data?.user) {
        const safeUser: User = {
          id: data.user.id,
          username: data.user.username,
          contact: data.user.contact,
          contactType: 'email',
          avatar: data.user.avatar,
          createdAt: data.user.createdAt || new Date().toISOString(),
          isVerified: true,
          isOwner: isAppOwner(data.user),
        };

        setCurrentUser(safeUser);
        try {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
        } catch {}

        setIsAuthModalOpen(false);
        triggerLoginAnimation(safeUser.username);
        handlePostLoginSaveCheck(safeUser);

        if (pendingSuccessCallback) {
          const cb = pendingSuccessCallback;
          setPendingSuccessCallback(null);
          setTimeout(() => cb(), 100);
        }

        return { success: true };
      }

      return { success: false, error: 'Invalid response from server.' };
    } catch (err: any) {
      console.warn('Server login error, checking local store:', err);

      // Local fallback for offline mode
      const users = getRegisteredUsers();
      const found = users.find((u) => u.contact.toLowerCase() === trimmedContact);
      if (found && found.passwordHash === trimmedPass) {
        const safeUser: User = {
          id: found.id,
          username: found.username,
          contact: found.contact,
          contactType: 'email',
          avatar: found.avatar,
          createdAt: found.createdAt,
          isVerified: true,
          isOwner: isAppOwner(found),
        };
        setCurrentUser(safeUser);
        try { localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser)); } catch {}
        setIsAuthModalOpen(false);
        triggerLoginAnimation(safeUser.username);
        handlePostLoginSaveCheck(safeUser);
        return { success: true };
      }

      return { success: false, error: 'Could not connect to the authentication server.' };
    }
  };

  // Real backend registration with secure session cookie & bcrypt hashing
  const register = async (username: string, contact: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUsername = username.trim();
    const trimmedContact = contact.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUsername || trimmedUsername.length < 2) {
      return { success: false, error: 'Please enter a valid username (at least 2 characters).' };
    }
    
    if (!trimmedContact.includes('@') || !trimmedContact.includes('.')) {
      return { success: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
    }

    if (!trimmedPass || trimmedPass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: trimmedUsername,
          contact: trimmedContact,
          password: trimmedPass,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          success: false,
          error: data?.error || 'Registration failed. Please try a different email or username.',
        };
      }

      if (data?.user) {
        const safeUser: User = {
          id: data.user.id,
          username: data.user.username,
          contact: data.user.contact,
          contactType: 'email',
          avatar: data.user.avatar,
          createdAt: data.user.createdAt || new Date().toISOString(),
          isVerified: true,
          isOwner: isAppOwner(data.user),
        };

        setCurrentUser(safeUser);
        try {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
        } catch {}

        setIsAuthModalOpen(false);
        triggerLoginAnimation(safeUser.username);
        handlePostLoginSaveCheck(safeUser);

        if (pendingSuccessCallback) {
          const cb = pendingSuccessCallback;
          setPendingSuccessCallback(null);
          setTimeout(() => cb(), 100);
        }

        return { success: true };
      }

      return { success: false, error: 'Failed to parse registration response.' };
    } catch (err: any) {
      console.warn('Registration request failed:', err);
      return { success: false, error: 'Unable to connect to the registration server.' };
    }
  };

  // Password Reset: Request Token
  const requestPasswordReset = async (contact: string): Promise<{ success: boolean; error?: string; message?: string; devResetToken?: string }> => {
    const trimmedContact = contact.trim().toLowerCase();
    if (!trimmedContact || !trimmedContact.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: trimmedContact }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || 'Could not request password reset.' };
      }

      return {
        success: true,
        message: data.message || 'If that email exists in our system, password reset instructions have been sent.',
        devResetToken: data.devResetToken,
      };
    } catch (err: any) {
      return { success: false, error: 'Failed to connect to server. Please try again later.' };
    }
  };

  // Password Reset: Verify Token Validity
  const verifyResetToken = async (token: string): Promise<{ success: boolean; error?: string; email?: string }> => {
    if (!token.trim()) {
      return { success: false, error: 'Reset token is required.' };
    }

    try {
      const res = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || 'Invalid or expired password reset link.' };
      }

      return { success: true, email: data.email };
    } catch {
      return { success: false, error: 'Unable to verify reset token.' };
    }
  };

  // Password Reset: Set New Password
  const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    if (!token.trim()) {
      return { success: false, error: 'Reset token is missing.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), newPassword: newPassword.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data?.error || 'Failed to reset password. The link may have expired.' };
      }

      return { success: true, message: data.message || 'Password updated successfully! You can now sign in.' };
    } catch {
      return { success: false, error: 'Unable to connect to server. Please try again later.' };
    }
  };

  // OTP Fallback Methods
  const sendRegistrationOtp = async (
    contact: string, 
    username: string
  ): Promise<{ success: boolean; error?: string; contactType?: 'email'; devCode?: string }> => {
    const trimmedContact = contact.trim().toLowerCase();
    const trimmedUsername = username.trim();

    if (!trimmedUsername || trimmedUsername.length < 2) {
      return { success: false, error: 'Please enter a valid username (at least 2 characters).' };
    }

    if (!trimmedContact || !trimmedContact.includes('@') || !trimmedContact.includes('.')) {
      return { success: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
    }

    const isRegistered = await checkEmailRegistered(trimmedContact);
    if (isRegistered) {
      return { success: false, error: 'An account with this email address already exists. Please log in instead.' };
    }

    let devCode: string | undefined = undefined;

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: trimmedContact, username: trimmedUsername }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { success: false, error: data?.error || 'Failed to send verification code.' };
      }
      if (data?.devCode) devCode = data.devCode;
    } catch {
      return { success: false, error: 'Could not connect to verification server. Please try again.' };
    }

    const notificationPayload: TransmittedOtpNotification = {
      contact: trimmedContact,
      code: devCode || '******',
      channel: 'email',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      sessionStorage.setItem('uk_gateways_last_delivered_otp', JSON.stringify(notificationPayload));
    } catch {}

    setLastDeliveredMessage(notificationPayload);
    return { success: true, contactType: 'email', devCode };
  };

  const sendOtp = async (
    contact: string,
    username?: string
  ): Promise<{ success: boolean; error?: string; contactType?: 'email'; isExistingUser?: boolean; devCode?: string; notRegistered?: boolean }> => {
    const trimmedContact = contact.trim().toLowerCase();
    if (!trimmedContact || !trimmedContact.includes('@') || !trimmedContact.includes('.')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const isRegistered = await checkEmailRegistered(trimmedContact);
    if (!isRegistered) {
      return { success: false, notRegistered: true, error: 'No account found with this email. Please create an account first.' };
    }

    let devCode: string | undefined = undefined;

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: trimmedContact, username: username || trimmedContact.split('@')[0] }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { success: false, error: data?.error || 'Failed to send verification code.' };
      }
      if (data?.devCode) devCode = data.devCode;
    } catch {
      return { success: false, error: 'Could not connect to verification server. Please try again.' };
    }

    const notificationPayload: TransmittedOtpNotification = {
      contact: trimmedContact,
      code: devCode || '******',
      channel: 'email',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      sessionStorage.setItem('uk_gateways_last_delivered_otp', JSON.stringify(notificationPayload));
    } catch {}

    setLastDeliveredMessage(notificationPayload);
    return { success: true, contactType: 'email', isExistingUser: true, devCode };
  };

  const verifyOtp = async (
    code: string,
    contact: string,
    username?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const trimmedCode = code.trim();
    const trimmedContact = contact.trim().toLowerCase();

    if (!trimmedCode) {
      return { success: false, error: 'Please enter the verification code.' };
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          contact: trimmedContact,
          code: trimmedCode,
          username: username || trimmedContact.split('@')[0],
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data?.error || 'Verification failed. Please check the code.' };
      }

      if (data?.user) {
        const safeUser: User = {
          id: data.user.id,
          username: data.user.username,
          contact: data.user.contact,
          contactType: 'email',
          avatar: data.user.avatar,
          createdAt: data.user.createdAt || new Date().toISOString(),
          isVerified: true,
          isOwner: isAppOwner(data.user),
        };

        setCurrentUser(safeUser);
        try {
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
          sessionStorage.removeItem('uk_gateways_pending_otp');
        } catch {}

        setIsAuthModalOpen(false);
        triggerLoginAnimation(safeUser.username);
        handlePostLoginSaveCheck(safeUser);

        if (pendingSuccessCallback) {
          const cb = pendingSuccessCallback;
          setPendingSuccessCallback(null);
          setTimeout(() => cb(), 100);
        }

        return { success: true };
      }
      return { success: false, error: 'Server did not return user details.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Verification service unreachable.' };
    }
  };

  const verifyRegistrationOtp = async (
    code: string,
    contact: string,
    username: string
  ): Promise<{ success: boolean; error?: string }> => {
    return verifyOtp(code, contact, username);
  };

  const loginWithSocialProvider = useCallback((
    provider: 'google' | 'microsoft' | 'apple',
    accountDetails?: { email: string; name: string; avatar?: string }
  ): { success: boolean; error?: string } => {
    const email = accountDetails?.email?.trim().toLowerCase() || `${provider}-user@uttarakhandgateways.com`;
    const name = accountDetails?.name?.trim() || email.split('@')[0];

    const safeUser: User = {
      id: `user-${provider}-${Date.now()}`,
      username: name,
      contact: email,
      contactType: 'email',
      isVerified: true,
      provider,
      avatar: accountDetails?.avatar,
      createdAt: new Date().toISOString(),
      isOwner: isAppOwner({ username: name, contact: email } as any),
    };

    setCurrentUser(safeUser);
    try { localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser)); } catch {}
    setIsAuthModalOpen(false);
    triggerLoginAnimation(safeUser.username);
    handlePostLoginSaveCheck(safeUser);

    if (pendingSuccessCallback) {
      const cb = pendingSuccessCallback;
      setPendingSuccessCallback(null);
      setTimeout(() => cb(), 100);
    }

    return { success: true };
  }, [triggerLoginAnimation, pendingSuccessCallback]);

  const deleteAccount = useCallback((targetContact?: string): { success: boolean; message: string } => {
    const contactToDelete = (targetContact || currentUser?.contact || '').trim().toLowerCase();
    
    if (currentUser) {
      deletePropertiesForAccount({ id: currentUser.id, username: currentUser.username, contact: currentUser.contact });
    }

    if (!contactToDelete || (currentUser && currentUser.contact.toLowerCase() === contactToDelete)) {
      void logout();
    }

    setSavedAccounts((prev) => prev.filter((a) => a.contact.toLowerCase() !== contactToDelete));
    return { success: true, message: 'Account deleted.' };
  }, [currentUser]);

  const clearAllAccounts = useCallback((): { success: boolean; message: string } => {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(SAVED_ACCOUNTS_KEY);
    localStorage.removeItem(REGISTERED_USERS_KEY);
    setSavedAccounts([]);
    setCurrentUser(null);
    return { success: true, message: 'All accounts removed.' };
  }, []);

  const updateProfile = useCallback((updates: { username?: string; avatar?: string }): { success: boolean; error?: string } => {
    if (!currentUser) {
      return { success: false, error: 'No user is currently logged in.' };
    }

    const newUsername = updates.username !== undefined ? updates.username.trim() : currentUser.username;
    if (!newUsername || newUsername.length < 2) {
      return { success: false, error: 'Username must be at least 2 characters.' };
    }

    const updatedUser: User = {
      ...currentUser,
      username: newUsername,
      avatar: updates.avatar !== undefined ? updates.avatar : currentUser.avatar,
      isOwner: isAppOwner({ username: newUsername, contact: currentUser.contact } as any),
    };

    setCurrentUser(updatedUser);
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
    } catch {}

    return { success: true };
  }, [currentUser]);

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Logout network notice:', e);
    }
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_USER_KEY);
    } catch {}
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
        checkEmailRegistered,
        requestPasswordReset,
        verifyResetToken,
        resetPassword,
        loginWithSocialProvider,
        sendRegistrationOtp,
        verifyRegistrationOtp,
        sendOtp,
        verifyOtp,
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
        showLoginAnimation,
        loginAnimationUser,
        triggerLoginAnimation,
        dismissLoginAnimation,
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
