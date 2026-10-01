import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
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
  Globe,
  User as UserIcon,
  LogOut,
  LogIn
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenEmiCalculator?: () => void;
  onOpenUnitConverter?: () => void;
  onOpenCalculator?: () => void;
  onOpenSellModal?: () => void;
  onOpenInbox?: () => void;
  unreadInboxCount?: number;
  favoriteCount: number;
  onToggleFavoritesOnly?: () => void;
  showingFavoritesOnly?: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSellModal,
  onOpenInbox,
  onOpenCalculator,
  unreadInboxCount = 0,
  favoriteCount,
  onToggleFavoritesOnly,
  showingFavoritesOnly = false,
  theme,
  onToggleTheme,
  currentPage = 1,
  totalPages = 2,
  onPageChange,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage, isHindi } = useLanguage();
  const { currentUser, logout, openAuthModal, requireAuth } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          ? 'bg-white/95 dark:bg-[#061811]/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-emerald-950/80 py-2.5 sm:py-3 shadow-md shadow-emerald-950/5 dark:shadow-black/20' 
          : 'bg-gradient-to-b from-white/95 via-white/80 to-transparent dark:from-[#061811]/95 dark:via-[#061811]/80 py-3 sm:py-4 md:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2">
          
          {/* Logo - outline/ring removed */}
          <a 
            href="#hero" 
            onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
            className="cursor-pointer outline-none border-0 ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none active:outline-none select-none [-webkit-tap-highlight-color:transparent] p-0.5 sm:p-1 flex-shrink-0"
          >
            <div className="hidden sm:block">
              <Logo size="lg" darkText={!isDark} />
            </div>
            <div className="sm:hidden">
              <Logo size="md" darkText={!isDark} />
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700 dark:text-emerald-100">
            <button 
              onClick={() => scrollToSection('hero')} 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              {isHindi ? 'होम' : 'Home'}
            </button>
            <button 
              onClick={() => scrollToSection('properties-section')} 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              {isHindi ? 'संपत्तियां' : 'Properties'}
            </button>
            <button 
              onClick={() => scrollToSection('about-section')} 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              {isHindi ? 'हमारे बारे में' : 'About Us'}
            </button>
            <button 
              onClick={() => scrollToSection('contact-section')} 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              {isHindi ? 'संपर्क' : 'Contact'}
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Sell Button - ALWAYS VISIBLE on both Mobile & Desktop */}
            {onOpenSellModal && (
              <button
                type="button"
                onClick={() => requireAuth(() => onOpenSellModal(), isHindi ? 'संपत्ति लिस्ट करने हेतु कृपया पहले लॉगिन या रजिस्टर करें।' : 'Please sign in or register to list your property.')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                title={isHindi ? "अपनी संपत्ति बेचें या लिस्ट करें (0% ब्रोकरेज)" : "Sell or List Your Property (0% Brokerage)"}
              >
                <span className="text-emerald-200 text-xs sm:text-sm">✦</span>
                <span>{isHindi ? 'संपत्ति बेचें' : 'Sell'}</span>
              </button>
            )}

            {/* Mobile Menu Option Button - VISIBLE ONLY ON MOBILE */}
            <button
              id="mobile-menu-btn"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-[#0a271d] text-slate-800 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-[#0f3427] border border-emerald-300/80 dark:border-emerald-800 text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
              aria-label="Toggle Navigation Menu"
              title="Menu Options"
            >
              {mobileMenuOpen ? (
                <>
                  <X className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>{isHindi ? 'बंद करें' : 'Close'}</span>
                </>
              ) : (
                <>
                  <Menu className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>{isHindi ? 'मेनू' : 'Menu'}</span>
                </>
              )}
            </button>

            {/* DESKTOP-ONLY FEATURES */}
            
            {/* Inbox & Chat Button - Desktop Only */}
            <button
              type="button"
              onClick={() => {
                requireAuth(() => {
                  window.open('?page=inbox', '_blank');
                }, isHindi ? 'संदेश और इनबॉक्स देखने हेतु लॉगिन आवश्यक है।' : 'Please sign in or register to access your Inbox.');
              }}
              className="hidden lg:flex relative items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50/80 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-200 transition-all cursor-pointer shadow-xs"
              title={isHindi ? "संदेश और बातचीत खोलें" : "Open Direct Messages & Phone Requests in New Tab"}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? 'इनबॉक्स' : 'Inbox'}</span>
              {unreadInboxCount > 0 ? (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {unreadInboxCount}
                </span>
              ) : (
                <ExternalLink className="w-3 h-3 text-emerald-600/70 dark:text-emerald-400/70" />
              )}
            </button>

            {/* Calculator Button - Desktop Only */}
            <button
              type="button"
              onClick={() => {
                if (onOpenCalculator) onOpenCalculator();
                else scrollToSection('calculator-section');
              }}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-50/80 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800 text-xs font-semibold text-emerald-900 dark:text-emerald-200 transition-all cursor-pointer shadow-xs"
              title={isHindi ? "भूमि मापन कैलकुलेटर खोलें" : "Open UKG Land Measurement Calculator"}
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? 'भूमि कैलकुलेटर' : 'Land Calculator'}</span>
            </button>

            {/* Light / Dark Mode Toggle Button - Desktop Only */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={onToggleTheme}
              className="hidden lg:flex p-2 rounded-full border bg-white/90 dark:bg-[#0a271d] border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-[#0f3427] transition-all cursor-pointer focus:outline-none shadow-xs"
              title={isDark ? (isHindi ? "लाइट मोड में बदलें" : "Switch to Light mode") : (isHindi ? "डार्क मोड में बदलें" : "Switch to Dark mode")}
              aria-label={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Hindi / English Language Toggle - Desktop */}
            <button
              id="lang-toggle-btn"
              type="button"
              onClick={toggleLanguage}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white/90 dark:bg-[#0a271d] border-emerald-200 dark:border-emerald-800 text-xs font-bold text-slate-800 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-[#0f3427] transition-all cursor-pointer shadow-xs focus:outline-none"
              title={language === 'en' ? 'Switch to Hindi (हिन्दी में बदलें)' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Save for Later Button - Desktop Only */}
            {onToggleFavoritesOnly && (
              <button
                id="favorites-toggle-btn"
                onClick={() => {
                  requireAuth(() => onToggleFavoritesOnly(), isHindi ? 'सहेजी गई संपत्तियां देखने हेतु लॉगिन या रजिस्टर करें।' : 'Please sign in or register to view saved properties.');
                }}
                className={`hidden lg:flex relative items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer focus:outline-none ${
                  showingFavoritesOnly
                    ? 'bg-rose-500 border-rose-400 text-white shadow-md shadow-rose-950/20'
                    : 'bg-white/80 dark:bg-[#0a271d] border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-[#0f3427] shadow-xs'
                }`}
                title={showingFavoritesOnly ? (isHindi ? "सभी संपत्तियां देखें" : "Show All Properties") : (isHindi ? "सहेजी गई संपत्तियां देखें" : "View Saved Properties")}
                aria-label="Saved properties"
              >
                <Bookmark className={`w-3.5 h-3.5 ${showingFavoritesOnly ? 'fill-white text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{isHindi ? 'सहेजे गए' : 'Saved'}</span>
                {favoriteCount > 0 && (
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {favoriteCount}
                  </span>
                )}
              </button>
            )}

            {/* User Account / Sign In State - Desktop */}
            {currentUser ? (
              <div className="hidden lg:flex items-center gap-1.5 pl-1.5 border-l border-emerald-200 dark:border-emerald-800">
                <div 
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-950 dark:text-emerald-200 shadow-xs"
                  title={`${currentUser.username} (${currentUser.contact})`}
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center text-[10px] font-black uppercase shadow-xs">
                    {currentUser.username.charAt(0)}
                  </div>
                  <span className="max-w-[70px] truncate">{currentUser.username}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                  title={isHindi ? 'लॉग आउट करें' : 'Log Out'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="hidden lg:flex items-center px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <span>{isHindi ? 'लॉग इन' : 'Login'}</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu - Contains all options with pure Hindi translation */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 px-3.5 pt-3 pb-6 bg-white/98 dark:bg-[#071c14]/98 backdrop-blur-2xl border-b border-emerald-200 dark:border-emerald-950 shadow-2xl animate-in slide-in-from-top-2 duration-200 text-slate-800 dark:text-slate-100 max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col space-y-2.5">
            
            {/* Mobile User Profile or Login/Register Card */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              {currentUser ? (
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center font-black text-sm uppercase shadow-xs">
                    {currentUser.username.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      {currentUser.username}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate max-w-[150px]">
                      {currentUser.contact}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    {isHindi ? 'खाता लॉगिन नहीं है' : 'Guest User'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {isHindi ? 'सभी सुविधाओं हेतु लॉगिन करें' : 'Sign in to access all features'}
                  </span>
                </div>
              )}

              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'लॉग आउट' : 'Logout'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  <span>{isHindi ? 'लॉग इन' : 'Login'}</span>
                </button>
              )}
            </div>

            {/* Quick Actions Header / Badges */}
            <div className="grid grid-cols-2 gap-2 pb-1">
              {/* 1. Saved for Later (Favorites) */}
              {onToggleFavoritesOnly && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    requireAuth(() => onToggleFavoritesOnly(), isHindi ? 'सहेजी गई संपत्तियां देखने हेतु लॉगिन या रजिस्टर करें।' : 'Please sign in or register to view saved properties.');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer border ${
                    showingFavoritesOnly
                      ? 'bg-rose-500 text-white border-rose-400 shadow-xs'
                      : 'bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-900/60 hover:bg-rose-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Bookmark className={`w-3.5 h-3.5 ${showingFavoritesOnly ? 'fill-white text-white' : 'fill-rose-500 text-rose-500'}`} />
                    <span>{isHindi ? 'सहेजे गए' : 'Saved'}</span>
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    showingFavoritesOnly ? 'bg-white/20 text-white' : 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100'
                  }`}>
                    {favoriteCount}
                  </span>
                </button>
              )}

              {/* 2. Direct Inbox & Messages */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  requireAuth(() => {
                    window.open('?page=inbox', '_blank');
                  }, isHindi ? 'संदेश और इनबॉक्स देखने हेतु लॉगिन आवश्यक है।' : 'Please sign in or register to access your Inbox.');
                }}
                className="p-2.5 bg-emerald-50/80 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs cursor-pointer"
              >
                <span className="flex items-center gap-1.5 truncate">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isHindi ? 'इनबॉक्स' : 'Inbox'}</span>
                </span>
                {unreadInboxCount > 0 ? (
                  <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                    {unreadInboxCount}
                  </span>
                ) : (
                  <ExternalLink className="w-3 h-3 text-emerald-600/70" />
                )}
              </button>
            </div>

            {/* 3. Land Measurement Calculator Option */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenCalculator) onOpenCalculator();
                else scrollToSection('calculator-section');
              }}
              className="text-left py-2.5 px-3 bg-white dark:bg-[#0a271d] hover:bg-emerald-50 dark:hover:bg-[#0f3427] rounded-xl text-sm font-bold flex items-center justify-between text-slate-800 dark:text-emerald-100 border border-emerald-200/80 dark:border-emerald-800 cursor-pointer shadow-xs"
              title="Open UKG Land Measurement Calculator"
            >
              <span className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'भूमि कैलकुलेटर' : 'UKG Land Calculator'}</span>
              </span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold border border-emerald-200 dark:border-emerald-800">
                {isHindi ? 'सभी इकाइयां' : 'Any Unit'}
              </span>
            </button>

            {/* 4. Hindi / English Language Option */}
            <div className="flex items-center justify-between py-2 px-3 bg-white dark:bg-[#0a271d] rounded-xl border border-emerald-200/80 dark:border-emerald-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-700 dark:text-emerald-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'भाषा (Language)' : 'Language / भाषा'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  toggleLanguage();
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-200 cursor-pointer hover:bg-emerald-200"
              >
                <span>{language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}</span>
              </button>
            </div>

            {/* 5. Light / Dark Display Theme Option */}
            <div className="flex items-center justify-between py-2 px-3 bg-white dark:bg-[#0a271d] rounded-xl border border-emerald-200/80 dark:border-emerald-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-700 dark:text-emerald-200 flex items-center gap-2">
                {isDark ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>{isHindi ? 'थीम बदलें' : 'Display Theme'}</span>
              </span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-[#071c14] border border-emerald-200 dark:border-emerald-700 text-xs font-bold text-emerald-900 dark:text-emerald-200 cursor-pointer hover:bg-emerald-100"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isHindi ? 'लाइट मोड' : 'Dark Mode'}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isHindi ? 'डार्क मोड' : 'Light Mode'}</span>
                  </>
                )}
              </button>
            </div>

            {/* 6. Navigation Links */}
            <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/60 flex flex-col space-y-1">
              <button
                onClick={() => { setMobileMenuOpen(false); scrollToSection('hero'); }}
                className="text-left py-2 px-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg text-sm font-medium text-slate-700 dark:text-emerald-100"
              >
                {isHindi ? 'होम' : 'Home'}
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); scrollToSection('about-section'); }}
                className="text-left py-2 px-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg text-sm font-medium text-slate-700 dark:text-emerald-100"
              >
                {isHindi ? 'हमारे बारे में' : 'About Uttarakhand Gateways'}
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); scrollToSection('contact-section'); }}
                className="text-left py-2 px-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg text-sm font-medium text-slate-700 dark:text-emerald-100"
              >
                {isHindi ? 'नियम और सहायता' : 'Legal Rules & Platform Help'}
              </button>
            </div>
            
            {/* Platform Email in Mobile Menu - break-all */}
            <a
              href="mailto:ukg@uttarakhandgateways.com"
              className="text-left py-2.5 px-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl text-xs font-medium flex items-center gap-2 mt-1 break-all"
            >
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{isHindi ? 'पूछताछ:' : 'Inquiries:'} ukg@uttarakhandgateways.com</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
