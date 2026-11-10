import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  KeyRound,
  RotateCcw,
  Loader2,
  ArrowLeft,
  Mountain,
  Compass,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from './Logo';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LoginPageProps {
  initialMode?: 'login' | 'register' | 'forgot-password' | 'reset-password';
  onBackToMarketplace?: () => void;
  onBackToMain?: () => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  initialMode,
  onBackToMarketplace, 
  onBackToMain,
  onLoginSuccess 
}) => {
  const handleBack = onBackToMain || onBackToMarketplace || (() => window.history.back());
  const { 
    currentUser, 
    login, 
    register, 
    sendOtp,
    verifyOtp,
    requestPasswordReset,
    resetPassword,
  } = useAuth();
  
  const { isHindi } = useLanguage();

  const getInitialState = (): { mode: 'login' | 'register' | 'forgot-password' | 'reset-password'; token?: string } => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token') || params.get('resetToken');
      const page = params.get('page');
      const modeParam = params.get('mode');

      if (urlToken || modeParam === 'reset-password' || page === 'reset-password') {
        return { mode: 'reset-password', token: urlToken || '' };
      }
      if (initialMode) return { mode: initialMode };
      if (modeParam === 'register' || page === 'register' || window.location.pathname.includes('/register')) {
        return { mode: 'register' };
      }
      if (modeParam === 'forgot-password' || page === 'forgot-password') {
        return { mode: 'forgot-password' };
      }
    } catch {}
    return { mode: 'login' };
  };

  const initialState = getInitialState();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password' | 'reset-password'>(initialState.mode);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  
  // Fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(initialState.token || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP flow fields
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devNotice, setDevNotice] = useState<string | null>(null);

  // Status & feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // If already logged in, redirect
  useEffect(() => {
    if (currentUser) {
      if (onLoginSuccess) onLoginSuccess();
      else handleBack();
    }
  }, [currentUser]);

  // Switch modes safely
  const handleSwitchMode = (newMode: 'login' | 'register' | 'forgot-password' | 'reset-password') => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setOtpSent(false);
    setOtpCode('');
    setDevNotice(null);
    setDevResetToken(null);
  };

  // Password Login
  const handlePasswordLoginSubmit = async (e: React.FormEvent) => {
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
        setErrorMsg(res.error || (isHindi ? 'लॉगिन विफल।' : 'Login failed. Please check your credentials.'));
      } else {
        setSuccessMsg(isHindi ? 'सफलतापूर्वक लॉग इन किया गया!' : 'Successfully signed in!');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
          else handleBack();
        }, 600);
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg(isHindi ? 'सर्वर से कनेक्ट करने में त्रुटि।' : 'Could not connect to authentication server.');
    }
  };

  // Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
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
      setErrorMsg(isHindi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register(trimmedUsername, trimmedEmail, trimmedPass);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(res.error || (isHindi ? 'पंजीकरण विफल।' : 'Registration failed.'));
      } else {
        setSuccessMsg(isHindi ? 'खाता सफलतापूर्वक बनाया गया!' : 'Account created successfully!');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
          else handleBack();
        }, 600);
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg(isHindi ? 'सर्वर से संपर्क नहीं हो सका।' : 'Unable to connect to server.');
    }
  };

  // Forgot Password
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg(isHindi ? 'कृपया अपना ईमेल पता दर्ज करें।' : 'Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(trimmedEmail);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to request reset instructions.');
      } else {
        setSuccessMsg(res.message || 'Password reset instructions have been sent to your email.');
        if (res.devResetToken) {
          setDevResetToken(res.devResetToken);
        }
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Could not connect to server.');
    }
  };

  // Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!resetToken.trim()) {
      setErrorMsg('Please enter your password reset token.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(resetToken.trim(), password);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to update password.');
      } else {
        setSuccessMsg(res.message || 'Password updated successfully! Redirecting to sign in...');
        setTimeout(() => {
          handleSwitchMode('login');
          setPassword('');
          setConfirmPassword('');
          setResetToken('');
        }, 1200);
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Could not connect to server.');
    }
  };

  // Send OTP (Alternative)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
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
        setSuccessMsg(`Verification code sent to ${trimmedEmail}`);
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Could not send verification code.');
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedCode = otpCode.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedCode || trimmedCode.length < 6) {
      setErrorMsg('Please enter the 6-digit code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOtp(trimmedCode, trimmedEmail);
      setIsSubmitting(false);

      if (!res.success) {
        setErrorMsg(res.error || 'Invalid or expired code.');
      } else {
        setSuccessMsg('Successfully signed in!');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
          else handleBack();
        }, 600);
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f7f4] dark:bg-[#061811] text-slate-800 dark:text-slate-100 flex flex-col justify-between relative overflow-x-hidden transition-colors">
      
      {/* Background Soft Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[140px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 border-b border-emerald-200/80 dark:border-emerald-900/60 bg-white/85 dark:bg-[#071f16]/90 backdrop-blur-md py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div onClick={handleBack} className="cursor-pointer">
            <Logo size="md" darkText={true} />
          </div>

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 px-3 py-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isHindi ? 'वापस जाएं' : 'Back to Website'}</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6 sm:my-10">
        <div className="w-full max-w-4xl bg-white dark:bg-[#071c14] border border-emerald-200 dark:border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all">
          
          {/* ======================================================== */}
          {/* DESKTOP LEFT PANEL: Himalayan Atmosphere */}
          {/* ======================================================== */}
          <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[#062016] via-[#082a1d] to-[#04160f] text-white p-8 flex-col justify-between relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-25 mix-blend-overlay bg-cover bg-center pointer-events-none"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80")'
              }}
            />

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
                {isHindi ? 'देवभूमि में आपका स्वागत है' : 'Welcome to Devbhoomi Uttarakhand'}
              </h2>
              <p className="text-xs text-emerald-100/80 mt-2 leading-relaxed">
                {isHindi 
                  ? '0% ब्रोकरेज पर सीधे खरीदारों और संपत्ति मालिकों से जुड़ें। 100% सत्यापित व सुरक्षित।' 
                  : 'Direct owner-to-buyer real estate with 0% brokerage. Verified listings across Dehradun, Mussoorie, Nainital, and Rishikesh.'}
              </p>
            </div>

            <div className="relative z-10 space-y-3.5 my-6">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="text-xs">
                  <strong className="block text-white font-bold">Zero Brokerage Platform</strong>
                  <span className="text-emerald-100/70 text-[11px]">Direct chat and transparent deals without middleman fees.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="text-xs">
                  <strong className="block text-white font-bold">Verified Ownership</strong>
                  <span className="text-emerald-100/70 text-[11px]">Clean title deeds, mountain views, and genuine contacts.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Compass className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="text-xs">
                  <strong className="block text-white font-bold">Mountain Land Units</strong>
                  <span className="text-emerald-100/70 text-[11px]">Convert Nali, Mutthi, Bigha, and Gaj with precision.</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-200/80">
              <span> गढ़वाल व कुमाऊं </span>
              <span className="font-bold text-white">15,000+ Active Users</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT PANEL: Auth Form */}
          {/* ======================================================== */}
          <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between relative bg-white dark:bg-[#071c14]">
            <div>
              {/* Header Titles */}
              <div className="mb-6">
                {mode === 'forgot-password' ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('login')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline mb-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'लॉग इन पर वापस जाएं' : 'Back to Sign In'}</span>
                    </button>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {isHindi ? 'पासवर्ड रीसेट करें' : 'Reset Your Password'}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isHindi ? 'अपना पंजीकृत ईमेल दर्ज करें और हम आपको रीसेट निर्देश भेजेंगे।' : 'Enter your registered email address and we will send you password reset instructions.'}
                    </p>
                  </div>
                ) : mode === 'reset-password' ? (
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {isHindi ? 'नया पासवर्ड बनाएं' : 'Create New Password'}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isHindi ? 'कृपया अपना नया पासवर्ड दर्ज करें।' : 'Enter and confirm your new secure password.'}
                    </p>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {mode === 'login' 
                        ? (isHindi ? 'साइन इन करें' : 'Sign In to Uttarakhand Gateways') 
                        : (isHindi ? 'नया मुफ़्त खाता बनाएं' : 'Create Your Free Account')}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {mode === 'login'
                        ? (isHindi ? 'उत्तराखंड की संपत्तियों को देखने व सीधे बात करने हेतु साइन इन करें।' : 'Access saved properties, chat with owners, and list properties.')
                        : (isHindi ? '0% ब्रोकरेज पर सीधे संपत्तियां लिस्ट करें और खरीदारों से जुड़ें।' : 'Join the 0% brokerage direct real estate marketplace.')}
                    </p>

                    {/* Mode Tabs */}
                    <div className="grid grid-cols-2 gap-1.5 p-1 mt-5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleSwitchMode('login')}
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
                        onClick={() => handleSwitchMode('register')}
                        className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                          mode === 'register'
                            ? 'bg-white dark:bg-[#0c2a1e] text-emerald-900 dark:text-emerald-200 shadow-sm border border-emerald-200/80 dark:border-emerald-700/80'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {isHindi ? 'नया खाता बनाएं' : 'Create Account'}
                      </button>
                    </div>

                    {/* Google Quick Sign-In */}
                    <div className="mt-3 mb-2">
                      <GoogleSignInButton
                        mode={mode === 'register' ? 'register' : 'login'}
                        isHindi={isHindi}
                        onSuccess={onLoginSuccess}
                        onError={(err) => setErrorMsg(err)}
                      />
                      <div className="relative my-3">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                          <span className="bg-white dark:bg-[#071c14] px-3 text-slate-400 font-bold">
                            {isHindi ? 'या ईमेल से जारी रखें' : 'Or with email'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Status Messages */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

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
                </div>
              )}

              {/* Dev OTP notice */}
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

              {/* SIGN IN: PASSWORD PRIMARY */}
              {mode === 'login' && loginMethod === 'password' && (
                <form onSubmit={handlePasswordLoginSubmit} className="space-y-4 animate-in fade-in">
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
                        onClick={() => handleSwitchMode('forgot-password')}
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
                      <span>Remember me on this device</span>
                    </label>
                  </div>

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

                  <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('otp')}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold cursor-pointer hover:underline"
                    >
                      {isHindi ? 'या ईमेल OTP से साइन इन करें' : 'Or sign in with 1-time email code'}
                    </button>
                  </div>
                </form>
              )}

              {/* SIGN IN: OTP ALTERNATIVE */}
              {mode === 'login' && loginMethod === 'otp' && (
                !otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Email Address *
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
                      <span>Send Passcode</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setLoginMethod('password')}
                        className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        ← Sign in with password instead
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
                        Enter 6-Digit Passcode *
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
                      <span>Verify & Sign In</span>
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

              {/* REGISTRATION */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isHindi ? 'आपका नाम / यूज़रनेम *' : 'Full Name / Username *'}
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
                      {isHindi ? 'पासवर्ड बनाएं *' : 'Create Password *'}
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
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Minimum 6 characters with letters and numbers.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>{isHindi ? 'खाता बनाएं' : 'Create Free Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-1">
                    By signing up, you agree to Uttarakhand Gateways Terms and Privacy Policy.
                  </p>
                </form>
              )}

              {/* FORGOT PASSWORD */}
              {mode === 'forgot-password' && (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Registered Email Address *
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
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* RESET PASSWORD */}
              {mode === 'reset-password' && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Reset Token *
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
                        placeholder="Paste reset token from email"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      New Password *
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
                      Confirm New Password *
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
                    <span>Update Password & Sign In</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}

            </div>

            {/* Bottom Secure Footnote */}
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>256-Bit Encrypted Session • Powered by bcrypt Security</span>
            </div>

          </div>

        </div>
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400 dark:text-slate-600">
        © {new Date().getFullYear()} Uttarakhand Gateways. 0% Brokerage Direct Real Estate.
      </footer>
    </div>
  );
};
