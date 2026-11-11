import React from 'react';
import { Logo } from './Logo';
import { ArrowLeft, ArrowRight, Building2, Key, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SeoKeywordsSection } from './SeoKeywordsSection';
import type { AppPageRouteKey } from '../data/seoMetadata';

interface ListPageProps {
  onBackToMain: () => void;
  onSelectSaleRole: (role: 'Owner' | 'Broker') => void;
  onSelectRent: () => void;
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
    <div className="min-h-screen bg-[#f2f7f4] dark:bg-[#061811] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#071f16]/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-emerald-900/60 py-3 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div onClick={onBackToMain} className="cursor-pointer">
            <Logo size="md" darkText={true} />
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
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
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-14 space-y-8">
        {/* Intro Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHindi ? 'नि:शुल्क प्रॉपर्टी लिस्टिंग' : 'Post Property Ad FREE'}</span>
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {isHindi
              ? 'उत्तराखंड में अपनी प्रॉपर्टी बेचें या किराये पर दें'
              : 'Sell or Rent Your Property in Uttarakhand'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-200/80 leading-relaxed">
            {isHindi
              ? 'सीधे वास्तविक खरीदारों और किरायेदारों से जुड़ें — देहरादून, ऋषिकेश, हरिद्वार, नैनीताल और पूरे उत्तराखंड में 0% ब्रोकरेज के साथ।'
              : 'Connect directly with verified buyers and tenants across Dehradun, Rishikesh, Haridwar, Nainital, Mussoorie & Haldwani with zero brokerage fees.'}
          </p>
        </div>

        {/* Two Dedicated Pathway Cards: /list/buy and /list/rent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Sell / List Property for Sale -> /list/buy */}
          <div className="rounded-3xl bg-white dark:bg-[#082218] border-2 border-emerald-200 dark:border-emerald-800/80 p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 hover:border-emerald-500 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <Building2 className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider">
                  /list/buy
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isHindi ? 'बिक्री हेतु लिस्ट करें (Sell Property)' : 'List Property for Sale'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {isHindi
                    ? 'आवासीय प्लॉट, कृषि भूमि, विला, फ्लैट, घर, कॉटेज, होटल या व्यावसायिक प्रॉपर्टी सीधे बेचने के लिए विज्ञापन दें।'
                    : 'Sell residential plots, agricultural land, villas, apartments, houses, Himalayan cottages, shops, or resorts directly with 0% brokerage.'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href="/list/buy"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectSaleRole('Owner');
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
              >
                <span className="flex items-center gap-2.5">
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
                className="w-full py-3 px-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 font-bold text-xs sm:text-sm flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
              >
                <span className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4" />
                  <span>{isHindi ? 'बिल्डर / प्रॉपर्टी डीलर के रूप में लिस्ट करें' : 'List as Verified Builder / Broker'}</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 2: Rent Property / PG -> /list/rent */}
          <div className="rounded-3xl bg-white dark:bg-[#082218] border-2 border-teal-200 dark:border-teal-800/80 p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 hover:border-teal-500 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/30">
                  <Key className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-[11px] font-black uppercase tracking-wider">
                  /list/rent
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isHindi ? 'किराये हेतु लिस्ट करें (Rent / PG)' : 'List Property for Rent / PG'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {isHindi
                    ? 'फ्लैट, कमरा, पीजी (PG in Uttarakhand), होमस्टे, कॉटेज, ऑफिस या दुकान किराये पर देने के लिए नि:शुल्क लिस्ट करें।'
                    : 'Rent out apartments, rooms, PG accommodations in Uttarakhand, mountain homestays, villas, offices, or retail shops directly to verified tenants.'}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="/list/rent"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectRent();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-extrabold text-sm shadow-md flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
              >
                <span className="flex items-center gap-2.5">
                  <Key className="w-4 h-4" />
                  <span>{isHindi ? 'रेंटल प्रॉपर्टी / PG लिस्ट करें' : 'Continue to Rental Listing'}</span>
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
