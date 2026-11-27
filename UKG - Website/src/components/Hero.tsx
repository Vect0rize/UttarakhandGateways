import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isNativeAndroidApp } from '../config/apiConfig';

interface HeroProps {
  onSellClick: () => void;
  onRentalClick?: () => void;
  isRentActive?: boolean;
  onBuyClick?: () => void;
  onRentClick?: () => void;
  onExploreClick?: () => void;
  onContactClick?: () => void;
  onPostRequirementClick?: () => void;
  onAssuranceClick?: () => void;
  searchBarSlot?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({
  onSellClick,
  onBuyClick,
  onRentClick,
  onExploreClick,
  onContactClick,
  onAssuranceClick,
  searchBarSlot,
}) => {
  const { isHindi } = useLanguage();

  return (
    <section 
      id="hero" 
      className="relative flex flex-col justify-center items-center text-center pt-24 sm:pt-28 pb-16 sm:pb-20 overflow-visible transition-colors"
    >
      {/* Solid Color Backdrop: Oaken Chalk Ivory in Light Mode & Deep Forest Evergreen in Dark Mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#eaece8] via-[#f2f3f0] to-[#f1f2ef] dark:from-[#0E3A2B] dark:via-[#082F21] dark:to-[#032D1F] z-0 overflow-hidden" />

      {/* Main Hero Content Container */}
      <div className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center w-full">
        
        {/* Hero Title: Balanced prominent scale across mobile and desktop */}
        <div className="relative w-full flex flex-col items-center pt-1 sm:pt-2">
          <h1 className="font-serif-luxury text-[26px] min-[375px]:text-[30px] sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[0.025em] text-[#0E3A2B] dark:text-[#F4F3EF] drop-shadow-md leading-tight text-center flex items-center justify-center gap-1.5 sm:gap-3 whitespace-nowrap">
            <span>Uttarakhand</span>
            <span className="italic text-[#AA8F7C] dark:text-[#C2A691]">
              Gateways
            </span>
          </h1>
        </div>

        {/* Text "REAL ESTATE" with circles on both sides */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 my-2.5 sm:my-3 mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0E3A2B] dark:bg-[#AA8F7C] shrink-0 shadow-xs" />
          
          <span className="font-cinzel tracking-[0.3em] sm:tracking-[0.4em] text-[11px] sm:text-xs md:text-sm font-extrabold text-[#0E3A2B] dark:text-[#D4B9A6] uppercase whitespace-nowrap px-1">
            {isHindi ? 'रियल एस्टेट' : 'REAL ESTATE'}
          </span>

          <span className="w-1.5 h-1.5 rounded-full bg-[#0E3A2B] dark:bg-[#AA8F7C] shrink-0 shadow-xs" />
        </div>

        {/* Subtitle Tagline (Semantic H2 for SEO hierarchy) */}
        <div className="w-full max-w-3xl mx-auto mb-4 sm:mb-5 px-3 sm:px-4 relative z-20">
          <h2 className="font-serif-luxury italic text-base sm:text-xl md:text-2xl lg:text-[26px] text-[#0E3A2B] dark:text-[#F4F3EF] font-medium leading-tight tracking-wide text-center drop-shadow-xs">
            {isHindi ? 'पहाड़ों में आपके सपनों का आशियाना' : 'Your Gateway To Mountains'}
          </h2>
        </div>

        {/* CTA Buttons Sequence: Buy, Rent, Post Ad (with FREE mark) */}
        <div className="flex flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-md mb-5 sm:mb-6 relative z-30">
          {/* 1. Buy */}
          <a
            id="hero-buy-btn"
            href="/buy"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                e.preventDefault();
                const action = onBuyClick || onExploreClick || onContactClick;
                if (action) action();
              }
            }}
            className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#0E3A2B] via-[#134232] to-[#0C3628] hover:from-[#0C3628] hover:to-[#032D1F] text-[#F4F3EF] font-extrabold text-sm sm:text-base shadow-lg shadow-[#032D1F]/30 border border-[#AA8F7C]/40 hover:scale-[1.03] active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#AA8F7C] whitespace-nowrap"
          >
            <span>{isHindi ? 'खरीदें' : 'Buy'}</span>
            <span className="hidden md:inline">{isHindi ? ' प्रॉपर्टी' : ' Property'}</span>
          </a>

