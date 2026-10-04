import React from 'react';
import { useAuth, SavedAccount } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  Users, 
  Check, 
  PlusCircle, 
  Trash2, 
  LogOut, 
  Crown, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface SwitchAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewAccount: () => void;
}

export const SwitchAccountModal: React.FC<SwitchAccountModalProps> = ({
  isOpen,
  onClose,
  onAddNewAccount,
}) => {
  const { 
    currentUser, 
    savedAccounts, 
    switchAccount, 
    removeSavedAccount, 
    clearAllAccounts,
    logout 
  } = useAuth();
  
  const { isHindi } = useLanguage();

  if (!isOpen) return null;

  const handleSelectAccount = (acc: SavedAccount) => {
    switchAccount(acc.id);
    onClose();
  };

  const handleRemove = (e: React.MouseEvent, accId: string) => {
    e.stopPropagation();
    removeSavedAccount(accId);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#071d15] rounded-3xl shadow-2xl border border-emerald-300 dark:border-emerald-800/80 overflow-hidden my-auto max-h-[90vh] flex flex-col modal-animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 py-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                {isHindi ? 'खाता बदलें (Switch Account)' : 'Switch Account'}
              </h3>
              <p className="text-[11px] text-emerald-300/80">
                {isHindi ? 'इस डिवाइस पर सभी सहेजे गए खाते' : 'All accounts logged into this device'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Account List */}
        <div className="p-5 space-y-3 overflow-y-auto max-h-[60vh]">
          {savedAccounts.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block px-1">
                {isHindi ? 'सहेजे गए खाते' : 'Available Accounts'} ({savedAccounts.length})
              </span>

              {savedAccounts.map((acc) => {
                const isActive = currentUser?.id === acc.id || currentUser?.contact.toLowerCase() === acc.contact.toLowerCase();
                const isOwner = acc.username.trim().toLowerCase() === 'amit tyagi';

                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectAccount(acc)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-[#0b2b1f] border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white dark:bg-[#082319] border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-50/60 dark:hover:bg-[#0d3426] hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center text-sm font-black uppercase shadow-xs flex-shrink-0">
                        {acc.avatar ? (
                          <img src={acc.avatar} alt={acc.username} className="w-full h-full object-cover" />
                        ) : (
                          acc.username.charAt(0)
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {acc.username}
                          </span>
                          {isOwner && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-500 dark:text-amber-300 text-[10px] font-extrabold border border-amber-400/40">
                              <Crown className="w-2.5 h-2.5" />
                              <span>Owner</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {acc.contact}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isActive ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isHindi ? 'सक्रिय' : 'Active'}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAccount(acc);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          {isHindi ? 'स्विच करें' : 'Switch'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleRemove(e, acc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title={isHindi ? 'इस खाते को हटाएं' : 'Remove this account from device'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              {isHindi ? 'कोई सहेजा गया खाता नहीं है।' : 'No saved accounts on this device yet.'}
            </div>
          )}

          {/* Add Another Account Button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onAddNewAccount();
            }}
            className="w-full py-2.5 px-4 rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 bg-emerald-50/50 dark:bg-[#092b1e]/50 hover:bg-emerald-100/60 dark:hover:bg-[#0f3827] text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isHindi ? 'अन्य खाता जोड़ें / लॉगिन करें' : '+ Add or Log Into Another Account'}</span>
          </button>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-200 dark:border-emerald-900/60 bg-slate-50/80 dark:bg-[#051710] flex items-center justify-between text-xs">
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isHindi ? 'इस खाते से लॉग आउट' : 'Log out of current'}</span>
            </button>
          )}

          {savedAccounts.length > 1 && (
            <button
              type="button"
              onClick={() => {
                clearAllAccounts();
                onClose();
              }}
              className="text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
            >
              {isHindi ? 'सभी खाते हटाएं' : 'Clear all from device'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
