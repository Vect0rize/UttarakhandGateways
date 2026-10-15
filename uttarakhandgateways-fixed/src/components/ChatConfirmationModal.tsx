import React, { useState } from 'react';
import { Property } from '../types';
import { MessageSquare, X, Send, ShieldCheck, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ChatConfirmationModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (property: Property, initialMessage: string) => void;
}

export const ChatConfirmationModal: React.FC<ChatConfirmationModalProps> = ({
  property,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t, language, isHindi } = useLanguage();
  const [message, setMessage] = useState('');

  if (!isOpen || !property) return null;

  const defaultMessage = language === 'hi'
    ? `नमस्ते! मैं ${property.title} (${property.city}) में रुचि रखता हूँ। क्या यह साइट विज़िट या बातचीत के लिए उपलब्ध है?`
    : `Namaste! I am interested in ${property.title} (${property.city}). Is it available for site visit or further discussion?`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(property, message.trim() || defaultMessage);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-200/80 dark:border-slate-800 overflow-hidden my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-xs text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {t('chat.confirmTitle')}
              </h3>
              <p className="text-[11px] text-emerald-100/80">
                {t('chat.confirmSub')}
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Property Summary Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-emerald-50/70 dark:bg-slate-800/70 border border-emerald-100 dark:border-slate-700/80">
            <img 
              src={property.images[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'} 
              alt={property.title} 
              className="w-16 h-16 rounded-xl object-cover border border-emerald-200/60 dark:border-slate-700 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {property.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {property.city} • <span className="font-bold text-emerald-600 dark:text-emerald-400">{property.priceDisplay}</span>
              </p>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                <User className="w-3 h-3 text-emerald-600" />
                <span className="font-semibold">{property.sellerName || ''}</span>
              </div>
            </div>
          </div>

          {/* Message Prompt */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t('chat.msgLabel')}
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={defaultMessage}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              {isHindi ? 'मानक परिचय संदेश भेजने के लिए खाली छोड़ें, या अपनी विशिष्ट पूछताछ लिखें।' : 'Leave blank to send standard introduction, or type your specific inquiry.'}
            </p>
          </div>

          {/* Safety & Direct Assurance */}
          <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{t('chat.securityNote')}</span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('chat.cancelBtn')}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('chat.sendBtn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
