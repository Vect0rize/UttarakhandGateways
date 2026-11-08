import React from 'react';
import { 
  Home, 
  Compass, 
  Bookmark, 
  Plus, 
  CircleUserRound 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type MobileNavTab = 'home' | 'explore' | 'saved' | 'list' | 'profile' | 'analytics';

export interface MobileBottomNavProps {
  activeTab: MobileNavTab;
  onTabChange: (tab: MobileNavTab) => void;
  savedCount: number;
  unreadInboxCount?: number;
  currentUser?: any;
  className?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  savedCount,
  unreadInboxCount = 0,
  currentUser,
  className = '',
}) => {
  const { isHindi } = useLanguage();

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className={`fixed bottom-0 left-0 right-0 z-50 pointer-events-none select-none ${className}`}
    >
      {/* Mobile container matching max width */}
      <div className="max-w-[480px] mx-auto w-full pointer-events-auto bg-white/95 dark:bg-[#071d15]/95 backdrop-blur-xl border-t border-emerald-200/80 dark:border-emerald-800/80 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] px-2.5 pt-1 pb-safe transition-colors">
        <div className="flex items-center justify-between relative h-[52px]">

          {/* 1. HOME TAB */}
          <button
            type="button"
            data-tab="home"
            onClick={() => onTabChange('home')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 duration-150 ${
              activeTab === 'home'
                ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 font-medium'
            }`}
          >
            <div className="relative">
              <Home 
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTab === 'home' 
                    ? 'stroke-[2.5px] scale-105 text-emerald-600 dark:text-emerald-400' 
                    : 'stroke-[1.8px]'
                }`} 
              />
            </div>
            <span className="text-[9.5px] mt-0.5 tracking-tight leading-none font-semibold">
              {isHindi ? 'होम' : 'Home'}
            </span>
          </button>

          {/* 2. EXPLORE TAB */}
          <button
            type="button"
            data-tab="explore"
            onClick={() => onTabChange('explore')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 duration-150 ${
              activeTab === 'explore'
                ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 font-medium'
            }`}
          >
            <div className="relative">
              <Compass 
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTab === 'explore' 
                    ? 'stroke-[2.5px] scale-105 text-emerald-600 dark:text-emerald-400' 
                    : 'stroke-[1.8px]'
                }`} 
              />
            </div>
            <span className="text-[9.5px] mt-0.5 tracking-tight leading-none font-semibold">
              {isHindi ? 'खोजें' : 'Explore'}
            </span>
          </button>

          {/* 3. LIST PROPERTY (Center Elevated Button - Sleek Architectural Shape) */}
          <div className="flex-1 flex flex-col items-center justify-center -mt-2 relative z-10">
            <button
              type="button"
              data-tab="list"
              onClick={() => onTabChange('list')}
              aria-label={isHindi ? 'प्रॉपर्टी लिस्ट करें' : 'List Property'}
              className={`w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center justify-center shadow-md shadow-black/20 border border-emerald-400/40 active:scale-90 transition-all cursor-pointer group ${
                activeTab === 'list' ? 'ring-2 ring-emerald-400 ring-offset-1' : ''
              }`}
            >
              <Plus className="w-5 h-5 stroke-[2.75] group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <span className={`text-[9px] mt-0.5 font-bold tracking-tight leading-none ${
              activeTab === 'list' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {isHindi ? 'लिस्ट करें' : 'List'}
            </span>
          </div>

          {/* 4. SAVED TAB */}
          <button
            type="button"
            data-tab="saved"
            onClick={() => onTabChange('saved')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 duration-150 relative ${
              activeTab === 'saved'
                ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 font-medium'
            }`}
          >
            <div className="relative">
              <Bookmark 
                className={`w-5 h-5 transition-transform duration-200 ${
                  activeTab === 'saved' 
                    ? 'fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400 stroke-[2.5px] scale-105' 
                    : 'stroke-[1.8px]'
                }`} 
              />
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {savedCount > 9 ? '9+' : savedCount}
                </span>
              )}
            </div>
            <span className="text-[9.5px] mt-0.5 tracking-tight leading-none font-semibold">
              {isHindi ? 'सहेजे' : 'Saved'}
            </span>
          </button>

          {/* 5. PROFILE TAB */}
          <button
            type="button"
            data-tab="profile"
            onClick={() => onTabChange('profile')}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 duration-150 ${
              activeTab === 'profile'
                ? 'text-emerald-700 dark:text-emerald-300 font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600 font-medium'
            }`}
          >
            <div className="relative">
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt="avatar" 
                  className={`w-5 h-5 rounded-full object-cover border ${
                    activeTab === 'profile' ? 'border-emerald-600 ring-2 ring-emerald-400/40' : 'border-slate-300'
                  }`}
                />
              ) : (
                <CircleUserRound 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    activeTab === 'profile' 
                      ? 'stroke-[2.5px] scale-105 text-emerald-600 dark:text-emerald-400' 
                      : 'stroke-[1.8px]'
                  }`} 
                />
              )}
              {unreadInboxCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-emerald-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                  {unreadInboxCount > 9 ? '9+' : unreadInboxCount}
                </span>
              )}
            </div>
            <span className="text-[9.5px] mt-0.5 tracking-tight leading-none font-semibold">
              {isHindi ? 'प्रोफाइल' : 'Profile'}
            </span>
          </button>

        </div>
      </div>
    </nav>
  );
};
