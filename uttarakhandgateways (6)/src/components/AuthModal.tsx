import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ArrowLeft,
  Trash2,
  MailOpen,
  ExternalLink,
  Shield
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
    sendRegistrationOtp,
    verifyRegistrationOtp,
    lastDeliveredMessage,
    deleteAccount,
    clearAllAccounts,
    currentUser 
  } = useAuth();
  
  const { isHindi } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registerStep, setRegisterStep] = useState<'form' | 'otp'>('form');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [showIncomingMessage, setShowIncomingMessage] = useState(false);

  // OTP fields
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  // Registration Captcha verification state
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const captchaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate stylized anti-bot visual CAPTCHA
  const generateCaptcha = useCallback(() => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');

    // Draw on canvas
    setTimeout(() => {
      const canvas = captchaCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Reset
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#062c21');
      gradient.addColorStop(1, '#093c2d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Random noise lines
      for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.15 + Math.random() * 0.25})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }

      // Random noise dots
      for (let i = 0; i < 35; i++) {
        ctx.fillStyle = `rgba(110, 231, 183, ${0.25 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw stylized rotated letters
      ctx.font = 'bold 22px "Plus Jakarta Sans", monospace';
      ctx.textBaseline = 'middle';
      const colors = ['#34d399', '#6ee7b7', '#a7f3d0', '#5eead4', '#99f6e4'];

      for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const x = 16 + i * 21;
        const y = canvas.height / 2;
        const angle = (Math.random() - 0.5) * 0.35;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }
    }, 50);
  }, []);

  // Notifications & errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync mode with context
  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
      setRegisterStep('form');
      if (authModalMode === 'register') {
        generateCaptcha();
      }
    }
  }, [authModalMode, generateCaptcha]);

  // Clear fields and errors on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setRegisterStep('form');
      setOtpDigits(['', '', '', '', '', '']);
      generateCaptcha();
    }
  }, [isAuthModalOpen, generateCaptcha]);

  // Resend countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (registerStep === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [registerStep, resendTimer]);

  if (!isAuthModalOpen || currentUser) return null;

  // Handle Send OTP for Registration
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Verify Captcha Challenge
    if (!captchaInput.trim()) {
      setErrorMsg(isHindi ? 'कृपया नीचे दिया गया सुरक्षा कैप्चा कोड दर्ज करें।' : 'Please enter the security captcha code shown.');
      return;
    }

    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMsg(isHindi ? 'अमान्य कैप्चा कोड। कृपया चित्र में प्रदर्शित कोड पुनः दर्ज करें।' : 'Incorrect Captcha. Please enter the characters shown in the image.');
      generateCaptcha();
      return;
    }

    setIsSendingOtp(true);

    const res = await sendRegistrationOtp(contact, username);
    setIsSendingOtp(false);

    if (!res.success) {
      setErrorMsg(res.error || (isHindi ? 'ओटीपी भेजने में विफल।' : 'Failed to send verification OTP.'));
      generateCaptcha();
      return;
    }

    if (res.success) {
      setRegisterStep('otp');
      setResendTimer(30);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMsg(
        isHindi 
          ? `सत्यापन कोड ${contact} पर भेज दिया गया है।` 
          : `A 6-digit verification code has been sent to ${contact}.`
      );
      
      // Auto focus first OTP input box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  };

  // Handle Verify OTP & Complete Registration
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const enteredOtp = otpDigits.join('').trim();
    if (enteredOtp.length < 6) {
      setErrorMsg(isHindi ? 'कृपया पूरा 6-अंकीय ओटीपी दर्ज करें।' : 'Please enter the complete 6-digit OTP code.');
      return;
    }

    const res = await verifyRegistrationOtp(enteredOtp, contact, username, password);
    if (!res.success) {
      setErrorMsg(res.error || (isHindi ? 'गलत या अमान्य ओटीपी कोड।' : 'Invalid or expired verification code.'));
    } else {
      setSuccessMsg(isHindi ? 'ओटीपी सत्यापित! खाता सफलतापूर्वक बनाया गया।' : 'OTP Verified! Account created successfully.');
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setErrorMsg(null);
    const res = await sendRegistrationOtp(contact, username);
    if (res.success) {
      setResendTimer(30);
      setSuccessMsg(
        isHindi 
          ? `नया सत्यापन कोड ${contact} पर भेज दिया गया है।` 
          : `New verification code sent to ${contact}.`
      );
    } else {
      setErrorMsg(res.error || 'Failed to resend OTP.');
    }
  };

  // Handle digit inputs
  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of whole OTP
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const cleanChar = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    // Auto move to next input box
    if (cleanChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Standard Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = login(contact, password);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to sign in.');
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
              isHindi ? 'लॉग इन' : 'Login'
            ) : registerStep === 'otp' ? (
              <>
                <KeyRound className="w-6 h-6 text-emerald-200" />
                <span>{isHindi ? 'ओटीपी सत्यापन' : 'Verify OTP'}</span>
              </>
            ) : (
              isHindi ? 'पंजीकरण' : 'Register'
            )}
          </h2>

          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            {mode === 'login'
              ? (authActionReason || (isHindi 
                  ? 'उत्तराखंड की सत्यापित संपत्तियों को देखने या संपर्क करने हेतु लॉग इन आवश्यक है।' 
                  : 'Sign in to contact property owners, post listings with 0% brokerage, and save properties.'))
              : registerStep === 'otp'
              ? (isHindi 
                  ? `आपके ${contact.includes('@') ? 'ईमेल' : 'मोबाइल नंबर'} (${contact}) पर 6-अंकीय सत्यापन कोड भेजा गया है।` 
                  : `Enter the 6-digit verification code sent to ${contact}.`)
              : (isHindi 
                  ? 'संपत्ति लिस्टिंग और सुरक्षित बातचीत हेतु वास्तविक ईमेल या मोबाइल नंबर से पंजीकरण करें।' 
                  : 'Register with your verified email or mobile number to post listings and message owners directly.')
            }
          </p>
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

          {/* VIEW 1: LOGIN MODE */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'ईमेल या मोबाइल नंबर (Email / Phone) *' : 'Email or Phone Number *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={isHindi ? 'ईमेल या 10-अंकीय फ़ोन नंबर' : 'Email or 10-digit mobile number'}
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
                    placeholder="••••••••"
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
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isHindi ? 'लॉग इन करें' : 'Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 text-xs text-slate-600 dark:text-slate-400">
                <p>
                  {isHindi ? 'क्या आपका कोई खाता नहीं है?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setRegisterStep('form');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer ml-1"
                  >
                    {isHindi ? 'पंजीकरण करें (Register)' : 'Register'}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VIEW 2: REGISTER STEP 1 (FORM INPUTS) */}
          {mode === 'register' && registerStep === 'form' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'उपयोगकर्ता नाम (Username) *' : 'Username *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder={isHindi ? 'उपयोगकर्ता नाम दर्ज करें' : 'Enter username (e.g. rohit_uk)'}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'ईमेल या मोबाइल नंबर (Email / Phone) *' : 'Email or Phone Number *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder={isHindi ? 'ईमेल या 10-अंकीय फ़ोन नंबर' : 'Email or 10-digit mobile number'}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {isHindi ? '🔒 इस नंबर/ईमेल पर सत्यापन कोड भेजा जाएगा' : '🔒 Verification code will be sent to this address'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'पासवर्ड बनाएं (Create Password) *' : 'Create Password *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder={isHindi ? 'न्यूनतम 4 अक्षर' : 'At least 4 characters'}
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

              {/* CAPTCHA ANTI-BOT VERIFICATION */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-[#06241a] border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-emerald-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'सुरक्षा कैप्चा कोड (Captcha) *' : 'Security Captcha *'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    title={isHindi ? 'नया कोड लोड करें' : 'Reload new code'}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isHindi ? 'बदलें' : 'Refresh'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Canvas Visual Display */}
                  <div className="relative rounded-xl overflow-hidden border border-emerald-400/40 shadow-xs shrink-0 bg-[#062c21]">
                    <canvas
                      ref={captchaCanvasRef}
                      width={130}
                      height={42}
                      className="block select-none pointer-events-none"
                    />
                  </div>

                  {/* User Input */}
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={captchaInput}
                    onChange={(e) => {
                      setCaptchaInput(e.target.value.toUpperCase());
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder={isHindi ? 'कोड दर्ज करें' : 'Enter code'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-bold tracking-widest text-slate-900 dark:text-white uppercase placeholder:font-sans placeholder:normal-case placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75"
              >
                <span>
                  {isSendingOtp 
                    ? (isHindi ? 'ओटीपी भेजा जा रहा है...' : 'Sending Code...') 
                    : (isHindi ? 'ओटीपी प्राप्त करें (Send OTP)' : 'Send Verification OTP')
                  }
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-center text-slate-500 dark:text-slate-400 px-2 leading-tight">
                <span>
                  {isHindi ? 'पंजीकरण करके, आप हमारे ' : 'By registering, you agree to our '}
                </span>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('uk_gateways_open_legal', { detail: 'terms' }))}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  {isHindi ? 'उपयोग की शर्तें' : 'Terms of Use'}
                </button>
                <span>, </span>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('uk_gateways_open_legal', { detail: 'privacy' }))}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  {isHindi ? 'गोपनीयता नीति' : 'Privacy Policy'}
                </button>
                <span> {isHindi ? 'व ' : '& '}</span>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('uk_gateways_open_legal', { detail: 'cookie' }))}
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  {isHindi ? 'कुकी नीति' : 'Cookie Policy'}
                </button>
                <span> {isHindi ? 'से सहमत हैं।' : '.'}</span>
              </div>

              <div className="text-center pt-1 text-xs text-slate-600 dark:text-slate-400">
                <p>
                  {isHindi ? 'क्या पहले से खाता है?' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer ml-1"
                  >
                    {isHindi ? 'लॉग इन करें (Login)' : 'Login'}
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VIEW 3: REGISTER STEP 2 (OTP VERIFICATION) */}
          {mode === 'register' && registerStep === 'otp' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Target info with Edit option */}
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="text-xs">
                  <span className="block text-slate-500 dark:text-slate-400">
                    {isHindi ? 'ओटीपी प्राप्तकर्ता:' : 'Verification code sent to:'}
                  </span>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    {contact}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRegisterStep('form');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs text-emerald-700 dark:text-emerald-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>{isHindi ? 'बदलें' : 'Change'}</span>
                </button>
              </div>

              {/* 6 Digit Input Boxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 text-center">
                  {isHindi ? '6-अंकीय ओटीपी कोड दर्ज करें' : 'Enter 6-Digit Verification Code'}
                </label>
                <div className="flex items-center justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpInputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-black rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isHindi ? 'सत्यापित करें और खाता बनाएं' : 'Verify & Complete Registration'}</span>
              </button>

              {/* Resend Controls */}
              <div className="text-center pt-1 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
                {resendTimer > 0 ? (
                  <span>
                    {isHindi ? `पुनः कोड भेजें (${resendTimer}s)` : `Resend code in ${resendTimer}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'ओटीपी पुनः भेजें (Resend OTP)' : 'Resend OTP'}</span>
                  </button>
                )}
              </div>

              {/* Delivery helper if external SMS/Email is delayed */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setShowIncomingMessage(!showIncomingMessage)}
                  className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 transition-all"
                >
                  <MailOpen className="w-3.5 h-3.5" />
                  <span>
                    {showIncomingMessage
                      ? (isHindi ? 'सुरक्षा संदेश विवरण छिपाएं' : 'Hide Delivered Security Message')
                      : (isHindi ? 'संदेश नहीं मिला? भेजा गया सुरक्षा कोड देखें' : "Didn't receive SMS/Email? View Delivered Security Code")
                    }
                  </span>
                </button>

                {showIncomingMessage && lastDeliveredMessage && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#071c14] border border-emerald-300 dark:border-emerald-800 text-left animate-in fade-in space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Uttarakhand Gateways Dispatcher</span>
                      </span>
                      <span>{lastDeliveredMessage.timestamp}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        <strong>To:</strong> {lastDeliveredMessage.contact} ({lastDeliveredMessage.channel.toUpperCase()})
                      </p>
                      <p className="mt-1.5 text-slate-800 dark:text-slate-200">
                        Namaste! Your verification code is:{' '}
                        <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded tracking-widest">
                          {lastDeliveredMessage.code}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {isHindi ? 'यह 6-अंकीय कोड ऊपर दिए गए बॉक्स में दर्ज करें।' : 'Enter this 6-digit code in the boxes above.'}
                      </p>
                    </div>

                    {lastDeliveredMessage.emailPreviewUrl && (
                      <a
                        href={lastDeliveredMessage.emailPreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline pt-0.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Delivered Email in Web Mailbox ↗</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer Guarantee */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-[#05140e] border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>🔒 100% Verified Community</span>
          <button
            type="button"
            onClick={closeAuthModal}
            className="hover:underline text-slate-600 dark:text-slate-400 cursor-pointer"
          >
            {isHindi ? 'बाद में देखें' : 'Browse as Guest'}
          </button>
        </div>

      </div>
    </div>
  );
};
