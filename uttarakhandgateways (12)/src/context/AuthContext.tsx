  const verifyRegistrationOtp = (code: string, contact: string, username: string, password?: string) => {
    const trimmedCode = code.trim();
    const trimmedContact = contact.trim().toLowerCase();
    const trimmedUsername = username.trim() || trimmedContact.split('@')[0];

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
    const existing = users.find((u) => u.contact.trim().toLowerCase() === trimmedContact);

    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists. Please log in instead.',
      };
    }

    // Create and register new verified user
    const newUser: StoredUserAccount = {
      id: `user-${Date.now()}`,
      username: trimmedUsername,
      contact: trimmedContact,
      contactType: 'email',
      isVerified: true,
      passwordHash: password?.trim() || 'ukg_email_verified',
      createdAt: new Date().toISOString(),
      usernameChangeTimestamps: [],
      isOwner: isAppOwner({ username: trimmedUsername, contact: trimmedContact } as any),
    };

    users.push(newUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

    // Sync newly registered user to backend server disk
    fetch('/api/register-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: newUser.username,
        contact: newUser.contact,
        password: newUser.passwordHash,
      }),
    }).catch(() => {});

    const safeUser: User = {
      id: newUser.id,
      username: newUser.username,
      contact: newUser.contact,
      contactType: 'email',
      avatar: newUser.avatar,
      isVerified: true,
      createdAt: newUser.createdAt,
      usernameChangeTimestamps: [],
      isOwner: newUser.isOwner,
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
