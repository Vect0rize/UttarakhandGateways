import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, ShieldCheck, Sparkles, Check, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const TEN_MINUTES_MS = 10 * 60 * 1000;
const INITIAL_VISIT_DELAY_MS = 5000; // 5 seconds on visit

export const ApkDownloadModal: React.FC = () => {
  const { isHindi } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Check if running inside installed standalone app mode
    try {
      const isStandalone = 
        (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
        ((window?.navigator as any)?.standalone);
      if (isStandalone) return;
    } catch {}

    const checkAndShow = () => {
      try {
        const lastPromptStr = localStorage.getItem('ukg_last_apk_prompt_time');
        const now = Date.now();
        if (!lastPromptStr) {
          setIsVisible(true);
          localStorage.setItem('ukg_last_apk_prompt_time', now.toString());
        } else {
          const lastPrompt = parseInt(lastPromptStr, 10);
          if (now - lastPrompt >= TEN_MINUTES_MS) {
            setIsVisible(true);
            localStorage.setItem('ukg_last_apk_prompt_time', now.toString());
          }
        }
      } catch {
        setIsVisible(true);
      }
    };

    // Initial timer on load
    const initialTimer = setTimeout(() => {
      checkAndShow();
    }, INITIAL_VISIT_DELAY_MS);

    // Recurring interval every 10 seconds to check if 10 minutes have elapsed
    const intervalTimer = setInterval(() => {
      try {
        const lastPromptStr = localStorage.getItem('ukg_last_apk_prompt_time');
        const now = Date.now();
        if (lastPromptStr) {
          const lastPrompt = parseInt(lastPromptStr, 10);
          if (now - lastPrompt >= TEN_MINUTES_MS) {
            setIsClosing(false);
            setIsVisible(true);
            localStorage.setItem('ukg_last_apk_prompt_time', now.toString());
          }
        } else {
          setIsClosing(false);
          setIsVisible(true);
          localStorage.setItem('ukg_last_apk_prompt_time', now.toString());
        }
      } catch {}
    }, 15000);

    // Listen for manual trigger anywhere on the website (e.g. from navbar or footer)
    const handleManualOpen = () => {
      setIsClosing(false);
      setIsVisible(true);
    };
    window.addEventListener('ukg_open_apk_download', handleManualOpen);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      window.removeEventListener('ukg_open_apk_download', handleManualOpen);
    };
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem('ukg_last_apk_prompt_time', Date.now().toString());
    } catch {}
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 280);
  };

  const handleDownload = () => {
    setDownloading(true);
    try {
      localStorage.setItem('ukg_last_apk_prompt_time', Date.now().toString());
    } catch {}

    // Trigger direct native APK download
    const link = document.createElement('a');
    link.href = '/UKG - App.apk?v=6';
    link.download = 'UKG - App.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
      handleClose();
    }, 1200);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 dark:bg-black/85 backdrop-blur-md transition-opacity duration-300 ${
        isClosing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className={`relative w-full max-w-sm sm:max-w-md bg-[#FAF9F6] dark:bg-[#032D1F] text-[#0E3A2B] dark:text-[#F4F3EF] rounded-3xl p-5 sm:p-7 border border-emerald-300/90 dark:border-[#32463D] shadow-2xl shadow-[#032D1F]/30 dark:shadow-black/80 text-center modal-animate-pop overflow-hidden transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer z-20 active:scale-90"
          aria-label="Close"
          title={isHindi ? "बंद करें" : "Close"}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-28 bg-[#AA8F7C]/15 dark:bg-[#C2A691]/15 blur-3xl pointer-events-none" />

        {/* Official UKG Mountain Emblem & Android Badge */}
        <div className="flex flex-col items-center justify-center mb-3 relative">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#0E3A2B] via-[#32463D] to-[#0C3628] p-1 flex items-center justify-center shadow-lg shadow-[#032D1F]/35 ring-2 ring-[#AA8F7C]/50">
            <img 
              src="/logo_transparent.png" 
              alt="Uttarakhand Gateways" 
              className="w-full h-full object-contain filter drop-shadow-md pointer-events-none select-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
          <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C2A691] text-[#032D1F] text-[10px] font-black uppercase tracking-wider shadow-xs">
            <Smartphone className="w-3 h-3" />
            <span>Official Android APK • 13.2 MB</span>
          </span>
        </div>

        {/* Headlines */}
        <h3 className="font-serif-luxury text-xl sm:text-2xl font-black text-[#0E3A2B] dark:text-[#F4F3EF] mb-1">
          {isHindi ? 'उत्तराखंड गेटवेज ऐप इंस्टॉल करें' : 'Get The Uttarakhand Gateways App'}
        </h3>
        <p className="text-xs sm:text-sm text-[#32463D] dark:text-[#C2A691] font-bold mb-4">
          {isHindi 
            ? 'पहाड़ों में 0% ब्रोकरेज प्रॉपर्टी, सीधे आपके फोन पर' 
            : '0% Brokerage Mountain Real Estate Directly in Your Hands'}
        </p>

        {/* Feature Highlights Grid */}
        <div className="space-y-2 mb-5 text-left bg-[#f1f2ef] dark:bg-[#0C3628] p-3 sm:p-3.5 rounded-2xl border border-emerald-200/80 dark:border-[#32463D]">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-[#E5D4C8]">
            <span className="w-5 h-5 rounded-full bg-[#0E3A2B] text-[#C2A691] flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span>{isHindi ? 'सीधे मालिक से फोन कॉल व इंस्टेंट चैट' : 'Direct owner calls & instant WhatsApp chat'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-[#E5D4C8]">
            <span className="w-5 h-5 rounded-full bg-[#0E3A2B] text-[#C2A691] flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span>{isHindi ? '100% सत्यापित आवासीय प्लॉट, फ्लैट्स व विला' : '100% verified mountain plots, flats & villas'}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-[#E5D4C8]">
            <span className="w-5 h-5 rounded-full bg-[#0E3A2B] text-[#C2A691] flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
            <span>{isHindi ? 'सुपरफास्ट लोडिंग • मात्र 13.2 MB का हल्का ऐप' : 'Lightweight native performance (Only 13.2 MB)'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#0E3A2B] via-[#32463D] to-[#0C3628] hover:from-[#164A37] hover:to-[#0E3A2B] text-[#F4F3EF] font-extrabold text-sm shadow-lg shadow-[#032D1F]/35 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] ring-1 ring-[#AA8F7C]/50"
          >
            <Download className={`w-4 h-4 ${downloading ? 'animate-spin' : 'animate-bounce'}`} />
            <span>
              {downloading 
                ? (isHindi ? 'डाउनलोड शुरू हो रहा है...' : 'Starting Download...') 
                : (isHindi ? 'डाउनलोड APK (मुफ़्त • 13.2 MB)' : 'Download APK (Free • 13.2 MB)')}
            </span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors flex items-center justify-center gap-1"
          >
            <Clock className="w-3.5 h-3.5 opacity-60" />
            <span>{isHindi ? 'शायद बाद में (10 मिनट बाद याद दिलाएं)' : 'Maybe Later (Remind me in 10 minutes)'}</span>
          </button>
        </div>

        {/* 10-Minute Reminder Note */}
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
          {isHindi 
            ? 'सुरक्षित APK फ़ाइल सीधे उत्तराखंड गेटवेज सर्वर से डाउनलोड होती है।' 
            : 'Safe APK directly downloaded from Uttarakhand Gateways servers.'}
        </p>
      </div>
    </div>
  );
};
