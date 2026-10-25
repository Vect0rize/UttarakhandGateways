import React, { useState, useEffect, useRef } from 'react';
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
  Crown,
  ArrowLeft,
  BarChart3,
  IndianRupee,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Scale,
  Compass,
  Building,
  Home,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
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
  onOpenLegalModal?: (policyId?: any) => void;
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
  onOpenLegalModal,
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
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [isThemeAnimating, setIsThemeAnimating] = useState(false);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
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

  // Close desktop mega-menu on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(e.target as Node)) {
        setDesktopMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDesktopMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleThemeToggle = () => {
    setIsThemeAnimating(true);
    onToggleTheme();
    window.setTimeout(() => {
      setIsThemeAnimating(false);
    }, 550);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setDesktopMenuOpen(false);
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

          {/* Desktop Navigation - Main Options at Nav Bar */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 px-3 py-1 rounded-full bg-emerald-50/70 dark:bg-[#07241a]/70 border border-emerald-200/70 dark:border-emerald-900/70 shadow-xs whitespace-nowrap">
            {/* Buy */}
            <button
              type="button"
              onClick={() => {
                if (isPropertyViewActive && onReturnToProperties) onReturnToProperties();
                onBuyClick?.();
                scrollToSection('properties-section');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                !isRentActive && !isPropertyViewActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-emerald-200 hover:bg-emerald-100/70 dark:hover:bg-[#0c3829]'
              }`}
            >
              {isHindi ? 'खरीदें' : 'Buy'}
            </button>

            {/* Rent */}
            <button
              type="button"
              onClick={() => {
                if (isPropertyViewActive && onReturnToProperties) onReturnToProperties();
                onRentClick?.();
                scrollToSection('properties-section');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isRentActive && !isPropertyViewActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 dark:text-emerald-200 hover:bg-emerald-100/70 dark:hover:bg-[#0c3829]'
              }`}
            >
              {isHindi ? 'किराया' : 'Rent'}
            </button>

            {/* Properties */}
            <button
              type="button"
              onClick={() => {
                if (isPropertyViewActive && onReturnToProperties) onReturnToProperties();
                scrollToSection('properties-section');
              }}
              className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-emerald-200 hover:bg-emerald-100/70 dark:hover:bg-[#0c3829] transition-all cursor-pointer"
            >
              {isHindi ? 'संपत्तियां' : 'Properties'}
            </button>

            {/* Home Loan Calculator */}
            <button
              type="button"
              onClick={() => {
                if (onOpenEmiCalculator) onOpenEmiCalculator();
                else scrollToSection('calculator-section');
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-emerald-200 hover:bg-emerald-100/70 dark:hover:bg-[#0c3829] transition-all cursor-pointer group"
            >
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>{isHindi ? 'होम लोन' : 'Home Loan'}</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

            {/* LAPTOP / DESKTOP SIDE MENU TRIGGER - Positioned on side, not middle */}
            <div className="hidden lg:block relative" ref={desktopMenuRef}>
              <button 
                type="button"
                onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-extrabold text-xs select-none shadow-xs ${
                  desktopMenuOpen 
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md ring-2 ring-emerald-500/30 scale-[1.02]' 
                    : 'bg-emerald-50/90 dark:bg-[#07241a] hover:bg-emerald-100 dark:hover:bg-[#0c3829] border-emerald-300/80 dark:border-emerald-800 text-slate-800 dark:text-emerald-200'
                }`}
                title={isHindi ? 'अन्य सभी सेवाएं व टूल्स' : 'More Platform Services & Tools'}
              >
                <Menu className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                <span>{isHindi ? 'मेनू' : 'Menu'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${desktopMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* LAPTOP ALL-OPTIONS MEGA-MENU DROPDOWN */}
              {desktopMenuOpen && (
                <div 
                  className="absolute top-full right-0 mt-3 w-[min(840px,calc(100vw-32px))] bg-white/98 dark:bg-[#061c14]/98 backdrop-blur-2xl border border-emerald-200/90 dark:border-emerald-800/90 rounded-3xl shadow-2xl shadow-emerald-950/25 p-5 sm:p-6 animate-in fade-in slide-in-from-top-3 duration-200 z-50 text-slate-800 dark:text-slate-100 max-h-[82vh] overflow-y-auto"
                >
                  {/* Header with Title and Close Button */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-emerald-100 dark:border-emerald-900/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{isHindi ? 'उत्तराखंड गेटवेज सम्पूर्ण मेनू' : 'Uttarakhand Gateways Hub'}</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            All Options
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isHindi ? 'प्रॉपर्टीज, वित्तीय कैलकुलेटर, पर्वतीय कानूनी गाइड व त्वरित सेटिंग्स' : 'Browse properties, loan calculators, mountain land legal policies & tools'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDesktopMenuOpen(false)}
                      className="p-1.5 rounded-full bg-slate-100 dark:bg-emerald-950/60 hover:bg-slate-200 text-slate-600 dark:text-emerald-300 transition-colors cursor-pointer"
                      aria-label="Close Menu"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mega Menu Grid: 4 Clean Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
                    
                    {/* COLUMN 1: Properties & Market */}
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isHindi ? 'प्रॉपर्टीज व बाजार' : 'Properties & Search'}</span>
                      </span>

                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDesktopMenuOpen(false);
                            if (isPropertyViewActive && onReturnToProperties) onReturnToProperties();
                            else scrollToSection('hero');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-[#0a2e20] transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <Home className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600">
                              {isHindi ? 'होम (Home)' : 'Home'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              {isHindi ? 'मुख्य पृष्ठ पर जाएं' : 'Main landing & hero'}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDesktopMenuOpen(false);
                            onBuyClick?.();
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-[#0a2e20] transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <Building className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600">
                              {isHindi ? 'खरीदें (Buy)' : 'Buy Properties'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              {isHindi ? 'विला, कॉटेज व MDDA प्लॉट्स' : 'Villas, cottages & plots'}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDesktopMenuOpen(false);
                            onRentClick?.();
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-teal-50 dark:hover:bg-[#0a2e20] transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <Home className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-teal-600">
                              {isHindi ? 'किराया (Rent)' : 'Rent / Lease'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              {isHindi ? 'होमस्टे व मासिक रेंटल' : 'Homestays & long leases'}
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDesktopMenuOpen(false);
                            scrollToSection('properties-section');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-[#0a2e20] transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#07251b] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <Compass className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600">
                              {isHindi ? 'सभी संपत्तियां' : 'All Listings'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              {allProperties.length} {isHindi ? 'सत्यापित लिस्टिंग्स' : 'verified listings'}
                            </span>
                          </div>
                        </button>

                        {onToggleFavoritesOnly && (
                          <button
                            type="button"
                            onClick={() => {
                              setDesktopMenuOpen(false);
                              onToggleFavoritesOnly();
                            }}
                            className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-[#0a2e20] transition-colors flex items-start gap-2.5 group cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                              <Bookmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600 flex items-center gap-1.5">
                                <span>{isHindi ? 'सहेजी गई संपत्तियां' : 'Saved Properties'}</span>
                                {favoriteCount > 0 && (
                                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                                    {favoriteCount}
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                                {isHindi ? 'आपकी शॉर्टलिस्ट' : 'Your saved shortlist'}
                              </span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* COLUMN 2: Calculators & Finance */}
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isHindi ? 'फाइनेंस व टूल्स' : 'Finance & Tools'}</span>
                      </span>

                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDesktopMenuOpen(false);
                            if (onOpenEmiCalculator) onOpenEmiCalculator();
                            else scrollToSection('calculator-section');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-[#0a2e20] transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600 flex items-center gap-1.5">
                              <span>{isHindi ? 'होम लोन ईएमआई' : 'Home Loan Calculator'}</span>
                              <span className="text-[9px] font-black px-1 py-0.2 bg-emerald-600 text-white rounded">NEW</span>
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              SBI, BoB, HDFC Live Rates
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDesktopMenuOpen(false);
                            if (onOpenUnitConverter) onOpenUnitConverter();
                            else scrollToSection('calculator-section');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-[#0a2e20] transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <Scale className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600">
                              {isHindi ? 'नाली-बीघा कन्वर्टर' : 'UKG Land Converter'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              Nali, Bigha, Gaj, Mutthi, Guntha
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDesktopMenuOpen(false);
                            onOpenDashboard?.();
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-[#0a2e20] transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <BarChart3 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-300" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600">
                              {isHindi ? 'लिस्टर्स ग्रोथ डैशबोर्ड' : 'Lister Analytics'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              {isHindi ? 'व्यूज, शेयर व लीड ट्रैकिंग' : 'Track views, inquiries & shares'}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* COLUMN 3: Mountain Legal & Guidance */}
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isHindi ? 'पर्वतीय कानून व योजनाएं' : 'Mountain Legal Guide'}</span>
                      </span>

                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDesktopMenuOpen(false);
                            if (onOpenLegalModal) onOpenLegalModal('landLaws');
                            else scrollToSection('footer-section');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-[#0a2e20] transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <FileText className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600">
                              {isHindi ? 'उत्तराखंड भू-कानून गाइड' : '250 Sqm Land Rules'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              Section 143/154 & Non-Residents
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDesktopMenuOpen(false);
                            if (onOpenLegalModal) onOpenLegalModal('homestay');
                            else if (onOpenEmiCalculator) onOpenEmiCalculator();
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-[#0a2e20] transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <span className="text-xs">🏔️</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-amber-700 dark:group-hover:text-amber-300">
                              {isHindi ? 'होमस्टे 33% सब्सिडी 2018' : 'Homestay Subsidy 2018'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              Up to ₹15L capital grant
                            </span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDesktopMenuOpen(false);
                            if (onOpenLegalModal) onOpenLegalModal('terms');
                            else scrollToSection('footer-section');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-[#0a2e20] transition-colors flex items-start gap-2.5 group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#07251b] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-emerald-600">
                              {isHindi ? '100% सत्यापन नीति' : 'Title Verification'}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                              MDDA, Khatauni & Freehold
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* COLUMN 4: Actions & Quick Settings */}
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isHindi ? 'सुविधाएं व सेटिंग्स' : 'Actions & Settings'}</span>
                      </span>

                      <div className="space-y-1">
                        {/* Post Listing Free CTA */}
                        <button
                          type="button"
                          onClick={() => {
                            setDesktopMenuOpen(false);
                            if (!currentUser) {
                              openAuthModal('login', isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु लॉगिन आवश्यक है।' : 'Sign in to list property.', () => {
                                if (onOpenListChooser) onOpenListChooser();
                                else setShowListChooserModal(true);
                              });
                            } else {
                              if (onOpenListChooser) onOpenListChooser();
                              else setShowListChooserModal(true);
                            }
                          }}
                          className="w-full text-left p-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs flex items-center justify-between group cursor-pointer hover:from-emerald-700 hover:to-teal-700 transition-all"
                        >
                          <div>
                            <span className="text-xs font-extrabold block">
                              + {isHindi ? 'निशुल्क लिस्ट करें' : 'Post Property'}
                            </span>
                            <span className="text-[10px] text-emerald-100 block">
                              {isHindi ? 'शून्य ब्रोकरेज' : '100% Free Listing'}
                            </span>
                          </div>
                          <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                            FREE
                          </span>
                        </button>

                        {/* Inbox Direct Link */}
                        <button
                          type="button"
                          onClick={() => {
                            setDesktopMenuOpen(false);
                            requireAuth(() => {
                              window.open('?page=inbox', '_blank');
                            }, isHindi ? 'संदेश देखने हेतु लॉगिन करें।' : 'Please sign in to view Inbox.');
                          }}
                          className="w-full text-left p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-[#0a2e20] transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {isHindi ? 'इनबॉक्स व चैट' : 'Direct Messages'}
                            </span>
                          </div>
                          {unreadInboxCount > 0 && (
                            <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                              {unreadInboxCount}
                            </span>
                          )}
                        </button>

                        {/* Theme Quick Switcher inside Menu */}
                        <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/60 flex items-center justify-between px-1">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {isHindi ? 'थीम मोड' : 'Theme Mode'}
                          </span>
                          <button
                            type="button"
                            onClick={handleThemeToggle}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-emerald-950 text-slate-800 dark:text-emerald-200 text-xs font-bold cursor-pointer hover:bg-slate-200"
                          >
                            {isDark ? (
                              <>
                                <Sun className={`w-3.5 h-3.5 text-amber-400 ${isThemeAnimating ? 'animate-theme-spin' : ''}`} />
                                <span>Light</span>
                              </>
                            ) : (
                              <>
                                <Moon className={`w-3.5 h-3.5 text-emerald-700 ${isThemeAnimating ? 'animate-theme-spin' : ''}`} />
                                <span>Dark</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Language Switcher inside Menu */}
                        <div className="flex items-center justify-between px-1 pt-1">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {isHindi ? 'भाषा' : 'Language'}
                          </span>
                          <button
                            type="button"
                            onClick={toggleLanguage}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold cursor-pointer hover:bg-emerald-200"
                          >
                            <span>{isHindi ? 'English' : 'हिन्दी'}</span>
                          </button>
                        </div>

                        {/* About & Contact Full Links */}
                        <div className="pt-2 border-t border-slate-100 dark:border-emerald-900/60 space-y-1">
                          <button 
                            type="button"
                            onClick={() => {
                              setDesktopMenuOpen(false);
                              scrollToSection('about-section');
                            }} 
                            className="w-full text-left p-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-[#0a2e20] transition-colors flex items-center gap-2 group cursor-pointer text-xs font-bold text-slate-800 dark:text-emerald-200"
                          >
                            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{isHindi ? 'हमारे बारे में' : 'About Us'}</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => {
                              setDesktopMenuOpen(false);
                              scrollToSection('contact-section');
                            }} 
                            className="w-full text-left p-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-[#0a2e20] transition-colors flex items-center gap-2 group cursor-pointer text-xs font-bold text-slate-800 dark:text-emerald-200"
                          >
                            <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{isHindi ? 'संपर्क करें' : 'Contact Us'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
            
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
                  onClick={() => onToggleFavoritesOnly()}
                  className={`relative p-1.5 xl:p-2 rounded-full hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer ${
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

              <span className="w-px h-3.5 bg-emerald-200/80 dark:bg-emerald-800/80 mx-0.5" />

              {/* Light / Dark Mode Toggle with Spring Animation */}
              <button
                id="theme-toggle-btn"
                type="button"
                onClick={handleThemeToggle}
                className="p-1.5 xl:p-2 rounded-full hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-emerald-200 transition-colors cursor-pointer focus:outline-none"
                title={isDark ? (isHindi ? "लाइट मोड" : "Switch to Light mode") : (isHindi ? "डार्क मोड" : "Switch to Dark mode")}
                aria-label={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
              >
                {isDark ? (
                  <Sun className={`w-4 h-4 text-amber-400 ${isThemeAnimating ? 'animate-theme-spin' : 'hover:rotate-45 transition-transform'}`} />
                ) : (
                  <Moon className={`w-4 h-4 text-emerald-700 dark:text-emerald-300 ${isThemeAnimating ? 'animate-theme-spin' : 'hover:-rotate-12 transition-transform'}`} />
                )}
              </button>

              {/* Hindi / English Language Switcher - compact on laptop, full on large desktop */}
              <button
                id="lang-toggle-btn"
                type="button"
                onClick={toggleLanguage}
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

            {/* Common List Button (Directs to OTP Login if not authenticated, else opens chooser for sale or rent) */}
            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  openAuthModal(
                    'login',
                    isHindi 
                    ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' 
                    : 'Please log in with your Email via OTP to list your property.',
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
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer ring-1 ring-emerald-300/40 whitespace-nowrap"
              title={isHindi ? "प्रॉपर्टी लिस्ट करें" : "List Property"}
            >
              <span className="text-emerald-100 text-sm font-black">+</span>
              <span>{isHindi ? 'लिस्ट' : 'List'}</span>
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ml-0.5">
                FREE
              </span>
            </button>

            {/* Owner All Accounts Directory Button (Only for Platform Owner) */}
            {isOwner && onOpenAdminAccounts && (
              <button
                type="button"
                onClick={onOpenAdminAccounts}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black shadow-sm transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                title={isHindi ? 'प्लेटफॉर्म के सभी खाते देखें (Owner Directory)' : 'All Registered Accounts (Platform Owner Directory)'}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{isHindi ? 'खाते' : 'Accounts'}</span>
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
                  onClick={() => openAuthModal('login')}
                  className="px-2.5 py-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>{isHindi ? 'लॉग इन' : 'Sign In'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>{isHindi ? 'रजिस्टर' : 'Register'}</span>
                </button>
              </div>
            )}

            {/* Back Option at the end of Nav Bar */}
            {isPropertyViewActive && onReturnToProperties && (
              <button
                type="button"
                onClick={onReturnToProperties}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                title={isHindi ? 'मार्केटप्लेस पर वापस जाएं' : 'Back to Marketplace'}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-white" />
                <span>{isHindi ? 'वापस (Back)' : 'Back'}</span>
              </button>
            )}

            {/* Menu Button - ONLY visible on mobile and tablet (< 1024px)! HIDDEN on Laptop/Desktop for clean look */}
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
        <div className="absolute right-3 sm:right-6 lg:right-8 top-full mt-2 w-[min(420px,calc(100vw-24px))] px-3.5 pt-3 pb-6 bg-white/98 dark:bg-[#071c14]/98 backdrop-blur-2xl border-b border-emerald-200 dark:border-emerald-950 shadow-2xl animate-in slide-in-from-top-2 duration-200 text-slate-800 dark:text-slate-100 max-h-[85vh] overflow-y-auto">
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
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-1 rounded-lg">
                    {isHindi ? 'प्रोफ़ाइल' : 'Profile'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('login');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    <span>{isHindi ? 'लॉग इन' : 'Login'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('register');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    <span>{isHindi ? 'रजिस्टर' : 'Register'}</span>
                  </button>
                </div>
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
                        ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' 
                        : 'Please log in with your Email via OTP to list your property.',
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

            {/* Mobile Back Option (when viewing property details) */}
            {isPropertyViewActive && onReturnToProperties && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onReturnToProperties();
                }}
                className="w-full p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-between shadow-xs cursor-pointer active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4 text-white" />
                  <span>{isHindi ? 'मार्केटप्लेस पर वापस जाएं' : 'Back to Marketplace'}</span>
                </div>
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                  Back
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

            {/* Lister Growth Dashboard Option */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenDashboard) onOpenDashboard();
              }}
              className="text-left py-2.5 px-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-[#09291e] dark:to-[#0c241c] hover:bg-teal-100 rounded-xl text-sm font-bold flex items-center justify-between text-teal-950 dark:text-teal-200 border border-teal-300/80 dark:border-teal-800 cursor-pointer shadow-xs"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{isHindi ? 'ग्रोथ डैशबोर्ड' : 'Lister Growth Dashboard'}</span>
              </span>
              <span className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-md font-bold border border-teal-200 dark:border-teal-800">
                {isHindi ? 'व्यूज व ग्रोथ' : 'Views & Growth'}
              </span>
            </button>

            {/* Home Loan & EMI Calculator Option */}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenEmiCalculator) onOpenEmiCalculator();
                else scrollToSection('calculator-section');
              }}
              className="text-left py-2.5 px-3 bg-white dark:bg-[#0a271d] hover:bg-emerald-50 dark:hover:bg-[#0f3427] rounded-xl text-sm font-bold flex items-center justify-between text-slate-800 dark:text-emerald-100 border border-emerald-200/80 dark:border-emerald-800 cursor-pointer shadow-xs"
            >
              <span className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'गृह ऋण व ईएमआई' : 'Home Loan & EMI Calculator'}</span>
              </span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold border border-emerald-200 dark:border-emerald-800">
                SBI • HDFC
              </span>
            </button>

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

            {/* Light / Dark Mode Toggle Option in Menu */}
            <div className="flex items-center justify-between py-2 px-3 bg-white dark:bg-[#0a271d] rounded-xl border border-emerald-200/80 dark:border-emerald-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-700 dark:text-emerald-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shadow-xs">
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-emerald-700" />}
                </span>
                <span>{isHindi ? 'थीम (Theme)' : 'Theme'}</span>
              </span>
              <button
                type="button"
                onClick={handleThemeToggle}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-200 cursor-pointer hover:bg-emerald-200"
              >
                {isDark ? (
                  <>
                    <Sun className={`w-3.5 h-3.5 text-amber-400 ${isThemeAnimating ? 'animate-theme-spin' : ''}`} />
                    <span>{isHindi ? 'लाइट मोड' : 'Light Mode'}</span>
                  </>
                ) : (
                  <>
                    <Moon className={`w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300 ${isThemeAnimating ? 'animate-theme-spin' : ''}`} />
                    <span>{isHindi ? 'डार्क मोड' : 'Dark Mode'}</span>
                  </>
                )}
              </button>
            </div>

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
        onDeleteAllProperties={onDeleteAllProperties}
        onOpenSellModal={onOpenSellModal}
        onOpenRentalModal={onOpenRentalModal}
        onOpenDashboard={onOpenDashboard}
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
