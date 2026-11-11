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
      {/* Solid Color Backdrop: Oaken Chalk Ivory in Light Mode & Deep Forest Evergreen in Dark Mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#eaece8] via-[#f2f3f0] to-[#f1f2ef] dark:from-[#0E3A2B] dark:via-[#082F21] dark:to-[#032D1F] z-0 overflow-hidden" />

      {/* Main Hero Content Container */}
      <div className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center w-full">
        
        {/* Hero Title: Refined proportional scale */}
        <div className="relative w-full flex flex-col items-center pt-1 sm:pt-2">
          <h1 className="font-serif-luxury text-[22px] sm:text-3xl md:text-[34px] lg:text-[40px] font-black tracking-tight text-[#0E3A2B] dark:text-[#F4F3EF] drop-shadow-md leading-tight text-center flex items-center justify-center gap-1.5 sm:gap-3 whitespace-nowrap">
            <span>Uttarakhand</span>
            <span className="italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0E3A2B] via-[#32463D] to-[#8E725E] dark:from-[#E0C8B8] dark:via-[#C2A691] dark:to-[#AA8F7C] drop-shadow-md">
              Gateways
            </span>
          </h1>
        </div>

        {/* Text "REAL ESTATE" with circles on both sides */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 my-2 sm:my-2.5 mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0E3A2B] dark:bg-[#AA8F7C] shrink-0 shadow-xs" />
          
          <span className="font-cinzel tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs font-extrabold text-[#0E3A2B] dark:text-[#D4B9A6] uppercase whitespace-nowrap px-1">
            {isHindi ? 'रियल एस्टेट' : 'REAL ESTATE'}
          </span>

          <span className="w-1.5 h-1.5 rounded-full bg-[#0E3A2B] dark:bg-[#AA8F7C] shrink-0 shadow-xs" />
        </div>

        {/* Subtitle Description (Semantic H2 for SEO hierarchy) */}
        <div className="w-full max-w-3xl mx-auto mb-3 sm:mb-4 px-3 sm:px-4 relative z-20">
          <h2 className="font-serif-luxury italic text-sm sm:text-base md:text-lg lg:text-xl text-[#0E3A2B] dark:text-[#F4F3EF] font-medium leading-tight tracking-wide text-center drop-shadow-xs mb-1">
            {isHindi ? 'पहाड़ों में आपके सपनों का आशियाना' : 'Your Gateway To Mountains'}
          </h2>
          <p className="text-xs sm:text-sm text-[#495A50] dark:text-[#C7D3CC] max-w-xl mx-auto font-normal">
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
            className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#0E3A2B] via-[#134232] to-[#0C3628] hover:from-[#0C3628] hover:to-[#032D1F] text-[#F4F3EF] font-extrabold text-sm sm:text-base shadow-lg shadow-[#032D1F]/30 border border-[#AA8F7C]/40 hover:scale-[1.03] active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#AA8F7C] whitespace-nowrap"
          >
            <span>{isHindi ? 'खरीदें' : 'Buy'}</span>
            <span className="hidden md:inline">{isHindi ? ' प्रॉपर्टी' : ' Property'}</span>
          </button>

          {/* 2. Rent */}
          <button
            id="hero-rent-btn"
            onClick={onRentClick}
            className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#32463D] via-[#2A382B] to-[#1D2C22] hover:from-[#2A382B] hover:to-[#122018] text-[#F4F3EF] font-extrabold text-sm sm:text-base border border-[#AA8F7C]/35 hover:border-[#C2A691]/60 shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#AA8F7C] whitespace-nowrap"
          >
            <span>{isHindi ? 'किराया' : 'Rent'}</span>
            <span className="hidden md:inline">{isHindi ? ' प्रॉपर्टी' : ' Property'}</span>
          </button>

          {/* 3. Post Ad (with small FREE mark) */}
          <button
            id="hero-post-ad-btn"
            onClick={onSellClick}
            className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 rounded-full font-extrabold text-sm sm:text-base border shadow-md backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 bg-[#F4F4F1]/95 dark:bg-[#0C3628] hover:bg-white dark:hover:bg-[#134433] text-[#0E3A2B] dark:text-[#F4F3EF] border-[#CDD6D0] dark:border-[#AA8F7C]/40 hover:border-[#AA8F7C] focus:ring-[#AA8F7C] whitespace-nowrap"
            title={isHindi ? 'मुफ्त विज्ञापन पोस्ट करें / प्रॉपर्टी लिस्ट करें' : 'Post Ad / List Property (Free)'}
          >
            <span className="text-[#0E3A2B] dark:text-[#C2A691] text-base leading-none font-black">+</span>
            <span>{isHindi ? 'विज्ञापन दें' : 'Post Ad'}</span>
            <span className="bg-[#C2A691] text-[#032D1F] text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
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
          <span className="inline-flex items-center gap-1.5 bg-[#F7F7F4]/95 dark:bg-[#0C3628] border border-[#D0D7D2] dark:border-[#32463D] text-[#0E3A2B] dark:text-[#E5EBE7] px-3.5 py-1 rounded-full shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0E3A2B] dark:text-[#C2A691]" />
            {isHindi ? 'सीधी खरीद हेतु फ्लैट्स, प्लॉट्स व विला' : t('hero.assurance1')}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-[#E9EAE6]/95 dark:bg-[#2A382B] border border-[#D0D7D2] dark:border-[#AA8F7C]/35 text-[#0E3A2B] dark:text-[#E5EBE7] px-3.5 py-1 rounded-full shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0E3A2B] dark:text-[#C2A691]" />
            {isHindi ? '100% स्पष्ट मालिकाना हक और तत्काल रजिस्ट्री' : t('hero.assurance2')}
          </span>
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
