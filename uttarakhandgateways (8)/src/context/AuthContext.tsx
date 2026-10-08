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
  sendRegistrationOtp: (contact: string, username: string) => Promise<{ success: boolean; error?: string; contactType?: 'email'; devCode?: string }>;
  verifyRegistrationOtp: (code: string, contact: string, username: string, password?: string) => { success: boolean; error?: string };
  sendOtp: (contact: string, username?: string) => Promise<{ success: boolean; error?: string; contactType?: 'email'; isExistingUser?: boolean; devCode?: string }>;
  verifyOtp: (code: string, contact: string, username?: string, password?: string) => { success: boolean; error?: string };
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

  // Helper to get all registered users with strict case-insensitive deduplication and 1 owner constraint
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

        // Enforce strictly 1 owner account across the platform
        if (isOwnerAcc) {
          if (ownerEncountered) continue;
          ownerEncountered = true;
        }

        // Prevent overlapping accounts (case-insensitive username or email)
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
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!trimmedContact.includes('@') || !trimmedContact.includes('.')) {
      return { success: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
    }
    if (!trimmedPass) {
      return { success: false, error: 'Please enter your password.' };
    }

    const users = getRegisteredUsers();
    const found = users.find((u) => {
      const uContact = u.contact.toLowerCase();
      if (uContact === trimmedContact) return true;
      if (u.username.toLowerCase() === trimmedContact) return true;
      return false;
    });

    if (!found) {
      return {
        success: false,
        error: 'No account found with this email address. Please register first or sign in with OTP.'
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
      contactType: 'email',
      avatar: found.avatar,
      createdAt: found.createdAt,
      usernameChangeTimestamps: found.usernameChangeTimestamps || [],
      isOwner: isAppOwner(found),
    };

    setCurrentUser(safeUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    setIsAuthModalOpen(false);
    triggerLoginAnimation(safeUser.username);

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
    const normUsername = trimmedUsername.toLowerCase();
    const trimmedContact = contact.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUsername || trimmedUsername.length < 2) {
      return { success: false, error: 'Please enter a valid username (at least 2 characters).' };
    }
    
    const isEmail = trimmedContact.includes('@') && trimmedContact.includes('.');
    if (!isEmail) {
      return { success: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
    }

    if (!trimmedPass || trimmedPass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    const contactType: 'email' = 'email';

    const users = getRegisteredUsers();

    // Check if email already exists
    const contactExists = users.some((u) => u.contact.trim().toLowerCase() === trimmedContact);

    if (contactExists) {
      return { success: false, error: 'An account with this email address already exists. Please log in instead.' };
    }

    // Check if username already exists (case-insensitive)
    const usernameExists = users.some((u) => u.username.trim().toLowerCase() === normUsername);
    if (usernameExists) {
      return { success: false, error: `Username "${trimmedUsername}" is already taken (usernames are case-insensitive). Please choose another username.` };
    }

    // Owner account exclusivity: only 1 owner account permitted
    const isClaimingOwner = normUsername === 'amit tyagi' || trimmedContact === 'amit1986.delhi@gmail.com';
    if (isClaimingOwner) {
      const ownerExists = users.some(
        (u) => u.username.trim().toLowerCase() === 'amit tyagi' || u.contact.trim().toLowerCase() === 'amit1986.delhi@gmail.com'
      );
      if (ownerExists) {
        return { success: false, error: 'Only one platform owner account is permitted. Please log in.' };
      }
    }

    const newUser: StoredUserAccount = {
      id: `user-${Date.now()}`,
      username: trimmedUsername,
      contact: trimmedContact,
      contactType,
      isVerified: true,
      passwordHash: trimmedPass,
      createdAt: new Date().toISOString(),
      usernameChangeTimestamps: [],
      isOwner: isAppOwner({ username: trimmedUsername } as any),
    };

    users.push(newUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

    const safeUser: User = {
      id: newUser.id,
      username: newUser.username,
      contact: newUser.contact,
      contactType: newUser.contactType,
      isVerified: true,
      createdAt: newUser.createdAt,
      usernameChangeTimestamps: [],
      isOwner: isAppOwner(newUser),
    };

    setCurrentUser(safeUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    setIsAuthModalOpen(false);
    triggerLoginAnimation(safeUser.username);

    handlePostLoginSaveCheck(safeUser, trimmedPass);

    if (pendingSuccessCallback) {
      const cb = pendingSuccessCallback;
      setPendingSuccessCallback(null);
      setTimeout(() => cb(), 100);
    }

    return { success: true };
  };

  const sendRegistrationOtp = async (
    contact: string, 
    username: string
  ): Promise<{ success: boolean; error?: string; contactType?: 'email'; devCode?: string }> => {
    const trimmedContact = contact.trim().toLowerCase();
    const trimmedUsername = username.trim();
    const normUsername = trimmedUsername.toLowerCase();

    if (!trimmedUsername || trimmedUsername.length < 2) {
      return { success: false, error: 'Please enter a valid username (at least 2 characters).' };
    }

    if (!trimmedContact || !trimmedContact.includes('@') || !trimmedContact.includes('.')) {
      return { success: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
    }

    // 1. Strict pre-check: does email already exist?
    const users = getRegisteredUsers();
    const contactExists = users.some((u) => u.contact.trim().toLowerCase() === trimmedContact);
    if (contactExists) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in instead.',
      };
    }

    // 2. Strict pre-check: does username already exist (case-insensitive)?
    const usernameExists = users.some((u) => u.username.trim().toLowerCase() === normUsername);
    if (usernameExists) {
      return {
        success: false,
        error: `Username "${trimmedUsername}" is already taken (usernames are case-insensitive). Please choose a different username.`,
      };
    }

    // 3. Strict owner account exclusivity: only 1 owner account permitted
    const isClaimingOwner = normUsername === 'amit tyagi' || trimmedContact === 'amit1986.delhi@gmail.com';
    if (isClaimingOwner) {
      const ownerExists = users.some(
        (u) => u.username.trim().toLowerCase() === 'amit tyagi' || u.contact.trim().toLowerCase() === 'amit1986.delhi@gmail.com'
      );
      if (ownerExists) {
        return {
          success: false,
          error: 'The official platform owner account (Amit Tyagi) already exists. Only 1 owner account is permitted. Please log in.',
        };
      }
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const otpData: PendingOtp = {
      contact: trimmedContact,
      code: otpCode,
      expiresAt,
    };

    let devCode: string | undefined = undefined;

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
      if (data?.devCode) {
        devCode = data.devCode;
      }
    } catch (error) {
      console.warn('[UKG OTP] Email request error, using code fallback:', error);
      devCode = otpCode;
    }

    const notificationPayload: TransmittedOtpNotification = {
      contact: trimmedContact,
      code: otpCode,
      channel: 'email',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      sessionStorage.setItem('uk_gateways_pending_otp', JSON.stringify(otpData));
      sessionStorage.setItem('uk_gateways_last_delivered_otp', JSON.stringify(notificationPayload));
    } catch {}

    setLastDeliveredMessage(notificationPayload);

    return {
      success: true,
      contactType: 'email',
      devCode,
    };
  };

  const sendOtp = async (
    contact: string,
    username?: string
  ): Promise<{ success: boolean; error?: string; contactType?: 'email'; isExistingUser?: boolean; devCode?: string }> => {
    const trimmedContact = contact.trim().toLowerCase();
    if (!trimmedContact || !trimmedContact.includes('@') || !trimmedContact.includes('.')) {
      return { success: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
    }

    const users = getRegisteredUsers();
    const existing = users.find((u) => u.contact.trim().toLowerCase() === trimmedContact);

    const isExistingUser = Boolean(existing);
    const resolvedUsername = existing?.username || username?.trim() || trimmedContact.split('@')[0];
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    const otpData: PendingOtp = {
      contact: trimmedContact,
      code: otpCode,
      expiresAt,
    };

    let devCode: string | undefined = undefined;

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: trimmedContact,
          username: resolvedUsername,
          code: otpCode,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (data?.devCode) {
        devCode = data.devCode;
      }
    } catch (error) {
      console.warn('[UKG OTP] Email request error, using code fallback:', error);
      devCode = otpCode;
    }

    const notificationPayload: TransmittedOtpNotification = {
      contact: trimmedContact,
      code: otpCode,
      channel: 'email',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      sessionStorage.setItem('uk_gateways_pending_otp', JSON.stringify(otpData));
      sessionStorage.setItem('uk_gateways_last_delivered_otp', JSON.stringify(notificationPayload));
    } catch {}

    setLastDeliveredMessage(notificationPayload);

    return {
      success: true,
      contactType: 'email',
      isExistingUser,
      devCode,
    };
  };

  const verifyOtp = (code: string, contact: string, username?: string, password?: string) => {
    const trimmedCode = code.trim();
    const trimmedContact = contact.trim().toLowerCase();

    if (!trimmedCode) {
      return { success: false, error: 'Please enter the 6-digit verification code.' };
    }

    let activeOtp: PendingOtp | null = null;
    try {
      const stored = sessionStorage.getItem('uk_gateways_pending_otp');
      if (stored) activeOtp = JSON.parse(stored);
    } catch {}

    const isMatch = activeOtp && activeOtp.code === trimmedCode && activeOtp.contact.toLowerCase() === trimmedContact;

    if (!isMatch) {
      return { success: false, error: 'Incorrect or expired verification code. Please check your email and try again.' };
    }

    if (activeOtp && activeOtp.expiresAt < Date.now()) {
      return { success: false, error: 'Verification code has expired. Please request a new code.' };
    }

    const users = getRegisteredUsers();
    let user = users.find((u) => u.contact.trim().toLowerCase() === trimmedContact);

    if (!user) {
      const fallbackName = username?.trim() || trimmedContact.split('@')[0];
      user = {
        id: `user-${Date.now()}`,
        username: fallbackName,
        contact: trimmedContact,
        contactType: 'email',
        isVerified: true,
        passwordHash: password?.trim() || 'ukg_email_verified',
        createdAt: new Date().toISOString(),
        usernameChangeTimestamps: [],
        isOwner: isAppOwner({ username: fallbackName, contact: trimmedContact } as any),
      };
      users.push(user);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    } else if (password?.trim() && password.trim() !== 'ukg_email_verified') {
      user.passwordHash = password.trim();
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    }

    const safeUser: User = {
      id: user.id,
      username: user.username,
      contact: user.contact,
      contactType: 'email',
      avatar: user.avatar,
      isVerified: true,
      createdAt: user.createdAt,
      usernameChangeTimestamps: [],
      isOwner: isAppOwner(user),
    };

    setCurrentUser(safeUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    try {
      sessionStorage.removeItem('uk_gateways_pending_otp');
    } catch {}

    setIsAuthModalOpen(false);
    triggerLoginAnimation(safeUser.username);
    handlePostLoginSaveCheck(safeUser, password?.trim() || 'ukg_email_verified');

    if (pendingSuccessCallback) {
      const cb = pendingSuccessCallback;
      setPendingSuccessCallback(null);
      setTimeout(() => cb(), 100);
    }

    return { success: true };
  };

  const verifyRegistrationOtp = (code: string, contact: string, username: string, password?: string) => {
    return verifyOtp(code, contact, username, password);
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
