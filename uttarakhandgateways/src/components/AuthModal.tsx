import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Phone,
  User as UserIcon, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2,
  KeyRound
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
    currentUser 
  } = useAuth();
  
  const { isHindi } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Form fields
  const [username, setUsername] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notifications & errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync mode with context
  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
    }
  }, [authModalMode]);

  // Clear fields and errors on open
  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsSubmitting(false);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen || currentUser) return null;

  // Handle Standard Login (WhatsApp Number or Email + Password)
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
      setErrorMsg(res.error || (isHindi ? 'लॉगिन विफल। कृपया विवरण जांचें।' : 'Login failed. Please check your credentials.'));
    } else {
      setSuccessMsg(isHindi ? 'सफलतापूर्वक लॉग इन किया गया!' : 'Successfully logged in!');
    }
  };

  // Handle Registration (Username, WhatsApp Number or Email, Password)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedName = username.trim();
    const trimmedContact = contact.trim();
    const trimmedPass = password.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg(isHindi ? 'कृपया कम से कम 2 अक्षरों का नाम दर्ज करें।' : 'Please enter a valid name (at least 2 characters).');
      return;
    }

    const isEmail = trimmedContact.includes('@');
    const cleanDigits = trimmedContact.replace(/\D/g, '');
    if (!isEmail && cleanDigits.length < 10) {
      setErrorMsg(isHindi ? 'कृपया एक मान्य 10-अंकीय व्हाट्सएप नंबर या ईमेल दर्ज करें।' : 'Please enter a valid 10-digit WhatsApp number or email address.');
      return;
    }

    if (!trimmedPass || trimmedPass.length < 4) {
      setErrorMsg(isHindi ? 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' : 'Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    const res = register(trimmedName, trimmedContact, trimmedPass);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || (isHindi ? 'खाता बनाने में विफल।' : 'Failed to create account.'));
    } else {
      setSuccessMsg(isHindi ? 'खाता सफलतापूर्वक बनाया गया और लॉगिन हो गया!' : 'Account created successfully! You are now logged in.');
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm bg-white dark:bg-[#071c14] border border-emerald-200 dark:border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden transition-all text-slate-800 dark:text-slate-100 modal-animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-600 via-teal-700 to-green-800 text-white relative">
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
              isHindi ? 'लॉग इन' : 'Log In'
            ) : (
              isHindi ? 'पंजीकरण (Register)' : 'Create Account'
            )}
          </h2>

          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            {mode === 'login'
              ? (authActionReason || (isHindi 
                  ? 'संपत्ति लिस्ट करने या मालिकों से सीधे संपर्क करने हेतु व्हाट्सएप नंबर / ईमेल और पासवर्ड से लॉगिन करें।' 
                  : 'Enter your WhatsApp number or email and password to sign in.'))
              : (isHindi 
                  ? '0% ब्रोकरेज के साथ संपत्ति लिस्ट करने और संदेश भेजने हेतु खाता बनाएं।' 
                  : 'Register with your WhatsApp number or email to post listings and message owners.')
            }
          </p>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 space-y-3">
          
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

          {/* VIEW: LOGIN MODE */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'व्हाट्सएप नंबर या ईमेल *' : 'WhatsApp Number or Email *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={isHindi ? 'व्हाट्सएप नंबर (उदा: 9897123456) या ईमेल' : 'WhatsApp number (e.g. 9897123456) or email'}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isHindi ? 'पासवर्ड (Password) *' : 'Password *'}
                  </label>
                </div>
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
                <span>{isSubmitting ? (isHindi ? 'लॉगिन हो रहा है...' : 'Logging in...') : (isHindi ? 'लॉग इन करें' : 'Log In')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isHindi ? 'खाता नहीं है?' : "Don't have an account?"}{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {isHindi ? 'नया खाता बनाएं (Register)' : 'Register Now'}
                </button>
              </div>
            </form>
          )}

          {/* VIEW: REGISTER MODE */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'पूरा नाम / यूज़रनेम *' : 'Full Name or Username *'}
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

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'व्हाट्सएप नंबर या ईमेल *' : 'WhatsApp Number or Email *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={isHindi ? 'व्हाट्सएप नंबर (उदा: 9897123456) या ईमेल' : 'WhatsApp number (e.g. 9897123456) or email'}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isHindi ? 'पासवर्ड बनाएं *' : 'Create Password *'}
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
                    placeholder={isHindi ? 'कम से कम 4 अक्षर' : 'Minimum 4 characters'}
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
                <span>{isSubmitting ? (isHindi ? 'खाता बनाया जा रहा है...' : 'Creating account...') : (isHindi ? 'खाता बनाएं (Register)' : 'Create Account & Log In')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isHindi ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {isHindi ? 'लॉग इन करें (Log In)' : 'Log In'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
