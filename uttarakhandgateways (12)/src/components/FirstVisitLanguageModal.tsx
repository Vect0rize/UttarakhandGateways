import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Logo, UKGLogoEmblem } from './Logo';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

export const FirstVisitLanguageModal: React.FC = () => {
  const { setLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    try {
      const alreadyChosen = localStorage.getItem('uk_gateways_lang_selected');
      if (!alreadyChosen) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
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

  return (
    <div 
      className={`fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-2xl transition-opacity duration-300 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div 
        className={`relative w-full max-w-lg bg-gradient-to-b from-[#08241b] via-[#051a13] to-[#03100b] text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl shadow-black/80 text-center modal-animate-pop overflow-hidden ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Official UKG Mountain & House Emblem Logo */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#062c21] border-2 border-emerald-400/80 shadow-xl shadow-emerald-950/80 ring-4 ring-emerald-500/20 flex items-center justify-center p-2.5 transition-transform duration-300 hover:scale-105">
            <UKGLogoEmblem className="w-full h-full object-contain pointer-events-none" />
          </div>
        </div>

        {/* Brand Typography */}
        <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1 drop-shadow-sm">
          Uttarakhand Gateways
        </h2>
        <p className="text-xs sm:text-sm text-emerald-300 font-semibold mb-1">
          उत्तराखंड गेटवेज में आपका स्वागत है
        </p>
        <p className="text-xs text-slate-300/80 mb-7 max-w-sm mx-auto font-normal">
          अपनी पसंदीदा भाषा चुनें · Choose your preferred language
        </p>

        {/* Cleaner, sleeker two floating animated buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* 1. HINDI BUTTON */}
          <button
            type="button"
            onClick={() => handleSelectLanguage('hi')}
            className="animate-float-1 group relative p-5 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:from-emerald-900/40 hover:to-emerald-950/60 border border-emerald-500/30 hover:border-emerald-400 shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer text-left flex flex-col justify-between active:scale-[0.98] focus:outline-none backdrop-blur-md"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-lg font-black shadow-md border border-emerald-300/30">
                अ
              </span>
              <span className="text-[10px] font-bold tracking-wider text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                हिंदी
              </span>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-200 transition-colors">
                हिन्दी
              </div>
              <div className="text-xs text-emerald-200/70 mt-1 font-medium">
                पहाड़ों में अपना आशियाना खोजें
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-300/80 font-bold group-hover:text-emerald-200 transition-colors">
              <span>जारी रखें</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* 2. ENGLISH BUTTON */}
          <button
            type="button"
            onClick={() => handleSelectLanguage('en')}
            className="animate-float-2 group relative p-5 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] hover:from-teal-900/40 hover:to-teal-950/60 border border-teal-500/30 hover:border-teal-400 shadow-lg hover:shadow-teal-500/20 transition-all duration-200 cursor-pointer text-left flex flex-col justify-between active:scale-[0.98] focus:outline-none backdrop-blur-md"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md border border-teal-300/30 uppercase">
                EN
              </span>
              <span className="text-[10px] font-bold tracking-wider text-teal-300 bg-teal-950/90 px-2 py-0.5 rounded-full border border-teal-500/30 uppercase">
                English
              </span>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black text-white group-hover:text-teal-200 transition-colors font-sans">
                English
              </div>
              <div className="text-xs text-teal-200/70 mt-1 font-medium">
                Explore mountain real estate
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-teal-300/80 font-bold group-hover:text-teal-200 transition-colors">
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>

        {/* Subtle switcher hint */}
        <p className="text-[11px] text-slate-400/80 mt-6">
          You can switch language anytime using the language toggle in the menu bar.
        </p>
      </div>
    </div>
  );
};
