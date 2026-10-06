import React from 'react';
import { UploadPropertyModal } from './UploadPropertyModal';
import { Logo } from './Logo';
import { ArrowLeft, Building2, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Property } from '../types';
import { LegalPolicyId } from '../data/legalPolicies';

interface SellGuiPageProps {
  onBackToMain: () => void;
  onPropertyUploaded: (property: Property) => void;
  lastUploadTime?: number;
  onUpdateLastUploadTime?: (timestamp: number) => void;
  onOpenLegalPolicy?: (policyId: LegalPolicyId) => void;
}

export const SellGuiPage: React.FC<SellGuiPageProps> = ({
  onBackToMain,
  onPropertyUploaded,
  lastUploadTime,
  onUpdateLastUploadTime,
  onOpenLegalPolicy,
}) => {
  const { isHindi } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f2f7f4] dark:bg-[#061811] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#071f16]/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-emerald-900/60 py-3.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToMain}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-[#0a2f22] hover:bg-emerald-200 dark:hover:bg-[#0f4030] text-emerald-950 dark:text-emerald-100 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isHindi ? '← मार्केटप्लेस (Marketplace)' : '← Marketplace'}</span>
            </button>
            <div onClick={onBackToMain} className="cursor-pointer">
              <Logo size="md" darkText={true} />
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>0% Brokerage Direct Owner Listing</span>
          </div>
        </div>
      </header>

      {/* Main Container rendering Upload Property GUI */}
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
        />
      </main>

    </div>
  );
};
