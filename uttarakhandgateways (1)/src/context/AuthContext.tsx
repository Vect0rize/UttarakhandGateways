import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  username: string;
  contact: string; // email or phone number
  contactType: 'email' | 'phone';
  createdAt: string;
}

interface StoredUserAccount extends User {
  passwordHash: string; // simple stored password representation
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  authActionReason: string | null;
  openAuthModal: (mode?: 'login' | 'register', reason?: string, onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  login: (contact: string, password: string) => { success: boolean; error?: string };
  register: (username: string, contact: string, password: string) => { success: boolean; error?: string };
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

  // Ask for login or register on visit if user is not logged in
  useEffect(() => {
    if (!currentUser) {
      // Small timeout so initial mount renders cleanly, then prompt auth modal
      const timer = setTimeout(() => {
        setIsAuthModalOpen(true);
        setAuthModalMode('login');
        setAuthActionReason('Welcome to Uttarakhand Gateways! Please sign in or register to browse, list properties, or contact owners.');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

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
    const alreadyExists = users.some(
      (u) => u.contact.toLowerCase() === trimmedContact.toLowerCase() ||
             u.username.toLowerCase() === trimmedUsername.toLowerCase()
    );

    if (alreadyExists) {
      return {
        success: false,
        error: 'An account with this email, phone, or username already exists. Please log in instead.'
      };
    }

    const newUser: StoredUserAccount = {
      id: `user-${Date.now()}`,
      username: trimmedUsername,
      contact: trimmedContact,
      contactType,
      passwordHash: trimmedPass,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

    const safeUser: User = {
      id: newUser.id,
      username: newUser.username,
      contact: newUser.contact,
      contactType: newUser.contactType,
      createdAt: newUser.createdAt,
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

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
    // Prompt login on logout as well
    setIsAuthModalOpen(true);
    setAuthModalMode('login');
    setAuthActionReason('You have logged out. Please sign in or register to perform any action.');
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
