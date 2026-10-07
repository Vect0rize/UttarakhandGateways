var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/context/AuthContext.tsx
var AuthContext_exports = {};
__export(AuthContext_exports, {
  AuthProvider: () => AuthProvider,
  useAuth: () => useAuth
});
module.exports = __toCommonJS(AuthContext_exports);
var import_react = require("react");

// src/utils/propertyOwnership.ts
var isAppOwner = (user) => {
  if (!user || !user.username) return false;
  return user.username.trim().toLowerCase() === "amit tyagi";
};
var deletePropertiesForAccount = (account) => {
  try {
    const raw = localStorage.getItem("uk_gateways_uploaded_properties");
    if (!raw) return [];
    const list = JSON.parse(raw);
    const targetId = account.id;
    const targetUser = (account.username || "").trim().toLowerCase();
    const targetContact = (account.contact || "").trim().toLowerCase();
    const remaining = list.filter((p) => {
      if (targetId && p.ownerId === targetId) return false;
      if (targetUser && p.ownerUsername && p.ownerUsername.trim().toLowerCase() === targetUser) return false;
      if (targetUser && p.sellerName && p.sellerName.trim().toLowerCase() === targetUser) return false;
      if (targetContact && p.ownerContact && p.ownerContact.trim().toLowerCase() === targetContact) return false;
      if (targetContact && p.sellerEmail && p.sellerEmail.trim().toLowerCase() === targetContact) return false;
      return true;
    });
    localStorage.setItem("uk_gateways_uploaded_properties", JSON.stringify(remaining));
    window.dispatchEvent(new CustomEvent("uk_gateways_properties_updated", { detail: remaining }));
    return remaining;
  } catch (err) {
    console.error("[UKG] Failed to delete properties for account:", err);
    return [];
  }
};

