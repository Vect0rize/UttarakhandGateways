import React, { useEffect } from 'react';
import {
  X,
  Home,
  Compass,
  Key,
  Mountain,
  PlusCircle,
  Bookmark,
  Calculator,
  Scale,
  MessageSquare,
  Bot,
  User,
  LogIn,
  LogOut,
  Sun,
  Moon,
  Globe,
  ShieldCheck,
  PhoneCall,
  ChevronRight,
  Sparkles,
  Building2,
  MapPin,
  BarChart3
} from 'lucide-react';
import { MobileNavTab } from './MobileBottomNav';
import { UKGLogoEmblem } from './Logo';

export interface MobileAppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: MobileNavTab;
  onTabChange: (tab: MobileNavTab, extraParam?: string) => void;
  onSelectCategory?: (category: string) => void;
  onSelectCity?: (city: string) => void;
  onOpenUnitConverter?: () => void;
  onOpenEmiCalculator?: () => void;
  onOpenGuide?: () => void;
  onOpenInbox?: () => void;
  onOpenLegalPolicy?: (policyId: string) => void;
  currentUser?: any;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
  onLogout?: () => void;
  savedCount?: number;
  unreadInboxCount?: number;
  isDark: boolean;
  onToggleTheme?: () => void;
  isHindi: boolean;
  onToggleLanguage: () => void;
}

