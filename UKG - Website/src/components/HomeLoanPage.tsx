import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from './Logo';
import { HomeLoanCalculator } from './HomeLoanCalculator';
import { getPageSeoMeta } from '../data/seoMetadata';

interface HomeLoanPageProps {
  onBackToMain: () => void;
  onNavigatePage?: (page: string) => void;
  onNavigateCity?: (city: string) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const HomeLoanPage: React.FC<HomeLoanPageProps> = ({ onBackToMain }) => {
  const { isHindi } = useLanguage();

  useEffect(() => {
    const seo = getPageSeoMeta('home-loan');
    document.title = seo.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', seo.description);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#f1f2ef] dark:bg-[#032D1F] text-[#12231a] dark:text-[#F4F3EF] flex flex-col transition-colors">
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 dark:bg-[#0E3A2B]/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-[#32463D]/70 py-3.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div onClick={onBackToMain} className="cursor-pointer">
            <Logo size="md" darkText={true} />
          </div>
          <button
            type="button"
            onClick={onBackToMain}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isHindi ? 'वापस' : 'Back'}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <HomeLoanCalculator initialPrice={5000000} />
      </main>
    </div>
  );
};
