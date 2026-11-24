import React, { useState, useEffect } from 'react';
import { X, Building2, Key, Sparkles, ArrowRight, ShieldCheck, User, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ListChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSale: (role: 'Owner' | 'Broker') => void;
  onSelectRent: (role?: 'Owner' | 'Broker') => void;
  initialStep?: 'type' | 'sale-role' | 'rent-role';
}

export const ListChooserModal: React.FC<ListChooserModalProps> = ({
  isOpen,
  onClose,
  onSelectSale,
  onSelectRent,
  initialStep = 'type',
}) => {
  const { isHindi } = useLanguage();
  const [step, setStep] = useState<'type' | 'sale-role' | 'rent-role'>(initialStep);

  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
    } else {
      setStep('type');
    }
  }, [isOpen, initialStep]);

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
            {(step === 'sale-role' || step === 'rent-role') && (
              <button
                type="button"
                onClick={() => {
                  if (initialStep !== 'type') {
                    onClose();
                  } else {
                    setStep('type');
                  }
                }}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer mr-1"
                title={isHindi ? 'वापस' : 'Back'}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight leading-tight">
                {step === 'sale-role' || step === 'rent-role'
                  ? (isHindi ? 'अपनी भूमिका चुनें: मालिक या ब्रोकर' : 'Choose Role: Owner or Broker')
                  : (isHindi ? 'प्रॉपर्टी लिस्टिंग प्रकार चुनें' : 'Choose Listing Type')}
              </h3>
              <p className="text-xs text-emerald-200/80">
                {isHindi ? 'कोई प्लेटफॉर्म शुल्क नहीं • सीधा संपर्क' : 'NO PLATFORM FEE • Direct Lister Contact'}
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

        {/* Options GUI: Step 1 (Sale vs Rent) */}
        {step === 'type' ? (
          <div className="p-6 space-y-4">
            <div className="text-xs text-slate-600 dark:text-emerald-200/80 text-center font-medium">
              {isHindi 
                ? 'कृपया चुनें कि आप अपनी प्रॉपर्टी बेचना चाहते हैं या किराये पर देना चाहते हैं:' 
                : 'Please choose whether you want to list your property for sale or for rent:'}
            </div>

            {/* Option 1: For Sale */}
            <div
              onClick={() => setStep('sale-role')}
              className="group p-5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/70 hover:border-emerald-500 dark:hover:border-emerald-400 bg-emerald-50/40 dark:bg-[#09281e]/40 hover:bg-emerald-50 dark:hover:bg-[#0a2e23] transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center gap-4 active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    {isHindi ? 'प्रॉपर्टी बेचें (For Sale)' : 'Sell Property'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/90 text-slate-950 font-black text-[10px] uppercase">
                    Sale
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {isHindi 
                    ? 'विला, आवासीय प्लॉट, फ्लैट, कॉटेज, फार्महाउस या कृषि भूमि बेचने हेतु लिस्ट करें।' 
                    : 'List plots, villas, flats, cottages, or commercial land for sale.'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-slate-700 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Option 2: For Rent */}
            <div
              onClick={() => setStep('rent-role')}
              className="group p-5 rounded-2xl border-2 border-teal-200 dark:border-teal-800/70 hover:border-teal-500 dark:hover:border-teal-400 bg-teal-50/40 dark:bg-[#07241b]/40 hover:bg-teal-50 dark:hover:bg-[#092b21] transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center gap-4 active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#32463D] to-[#0E3A2B] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
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
                    ? 'अपार्टमेंट, कमरा, विला, होमस्टे या दुकान किराये पर देने हेतु लिस्ट करें।' 
                    : 'Rent out flats, rooms, villas, homestays, or commercial shops.'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-teal-600 flex items-center justify-center shrink-0 border border-teal-200 dark:border-slate-700 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isHindi ? 'कोई प्लेटफॉर्म शुल्क नहीं' : 'NO PLATFORM FEE'}</span>
            </div>
          </div>
        ) : (
          /* Step 2: Role Chooser (Owner or Broker) */
          <div className="p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-xs text-slate-600 dark:text-emerald-200/80 text-center font-medium">
              {isHindi 
                ? 'कृपया बताएं कि आप प्रॉपर्टी मालिक हैं या ब्रोकर:' 
                : 'Please select whether you are the direct owner or a broker:'}
            </div>

            {/* Role 1: Direct Owner */}
            <div
              onClick={() => {
                onClose();
                if (step === 'rent-role') onSelectRent('Owner');
                else onSelectSale('Owner');
              }}
              className="group p-5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 bg-emerald-50/60 dark:bg-[#092b1e]/60 hover:bg-emerald-100/70 dark:hover:bg-[#0c3525] transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center gap-4 active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <User className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                    {isHindi ? 'सीधे मालिक (Direct Owner)' : 'Direct Property Owner'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase">
                    Owner
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {step === 'rent-role'
                    ? (isHindi
                        ? 'मैं संपत्ति का मालिक हूँ और इसे किराये हेतु लिस्ट कर रहा/रही हूँ।'
                        : 'I am the property owner listing this property for rent.')
                    : (isHindi
                        ? 'मैं संपत्ति का मालिक हूँ और इसे बिक्री हेतु लिस्ट कर रहा/रही हूँ।'
                        : 'I am the property owner listing this property for sale.')}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-slate-700 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Role 2: Broker */}
            <div
              onClick={() => {
                onClose();
                if (step === 'rent-role') onSelectRent('Broker');
                else onSelectSale('Broker');
              }}
              className="group p-5 rounded-2xl border-2 border-teal-300 dark:border-teal-700 hover:border-teal-500 bg-teal-50/60 dark:bg-[#07281f]/60 hover:bg-teal-100/70 dark:hover:bg-[#0a3328] transition-all cursor-pointer shadow-xs hover:shadow-md flex items-center gap-4 active:scale-[0.99]"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#32463D] to-[#0E3A2B] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                    {isHindi ? 'ब्रोकर' : 'Broker'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white font-black text-[10px] uppercase">
                    Broker
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {isHindi
                    ? 'मैं एक अधिकृत रियल एस्टेट ब्रोकर हूँ।'
                    : 'I am an authorized real estate broker.'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 text-teal-600 flex items-center justify-center shrink-0 border border-teal-200 dark:border-slate-700 group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep('type')}
                className="font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isHindi ? 'वापस जाएं' : 'Back to selection'}</span>
              </button>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHindi ? 'कोई प्लेटफॉर्म शुल्क नहीं' : 'NO PLATFORM FEE'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
