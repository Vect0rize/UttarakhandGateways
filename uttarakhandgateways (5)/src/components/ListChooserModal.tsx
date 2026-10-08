import React from 'react';
import { X, Building2, Key, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ListChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSale: () => void;
  onSelectRent: () => void;
}

export const ListChooserModal: React.FC<ListChooserModalProps> = ({
  isOpen,
  onClose,
  onSelectSale,
  onSelectRent,
}) => {
  const { isHindi } = useLanguage();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#071d15] border border-emerald-300 dark:border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden transition-all text-slate-800 dark:text-slate-100 modal-animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-emerald-900 via-teal-900 to-[#06241a] text-white flex items-center justify-between border-b border-emerald-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-tight">
                {isHindi ? 'प्रॉपर्टी लिस्टिंग प्रकार चुनें' : 'Choose Listing Type'}
              </h3>
              <p className="text-xs text-emerald-200/80">
                {isHindi ? '100% नि:शुल्क • 0% ब्रोकरेज • सीधा संपर्क' : '100% Free • 0% Brokerage • Direct Owner Deals'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title={isHindi ? 'बंद करें' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options GUI */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-slate-600 dark:text-emerald-200/80 text-center font-medium">
            {isHindi 
              ? 'कृपया चुनें कि आप अपनी प्रॉपर्टी बेचना चाहते हैं या किराये पर देना चाहते हैं:' 
              : 'Please choose whether you want to list your property for sale or for rent:'}
          </div>

          {/* Option 1: For Sale */}
          <div
            onClick={() => {
              onClose();
              onSelectSale();
            }}
            className="group p-5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/70 hover:border-emerald-500 dark:hover:border-emerald-400 bg-emerald-50/40 dark:bg-[#09281e]/40 hover:bg-emerald-50 dark:hover:bg-[#0a2e23] transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center gap-4 active:scale-[0.99]"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {isHindi ? 'बिक्री हेतु लिस्ट करें (For Sale)' : 'List For Sale (Outright Sale)'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/90 text-slate-950 font-black text-[10px] uppercase">
                  Sale
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {isHindi 
                  ? 'विला, आवासीय प्लॉट, फ्लैट, कॉटेज, फार्महाउस या कृषि भूमि सीधे 0% ब्रोकरेज पर बेचें।' 
                  : 'Sell plots, villas, flats, cottages, or commercial land directly to verified buyers.'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-slate-700 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Option 2: For Rent */}
          <div
            onClick={() => {
              onClose();
              onSelectRent();
            }}
            className="group p-5 rounded-2xl border-2 border-teal-200 dark:border-teal-800/70 hover:border-teal-500 dark:hover:border-teal-400 bg-teal-50/40 dark:bg-[#07241b]/40 hover:bg-teal-50 dark:hover:bg-[#092b21] transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center gap-4 active:scale-[0.99]"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <Key className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                  {isHindi ? 'किराये हेतु लिस्ट करें (For Rent)' : 'List For Rent / Lease'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500 text-white font-black text-[10px] uppercase">
                  Rental
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {isHindi 
                  ? 'अपार्टमेंट, कमरा, विला, होमस्टे या दुकान मासिक किराये पर देने हेतु 0% ब्रोकरेज पर लिस्ट करें।' 
                  : 'Rent out flats, rooms, villas, homestays, or commercial shops on monthly rent.'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-teal-600 flex items-center justify-center shrink-0 border border-teal-200 dark:border-slate-700 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isHindi ? '0% ब्रोकरेज • कोई छुपा शुल्क नहीं' : '0% Brokerage Guarantee • No Hidden Charges'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
