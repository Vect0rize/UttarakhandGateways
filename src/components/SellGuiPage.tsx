import React from 'react';
import { UploadPropertyModal } from './UploadPropertyModal';
import { Logo } from './Logo';
import { ArrowLeft, Building2, User } from 'lucide-react';
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
  initialRole = 'Owner',
}) => {
  const { isHindi } = useLanguage();
  const effectiveRole: 'Owner' | 'Broker' = initialRole === 'Broker' ? 'Broker' : 'Owner';

  return (
    <div className="min-h-screen bg-[#f2f7f4] dark:bg-[#061811] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#071f16]/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-emerald-900/60 py-3.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div onClick={onBackToMain} className="cursor-pointer">
            <Logo size="md" darkText={true} />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/80 px-3.5 py-1.5 rounded-full border border-emerald-300 dark:border-emerald-800">
              {effectiveRole === 'Broker' ? (
                <>
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>{isHindi ? 'ब्रोकर लिस्टिंग GUI' : 'Broker Listing GUI'}</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>{isHindi ? 'सीधे मालिक लिस्टिंग GUI' : 'Direct Owner Listing GUI'}</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onBackToMain}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
              title={isHindi ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Back to Home'}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-white" />
              <span>{isHindi ? 'वापस (Back)' : 'Back'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container directly rendering Upload Property GUI */}
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
          initialSellerType={effectiveRole}
        />
      </main>

    </div>
  );
};
