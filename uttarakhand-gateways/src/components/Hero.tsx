import React from 'react';
import { MapPin, Home, Star, ChevronDown, Compass, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onContactClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  onContactClick,
}) => {
  return (
    <section 
      id="hero" 
      className="relative min-h-[96vh] flex flex-col justify-between items-center text-center pt-28 sm:pt-36 pb-12 overflow-hidden"
    >
      {/* Dynamic Himalayan Mountain Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-105 transition-transform duration-1000 ease-out"
        style={{
          // Authentic majestic snow-clad Himalayan mountain peaks at sunrise
          backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2400&q=85')`,
        }}
      >
        {/* Layered cinematic mountain gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071018]/80 via-[#0c1a24]/50 to-[#08121a]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-[#050d14]/85" />
      </div>

      {/* Main Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center my-auto">
        
        {/* Hero Title with Crisp Devanagari Background Watermark */}
        <div className="relative w-full flex flex-col items-center pt-2 sm:pt-4">
          {/* Crisp Heritage Devanagari Watermark in Background - Shifted upwards, uniform opacity without contour striping */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[82%] sm:-translate-y-[88%] z-0 select-none pointer-events-none text-amber-300 font-extrabold text-6xl sm:text-8xl md:text-9xl lg:text-[11.5rem] whitespace-nowrap leading-none"
            style={{
              fontFamily: "'Mukta', sans-serif",
              letterSpacing: '0px',
              opacity: 0.14,
              isolation: 'isolate',
              WebkitFontSmoothing: 'antialiased',
            }}
            aria-hidden="true"
          >
            उत्तराखण्ड
          </div>

          <h1 className="relative z-10 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-1 drop-shadow-2xl text-center">
            <span className="block font-serif-luxury font-bold tracking-wide">
              Uttarakhand
            </span>
            <span className="block font-serif-luxury italic font-medium text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 mt-1 sm:mt-2 drop-shadow-lg">
              Gateways
            </span>
          </h1>
        </div>

        {/* Mountain Peak Decorative Divider */}
        <div className="flex items-center justify-center gap-3 my-4 sm:my-5 w-full max-w-xs text-amber-400/80">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-400/40 to-amber-400/80" />
          {/* Peak Silhouette */}
          <div className="relative p-1 bg-amber-400/10 rounded-full border border-amber-400/30">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-amber-300">
              <path d="M4 19L12 6L16 12L18 9L21 19H4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" fillOpacity="0.4" />
            </svg>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-400/40 to-amber-400/80" />
        </div>

        {/* Subtitle Description */}
        <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-3xl mx-auto font-light leading-relaxed mb-8 drop-shadow-md">
          Discover handpicked properties nestled in the majestic Himalayas — from serene forest retreats to riverside havens across{' '}
          <strong className="font-semibold text-amber-300">Uttarakhand's</strong> most breathtaking destinations.
        </p>

        {/* Quick Stats matching user's screenshot */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 sm:mb-10 w-full max-w-xl mx-auto">
          {/* Properties Stat */}
          <div className="glass-panel-light rounded-2xl px-3 sm:px-4 py-3 border border-white/10 shadow-lg text-center backdrop-blur-md hover:border-amber-400/30 transition-all">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-0.5">
              <Home className="w-4 h-4" />
              <span className="text-lg sm:text-2xl font-bold text-white">12+</span>
            </div>
            <div className="text-[10px] sm:text-xs uppercase font-medium tracking-wider text-slate-300">
              Properties
            </div>
          </div>

          {/* Locations Stat */}
          <div className="glass-panel-light rounded-2xl px-3 sm:px-4 py-3 border border-white/10 shadow-lg text-center backdrop-blur-md hover:border-amber-400/30 transition-all">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-0.5">
              <MapPin className="w-4 h-4" />
              <span className="text-lg sm:text-2xl font-bold text-white">8</span>
            </div>
            <div className="text-[10px] sm:text-xs uppercase font-medium tracking-wider text-slate-300">
              Locations
            </div>
          </div>

          {/* Rating Stat */}
          <div className="glass-panel-light rounded-2xl px-3 sm:px-4 py-3 border border-white/10 shadow-lg text-center backdrop-blur-md hover:border-amber-400/30 transition-all">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-0.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-lg sm:text-2xl font-bold text-white">4.9</span>
            </div>
            <div className="text-[10px] sm:text-xs uppercase font-medium tracking-wider text-slate-300">
              Avg. Rating
            </div>
          </div>
        </div>

        {/* CTA Buttons matching user's inspiration */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          {/* Explore Properties - Bright Orange Button */}
          <button
            id="hero-explore-btn"
            onClick={onExploreClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-sm sm:text-base shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            Explore Properties
          </button>

          {/* Contact Us - Glassmorphic Dark Button */}
          <button
            id="hero-contact-btn"
            onClick={onContactClick}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 text-slate-100 font-semibold text-sm sm:text-base border border-white/20 hover:border-white/40 shadow-lg backdrop-blur-md hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none"
          >
            Contact Us
          </button>
        </div>

        {/* Non-Rent Real Estate Assurance Pill */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300/90 font-medium">
          <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Flats, Plots & Villas for Direct Purchase
          </span>
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Freehold Title & Immediate Registry
          </span>
        </div>

      </div>

      {/* Scroll Down Prompt matching inspiration */}
      <div className="relative z-10 mt-6 flex flex-col items-center">
        <button
          onClick={onExploreClick}
          className="group flex flex-col items-center text-slate-400 hover:text-amber-400 transition-colors cursor-pointer focus:outline-none"
          aria-label="Scroll to properties list"
        >
          <span className="text-[11px] uppercase tracking-[0.25em] font-semibold mb-1 text-slate-400 group-hover:text-amber-400">
            SCROLL
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce text-amber-400" />
        </button>
      </div>

      {/* Stylized Mountain Geometric Bottom Divider matching background */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none overflow-hidden leading-none">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-8 sm:h-12 text-[#070e16] fill-current"
        >
          {/* Triangular mountain ridges seamless transition */}
          <path d="M0,0 L150,60 L300,10 L450,75 L600,20 L750,80 L900,15 L1050,65 L1200,5 L1200,120 L0,120 Z" />
        </svg>
      </div>

    </section>
  );
};
