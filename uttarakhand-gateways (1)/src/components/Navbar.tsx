import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { Bookmark, Menu, X, Phone, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  onOpenEmiCalculator?: () => void;
  onOpenUnitConverter?: () => void;
  favoriteCount: number;
  onToggleFavoritesOnly?: () => void;
  showingFavoritesOnly?: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  favoriteCount,
  onToggleFavoritesOnly,
  showingFavoritesOnly = false,
  theme,
  onToggleTheme,
  currentPage = 1,
  totalPages = 2,
  onPageChange,
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

  const isDark = theme === 'dark';

  return (
    <header 
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-sky-200/80 dark:border-slate-800 py-2.5 sm:py-3 shadow-md shadow-sky-950/5 dark:shadow-black/20' 
          : 'bg-gradient-to-b from-white/95 via-white/80 to-transparent dark:from-slate-950/95 dark:via-slate-950/80 py-3 sm:py-4 md:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo - Compact on mobile to save valuable top bar real estate */}
          <a 
            href="#hero" 
            onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400/50 rounded-lg p-0.5 sm:p-1 flex-shrink-0"
          >
            <div className="hidden sm:block">
              <Logo size="md" darkText={!isDark} />
            </div>
            <div className="sm:hidden">
              <Logo size="sm" darkText={!isDark} />
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700 dark:text-slate-200">
            <button 
              onClick={() => scrollToSection('hero')} 
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('properties-section')} 
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              Properties
            </button>
            <button 
              onClick={() => scrollToSection('about-section')} 
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              About Us
            </button>
            <button 
              onClick={() => scrollToSection('contact-section')} 
              className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Bar - Clean, spacious layout */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Direct Phone Call Button (Desktop) */}
            <a
              href="tel:+917535981704"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700 text-xs font-semibold text-sky-800 dark:text-sky-300 transition-all shadow-xs"
              title="Call Rishikesh Office"
            >
              <Phone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>+91 7535981704</span>
            </a>

            {/* LIGHT / DARK MODE TOGGLE BUTTON */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-full border bg-white/90 dark:bg-slate-800/90 border-sky-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700 transition-all cursor-pointer focus:outline-none shadow-xs"
              title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
              aria-label={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-sky-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Save for Later Button */}
            {onToggleFavoritesOnly && (
              <button
                id="favorites-toggle-btn"
                onClick={onToggleFavoritesOnly}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer focus:outline-none ${
                  showingFavoritesOnly
                    ? 'bg-rose-500 border-rose-400 text-white shadow-md shadow-rose-950/20'
                    : 'bg-white/80 dark:bg-slate-800/90 border-sky-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700 shadow-xs'
                }`}
                title={showingFavoritesOnly ? "Show All Properties" : "View Saved Properties"}
                aria-label="Saved properties"
              >
                <Bookmark className={`w-3.5 h-3.5 ${showingFavoritesOnly ? 'fill-white text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="hidden sm:inline">Saved</span>
                {favoriteCount > 0 && (
                  <span className="bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {favoriteCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl bg-white/90 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2.5 px-4 pt-3 pb-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-b border-sky-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-top-2 duration-200 text-slate-800 dark:text-slate-100">
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-left py-2 px-3 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium"
            >
              Home
            </button>

            <button
              onClick={() => scrollToSection('properties-section')}
              className="text-left py-2 px-3 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium flex items-center justify-between"
            >
              <span>Explore Properties</span>
              <span className="text-xs bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded font-medium border border-sky-200 dark:border-sky-800">
                10 per page
              </span>
            </button>

            {/* Quick Property Page Selector in Mobile Menu */}
            {totalPages > 1 && onPageChange && (
              <div className="px-3 py-2 bg-sky-50/70 dark:bg-slate-800/70 rounded-xl border border-sky-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-900 dark:text-sky-300">Property Pages:</span>
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => {
                        onPageChange(pageNum);
                        scrollToSection('properties-section');
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-sky-200 dark:border-slate-600 hover:bg-sky-100'
                      }`}
                    >
                      Page {pageNum}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => scrollToSection('about-section')}
              className="text-left py-2 px-3 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium"
            >
              About Uttarakhand Gateways
            </button>

            <button
              onClick={() => scrollToSection('contact-section')}
              className="text-left py-2 px-3 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium"
            >
              Contact Us
            </button>

            {/* Light / Dark Mode switch row in Mobile Drawer */}
            <div className="flex items-center justify-between py-2 px-3 bg-sky-50/50 dark:bg-slate-800/50 rounded-xl border border-sky-100 dark:border-slate-700">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Theme</span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-sky-200 dark:border-slate-600 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dark Mode (Active)</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-sky-600" />
                    <span>Light Mode (Active)</span>
                  </>
                )}
              </button>
            </div>
            
            {/* Phone Row in Mobile Menu */}
            <a
              href="tel:+917535981704"
              className="text-left py-2.5 px-3 bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-slate-700 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Contact: Rishikesh Office (+91 7535981704)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
