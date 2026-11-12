import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const MobileInstallBanner: React.FC = () => {
  const { isHindi } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed before safely
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const isDismissed = localStorage.getItem('uk_gateways_pwa_dismissed');
        if (isDismissed) return;
      }
    } catch {}

    // Check if already in standalone app mode
    try {
      const isStandalone = (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || ((window?.navigator as any)?.standalone);
      if (isStandalone) return;
    } catch {}

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If on mobile browser, also show subtle banner after 2 seconds even if prompt didn't fire immediately
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    let timer: any;
    if (isMobile) {
      timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = () => {
    // Download the actual native Android APK file directly
    const link = document.createElement('a');
    link.href = '/UKG - App.apk?v=9';
    link.download = 'UKG - App.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('uk_gateways_pwa_dismissed', 'true');
    } catch {}
  };

  if (!isVisible) return null;

  return (
    <div className="md:hidden w-full bg-gradient-to-r from-[#032D1F] via-[#0E3A2B] to-[#0C3628] text-[#F4F3EF] px-3 py-1.5 border-b border-[#32463D] shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0E3A2B] to-[#32463D] ring-1 ring-[#AA8F7C]/50 p-1 flex items-center justify-center shrink-0 shadow-inner">
            <img src="/logo_transparent.png" onError={(e) => { (e.target as HTMLImageElement).src = "/logo.png"; }} alt="App Icon" className="w-full h-full object-contain filter drop-shadow-xs" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-[#F4F3EF] truncate">
                Uttarakhand Gateways
              </span>
              <span className="bg-[#C2A691] text-[#032D1F] text-[9px] font-black px-1 rounded-sm uppercase tracking-wide">
                APP
              </span>
            </div>
            <p className="text-[10px] text-[#E5D4C8]/85 truncate">
              {isHindi ? '0% ब्रोकरेज रियल एस्टेट ऐप' : 'Fast 0% Brokerage Mountain Real Estate'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-2.5 py-1 rounded-full bg-[#C2A691] hover:bg-[#D5BCAE] text-[#032D1F] font-black text-[11px] shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isHindi ? 'डाउनलोड APK' : 'Download APK'}</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full text-[#C2A691] hover:text-white transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
