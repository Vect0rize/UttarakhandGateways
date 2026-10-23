import React, { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles, ShieldCheck, Mountain } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LoginSuccessAnimationProps {
  username?: string;
  isOpen: boolean;
  onComplete: () => void;
}

export const LoginSuccessAnimation: React.FC<LoginSuccessAnimationProps> = ({
  username,
  isOpen,
  onComplete,
}) => {
  const { isHindi } = useLanguage();
  const [stage, setStage] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    if (!isOpen) return;

    setStage('enter');
    const t1 = setTimeout(() => setStage('show'), 100);
    const t2 = setTimeout(() => setStage('exit'), 1700);
    const t3 = setTimeout(() => {
      onComplete();
    }, 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-400 ${
        stage === 'exit' 
          ? 'opacity-0 scale-95 pointer-events-none' 
          : 'bg-black/70 backdrop-blur-md opacity-100'
      }`}
    >
      <div 
        className={`w-full max-w-sm bg-gradient-to-b from-[#0d3827] via-[#09291d] to-[#041710] border border-emerald-400/40 rounded-3xl p-7 text-center text-white shadow-2xl relative overflow-hidden transition-all duration-500 ease-out ${
          stage === 'enter' 
            ? 'scale-75 opacity-0 translate-y-6' 
            : stage === 'show' 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-105 opacity-0 -translate-y-4'
        }`}
      >
        {/* Ambient Radial Lights */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-400/25 rounded-full blur-2xl animate-pulse" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-teal-400/25 rounded-full blur-2xl animate-pulse" />

        {/* Center Animated Icon with Rotating Ring */}
        <div className="relative mx-auto w-24 h-24 mb-5 flex items-center justify-center">
          {/* Rotating gradient ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/60 animate-spin [animation-duration:8s]" />
          
          {/* Outer glowing halo */}
          <div className="absolute inset-1.5 rounded-full bg-emerald-500/20 blur-sm animate-ping [animation-duration:2s]" />

          {/* Solid Center Disc */}
          <div className="relative w-18 h-18 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-xl shadow-emerald-500/40 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white animate-bounce [animation-iteration-count:2]" />
          </div>

          <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-spin [animation-duration:4s]" />
        </div>

        {/* Welcome Text */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isHindi ? 'सत्यापित प्रवेश' : 'Verified Access'}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
          {username 
            ? (isHindi ? `स्वागत है, ${username}!` : `Welcome, ${username}!`) 
            : (isHindi ? 'लॉगिन सफल!' : 'Login Successful!')}
        </h3>

        <p className="text-xs text-emerald-200/90 mt-2 leading-relaxed">
          {isHindi 
            ? 'उत्तराखंड गेटवेज में आपका स्वागत है। 0% ब्रोकरेज के साथ प्रॉपर्टीज एक्सप्लोर करें।' 
            : 'Successfully authenticated to Uttarakhand Gateways. Explore 0% brokerage verified mountain properties.'}
        </p>

        {/* Mini Trust Footer */}
        <div className="mt-5 pt-4 border-t border-emerald-800/60 flex items-center justify-center gap-2 text-[11px] text-emerald-300/80 font-semibold">
          <Mountain className="w-3.5 h-3.5 text-emerald-400" />
          <span>Uttarakhand Gateways Authentic Living</span>
        </div>
      </div>
    </div>
  );
};
