import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Check, Sparkles, X } from 'lucide-react';

export const FirstVisitLanguageModal: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user already chose on first visit
    try {
      const alreadyChosen = localStorage.getItem('uk_gateways_lang_selected');
      if (!alreadyChosen) {
        // Wait for splash animation to complete before presenting the language choice
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 2200);
        return () => clearTimeout(timer);
      }
    } catch {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for manual trigger from Language buttons across header, profile, or sidebar
  useEffect(() => {
    const handleOpenModal = () => {
      setIsClosing(false);
      setIsVisible(true);
    };
    window.addEventListener('ukg_open_language_modal', handleOpenModal);
    return () => window.removeEventListener('ukg_open_language_modal', handleOpenModal);
  }, []);

  if (!isVisible) return null;

  const handleSelectLanguage = (lang: 'hi' | 'en') => {
    try {
      localStorage.setItem('uk_gateways_lang_selected', 'true');
    } catch {}
    setLanguage(lang);
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 280);
  };

  const handleClose = () => {
    try { localStorage.setItem('uk_gateways_lang_selected', 'true'); } catch {}
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 280);
  };

  return (
    <div 
      className={`fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/70 dark:bg-black/80 backdrop-blur-xl transition-opacity duration-300 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className={`relative w-full max-w-lg bg-white dark:bg-[#071c14] text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 border border-emerald-300/80 dark:border-emerald-700/60 shadow-2xl shadow-emerald-950/20 dark:shadow-black/80 text-center modal-animate-pop overflow-hidden transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer z-20 active:scale-90"
          aria-label="Close"
          title="Close / बंद करें"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow Matching Theme */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-emerald-500/15 dark:bg-emerald-400/20 blur-3xl pointer-events-none" />

        {/* Official UKG Mountain & House Emblem Logo (Transparent PNG) */}
        <div className="flex flex-col items-center justify-center mb-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center p-1 transition-transform duration-300 hover:scale-105">
            <img 
              src="/logo_transparent.png" 
              alt="Uttarakhand Gateways" 
              className="w-full h-full object-contain pointer-events-none filter drop-shadow-[0_4px_16px_rgba(16,185,129,0.5)] select-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
        </div>

        {/* Brand Typography with Theme Adaptability */}
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1 drop-shadow-xs">
          Uttarakhand Gateways
        </h2>
        <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-bold mb-1">
          उत्तराखंड गेटवेज में आपका स्वागत है
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-300/80 mb-6 max-w-sm mx-auto font-medium">
          अपनी पसंदीदा भाषा चुनें · Choose your preferred language
        </p>

        {/* Two Floating Animated Theme-Matched Language Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
          
          {/* 1. HINDI BUTTON */}
          <button
            type="button"
            onClick={() => handleSelectLanguage('hi')}
            className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.98] focus:outline-none shadow-md ${
              language === 'hi'
                ? 'bg-emerald-100/90 dark:bg-emerald-950/80 border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/50 shadow-emerald-600/20'
                : 'bg-emerald-50/70 hover:bg-emerald-100/80 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-400 dark:hover:border-emerald-500'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-lg font-black shadow-md border border-emerald-300/30">
                अ
              </span>
              <div className="flex items-center gap-1">
                {language === 'hi' && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                <span className="text-[10px] font-bold tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-200/70 dark:bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-300/60 dark:border-emerald-500/30 uppercase">
                  हिंदी
                </span>
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                हिन्दी
              </div>
              <div className="text-xs text-emerald-800/80 dark:text-emerald-200/70 mt-0.5 font-medium">
                पहाड़ों में अपना आशियाना खोजें
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-emerald-200/80 dark:border-white/10 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 font-bold group-hover:translate-x-0.5 transition-transform">
              <span>जारी रखें</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 2. ENGLISH BUTTON */}
          <button
            type="button"
            onClick={() => handleSelectLanguage('en')}
            className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.98] focus:outline-none shadow-md ${
              language === 'en'
                ? 'bg-teal-100/90 dark:bg-teal-950/80 border-teal-500 dark:border-teal-400 ring-2 ring-teal-500/50 shadow-teal-600/20'
                : 'bg-teal-50/70 hover:bg-teal-100/80 dark:bg-teal-950/30 dark:hover:bg-teal-950/60 border-teal-200 dark:border-teal-800/80 hover:border-teal-400 dark:hover:border-teal-500'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md border border-teal-300/30 uppercase">
                EN
              </span>
              <div className="flex items-center gap-1">
                {language === 'en' && (
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                <span className="text-[10px] font-bold tracking-wider text-teal-800 dark:text-teal-300 bg-teal-200/70 dark:bg-teal-900/80 px-2 py-0.5 rounded-full border border-teal-300/60 dark:border-teal-500/30 uppercase">
                  English
                </span>
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors font-sans">
                English
              </div>
              <div className="text-xs text-teal-800/80 dark:text-teal-200/70 mt-0.5 font-medium">
                Explore mountain real estate
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-teal-200/80 dark:border-white/10 flex items-center justify-between text-[11px] text-teal-800 dark:text-teal-300 font-bold group-hover:translate-x-0.5 transition-transform">
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>

        {/* Subtle switcher hint matching theme */}
        <p className="text-[11px] text-slate-500 dark:text-slate-400/80 mt-5">
          You can switch language anytime using the language toggle in the menu bar or your profile.
        </p>
      </div>
    </div>
  );
};
