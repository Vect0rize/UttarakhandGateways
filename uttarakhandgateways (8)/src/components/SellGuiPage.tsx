import React, { useState, useEffect } from 'react';
import { UploadPropertyModal } from './UploadPropertyModal';
import { Logo } from './Logo';
import { ArrowLeft, Building2, Sparkles, ShieldCheck, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Property } from '../types';
import { LegalPolicyId } from '../data/legalPolicies';

interface SellGuiPageProps {
  onBackToMain: () => void;
  onPropertyUploaded: (property: Property) => void;
  lastUploadTime?: number;
  onUpdateLastUploadTime?: (timestamp: number) => void;
  onOpenLegalPolicy?: (policyId: LegalPolicyId) => void;
  initialRole?: 'Owner' | 'Broker' | null;
}

export const SellGuiPage: React.FC<SellGuiPageProps> = ({
  onBackToMain,
  onPropertyUploaded,
  lastUploadTime,
  onUpdateLastUploadTime,
  onOpenLegalPolicy,
  initialRole = null,
}) => {
  const { isHindi } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'Owner' | 'Broker' | null>(initialRole);

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  return (
    <div className="min-h-screen bg-[#f2f7f4] dark:bg-[#061811] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#071f16]/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-emerald-900/60 py-3.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div onClick={onBackToMain} className="cursor-pointer">
            <Logo size="md" darkText={true} />
          </div>

          <div className="flex items-center gap-2.5">
            {selectedRole ? (
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer px-2 py-1"
                title={isHindi ? 'भूमिका बदलें' : 'Change role'}
              >
                {isHindi ? 'भूमिका बदलें (Change Role)' : 'Change Role'}
              </button>
            ) : null}

            <button
              type="button"
              onClick={selectedRole ? () => setSelectedRole(null) : onBackToMain}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              title={isHindi ? 'वापस जाएं' : 'Back'}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-white" />
              <span>{isHindi ? 'वापस (Back)' : 'Back'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Step 1 (Role Chooser) or Step 2 (Normal GUI) */}
      {!selectedRole ? (
        <main className="flex-1 py-8 sm:py-14 px-4 max-w-3xl mx-auto w-full flex flex-col items-center justify-center">
          <div className="w-full bg-white dark:bg-[#071f16] rounded-3xl p-6 sm:p-9 shadow-2xl border-2 border-emerald-300 dark:border-emerald-700 space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif-luxury">
                {isHindi ? 'आप इस प्रॉपर्टी को किस रूप में लिस्ट कर रहे हैं?' : 'Are you listing as an Owner or an Agent / Broker?'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-200/80 max-w-lg mx-auto">
                {isHindi 
                  ? 'कृपया सेल जीयूआई (Sell GUI) खोलने से पहले नीचे दिए गए 2 विकल्पों में से चुनें:' 
                  : 'Please choose your listing role to open the Sell GUI:'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Option 1: Direct Owner */}
              <button
                type="button"
                onClick={() => setSelectedRole('Owner')}
                className="p-6 rounded-2xl border-2 border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 transition-all cursor-pointer text-left flex flex-col justify-between group active:scale-[0.98] shadow-xs hover:shadow-lg"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                      {isHindi ? 'सीधे मालिक (Direct Owner)' : 'Direct Property Owner'}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      {isHindi 
                        ? 'मैं संपत्ति का वास्तविक मालिक हूँ। 0% ब्रोकरेज, सीधे खरीदार से डील।' 
                        : 'I am the property owner selling directly with 0% brokerage.'}
                    </p>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <span>{isHindi ? 'मालिक के रूप में खोलें' : 'Open as Owner'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 2: Agent / Broker */}
              <button
                type="button"
                onClick={() => setSelectedRole('Broker')}
                className="p-6 rounded-2xl border-2 border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-100/70 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 transition-all cursor-pointer text-left flex flex-col justify-between group active:scale-[0.98] shadow-xs hover:shadow-lg"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                      {isHindi ? 'एजेंट / ब्रोकर (Agent / Broker)' : 'Real Estate Agent / Broker'}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                      {isHindi 
                        ? 'मैं एक अधिकृत प्रॉपर्टी डीलर, सलाहकार या एजेंट हूँ।' 
                        : 'I am a real estate agent, consultant, or authorized broker.'}
                    </p>
                  </div>
                </div>
                <div className="mt-5 pt-3 border-t border-teal-200 dark:border-teal-800/80 flex items-center justify-between text-xs font-bold text-teal-700 dark:text-teal-300">
                  <span>{isHindi ? 'ब्रोकर के रूप में खोलें' : 'Open as Broker'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* Normal GUI */
        <main className="flex-1 py-4 sm:py-8 px-2 sm:px-4 max-w-5xl mx-auto w-full">
          <UploadPropertyModal
            isOpen={true}
            onClose={onBackToMain}
            onPropertyUploaded={(p) => {
              onPropertyUploaded(p);
              onBackToMain();
            }}
            lastUploadTime={lastUploadTime}
            onUpdateLastUploadTime={onUpdateLastUploadTime}
            onOpenLegalPolicy={onOpenLegalPolicy}
            initialSellerType={selectedRole}
          />
        </main>
      )}

    </div>
  );
};
