import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, BookmarkPlus, X, User } from 'lucide-react';

export const SaveInfoPromptModal: React.FC = () => {
  const { isSavePromptOpen, pendingSaveAccount, saveCurrentAccountToDevice, dismissSavePrompt } = useAuth();
  const { isHindi } = useLanguage();

  if (!isSavePromptOpen || !pendingSaveAccount) return null;

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={dismissSavePrompt}
    >
      <div 
        className="relative w-full max-w-sm bg-white dark:bg-[#071d15] rounded-3xl p-6 shadow-2xl border border-emerald-300 dark:border-emerald-800 text-slate-800 dark:text-slate-100 modal-animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={dismissSavePrompt}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-xs border border-emerald-200 dark:border-emerald-800">
          <BookmarkPlus className="w-6 h-6" />
        </div>

        <h3 className="text-base font-black text-center text-slate-900 dark:text-white mb-1.5">
          {isHindi ? 'लॉगिन जानकारी सहेजें?' : 'Save Login Info on This Device?'}
        </h3>
        
        <p className="text-xs text-slate-600 dark:text-slate-300 text-center mb-4 leading-relaxed">
          {isHindi 
            ? 'इस खाते को सहेजें ताकि आप भविष्य में बिना पासवर्ड 1-क्लिक में तुरंत स्विच और लॉगिन कर सकें।'
            : 'Save this account for fast 1-click switching and automatic sign-in next time without entering credentials again.'
          }
        </p>

        {/* User preview badge */}
        <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-[#0b261b] border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center text-sm font-black uppercase shadow-xs flex-shrink-0">
            {pendingSaveAccount.avatar ? (
              <img src={pendingSaveAccount.avatar} alt={pendingSaveAccount.username} className="w-full h-full object-cover" />
            ) : (
              pendingSaveAccount.username.charAt(0)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
              {pendingSaveAccount.username}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
              {pendingSaveAccount.contact}
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800">
            {isHindi ? 'सत्यापित' : 'Active'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={dismissSavePrompt}
            className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {isHindi ? 'अभी नहीं' : 'Not Now'}
          </button>
          <button
            type="button"
            onClick={saveCurrentAccountToDevice}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isHindi ? 'जानकारी सहेजें' : 'Save Info'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
