import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    authModalMode, 
    authActionReason, 
    closeAuthModal, 
    login, 
    register,
    sendOtp,
    verifyOtp,
    sendRegistrationOtp,
    currentUser 
  } = useAuth();
  
  const { isHindi } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devNotice, setDevNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notifications & errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode with context
  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
      setOtpSent(false);
      setOtpCode('');
      setDevNotice(null);
    }
  }, [authModalMode]);

  // Clear fields and errors on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsSubmitting(false);
      setOtpSent(false);
      setOtpCode('');
      setDevNotice(null);
    }
  }, [isAuthModalOpen]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isAuthModalOpen || currentUser) return null;

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg(isHindi ? 'कृपया एक मान्य ईमेल पता दर्ज करें (उदा: name@example.com)' : 'Please enter a valid email address (e.g. name@example.com)');
      return;
    }

    if (mode === 'register' && (!username.trim() || username.trim().length < 2)) {
      setErrorMsg(isHindi ? 'कृपया कम से कम 2 अक्षरों का नाम दर्ज करें।' : 'Please enter your name (at least 2 characters).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = mode === 'register'
        ? await sendRegistrationOtp(trimmedEmail, username.trim())
        : await sendOtp(trimmedEmail);

      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(res.error || (isHindi ? 'OTP भेजने में विफल।' : 'Failed to send verification code.'));
      } else {
        setOtpSent(true);
        setCountdown(30);
        if (res.devCode) {
          setDevNotice(res.devCode);
        }
        setSuccessMsg(isHindi 
          ? `सत्यापन कोड आपके ईमेल (${trimmedEmail}) पर भेज दिया गया है।` 
          : `Verification code sent to ${trimmedEmail}`);
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg(isHindi ? 'सर्वर से कनेक्ट करने में त्रुटि।' : 'Could not connect to server.');
    }
  };

  // Step 2: Verify OTP and complete login / register
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedCode = otpCode.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedCode || trimmedCode.length < 6) {
      setErrorMsg(isHindi ? 'कृपया 6-अंकीय सत्यापन कोड दर्ज करें।' : 'Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    const res = verifyOtp(trimmedCode, trimmedEmail, username.trim() || undefined);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || (isHindi ? 'गलत या समाप्त हो चुका कोड।' : 'Invalid or expired code. Please try again.'));
    } else {
      setSuccessMsg(isHindi ? 'ईमेल सफलतापूर्वक सत्यापित! आप लॉग इन हो चुके हैं।' : 'Email verified successfully! You are logged in.');
    }
  };

  // Password-based login fallback for existing users
  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg(isHindi ? 'कृपया अपना पंजीकृत ईमेल दर्ज करें।' : 'Please enter your registered email address.');
      return;
    }

    if (!trimmedPass) {
      setErrorMsg(isHindi ? 'कृपया अपना पासवर्ड दर्ज करें।' : 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const res = login(trimmedEmail, trimmedPass);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || (isHindi ? 'लॉगिन विफल।' : 'Login failed. Please check credentials.'));
    } else {
      setSuccessMsg(isHindi ? 'सफलतापूर्वक लॉग इन किया गया!' : 'Successfully logged in!');
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#071c14] border border-emerald-200 dark:border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden transition-all text-slate-800 dark:text-slate-100 modal-animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 text-white relative">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title={isHindi ? 'बंद करें' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-200" />
            </span>
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-100">
              Uttarakhand Gateways
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            {mode === 'login' ? (
              isHindi ? 'ईमेल द्वारा लॉग इन' : 'Sign In via Email'
            ) : (
              isHindi ? 'नया खाता बनाएं' : 'Create Free Account'
            )}
          </h2>

          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            {authActionReason || (isHindi 
              ? 'सीधे खरीदारों व मालिकों से संपर्क करने हेतु अपने ईमेल पर भेजे गए OTP से सुरक्षित लॉगिन करें।' 
              : 'Sign in securely with one-time verification code (OTP) sent directly to your email.')}
          </p>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1.5 mt-4 p-1 rounded-2xl bg-black/25 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setOtpSent(false);
                setErrorMsg(null);
                setSuccessMsg(null);
                setDevNotice(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login' 
                  ? 'bg-white text-emerald-950 shadow-md' 
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              {isHindi ? 'लॉग इन (Log In)' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setOtpSent(false);
                setErrorMsg(null);
                setSuccessMsg(null);
                setDevNotice(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'register' 
                  ? 'bg-white text-emerald-950 shadow-md' 
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              {isHindi ? 'पंजीकरण (Register)' : 'Register'}
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {devNotice && (
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-300 dark:border-teal-700 flex items-center justify-between text-xs text-teal-900 dark:text-teal-200">
              <span>{isHindi ? 'परीक्षण कोड:' : 'Your OTP Code:'} <strong className="text-base tracking-widest font-mono font-black text-emerald-700 dark:text-emerald-300 ml-1">{devNotice}</strong></span>
              <button
                type="button"
                onClick={() => setOtpCode(devNotice)}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
              >
                {isHindi ? 'स्वतः भरें' : 'Auto-fill'}
              </button>
            </div>
          )}

          {/* FLOW: EMAIL OTP LOGIN & REGISTER */}
          {loginMethod === 'otp' ? (
            !otpSent ? (
              /* STEP 1: ENTER EMAIL (AND NAME IF REGISTER) */
              <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isHindi ? 'आपका पूरा नाम *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={isHindi ? 'उदा: राहुल शर्मा' : 'e.g. Rahul Sharma'}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'ईमेल पता *' : 'Email Address *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {isHindi 
                      ? 'हम आपके ईमेल पर 6-अंकीय सत्यापन कोड भेजेंगे।' 
                      : 'We will send a 6-digit one-time verification code to this email.'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isHindi ? 'कोड भेजा जा रहा है...' : 'Sending Code...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isHindi ? 'ईमेल पर OTP भेजें' : 'Send OTP to Email'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {mode === 'login' && (
                  <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod('password');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium hover:underline cursor-pointer"
                    >
                      {isHindi ? 'या पासवर्ड से लॉगिन करें' : 'Or Sign In with Password'}
                    </button>
                  </div>
                )}
              </form>
            ) : (
              /* STEP 2: ENTER 6-DIGIT OTP */
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold truncate">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                      setErrorMsg(null);
                    }}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline shrink-0 text-xs ml-2 cursor-pointer"
                  >
                    {isHindi ? 'बदलें' : 'Change'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? '6-अंकीय सत्यापन कोड दर्ज करें *' : 'Enter 6-Digit OTP Code *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoFocus
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-lg font-mono font-bold tracking-[0.4em] text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otpCode.length < 6}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isHindi ? 'सत्यापित हो रहा है...' : 'Verifying...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isHindi ? 'सत्यापित करें और लॉग इन करें' : 'Verify OTP & Sign In'}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    disabled={countdown > 0 || isSubmitting}
                    onClick={() => handleSendOtp()}
                    className={`font-semibold cursor-pointer ${
                      countdown > 0 
                        ? 'text-slate-400 cursor-not-allowed' 
                        : 'text-emerald-600 dark:text-emerald-400 hover:underline'
                    }`}
                  >
                    {countdown > 0 
                      ? (isHindi ? `पुनः भेजें (${countdown}s)` : `Resend code in ${countdown}s`) 
                      : (isHindi ? 'OTP पुनः भेजें' : 'Resend OTP')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                    }}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                  >
                    {isHindi ? 'ईमेल बदलें' : 'Use different email'}
                  </button>
                </div>
              </form>
            )
          ) : (
            /* PASSWORD LOGIN ALTERNATIVE */
            <form onSubmit={handlePasswordLogin} className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'ईमेल पता *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'पासवर्ड (Password) *' : 'Password *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isHindi ? 'अपना पासवर्ड दर्ज करें' : 'Enter your password'}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? (isHindi ? 'लॉगिन हो रहा है...' : 'Logging in...') : (isHindi ? 'पासवर्ड से लॉग इन करें' : 'Log In with Password')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  {isHindi ? '← ईमेल OTP से लॉगिन करें' : '← Switch to Email OTP Sign In'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

