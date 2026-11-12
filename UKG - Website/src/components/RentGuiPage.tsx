import React from 'react';
import { UnifiedListingModal } from './UnifiedListingModal';
import { Logo } from './Logo';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Property } from '../types';
import { LegalPolicyId } from '../data/legalPolicies';
import { SeoKeywordsSection } from './SeoKeywordsSection';
import type { AppPageRouteKey } from '../data/seoMetadata';

interface RentGuiPageProps {
  onBackToMain: () => void;
  onRentalUploaded: (property: Property) => void;
  onOpenLegalPolicy?: (policyId: LegalPolicyId) => void;
  initialRole?: 'Owner' | 'Broker';
  onNavigatePage?: (page: AppPageRouteKey) => void;
  onNavigateCity?: (city: string) => void;
}

export const RentGuiPage: React.FC<RentGuiPageProps> = ({
  onBackToMain,
  onRentalUploaded,
  onOpenLegalPolicy,
  initialRole = 'Owner',
  onNavigatePage,
  onNavigateCity,
}) => {
  const { isHindi } = useLanguage();

  return (
    <div className="min-h-screen bg-white sm:bg-[#f2f7f4] dark:bg-[#061811] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#071f16]/95 backdrop-blur-xl border-b border-teal-200/80 dark:border-teal-900/60 py-2.5 sm:py-3.5 px-3 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div onClick={onBackToMain} className="cursor-pointer">
            <Logo size="md" darkText={true} />
          </div>

          <div className="flex items-center gap-2.5">
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

      {/* Main Container rendering Rental Listing GUI with Mobile App features */}
      <main className="flex-1 py-0 sm:py-8 px-0 sm:px-4 max-w-5xl mx-auto w-full">
        <UnifiedListingModal
          isOpen={true}
          isPageMode={true}
          mode="create-rent"
          initialRole={initialRole}
          onClose={onBackToMain}
          onPropertySaved={(p) => {
            onRentalUploaded(p);
            onBackToMain();
          }}
          onOpenLegalPolicy={onOpenLegalPolicy}
        />
      </main>

      <SeoKeywordsSection
        onNavigatePage={onNavigatePage}
        onNavigateCity={onNavigateCity}
      />

    </div>
  );
};
