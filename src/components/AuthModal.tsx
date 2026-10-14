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
  Loader2,
  ArrowLeft,
  Mountain,
  Compass,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from './Logo';

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
    requestPasswordReset,
    resetPassword,
    checkEmailRegistered,
    currentUser 
  } = useAuth();
  
  const { isHindi } = useLanguage();

  type ViewMode = 'login' | 'register' | 'forgot-password' | 'reset-password';
  const [mode, setMode] = useState<ViewMode>('login');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP flow fields
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devNotice, setDevNotice] = useState<string | null>(null);

  // Submission & Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  // Sync mode with context
  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
      setErrorMsg(null);
      setSuccessMsg(null);
      setOtpSent(false);
      setOtpCode('');
      setDevNotice(null);
      setDevResetToken(null);
    }
  }, [authModalMode]);

  // Reset fields on modal open
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsSubmitting(false);
      setOtpSent(false);
      setOtpCode('');
      setDevNotice(null);
      setDevResetToken(null);
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

  // Password validation checks
  const hasMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  // 1. Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg(isHindi ? 'कृपया एक मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    if (!trimmedPass) {
      setErrorMsg(isHindi ? 'कृपया अपना पासवर्ड दर्ज करें।' : 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(trimmedEmail, trimmedPass);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(res.error || (isHindi ? 'लॉगिन विफल। कृपया क्रेडेंशियल जांचें।' : 'Login failed. Please verify your credentials.'));
      } else {
        setSuccessMsg(isHindi ? 'सफलतापूर्वक लॉग इन किया गया!' : 'Successfully signed in!');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg(isHindi ? 'सर्वर से कनेक्ट करने में त्रुटि।' : 'Could not connect to authentication server.');
    }
  };

  // 2. Registration Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUsername || trimmedUsername.length < 2) {
      setErrorMsg(isHindi ? 'कृपया कम से कम 2 अक्षरों का नाम दर्ज करें।' : 'Please enter your name (at least 2 characters).');
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg(isHindi ? 'कृपया एक मान्य ईमेल पता दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    if (!trimmedPass || trimmedPass.length < 6) {
      setErrorMsg(isHindi ? 'पासवर्ड में कम से कम 6 अक्षर होने चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(trimmedUsername, trimmedEmail, trimmedPass);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(res.error || (isHindi ? 'पंजीकरण विफल।' : 'Registration failed. Please check details.'));
      } else {
        setSuccessMsg(isHindi ? 'खाता सफलतापूर्वक बनाया गया!' : 'Account created successfully!');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg(isHindi ? 'सर्वर से संपर्क नहीं हो सका।' : 'Unable to connect to registration server.');
    }
  };

  // 3. Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg(isHindi ? 'कृपया अपना ईमेल पता दर्ज करें।' : 'Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(trimmedEmail);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to process request.');
      } else {
        setSuccessMsg(res.message || (isHindi ? 'पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है।' : 'Password reset instructions have been sent to your email.'));
        if (res.devResetToken) {
          setDevResetToken(res.devResetToken);
        }
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg(isHindi ? 'सर्वर से कनेक्ट करने में त्रुटि।' : 'Could not connect to server.');
    }
  };

  // 4. Reset Password Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetToken.trim()) {
      setErrorMsg(isHindi ? 'कृपया रीसेट टोकन दर्ज करें।' : 'Please provide the password reset token.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg(isHindi ? 'नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'New password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(isHindi ? 'पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(resetToken.trim(), password);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(res.error || 'Password reset failed.');
      } else {
        setSuccessMsg(res.message || (isHindi ? 'पासवर्ड सफलतापूर्वक बदल गया! अब लॉग इन करें।' : 'Password updated successfully! Redirecting to login...'));
        setTimeout(() => {
          setMode('login');
          setPassword('');
          setConfirmPassword('');
          setResetToken('');
          setErrorMsg(null);
        }, 1500);
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg(isHindi ? 'सर्वर से कनेक्ट करने में त्रुटि।' : 'Could not connect to server.');
    }
  };

  // 5. Send OTP Handler (Alternative OTP flow)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg(isHindi ? 'कृपया एक मान्य ईमेल दर्ज करें।' : 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await sendOtp(trimmedEmail);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to send OTP.');
      } else {
        setOtpSent(true);
        setCountdown(30);
        if (res.devCode) setDevNotice(res.devCode);
        setSuccessMsg(isHindi ? `सत्यापन कोड ${trimmedEmail} पर भेजा गया` : `Verification code sent to ${trimmedEmail}`);
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Could not send verification code.');
    }
  };

  // 6. Verify OTP Handler
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedCode = otpCode.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedCode || trimmedCode.length < 6) {
      setErrorMsg(isHindi ? 'कृपया 6-अंकीय कोड दर्ज करें।' : 'Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    const res = verifyOtp(trimmedCode, trimmedEmail);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Invalid or expired code.');
    } else {
      setSuccessMsg(isHindi ? 'सत्यापित! आप लॉग इन हो चुके हैं।' : 'Verified! You are signed in.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={closeAuthModal}
    >
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#071c14] border border-emerald-200 dark:border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* DESKTOP LEFT PANEL: Himalayan Atmosphere & Value Prop */}
        {/* ======================================================== */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#062016] via-[#082a1d] to-[#04160f] text-white p-8 flex-col justify-between relative overflow-hidden">
          {/* Subtle Himalayan Landscape Backdrop */}
          <div 
            className="absolute inset-0 opacity-25 mix-blend-overlay bg-cover bg-center pointer-events-none"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80")'
            }}
          />

          {/* Ambient Lighting Orbs */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

          {/* Top Branding */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                <Mountain className="w-5 h-5" />
              </span>
              <span className="text-xs font-black tracking-wider uppercase text-emerald-300">
                Uttarakhand Gateways
              </span>
            </div>
            
            <h2 className="text-2xl font-serif-luxury font-black text-white leading-tight tracking-tight">
              {isHindi ? 'देवभूमि में अपना ठिकाना पाएं' : 'Find Your Home in the Himalayas'}
            </h2>
            <p className="text-xs text-emerald-100/80 mt-2 leading-relaxed">
              {isHindi 
                ? '0% ब्रोकरेज पर सीधे संपत्ति मालिकों और खरीदारों से जुड़ें। देहरादून, मसूरी, नैनीताल और ऋषिकेश में सत्यापित संपत्तियां।' 
                : 'Direct owner-to-buyer real estate with 0% brokerage. Verified cottages, scenic plots, and villas across Uttarakhand.'}
            </p>
          </div>

          {/* Value Propositions */}
          <div className="relative z-10 space-y-3.5 my-6">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-xs">
                <strong className="block text-white font-bold">
                  {isHindi ? '0% ब्रोकरेज कमीशन' : 'Zero Brokerage Commission'}
                </strong>
                <span className="text-emerald-100/70 text-[11px]">
                  {isHindi ? 'सीधे मालिक से बात करें और लाखों बचाएं।' : 'Connect directly with genuine sellers and buyers.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-xs">
                <strong className="block text-white font-bold">
                  {isHindi ? '100% सुरक्षित और सत्यापित' : '100% Verified Listings'}
                </strong>
                <span className="text-emerald-100/70 text-[11px]">
                  {isHindi ? 'सत्यापित ईमेल व सीधे संपर्क के साथ।' : 'RERA certified projects & verified mountain land.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-xs">
                <strong className="block text-white font-bold">
                  {isHindi ? 'पहाड़ी भूमि कैलकुलेटर' : 'Land Converter & Calculator'}
                </strong>
                <span className="text-emerald-100/70 text-[11px]">
                  {isHindi ? 'नाली, मुट्ठी, बीघा और गज में सटीक रूपांतरण।' : 'Instant conversion for Nali, Mutthi, Bigha, and Gaj.'}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Stat */}
          <div className="relative z-10 pt-4 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-200/80">
            <span> गढ़वाल व कुमाऊं </span>
            <span className="font-bold text-white">15,000+ Active Users</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: Focused Authentication Form */}
        {/* ======================================================== */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between relative bg-white dark:bg-[#071c14]">
          {/* Close Button */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer z-20"
            title={isHindi ? 'बंद करें' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            {/* Action Reason Banner (e.g. "Please sign in to save property") */}
            {authActionReason && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{authActionReason}</span>
              </div>
            )}

            {/* Header Titles */}
            <div className="mb-5">
              {mode === 'forgot-password' ? (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline mb-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'साइन इन पर वापस जाएं' : 'Back to Sign In'}</span>
                  </button>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isHindi ? 'पासवर्ड रीसेट करें' : 'Reset Your Password'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isHindi ? 'अपना पंजीकृत ईमेल दर्ज करें और हम आपको रीसेट निर्देश भेजेंगे।' : 'Enter your registered email address and we will send you password reset instructions.'}
                  </p>
                </div>
              ) : mode === 'reset-password' ? (
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isHindi ? 'नया पासवर्ड बनाएं' : 'Create New Password'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {isHindi ? 'कृपया अपना नया पासवर्ड दर्ज करें।' : 'Enter and confirm your new secure password.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      Uttarakhand Gateways
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {mode === 'login' 
                      ? (isHindi ? 'अपने खाते में साइन इन करें' : 'Sign In to Your Account') 
                      : (isHindi ? 'नया मुफ़्त खाता बनाएं' : 'Create Free Account')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {mode === 'login'
                      ? (isHindi ? 'उत्तराखंड की संपत्तियों को देखने, संपर्क करने व प्रबंधित करने हेतु लॉगिन करें।' : 'Access saved properties, chat with owners, and list properties.')
                      : (isHindi ? '0% ब्रोकरेज पर सीधे संपत्ति मालिकों से जुड़ें और विज्ञापन पोस्ट करें।' : 'Join the verified 0% brokerage direct real estate marketplace.')}
                  </p>

                  {/* Clean Tab Switcher: Sign In vs Create Account */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 mt-4 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                        setOtpSent(false);
                      }}
                      className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                        mode === 'login'
                          ? 'bg-white dark:bg-[#0c2a1e] text-emerald-900 dark:text-emerald-200 shadow-sm border border-emerald-200/80 dark:border-emerald-700/80'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {isHindi ? 'साइन इन' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                        setOtpSent(false);
                      }}
                      className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                        mode === 'register'
                          ? 'bg-white dark:bg-[#0c2a1e] text-emerald-900 dark:text-emerald-200 shadow-sm border border-emerald-200/80 dark:border-emerald-700/80'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {isHindi ? 'नया खाता बनाएं' : 'Create Account'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMsg}</span>
              </div>
            )}

            {/* Dev Reset Token / Direct Action */}
            {devResetToken && (
              <div className="mb-4 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-300 dark:border-teal-700 text-xs text-teal-900 dark:text-teal-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold">Test Reset Link Available</span>
                  <button
                    type="button"
                    onClick={() => {
                      setResetToken(devResetToken);
                      setMode('reset-password');
                    }}
                    className="font-bold text-teal-700 dark:text-teal-300 underline cursor-pointer"
                  >
                    Set Password Now →
                  </button>
                </div>
                <div className="font-mono text-[10px] bg-white/80 dark:bg-black/40 p-1.5 rounded truncate select-all">
                  Token: {devResetToken}
                </div>
              </div>
            )}

            {/* Dev OTP Notice */}
            {devNotice && (
              <div className="mb-4 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-300 dark:border-teal-700 flex items-center justify-between text-xs text-teal-900 dark:text-teal-200">
                <span>OTP: <strong className="font-mono text-base font-black ml-1">{devNotice}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtpCode(devNotice)}
                  className="font-bold underline cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 1: SIGN IN (PASSWORD PRIMARY) */}
            {/* ======================================================== */}
            {mode === 'login' && loginMethod === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHindi ? 'ईमेल पता *' : 'Email Address *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. amit@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {isHindi ? 'पासवर्ड *' : 'Password *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      {isHindi ? 'पासवर्ड भूल गए?' : 'Forgot password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>{isHindi ? 'मुझे इस डिवाइस पर याद रखें' : 'Remember me on this device'}</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isHindi ? 'साइन इन हो रहा है...' : 'Signing In...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isHindi ? 'साइन इन करें' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to OTP Login */}
                <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('otp');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold cursor-pointer hover:underline"
                  >
                    {isHindi ? 'या ईमेल पर 1-टाइम OTP से साइन इन करें' : 'Or sign in with 1-time email code'}
                  </button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: SIGN IN VIA EMAIL OTP */}
            {/* ======================================================== */}
            {mode === 'login' && loginMethod === 'otp' && (
              !otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
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
                        placeholder="e.g. amit@gmail.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {isHindi ? 'हम आपके ईमेल पर 6-अंकीय सत्यापन कोड भेजेंगे।' : 'We will send a 6-digit one-time passcode to this email.'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isHindi ? 'कोड भेजा जा रहा है...' : 'Sending Code...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isHindi ? 'लॉगिन कोड भेजें' : 'Send One-Time Code'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod('password');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      {isHindi ? '← पासवर्ड से साइन इन करें' : '← Sign In with Password instead'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="truncate font-semibold text-slate-700 dark:text-slate-200">{email}</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline shrink-0 ml-2 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? '6-अंकीय सत्यापन कोड दर्ज करें *' : 'Enter 6-Digit Passcode *'}
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
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-lg font-mono font-bold tracking-[0.4em] text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length < 6}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isHindi ? 'सत्यापित करें और साइन इन करें' : 'Verify & Sign In'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      disabled={countdown > 0 || isSubmitting}
                      onClick={() => handleSendOtp()}
                      className={`font-semibold cursor-pointer ${countdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-emerald-600 dark:text-emerald-400 hover:underline'}`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod('password');
                        setOtpSent(false);
                      }}
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 cursor-pointer"
                    >
                      Password sign in
                    </button>
                  </div>
                </form>
              )
            )}

            {/* ======================================================== */}
            {/* VIEW 3: REGISTRATION */}
            {/* ======================================================== */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHindi ? 'आपका पूरा नाम / यूज़रनेम *' : 'Full Name / Username *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. Amit Tyagi"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHindi ? 'ईमेल पता *' : 'Email Address *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. amit@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHindi ? 'पासवर्ड सेट करें *' : 'Create Password *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password requirements pills */}
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className={`inline-flex items-center gap-1 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                      <Check className={`w-3 h-3 ${hasMinLength ? 'opacity-100' : 'opacity-30'}`} />
                      6+ chars
                    </span>
                    <span className={`inline-flex items-center gap-1 ${hasLetter ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                      <Check className={`w-3 h-3 ${hasLetter ? 'opacity-100' : 'opacity-30'}`} />
                      Letters
                    </span>
                    <span className={`inline-flex items-center gap-1 ${hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                      <Check className={`w-3 h-3 ${hasNumber ? 'opacity-100' : 'opacity-30'}`} />
                      Numbers
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isHindi ? 'खाता बनाया जा रहा है...' : 'Creating Account...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isHindi ? 'खाता बनाएं' : 'Create Free Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-1">
                  By joining, you agree to Uttarakhand Gateways Terms of Service and Privacy Policy.
                </p>
              </form>
            )}

            {/* ======================================================== */}
            {/* VIEW 4: FORGOT PASSWORD */}
            {/* ======================================================== */}
            {mode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHindi ? 'पंजीकृत ईमेल पता *' : 'Registered Email Address *'}
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
                      placeholder="e.g. amit@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isHindi ? 'भेजा जा रहा है...' : 'Sending Instructions...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isHindi ? 'पासवर्ड रीसेट लिंक भेजें' : 'Send Reset Instructions'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* VIEW 5: RESET PASSWORD */}
            {/* ======================================================== */}
            {mode === 'reset-password' && (
              <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHindi ? 'रीसेट टोकन *' : 'Reset Token *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Paste your reset token"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHindi ? 'नया पासवर्ड *' : 'New Password *'}
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
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isHindi ? 'नए पासवर्ड की पुष्टि करें *' : 'Confirm New Password *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isHindi ? 'पासवर्ड अपडेट हो रहा है...' : 'Updating Password...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isHindi ? 'पासवर्ड अपडेट करें और साइन इन करें' : 'Update Password & Sign In'}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Bottom Secure Footnote */}
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>256-Bit Encrypted & Protected by bcrypt Security</span>
          </div>

        </div>
      </div>
    </div>
  );
};
