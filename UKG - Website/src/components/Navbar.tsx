import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './Logo';
import { BuyHouseIcon } from './BuyHouseIcon';
import { 
  Settings as SettingsIcon,
  CircleUserRound as UserIcon,
  Menu, 
  X, 
  Sun, 
  Moon, 
  Globe, 
  Compass, 
  Scale, 
  ShieldCheck, 
  Crown, 
  LogOut, 
  LogIn, 
  RotateCcw,
  Building2,
  Bookmark, 
  MessageSquare,
  HelpCircle,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserProfileModal } from './UserProfileModal';
import { SwitchAccountModal } from './SwitchAccountModal';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { Property } from '../types';

interface NavbarProps {
  onLogoClick?: () => void;
  allProperties?: Property[];
  onSelectProperty?: (property: Property) => void;
  onEditProperty?: (property: Property) => void;
  onDeleteProperty?: (id: string) => void;
  onOpenEmiCalculator?: () => void;
  onOpenUnitConverter?: () => void;
  onOpenCalculator?: () => void;
  onOpenDashboard?: () => void;
  onOpenSellModal?: () => void;
  onOpenRentalModal?: () => void;
  isRentActive?: boolean;
  isPropertyViewActive?: boolean;
  onReturnToProperties?: () => void;
  onBuyClick?: () => void;
  onRentClick?: () => void;
  onOpenInbox?: () => void;
  onOpenAdminAccounts?: () => void;
  onOpenLegalPolicy?: (policyId?: any) => void;
  onOpenGuide?: () => void;
  unreadInboxCount?: number;
  favoriteCount: number;
  onToggleFavoritesOnly?: () => void;
  showingFavoritesOnly?: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onOpenListChooser?: () => void;
  onDeleteAllProperties?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLogoClick,
  allProperties = [],
  onSelectProperty,
  onEditProperty,
  onDeleteProperty,
  onDeleteAllProperties,
  onOpenSellModal,
  onOpenRentalModal,
  onOpenListChooser,
  isRentActive = false,
  isPropertyViewActive = false,
  onReturnToProperties,
  onBuyClick,
  onRentClick,
  onOpenInbox,
  onOpenCalculator,
  onOpenEmiCalculator,
  onOpenDashboard,
  onOpenAdminAccounts,
  onOpenLegalPolicy,
  onOpenGuide,
  unreadInboxCount = 0,
  favoriteCount,
  onToggleFavoritesOnly,
  showingFavoritesOnly = false,
  theme,
  onToggleTheme,
  currentPage = 1,
  totalPages = 2,
  onPageChange,
  onOpenUnitConverter,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const settingsRef = useRef<HTMLDivElement>(null);
  const { language, toggleLanguage, isHindi } = useLanguage();
  const { currentUser, isOwner, logout, openAuthModal, requireAuth } = useAuth();
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close settings dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    if (settingsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [settingsOpen]);