export const MobileAppSidebar: React.FC<MobileAppSidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  onSelectCategory,
  onSelectCity,
  onOpenUnitConverter,
  onOpenEmiCalculator,
  onOpenGuide,
  onOpenInbox,
  onOpenLegalPolicy,
  currentUser,
  onOpenAuthModal,
  onLogout,
  savedCount = 0,
  unreadInboxCount = 0,
  isDark,
  onToggleTheme,
  isHindi,
  onToggleLanguage,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavClick = (tab: MobileNavTab, categoryOrMode?: string) => {
    if (tab === 'list') {
      onTabChange(tab, categoryOrMode);
      onClose();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (categoryOrMode && onSelectCategory) {
      onSelectCategory(categoryOrMode);
    }
    onTabChange(tab, categoryOrMode);
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToolClick = (action?: () => void) => {
    onClose();
    if (action) {
      setTimeout(() => action(), 150);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex select-none">
      {/* Blurred Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer Container */}
      <aside
        className="relative w-[86vw] max-w-[340px] h-full bg-[#f8faf8] dark:bg-[#071d15] text-slate-800 dark:text-slate-100 flex flex-col shadow-2xl border-r border-emerald-200/80 dark:border-emerald-800/80 z-10 overflow-hidden animate-in slide-in-from-left duration-300 ease-out"
        role="dialog"
        aria-label="Navigation Menu"
      >
        {/* Top Header Banner */}
        <div className="p-4 bg-gradient-to-r from-[#041910] via-[#07291c] to-[#041910] text-white border-b border-emerald-800/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 p-1 flex items-center justify-center shrink-0 shadow-inner">
              <UKGLogoEmblem className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h2 className="font-serif-luxury font-black text-sm tracking-wide text-white leading-tight">
                Uttarakhand <span className="italic text-emerald-400">Gateways</span>
              </h2>
              <span className="text-[8px] font-extrabold tracking-widest text-emerald-300/90 uppercase block mt-0.5">
                {isHindi ? 'रियल एस्टेट पोर्टल' : 'Real Estate Portal'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Menu"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Status Bar */}
        <div className="px-4 py-3 bg-white dark:bg-[#09251b] border-b border-emerald-100 dark:border-emerald-900/60 shrink-0">
          {currentUser ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                  {String(currentUser.username || currentUser.contact || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.username || currentUser.contact}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-none mt-0.5">
                    {isHindi ? 'सत्यापित सदस्य' : 'Verified Member'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleNavClick('profile')}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
              >
                {isHindi ? 'प्रोफ़ाइल' : 'Profile'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {isHindi ? 'नमस्ते! अतिथि' : 'Welcome to UKG'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isHindi ? 'संपत्ति लिस्ट व संपर्क हेतु लॉगिन करें' : 'Sign in to list & contact owners'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAuthModal) onOpenAuthModal('login');
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isHindi ? 'लॉगिन' : 'Sign In'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 no-scrollbar">
          
          {/* Section 1: Main Shortcuts */}
          <div>
            <div className="px-2 mb-1.5 text-[9.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {isHindi ? 'मुख्य नेविगेशन' : 'Quick Navigation'}
            </div>
            <div className="space-y-1">
              {/* Home */}
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHindi ? 'होम पेज' : 'Home Marketplace'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Explore All */}
              <button
                type="button"
                onClick={() => handleNavClick('explore', 'All')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'explore'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHindi ? 'सभी संपत्तियां खोजें' : 'Explore All Listings'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Land & Plots */}
              <button
                type="button"
                onClick={() => handleNavClick('explore', 'Plot')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Mountain className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHindi ? 'जमीन और प्लॉट्स' : 'Verified Land & Plots'}</span>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200">
                  {isHindi ? 'नाली' : 'Nali'}
                </span>
              </button>

              {/* Buy Cottages & Villas */}
              <button
                type="button"
                onClick={() => handleNavClick('explore', 'Cottage')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHindi ? 'कॉटेज व विला' : 'Cottages & Villas'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Rent */}
              <button
                type="button"
                onClick={() => handleNavClick('explore', 'rent')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHindi ? 'किराये के मकान' : 'Rental Properties'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* List Property for Sale (Sale GUI) */}
              <button
                type="button"
                onClick={() => handleNavClick('list', 'sale')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-100/60 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  <span>{isHindi ? 'बिक्री हेतु लिस्ट करें (Sale)' : 'List For Sale (0% Brokerage)'}</span>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-700 text-white">
                  SALE
                </span>
              </button>

              {/* List Property for Rent (Rent GUI) */}
              <button
                type="button"
                onClick={() => handleNavClick('list', 'rent')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-teal-100/60 dark:bg-teal-950/80 border border-teal-300/80 dark:border-teal-800 text-teal-900 dark:text-teal-200 hover:bg-teal-100 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Key className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                  <span>{isHindi ? 'किराये हेतु लिस्ट करें (Rent)' : 'List For Rent (0% Brokerage)'}</span>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-teal-600 text-white">
                  RENT
                </span>
              </button>

              {/* Saved Properties */}
              <button
                type="button"
                onClick={() => handleNavClick('saved')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'saved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHindi ? 'सहेजी गई संपत्तियां' : 'Saved Listings'}</span>
                </div>
                {savedCount > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-rose-600 text-white">
                    {savedCount}
                  </span>
                )}
              </button>

              {/* 100% Real Listing Analytics */}
              <button
                type="button"
                onClick={() => handleNavClick('analytics')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHindi ? 'लिस्टिंग एनालिटिक्स (100% रियल)' : 'Listing Analytics (100% Real)'}</span>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                  REAL
                </span>
              </button>

              {/* Inbox Messages */}
              <button
                type="button"
                onClick={() => handleToolClick(onOpenInbox)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHindi ? 'संदेश व बातचीत' : 'Inbox Messages'}</span>
                </div>
                {unreadInboxCount > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-rose-600 text-white">
                    {unreadInboxCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Tools & Calculators */}
          <div>
            <div className="px-2 mb-1.5 text-[9.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {isHindi ? 'कैलकुलेटर और कानूनी नियम' : 'Calculators & Legal Tools'}
            </div>
            <div className="space-y-1">
              {/* Land Unit Converter */}
              <button
                type="button"
                onClick={() => handleToolClick(onOpenUnitConverter)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Calculator className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHindi ? 'नाली व क्षेत्रफल कैलकुलेटर' : 'Nali & Area Calculator'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Home Loan EMI */}
              <button
                type="button"
                onClick={() => handleToolClick(onOpenEmiCalculator)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHindi ? 'होम लोन ईएमआई कैलकुलेटर' : 'Home Loan & EMI Calculator'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Uttarakhand Land Laws */}
              <button
                type="button"
                onClick={() => handleToolClick(onOpenGuide)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Scale className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHindi ? 'उत्तराखंड भूमि खरीद नियम (धारा 154)' : 'Uttarakhand Land Laws & Rules'}</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                  Legal
                </span>
              </button>
            </div>
          </div>

          {/* Section 3: Popular Destinations */}
          <div>
            <div className="px-2 mb-1.5 text-[9.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {isHindi ? 'लोकप्रिय हिल स्टेशन' : 'Popular Destinations'}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {['Mussoorie', 'Dehradun', 'Nainital', 'Mukteshwar', 'Rishikesh', 'Almora'].map((cityName) => (
                <button
                  key={cityName}
                  type="button"
                  onClick={() => {
                    if (onSelectCity) onSelectCity(cityName);
                    handleNavClick('explore');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white dark:bg-[#0a271c] border border-emerald-100 dark:border-emerald-900/60 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-emerald-400 transition-all cursor-pointer truncate"
                >
                  <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{cityName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Settings & Legal */}
          <div>
            <div className="px-2 mb-1.5 text-[9.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              {isHindi ? 'प्राथमिकताएं व नियम' : 'Preferences & Legal'}
            </div>
            <div className="space-y-1">
              {/* Language Switch */}
              <button
                type="button"
                onClick={onToggleLanguage}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHindi ? 'भाषा (Language)' : 'Language'}</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {isHindi ? 'हिन्दी (Hindi)' : 'English'}
                </span>
              </button>

              {/* Dark / Light Mode */}
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
                    <span>{isHindi ? 'थीम मोड' : 'Appearance'}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {isDark ? (isHindi ? 'डार्क' : 'Dark') : (isHindi ? 'लाइट' : 'Light')}
                  </span>
                </button>
              )}

              {/* RERA & Compliance */}
              <button
                type="button"
                onClick={() => handleToolClick(() => onOpenLegalPolicy && onOpenLegalPolicy('rera'))}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>{isHindi ? 'रेरा व कानूनी नीतियां' : 'RERA & Legal Compliance'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Footer Action */}
        <div className="p-3 bg-white dark:bg-[#071c14] border-t border-emerald-100 dark:border-emerald-900/60 shrink-0">
          {currentUser ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              className="w-full py-2 px-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isHindi ? 'लॉग आउट' : 'Log Out'}</span>
            </button>
          ) : (
            <div className="text-center text-[10px] text-slate-400 dark:text-slate-500">
              Uttarakhand Gateways • 0% Brokerage
            </div>
          )}
        </div>

      </aside>
    </div>
  );
};
