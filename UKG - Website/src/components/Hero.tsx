import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  onSellClick: () => void;
  onRentalClick?: () => void;
  isRentActive?: boolean;
  onBuyClick?: () => void;
  onRentClick?: () => void;
  onExploreClick?: () => void;
  onContactClick?: () => void;
  searchBarSlot?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({
  onSellClick,
  onRentalClick,
  isRentActive = false,
  onBuyClick,
  onRentClick,
  onExploreClick,
  onContactClick,
  searchBarSlot,
}) => {
  const { t, isHindi } = useLanguage();

  return (
    <section 
      id="hero" 
      className="relative flex flex-col justify-center items-center text-center pt-24 sm:pt-28 pb-12 sm:pb-16 overflow-visible transition-colors"
    >
      {/* Solid Color Backdrop: Mountain Mist Green in Light Mode & Himalayan Pine Night in Dark Mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#e8f3ec] via-[#f0f7f3] to-[#f2f7f4] dark:from-[#071f17] dark:via-[#09251c] dark:to-[#071a14] z-0 overflow-hidden" />

      {/* Main Hero Content Container */}
      <div className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center w-full">
        
        {/* Hero Title: Refined proportional scale */}
        <div className="relative w-full flex flex-col items-center pt-1 sm:pt-2">
          <h1 className="font-serif-luxury text-[22px] sm:text-3xl md:text-[34px] lg:text-[40px] font-black tracking-tight text-[#0a271c] dark:text-white drop-shadow-md leading-tight text-center flex items-center justify-center gap-1.5 sm:gap-3 whitespace-nowrap">
            <span>Uttarakhand</span>
            <span className="italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-700 to-green-600 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-300 drop-shadow-md">
              Gateways
            </span>
          </h1>
        </div>

        {/* Text "REAL ESTATE" with circles on both sides */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 my-2 sm:my-2.5 mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0 shadow-xs" />
          
          <span className="font-cinzel tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs font-extrabold text-[#0a271c] dark:text-emerald-200 uppercase whitespace-nowrap px-1">
            {isHindi ? 'रियल एस्टेट' : 'REAL ESTATE'}
          </span>

          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0 shadow-xs" />
        </div>

        {/* Subtitle Description (Semantic H2 for SEO hierarchy) */}
        <div className="w-full max-w-3xl mx-auto mb-3 sm:mb-4 px-3 sm:px-4 relative z-20">
          <h2 className="font-serif-luxury italic text-sm sm:text-base md:text-lg lg:text-xl text-[#0a271c] dark:text-emerald-100 font-medium leading-tight tracking-wide text-center drop-shadow-xs mb-1">
            {isHindi ? 'पहाड़ों में आपके सपनों का आशियाना' : 'Your Gateway To Mountains'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-200/80 max-w-xl mx-auto font-normal">
            {isHindi 
              ? '0% ब्रोकरेज के साथ सीधे संपत्ति मालिकों और सत्यापित बिल्डरों से आवासीय प्लॉट, फ्लैट और विला खोजें।' 
              : 'Discover verified residential plots, luxury flats, and villas directly with 0% brokerage.'
            }
          </p>
        </div>

        {/* CTA Buttons Sequence: Buy, Rent, Post Ad (with FREE mark) */}
        <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-md mb-5 sm:mb-6 relative z-30">
          {/* 1. Buy */}
          <button
            id="hero-buy-btn"
            onClick={onBuyClick || onExploreClick || onContactClick}
            className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.03] active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 whitespace-nowrap"
          >
            <span>{isHindi ? 'खरीदें' : 'Buy'}</span>
            <span className="hidden md:inline">{isHindi ? ' प्रॉपर्टी' : ' Property'}</span>
          </button>

          {/* 2. Rent */}
          <button
            id="hero-rent-btn"
            onClick={onRentClick}
            className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-teal-700 via-emerald-800 to-[#07241a] hover:from-teal-800 hover:to-emerald-900 text-emerald-100 font-extrabold text-sm sm:text-base border border-teal-500/50 hover:border-teal-400 shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-teal-400 whitespace-nowrap"
          >
            <span>{isHindi ? 'किराया' : 'Rent'}</span>
            <span className="hidden md:inline">{isHindi ? ' प्रॉपर्टी' : ' Property'}</span>
          </button>

          {/* 3. Post Ad (with small FREE mark) */}
          <button
            id="hero-post-ad-btn"
            onClick={onSellClick}
            className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 rounded-full font-extrabold text-sm sm:text-base border shadow-md backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 bg-white/95 dark:bg-[#071f17] hover:bg-white dark:hover:bg-[#0b2d22] text-slate-800 dark:text-slate-100 border-emerald-300 dark:border-emerald-700/80 hover:border-emerald-500 focus:ring-emerald-400 whitespace-nowrap"
            title={isHindi ? 'मुफ्त विज्ञापन पोस्ट करें / प्रॉपर्टी लिस्ट करें' : 'Post Ad / List Property (Free)'}
          >
            <span className="text-emerald-600 dark:text-emerald-400 text-base leading-none font-black">+</span>
            <span>{isHindi ? 'विज्ञापन दें' : 'Post Ad'}</span>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              FREE
            </span>
          </button>
        </div>

        {/* Small Menu (Locations & Property Type dropboxes) & Search Bar below */}
        {searchBarSlot && (
          <div className="w-full mb-5 sm:mb-6 relative z-40">
            {searchBarSlot}
          </div>
        )}

        {/* Non-Rent Real Estate Assurance Pill: "100% Clear Title & Immediate Registry" */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium relative z-20 pb-4">
          <span className="inline-flex items-center gap-1.5 bg-white/90 dark:bg-[#082218] border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 px-3.5 py-1 rounded-full shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {isHindi ? 'सीधी खरीद हेतु फ्लैट्स, प्लॉट्स व विला' : t('hero.assurance1')}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3.5 py-1 rounded-full shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {isHindi ? '100% स्पष्ट मालिकाना हक और तत्काल रजिस्ट्री' : t('hero.assurance2')}
          </span>
        </div>

      </div>

      {/* Stylized Mountain Geometric Bottom Divider - positioned behind dropdowns */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none overflow-hidden leading-none">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-8 sm:h-12 text-[#f2f7f4] dark:text-[#071a14] fill-current"
        >
          <path d="M0,0 L150,60 L300,10 L450,75 L600,20 L750,80 L900,15 L1050,65 L1200,5 L1200,120 L0,120 Z" />
        </svg>
      </div>

    </section>
  );
};