  const handleReturnHome = () => {
    setMobileMenuOpen(false);
    setSettingsOpen(false);
    if (onLogoClick) {
      onLogoClick();
    } else {
      if (isPropertyViewActive && onReturnToProperties) {
        onReturnToProperties();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <header 
        id="main-navbar"
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-[#061811]/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-emerald-950/80 py-2.5 sm:py-3 shadow-md shadow-emerald-950/5 dark:shadow-black/20' 
            : 'bg-white/90 dark:bg-[#061811]/90 backdrop-blur-md border-b border-emerald-100/60 dark:border-emerald-950/40 py-3 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* LEFT SIDE: Website Logo & Brand Name (Clicking returns to homepage) */}
            <div className="flex items-center gap-3">
              <a 
                href="/" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  handleReturnHome();
                }}
                className="cursor-pointer outline-none border-0 ring-0 focus:outline-none select-none flex items-center gap-2.5 group"
                title={isHindi ? "होमपेज पर वापस जाएं" : "Return to Homepage"}
              >
                <Logo size="md" darkText={!isDark} />
              </a>
            </div>

            {/* RIGHT SIDE: Settings Button + Profile/Account Access + Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              
              {/* SETTINGS BUTTON & DROPDOWN */}
              <div className="relative" ref={settingsRef}>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  aria-expanded={settingsOpen}
                  aria-label={isHindi ? "सेटिंग्स खोलें" : "Open Settings"}
                  className={`p-2 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 border text-xs font-bold transition-all cursor-pointer ${
                    settingsOpen 
                      ? 'bg-emerald-100 dark:bg-emerald-950/90 border-emerald-400 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 shadow-xs' 
                      : 'bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                  title={isHindi ? "सेटिंग्स (थीम, भाषा, मापन)" : "Settings (Theme, Language, Units)"}
                >
                  <SettingsIcon className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 transition-transform ${settingsOpen ? 'rotate-90' : 'group-hover:rotate-45'}`} />
                  <span className="hidden md:inline">{isHindi ? 'सेटिंग्स' : 'Settings'}</span>
                </button>

                {/* Settings Popover Menu */}
                {settingsOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#071f17] rounded-2xl shadow-2xl border border-emerald-200 dark:border-emerald-900/80 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        {isHindi ? 'प्लेटफ़ॉर्म प्राथमिकताएं' : 'Platform Preferences'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isHindi ? 'थीम, भाषा और क्षेत्रीय मापन सेटिंग्स' : 'Theme, language and regional unit settings'}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      {/* 1. Theme Switch */}
                      <button
                        type="button"
                        onClick={() => {
                          onToggleTheme();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-left font-semibold"
                      >
                        <div className="flex items-center gap-2.5">
                          {isDark ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Moon className="w-4 h-4 text-emerald-700" />
                          )}
                          <span>{isHindi ? 'थीम (Appearance)' : 'Appearance'}</span>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {isDark ? (isHindi ? 'डार्क' : 'Dark') : (isHindi ? 'लाइट' : 'Light')}
                        </span>
                      </button>

                      {/* 2. Language Switch */}
                      <button
                        type="button"
                        onClick={() => {
                          toggleLanguage();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-left font-semibold"
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>{isHindi ? 'भाषा (Language)' : 'Language'}</span>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300">
                          {isHindi ? 'हिन्दी (Hindi)' : 'English'}
                        </span>
                      </button>

                      {/* 3. Land Units Converter Modal trigger */}
                      {onOpenUnitConverter && (
                        <button
                          type="button"
                          onClick={() => {
                            setSettingsOpen(false);
                            onOpenUnitConverter();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-left font-semibold"
                        >
                          <div className="flex items-center gap-2.5">
                            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>{isHindi ? 'भूमि मापन कनवर्टर' : 'Land Unit Converter'}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            नाली / गज
                          </span>
                        </button>
                      )}

                      {/* 4. Legal & Land Laws Guide */}
                      {onOpenLegalPolicy && (
                        <button
                          type="button"
                          onClick={() => {
                            setSettingsOpen(false);
                            onOpenLegalPolicy('rules');
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-left font-semibold"
                        >
                          <div className="flex items-center gap-2.5">
                            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>{isHindi ? 'भूमि नियम व अनुपालन गाइड' : 'Land Laws & Compliance'}</span>
                          </div>
                        </button>
                      )}

                      {/* 5. Owner Admin Accounts (Only for Platform Owner) */}
                      {isOwner && onOpenAdminAccounts && (
                        <button
                          type="button"
                          onClick={() => {
                            setSettingsOpen(false);
                            onOpenAdminAccounts();
                          }}
                          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-950 dark:text-amber-200 transition-colors cursor-pointer text-left font-bold"
                        >
                          <div className="flex items-center gap-2.5">
                            <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>{isHindi ? 'व्यवस्थापक खाते (Owner)' : 'Admin Directory'}</span>
                          </div>
                          <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black uppercase">
                            Admin
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Account Controls if logged in */}
                    {currentUser && (
                      <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSettingsOpen(false);
                            setShowSwitchAccountModal(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer text-left"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isHindi ? 'खाता बदलें' : 'Switch Account'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSettingsOpen(false);
                            setShowLogoutConfirm(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{isHindi ? 'लॉगआउट करें' : 'Sign Out'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PROFILE / ACCOUNT ACCESS BUTTON */}
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300/80 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  title={`${currentUser.username} - View Profile`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center text-[11px] font-black uppercase shadow-xs">
                    {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.username}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 active:scale-95 cursor-pointer"
                  title={isHindi ? "लॉगिन या साइन अप" : "Sign In or Register"}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{isHindi ? 'लॉगिन' : 'Sign In'}</span>
                </button>
              )}

              {/* RESPONSIVE MOBILE MENU BUTTON */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* RESPONSIVE MOBILE DRAWER MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-emerald-100 dark:border-emerald-950/80 bg-white/95 dark:bg-[#071f17]/95 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-4 duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onBuyClick) onBuyClick();
                }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white flex items-center gap-2 hover:border-emerald-400"
              >
                <BuyHouseIcon className="w-4 h-4 text-emerald-600" />
                <span>{isHindi ? 'प्रॉपर्टी खरीदें' : 'Buy Properties'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onRentClick) onRentClick();
                }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white flex items-center gap-2 hover:border-emerald-400"
              >
                <Compass className="w-4 h-4 text-teal-600" />
                <span>{isHindi ? 'किराए पर लें' : 'Rent Homes'}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('land-plots-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full p-2.5 rounded-lg text-left text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>{isHindi ? 'जमीन और प्लॉट्स' : 'Land & Plots'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('trending-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full p-2.5 rounded-lg text-left text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>{isHindi ? 'ट्रेंडिंग संपत्तियां' : 'Trending Properties'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('emi-calculator-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full p-2.5 rounded-lg text-left text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 flex items-center gap-2"
              >
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>{isHindi ? 'ईएमआई कैलकुलेटर' : 'EMI Calculator'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('land-calculator-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full p-2.5 rounded-lg text-left text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>{isHindi ? 'क्षेत्रफल कैलकुलेटर' : 'Area Calculator'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const el = document.getElementById('about-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full p-2.5 rounded-lg text-left text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 flex items-center gap-2"
              >
                <Info className="w-4 h-4 text-emerald-600" />
                <span>{isHindi ? 'हमारे बारे में' : 'About Us'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onOpenSwitchAccount={() => {
            setShowProfileModal(false);
            setShowSwitchAccountModal(true);
          }}
        />
      )}

      {/* Switch Account Modal */}
      {showSwitchAccountModal && (
        <SwitchAccountModal
          isOpen={showSwitchAccountModal}
          onClose={() => setShowSwitchAccountModal(false)}
          onAddNewAccount={() => {
            setShowSwitchAccountModal(false);
            openAuthModal('login');
          }}
        />
      )}

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <LogoutConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            logout();
          }}
        />
      )}
    </>
  );
};
