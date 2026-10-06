import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  User as UserIcon, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle
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
  } = useAuth();
  
  const { isHindi } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login & Registration fields
  const [contact, setContact] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const isContactEmail = contact.includes('@');
  const isContactPhone = !isContactEmail && contact.replace(/\D/g, '').length >= 10;

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedContact = contact.trim();
    const trimmedPass = password.trim();

    if (!trimmedContact) {
      setErrorMsg(isHindi ? 'कृपया अपना व्हाट्सएप नंबर या ईमेल दर्ज करें।' : 'Please enter your WhatsApp number or email.');
      return;
    }

    if (!trimmedPass) {
      setErrorMsg(isHindi ? 'कृपया अपना पासवर्ड दर्ज करें।' : 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const res = login(trimmedContact, trimmedPass);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || (isHindi ? 'लॉगिन विफल। कृपया क्रेडेंशियल जांचें।' : 'Login failed. Please check your credentials.'));
    } else {
      setSuccessMsg(isHindi ? 'सफलतापूर्वक लॉग इन किया गया!' : 'Successfully logged in! Redirecting...');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        else handleBack();
      }, 700);
    }
  };

  // Handle Direct Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedName = username.trim();
    const trimmedContact = contact.trim();
    const trimmedPass = password.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg(isHindi ? 'कृपया कम से कम 2 अक्षरों का नाम दर्ज करें।' : 'Please enter a valid username (at least 2 characters).');
      return;
    }

    const cleanContact = trimmedContact;
    if (!cleanContact.includes('@') && cleanContact.replace(/\D/g, '').length < 10) {
      setErrorMsg(isHindi ? 'कृपया एक मान्य व्हाट्सएप नंबर या ईमेल दर्ज करें।' : 'Please enter a valid WhatsApp number or email address.');
      return;
    }

    if (!trimmedPass || trimmedPass.length < 4) {
      setErrorMsg(isHindi ? 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' : 'Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    const res = register(trimmedName, cleanContact, trimmedPass);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || (isHindi ? 'खाता बनाने में विफल।' : 'Failed to create account.'));
    } else {
      setSuccessMsg(isHindi ? 'खाता सफलतापूर्वक बनाया गया! आप लॉग इन हो चुके हैं।' : 'Account created successfully! You are now logged in.');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        else handleBack();
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f7f4] dark:bg-[#061811] text-slate-800 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden transition-colors">
      
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[140px]" />
      </div>

      {/* Top Header Bar - Clean logo only without awkward return button beside it */}
      <header className="relative z-20 border-b border-emerald-200/80 dark:border-emerald-900/60 bg-white/80 dark:bg-[#071f16]/90 backdrop-blur-md py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div onClick={handleBack} className="cursor-pointer">
            <Logo size="md" darkText={true} />
          </div>

          <div className="text-xs text-slate-500 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
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
              <span className="text-xs text-emerald-200 font-medium">
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
                ? 'व्हाट्सएप नंबर या ईमेल और पासवर्ड से 0% ब्रोकरेज पर सुरक्षित रूप से लॉगिन करें।' 
                : 'Enter your WhatsApp number or email and password to continue.'}
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
                {isHindi ? 'लॉग इन (Sign In)' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
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

            {/* LOGIN FORM: WhatsApp number / Email and Password */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isHindi ? 'व्हाट्सएप नंबर या ईमेल *' : 'WhatsApp Number or Email *'}
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
                      placeholder={isHindi ? 'व्हाट्सएप नंबर (उदा: 9897123456) या ईमेल' : 'WhatsApp number (e.g. 9897123456) or email'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span>{isSubmitting ? (isHindi ? 'लॉगिन हो रहा है...' : 'Signing In...') : (isHindi ? 'लॉग इन करें' : 'Sign In Now')}</span>
                </button>
              </form>
            )}

            {/* REGISTER FORM: Direct registration without blocked OTP */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
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
                    {isHindi ? 'व्हाट्सएप नंबर या ईमेल *' : 'WhatsApp Number or Email *'}
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
                      placeholder={isHindi ? 'व्हाट्सएप नंबर (उदा: 9897123456) या ईमेल' : 'WhatsApp number (e.g. 9897123456) or email'}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <span>{isSubmitting ? (isHindi ? 'खाता बनाया जा रहा है...' : 'Creating Account...') : (isHindi ? 'खाता बनाएं और लॉगिन करें' : 'Create Account & Sign In')}</span>
                </button>
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
