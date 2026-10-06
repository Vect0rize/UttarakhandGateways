import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  MessageSquare,
  Users,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from './Logo';

interface LoginPageProps {
  onBackToMarketplace?: () => void;
  onBackToMain?: () => void;
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onBackToMarketplace, 
  onBackToMain,
  onLoginSuccess 
}) => {
  const handleBack = onBackToMain || onBackToMarketplace || (() => window.history.back());
  const { 
    currentUser, 
    login, 
    register, 
    sendRegistrationOtp, 
    verifyRegistrationOtp, 
    savedAccounts, 
    switchAccount 
  } = useAuth();
  
  const { isHindi } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [registerStep, setRegisterStep] = useState<'form' | 'otp'>('form');
  
  // Contact input can be phone number or email
  const [contact, setContact] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [whatsappDeliveryLink, setWhatsappDeliveryLink] = useState<string | null>(null);

  // Captcha state
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const captchaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Status messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Generate stylized Captcha
  const generateCaptcha = useCallback(() => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput('');

    setTimeout(() => {
      const canvas = captchaCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#062c21');
      gradient.addColorStop(1, '#093c2d');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(52, 211, 153, 0.25)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }

      ctx.font = 'bold 22px "Plus Jakarta Sans", monospace';
      ctx.textBaseline = 'middle';
      const colors = ['#34d399', '#6ee7b7', '#a7f3d0', '#5eead4'];

      for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const x = 16 + i * 22;
        const y = canvas.height / 2;
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillText(char, x, y);
      }
    }, 50);
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [mode, generateCaptcha]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (registerStep === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [registerStep, resendTimer]);

  const isContactEmail = contact.includes('@');
  const isContactPhone = !isContactEmail && contact.replace(/\D/g, '').length >= 10;

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = login(contact, password);
    if (!res.success) {
      setErrorMsg(res.error || 'Failed to sign in.');
    } else {
      setSuccessMsg(isHindi ? 'सफलतापूर्वक लॉग इन किया गया!' : 'Successfully logged in! Redirecting...');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        else handleBack();
      }, 800);
    }
  };

  // Handle Send Registration OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!captchaInput.trim() || captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMsg(isHindi ? 'अमान्य कैप्चा कोड। कृपया चित्र में प्रदर्शित कोड पुनः दर्ज करें।' : 'Incorrect Captcha code. Please try again.');
      generateCaptcha();
      return;
    }

    const cleanContact = contact.trim();
    if (!cleanContact.includes('@') && cleanContact.replace(/\D/g, '').length < 10) {
      setErrorMsg(isHindi ? 'कृपया एक मान्य ईमेल या 10-अंकीय फ़ोन नंबर दर्ज करें।' : 'Please enter a valid email address or 10-digit phone number.');
      return;
    }

    setIsSendingOtp(true);
    const res = await sendRegistrationOtp(cleanContact, username);
    setIsSendingOtp(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to send OTP.');
      generateCaptcha();
      return;
    }

    setRegisterStep('otp');
    setResendTimer(30);
    setOtpDigits(['', '', '', '', '', '']);

    const isPhone = !cleanContact.includes('@');
    if (isPhone) {
      const phoneDigits = cleanContact.replace(/\D/g, '');
      const waUrl = `https://api.whatsapp.com/send?phone=91${phoneDigits}&text=${encodeURIComponent(`Uttarakhand Gateways OTP Verification Code: ${Math.floor(100000 + Math.random() * 900000)}`)}`;
      setWhatsappDeliveryLink(waUrl);
    }

    setSuccessMsg(
      isPhone 
        ? (isHindi ? `व्हाट्सएप पर सत्यापन कोड भेजा गया है (${cleanContact})` : `Verification code sent via WhatsApp to ${cleanContact}`)
        : (isHindi ? `सत्यापन कोड ईमेल (${cleanContact}) पर भेजा गया है` : `Verification code sent to email ${cleanContact}`)
    );

    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
  };

  // Handle Verify OTP
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
      setErrorMsg(res.error || (isHindi ? 'गलत या अमान्य ओटीपी कोड।' : 'Invalid or expired OTP code.'));
    } else {
      setSuccessMsg(isHindi ? 'सत्यापित! आपका खाता सफलतापूर्वक बन गया।' : 'Account created successfully! Redirecting...');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        else handleBack();
      }, 1000);
    }
  };

  // Digit box handler
  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      const pasted = val.replace(/\D/g, '').slice(0, 6).split('');
      const next = [...otpDigits];
      pasted.forEach((ch, i) => {
        if (i < 6) next[i] = ch;
      });
      setOtpDigits(next);
      otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }
    const clean = val.replace(/\D/g, '');
    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f7f4] dark:bg-[#061811] text-slate-800 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden transition-colors">
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[140px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 border-b border-emerald-200/80 dark:border-emerald-900/60 bg-white/80 dark:bg-[#071f16]/90 backdrop-blur-md py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-[#0a2f22] hover:bg-emerald-200 dark:hover:bg-[#0f4030] text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHindi ? 'मार्केटप्लेस पर वापस जाएं' : 'Back to Marketplace'}</span>
          </button>

          <div onClick={handleBack} className="cursor-pointer">
            <Logo size="md" darkText={true} />
          </div>

          <div className="text-xs text-slate-500 dark:text-emerald-300 font-semibold hidden sm:flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>0% Brokerage Direct Platform</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden transition-all">
          
          {/* Top Banner */}
          <div className="p-6 bg-gradient-to-r from-emerald-700 via-teal-800 to-[#072d21] text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-extrabold tracking-wider uppercase">
                {isHindi ? 'सुरक्षित प्रमाणीकरण' : 'Secure Authentication'}
              </span>
              <span className="text-xs text-emerald-200">
                Uttarakhand Gateways
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight">
              {mode === 'login' 
                ? (isHindi ? 'लॉग इन करें' : 'Sign In to Your Account') 
                : (isHindi ? 'नया खाता बनाएं' : 'Create Free Account')}
            </h1>
            <p className="text-xs text-emerald-100/90 mt-1">
              {isHindi 
                ? 'फ़ोन नंबर या ईमेल के माध्यम से 0% ब्रोकरेज पर सुरक्षित रूप से लॉगिन करें।' 
                : 'Sign in with phone number or email with zero brokerage.'}
            </p>

            {/* Toggle Tabs (Login vs Register) */}
            <div className="grid grid-cols-2 gap-1.5 mt-5 p-1 rounded-2xl bg-black/25 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'login' 
                    ? 'bg-white text-emerald-950 shadow-md' 
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                {isHindi ? 'लॉग इन (Login)' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setRegisterStep('form');
                  setErrorMsg(null);
                  setSuccessMsg(null);
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

          {/* Body Content */}
          <div className="p-6 space-y-4">
            
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'फ़ोन नंबर या ईमेल पता *' : 'Phone Number or Email Address *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      {isContactPhone ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <input
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={isHindi ? 'फ़ोन नंबर (उदा: 9897123456) या ईमेल' : 'Enter phone number (e.g. 9897123456) or email'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    {isHindi 
                      ? '📱 भारतीय मोबाइल नंबर या पंजीकृत ईमेल पता मान्य है' 
                      : '📱 Indian mobile numbers or registered email addresses supported'}
                  </span>
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>{isHindi ? 'लॉग इन करें' : 'Sign In Now'}</span>
                </button>

                {/* Quick Saved Accounts */}
                {savedAccounts.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                      {isHindi ? 'इस डिवाइस पर सहेजे गए खाते:' : 'Saved accounts on this device:'}
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {savedAccounts.map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            switchAccount(acc.id);
                            handleBack();
                          }}
                          className="w-full p-2 rounded-xl bg-slate-50 dark:bg-[#07241a] hover:bg-emerald-50 dark:hover:bg-[#0a2e22] border border-slate-200 dark:border-emerald-800/60 flex items-center justify-between text-left text-xs transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                              {acc.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-white truncate">{acc.username}</span>
                            <span className="text-slate-400 truncate">({acc.contact})</span>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-bold shrink-0">Login →</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* REGISTER FORM */}
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
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={isHindi ? 'उदा: rahul_sharma' : 'e.g. rohit_uk'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'फ़ोन नंबर या ईमेल (WhatsApp / Email) *' : 'Phone Number or Email (WhatsApp / Email) *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      {isContactPhone ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <input
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder={isHindi ? '10-अंकीय फ़ोन नंबर या ईमेल' : 'Enter mobile number or email'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block flex items-center gap-1">
                    <span>💬</span>
                    <span>
                      {isHindi 
                        ? 'फ़ोन नंबर दर्ज करने पर ओटीपी कोड एसएमएस के बजाय व्हाट्सएप पर भेजा जाएगा।' 
                        : 'Phone number OTP is delivered directly via WhatsApp instead of SMS.'}
                    </span>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'पासवर्ड सेट करें *' : 'Set Password *'}
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
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

                {/* Captcha */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-[#07241a] border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {isHindi ? 'सुरक्षा कैप्चा कोड दर्ज करें:' : 'Security Captcha Verification:'}
                    </span>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'रीफ्रेश' : 'Refresh'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <canvas 
                      ref={captchaCanvasRef} 
                      width={140} 
                      height={40} 
                      className="rounded-xl border border-emerald-400 shadow-xs shrink-0" 
                    />
                    <input
                      type="text"
                      required
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                      placeholder="Code"
                      maxLength={5}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-mono font-bold tracking-widest text-sm uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isSendingOtp ? (
                    <span>{isHindi ? 'कोड भेजा जा रहा है...' : 'Sending Code...'}</span>
                  ) : (
                    <span>{isHindi ? 'सत्यापन कोड प्राप्त करें (Get OTP)' : 'Send Verification OTP'}</span>
                  )}
                </button>
              </form>
            )}

            {/* OTP VERIFICATION STEP */}
            {mode === 'register' && registerStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {isHindi ? '6-अंकीय सत्यापन कोड दर्ज करें' : 'Enter 6-Digit OTP Code'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isHindi ? `कोड भेजा गया: ${contact}` : `Sent to: ${contact}`}
                  </p>
                </div>

                {/* 6 Digit Inputs */}
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
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && idx > 0) {
                          otpInputRefs.current[idx - 1]?.focus();
                        }
                      }}
                      className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-black rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  ))}
                </div>

                {whatsappDeliveryLink && (
                  <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-300 dark:border-teal-800 text-center">
                    <span className="text-xs text-teal-900 dark:text-teal-200 block mb-1 font-bold">
                      {isHindi ? 'व्हाट्सएप पर ओटीपी प्राप्त करने हेतु क्लिक करें:' : 'Receive or view code on WhatsApp:'}
                    </span>
                    <a
                      href={whatsappDeliveryLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba5a] shadow-xs cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'व्हाट्सएप में खोलें' : 'Open WhatsApp'}</span>
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>{isHindi ? 'खाता सत्यापित करें व बनाएं' : 'Verify & Complete Registration'}</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setRegisterStep('form')}
                    className="text-slate-500 hover:underline cursor-pointer"
                  >
                    ← {isHindi ? 'नंबर/ईमेल बदलें' : 'Change Contact'}
                  </button>

                  <button
                    type="button"
                    disabled={resendTimer > 0}
                    onClick={handleSendOtp}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer disabled:opacity-40"
                  >
                    {resendTimer > 0 
                      ? (isHindi ? `पुनः भेजें (${resendTimer}s)` : `Resend in ${resendTimer}s`) 
                      : (isHindi ? 'पुनः कोड भेजें' : 'Resend Code')}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Uttarakhand Gateways • 0% Brokerage Authentic Mountain Real Estate
      </footer>

    </div>
  );
};
