import React from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onContactClick: () => void;
  searchBarSlot?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({
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
        
        {/* Hero Title with Distinct Devanagari Background Heritage Text */}
        <div className="relative w-full flex flex-col items-center pt-2 sm:pt-4">
          
          {/* Dominant, Authoritative English Title */}
          <h1 className="relative z-10 text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight mb-2 text-center w-full">
            <span className="relative inline-block">
              {/* Distinctly Visible Heritage Devanagari Background Text */}
              <span 
                className="absolute left-1/2 -translate-x-1/2 bottom-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-y-[86%] select-none pointer-events-none z-0 overflow-visible text-center"
                aria-hidden="true"
              >
                <span 
                  className="text-6xl sm:text-8xl md:text-9xl lg:text-[13rem] font-black tracking-normal text-sky-950 dark:text-sky-300 block whitespace-nowrap leading-none"
                  style={{
                    fontFamily: "'Mukta', sans-serif",
                    letterSpacing: '0px',
                    opacity: 0.28,
                    textShadow: '0 2px 16px rgba(12, 74, 110, 0.25)',
                    isolation: 'isolate',
                    WebkitFontSmoothing: 'antialiased',
                  }}
                >
                  उत्तराखण्ड
                </span>
              </span>

              {/* Foreground English Word "Uttarakhand" */}
              <span className="relative z-10 font-serif-luxury block font-black tracking-tight text-[#06182e] dark:text-white drop-shadow-md">
                Uttarakhand
              </span>
            </span>

            <span className="font-serif-luxury block italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-700 to-cyan-600 dark:from-sky-400 dark:via-blue-400 dark:to-cyan-300 mt-1 sm:mt-2 drop-shadow-md">
              Gateways
            </span>
          </h1>
        </div>

        {/* Real Estate Divider with 3D Villa Icon */}
        <div className="flex items-center justify-center gap-3 my-3 sm:my-4 w-full max-w-xs text-sky-700 dark:text-sky-400">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-sky-400 to-sky-700 dark:to-sky-400" />
          <div className="relative p-1.5 sm:p-2 bg-gradient-to-b from-white via-sky-50 to-sky-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-full border border-sky-300/80 dark:border-sky-500/40 shadow-[0_3px_10px_rgba(2,132,199,0.22),inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center">
            {/* 3D Real Estate Villa Icon */}
            <svg viewBox="0 0 32 32" className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="roofRightGrad" x1="13" y1="5" x2="27" y2="12" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
                <linearGradient id="roofFrontTrim" x1="5.5" y1="13" x2="13" y2="6.8" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#e0f2fe" />
                </linearGradient>
                <linearGradient id="frontWallGrad" x1="7" y1="13" x2="19" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
                <linearGradient id="sideWallGrad" x1="19" y1="13" x2="26" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0369a1" />
                  <stop offset="100%" stopColor="#082f49" />
                </linearGradient>
                <linearGradient id="doorGrad" x1="11" y1="17" x2="15" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#082f49" />
                  <stop offset="100%" stopColor="#0c4a6e" />
                </linearGradient>
                <linearGradient id="windowGlow" x1="12" y1="11" x2="14" y2="14" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Ground Shadow */}
              <ellipse cx="16" cy="25" rx="10" ry="2" fill="#0369a1" fillOpacity="0.25" />

              {/* Chimney 3D */}
              <path d="M21 8V4.5H23.5V9.8L21 8Z" fill="#0284c7" />
              <path d="M23.5 4.5V9.8L24.8 9V4.5H23.5Z" fill="#0369a1" />
              <polygon points="20.5,4.5 23.5,4.5 25.2,4.1 22.2,4.1" fill="#7dd3fc" />

              {/* Side Wall (Right facet in 3D perspective) */}
              <polygon points="19,13 26,9.2 26,20 19,23.8" fill="url(#sideWallGrad)" />
              {/* Side Window in 3D */}
              <polygon points="21.5,13.8 24.5,12.2 24.5,15.8 21.5,17.4" fill="#0284c7" opacity="0.75" />
              <polygon points="22,14.2 24,13.1 24,15.3 22,16.4" fill="url(#windowGlow)" opacity="0.9" />

              {/* Front Wall (Facing viewer) */}
              <polygon points="7,13 13,8.5 19,13 19,23.8 7,23.8" fill="url(#frontWallGrad)" />

              {/* Front Door with 3D lintel */}
              <rect x="10.8" y="16.8" width="4.4" height="7" rx="0.6" fill="url(#doorGrad)" />
              <circle cx="14.2" cy="20.5" r="0.6" fill="#facc15" />

              {/* Front Attic Window */}
              <polygon points="11.5,11.5 13,10.2 14.5,11.5 14.5,13.5 11.5,13.5" fill="#082f49" />
              <polygon points="12,11.8 13,10.9 14,11.8 14,13.2 12,13.2" fill="url(#windowGlow)" />

              {/* 3D Roof Right Slope (Main Roof Plane) */}
              <polygon points="13,6.8 20,2.8 27.5,7.8 20.5,12" fill="url(#roofRightGrad)" />

              {/* 3D Roof Front Overhang / Fascia */}
              <polygon points="5.5,13.2 13,6.8 14.2,7.8 6.8,14.2" fill="url(#roofFrontTrim)" />
              <polygon points="13,6.8 20.5,12 19.3,13 13,7.8" fill="#0284c7" />

              {/* Ridge line highlight */}
              <line x1="13" y1="6.8" x2="20" y2="2.8" stroke="#bae6fd" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-sky-400 to-sky-700 dark:to-sky-400" />
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

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md relative z-10">
          {/* Explore Properties - Ocean Blue Gradient Button */}
          <button
            id="hero-explore-btn"
            onClick={onExploreClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            Explore Properties
          </button>

          {/* Contact Us - Frosted Light / Dark Button */}
          <button
            id="hero-contact-btn"
            onClick={onContactClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm sm:text-base border border-sky-200 dark:border-slate-700 hover:border-sky-300 shadow-md backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none"
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
