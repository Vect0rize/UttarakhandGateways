import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Maximize2, 
  Wifi, 
  Battery, 
  Signal, 
  QrCode, 
  ExternalLink, 
  X,
  RotateCw,
  Sparkles,
  Info
} from 'lucide-react';

interface MobileDeviceSimulatorProps {
  children: React.ReactNode;
  onSwitchToDesktop?: () => void;
  localIp?: string;
  port?: number;
}

export type DevicePreset = 'iphone16' | 'pixel9' | 'responsive';

export const MobileDeviceSimulator: React.FC<MobileDeviceSimulatorProps> = ({
  children,
  onSwitchToDesktop,
  localIp = '192.168.1.6',
  port = 3000,
}) => {
  const [device, setDevice] = useState<DevicePreset>('iphone16');
  const [showQrModal, setShowQrModal] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 820;
  });

  const [currentTime, setCurrentTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 820);
    };
    window.addEventListener('resize', handleResize);
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 10000);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
    };
  }, []);

  const localUrl = `http://localhost:${port}`;
  const networkUrl = `http://${localIp}:${port}`;

  // If the user is on a physical mobile screen, render without the outer device mockup frame
  if (isMobileScreen || device === 'responsive') {
    return (
      <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center">
        {/* Subtle top floating bar on desktop when in responsive mode */}
        {!isMobileScreen && (
          <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-emerald-900/40 px-4 py-2 flex items-center justify-between text-xs text-slate-300 z-50">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <strong className="text-white font-bold tracking-tight">Uttarakhand Gateways Mobile App</strong>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800">
                Responsive View
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDevice('iphone16')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Switch to Phone Frame Mockup"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Phone Frame</span>
              </button>

              {onSwitchToDesktop && (
                <button
                  type="button"
                  onClick={onSwitchToDesktop}
                  className="px-2.5 py-1 rounded-lg bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 border border-emerald-700/50 transition-all cursor-pointer"
                  title="Switch to Website View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop Web</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open on Phone</span>
              </button>
            </div>
          </header>
        )}

        {/* Mobile View Container */}
        <div className="w-full max-w-md min-h-screen bg-white dark:bg-[#061811] shadow-2xl relative">
          {children}
        </div>

        {/* QR Code Modal for Opening on Physical Phone */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-emerald-600/40 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base">View on Your Physical Phone</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center space-y-3">
                <div className="p-4 bg-white rounded-2xl inline-block shadow-inner">
                  {/* High quality dynamic QR code via Google Charts API or fallback QR */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(networkUrl)}`}
                    alt="Scan QR Code"
                    className="w-40 h-40 mx-auto"
                  />
                </div>
                <p className="text-xs text-slate-300">
                  Scan this QR code with your phone camera (connect to same Wi-Fi) or visit:
                </p>
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300 select-all flex items-center justify-between">
                  <span>{networkUrl}</span>
                  <a
                    href={networkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Simulator with Smartphone Mockup Chassis
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03110b] via-[#072418] to-[#04150e] text-slate-100 flex flex-col items-center justify-start p-3 sm:p-6 select-none relative overflow-x-hidden">
      
      {/* Top Floating Simulator Controls Bar */}
      <header className="w-full max-w-4xl bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl border border-white/15 dark:border-emerald-900/50 rounded-2xl px-4 py-2.5 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-xl z-30">
        
        {/* App Title & Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 flex items-center justify-center shadow-md">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-1">
                <span>Uttarakhand</span>
                <span className="text-emerald-400 italic">Gateways</span>
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-emerald-200/80 font-medium">
              Mobile App Preview • Localhost Environment
            </p>
          </div>
        </div>

        {/* Simulator Device Switcher */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setDevice('iphone16')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              device === 'iphone16' 
                ? 'bg-emerald-600 text-white shadow-sm font-bold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone 16 Pro</span>
          </button>

          <button
            type="button"
            onClick={() => setDevice('pixel9')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              device === 'pixel9' 
                ? 'bg-emerald-600 text-white shadow-sm font-bold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Pixel 9</span>
          </button>

          <button
            type="button"
            onClick={() => setDevice('responsive')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              (device as string) === 'responsive' 
                ? 'bg-emerald-600 text-white shadow-sm font-bold' 
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full Mobile</span>
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {onSwitchToDesktop && (
            <button
              type="button"
              onClick={onSwitchToDesktop}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer"
              title="View full desktop website"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop Web</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/50 transition-all cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Open on Phone</span>
          </button>
        </div>

      </header>

      {/* Phone Hardware Mockup Frame */}
      <div className="relative my-auto flex items-center justify-center">
        
        {/* Ambient Back Glow */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-green-400/20 rounded-[60px] blur-2xl -z-10 opacity-70" />

        {/* Phone Body (Titanium / Slate Bezel) */}
        <div 
          className={`relative bg-[#1c1d22] p-[12px] rounded-[52px] shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-black transition-all duration-300 ${
            device === 'iphone16' ? 'w-[395px] h-[835px]' : 'w-[412px] h-[850px]'
          }`}
        >
          {/* Subtle Outer Metal Highlights */}
          <div className="absolute inset-0 rounded-[52px] border border-white/20 pointer-events-none" />
          
          {/* Volume and Power Buttons simulation on sides */}
          <div className="absolute -left-[14px] top-[140px] w-[3px] h-[35px] bg-[#33353e] rounded-l-md" />
          <div className="absolute -left-[14px] top-[190px] w-[3px] h-[55px] bg-[#33353e] rounded-l-md" />
          <div className="absolute -left-[14px] top-[255px] w-[3px] h-[55px] bg-[#33353e] rounded-l-md" />
          <div className="absolute -right-[14px] top-[180px] w-[3px] h-[75px] bg-[#33353e] rounded-r-md" />

          {/* Phone Inner Screen Display */}
          <div className="relative w-full h-full bg-white dark:bg-[#061811] rounded-[42px] overflow-hidden flex flex-col border border-black/40 shadow-inner">
            
            {/* Top Phone Status Bar */}
            <div className="w-full h-11 bg-white/95 dark:bg-[#071f17]/95 backdrop-blur-md px-6 pt-2 flex items-center justify-between text-[11px] font-bold text-slate-900 dark:text-white select-none z-50 shrink-0 border-b border-black/5 dark:border-white/5">
              {/* Left Clock */}
              <span>{currentTime}</span>

              {/* Center Dynamic Island / Notch */}
              {device === 'iphone16' ? (
                <div className="w-24 h-6 bg-black rounded-full flex items-center justify-between px-2 shadow-xs group cursor-default">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-white/20 flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-blue-500/80" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
                </div>
              ) : (
                <div className="w-3.5 h-3.5 rounded-full bg-black mx-auto ring-1 ring-slate-800" />
              )}

              {/* Right Status Icons (Signal, Wifi, Battery) */}
              <div className="flex items-center gap-1.5">
                <Signal className="w-3 h-3 text-slate-800 dark:text-slate-200" />
                <Wifi className="w-3 h-3 text-slate-800 dark:text-slate-200" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-extrabold">100%</span>
                  <Battery className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                </div>
              </div>
            </div>

            {/* Scrollable Mobile App Area */}
            <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-none relative">
              {children}
            </div>

            {/* Bottom Home Indicator Bar (iOS style) */}
            <div className="w-full h-5 bg-white/95 dark:bg-[#071f17]/95 backdrop-blur-md flex items-center justify-center shrink-0 z-50">
              <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
            </div>

          </div>
        </div>

      </div>

      {/* Footer Info Pill */}
      <footer className="mt-4 text-center text-xs text-emerald-200/60 flex items-center gap-2">
        <span>Running on localhost:3000</span>
        <span>•</span>
        <span>Wi-Fi Network: <strong className="text-emerald-300">{networkUrl}</strong></span>
      </footer>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-600/40 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">View on Your Physical Phone</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="p-4 bg-white rounded-2xl inline-block shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(networkUrl)}`}
                  alt="Scan QR Code"
                  className="w-40 h-40 mx-auto"
                />
              </div>
              <p className="text-xs text-slate-300">
                Ensure your phone is on the same Wi-Fi network, then scan with your phone camera or visit:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-300 select-all flex items-center justify-between">
                <span>{networkUrl}</span>
                <a
                  href={networkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