// src/context/AuthContext.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var AuthContext = (0, import_react.createContext)(void 0);
var AUTH_USER_KEY = "uk_gateways_auth_user";
var REGISTERED_USERS_KEY = "uk_gateways_registered_users";
var SAVED_ACCOUNTS_KEY = "uk_gateways_saved_accounts";
var ACCOUNTS_WIPED_V3_KEY = "uk_gateways_accounts_wiped_v3";
if (typeof window !== "undefined") {
  try {
    if (localStorage.getItem(ACCOUNTS_WIPED_V3_KEY) !== "true") {
      localStorage.removeItem(REGISTERED_USERS_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(SAVED_ACCOUNTS_KEY);
      sessionStorage.removeItem("uk_gateways_pending_otp");
      localStorage.setItem(ACCOUNTS_WIPED_V3_KEY, "true");
    }
  } catch {
  }
}
var AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = (0, import_react.useState)(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) {
        const u = JSON.parse(saved);
        u.isOwner = isAppOwner(u);
        return u;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [savedAccounts, setSavedAccounts] = (0, import_react.useState)(() => {
    try {
      const saved = localStorage.getItem(SAVED_ACCOUNTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSavePromptOpen, setIsSavePromptOpen] = (0, import_react.useState)(false);
  const [pendingSaveAccount, setPendingSaveAccount] = (0, import_react.useState)(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = (0, import_react.useState)(false);
  const [authModalMode, setAuthModalMode] = (0, import_react.useState)("login");
  const [authActionReason, setAuthActionReason] = (0, import_react.useState)(null);
  const [pendingSuccessCallback, setPendingSuccessCallback] = (0, import_react.useState)(null);
  const [lastDeliveredMessage, setLastDeliveredMessage] = (0, import_react.useState)(() => {
    try {
      const saved = sessionStorage.getItem("uk_gateways_last_delivered_otp");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  (0, import_react.useEffect)(() => {
    try {
      localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(savedAccounts));
    } catch {
    }
  }, [savedAccounts]);
  const openAuthModal = (0, import_react.useCallback)((mode = "login", reason, onSuccess) => {
    setAuthModalMode(mode);
    setAuthActionReason(reason || null);
    if (onSuccess) {
      setPendingSuccessCallback(() => onSuccess);
    } else {
      setPendingSuccessCallback(null);
    }
    setIsAuthModalOpen(true);
  }, []);
  const closeAuthModal = (0, import_react.useCallback)(() => {
    setIsAuthModalOpen(false);
    setAuthActionReason(null);
    setPendingSuccessCallback(null);
  }, []);
  const getRegisteredUsers = () => {
    try {
      const data = localStorage.getItem(REGISTERED_USERS_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      const sanitized = [];
      const seenUsernames = /* @__PURE__ */ new Set();
      const seenContacts = /* @__PURE__ */ new Set();
      let ownerEncountered = false;
      for (const u of parsed) {
        if (!u || !u.username || !u.contact) continue;
        const normU = u.username.trim().toLowerCase();
        const normC = u.contact.trim().toLowerCase();
        const isOwnerAcc = normU === "amit tyagi" || normC === "amit1986.delhi@gmail.com";
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
          isOwner: isOwnerAcc || isAppOwner(u)
        });
      }
      return sanitized;
    } catch {
      return [];
    }
  };
  const handlePostLoginSaveCheck = (user, passwordHash) => {
    const exists = savedAccounts.some((a) => a.id === user.id || a.contact.toLowerCase() === user.contact.toLowerCase());
    if (!exists) {
      setPendingSaveAccount(user);
      setIsSavePromptOpen(true);
    } else {
      setSavedAccounts(
        (prev) => prev.map(
          (a) => a.id === user.id || a.contact.toLowerCase() === user.contact.toLowerCase() ? { ...a, lastLoginAt: Date.now(), username: user.username, avatar: user.avatar } : a
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
    const newSaved = {
      id: userToSave.id,
      username: userToSave.username,
      contact: userToSave.contact,
      contactType: userToSave.contactType,
      avatar: userToSave.avatar,
      lastLoginAt: Date.now(),
      isOwner: isAppOwner(userToSave)
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
  const switchAccount = (accountId) => {
    const found = savedAccounts.find((a) => a.id === accountId);
    if (found) {
      const safeUser = {
        id: found.id,
        username: found.username,
        contact: found.contact,
        contactType: found.contactType,
        avatar: found.avatar,
        isVerified: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        isOwner: isAppOwner(found)
      };
      setCurrentUser(safeUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
      setSavedAccounts(
        (prev) => prev.map((a) => a.id === accountId ? { ...a, lastLoginAt: Date.now() } : a)
      );
      return;
    }
    const allUsers = getRegisteredUsers();
    const regUser = allUsers.find((u) => u.id === accountId);
    if (regUser) {
      const safeUser = {
        id: regUser.id,
        username: regUser.username,
        contact: regUser.contact,
        contactType: regUser.contactType,
        avatar: regUser.avatar,
        isVerified: true,
        createdAt: regUser.createdAt,
        isOwner: isAppOwner(regUser)
      };
      setCurrentUser(safeUser);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    }
  };
  const removeSavedAccount = (accountId) => {
    setSavedAccounts((prev) => prev.filter((a) => a.id !== accountId));
    if (currentUser?.id === accountId) {
      logout();
    }
  };
  const login = (contact, password) => {
    const trimmedContact = contact.trim().toLowerCase();
    const trimmedPass = password.trim();
    if (!trimmedContact) {
      return { success: false, error: "Please enter your email or phone number." };
    }
    if (!trimmedPass) {
      return { success: false, error: "Please enter your password." };
    }
    const cleanDigits = trimmedContact.replace(/\D/g, "");
    const users = getRegisteredUsers();
    const found = users.find((u) => {
      const uContact = u.contact.toLowerCase();
      const uDigits = uContact.replace(/\D/g, "");
      if (uContact === trimmedContact) return true;
      if (u.username.toLowerCase() === trimmedContact) return true;
      if (cleanDigits.length >= 10 && uDigits.length >= 10) {
        if (cleanDigits.endsWith(uDigits.slice(-10)) || uDigits.endsWith(cleanDigits.slice(-10))) {
          return true;
        }
      }
      return false;
    });
    if (!found) {
      return {
        success: false,
        error: "No account found with this email or phone number. Please register first."
      };
    }
    if (found.passwordHash !== trimmedPass) {
      return {
        success: false,
        error: "Incorrect password. Please verify and try again."
      };
    }
    const safeUser = {
      id: found.id,
      username: found.username,
      contact: found.contact,
      contactType: found.contactType,
      avatar: found.avatar,
      createdAt: found.createdAt,
      usernameChangeTimestamps: found.usernameChangeTimestamps || [],
      isOwner: isAppOwner(found)
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
  const register = (username, contact, password) => {
    const trimmedUsername = username.trim();
    const normUsername = trimmedUsername.toLowerCase();
    const trimmedContact = contact.trim().toLowerCase();
    const trimmedPass = password.trim();
    if (!trimmedUsername || trimmedUsername.length < 2) {
      return { success: false, error: "Please enter a valid username (at least 2 characters)." };
    }
    if (!trimmedContact || trimmedContact.length < 5) {
      return { success: false, error: "Please enter a valid email address." };
    }
    if (!trimmedPass || trimmedPass.length < 4) {
      return { success: false, error: "Password must be at least 4 characters long." };
    }
    const isEmail = trimmedContact.includes("@");
    const contactType = isEmail ? "email" : "phone";
    const users = getRegisteredUsers();
    const emailExists = users.some((u) => u.contact.trim().toLowerCase() === trimmedContact);
    if (emailExists) {
      return { success: false, error: "An account with this email address already exists. Please log in instead." };
    }
    const usernameExists = users.some((u) => u.username.trim().toLowerCase() === normUsername);
    if (usernameExists) {
      return { success: false, error: `Username "${trimmedUsername}" is already taken (usernames are case-insensitive). Please choose another username.` };
    }
    const isClaimingOwner = normUsername === "amit tyagi" || trimmedContact === "amit1986.delhi@gmail.com";
    if (isClaimingOwner) {
      const ownerExists = users.some(
        (u) => u.username.trim().toLowerCase() === "amit tyagi" || u.contact.trim().toLowerCase() === "amit1986.delhi@gmail.com"
      );
      if (ownerExists) {
        return { success: false, error: "Only one platform owner account is permitted. Please log in." };
      }
    }
    const newUser = {
      id: `user-${Date.now()}`,
      username: trimmedUsername,
      contact: trimmedContact,
      contactType,
      isVerified: true,
      passwordHash: trimmedPass,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      usernameChangeTimestamps: [],
      isOwner: isAppOwner({ username: trimmedUsername })
    };
    users.push(newUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    const safeUser = {
      id: newUser.id,
      username: newUser.username,
      contact: newUser.contact,
      contactType: newUser.contactType,
      isVerified: true,
      createdAt: newUser.createdAt,
      usernameChangeTimestamps: [],
      isOwner: isAppOwner(newUser)
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
  const sendRegistrationOtp = async (contact, username) => {
    const trimmedContact = contact.trim().toLowerCase();
    const trimmedUsername = username.trim();
    const normUsername = trimmedUsername.toLowerCase();
    if (!trimmedUsername || trimmedUsername.length < 2) {
      return { success: false, error: "Please enter a valid username (at least 2 characters)." };
    }
    if (!trimmedContact || trimmedContact.length < 5) {
      return { success: false, error: "Please enter a valid email address or phone number." };
    }
    const isEmail = trimmedContact.includes("@");
    const cleanPhoneDigits = trimmedContact.replace(/\D/g, "");
    if (!isEmail && cleanPhoneDigits.length < 10) {
      return { success: false, error: "Please enter a valid 10-digit phone number or email address." };
    }
    const users = getRegisteredUsers();
    const contactExists = users.some((u) => {
      if (u.contact.trim().toLowerCase() === trimmedContact) return true;
      if (!isEmail && cleanPhoneDigits.length >= 10) {
        const uDigits = u.contact.replace(/\D/g, "");
        if (uDigits.length >= 10 && (cleanPhoneDigits.endsWith(uDigits.slice(-10)) || uDigits.endsWith(cleanPhoneDigits.slice(-10)))) {
          return true;
        }
      }
      return false;
    });
    if (contactExists) {
      return {
        success: false,
        error: "An account with this email address or phone number already exists. Please log in instead."
      };
    }
    const usernameExists = users.some((u) => u.username.trim().toLowerCase() === normUsername);
    if (usernameExists) {
      return {
        success: false,
        error: `Username "${trimmedUsername}" is already taken (usernames are case-insensitive). Please choose a different username.`
      };
    }
    const isClaimingOwner = normUsername === "amit tyagi" || trimmedContact === "amit1986.delhi@gmail.com";
    if (isClaimingOwner) {
      const ownerExists = users.some(
        (u) => u.username.trim().toLowerCase() === "amit tyagi" || u.contact.trim().toLowerCase() === "amit1986.delhi@gmail.com"
      );
      if (ownerExists) {
        return {
          success: false,
          error: "The official platform owner account (Amit Tyagi) already exists. Only 1 owner account is permitted. Please log in."
        };
      }
    }
    const contactType = isEmail ? "email" : "phone";
    const otpCode = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = Date.now() + 10 * 60 * 1e3;
    const otpData = {
      contact: trimmedContact,
      code: otpCode,
      expiresAt
    };
    const waLink = !isEmail ? `https://api.whatsapp.com/send?phone=91${cleanPhoneDigits.slice(-10)}&text=${encodeURIComponent(`Namaste ${trimmedUsername}! Your Uttarakhand Gateways verification code is: ${otpCode}. Valid for 10 minutes.`)}` : null;
    const notificationPayload = {
      contact: trimmedContact,
      code: otpCode,
      channel: contactType,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      emailPreviewUrl: waLink
    };
    try {
      sessionStorage.setItem("uk_gateways_pending_otp", JSON.stringify(otpData));
      sessionStorage.setItem("uk_gateways_last_delivered_otp", JSON.stringify(notificationPayload));
    } catch {
    }
    if (!isEmail) {
      setLastDeliveredMessage(notificationPayload);
      return {
        success: true,
        contactType: "phone"
      };
    }
    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: trimmedContact,
          username: trimmedUsername,
          code: otpCode
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        return {
          success: false,
          error: data?.error || "Failed to send verification email."
        };
      }
      setLastDeliveredMessage(notificationPayload);
      return {
        success: true,
        contactType
      };
    } catch (error) {
      console.error("[UKG OTP] Email request failed:", error);
      return {
        success: false,
        error: "Could not connect to the email server. Please try again."
      };
    }
  };
  const verifyRegistrationOtp = (code, contact, username, password) => {
    const trimmedCode = code.trim();
    const trimmedContact = contact.trim();
    const trimmedUsername = username.trim();
    const trimmedPass = password.trim();
    if (!trimmedCode) {
      return { success: false, error: "Please enter the 6-digit verification code." };
    }
    let activeOtp = null;
    try {
      const saved = sessionStorage.getItem("uk_gateways_pending_otp");
      if (saved) activeOtp = JSON.parse(saved);
    } catch {
    }
    if (!activeOtp || activeOtp.contact.toLowerCase() !== trimmedContact.toLowerCase()) {
      return { success: false, error: "No active OTP found for this contact. Please request a new OTP." };
    }
    if (Date.now() > activeOtp.expiresAt) {
      return { success: false, error: "The verification code has expired. Please request a new OTP." };
    }
    if (activeOtp.code !== trimmedCode) {
      return { success: false, error: "Incorrect verification code. Please check and try again." };
    }
    const isEmail = trimmedContact.includes("@");
    const contactType = isEmail ? "email" : "phone";
    const users = getRegisteredUsers();
    const normUsername = trimmedUsername.toLowerCase();
    const emailExists = users.some((u) => u.contact.trim().toLowerCase() === trimmedContact);
    if (emailExists) {
      return { success: false, error: "An account with this email address already exists. Please log in instead." };
    }
    const usernameExists = users.some((u) => u.username.trim().toLowerCase() === normUsername);
    if (usernameExists) {
      return { success: false, error: `Username "${trimmedUsername}" is already taken. Please choose another username.` };
    }
    const isClaimingOwner = normUsername === "amit tyagi" || trimmedContact === "amit1986.delhi@gmail.com";
    if (isClaimingOwner) {
      const ownerExists = users.some(
        (u) => u.username.trim().toLowerCase() === "amit tyagi" || u.contact.trim().toLowerCase() === "amit1986.delhi@gmail.com"
      );
      if (ownerExists) {
        return { success: false, error: "Only one platform owner account is permitted. Please log in." };
      }
    }
    const newUser = {
      id: `user-${Date.now()}`,
      username: trimmedUsername,
      contact: trimmedContact,
      contactType,
      isVerified: true,
      passwordHash: trimmedPass || "ukg1234",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      usernameChangeTimestamps: [],
      isOwner: isAppOwner({ username: trimmedUsername })
    };
    users.push(newUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    const safeUser = {
      id: newUser.id,
      username: newUser.username,
      contact: newUser.contact,
      contactType: newUser.contactType,
      isVerified: true,
      createdAt: newUser.createdAt,
      usernameChangeTimestamps: [],
      isOwner: isAppOwner(newUser)
    };
    setCurrentUser(safeUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safeUser));
    try {
      sessionStorage.removeItem("uk_gateways_pending_otp");
    } catch {
    }
    setIsAuthModalOpen(false);
    handlePostLoginSaveCheck(safeUser, trimmedPass);
    if (pendingSuccessCallback) {
      const cb = pendingSuccessCallback;
      setPendingSuccessCallback(null);
      setTimeout(() => cb(), 100);
    }
    return { success: true };
  };
  const deleteAccount = (0, import_react.useCallback)((targetContact) => {
    const contactToDelete = (targetContact || currentUser?.contact || currentUser?.username || "").trim().toLowerCase();
    if (!contactToDelete) {
      localStorage.removeItem(REGISTERED_USERS_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(SAVED_ACCOUNTS_KEY);
      setSavedAccounts([]);
      try {
        sessionStorage.removeItem("uk_gateways_pending_otp");
      } catch {
      }
      setCurrentUser(null);
      return { success: true, message: "All accounts cleared." };
    }
    const users = getRegisteredUsers();
    const targetUser = users.find((u) => u.contact.toLowerCase() === contactToDelete || u.username.toLowerCase() === contactToDelete || u.id === contactToDelete);
    if (targetUser) {
      deletePropertiesForAccount({ id: targetUser.id, username: targetUser.username, contact: targetUser.contact });
    } else if (currentUser) {
      deletePropertiesForAccount({ id: currentUser.id, username: currentUser.username, contact: currentUser.contact });
    }
    const remaining = users.filter(
      (u) => u.contact.toLowerCase() !== contactToDelete && u.username.toLowerCase() !== contactToDelete && u.id !== contactToDelete
    );
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(remaining));
    setSavedAccounts((prev) => prev.filter((a) => a.contact.toLowerCase() !== contactToDelete && a.username.toLowerCase() !== contactToDelete && a.id !== contactToDelete));
    if (currentUser && (currentUser.contact.toLowerCase() === contactToDelete || currentUser.username.toLowerCase() === contactToDelete || currentUser.id === contactToDelete)) {
      setCurrentUser(null);
      localStorage.removeItem(AUTH_USER_KEY);
    }
    try {
      sessionStorage.removeItem("uk_gateways_pending_otp");
    } catch {
    }
    return { success: true, message: `Account (${contactToDelete}) and all its listed properties deleted.` };
  }, [currentUser]);
  const clearAllAccounts = (0, import_react.useCallback)(() => {
    localStorage.removeItem(REGISTERED_USERS_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(SAVED_ACCOUNTS_KEY);
    setSavedAccounts([]);
    try {
      sessionStorage.removeItem("uk_gateways_pending_otp");
    } catch {
    }
    setCurrentUser(null);
    return { success: true, message: "All stored accounts deleted from this browser." };
  }, []);
  const updateProfile = (0, import_react.useCallback)((updates) => {
    if (!currentUser) {
      return { success: false, error: "No user is currently logged in" };
    }
    const newUsername = updates.username !== void 0 ? updates.username.trim() : currentUser.username;
    if (!newUsername || newUsername.length < 2) {
      return { success: false, error: "Username must be at least 2 characters long." };
    }
    let updatedTimestamps = currentUser.usernameChangeTimestamps || [];
    if (newUsername.toLowerCase() !== currentUser.username.toLowerCase()) {
      const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1e3;
      const now = Date.now();
      const recentChanges = updatedTimestamps.filter((ts) => now - ts < ONE_WEEK_MS);
      if (recentChanges.length >= 2) {
        const oldest = Math.min(...recentChanges);
        const daysLeft = Math.ceil((oldest + ONE_WEEK_MS - now) / (24 * 60 * 60 * 1e3));
        return {
          success: false,
          error: `Username changes are limited to 2 per week. Next change available in ${daysLeft} day${daysLeft > 1 ? "s" : ""}.`
        };
      }
      updatedTimestamps = [...recentChanges, now];
    }
    const updatedUser = {
      ...currentUser,
      username: newUsername,
      avatar: updates.avatar !== void 0 ? updates.avatar : currentUser.avatar,
      usernameChangeTimestamps: updatedTimestamps,
      isOwner: isAppOwner({ username: newUsername })
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
            usernameChangeTimestamps: updatedTimestamps
          };
        }
        return u;
      });
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedList));
      setSavedAccounts(
        (prev) => prev.map(
          (a) => a.id === currentUser.id || a.contact.toLowerCase() === currentUser.contact.toLowerCase() ? { ...a, username: newUsername, avatar: updatedUser.avatar, isOwner: updatedUser.isOwner } : a
        )
      );
    } catch {
    }
    return { success: true };
  }, [currentUser]);
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };
  const requireAuth = (0, import_react.useCallback)((action, reason) => {
    if (currentUser) {
      action();
      return true;
    }
    openAuthModal(
      "login",
      reason || "You must log in or register before performing this action.",
      () => {
        action();
      }
    );
    return false;
  }, [currentUser, openAuthModal]);
  const getAllRegisteredUsers = (0, import_react.useCallback)(() => {
    return getRegisteredUsers();
  }, []);
  const deleteUserByOwner = (0, import_react.useCallback)((userIdOrContact) => {
    if (!isAppOwner(currentUser)) {
      return { success: false, message: "Owner privileges required." };
    }
    return deleteAccount(userIdOrContact);
  }, [currentUser, deleteAccount]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
    AuthContext.Provider,
    {
      value: {
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
        deleteUserByOwner
      },
      children
    }
  );
};
var useAuth = () => {
  const context = (0, import_react.useContext)(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthProvider,
  useAuth
});
