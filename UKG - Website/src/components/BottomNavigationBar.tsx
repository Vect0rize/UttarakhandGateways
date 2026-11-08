import React from 'react';
import { 
  Info, 
  Building2, 
  Plus, 
  BookOpen, 
  CircleUserRound as UserIcon, 
  LayoutDashboard 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface BottomNavigationBarProps {
  onAboutClick: () => void;
  onMarketplaceClick: () => void;
  onListPropertyClick: () => void;
  onGuideClick: () => void;
  onProfileClick: () => void;
  activeItem?: 'about' | 'marketplace' | 'list' | 'guide' | 'profile';
  className?: string;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  onAboutClick,
  onMarketplaceClick,
  onListPropertyClick,
  onGuideClick,
  onProfileClick,
  activeItem = 'marketplace',
  className = '',
}) => {
  const { isHindi } = useLanguage();
  const { currentUser } = useAuth();

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Bottom Navigation"
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white/92 dark:bg-[#061811]/92 backdrop-blur-xl border-t border-emerald-200/80 dark:border-emerald-950/80 shadow-[0_-4px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.5)] pb-safe select-none transition-all ${className}`}
    >
      <div className="max-w-2xl mx-auto px-4 h-16 sm:h-18 flex items-center justify-around relative">
        
        {/* 1. About Us */}
        <button
          type="button"
          onClick={onAboutClick}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-150 cursor-pointer ${
            activeItem === 'about'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Info className={`w-5 h-5 transition-transform ${activeItem === 'about' ? 'scale-110 stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 font-semibold tracking-tight">
            {isHindi ? 'हमारे बारे में' : 'About Us'}
          </span>
        </button>

        {/* 2. Marketplace */}
        <button
          type="button"
          onClick={onMarketplaceClick}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-150 cursor-pointer ${
            activeItem === 'marketplace'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className={`w-5 h-5 transition-transform ${activeItem === 'marketplace' ? 'scale-110 stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 font-semibold tracking-tight">
            {isHindi ? 'मार्केटप्लेस' : 'Marketplace'}
          </span>
        </button>

        {/* 3. List Property (Visual Centerpiece: Tastefully elevated with subtle emerald glow) */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            type="button"
            onClick={onListPropertyClick}
            aria-label={isHindi ? 'प्रॉपर्टी लिस्ट करें' : 'List Property'}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-500 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 dark:shadow-emerald-950/60 ring-4 ring-white dark:ring-[#061811] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <Plus className="w-6 h-6 stroke-[2.8] group-hover:rotate-90 transition-transform duration-300" />
            <span className="sr-only">{isHindi ? 'प्रॉपर्टी लिस्ट करें' : 'List Property'}</span>
          </button>
        </div>

        {/* 4. Guide */}
        <button
          type="button"
          onClick={onGuideClick}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-150 cursor-pointer ${
            activeItem === 'guide'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className={`w-5 h-5 transition-transform ${activeItem === 'guide' ? 'scale-110 stroke-[2.5]' : ''}`} />
          <span className="text-[11px] mt-1 font-semibold tracking-tight">
            {isHindi ? 'गाइड' : 'Guide'}
          </span>
        </button>

        {/* 5. Profile */}
        <button
          type="button"
          onClick={onProfileClick}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-150 cursor-pointer ${
            activeItem === 'profile'
              ? 'text-emerald-700 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {currentUser ? (
            <LayoutDashboard className={`w-5 h-5 transition-transform ${activeItem === 'profile' ? 'scale-110 stroke-[2.5]' : ''}`} />
          ) : (
            <UserIcon className={`w-5 h-5 transition-transform ${activeItem === 'profile' ? 'scale-110 stroke-[2.5]' : ''}`} />
          )}
          <span className="text-[11px] mt-1 font-semibold tracking-tight">
            {currentUser 
              ? (isHindi ? 'डैशबोर्ड' : 'Profile') 
              : (isHindi ? 'प्रोफ़ाइल' : 'Profile')}
          </span>
        </button>

      </div>
    </nav>
  );
};
