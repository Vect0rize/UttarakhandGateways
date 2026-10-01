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
  CheckCircle2 
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
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen || currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'login') {
      const res = login(contact, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to sign in.');
      } else {
        setSuccessMsg(isHindi ? 'सफलतापूर्वक लॉग इन किया गया!' : 'Successfully logged in!');
      }
    } else {
      const res = register(username, contact, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to register account.');
      } else {
        setSuccessMsg(isHindi ? 'खाता सफलतापूर्वक बनाया गया!' : 'Account registered successfully!');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#071c14] border border-emerald-200 dark:border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden transition-all text-slate-800 dark:text-slate-100"
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

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {mode === 'login' 
              ? (isHindi ? 'लॉग इन' : 'Login')
              : (isHindi ? 'पंजीकरण' : 'Register')
            }
          </h2>

          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            {authActionReason || (
              isHindi 
                ? 'उत्तराखंड की सत्यापित संपत्तियों को देखने, लिस्ट करने या संपर्क करने हेतु लॉग इन आवश्यक है।'
                : 'Sign in to contact property owners, post listings with 0% brokerage, and save properties.'
            )}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
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

          {/* IN REGISTER MODE: Ask for Username */}
          {mode === 'register' && (
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
                  placeholder={isHindi ? 'उपयोगकर्ता नाम दर्ज करें' : 'Enter username'}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* IN BOTH LOGIN & REGISTER: Ask for Email or Phone Number */}
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

          {/* IN BOTH LOGIN & REGISTER: Ask for Password */}
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
                placeholder={mode === 'register' ? (isHindi ? 'न्यूनतम 4 अक्षर' : 'At least 4 characters') : '••••••••'}
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>
              {mode === 'login' 
                ? (isHindi ? 'लॉग इन करें' : 'Login')
                : (isHindi ? 'खाता बनाएं' : 'Register')
              }
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Clean Switch link between Login and Register */}
          <div className="text-center pt-2 text-xs text-slate-600 dark:text-slate-400">
            {mode === 'login' ? (
              <p>
                {isHindi ? 'क्या आपका कोई खाता नहीं है?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer ml-1"
                >
                  {isHindi ? 'पंजीकरण करें (Register)' : 'Register'}
                </button>
              </p>
            ) : (
              <p>
                {isHindi ? 'क्या पहले से खाता है?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer ml-1"
                >
                  {isHindi ? 'लॉग इन करें (Login)' : 'Login'}
                </button>
              </p>
            )}
          </div>

        </form>

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
