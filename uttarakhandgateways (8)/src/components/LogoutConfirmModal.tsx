import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { isHindi } = useLanguage();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-white dark:bg-[#09241a] rounded-3xl p-6 border border-emerald-200 dark:border-emerald-800/80 shadow-2xl relative animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          aria-label={isHindi ? "बंद करें" : "Close"}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          {isHindi ? 'लॉग आउट की पुष्टि करें' : 'Confirm Logout'}
        </h3>
        
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          {isHindi
            ? 'क्या आप वाकई लॉग आउट करना चाहते हैं? मालिकों से चैट करने या संपत्ति पोस्ट करने हेतु आपको पुनः अपने ईमेल OTP से लॉग इन करना होगा।'
            : 'Are you sure you want to log out? You will need to verify with your email OTP to chat with owners, post properties, or access saved listings.'}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            {isHindi ? 'रद्द करें' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isHindi ? 'हाँ, लॉग आउट' : 'Yes, Log Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