          {/* 2. Rent */}
          <a
            id="hero-rent-btn"
            href="/rent"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0 && onRentClick) {
                e.preventDefault();
                onRentClick();
              }
            }}
            className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#32463D] via-[#2A382B] to-[#1D2C22] hover:from-[#2A382B] hover:to-[#122018] text-[#F4F3EF] font-extrabold text-sm sm:text-base border border-[#AA8F7C]/35 hover:border-[#C2A691]/60 shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#AA8F7C] whitespace-nowrap"
          >
            <span>{isHindi ? 'किराया' : 'Rent'}</span>
            <span className="hidden md:inline">{isHindi ? ' प्रॉपर्टी' : ' Property'}</span>
          </a>

          {/* 3. Sell Property (with small FREE mark) */}
          <a
            id="hero-post-ad-btn"
            href="/list/buy"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0 && onSellClick) {
                e.preventDefault();
                onSellClick();
              }
            }}
            className="flex-1 px-3 sm:px-6 py-3 sm:py-3.5 rounded-full font-extrabold text-xs sm:text-base border shadow-md backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 bg-[#F4F4F1]/95 dark:bg-[#0C3628] hover:bg-white dark:hover:bg-[#134433] text-[#0E3A2B] dark:text-[#F4F3EF] border-[#CDD6D0] dark:border-[#AA8F7C]/40 hover:border-[#AA8F7C] focus:ring-[#AA8F7C] whitespace-nowrap"
            title={isHindi ? 'प्रॉपर्टी लिस्ट करें' : 'Sell Property'}
          >
            <span className="text-[#0E3A2B] dark:text-[#C2A691] text-base leading-none font-black">+</span>
            <span>{isHindi ? 'प्रॉपर्टी बेचें' : 'Sell Property'}</span>
            <span className="bg-[#C2A691] text-[#032D1F] text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              FREE
            </span>
          </a>
        </div>

        {/* Small Menu (Locations & Property Type dropboxes) & Search Bar below */}
        {searchBarSlot && (
          <div className="w-full mb-2.5 sm:mb-3 relative z-40">
            {searchBarSlot}
          </div>
        )}

        {/* UKG Assurance Info Button Below Search Bar */}
        <div className="w-full max-w-2xl mx-auto flex justify-center mt-3.5 sm:mt-4 mb-2 px-1 relative z-30">
          <a
            id="hero-ukg-assurance-btn"
            href="/ukg-assurance"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0 && onAssuranceClick) {
                e.preventDefault();
                onAssuranceClick();
              }
            }}
            className="group w-full sm:w-auto sm:min-w-[460px] inline-flex items-center justify-between gap-3 sm:gap-4 px-3.5 sm:px-4 py-2.5 rounded-2xl sm:rounded-full bg-gradient-to-r from-[#082A1E] via-[#0E3A2B] to-[#0A3123] dark:from-[#062117] dark:via-[#0D3829] dark:to-[#08291D] hover:from-[#0B3325] hover:via-[#124534] hover:to-[#0E3A2B] text-[#FAF9F6] border border-[#C2A691]/65 hover:border-[#C2A691] shadow-lg shadow-[#032D1F]/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 cursor-pointer no-underline text-left"
            title={
              isHindi
                ? 'यूकेजी एश्योरेंस: खरीदने से पहले प्रॉपर्टी दस्तावेज़ और साइट की जांच'
                : 'UKG Assurance: Verify Property Documents & Site Before You Buy'
            }
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-full bg-gradient-to-br from-[#D4B9A6] to-[#B6967E] text-[#032D1F] flex items-center justify-center shadow-sm shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.3]" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-extrabold tracking-wide text-white">
                    {isHindi ? 'यूकेजी एश्योरेंस' : 'UKG Assurance'}
                  </span>
                  <span className="hidden min-[400px]:inline-block px-2 py-0.5 rounded-full bg-white/10 border border-[#C2A691]/40 text-[9px] font-extrabold uppercase tracking-wider text-[#E8D5C6]">
                    {isHindi ? 'दस्तावेज़ व साइट जांच' : 'Pre-Purchase Review'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-100/90 font-medium leading-snug truncate">
                  {isHindi
                    ? 'खरीदने से पहले प्रॉपर्टी कागज़ात व साइट की जांच कराएं'
                    : 'Verify Property Documents & Site Before You Buy'}
                </p>
              </div>
            </div>

            <span className="shrink-0 inline-flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-xl sm:rounded-full bg-[#C2A691] group-hover:bg-[#d6bda9] text-[#032D1F] text-[11px] sm:text-xs font-extrabold shadow-xs transition-colors">
              <span>{isHindi ? 'जानें' : 'Explore'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </a>
        </div>

      </div>

      {/* Stylized Mountain Geometric Bottom Divider - positioned behind dropdowns */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none overflow-hidden leading-none">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-8 sm:h-12 text-[#f1f2ef] dark:text-[#032D1F] fill-current"
        >
          <path d="M0,0 L150,60 L300,10 L450,75 L600,20 L750,80 L900,15 L1050,65 L1200,5 L1200,120 L0,120 Z" />
        </svg>
      </div>

    </section>
  );
};
