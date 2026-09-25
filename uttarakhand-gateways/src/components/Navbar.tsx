import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Bookmark, Menu, X, Phone, Sparkles, Calendar } from 'lucide-react';

interface NavbarProps {
  onOpenBookVisit: () => void;
  onOpenEmiCalculator?: () => void;
  onOpenUnitConverter?: () => void;
  favoriteCount: number;
  onToggleFavoritesOnly?: () => void;
  showingFavoritesOnly?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBookVisit,
  favoriteCount,
  onToggleFavoritesOnly,
  showingFavoritesOnly = false
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#091017]/85 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl shadow-black/40' 
          : 'bg-gradient-to-b from-[#070e14]/90 via-[#070e14]/40 to-transparent py-4 md:py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <a 
            href="#hero" 
            onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/50 rounded-lg p-1"
          >
            <Logo size="md" />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-200">
            <button 
              onClick={() => scrollToSection('hero')} 
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('properties-section')} 
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              Properties
            </button>
            <button 
              onClick={() => scrollToSection('about-section')} 
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              About Us
            </button>
            <button 
              onClick={() => scrollToSection('contact-section')} 
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Direct Phone Call Button */}
            <a
              href="tel:+917535981704"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/30 text-xs font-semibold text-emerald-300 hover:text-white transition-all shadow-sm"
              title="Call Rishikesh Office"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+91 7535981704</span>
            </a>

            {/* Save for Later Button */}
            {onToggleFavoritesOnly && (
              <button
                id="favorites-toggle-btn"
                onClick={onToggleFavoritesOnly}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer focus:outline-none ${
                  showingFavoritesOnly
                    ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-950/40'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
                title={showingFavoritesOnly ? "Show All Properties" : "View Saved Properties"}
              >
                <Bookmark className={`w-3.5 h-3.5 ${showingFavoritesOnly ? 'fill-white text-white' : 'text-slate-300'}`} />
                <span className="hidden sm:inline">Saved for later</span>
                {favoriteCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {favoriteCount}
                  </span>
                )}
              </button>
            )}

            {/* Book a Visit Action Button */}
            <button
              id="book-visit-navbar-btn"
              onClick={onOpenBookVisit}
              className="relative group overflow-hidden rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium text-xs sm:text-sm px-3.5 sm:px-5 py-1.5 sm:py-2 shadow-lg shadow-orange-500/25 transition-all duration-300 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                <span>Book a Visit</span>
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg bg-white/5 border border-white/10 focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 px-4 pt-3 pb-6 bg-[#0c1622]/95 backdrop-blur-2xl border-b border-white/15 shadow-2xl">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-left py-2 px-3 text-slate-200 hover:bg-white/5 rounded-lg text-sm font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('properties-section')}
              className="text-left py-2 px-3 text-slate-200 hover:bg-white/5 rounded-lg text-sm font-medium flex items-center justify-between"
            >
              <span>Explore Properties</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">Flats & Plots</span>
            </button>
            <button
              onClick={() => scrollToSection('about-section')}
              className="text-left py-2 px-3 text-slate-200 hover:bg-white/5 rounded-lg text-sm font-medium"
            >
              About Uttarakhand Gateways
            </button>
            
            {/* Phone Row in Mobile Menu */}
            <a
              href="tel:+917535981704"
              className="text-left py-2.5 px-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Contact: Rishikesh Office (+91 7535981704)</span>
            </a>

            <div className="pt-2">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenBookVisit(); }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm text-center shadow-lg shadow-orange-500/30 cursor-pointer"
              >
                Book a Free Site Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
