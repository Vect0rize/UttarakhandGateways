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
  User as UserIcon,
  LogOut, 
  LogIn, 
  Trash2,
  Users,
  Crown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserProfileModal } from './UserProfileModal';
import { SwitchAccountModal } from './SwitchAccountModal';
import { ListChooserModal } from './ListChooserModal';
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
  onOpenSellModal?: () => void;
  onOpenRentalModal?: () => void;
  isRentActive?: boolean;
  isPropertyViewActive?: boolean;
  onReturnToProperties?: () => void;
  onBuyClick?: () => void;
  onRentClick?: () => void;
  onOpenInbox?: () => void;
  onOpenAdminAccounts?: () => void;
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
}

export const Navbar: React.FC<NavbarProps> = ({
  onLogoClick,
  allProperties = [],
  onSelectProperty,
  onEditProperty,
  onDeleteProperty,
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
  onOpenAdminAccounts,
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSwitchAccountModal, setShowSwitchAccountModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showListChooserModal, setShowListChooserModal] = useState(false);
  const { language, toggleLanguage, isHindi } = useLanguage();
  const { currentUser, isOwner, savedAccounts, logout, openAuthModal, requireAuth, deleteAccount } = useAuth();

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
          
          <div className="flex items-center gap-2 sm:gap-3">
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
              <div className="hidden sm:block">
                <Logo size="lg" darkText={!isDark} />
              </div>
              <div className="sm:hidden">
                <Logo size="md" darkText={!isDark} />
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-slate-700 dark:text-emerald-100">
            <button 
              onClick={() => {
                if (isPropertyViewActive && onReturnToProperties) onReturnToProperties();
                else scrollToSection('hero');
              }} 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              {isHindi ? 'होम' : 'Home'}
            </button>
            <button 
              onClick={() => {
                if (onBuyClick) onBuyClick();
                else scrollToSection('properties-section');
              }} 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer focus:outline-none font-bold"
            >
              {isHindi ? 'खरीदें' : 'Buy'}
            </button>
            <button 
              onClick={() => {
                if (onRentClick) onRentClick();
                else scrollToSection('properties-section');
              }} 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer focus:outline-none font-bold"
            >
              {isHindi ? 'किराया' : 'Rent'}
            </button>
            <button 
              onClick={() => {
                if (isPropertyViewActive && onReturnToProperties) onReturnToProperties();
                else scrollToSection('properties-section');
              }} 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              {isHindi ? 'सभी संपत्तियां' : 'Properties'}
            </button>
            <button 
              onClick={() => {
                if (onOpenCalculator) onOpenCalculator();
                else scrollToSection('calculator-section');
              }} 
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-1 cursor-pointer focus:outline-none"
            >
              {isHindi ? 'भूमि कैलकुलेटर' : 'Land Calculator'}
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
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            
            {/* DESKTOP UNIFIED UTILITY CLUSTER: Inbox, Saved, Theme, Language */}
            <div className="hidden lg:flex items-center gap-0.5 p-1 rounded-full bg-white/70 dark:bg-[#072018]/80 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs">
              
              {/* Inbox Icon */}
              <button
                type="button"
                onClick={() => {
                  requireAuth(() => {
                    window.open('?page=inbox', '_blank');
                  }, isHindi ? 'संदेश और इनबॉक्स देखने हेतु लॉगिन आवश्यक है।' : 'Please sign in or register to access your Inbox.');
                }}
                className="relative p-2 rounded-full hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-emerald-200 transition-colors cursor-pointer"
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
                  onClick={() => onToggleFavoritesOnly()}
                  className={`relative p-2 rounded-full hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer ${
                    showingFavoritesOnly ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-emerald-200'
                  }`}
                  title={showingFavoritesOnly ? (isHindi ? "सभी संपत्तियां देखें" : "Show All Properties") : (isHindi ? "सहेजी गई संपत्तियां" : "Saved Properties")}
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

              <span className="w-px h-3.5 bg-emerald-200/80 dark:bg-emerald-800/80 mx-1" />

              {/* Light / Dark Mode Toggle */}
              <button
                id="theme-toggle-btn"
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-full hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-emerald-200 transition-colors cursor-pointer focus:outline-none"
                title={isDark ? (isHindi ? "लाइट मोड" : "Switch to Light mode") : (isHindi ? "डार्क मोड" : "Switch to Dark mode")}
                aria-label={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="w-4 h-4 text-emerald-700 hover:-rotate-12 transition-transform" />
                )}
              </button>

              {/* Hindi / English Language Switcher */}
              <button
                id="lang-toggle-btn"
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer focus:outline-none select-none"
                title={isHindi ? 'Switch to English' : 'Switch to Hindi (हिन्दी)'}
                aria-label="Toggle language"
              >
                {isHindi ? (
                  <>
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black leading-none shadow-xs uppercase">
                      EN
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-emerald-200 font-sans">
                      English
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold leading-none shadow-xs">
                      अ
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                      हिन्दी
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Common List Button (Directs to OTP Login if not authenticated, else opens chooser for sale or rent) */}
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  openAuthModal(
                    'login',
                    isHindi 
                      ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल या व्हाट्सएप नंबर (OTP) से लॉगिन करें।' 
                      : 'Please log in with your Email or WhatsApp number via OTP to list your property (0% Brokerage).',
                    () => {
                      if (onOpenListChooser) onOpenListChooser();
                      else setShowListChooserModal(true);
                    }
                  );
                } else {
                  if (onOpenListChooser) {
                    onOpenListChooser();
                  } else {
                    setShowListChooserModal(true);
                  }
                }
              }}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer ring-1 ring-emerald-300/40"
              title={isHindi ? "प्रॉपर्टी लिस्ट करें (0% ब्रोकरेज)" : "List Property (0% Brokerage)"}
            >
              <span className="text-emerald-100 text-sm font-black">+</span>
              <span>{isHindi ? 'लिस्ट' : 'List'}</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase ml-0.5">
                FREE
              </span>
            </button>

            {/* Owner All Accounts Directory Button (Only for Platform Owner) */}
            {isOwner && onOpenAdminAccounts && (
              <button
                type="button"
                onClick={onOpenAdminAccounts}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black shadow-sm transition-all cursor-pointer active:scale-95"
                title={isHindi ? 'प्लेटफॉर्म के सभी खाते देखें (Owner Directory)' : 'All Registered Accounts (Platform Owner Directory)'}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{isHindi ? 'सभी खाते' : 'All Accounts'}</span>
              </button>
            )}

            {/* User Account / Sign In State - Desktop */}
            {currentUser ? (
              <div className="hidden lg:flex items-center gap-1.5 pl-1">
                <button 
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full border text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95 ${
                    isOwner 
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200' 
                      : 'bg-emerald-100/90 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                  }`}
                  title={isOwner ? '👑 Platform Owner (Amit Tyagi)' : `${currentUser.username} - View profile & switch accounts`}
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
                  <span className="max-w-[75px] truncate">{currentUser.username}</span>
                  {isOwner && (
                    <Crown className="w-3 h-3 text-amber-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  title={isHindi ? 'लॉग आउट करें' : 'Log Out'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="hidden lg:flex items-center px-4 py-1.5 sm:py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <span>{isHindi ? 'लॉग इन' : 'Login'}</span>
              </button>
            )}

            {/* Mobile Menu Button - Moved to the corner with ONLY 3 lines icon (no text) */}
            <button
              id="mobile-menu-btn"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full bg-emerald-50 dark:bg-[#0a271d] text-slate-800 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-[#0f3427] border border-emerald-300/80 dark:border-emerald-800 transition-all shadow-xs active:scale-95 cursor-pointer ml-auto"
              aria-label="Toggle Navigation Menu"
              title="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              ) : (
                <Menu className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 px-3.5 pt-3 pb-6 bg-white/98 dark:bg-[#071c14]/98 backdrop-blur-2xl border-b border-emerald-200 dark:border-emerald-950 shadow-2xl animate-in slide-in-from-top-2 duration-200 text-slate-800 dark:text-slate-100 max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col space-y-2.5">
            
            {/* Mobile User Profile or Login/Register Card */}
            <div 
              onClick={() => {
                if (currentUser) {
                  setMobileMenuOpen(false);
                  setShowProfileModal(true);
                }
              }}
              className={`p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between ${currentUser ? 'cursor-pointer hover:border-emerald-400 transition-colors' : ''}`}
            >
              {currentUser ? (
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl overflow-hidden text-white flex items-center justify-center font-black text-sm uppercase shadow-xs ${
                    isOwner ? 'bg-gradient-to-tr from-amber-600 to-yellow-500' : 'bg-gradient-to-tr from-emerald-700 to-teal-600'
                  }`}>
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.username.charAt(0)
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{currentUser.username}</span>
                      {isOwner ? (
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-300">
                          👑 Owner
                        </span>
                      ) : (
                        <span className="text-[10px] font-normal text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                          {isHindi ? 'संपादित करें ✎' : 'Edit ✎'}
                        </span>
                      )}
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
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'लॉग आउट' : 'Logout'}</span>
                  </button>
                </div>
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

            {/* Mobile Buy, Rent, Post Ad Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBuyClick?.();
                }}
                className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold text-center shadow-xs cursor-pointer"
              >
                {isHindi ? 'खरीदें' : 'Buy'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onRentClick?.();
                }}
                className="py-2.5 px-2 bg-teal-800 hover:bg-teal-900 text-emerald-100 rounded-xl text-xs font-bold text-center shadow-xs cursor-pointer"
              >
                {isHindi ? 'किराया' : 'Rent'}
              </button>

              {/* Post Ad (with FREE mark - requires login via OTP if guest) */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (!currentUser) {
                    openAuthModal(
                      'login',
                      isHindi 
                        ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल या व्हाट्सएप नंबर (OTP) से लॉगिन करें।' 
                        : 'Please log in with your Email or WhatsApp number via OTP to list your property (0% Brokerage).',
                      () => {
                        if (onOpenListChooser) onOpenListChooser();
                        else setShowListChooserModal(true);
                      }
                    );
                  } else {
                    if (onOpenListChooser) onOpenListChooser();
                    else setShowListChooserModal(true);
                  }
                }}
                className="py-2.5 px-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white rounded-xl text-xs font-extrabold text-center shadow-xs cursor-pointer flex items-center justify-center gap-1"
              >
                <span>{isHindi ? 'विज्ञापन' : 'Post Ad'}</span>
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1 py-0.2 rounded-full uppercase">
                  FREE
                </span>
              </button>
            </div>

            {/* Mobile Owner All Accounts Button */}
            {isOwner && onOpenAdminAccounts && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminAccounts();
                }}
                className="w-full p-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-between shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-slate-950" />
                  <span>{isHindi ? 'सभी पंजीकृत खाते (Owner Directory)' : 'All Registered Accounts (Owner Directory)'}</span>
                </div>
                <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  View
                </span>
              </button>
            )}

            {/* Quick Actions Header / Badges */}
            <div className="grid grid-cols-2 gap-2 pb-1">
              {/* Saved for Later */}
              {onToggleFavoritesOnly && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onToggleFavoritesOnly();
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer border ${
                    showingFavoritesOnly
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                      : 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Bookmark className={`w-3.5 h-3.5 ${showingFavoritesOnly ? 'fill-white text-white' : 'fill-emerald-600 text-emerald-600'}`} />
                    <span>{isHindi ? 'सहेजे गए' : 'Saved'}</span>
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    showingFavoritesOnly ? 'bg-white/20 text-white' : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100'
                  }`}>
                    {favoriteCount}
                  </span>
                </button>
              )}

              {/* Direct Inbox & Messages */}
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

            {/* Land Measurement Calculator Option */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenCalculator) onOpenCalculator();
                else scrollToSection('calculator-section');
              }}
              className="text-left py-2.5 px-3 bg-white dark:bg-[#0a271d] hover:bg-emerald-50 dark:hover:bg-[#0f3427] rounded-xl text-sm font-bold flex items-center justify-between text-slate-800 dark:text-emerald-100 border border-emerald-200/80 dark:border-emerald-800 cursor-pointer shadow-xs"
            >
              <span className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'भूमि कैलकुलेटर' : 'UKG Land Calculator'}</span>
              </span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold border border-emerald-200 dark:border-emerald-800">
                {isHindi ? 'सभी इकाइयां' : 'Any Unit'}
              </span>
            </button>

            {/* Hindi / English Language Option */}
            <div className="flex items-center justify-between py-2 px-3 bg-white dark:bg-[#0a271d] rounded-xl border border-emerald-200/80 dark:border-emerald-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-700 dark:text-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {isHindi ? 'EN' : 'अ'}
                </span>
                <span>{isHindi ? 'भाषा' : 'Language'}</span>
              </span>
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-200 cursor-pointer hover:bg-emerald-200"
              >
                {isHindi ? (
                  <>
                    <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">EN</span>
                    <span>English</span>
                  </>
                ) : (
                  <>
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">अ</span>
                    <span>हिन्दी</span>
                  </>
                )}
              </button>
            </div>

            {/* Light / Dark Display Theme Option */}
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

            {/* Navigation Links */}
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
            
            {/* Email Contact */}
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
                onClick={() => {
                  deleteAccount();
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
        onOpenSellModal={onOpenSellModal}
        onOpenRentalModal={onOpenRentalModal}
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
    </header>
  );
};
