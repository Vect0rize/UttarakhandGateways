import React from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onSellClick: () => void;
  onExploreClick?: () => void;
  onContactClick: () => void;
  searchBarSlot?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({
  onSellClick,
  onExploreClick,
  onContactClick,
  searchBarSlot,
}) => {
  return (
    <section 
      id="hero" 
      className="relative min-h-[96vh] flex flex-col justify-between items-center text-center pt-28 sm:pt-36 pb-12 overflow-hidden transition-colors"
    >
      {/* Mountain Backdrop with Light Ocean Blue / Dark Himalayan Night Glow */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-105 transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2400&q=85')`,
        }}
      >
        {/* Layered light ocean blue gradient overlays with gentle bottom blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900/25 via-sky-100/40 to-[#eef6fb] dark:from-slate-950/90 dark:via-slate-900/85 dark:to-[#071526]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-400/15 via-transparent to-[#eef6fb]/95 dark:from-sky-500/10 dark:to-[#071526]" />
      </div>

      {/* Main Hero Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center my-auto w-full">
        
        {/* Hero Title: Single Line at the Top without Hindi text */}
        <div className="relative w-full flex flex-col items-center pt-2 sm:pt-4">
          <h1 className="font-serif-luxury text-3xl min-[360px]:text-4xl min-[410px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight text-[#081e36] dark:text-white drop-shadow-md leading-none text-center flex items-center justify-center gap-2 sm:gap-4 whitespace-nowrap">
            <span>Uttarakhand</span>
            <span className="italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-700 to-cyan-600 dark:from-sky-400 dark:via-blue-400 dark:to-cyan-300 drop-shadow-md">
              Gateways
            </span>
          </h1>
        </div>



        {/* Subtitle Description - Guaranteed 2 lines on mobile with 100% matched typography */}
        <div className="max-w-3xl mx-auto mb-5 sm:mb-6 px-3 sm:px-4 relative z-20">
          <p className="font-desc-luxury text-base min-[375px]:text-[17px] sm:text-2xl md:text-3xl lg:text-[2.1rem] text-[#06182e] dark:text-white font-medium sm:font-semibold leading-snug sm:leading-relaxed tracking-normal text-center drop-shadow-md">
            <span className="block whitespace-nowrap">
              Explore your dream property
            </span>
            <span className="block mt-1 sm:mt-1.5 whitespace-nowrap">
              in Uttarakhand's most beautiful destinations.
            </span>
          </p>
        </div>

        {/* Small Menu (Locations & Property Type dropboxes) & Search Bar below */}
        {searchBarSlot && (
          <div className="w-full mb-6 sm:mb-8 relative z-30">
            {searchBarSlot}
          </div>
        )}

        {/* CTA Buttons: Sell Property & Contact Us */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md relative z-10">
          {/* Sell Property - Vibrant Emerald/Teal E-commerce Button */}
          <button
            id="hero-sell-btn"
            onClick={onSellClick}
            className="w-full sm:w-auto px-8 sm:px-9 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-extrabold text-base shadow-xl shadow-teal-600/30 hover:shadow-teal-600/50 hover:scale-[1.03] active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <span className="text-emerald-200 text-lg leading-none">✦</span>
            <span>Sell Property</span>
          </button>

          {/* Contact Us - Frosted Light / Dark Button */}
          <button
            id="hero-contact-btn"
            onClick={onContactClick}
            className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm sm:text-base border border-sky-200/80 dark:border-slate-700 hover:border-sky-300 shadow-xs backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none"
          >
            Contact Us
          </button>
        </div>

        {/* Non-Rent Real Estate Assurance Pill: "100% Clear Title & Immediate Registry" */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-medium relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 border border-sky-200 dark:border-slate-700 text-sky-900 dark:text-sky-300 px-3.5 py-1 rounded-full shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            Flats, Plots & Villas for Direct Purchase
          </span>
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3.5 py-1 rounded-full shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            100% Clear Title & Immediate Registry
          </span>
        </div>

      </div>

      {/* Scroll Down Prompt */}
      <div className="relative z-10 mt-6 flex flex-col items-center">
        <button
          onClick={onExploreClick}
          className="group flex flex-col items-center text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer focus:outline-none"
          aria-label="Scroll to properties list"
        >
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold mb-1 text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400">
            SCROLL
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce text-sky-600 dark:text-sky-400" />
        </button>
      </div>

      {/* Stylized Mountain Geometric Bottom Divider */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none overflow-hidden leading-none">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-8 sm:h-12 text-[#eef6fb] dark:text-[#071526] fill-current"
        >
          <path d="M0,0 L150,60 L300,10 L450,75 L600,20 L750,80 L900,15 L1050,65 L1200,5 L1200,120 L0,120 Z" />
        </svg>
      </div>

    </section>
  );
};
