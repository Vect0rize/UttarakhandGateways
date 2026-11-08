import React, { useEffect, useState } from 'react';
import { UKGLogoEmblem } from './Logo';

interface AppSplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = ({
  onFinish,
  durationMs = 2100,
}) => {
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, Math.max(1000, durationMs - 500));

    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      try {
        window.dispatchEvent(new CustomEvent('ukg_splash_finished'));
      } catch {}
      if (onFinish) onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  const handleDismiss = () => {
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      try {
        window.dispatchEvent(new CustomEvent('ukg_splash_finished'));
      } catch {}
      if (onFinish) onFinish();
    }, 250);
  };

  if (!isVisible) return null;

  return (
    <div 
      onClick={handleDismiss}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between py-10 px-6 bg-gradient-to-b from-[#02130c] via-[#052217] to-[#020b07] text-white select-none transition-opacity duration-500 ease-out cursor-pointer ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <style>{`
        @keyframes ukgPulseRing {
          0% { transform: scale(0.85); opacity: 0.9; }
          50% { transform: scale(1.22); opacity: 0.2; }
          100% { transform: scale(0.85); opacity: 0.9; }
        }
        @keyframes ukgEmblemFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(1.02); }
        }
        @keyframes ukgProgressFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes ukgFadeUp {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .ukg-ring-anim {
          animation: ukgPulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .ukg-emblem-anim {
          animation: ukgEmblemFloat 2.4s ease-in-out infinite;
        }
        .ukg-progress-anim {
          animation: ukgProgressFill 1.8s cubic-bezier(0.1, 0.5, 0.2, 1) forwards;
        }
        .ukg-fade-up-1 {
          animation: ukgFadeUp 0.6s ease-out forwards;
        }
        .ukg-fade-up-2 {
          animation: ukgFadeUp 0.8s ease-out forwards;
        }
        .ukg-fade-up-3 {
          animation: ukgFadeUp 1s ease-out forwards;
        }
      `}</style>

      {/* Background ambient radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none animate-pulse" />

      {/* Top action: Quick Skip */}
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="text-[11px] font-bold text-emerald-300/80 hover:text-emerald-200 px-3 py-1 rounded-full bg-white/5 border border-white/10 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          Skip
        </button>
      </div>

      {/* Center Branded Logo & Luxury Motion Typography */}
      <div className="flex flex-col items-center text-center space-y-4 relative z-10">
        
        {/* Animated Glowing Logo Emblem with Dual Pulse Halo */}
        <div className="relative flex items-center justify-center">
          {/* Outer glowing pulsing halo */}
          <div className="absolute w-32 h-32 rounded-3xl bg-emerald-400/25 blur-xl ukg-ring-anim -z-10" />
          <div className="absolute w-36 h-36 rounded-full border border-emerald-400/30 ukg-ring-anim -z-10" />

          {/* Core Crest Badge */}
          <div className="w-28 h-28 flex items-center justify-center ukg-emblem-anim">
            <img 
              src="/logo_opt.png" 
              alt="Uttarakhand Gateways" 
              className="w-full h-full object-contain filter drop-shadow-[0_4px_24px_rgba(16,185,129,0.7)] select-none pointer-events-none" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
        </div>

        {/* Brand Name with Luxury Motion Typography */}
        <div className="space-y-1 pt-1 ukg-fade-up-2">
          <h1 className="font-serif-luxury font-black text-2xl sm:text-3xl tracking-tight text-white flex items-center justify-center gap-1.5 drop-shadow-md">
            <span>Uttarakhand</span>
            <span className="italic text-emerald-400 font-serif">Gateways</span>
          </h1>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-emerald-300/90">
            Real Estate Portal
          </p>
        </div>

        {/* Value Proposition Badge */}
        <div className="pt-1.5 ukg-fade-up-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[11px] font-semibold text-emerald-200 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Direct Owner Listings • 0% Brokerage</span>
          </span>
        </div>
      </div>

      {/* Bottom Loading Progress Bar & Subtle Note */}
      <div className="w-full max-w-[220px] flex flex-col items-center space-y-2.5 relative z-10 text-center ukg-fade-up-1">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full ukg-progress-anim" />
        </div>
        <p className="text-[10px] text-emerald-300/70 font-medium tracking-wide">
          Uttarakhand • Tap to continue
        </p>
      </div>
    </div>
  );
};
