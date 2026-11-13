import React from 'react';
import { Logo } from './Logo';
import { ArrowLeft, ArrowRight, Building2, Key, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SeoKeywordsSection } from './SeoKeywordsSection';
import type { AppPageRouteKey } from '../data/seoMetadata';

interface ListPageProps {
  onBackToMain: () => void;
  onSelectSaleRole: (role: 'Owner' | 'Broker') => void;
  onSelectRent: (role?: 'Owner' | 'Broker') => void;
  onNavigatePage?: (page: AppPageRouteKey, slug?: string) => void;
  onNavigateCity?: (city: string) => void;
}

export const ListPage: React.FC<ListPageProps> = ({
  onBackToMain,
  onSelectSaleRole,
  onSelectRent,
  onNavigatePage,
  onNavigateCity,
}) => {
  const { isHindi } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f1f2ef] dark:bg-[#032D1F] text-[#0E3A2B] dark:text-[#F4F3EF] flex flex-col transition-colors">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 dark:bg-[#0E3A2B]/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-[#32463D]/70 py-3 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div onClick={onBackToMain} className="cursor-pointer">
            <Logo size="md" darkText={true} />
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#0C3628] text-emerald-800 dark:text-[#C2A691] text-xs font-bold border border-emerald-200 dark:border-[#32463D]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-[#C2A691]" />
              <span>{isHindi ? '100% नि:शुल्क विज्ञापन • 0% ब्रोकरेज' : '100% Free Listing • 0% Brokerage'}</span>
            </span>

            <button
              type="button"
              onClick={onBackToMain}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-white" />
              <span>{isHindi ? 'वापस (Back)' : 'Back'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Intro Hero */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#C2A691] text-[#032D1F] text-[11px] font-black uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHindi ? 'नि:शुल्क प्रॉपर्टी लिस्टिंग' : 'Post Property Ad FREE'}</span>
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-black text-[#0E3A2B] dark:text-[#F4F3EF] tracking-tight">
            {isHindi
              ? 'उत्तराखंड में अपनी प्रॉपर्टी बेचें या किराये पर दें'
              : 'Sell or Rent Your Property in Uttarakhand'}
          </h1>
        </div>

        {/* Two Compact Pathway Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Card 1: Sell / List Property for Sale -> /list/buy */}
          <div className="rounded-2xl bg-[#FAF9F6] dark:bg-[#0C3628] border border-emerald-200 dark:border-[#32463D] p-5 sm:p-6 shadow-lg flex flex-col justify-between space-y-4 hover:border-emerald-500 dark:hover:border-[#AA8F7C] transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0E3A2B] to-[#32463D] text-white flex items-center justify-center shrink-0 shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#0E3A2B] dark:text-[#F4F3EF] leading-tight">
                {isHindi ? 'प्रॉपर्टी बेचने हेतु विज्ञापन दें' : 'Post Ad to Sell Property'}
              </h2>
            </div>

            <div className="space-y-2">
              <a
                href="/list/buy"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectSaleRole('Owner');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0E3A2B] to-[#32463D] hover:from-[#164A37] hover:to-[#3c5348] text-white font-extrabold text-xs sm:text-sm shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
              >
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{isHindi ? 'सीधे मालिक के रूप में बेचें (Owner)' : 'Sell as Direct Owner'}</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="/list/buy"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectSaleRole('Broker');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-[#072B1F] hover:bg-emerald-100 dark:hover:bg-[#0E3A2B] text-[#0E3A2B] dark:text-[#E5D4C8] border border-emerald-200 dark:border-[#32463D] font-bold text-xs sm:text-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{isHindi ? 'ब्रोकर के रूप में लिस्ट करें' : 'List as Broker'}</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 2: Rent Property / PG -> /list/rent */}
          <div className="rounded-2xl bg-[#FAF9F6] dark:bg-[#0C3628] border border-emerald-200 dark:border-[#32463D] p-5 sm:p-6 shadow-lg flex flex-col justify-between space-y-4 hover:border-emerald-500 dark:hover:border-[#AA8F7C] transition-all">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#32463D] to-[#0E3A2B] text-white flex items-center justify-center shrink-0 shadow-md">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#0E3A2B] dark:text-[#F4F3EF] leading-tight">
                {isHindi ? 'किराये हेतु लिस्ट करें (Rent / PG)' : 'List Property for Rent / PG'}
              </h2>
            </div>

            <div className="space-y-2">
              <a
                href="/list/rent"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectRent('Owner');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#32463D] to-[#0E3A2B] hover:from-[#3d544a] hover:to-[#164A37] text-white font-extrabold text-xs sm:text-sm shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
              >
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  <span>{isHindi ? 'सीधे मालिक के रूप में किराये पर दें' : 'Rent as Direct Owner'}</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="/list/rent"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectRent('Broker');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 dark:bg-[#072B1F] hover:bg-emerald-100 dark:hover:bg-[#0E3A2B] text-[#0E3A2B] dark:text-[#E5D4C8] border border-emerald-200 dark:border-[#32463D] font-bold text-xs sm:text-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{isHindi ? 'ब्रोकर के रूप में लिस्ट करें' : 'List as Broker'}</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <SeoKeywordsSection onNavigatePage={onNavigatePage} onNavigateCity={onNavigateCity} />
    </div>
  );
};
