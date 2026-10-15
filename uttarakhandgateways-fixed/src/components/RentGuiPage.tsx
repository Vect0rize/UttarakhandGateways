import React from 'react';
import { ListRentalModal } from './ListRentalModal';
import { Logo } from './Logo';
import { ArrowLeft, Key, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Property } from '../types';
import { LegalPolicyId } from '../data/legalPolicies';

interface RentGuiPageProps {
  onBackToMain: () => void;
  onRentalUploaded: (property: Property) => void;
  onOpenLegalPolicy?: (policyId: LegalPolicyId) => void;
}

export const RentGuiPage: React.FC<RentGuiPageProps> = ({
  onBackToMain,
  onRentalUploaded,
  onOpenLegalPolicy,
}) => {
  const { isHindi } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f2f7f4] dark:bg-[#061811] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#071f16]/95 backdrop-blur-xl border-b border-teal-200/80 dark:border-teal-900/60 py-3.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div onClick={onBackToMain} className="cursor-pointer">
            <Logo size="md" darkText={true} />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/80 px-3.5 py-1.5 rounded-full border border-teal-300 dark:border-teal-800">
              <Key className="w-4 h-4 text-teal-600" />
              <span>0% Brokerage Rental Listing GUI</span>
            </div>

            <button
              type="button"
              onClick={onBackToMain}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              title={isHindi ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Back to Home'}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-white" />
              <span>{isHindi ? 'वापस (Back)' : 'Back'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container rendering List Rental GUI */}
      <main className="flex-1 py-4 sm:py-8 px-2 sm:px-4 max-w-5xl mx-auto w-full">
        <ListRentalModal
          isOpen={true}
          onClose={onBackToMain}
          onRentalUploaded={(p) => {
            onRentalUploaded(p);
            onBackToMain();
          }}
          onOpenLegalPolicy={onOpenLegalPolicy}
        />
      </main>

    </div>
  );
};
