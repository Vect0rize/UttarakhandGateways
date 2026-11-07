import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BankLogo } from './BankLogo';

interface HomeLoanBannerProps {
  onOpenEligibility: () => void;
  onOpenBankOffers?: () => void;
  isDark?: boolean;
  compact?: boolean;
}

export const HomeLoanBanner: React.FC<HomeLoanBannerProps> = ({ 
  onOpenEligibility, 
  onOpenBankOffers,
  isDark: propIsDark,
  compact = false
}) => {
  const { isHindi } = useLanguage();

  const isDark = typeof propIsDark === 'boolean' 
    ? propIsDark 
    : (typeof document !== 'undefined' && (
        document.documentElement.classList.contains('dark') || 
        document.body.classList.contains('dark') ||
        localStorage.getItem('uk_gateways_theme') === 'dark'
      ));

  const handleOpen = () => {
    try {
      if (onOpenEligibility) onOpenEligibility();
      else window.open('?page=home-loan', '_blank');
    } catch {
      if (onOpenEligibility) onOpenEligibility();
    }
  };

  const handleBankClick = () => {
    try {
      if (onOpenBankOffers) onOpenBankOffers();
      else if (onOpenEligibility) onOpenEligibility();
    } catch {
      if (onOpenEligibility) onOpenEligibility();
    }
  };

  // Compact Mobile App View Banner
  if (compact) {
    return (
      <div className="w-full px-4 my-2">
        <div className={`rounded-2xl border p-4 shadow-sm relative overflow-hidden transition-all ${
          isDark
            ? 'border-emerald-800/80 bg-gradient-to-tr from-[#061e16] via-[#092b20] to-[#04160f] text-white shadow-emerald-950/40'
            : 'border-emerald-200/90 bg-gradient-to-tr from-white via-emerald-50/40 to-teal-50/50 text-slate-900 shadow-emerald-900/5'
        }`}>
          {/* Top Brand Tag */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-black text-[10px] tracking-wider shadow-xs">
                UKG
              </span>
              <span className={`text-xs font-bold font-serif-luxury ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {isHindi ? 'गृह ऋण (Home Loan)' : 'Home Loan Hub'}
              </span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {isHindi ? '7.5%* से शुरू' : 'Starts from 7.5%*'}
            </span>
          </div>

          {/* Heading */}
          <div className="mt-2.5">
            <h4 className={`text-sm font-extrabold tracking-tight leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isHindi ? '40+ बैंकों के होम लोन ऑफर्स की तुलना करें' : 'Compare 40+ Bank Home Loans in Uttarakhand'}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isHindi ? 'जमीन, कॉटेज व फ्लैट्स हेतु संपूर्ण उत्तराखंड में' : 'For cottages, plots & flats across Uttarakhand'}
            </p>
          </div>

          {/* Bank Partner Logos Animated Infinite Marquee Scroll */}
          <div className="w-full overflow-hidden py-2.5 -mx-1 px-1 relative select-none">
            <div className="animate-bank-marquee items-center gap-2">
              {[...['SBI', 'HDFC', 'ICICI', 'BOB', 'PNB', 'AXIS'], ...['SBI', 'HDFC', 'ICICI', 'BOB', 'PNB', 'AXIS']].map((code, idx) => (
                <div
                  key={`${code}-${idx}`}
                  onClick={handleBankClick}
                  className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all ${
                    isDark
                      ? 'border-emerald-800 bg-[#0a2f22]/80 hover:bg-[#0e3b2c]'
                      : 'border-slate-200 bg-white hover:border-emerald-400'
                  }`}
                >
                  <BankLogo code={code} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleOpen}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>{isHindi ? 'EMI कैलकुलेटर' : 'Calculate EMI'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full my-12 rounded-3xl border shadow-xl overflow-hidden relative transition-colors duration-300 ${
      isDark 
        ? 'border-emerald-800/80 bg-gradient-to-r from-[#061e16] via-[#092b20] to-[#04160f] text-white shadow-emerald-950/60' 
        : 'border-[#f3deab] bg-gradient-to-r from-white via-[#fffefb] to-[#fefbf4] text-slate-900 shadow-amber-900/5'
    }`}>
      
      {/* Background glow */}
      <div className={`absolute top-0 right-1/3 w-80 h-40 rounded-full blur-3xl pointer-events-none ${
        isDark ? 'bg-emerald-500/15' : 'bg-amber-200/20'
      }`} />

      <div className="p-6 sm:p-8 lg:p-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Offer Content, Bank Cards, CTAs */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Top Logo: UKG Loan Calculator */}
            <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={handleOpen}>
              <img src="/logo.png" alt="UKG Real Estate" className="w-8 h-8 sm:w-9 sm:h-9 object-contain filter drop-shadow-xs" />
              <span className={`text-2xl sm:text-3xl font-black tracking-tight font-serif-luxury ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Loan Calculator
              </span>
            </div>

            {/* Main Headline */}
            <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {isHindi ? '40+ बैंकों के होम लोन ऑफर्स की तुलना करें' : 'Compare Home Loan Offers from 40+ Banks'}
            </h3>

            {/* Sub-bullets with checkmark icons */}
            <div className={`flex items-center gap-6 sm:gap-8 flex-wrap text-xs sm:text-sm font-medium ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                  isDark 
                    ? 'border-emerald-600 bg-emerald-950/60 text-emerald-400' 
                    : 'border-slate-400 text-slate-700'
                }`}>
                  ✓
                </span>
                <span>
                  {isHindi ? 'ब्याज दरें मात्र' : 'Rates starting from'}{' '}
                  <strong className={`font-extrabold text-sm sm:text-base ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}>7%</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                  isDark 
                    ? 'border-emerald-600 bg-emerald-950/60 text-emerald-400' 
                    : 'border-slate-400 text-slate-700'
                }`}>
                  ✓
                </span>
                <span>
                  <strong className={`font-extrabold text-sm sm:text-base ${
                    isDark ? 'text-[#ff6b6b]' : 'text-[#c9252c]'
                  }`}>0%*</strong>{' '}
                  {isHindi ? 'प्रोसेसिंग शुल्क' : 'Processing Fee'}
                </span>
              </div>
            </div>

            {/* Bank Partners Heading */}
            <div className="pt-2">
              <span className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-wider block ${
                isDark ? 'text-emerald-400' : 'text-[#bca46b]'
              }`}>
                {isHindi ? 'हमारे बैंकिंग सहयोगी' : 'OUR BANKING PARTNERS'}
              </span>

              {/* Bank Cards Row with 100% Official Bank Logos */}
              <div className="flex items-center gap-3 overflow-x-auto py-2.5 no-scrollbar">
                
                {/* 1. Bank of Baroda */}
                <div 
                  onClick={handleBankClick}
                  className={`px-3.5 py-2.5 rounded-xl border shadow-xs transition-all flex flex-col items-center justify-between min-w-[130px] sm:min-w-[140px] cursor-pointer text-center group ${
                    isDark 
                      ? 'border-emerald-700/60 bg-[#0a2f22] hover:border-emerald-400 hover:bg-[#0e3b2c]' 
                      : 'border-slate-200/90 bg-white hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="h-7 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <BankLogo code="BOB" size="sm" />
                      <span className={`text-[10px] font-black leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Bank of Baroda
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Starts at <strong className="font-extrabold">7.2%</strong>
                  </span>
                </div>

                {/* 2. State Bank of India (SBI) */}
                <div 
                  onClick={handleBankClick}
                  className={`px-3.5 py-2.5 rounded-xl border shadow-xs transition-all flex flex-col items-center justify-between min-w-[130px] sm:min-w-[140px] cursor-pointer text-center group ${
                    isDark 
                      ? 'border-emerald-700/60 bg-[#0a2f22] hover:border-emerald-400 hover:bg-[#0e3b2c]' 
                      : 'border-slate-200/90 bg-white hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="h-7 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <BankLogo code="SBI" size="sm" />
                      <span className={`text-[10px] font-black leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        State Bank
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Starts at <strong className="font-extrabold">7.1%</strong>
                  </span>
                </div>

                {/* 3. ICICI Bank */}
                <div 
                  onClick={handleBankClick}
                  className={`px-3.5 py-2.5 rounded-xl border shadow-xs transition-all flex flex-col items-center justify-between min-w-[130px] sm:min-w-[140px] cursor-pointer text-center group ${
                    isDark 
                      ? 'border-emerald-700/60 bg-[#0a2f22] hover:border-emerald-400 hover:bg-[#0e3b2c]' 
                      : 'border-slate-200/90 bg-white hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="h-7 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <BankLogo code="ICICI" size="sm" />
                      <span className={`text-[10px] font-black leading-tight ${isDark ? 'text-amber-300' : 'text-[#8f2717]'}`}>
                        ICICI Bank
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Starts at <strong className="font-extrabold">7.35%</strong>
                  </span>
                </div>

                {/* 4. HDFC Home Loans */}
                <div 
                  onClick={handleBankClick}
                  className={`px-3.5 py-2.5 rounded-xl border shadow-xs transition-all flex flex-col items-center justify-between min-w-[130px] sm:min-w-[140px] cursor-pointer text-center group ${
                    isDark 
                      ? 'border-emerald-700/60 bg-[#0a2f22] hover:border-emerald-400 hover:bg-[#0e3b2c]' 
                      : 'border-slate-200/90 bg-white hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="h-7 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <BankLogo code="HDFC" size="sm" />
                      <span className={`text-[10px] font-black leading-tight ${isDark ? 'text-blue-300' : 'text-[#1d3557]'}`}>
                        HDFC HOME
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Starts at <strong className="font-extrabold">7.25%</strong>
                  </span>
                </div>

                {/* 5. Bajaj Housing Finance */}
                <div 
                  onClick={handleBankClick}
                  className={`px-3.5 py-2.5 rounded-xl border shadow-xs transition-all flex flex-col items-center justify-between min-w-[130px] sm:min-w-[140px] cursor-pointer text-center group ${
                    isDark 
                      ? 'border-emerald-700/60 bg-[#0a2f22] hover:border-emerald-400 hover:bg-[#0e3b2c]' 
                      : 'border-slate-200/90 bg-white hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="h-7 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <BankLogo code="BAJAJ" size="sm" />
                      <span className={`text-[10px] font-black leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Bajaj Housing
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Starts at <strong className="font-extrabold">7.40%</strong>
                  </span>
                </div>

                {/* 6. PNB Housing */}
                <div 
                  onClick={handleBankClick}
                  className={`px-3.5 py-2.5 rounded-xl border shadow-xs transition-all flex flex-col items-center justify-between min-w-[130px] sm:min-w-[140px] cursor-pointer text-center group ${
                    isDark 
                      ? 'border-emerald-700/60 bg-[#0a2f22] hover:border-emerald-400 hover:bg-[#0e3b2c]' 
                      : 'border-slate-200/90 bg-white hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="h-7 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <BankLogo code="PNB" size="sm" />
                      <span className={`text-[10px] font-black leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        PNB Housing
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Starts at <strong className="font-extrabold">7.15%</strong>
                  </span>
                </div>

                {/* 7. Uttarakhand Gramin Bank */}
                <div 
                  onClick={handleBankClick}
                  className={`px-3.5 py-2.5 rounded-xl border shadow-xs transition-all flex flex-col items-center justify-between min-w-[130px] sm:min-w-[140px] cursor-pointer text-center group ${
                    isDark 
                      ? 'border-emerald-700/60 bg-[#0a2f22] hover:border-emerald-400 hover:bg-[#0e3b2c]' 
                      : 'border-slate-200/90 bg-white hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="h-7 flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <BankLogo code="UKGB" size="sm" />
                      <span className={`text-[10px] font-black leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        UK Gramin Bank
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    Starts at <strong className="font-extrabold">7.20%</strong>
                  </span>
                </div>

              </div>
            </div>

            {/* Bottom Actions Row: Calculate EMI Button */}
            <div className="flex items-center gap-4 sm:gap-6 pt-3 flex-wrap">
              <button
                type="button"
                onClick={handleOpen}
                className="px-8 sm:px-10 py-3 sm:py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-lg shadow-emerald-600/30 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{isHindi ? 'ईएमआई कैलकुलेटर' : 'Calculate EMI'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right Column: Hand Placing Roof on Model House Graphic */}
          <div className="lg:col-span-4 flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[380px] group cursor-pointer" onClick={handleOpen}>
              <img
                src="/home-loan-hand.jpg"
                alt="Compare Home Loan Offers Hand with Miniature House"
                className={`w-full h-auto object-contain rounded-2xl drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 ${
                  isDark ? 'ring-1 ring-emerald-700/50 shadow-emerald-950/80' : ''
                }`}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
