import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Logo, UKGLogoEmblem } from './Logo';
import { 
  Bookmark, 
  Menu, 
  X, 
  Mail, 
  Sun, 
  Moon, 
  MessageSquare, 
  Calculator, 
  ExternalLink, 
  User as UserIcon,
  LogOut, 
  LogIn, 
  Trash2,
  Users,
  Crown,
  ArrowLeft,
  BarChart3,
  IndianRupee,
  Download,
  BookOpen,
  MapPin,
  ClipboardList,
  ChevronRight,
  Home,
  Compass,
  Key,
  PlusCircle,
  Globe,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isNativeAndroidApp } from '../config/apiConfig';
import { UserProfileModal } from './UserProfileModal';
import { SwitchAccountModal } from './SwitchAccountModal';
import { ListChooserModal } from './ListChooserModal';
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
  onOpenAdminDashboard?: () => void;
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
  onOpenRequirements?: () => void;
  onOpenSignIn?: () => void;
  onOpenRegister?: () => void;
  onOpenHomeLoanPage?: () => void;
  onDeleteAllProperties?: () => void;
  onNavigateGuides?: () => void;
  onNavigateCity?: (city: string) => void;
  onOpenAboutPage?: () => void;
  onOpenAssurancePage?: () => void;
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
  onOpenRequirements,
  onOpenSignIn,
  onOpenRegister,
  onOpenHomeLoanPage,
  isRentActive = false,
  isPropertyViewActive = false,
  onReturnToProperties,
  onBuyClick,
  onRentClick,
  onOpenInbox,
  onOpenCalculator,
  onOpenUnitConverter,
  onOpenEmiCalculator,
  onOpenDashboard,
  onOpenAdminAccounts,
  onOpenAdminDashboard,
  unreadInboxCount = 0,
  favoriteCount,
  onToggleFavoritesOnly,
  showingFavoritesOnly = false,
  theme,
  onToggleTheme,
  currentPage = 1,
  totalPages = 2,
  onPageChange,
  onNavigateGuides,
  onNavigateCity,
  onOpenAboutPage,
  onOpenAssurancePage,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showListChooserModal, setShowListChooserModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { language, toggleLanguage, isHindi } = useLanguage();
  const { currentUser, isOwner, savedAccounts, logout, openAuthModal, requireAuth, deleteAccount } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isDark = theme === 'dark';

  return (
    <header 
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[#FAF9F6]/95 dark:bg-[#032D1F]/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-[#32463D]/80 shadow-md shadow-emerald-950/5 dark:shadow-black/25' 
          : 'bg-[#FAF9F6]/95 dark:bg-[#032D1F]/95 sm:bg-gradient-to-b sm:from-[#FAF9F6]/95 sm:via-[#FAF9F6]/80 sm:to-transparent sm:dark:from-[#032D1F]/95 sm:dark:via-[#032D1F]/80 border-b border-emerald-100/70 sm:border-transparent dark:border-[#32463D]/60 shadow-xs sm:shadow-none'
      }`}
    >
      {/* 2. Main Navigation Bar Content */}
      <div className={`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 ${scrolled ? 'py-2 sm:py-2.5' : 'py-2.5 sm:py-3.5 md:py-4'}`}>
        <div className="flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Left-Side Menu Button — Just 3 Lines */}
            <button
              id="main-nav-menu-btn"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center p-1.5 sm:p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 transition-colors active:scale-95 cursor-pointer select-none shrink-0"
              aria-label="Toggle Navigation Menu"
              title={isHindi ? 'मेनू' : 'Menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-current stroke-[2.25] transition-transform duration-200" />
              ) : (
                <Menu className="w-6 h-6 text-emerald-700 dark:text-emerald-400 stroke-[2.25]" />
              )}
            </button>

            {/* Logo: Always takes to home page with Buy option selected */}
            <a 
              href="#hero" 
              onClick={(e) => { 
                e.preventDefault(); 
                if (onLogoClick) {
                  onLogoClick();
                } else {
                  if (isPropertyViewActive && onReturnToProperties) {
                    onReturnToProperties();
                  }
                  if (onBuyClick) {
                    onBuyClick();
                  }
                  scrollToSection('hero');
                }
              }}
              className="cursor-pointer outline-none border-0 ring-0 focus:outline-none select-none p-0.5 sm:p-1 flex-shrink-0"
            >
              <div className="hidden xl:block">
                <Logo size="lg" darkText={!isDark} />
              </div>
              <div className="hidden sm:block xl:hidden">
                <Logo size="md" darkText={!isDark} />
              </div>
              <div className="sm:hidden">
                <Logo size="sm" darkText={!isDark} />
              </div>
            </a>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            
            {/* DESKTOP UNIFIED UTILITY CLUSTER: Inbox, Saved, Theme, Language */}
            <div className="hidden lg:flex items-center gap-0.5 p-1 rounded-full bg-[#FAF9F6]/80 dark:bg-[#0C3628]/85 border border-emerald-200/80 dark:border-[#32463D]/80 shadow-xs">
              
              {/* Inbox Icon */}
              <button
                type="button"
                onClick={() => {
                  requireAuth(() => {
                    if (onOpenInbox) onOpenInbox();
                    else window.location.href = '/inbox';
                  }, isHindi ? 'संदेश और इनबॉक्स देखने हेतु लॉगिन आवश्यक है।' : 'Please sign in or register to access your Inbox.');
                }}
                className="relative p-1.5 xl:p-2 rounded-full hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-emerald-200 transition-colors cursor-pointer"
                title={isHindi ? "इनबॉक्स व संदेश" : "Direct Messages & Inbox"}
              >
                <MessageSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                {unreadInboxCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadInboxCount}
                  </span>
                )}
              </button>

              {/* Saved / Shortlist Icon */}
              {onToggleFavoritesOnly && (
                <button
                  id="favorites-toggle-btn"
                  onClick={() => {
                    onToggleFavoritesOnly();
                  }}
                  className={`relative p-1.5 xl:p-2 rounded-full hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer ${
                    showingFavoritesOnly ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-emerald-200'
                  }`}
                  title={showingFavoritesOnly ? (isHindi ? "सहेजे गए फ़िल्टर बंद करें" : "Exit Saved Filter") : (isHindi ? "सहेजी गई संपत्तियां" : "Saved Properties")}
                  aria-label="Saved properties"
                >
                  <Bookmark className={`w-4 h-4 ${showingFavoritesOnly ? 'fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400' : 'text-slate-600 dark:text-emerald-300'}`} />
                  {favoriteCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {favoriteCount}
                    </span>
                  )}
                </button>
              )}

              <span className="w-px h-3.5 bg-emerald-200/80 dark:bg-emerald-800/80 mx-0.5" />

              {/* Light / Dark Mode Toggle */}
              <button
                id="theme-toggle-btn"
                type="button"
                onClick={onToggleTheme}
                className="p-1.5 xl:p-2 rounded-full hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-emerald-200 transition-colors cursor-pointer focus:outline-none"
                title={isDark ? (isHindi ? "लाइट मोड" : "Switch to Light mode") : (isHindi ? "डार्क मोड" : "Switch to Dark mode")}
                aria-label={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-emerald-700 hover:-rotate-12 transition-transform" />
                )}
              </button>

              {/* Hindi / English Language Switcher - compact on laptop, full on large desktop */}
              <button
                id="lang-toggle-btn"
                type="button"
                onClick={() => { window.dispatchEvent(new CustomEvent('ukg_open_language_modal')); }}
                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer focus:outline-none select-none"
                title={isHindi ? 'Switch to English' : 'Switch to Hindi (हिन्दी)'}
                aria-label="Toggle language"
              >
                {isHindi ? (
                  <>
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black leading-none uppercase shadow-xs">
                      EN
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-emerald-200 hidden xl:inline">
                      English
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold leading-none shadow-xs">
                      अ
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-emerald-200 hidden xl:inline">
                      हिन्दी
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* UKG Assurance Link in Main Website Navigation */}
            <a
              id="main-nav-ukg-assurance"
              href="/ukg-assurance"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0 && onOpenAssurancePage) {
                  e.preventDefault();
                  onOpenAssurancePage();
                }
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-[#0E3A2B] dark:bg-[#0C3628] hover:bg-[#09281d] dark:hover:bg-emerald-900/80 text-[#FAF9F6] border border-[#C2A691]/40 font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap no-underline"
              title={isHindi ? 'यूकेजी एश्योरेंस - प्रॉपर्टी दस्तावेज़ समीक्षा व निरीक्षण' : 'UKG Assurance — Property Document Review & Inspection'}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C2A691] shrink-0" />
              <span>{isHindi ? 'यूकेजी एश्योरेंस' : 'UKG Assurance'}</span>
            </a>

            {/* Post Your Requirements Link in Main Navigation */}
            <a
              href="/requirements"
              target={isNativeAndroidApp() ? undefined : '_blank'}
              rel={isNativeAndroidApp() ? undefined : 'noopener noreferrer'}
              onClick={(e) => {
                if (isNativeAndroidApp() && onOpenRequirements) {
                  e.preventDefault();
                  onOpenRequirements();
                }
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-white/90 dark:bg-[#0C3628]/90 hover:bg-emerald-50 dark:hover:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200 border border-emerald-300/80 dark:border-[#32463D] font-bold text-xs shadow-2xs transition-all cursor-pointer whitespace-nowrap no-underline"
              title={isHindi ? 'अपनी प्रॉपर्टी आवश्यकता पोस्ट करें' : 'Post Your Requirements'}
            >
              <ClipboardList className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{isHindi ? 'आवश्यकता पोस्ट करें' : 'Post Your Requirements'}</span>
            </a>

            {/* Common List Button -> navigates to /list page */}
            <button
              type="button"
              onClick={() => {
                if (onOpenListChooser) {
                  onOpenListChooser();
                } else {
                  setShowListChooserModal(true);
                }
              }}
              className={`${isPropertyViewActive ? 'hidden sm:flex' : 'flex'} items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer ring-1 ring-emerald-300/40 whitespace-nowrap`}
              title={isHindi ? "प्रॉपर्टी बेचें" : "Sell Property"}
            >
              <span className="text-emerald-100 text-sm font-black">+</span>
              <span>{isHindi ? 'लिस्ट' : 'List'}</span>
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ml-0.5">
                FREE
              </span>
            </button>

            {/* Admin Console Button (Only for Platform Administrator) */}
            {isOwner && (
              <button
                type="button"
                onClick={() => {
                  if (onOpenAdminDashboard) onOpenAdminDashboard();
                  else if (onOpenAdminAccounts) onOpenAdminAccounts();
                  else window.location.href = '/admin';
                }}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black shadow-sm transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                title={isHindi ? 'एडमिन कंट्रोल पैनल खोलें' : 'Open Admin Dashboard'}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{isHindi ? 'एडमिन पैनल' : 'Admin Panel'}</span>
              </button>
            )}

            {/* User Account / Sign In State - Desktop */}
            {currentUser ? (
              <div className="hidden lg:flex items-center gap-1 pl-0.5">
                <button 
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full border text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95 ${
                    isOwner 
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200' 
                      : 'bg-emerald-100/90 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  }`}
                  title={isOwner ? 'Platform Administrator' : `${currentUser.username} - View profile & switch accounts`}
                >
                  <div className={`w-5 h-5 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-black uppercase shadow-xs ${
                    isOwner ? 'bg-gradient-to-tr from-amber-600 to-yellow-500 text-white' : 'bg-gradient-to-tr from-emerald-700 to-teal-600 text-white'
                  }`}>
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.username.charAt(0)
                    )}
                  </div>
                  <span className="max-w-[70px] xl:max-w-[90px] truncate">{currentUser.username}</span>
                  {isOwner && (
                    <Crown className="w-3 h-3 text-amber-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  title={isHindi ? 'लॉग आउट करें' : 'Log Out'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSignIn) onOpenSignIn();
                    else openAuthModal('login');
                  }}
                  className="px-2.5 py-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>{isHindi ? 'लॉग इन' : 'Sign In'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenRegister) onOpenRegister();
                    else openAuthModal('register');
                  }}
                  className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>{isHindi ? 'रजिस्टर' : 'Register'}</span>
                </button>
              </div>
            )}

            {/* Back Option in Nav Bar — compact & never clipped */}
            {isPropertyViewActive && onReturnToProperties && (
              <button
                type="button"
                onClick={onReturnToProperties}
                className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] sm:text-xs shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                title={isHindi ? 'मार्केटप्लेस पर वापस जाएं' : 'Back to Marketplace'}
              >
                <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white shrink-0" />
                <span>{isHindi ? 'वापस' : 'Back'}</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* App-Style Full-Height LEFT Side Menu Drawer (Portal to body so fixed inset-0 spans 100vh cleanly) */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex justify-start select-none">
          {/* Blurred Backdrop Overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          />

          {/* Full-Height Left Side Drawer Container */}
          <aside
            className="relative w-[86vw] max-w-[350px] h-full bg-[#FAF9F6] dark:bg-[#032D1F] text-[#0E3A2B] dark:text-[#F4F3EF] flex flex-col shadow-2xl border-r border-emerald-200/80 dark:border-[#32463D] z-10 overflow-hidden animate-in slide-in-from-left duration-300 ease-out"
            role="dialog"
            aria-label="Navigation Side Menu"
          >
            {/* Top Header Banner */}
            <div className="p-4 bg-gradient-to-r from-[#032D1F] via-[#0E3A2B] to-[#032D1F] text-[#F4F3EF] border-b border-[#32463D]/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#032D1F] ring-1 ring-[#AA8F7C]/60 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                  <UKGLogoEmblem className="w-10 h-10 object-cover scale-[1.03]" />
                </div>
                <div>
                  <h2 className="font-serif-luxury font-black text-[17px] sm:text-lg tracking-[0.03em] text-[#F4F3EF] leading-tight whitespace-nowrap">
                    Uttarakhand <span className="italic text-[#C2A691]">Gateways</span>
                  </h2>
                  <span className="text-[9px] font-extrabold tracking-[0.28em] text-[#AA8F7C] uppercase block mt-0.5">
                    {isHindi ? 'रियल एस्टेट पोर्टल' : 'Real Estate Portal'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Side Menu"
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Status Bar */}
            <div className="px-4 py-3 bg-white dark:bg-[#09251b] border-b border-emerald-100 dark:border-emerald-900/60 shrink-0">
              {currentUser ? (
                <div className="flex items-center justify-between gap-2">
                  <div
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowProfileModal(true);
                    }}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-lg overflow-hidden text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs ${
                      isOwner ? 'bg-gradient-to-tr from-amber-600 to-yellow-500' : 'bg-emerald-600'
                    }`}>
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
                      ) : (
                        String(currentUser.username || currentUser.contact || 'U')[0].toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                        <span className="truncate">{currentUser.username || currentUser.contact}</span>
                        {isOwner && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                        {currentUser.contact}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowProfileModal(true);
                    }}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:underline shrink-0 cursor-pointer"
                  >
                    {isHindi ? 'प्रोफ़ाइल' : 'Profile'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs min-w-0">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      {isHindi ? 'नमस्ते! अतिथि' : 'Welcome to UKG'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isHindi ? 'सभी सुविधाओं हेतु लॉगिन करें' : 'Sign in to post & manage listings'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onOpenSignIn) onOpenSignIn();
                        else openAuthModal('login');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'लॉग इन' : 'Sign In'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onOpenRegister) onOpenRegister();
                        else openAuthModal('register');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-[11px] shadow-xs cursor-pointer"
                    >
                      <span>{isHindi ? 'रजिस्टर' : 'Register'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Side Menu Items */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAdminDashboard) onOpenAdminDashboard();
                    else if (onOpenAdminAccounts) onOpenAdminAccounts();
                    else window.location.href = '/admin';
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Crown className="w-4 h-4 text-slate-950" />
                    <span>{isHindi ? 'एडमिन कंट्रोल पैनल' : 'Admin Control Panel'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-900" />
                </button>
              )}

              {/* GROUP 1: Dashboard, Messages, Saved Listings */}
              <div className="space-y-1">
                {/* 1. Dashboard (includes listing and analytics) */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (!currentUser) {
                      openAuthModal('login', isHindi ? 'डैशबोर्ड देखने हेतु कृपया लॉगिन करें।' : 'Please sign in to access your Dashboard (Listings & Analytics).');
                      return;
                    }
                    if (onOpenDashboard) onOpenDashboard();
                    else window.location.href = '/dashboard';
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-100 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="text-left min-w-0">
                      <span className="block leading-tight">{isHindi ? 'डैशबोर्ड' : 'Dashboard'}</span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-emerald-300/75 block">
                        {isHindi ? 'मेरी लिस्टिंग और विश्लेषण' : 'Listings & Analytics'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </button>

                {/* 2. Messages */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    requireAuth(() => {
                      if (onOpenInbox) onOpenInbox();
                      else window.location.href = '/inbox';
                    }, isHindi ? 'संदेश देखने हेतु लॉगिन आवश्यक है।' : 'Please sign in or register to access your Messages.');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-100 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'संदेश (Messages)' : 'Messages'}</span>
                  </div>
                  {unreadInboxCount > 0 ? (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-600 text-white">
                      {unreadInboxCount}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  )}
                </button>

                {/* 3. Saved Listings */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onToggleFavoritesOnly) onToggleFavoritesOnly();
                    else window.location.href = '/';
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    showingFavoritesOnly
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bookmark className={`w-4 h-4 ${showingFavoritesOnly ? 'fill-white text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                    <span>{isHindi ? 'सहेजी गई संपत्तियां' : 'Saved Listings'}</span>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    showingFavoritesOnly ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                  }`}>
                    {favoriteCount}
                  </span>
                </button>
              </div>

              {/* BORDER */}
              <hr className="border-0 border-t border-emerald-200/90 dark:border-emerald-800/80 my-2" />

              {/* GROUP 2: UKG Calculator, UKG Assurance, Post Your Requirement, List your property */}
              <div className="space-y-1">
                {/* 4. UKG Calculator */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const calcEl = document.getElementById('calculator-section');
                    if (calcEl) {
                      calcEl.scrollIntoView({ behavior: 'smooth' });
                    } else if (onOpenUnitConverter) {
                      onOpenUnitConverter();
                    } else if (onOpenCalculator) {
                      onOpenCalculator();
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-100 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'यूकेजी कैलकुलेटर' : 'UKG Calculator'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                {/* 5. UKG Assurance */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAssurancePage) onOpenAssurancePage();
                    else window.location.href = '/ukg-assurance';
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-100 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'यूकेजी एश्योरेंस' : 'UKG Assurance'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                {/* 6. Post Your Requirement */}
                <a
                  href="/requirements"
                  target={isNativeAndroidApp() ? undefined : '_blank'}
                  rel={isNativeAndroidApp() ? undefined : 'noopener noreferrer'}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    if (isNativeAndroidApp() && onOpenRequirements) {
                      e.preventDefault();
                      onOpenRequirements();
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-800 dark:text-slate-100 transition-all cursor-pointer no-underline"
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'अपनी आवश्यकता पोस्ट करें' : 'Post Your Requirement'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </a>

                {/* 7. List your property */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenListChooser) onOpenListChooser();
                    else setShowListChooserModal(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/75 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                    <span>{isHindi ? 'अपनी प्रॉपर्टी लिस्ट करें' : 'List your property'}</span>
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-600 text-white">
                    FREE
                  </span>
                </button>
              </div>

              {/* BORDER */}
              <hr className="border-0 border-t border-emerald-200/90 dark:border-emerald-800/80 my-2" />

              {/* GROUP 3: Marketplace, Guides, About Us, Cities & Settings */}
              <div className="space-y-1">
                {isPropertyViewActive && onReturnToProperties && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onReturnToProperties();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-xs transition-all cursor-pointer mb-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <ArrowLeft className="w-4 h-4 text-white" />
                      <span>{isHindi ? 'मार्केटप्लेस पर वापस जाएं' : 'Back to Marketplace'}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-80" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onLogoClick) onLogoClick();
                    else window.location.href = '/';
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'होम मार्केटप्लेस' : 'Home Marketplace'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onBuyClick) onBuyClick();
                    else window.location.href = '/buy';
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'प्रॉपर्टी खरीदें (Buy)' : 'Buy Properties'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onRentClick) onRentClick();
                    else window.location.href = '/rent';
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'किराये की संपत्तियां (Rent)' : 'Rental Properties'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigateGuides) onNavigateGuides();
                    else window.location.href = '/guides';
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'उत्तराखंड भूमि गाइड' : 'Property Guides'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAboutPage) onOpenAboutPage();
                    else window.location.href = '/about';
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'हमारे बारे में और संपर्क' : 'About Us & Contact'}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>

              {/* Popular Destinations */}
              <div className="pt-1">
                <div className="px-2 mb-1.5 text-[9.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {isHindi ? 'लोकप्रिय शहर' : 'Popular Destinations'}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Dehradun', 'Rishikesh', 'Haridwar', 'Mussoorie', 'Nainital', 'Mukteshwar', 'Haldwani', 'Almora'].map((cityName) => (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onNavigateCity) onNavigateCity(cityName);
                        else window.location.href = '/properties-in-' + cityName.toLowerCase();
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white dark:bg-[#0a271c] border border-emerald-100 dark:border-emerald-900/60 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-emerald-400 transition-all cursor-pointer truncate"
                    >
                      <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">{cityName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div className="pt-1">
                <div className="px-2 mb-1 text-[9.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {isHindi ? 'प्राथमिकताएं' : 'Preferences'}
                </div>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('ukg_open_language_modal'));
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{isHindi ? 'भाषा (Language)' : 'Language'}</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {isHindi ? 'हिन्दी (Hindi)' : 'English'}
                    </span>
                  </button>

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

                  <a
                    href="mailto:ukg@uttarakhandgateways.com"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 transition-all no-underline"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">ukg@uttarakhandgateways.com</span>
                    </div>
                    <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Footer Action */}
            <div className="p-3 bg-[#FAF9F6] dark:bg-[#0C3628] border-t border-emerald-100 dark:border-[#32463D] shrink-0">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'लॉग आउट' : 'Log Out'}</span>
                </button>
              ) : (
                <div className="text-center text-[10px] text-slate-400 dark:text-slate-500">
                  Uttarakhand Gateways • NO PLATFORM FEE
                </div>
              )}
            </div>
          </aside>
        </div>,
        document.body
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-[#071c14] border border-rose-300 dark:border-rose-900/80 rounded-3xl p-6 shadow-2xl text-slate-800 dark:text-slate-100 modal-animate-pop">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-center text-slate-900 dark:text-white mb-2">
              {isHindi ? 'खाता स्थायी रूप से हटाएं?' : 'Delete Account Permanently?'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 text-center mb-6 leading-relaxed">
              {isHindi 
                ? `क्या आप वाकई ${currentUser?.username} (${currentUser?.contact}) का खाता हटाना चाहते हैं? आपकी सभी संपत्तियां व डेटा इस डिवाइस से हटा दिए जाएंगे।` 
                : `Are you sure you want to permanently delete your account (${currentUser?.username} - ${currentUser?.contact})? All your properties will also be removed.`
              }
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteAccount();
                  setShowDeleteModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                {isHindi ? 'खाता हटाएं' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Management Modal */}
      <UserProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        allProperties={allProperties}
        onSelectProperty={onSelectProperty}
        onEditProperty={onEditProperty}
        onDeleteProperty={onDeleteProperty}
        onDeleteAllProperties={onDeleteAllProperties}
        onOpenSellModal={onOpenSellModal}
        onOpenRentalModal={onOpenRentalModal}
        onOpenDashboard={onOpenDashboard}
        onOpenAdminDashboard={onOpenAdminDashboard}
        onOpenSwitchAccount={() => {
          setShowProfileModal(false);
          setShowSwitchAccountModal(true);
        }}
      />

      {/* Multi-Account Switching Modal */}
      <SwitchAccountModal
        isOpen={showSwitchAccountModal}
        onClose={() => setShowSwitchAccountModal(false)}
        onAddNewAccount={() => openAuthModal('login')}
      />

      {/* Common List Chooser Modal */}
      <ListChooserModal
        isOpen={showListChooserModal}
        onClose={() => setShowListChooserModal(false)}
        onSelectSale={() => {
          if (onOpenSellModal) onOpenSellModal();
        }}
        onSelectRent={() => {
          if (onOpenRentalModal) onOpenRentalModal();
        }}
      />

      {/* Logout Warning Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          logout();
          setShowLogoutConfirm(false);
        }}
      />
    </header>
  );
};
