import React, { useState, useMemo, useEffect } from 'react';
import api from './services/api';
import { resolveApiUrl, isNativeAndroidApp } from './config/apiConfig';
import { MobileAppView } from './components/MobileAppView';
import { MobileNavTab } from './components/MobileBottomNav';
import { MobileDeviceSimulator } from './components/MobileDeviceSimulator';
import { AppSplashScreen } from './components/AppSplashScreen';
import { Property, FilterState } from './types';
import { PROPERTIES } from './data/properties';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchBar } from './components/SearchBar';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailPage } from './components/PropertyDetailPage';
import { AdminAccountsModal } from './components/AdminAccountsModal';
import { AdminReportsModal } from './components/AdminReportsModal';
import { DeleteAllPropertiesModal } from './components/DeleteAllPropertiesModal';
import { ReportListingModal } from './components/ReportListingModal';
import { LandUnitConverterModal } from './components/LandUnitConverterModal';
import { UploadPropertyModal } from './components/UploadPropertyModal';
import { ListRentalModal } from './components/ListRentalModal';
import { InboxModal } from './components/InboxModal';
import { AboutAndContact } from './components/AboutAndContact';
import { Footer } from './components/Footer';
import { PropertyCalculator } from './components/PropertyCalculator';
import { InboxPage } from './components/InboxPage';
import { AiChatbot } from './components/AiChatbot';
import { ChatConfirmationModal } from './components/ChatConfirmationModal';
import { 
  RotateCcw, 
  Bookmark,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Key,
  CheckCircle2,
  MessageSquare,
  Lock,
  Unlock,
  Phone,
  Calculator,
  Building2
} from 'lucide-react';
import { ChatThread } from './types';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { getPropertyOwnerDisplayName } from './utils/propertyOwnership';
import { AuthModal } from './components/AuthModal';
import { FirstVisitLanguageModal } from './components/FirstVisitLanguageModal';
import { LegalModal } from './components/LegalModal';
import { EditPropertyModal } from './components/EditPropertyModal';
import { LegalPolicyId } from './data/legalPolicies';
import { BuyPage } from './components/BuyPage';
import { RentPage } from './components/RentPage';
import { LoginPage } from './components/LoginPage';
import { SellGuiPage } from './components/SellGuiPage';
import { RentGuiPage } from './components/RentGuiPage';
import { ListerDashboard } from './components/ListerDashboard';
import { EmiCalculatorModal } from './components/EmiCalculatorModal';
import { ListChooserModal } from './components/ListChooserModal';
import { LoginSuccessAnimation } from './components/LoginSuccessAnimation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeLoanBanner } from './components/HomeLoanBanner';
import { HomeLoanPage } from './components/HomeLoanPage';
import { PropertyFilterSection } from './components/PropertyFilterSection';
import { LandPlotsSection } from './components/LandPlotsSection';
import { TrendingCarousel } from './components/TrendingCarousel';
import { StandaloneEmiCalculator } from './components/StandaloneEmiCalculator';
import { StandaloneLandCalculator } from './components/StandaloneLandCalculator';
import { BottomNavigationBar } from './components/BottomNavigationBar';
import { LandGuideModal } from './components/LandGuideModal';
import { UserProfileModal } from './components/UserProfileModal';

const ITEMS_PER_PAGE = 10;

const INITIAL_FILTERS: FilterState = {
  region: 'All',
  searchQuery: '',
  category: 'All Types',
  city: 'All Locations',
  budgetRange: 'all',
  bhkConfig: 'all',
  himalayanViewOnly: false,
  reraApprovedOnly: false,
  sortBy: 'price-low',
};

export type ActivePageView = 'home' | 'buy' | 'rent' | 'login' | 'register' | 'sell-gui' | 'rent-gui' | 'inbox' | 'dashboard' | 'home-loan';

export default function App() {
  const { isHindi } = useLanguage();
  const { 
    currentUser, 
    requireAuth, 
    openAuthModal, 
    showLoginAnimation, 
    loginAnimationUser, 
    dismissLoginAnimation 
  } = useAuth();

  // Theme state: light / dark mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Mobile Tab Navigation State ('home' | 'explore' | 'saved' | 'list' | 'profile')
  const [mobileNavTab, setMobileNavTab] = useState<MobileNavTab>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as MobileNavTab;
      if (tab && ['home', 'explore', 'saved', 'list', 'profile'].includes(tab)) return tab;
      const p = params.get('page');
      if (p === 'buy' || p === 'rent' || p === 'explore') return 'explore';
      if (p === 'saved') return 'saved';
      if (p === 'sell-gui' || p === 'rent-gui' || p === 'sell' || p === 'list') return 'list';
      if (p === 'dashboard' || p === 'inbox' || p === 'profile' || p === 'login' || p === 'register') return 'profile';
    } catch {}
    return 'home';
  });

  const getInitialActivePage = (): ActivePageView => {
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('page');
      const path = (window.location.pathname || '').toLowerCase();
      if (p === 'buy' || path === '/buy' || path === '/buy-property') return 'buy';
      if (p === 'rent' || path === '/rent' || p === 'rent-property' || path === '/rent-property') return 'rent';
      if (p === 'login' || path === '/login' || p === 'reset-password' || path === '/reset-password' || params.get('token') || params.get('resetToken') || p === 'forgot-password') return 'login';
      if (p === 'register' || path === '/register') return 'register';
      if (p === 'sell-gui' || p === 'sell' || path === '/sell' || p === 'sell-property' || path === '/sell-property') return 'sell-gui';
      if (p === 'rent-gui' || p === 'rent-list' || path === '/rent-gui' || path === '/rent-list') return 'rent-gui';
      if (p === 'inbox' || path === '/inbox') return 'inbox';
      if (p === 'dashboard' || path === '/dashboard' || path === '/lister-dashboard') return 'dashboard';
      if (p === 'home-loan' || p === 'emi-calculator' || path === '/home-loan' || path === '/emi-calculator' || path === '/homeloan') return 'home-loan';
    } catch {}
    return 'home';
  };

  const [activePage, setActivePage] = useState<ActivePageView>(getInitialActivePage);
  const [showListChooser, setShowListChooser] = useState(false);
  const [listChooserStep, setListChooserStep] = useState<'type' | 'sale-role'>('type');
  const [sellListingRole, setSellListingRole] = useState<'Owner' | 'Broker'>('Owner');

  // Support history navigation between tabs and pages
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as MobileNavTab;
      const p = params.get('page');
      const propId = params.get('property');
      const path = (window.location.pathname || '').toLowerCase();

      if (propId) {
        return; // Handled by handleCheckUrlProperty
      }

      if (tab && ['home', 'explore', 'saved', 'list', 'profile'].includes(tab)) {
        setMobileNavTab(tab);
        setSelectedProperty(null);
        setPropertyNotFound(false);
        return;
      }

      if (p === 'buy' || path === '/buy' || path === '/buy-property') {
        setActivePage('buy');
        setMobileNavTab('explore');
        setSelectedProperty(null);
        setPropertyNotFound(false);
      } else if (p === 'rent' || path === '/rent' || p === 'rent-property' || path === '/rent-property') {
        setActivePage('rent');
        setMobileNavTab('explore');
        setSelectedProperty(null);
        setPropertyNotFound(false);
      } else if (p === 'login' || path === '/login' || p === 'reset-password' || path === '/reset-password' || params.get('token') || params.get('resetToken') || p === 'forgot-password') {
        setActivePage('login');
        setMobileNavTab('profile');
        setSelectedProperty(null);
        setPropertyNotFound(false);
      } else if (p === 'register' || path === '/register') {
        setActivePage('register');
        setMobileNavTab('profile');
        setSelectedProperty(null);
        setPropertyNotFound(false);
      } else if (p === 'sell-gui' || p === 'sell' || path === '/sell' || p === 'sell-property' || path === '/sell-property') {
        setActivePage('sell-gui');
        setMobileNavTab('list');
        setSelectedProperty(null);
        setPropertyNotFound(false);
      } else if (p === 'rent-gui' || p === 'rent-list' || path === '/rent-gui' || path === '/rent-list') {
        setActivePage('rent-gui');
        setMobileNavTab('list');
        setSelectedProperty(null);
        setPropertyNotFound(false);
      } else if (p === 'inbox' || path === '/inbox') {
        setActivePage('inbox');
        setMobileNavTab('profile');
        setSelectedProperty(null);
        setPropertyNotFound(false);
      } else if (p === 'dashboard' || path === '/dashboard' || path === '/lister-dashboard') {
        setActivePage('dashboard');
        setMobileNavTab('profile');
        setSelectedProperty(null);
        setPropertyNotFound(false);
      } else {
        setActivePage('home');
        setMobileNavTab('home');
        setSelectedProperty(null);
        setPropertyNotFound(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPage = (target: ActivePageView) => {
    setActivePage(target);
    setSelectedProperty(null);
    setPropertyNotFound(false);
    if (target === 'buy' || target === 'rent') {
      setMobileNavTab('explore');
    } else if (target === 'sell-gui' || target === 'rent-gui') {
      setMobileNavTab('list');
    } else if (target === 'dashboard' || target === 'inbox' || target === 'login' || target === 'register') {
      setMobileNavTab('profile');
    } else {
      setMobileNavTab('home');
    }
    try {
      if (target === 'home') {
        window.history.pushState({}, '', '/');
      } else {
        window.history.pushState({ page: target }, '', `?page=${target}`);
      }
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [showRentFilter, setShowRentFilter] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showingFavoritesOnly, setShowingFavoritesOnly] = useState(false);

  // The server is the primary source of truth, with instant fallback to curated properties
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_uploaded_properties');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return PROPERTIES;
  });

  // A property in the URL must be validated against the server before it is shown.
  // Modals state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [propertyNotFound, setPropertyNotFound] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isUnitConverterOpen, setIsUnitConverterOpen] = useState(false);
  const [isEmiCalculatorOpen, setIsEmiCalculatorOpen] = useState(false);
  const [emiCalculatorInitialPrice, setEmiCalculatorInitialPrice] = useState<number | undefined>(undefined);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isAdminAccountsOpen, setIsAdminAccountsOpen] = useState(false);
  const [isAdminReportsOpen, setIsAdminReportsOpen] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [reportingProperty, setReportingProperty] = useState<Property | null>(null);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  // Legal & Compliance Center state
  const [legalModalState, setLegalModalState] = useState<{
    isOpen: boolean;
    activeTab: LegalPolicyId;
  }>({
    isOpen: false,
    activeTab: 'terms',
  });

  const handleOpenLegalPolicy = (policyId: LegalPolicyId = 'terms') => {
    setLegalModalState({
      isOpen: true,
      activeTab: policyId,
    });
  };

  // 5-minute upload rate limit tracking
  const [lastUploadTime, setLastUploadTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_last_upload_time');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Chat threads state - initialized empty (no templates)
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_chat_threads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t: any) => !t.id.startsWith('thread-prop-'));
        }
      }
    } catch {}
    return [];
  });

  // Phone requests state - initialized empty (no templates)

  // Pending chat property awaiting user confirmation before sending request
  const [pendingChatProperty, setPendingChatProperty] = useState<Property | null>(null);

  // Sync chat threads to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uk_gateways_chat_threads', JSON.stringify(chatThreads));
    } catch {}
  }, [chatThreads]);


  // Synchronize HTML & Body theme classes
  useEffect(() => {
    try {
      localStorage.setItem('uk_gateways_theme', theme);
    } catch {}
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Synchronize browser tab title (home page is strictly "Uttarakhand Gateways")
  useEffect(() => {
    if (selectedProperty) {
      document.title = `${selectedProperty.title} | Uttarakhand Gateways`;
    } else {
      switch (activePage) {
        case 'home':
          document.title = 'Uttarakhand Gateways';
          break;
        case 'buy':
          document.title = 'Buy Properties | Uttarakhand Gateways';
          break;
        case 'rent':
          document.title = 'Rent Properties | Uttarakhand Gateways';
          break;
        case 'login':
          document.title = 'Sign In | Uttarakhand Gateways';
          break;
        case 'register':
          document.title = 'Create Account | Uttarakhand Gateways';
          break;
        case 'sell-gui':
          document.title = 'List Property for Sale | Uttarakhand Gateways';
          break;
        case 'rent-gui':
          document.title = 'List Rental Property | Uttarakhand Gateways';
          break;
        case 'inbox':
          document.title = 'Inbox & Inquiries | Uttarakhand Gateways';
          break;
        default:
          document.title = 'Uttarakhand Gateways';
      }
    }
  }, [activePage, selectedProperty]);

  useEffect(() => {
    let active = true;

    const refreshFromServer = async () => {
      try {
        const serverProps = await api.fetchProperties();
        if (active && serverProps.length > 0) {
          setProperties((prev) => {
            if (prev.length === serverProps.length && JSON.stringify(prev) === JSON.stringify(serverProps)) {
              return prev;
            }
            return serverProps;
          });
          try {
            localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(serverProps));
          } catch {}
        }
      } catch (err) {
        console.warn('Failed to refresh properties from server:', err);
      }
    };

    const handlePropsUpdate = () => { void refreshFromServer(); };
    window.addEventListener('uk_gateways_properties_updated', handlePropsUpdate);
    window.addEventListener('focus', handlePropsUpdate);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void refreshFromServer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('uk_gateways_properties_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'PROPERTIES_UPDATED') void refreshFromServer();
      };
    } catch {}

    void refreshFromServer();
    const interval = setInterval(refreshFromServer, 20000);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('uk_gateways_properties_updated', handlePropsUpdate);
      window.removeEventListener('focus', handlePropsUpdate);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (bc) bc.close();
    };
  }, []);

  // Listen for legal policy deep links and custom events
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const policyParam = params.get('policy') as LegalPolicyId;
      if (policyParam && ['terms', 'privacy', 'cookie', 'disclaimer', 'grievance', 'listing_policy', 'seller_agreement'].includes(policyParam)) {
        handleOpenLegalPolicy(policyParam);
      }
    } catch {}

    const handleOpenLegalEvent = (e: any) => {
      const policyId = e.detail as LegalPolicyId;
      if (policyId && ['terms', 'privacy', 'cookie', 'disclaimer', 'grievance', 'listing_policy', 'seller_agreement'].includes(policyId)) {
        handleOpenLegalPolicy(policyId);
      }
    };
    window.addEventListener('uk_gateways_open_legal', handleOpenLegalEvent);
    return () => window.removeEventListener('uk_gateways_open_legal', handleOpenLegalEvent);
  }, []);

  // Resolve shared property links only from the server, never from browser caches.
  useEffect(() => {
    let isMounted = true;

    const resolvePropertyFromUrl = async () => {
      const params = new URLSearchParams(window.location.search);
      let propId = params.get('property');
      if (!propId && window.location.pathname.startsWith('/property/')) {
        propId = decodeURIComponent(window.location.pathname.replace('/property/', ''));
      }

      if (!propId) {
        setPropertyNotFound(false);
        return;
      }

      try {
        const prop = await api.fetchPropertyById(propId);
        if (isMounted && prop) {
          setSelectedProperty(prop);
          setPropertyNotFound(false);
        } else if (isMounted) {
          setSelectedProperty(null);
          setPropertyNotFound(true);
        }
      } catch (err) {
        console.warn('Error resolving URL property:', err);
        if (isMounted) {
          setSelectedProperty(null);
          setPropertyNotFound(true);
        }
      }
    };

    void resolvePropertyFromUrl();
    return () => { isMounted = false; };
  }, []);

  // Browser back/forward must validate a property ID against the server.
  useEffect(() => {
    let active = true;
    const handlePopStateProperty = async () => {
      const params = new URLSearchParams(window.location.search);
      const propId = params.get('property');

      if (!propId) {
        setSelectedProperty(null);
        setPropertyNotFound(false);
        return;
      }

      try {
        const prop = await api.fetchPropertyById(propId);
        if (active && prop) {
          setSelectedProperty(prop);
          setPropertyNotFound(false);
        } else if (active) {
          setSelectedProperty(null);
          setPropertyNotFound(true);
        }
      } catch {
        if (active) {
          setSelectedProperty(null);
          setPropertyNotFound(true);
        }
      }
    };

    window.addEventListener('popstate', handlePopStateProperty);
    return () => {
      active = false;
      window.removeEventListener('popstate', handlePopStateProperty);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('uk_gateways_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Synchronize favorites from server database when user is authenticated
  useEffect(() => {
    if (!currentUser) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('ukg_session_token') : null;
    fetch(resolveApiUrl('/api/favorites'), {
      credentials: isNativeAndroidApp() ? 'omit' : 'include',
      headers: {
        'X-User-Id': currentUser.id,
        'X-User-Contact': currentUser.contact,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.favorites && Array.isArray(data.favorites)) {
          setFavorites((prev) => Array.from(new Set([...prev, ...data.favorites])));
        }
      })
      .catch(() => {});
  }, [currentUser]);

  // Synchronize inbox inquiry chat threads from server database when user is authenticated
  useEffect(() => {
    if (!currentUser) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('ukg_session_token') : null;
    fetch(resolveApiUrl('/api/inquiries'), {
      credentials: isNativeAndroidApp() ? 'omit' : 'include',
      headers: {
        'X-User-Id': currentUser.id,
        'X-User-Contact': currentUser.contact,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.threads && Array.isArray(data.threads) && data.threads.length > 0) {
          setChatThreads(data.threads);
        }
      })
      .catch(() => {});
  }, [currentUser]);

  const toggleFavorite = (id: string) => {
    requireAuth(() => {
      setFavorites((prev) => {
        const isFav = prev.includes(id);
        const next = isFav ? prev.filter((item) => item !== id) : [...prev, id];

        // Save favorite status to server database
        fetch(resolveApiUrl(`/api/favorites/${encodeURIComponent(id)}`), {
          method: isFav ? 'DELETE' : 'POST',
          credentials: 'include',
          headers: {
            'X-User-Id': currentUser?.id || '',
            'X-User-Contact': currentUser?.contact || '',
          },
        }).catch((e) => console.warn('Favorite server sync notice:', e));

        return next;
      });
    }, isHindi ? 'संपत्ति को सहेजने हेतु कृपया पहले लॉगिन या रजिस्टर करें।' : 'Please sign in or register to save properties.');
  };

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setPropertyNotFound(false);
    try {
      window.history.pushState({ propertyId: property.id }, '', `?property=${encodeURIComponent(property.id)}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMarketplace = () => {
    setSelectedProperty(null);
    setPropertyNotFound(false);
    try {
      localStorage.removeItem('uk_gateways_selected_property');
      sessionStorage.removeItem('uk_gateways_selected_property');
      const params = new URLSearchParams(window.location.search);
      params.delete('property');
      const remaining = params.toString();
      window.history.pushState({}, '', remaining ? `?${remaining}` : '/');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleOpenUnitConverter = () => {
    requireAuth(() => {
      setIsUnitConverterOpen(true);
    }, isHindi ? 'भूमि इकाई कैलकुलेटर उपयोग करने हेतु कृपया लॉगिन करें।' : 'Please sign in or register to use the land unit converter.');
  };

  const handleOpenUploadModal = () => {
    requireAuth(() => {
      setListChooserStep('sale-role');
      setShowListChooser(true);
    }, isHindi ? 'अपनी संपत्ति लिस्ट करने हेतु कृपया पहले लॉगिन या रजिस्टर करें।' : 'Please sign in or register to list your property.');
  };

  const handleOpenRentalModal = () => {
    requireAuth(() => {
      navigateToPage('rent-gui');
    }, isHindi ? 'किराये हेतु संपत्ति लिस्ट करने के लिए कृपया पहले लॉगिन या रजिस्टर करें।' : 'Please sign in or register to list your rental property with 0% brokerage.');
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setShowingFavoritesOnly(false);
    setShowRentFilter(false);
    setCurrentPage(1);
  };

  const handleBuyClick = () => {
    navigateToPage('buy');
  };

  const handleLogoClick = () => {
    if (selectedProperty) {
      handleBackToMarketplace();
    }
    handleResetFilters();
    navigateToPage('home');
  };

  const handleFilterRent = () => {
    navigateToPage('rent');
  };

  // Helper to notify other tabs & window listeners
  const broadcastPropertiesUpdated = (updatedProps: Property[]) => {
    try {
      const bc = new BroadcastChannel('uk_gateways_properties_channel');
      bc.postMessage({ type: 'PROPERTIES_UPDATED', properties: updatedProps });
      bc.close();
    } catch {}
    window.dispatchEvent(new CustomEvent('uk_gateways_properties_updated', { detail: updatedProps }));
  };

  // Handler when a user uploads a new property to the marketplace
  const handlePropertyUploaded = async (newProperty: Property) => {
    // Optimistically update local catalog
    setProperties((prev) => {
      const updated = [newProperty, ...prev.filter((p) => p.id !== newProperty.id)];
      try {
        localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(updated));
        const myIds = JSON.parse(localStorage.getItem('ukg_my_listing_ids') || '[]');
        if (!myIds.includes(newProperty.id)) {
          myIds.push(newProperty.id);
          localStorage.setItem('ukg_my_listing_ids', JSON.stringify(myIds));
        }
      } catch {}
      return updated;
    });

    // Save to shared server database so other users (and logged-out visitors) see it
    try {
      const createdProp = await api.createProperty(newProperty);
      if (createdProp) {
        setProperties((prev) => [createdProp, ...prev.filter((p) => p.id !== createdProp.id)]);
      }

      broadcastPropertiesUpdated([]);
      setUploadToast(isHindi ? `"${newProperty.title}" अब लाइव है!` : `"${newProperty.title}" is now live in the marketplace!`);
    } catch (err: any) {
      console.error('Failed to save property to server:', err);
      // Revert optimistic update on server error
      setProperties((prev) => prev.filter((p) => p.id !== newProperty.id));
      try {
        const stored = localStorage.getItem('uk_gateways_uploaded_properties');
        if (stored) {
          const list: Property[] = JSON.parse(stored);
          localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(list.filter((p) => p.id !== newProperty.id)));
        }
      } catch {}
      setUploadToast(
        isHindi
          ? `प्रॉपर्टी सेव करने में विफल: ${err.message || 'सर्वर एरर'}`
          : `Failed to save property to server: ${err.message || 'Server error'}. Please try again.`
      );
    }

    setTimeout(() => {
      setUploadToast(null);
    }, 6000);

    // Scroll to properties section
    setTimeout(() => {
      const el = document.getElementById('properties-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  // Handler when an owner edits their property listing
  const handlePropertyUpdated = async (updatedProperty: Property) => {
    const cleanedProperty = { ...updatedProperty } as Record<string, any>;
    Object.keys(cleanedProperty).forEach((key) => {
      if (cleanedProperty[key] === null || cleanedProperty[key] === undefined) {
        delete cleanedProperty[key];
      }
    });
    const finalProperty = cleanedProperty as Property;
    const prevList = [...properties];

    // Optimistically update local state & browser storage
    setProperties((prev) => {
      const updated = prev.map((p) => (p.id === finalProperty.id ? finalProperty : p));
      try {
        localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(updated));
        localStorage.setItem(`uk_gateways_prop_${finalProperty.id}`, JSON.stringify(finalProperty));
      } catch {}
      return updated;
    });

    if (selectedProperty?.id === finalProperty.id) {
      setSelectedProperty(finalProperty);
    }

    // Save to shared server database
    try {
      const savedProperty = await api.updateProperty(updatedProperty.id, updatedProperty);

      setProperties((prev) => {
        const updated = prev.map((p) => (p.id === savedProperty.id ? savedProperty : p));
        try {
          localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(updated));
          localStorage.setItem(`uk_gateways_prop_${savedProperty.id}`, JSON.stringify(savedProperty));
        } catch {}
        return updated;
      });

      if (selectedProperty?.id === savedProperty.id) {
        setSelectedProperty(savedProperty);
      }

      broadcastPropertiesUpdated([]);
      setUploadToast(isHindi ? `प्रॉपर्टी "${finalProperty.title}" सफलतापूर्वक अपडेट की गई!` : `Property "${finalProperty.title}" updated successfully!`);
    } catch (err: any) {
      console.warn('Failed to update property on server:', err);
      // Keep optimistic update locally in localStorage and properties state
      broadcastPropertiesUpdated([]);
      setUploadToast(isHindi ? `प्रॉपर्टी "${finalProperty.title}" सफलतापूर्वक अपडेट की गई!` : `Property "${finalProperty.title}" updated successfully!`);
    }

    setTimeout(() => {
      setUploadToast(null);
    }, 5000);
  };

  // Handler when an owner deletes their property listing
  const handleDeleteProperty = async (propertyId: string) => {
    const prevList = [...properties];

    setProperties((prev) => {
      const updated = prev.filter((p) => p.id !== propertyId);
      try {
        localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(updated));
        const myIds = JSON.parse(localStorage.getItem('ukg_my_listing_ids') || '[]');
        const filteredIds = myIds.filter((id: string) => id !== propertyId);
        localStorage.setItem('ukg_my_listing_ids', JSON.stringify(filteredIds));
      } catch {}
      return updated;
    });

    // Remove any stale browser cache for this deleted property.
    try {
      localStorage.removeItem(`uk_gateways_prop_${propertyId}`);
      sessionStorage.removeItem(`uk_gateways_prop_${propertyId}`);
      const selectedRaw = localStorage.getItem('uk_gateways_selected_property');
      if (selectedRaw && JSON.parse(selectedRaw)?.id === propertyId) {
        localStorage.removeItem('uk_gateways_selected_property');
      }
      const sessionSelectedRaw = sessionStorage.getItem('uk_gateways_selected_property');
      if (sessionSelectedRaw && JSON.parse(sessionSelectedRaw)?.id === propertyId) {
        sessionStorage.removeItem('uk_gateways_selected_property');
      }
    } catch {}

    // Remove from favorites if saved
    setFavorites((prev) => prev.filter((id) => id !== propertyId));

    // Close detail modal if open
    if (selectedProperty?.id === propertyId) {
      setSelectedProperty(null);
    }

    // Delete from shared server database
    try {
      await api.deleteProperty(propertyId);
      broadcastPropertiesUpdated([]);
      setUploadToast(isHindi ? 'आपकी प्रॉपर्टी लिस्टिंग सफलतापूर्वक हटा दी गई।' : 'Your property listing has been successfully deleted.');
    } catch (err: any) {
      console.warn('Delete server note:', err);
      // Even if server is temporarily unreachable or item was client-only, keep local deletion
      broadcastPropertiesUpdated([]);
      setUploadToast(isHindi ? 'आपकी प्रॉपर्टी लिस्टिंग सफलतापूर्वक हटा दी गई।' : 'Your property listing has been successfully deleted.');
    }

    setTimeout(() => {
      setUploadToast(null);
    }, 4500);
  };

  // Handler for Platform Admin / Owner to delete all properties online at once
  const handleDeleteAllProperties = async () => {
    // 1. Immediately clear frontend catalog state
    setProperties([]);
    setSelectedProperty(null);
    setPropertyNotFound(false);
    setFavorites([]);

    // 2. Wipe client cache and stored uploaded properties
    try {
      localStorage.removeItem('uk_gateways_uploaded_properties');
      localStorage.removeItem('uk_gateways_selected_property');
      sessionStorage.removeItem('uk_gateways_selected_property');
      
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('uk_gateways_prop_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      const sessionKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k && (k.startsWith('uk_gateways_prop_') || k === 'uk_gateways_selected_property')) {
          sessionKeysToRemove.push(k);
        }
      }
      sessionKeysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch (e) {
      console.warn('Storage purge warning:', e);
    }

    // 3. Reset URL query if property param is active
    try {
      const currentUrl = new URL(window.location.href);
      if (currentUrl.searchParams.has('property')) {
        currentUrl.searchParams.delete('property');
        window.history.pushState({}, '', currentUrl.pathname + currentUrl.search);
      }
    } catch {}

    // 4. Wipe from backend server persistent store
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ukg_session_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(resolveApiUrl('/api/properties/clear-all'), {
        method: 'POST',
        credentials: isNativeAndroidApp() ? 'omit' : 'include',
        headers,
      });
      if (!res.ok) {
        await fetch(resolveApiUrl('/api/properties'), { 
          method: 'DELETE',
          credentials: isNativeAndroidApp() ? 'omit' : 'include',
          headers,
        });
      }
    } catch (err) {
      console.error('Failed to clear properties from server:', err);
    }
    broadcastPropertiesUpdated([]);

    setUploadToast(
      isHindi 
        ? 'एडमिन कार्रवाई: सभी संपत्तियां सफलतापूर्वक हटा दी गईं।' 
        : 'Admin Action: All properties have been permanently deleted.'
    );
    setTimeout(() => {
      setUploadToast(null);
    }, 5000);
  };

  // Handler when an owner toggles sold status
  const handleToggleSoldStatus = async (propertyId: string) => {
    const prevList = [...properties];
    let nextSoldStatus = false;
    let targetTitle = '';

    setProperties((prev) => {
      const updated = prev.map((p) => {
        if (p.id === propertyId) {
          nextSoldStatus = !p.isSold;
          targetTitle = p.title;
          const next = { ...p, isSold: nextSoldStatus };
          if (selectedProperty?.id === propertyId) {
            setSelectedProperty(next);
          }
          return next;
        }
        return p;
      });
      try {
        localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await api.updateProperty(propertyId, { isSold: nextSoldStatus });
      broadcastPropertiesUpdated([]);
      setUploadToast(
        nextSoldStatus
          ? (isHindi ? `"${targetTitle}" को बिक चुकी (SOLD) मार्क कर दिया गया है।` : `"${targetTitle}" marked as SOLD.`)
          : (isHindi ? `"${targetTitle}" को फिर से उपलब्ध (Available) मार्क किया गया।` : `"${targetTitle}" marked as Available.`)
      );
    } catch (err: any) {
      console.warn('Failed to toggle sold status on server:', err);
      // Keep optimistic update locally
      broadcastPropertiesUpdated([]);
      setUploadToast(
        nextSoldStatus
          ? (isHindi ? `"${targetTitle}" को बिक चुकी (SOLD) मार्क कर दिया गया है।` : `"${targetTitle}" marked as SOLD.`)
          : (isHindi ? `"${targetTitle}" को फिर से उपलब्ध (Available) मार्क किया गया।` : `"${targetTitle}" marked as Available.`)
      );
    }

    setTimeout(() => {
      setUploadToast(null);
    }, 4500);
  };

  const handleStartChat = (property: Property) => {
    requireAuth(() => {
      setPendingChatProperty(property);
    }, isHindi ? 'मालिक से इनबॉक्स में सीधी बातचीत शुरू करने हेतु लॉगिन आवश्यक है।' : 'Please sign in or register to chat with the property owner.');
  };

  // User confirmed the chat request in dialog -> create thread and send message
  const handleConfirmChatRequest = (property: Property, initialMessage: string) => {
    const existing = chatThreads.find((t) => t.propertyId === property.id);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'buyer' as const,
      senderName: currentUser?.username || 'You',
      text: initialMessage,
      timestamp: nowTime,
    };

    if (existing) {
      const updatedThreads = chatThreads.map((t) => {
        if (t.id === existing.id) {
          return {
            ...t,
            lastMessage: initialMessage,
            lastMessageTime: nowTime,
            messages: [...t.messages, userMsg],
          };
        }
        return t;
      });
      setChatThreads(updatedThreads);
      setActiveThreadId(existing.id);

      // Persist message to backend
      fetch(`/api/inquiries/${encodeURIComponent(existing.id)}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser?.id || '',
          'X-User-Contact': currentUser?.contact || '',
        },
        body: JSON.stringify({ text: initialMessage, senderRole: 'buyer' }),
      }).catch((e) => console.warn('Inquiry message dispatch notice:', e));
    } else {
      const newThread: ChatThread = {
        id: `thread-${property.id}-${currentUser?.id || Date.now()}`,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyCity: property.city,
        propertyImage: property.images[0] || 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
        propertyPrice: property.priceDisplay,
        sellerName: getPropertyOwnerDisplayName(property, currentUser) || 'Direct Property Owner',
        buyerName: currentUser?.username || 'You',
        unreadCount: 0,
        lastMessage: initialMessage,
        lastMessageTime: nowTime,
        messages: [userMsg],
      };
      setChatThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(newThread.id);

      // Save inquiry thread to backend database
      const token = typeof window !== 'undefined' ? localStorage.getItem('ukg_session_token') : null;
      fetch(resolveApiUrl('/api/inquiries'), {
        method: 'POST',
        credentials: isNativeAndroidApp() ? 'omit' : 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser?.id || '',
          'X-User-Contact': currentUser?.contact || '',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          propertyCity: property.city,
          propertyImage: property.images[0] || '',
          propertyPrice: property.priceDisplay,
          sellerId: (property as any).ownerId || '',
          sellerName: getPropertyOwnerDisplayName(property, currentUser) || 'Direct Property Owner',
          sellerContact: (property as any).ownerContact || (property as any).sellerPhone || '',
          initialMessage,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.thread?.id) {
            setActiveThreadId(data.thread.id);
            setChatThreads((prev) => prev.map((t) => (t.propertyId === property.id ? data.thread : t)));
          }
        })
        .catch((e) => console.warn('Inquiry thread save notice:', e));
    }

    setPendingChatProperty(null);
    const ownerName = getPropertyOwnerDisplayName(property, currentUser) || 'owner';
    setUploadToast(`Chat request sent to ${ownerName}! Opening conversation...`);
    setTimeout(() => setUploadToast(null), 3500);

    // Open in-app inbox modal
    setIsInboxOpen(true);
  };

  const handleSendMessage = (threadId: string, text: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'buyer' as const,
      senderName: 'You',
      text,
      timestamp: nowTime,
    };

    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            lastMessage: text,
            lastMessageTime: nowTime,
            messages: [...t.messages, userMsg],
          };
        }
        return t;
      })
    );

    // Persist sent message to database
    fetch(resolveApiUrl(`/api/inquiries/${encodeURIComponent(threadId)}/messages`), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': currentUser?.id || '',
        'X-User-Contact': currentUser?.contact || '',
      },
      body: JSON.stringify({ text, senderRole: 'buyer' }),
    }).catch((e) => console.warn('Message sync notice:', e));

    // Simulate owner reply after 1.2s if this is a demo simulation
    setTimeout(() => {
      const ownerReply = {
        id: `msg-${Date.now() + 1}`,
        sender: 'seller' as const,
        senderName: 'Property Owner',
        text: `Namaste! Thanks for reaching out. Yes, clear title and immediate mutation are available. Would you like to schedule an in-person site visit or request my direct phone number?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatThreads((prev) =>
        prev.map((t) => {
          if (t.id === threadId) {
            return {
              ...t,
              sellerName: t.sellerName,
              lastMessage: ownerReply.text,
              lastMessageTime: ownerReply.timestamp,
              messages: [...t.messages, ownerReply],
            };
          }
          return t;
        })
      );
    }, 1200);
  };

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // Favorites filter
      if (showingFavoritesOnly && !favorites.includes(property.id)) {
        return false;
      }

      // Rent / Lease Group filter:
      const isRentProperty = property.type === 'Rent/Lease' || property.isAvailableForRent === true;

      // If user selected Rent or Lease category explicitly:
      if (filters.category === 'Rent/Lease' || filters.category === 'Rent' || filters.category === 'Lease') {
        if (!isRentProperty) return false;
      }
      // On the website main page all properties are shown together by default (both for sale & rent)

      // Category / Property Type filter
      if (filters.category !== 'All Types' && filters.category !== 'Rent/Lease' && filters.category !== 'Rent' && filters.category !== 'Lease') {
        const cat = filters.category.toLowerCase();
        const propType = (property.type || '').toLowerCase();
        const propCat = (property.category || '').toLowerCase();
        const propTitle = (property.title || '').toLowerCase();
        const propDesc = (property.description || '').toLowerCase();

        let matchesType = false;
        if (cat === 'house') {
          matchesType = propType === 'house' || propTitle.includes('house') || propTitle.includes('makan') || propTitle.includes('kothi') || propTitle.includes('independent house');
        } else if (cat === 'villa') {
          matchesType = propType === 'villa' || propTitle.includes('villa');
        } else if (cat === 'plot') {
          matchesType = propType === 'plot' || propType === 'land' || propTitle.includes('plot');
        } else if (cat === 'flat') {
          matchesType = propType === 'flat' || propTitle.includes('flat') || propTitle.includes('bhk');
        } else if (cat === 'apartment') {
          matchesType = propType === 'apartment' || propTitle.includes('apartment');
        } else if (cat === 'cottage') {
          matchesType = propType === 'cottage' || propTitle.includes('cottage');
        } else if (cat === 'farmhouse') {
          matchesType = propType === 'farmhouse' || propTitle.includes('farmhouse') || propTitle.includes('estate');
        } else if (cat === 'shop') {
          matchesType = propType === 'shop' || propCat === 'commercial' || propTitle.includes('shop') || propTitle.includes('commercial');
        } else if (cat === 'showroom') {
          matchesType = propType === 'showroom' || propTitle.includes('showroom');
        } else if (cat === 'office') {
          matchesType = propType === 'office' || propTitle.includes('office');
        } else if (cat === 'hotel') {
          matchesType = propType === 'hotel' || propType === 'resort' || propTitle.includes('hotel');
        } else if (cat === 'resort') {
          matchesType = propType === 'resort' || propType === 'hotel' || propTitle.includes('resort') || propTitle.includes('homestay');
        } else if (cat === 'studio') {
          matchesType = propType === 'studio' || propTitle.includes('studio') || propTitle.includes('1rk');
        } else if (cat === 'penthouse') {
          matchesType = propType === 'penthouse' || propTitle.includes('penthouse');
        } else if (cat === 'duplex') {
          matchesType = propType === 'duplex' || propTitle.includes('duplex');
        } else if (cat === 'land') {
          matchesType = propType === 'land' || propCat === 'agriculture' || propTitle.includes('land') || propTitle.includes('orchard');
        } else if (cat === 'pg') {
          matchesType = propType === 'pg' || propTitle.includes('pg');
        } else {
          matchesType = propType === cat || propCat === cat || propTitle.includes(cat) || propDesc.includes(cat);
        }

        if (!matchesType) {
          return false;
        }
      }

      // City / Location filter (Supports preset cities and custom "Other" location search)
      if (filters.city !== 'All Locations') {
        const targetCity = filters.city.toLowerCase().trim();
        const propCity = (property.city || '').toLowerCase();
        const propLoc = (property.location || '').toLowerCase();
        const propTitle = (property.title || '').toLowerCase();
        const propDesc = (property.description || '').toLowerCase();

        const matchesLocation = 
          propCity === targetCity ||
          propCity.includes(targetCity) ||
          propLoc.includes(targetCity) ||
          propTitle.includes(targetCity) ||
          propDesc.includes(targetCity);

        if (!matchesLocation) {
          return false;
        }
      }

      // Budget filter
      if (filters.budgetRange && filters.budgetRange !== 'all') {
        const priceLakhs = property.price / 100000;
        if (filters.budgetRange === 'under-25l' && priceLakhs >= 25) return false;
        if (filters.budgetRange === '25l-50l' && (priceLakhs < 25 || priceLakhs > 50)) return false;
        if (filters.budgetRange === '50l-1cr' && (priceLakhs < 50 || priceLakhs > 100)) return false;
        if (filters.budgetRange === '1cr-2.5cr' && (priceLakhs < 100 || priceLakhs > 250)) return false;
        if (filters.budgetRange === '2.5cr-5cr' && (priceLakhs < 250 || priceLakhs > 500)) return false;
        if (filters.budgetRange === 'above-5cr' && priceLakhs <= 500) return false;
        // Legacy fallback ranges
        if (filters.budgetRange === 'under-50' && priceLakhs >= 50) return false;
        if (filters.budgetRange === '50-100' && (priceLakhs < 50 || priceLakhs > 100)) return false;
        if (filters.budgetRange === '100-200' && (priceLakhs < 100 || priceLakhs > 200)) return false;
        if (filters.budgetRange === 'above-200' && priceLakhs <= 200) return false;
      }

      // BHK / Config filter
      if (filters.bhkConfig !== 'all') {
        if (filters.bhkConfig === 'plot') {
          if (property.type !== 'Plot') return false;
        } else {
          const bhkNum = parseInt(filters.bhkConfig, 10);
          if (property.bedrooms !== bhkNum) return false;
        }
      }

      // Search text query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = property.title.toLowerCase().includes(query);
        const matchesLocation = property.location.toLowerCase().includes(query);
        const matchesCity = property.city.toLowerCase().includes(query);
        const matchesDesc = property.description ? property.description.toLowerCase().includes(query) : false;
        const matchesType = property.type.toLowerCase().includes(query);
        const matchesAmenities = property.amenities.some((a) => a.toLowerCase().includes(query));

        if (!matchesTitle && !matchesLocation && !matchesCity && !matchesDesc && !matchesType && !matchesAmenities) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-low') {
        return a.price - b.price;
      }
      if (filters.sortBy === 'price-high') {
        return b.price - a.price;
      }
      if (filters.sortBy === 'area-large') {
        return b.areaSqFt - a.areaSqFt;
      }
      if (filters.sortBy === 'area-small') {
        return a.areaSqFt - b.areaSqFt;
      }
      return 0;
    });
  }, [properties, filters, favorites, showingFavoritesOnly]);

  // Pagination calculation: 10 properties per page
  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredProperties.length);
  const displayedProperties = filteredProperties.slice(startIndex, endIndex);

  const scrollToProperties = () => {
    const el = document.getElementById('properties-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    const el = document.getElementById('contact-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      scrollToProperties();
    }
  };

  const isDark = theme === 'dark';

  const urlPropId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('property') : null;

  const handleTabChange = (tab: MobileNavTab) => {
    setMobileNavTab(tab);
    setSelectedProperty(null);
    setPropertyNotFound(false);
    try {
      if (tab === 'home') {
        window.history.pushState({}, '', '/');
      } else {
        window.history.pushState({ tab }, '', `?tab=${tab}`);
      }
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // NATIVE ANDROID MOBILE APP SHELL (Preserved mobile-first experience)
  // =========================================================================
  if (isNativeAndroidApp()) {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Uttarakhand Gateways Mobile App" onReset={() => window.location.reload()}>
        <AppSplashScreen />
        <div className="w-full min-h-screen bg-[#04120c] flex justify-center items-start">
          <div className="mobile-app-shell w-full max-w-[480px] min-h-screen bg-[#f4f8f5] dark:bg-[#061811] text-slate-800 dark:text-slate-100 relative shadow-2xl border-x-0 sm:border-x sm:border-emerald-950/40 mx-auto">
            <MobileAppView
              properties={properties}
              currentUser={currentUser}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onStartChat={handleStartChat}
              onSelectProperty={handleSelectProperty}
              selectedProperty={selectedProperty}
              onClearSelectedProperty={handleBackToMarketplace}
              activeTab={mobileNavTab}
              onTabChange={handleTabChange}
              onOpenSellModal={() => handleTabChange('list')}
              onOpenRentalModal={() => handleTabChange('list')}
              onOpenInbox={() => {
                requireAuth(() => setIsInboxOpen(true), isHindi ? 'संदेश देखने हेतु लॉगिन करें।' : 'Please sign in to access your Inbox.');
              }}
              onOpenDashboard={() => handleTabChange('profile')}
              unreadInboxCount={chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0)}
              theme={theme}
              onToggleTheme={toggleTheme}
              requireAuth={requireAuth}
              openAuthModal={openAuthModal}
              onDeleteProperty={handleDeleteProperty}
              onToggleSold={handleToggleSoldStatus}
              onEditProperty={(prop) => setEditingProperty(prop)}
              onOpenLegalPolicy={handleOpenLegalPolicy}
              onPropertyUploaded={handlePropertyUploaded}
              onRefreshProperties={async () => {
                try {
                  const serverProps = await api.fetchProperties();
                  if (serverProps.length > 0) {
                    setProperties(serverProps);
                    try {
                      localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(serverProps));
                    } catch {}
                  }
                } catch (err) {
                  console.warn('Manual refresh failed:', err);
                }
              }}
              onOpenUnitConverter={handleOpenUnitConverter}
              onOpenEmiCalculator={(price) => {
                setEmiCalculatorInitialPrice(price || 5000000);
                setIsEmiCalculatorOpen(true);
              }}
              onOpenGuide={() => setIsGuideOpen(true)}
              onOpenAdminAccounts={() => setIsAdminAccountsOpen(true)}
              onOpenAdminReports={() => setIsAdminReportsOpen(true)}
              isLoading={false}
              loadError={null}
              onRetryLoad={() => window.location.reload()}
            />

            {/* Global Modals for Mobile App */}
            <AuthModal />
            <FirstVisitLanguageModal />

            <EditPropertyModal
              isOpen={Boolean(editingProperty)}
              onClose={() => setEditingProperty(null)}
              property={editingProperty}
              onPropertyUpdated={handlePropertyUpdated}
            />

            <LegalModal
              isOpen={legalModalState.isOpen}
              onClose={() => setLegalModalState((prev) => ({ ...prev, isOpen: false }))}
              initialTab={legalModalState.activeTab}
            />

            <ChatConfirmationModal
              property={pendingChatProperty}
              isOpen={!!pendingChatProperty}
              onClose={() => setPendingChatProperty(null)}
              onConfirm={handleConfirmChatRequest}
            />

            <InboxModal
              isOpen={isInboxOpen}
              onClose={() => setIsInboxOpen(false)}
              chatThreads={chatThreads}
              onSendMessage={handleSendMessage}
              activeThreadId={activeThreadId}
              onSelectThread={(id) => setActiveThreadId(id)}
              allProperties={properties}
              onSelectProperty={(id) => {
                const prop = properties.find((p) => p.id === id);
                if (prop) {
                  setSelectedProperty(prop);
                  setIsInboxOpen(false);
                }
              }}
            />

            <LandGuideModal
              isOpen={isGuideOpen}
              onClose={() => setIsGuideOpen(false)}
              onOpenUnitConverter={() => {
                setIsGuideOpen(false);
                setIsUnitConverterOpen(true);
              }}
            />

            <LandUnitConverterModal
              isOpen={isUnitConverterOpen}
              onClose={() => setIsUnitConverterOpen(false)}
            />

            <EmiCalculatorModal
              isOpen={isEmiCalculatorOpen}
              onClose={() => setIsEmiCalculatorOpen(false)}
              initialPrice={emiCalculatorInitialPrice}
            />

            <AdminAccountsModal
              isOpen={isAdminAccountsOpen}
              onClose={() => setIsAdminAccountsOpen(false)}
              onOpenReports={() => { setIsAdminAccountsOpen(false); setIsAdminReportsOpen(true); }}
              onDeleteAllProperties={() => setIsDeleteAllModalOpen(true)}
              totalPropertiesCount={properties.length}
            />

            <AdminReportsModal
              isOpen={isAdminReportsOpen}
              onClose={() => setIsAdminReportsOpen(false)}
              allProperties={properties}
              onSelectProperty={(property) => { setSelectedProperty(property); setIsAdminReportsOpen(false); }}
              onDeleteAllProperties={() => setIsDeleteAllModalOpen(true)}
            />

            <DeleteAllPropertiesModal
              isOpen={isDeleteAllModalOpen}
              onClose={() => setIsDeleteAllModalOpen(false)}
              onConfirmDeleteAll={handleDeleteAllProperties}
              totalProperties={properties.length}
            />

            <ReportListingModal
              isOpen={Boolean(reportingProperty)}
              property={reportingProperty}
              onClose={() => setReportingProperty(null)}
            />

            <LoginSuccessAnimation
              isOpen={showLoginAnimation}
              username={loginAnimationUser}
              onComplete={dismissLoginAnimation}
            />

            {/* Toast Notification */}
            {uploadToast && (
              <div className="fixed bottom-20 left-4 right-4 z-50 max-w-[440px] mx-auto bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <strong className="block font-bold text-emerald-300">Uttarakhand Gateways</strong>
                  <span>{uploadToast}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // =========================================================================
  // RESPONSIVE WEBSITE EXPERIENCE (Desktop & Mobile Web)
  // =========================================================================
  // Standalone Web Pages (Inbox, Login, Buy, Rent, Sell GUI, Rent GUI)
  
  if (activePage === 'home-loan') {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Home Loan Eligibility & EMI Calculator" onReset={() => navigateToPage('home')}>
        <HomeLoanPage
          onBackToMain={() => navigateToPage('home')}
          onNavigatePage={(page) => navigateToPage(page as ActivePageView)}
          isDark={isDark}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
      </ErrorBoundary>
    );
  }

  if (activePage === 'inbox') {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Inbox" onReset={() => navigateToPage('home')}>
        <InboxPage 
          onBackToMarketplace={() => navigateToPage('home')} 
        />
      </ErrorBoundary>
    );
  }

  if (activePage === 'login') {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Sign In" onReset={() => navigateToPage('home')}>
        <LoginPage 
          initialMode="login"
          onBackToMain={() => navigateToPage('home')}
          onLoginSuccess={() => navigateToPage('home')}
        />
      </ErrorBoundary>
    );
  }

  if (activePage === 'register') {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Registration" onReset={() => navigateToPage('home')}>
        <LoginPage 
          initialMode="register"
          onBackToMain={() => navigateToPage('home')}
          onLoginSuccess={() => navigateToPage('home')}
        />
      </ErrorBoundary>
    );
  }

  if (activePage === 'sell-gui') {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Property Listing GUI" onReset={() => navigateToPage('home')}>
        <SellGuiPage
          onBackToMain={() => navigateToPage('home')}
          onPropertyUploaded={(p) => {
            handlePropertyUploaded(p);
            navigateToPage('home');
          }}
          lastUploadTime={lastUploadTime}
          onUpdateLastUploadTime={setLastUploadTime}
          onOpenLegalPolicy={handleOpenLegalPolicy}
          initialRole={sellListingRole}
        />
      </ErrorBoundary>
    );
  }

  if (activePage === 'rent-gui') {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Rental Listing GUI" onReset={() => navigateToPage('home')}>
        <RentGuiPage
          onBackToMain={() => navigateToPage('home')}
          onRentalUploaded={(p) => {
            handlePropertyUploaded(p);
            navigateToPage('rent');
          }}
          onOpenLegalPolicy={handleOpenLegalPolicy}
        />
      </ErrorBoundary>
    );
  }

  if (activePage === 'dashboard' && !selectedProperty) {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Lister Growth Dashboard" onReset={() => navigateToPage('home')}>
        <ListerDashboard
          properties={properties}
          onSelectProperty={handleSelectProperty}
          onEditProperty={(prop) => setEditingProperty(prop)}
          onDeleteProperty={handleDeleteProperty}
          onToggleSold={handleToggleSoldStatus}
          onBackToMain={() => navigateToPage('home')}
          onOpenListChooser={() => {
            requireAuth(() => {
              setListChooserStep('type');
              setShowListChooser(true);
            }, isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' : 'Please sign in with your email via OTP to list a property.');
          }}
        />
        <EditPropertyModal
          isOpen={Boolean(editingProperty)}
          onClose={() => setEditingProperty(null)}
          property={editingProperty}
          onPropertyUpdated={handlePropertyUpdated}
        />
        {showListChooser && (
          <ListChooserModal
            isOpen={showListChooser}
            onClose={() => {
              setShowListChooser(false);
              setListChooserStep('type');
            }}
            initialStep={listChooserStep}
            onSelectSale={(role: 'Owner' | 'Broker') => {
              setSellListingRole(role);
              setShowListChooser(false);
              setListChooserStep('type');
              navigateToPage('sell-gui');
            }}
            onSelectRent={() => {
              setShowListChooser(false);
              navigateToPage('rent-gui');
            }}
          />
        )}
      </ErrorBoundary>
    );
  }

  if (activePage === 'buy' && !selectedProperty) {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Buy Properties" onReset={() => navigateToPage('home')}>
        <BuyPage
          properties={properties}
          onSelectProperty={handleSelectProperty}
          onBackToMain={() => navigateToPage('home')}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onStartChat={handleStartChat}
          onDeleteProperty={handleDeleteProperty}
          onToggleSold={handleToggleSoldStatus}
          onEditProperty={(prop) => setEditingProperty(prop)}
        />
        <EditPropertyModal
          isOpen={Boolean(editingProperty)}
          onClose={() => setEditingProperty(null)}
          property={editingProperty}
          onPropertyUpdated={handlePropertyUpdated}
        />
      </ErrorBoundary>
    );
  }

  if (activePage === 'rent' && !selectedProperty) {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Rental Properties" onReset={() => navigateToPage('home')}>
        <RentPage
          properties={properties}
          onSelectProperty={handleSelectProperty}
          onBackToMain={() => navigateToPage('home')}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onStartChat={handleStartChat}
          onDeleteProperty={handleDeleteProperty}
          onToggleSold={handleToggleSoldStatus}
          onEditProperty={(prop) => setEditingProperty(prop)}
        />
        <EditPropertyModal
          isOpen={Boolean(editingProperty)}
          onClose={() => setEditingProperty(null)}
          property={editingProperty}
          onPropertyUpdated={handlePropertyUpdated}
        />
      </ErrorBoundary>
    );
  }

  // 1. Mobile App View (Primary Experience)
  if (viewMode === 'app' && !selectedProperty && activePage === 'home') {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Uttarakhand Gateways Mobile App" onReset={() => window.location.reload()}>
        <MobileDeviceSimulator
          onSwitchToDesktop={() => setViewMode('desktop')}
          localIp="192.168.1.6"
          port={3000}
        >
          <MobileAppView
            properties={properties}
            currentUser={currentUser}
            favorites={favorites}
            activeTab={mobileNavTab}
            onTabChange={handleTabChange}
            onToggleFavorite={toggleFavorite}
            onStartChat={handleStartChat}
            onSelectProperty={handleSelectProperty}
            onOpenSellModal={() => {
              requireAuth(() => {
                setListChooserStep('type');
                setShowListChooser(true);
              }, isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल से लॉगिन करें।' : 'Please sign in to list a property.');
            }}
            onOpenRentalModal={() => {
              requireAuth(() => {
                navigateToPage('rent-gui');
              }, isHindi ? 'किराये की प्रॉपर्टी लिस्ट करने हेतु लॉगिन करें।' : 'Please sign in to list rental property.');
            }}
            onOpenInbox={() => {
              requireAuth(() => {
                navigateToPage('inbox');
              }, isHindi ? 'संदेश देखने हेतु लॉगिन करें।' : 'Please sign in to access your Inbox.');
            }}
            onOpenDashboard={() => navigateToPage('dashboard')}
            unreadInboxCount={chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0)}
            theme={theme}
            onToggleTheme={toggleTheme}
            requireAuth={requireAuth}
            openAuthModal={openAuthModal}
            onDeleteProperty={handleDeleteProperty}
            onToggleSold={handleToggleSoldStatus}
            onEditProperty={(prop) => setEditingProperty(prop)}
            onOpenLegalPolicy={handleOpenLegalPolicy}
            isLoading={false}
            loadError={null}
            onRetryLoad={() => window.location.reload()}
          />
        </MobileDeviceSimulator>

        {/* Global Modals for Mobile App */}
        <AuthModal />
        <ListChooserModal
          isOpen={showListChooser}
          onClose={() => setShowListChooser(false)}
          initialStep={listChooserStep}
          onSelectSale={(role) => {
            setSellListingRole(role);
            setShowListChooser(false);
            requireAuth(() => navigateToPage('sell-gui'));
          }}
          onSelectRent={() => {
            setShowListChooser(false);
            requireAuth(() => navigateToPage('rent-gui'));
          }}
        />
        <EditPropertyModal
          isOpen={Boolean(editingProperty)}
          onClose={() => setEditingProperty(null)}
          property={editingProperty}
          onPropertyUpdated={handlePropertyUpdated}
        />
        <LegalModal
          isOpen={legalModalState.isOpen}
          onClose={() => setLegalModalState((prev) => ({ ...prev, isOpen: false }))}
          initialTab={legalModalState.activeTab}
        />
        <ChatConfirmationModal
          property={pendingChatProperty}
          isOpen={!!pendingChatProperty}
          onClose={() => setPendingChatProperty(null)}
          onConfirm={handleConfirmChatRequest}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#071a14] text-slate-100' : 'bg-[#f2f7f4] text-slate-800'} flex flex-col selection:bg-emerald-600 selection:text-white relative overflow-x-hidden w-full transition-colors duration-300 pb-24 sm:pb-32`}>
      
      {/* BACKGROUND CANVAS: Light Greenish Mountain Mist & Dark Himalayan Night */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Greenish Gradient Wash / Dark Pine Wash */}
        <div className={`absolute inset-0 transition-colors duration-500 ${
          isDark 
            ? 'bg-gradient-to-b from-[#071a14] via-[#0b241c] to-[#071a14]' 
            : 'bg-gradient-to-b from-[#eef6f0] via-[#f5fbf7] to-[#eaf4ed]'
        }`} />
        
        {/* Ambient Radial Sage & Emerald Glow Points */}
        <div className={`absolute -top-40 left-1/4 w-[700px] h-[700px] rounded-full blur-[140px] transition-colors duration-500 ${
          isDark ? 'bg-emerald-500/10' : 'bg-emerald-300/15'
        }`} />
        <div className={`absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] transition-colors duration-500 ${
          isDark ? 'bg-teal-600/10' : 'bg-teal-300/15'
        }`} />
        <div className={`absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full blur-[160px] transition-colors duration-500 ${
          isDark ? 'bg-green-600/10' : 'bg-green-300/15'
        }`} />

        {/* Topographic Contour Map Pattern */}
        <svg className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isDark ? 'opacity-[0.05]' : 'opacity-[0.035]'}`} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="topo-contours" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 0 50 Q 50 20 100 50 T 200 50" fill="none" stroke="#059669" strokeWidth="1" />
              <path d="M 0 100 Q 60 70 120 100 T 200 100" fill="none" stroke="#047857" strokeWidth="0.8" />
              <path d="M 0 150 Q 40 180 100 150 T 200 150" fill="none" stroke="#059669" strokeWidth="0.8" />
              <circle cx="100" cy="100" r="35" fill="none" stroke="#059669" strokeWidth="0.6" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="#047857" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo-contours)" />
        </svg>
      </div>

      {/* Navigation Bar with Theme Toggle, Common List CTA, Inbox, and 3-lines menu at corner */}
      <Navbar
        onLogoClick={handleLogoClick}
        allProperties={properties}
        onEditProperty={(prop) => setEditingProperty(prop)}
        onDeleteProperty={handleDeleteProperty}
        onDeleteAllProperties={() => setIsDeleteAllModalOpen(true)}
        onOpenSellModal={() => {
          requireAuth(() => {
            navigateToPage('sell-gui');
          }, isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' : 'Please sign in with your email via OTP to list a property.');
        }}
        onOpenRentalModal={() => {
          requireAuth(() => {
            navigateToPage('rent-gui');
          }, isHindi ? 'किराये की प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' : 'Please sign in with your email via OTP to list a property.');
        }}
        onOpenListChooser={() => {
          requireAuth(() => {
            setListChooserStep('type');
            setShowListChooser(true);
          }, isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' : 'Please sign in with your email via OTP to list a property.');
        }}
        isRentActive={showRentFilter || filters.category === 'Rent/Lease'}
        isPropertyViewActive={Boolean(selectedProperty)}
        onReturnToProperties={handleBackToMarketplace}
        onBuyClick={() => navigateToPage('buy')}
        onRentClick={() => navigateToPage('rent')}
        onOpenAdminAccounts={() => setIsAdminAccountsOpen(true)}
        onOpenInbox={() => {
          requireAuth(() => {
            navigateToPage('inbox');
          }, isHindi ? 'संदेश और इनबॉक्स देखने हेतु लॉगिन आवश्यक है।' : 'Please sign in or register to access your Inbox.');
        }}
        onOpenCalculator={() => {
          const el = document.getElementById('calculator-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenEmiCalculator={() => {
          setEmiCalculatorInitialPrice(5000000);
          setIsEmiCalculatorOpen(true);
        }}
        onOpenDashboard={() => navigateToPage('dashboard')}
        unreadInboxCount={
          chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0)
        }
        onOpenUnitConverter={handleOpenUnitConverter}
        favoriteCount={favorites.length}
        onToggleFavoritesOnly={() => {
          requireAuth(() => {
            setShowingFavoritesOnly(!showingFavoritesOnly);
            setCurrentPage(1);
          }, isHindi ? 'सहेजी गई संपत्तियां देखने हेतु लॉगिन आवश्यक है।' : 'Please sign in or register to view saved properties.');
        }}
        showingFavoritesOnly={showingFavoritesOnly}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenLegalPolicy={handleOpenLegalPolicy}
        onSelectProperty={handleSelectProperty}
      />

      {/* If a property is selected: Render dedicated full PropertyDetailPage instead of popup modal! */}
      {selectedProperty ? (
        <main className="relative z-20 flex-1 w-full">
          <PropertyDetailPage
            property={selectedProperty}
            onBack={handleBackToMarketplace}
            isFavorite={favorites.includes(selectedProperty.id)}
            onToggleFavorite={toggleFavorite}
            onStartChat={handleStartChat}
            onDeleteProperty={(id) => {
              handleDeleteProperty(id);
              handleBackToMarketplace();
            }}
            onToggleSold={handleToggleSoldStatus}
            onEditProperty={(prop) => setEditingProperty(prop)}
            allProperties={properties}
            onSelectProperty={handleSelectProperty}
            onOpenLegalPolicy={handleOpenLegalPolicy}
            onReportListing={(property) => setReportingProperty(property)}
          />
        </main>
      ) : (urlPropId && !propertyNotFound) ? (
        <main className="relative z-20 flex-1 w-full min-h-[60vh] flex items-center justify-center py-20 px-4">
          <div className="text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isHindi ? 'प्रॉपर्टी विवरण लोड हो रहा है...' : 'Loading Property Details...'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isHindi ? 'कृपया प्रतीक्षा करें, संपत्ति की जानकारी लाई जा रही है।' : 'Please wait while we retrieve the verified property listing.'}
            </p>
          </div>
        </main>
      ) : propertyNotFound ? (
        <main className="relative z-20 flex-1 w-full min-h-[60vh] flex items-center justify-center py-20 px-4">
          <div className="text-center space-y-4 max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isHindi ? 'प्रॉपर्टी उपलब्ध नहीं है' : 'Property Not Available'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isHindi ? 'यह प्रॉपर्टी हटा दी गई है या उपलब्ध नहीं है।' : 'This property listing may have been sold, removed, or is no longer active.'}
            </p>
            <button
              type="button"
              onClick={handleBackToMarketplace}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {isHindi ? 'मार्केटप्लेस पर वापस जाएं' : 'Back to Marketplace'}
            </button>
          </div>
        </main>
      ) : (
        <>
          {/* SECTION 2: Property Filter and Search Bar */}
          <PropertyFilterSection
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalResults={filteredProperties.length}
            onSearchSubmit={scrollToProperties}
            isRentActive={showRentFilter || filters.category === 'Rent/Lease'}
            onToggleRent={(isRent) => {
              setShowRentFilter(isRent);
              if (isRent) {
                setFilters((prev) => ({ ...prev, category: 'Rent/Lease' }));
              } else {
                setFilters((prev) => ({ ...prev, category: 'All Types' }));
              }
            }}
          />

          {/* SECTION 3: Land / Plot Section */}
          <LandPlotsSection
            properties={properties}
            onSelectProperty={handleSelectProperty}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onViewAll={() => {
              setFilters((prev) => ({ ...prev, category: 'Land / Plot' }));
              scrollToProperties();
            }}
            onListLandClick={() => {
              requireAuth(() => {
                setListChooserStep('type');
                setShowListChooser(true);
              }, isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' : 'Please sign in with your email via OTP to list a property.');
            }}
          />

          {/* SECTION 4: Trending Properties — Horizontal Scrolling Carousel */}
          <TrendingCarousel
            properties={properties}
            onSelectProperty={handleSelectProperty}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />

          {/* SECTION 5: EMI Calculator */}
          <StandaloneEmiCalculator />

          {/* SECTION 6: Land Area Calculator */}
          <StandaloneLandCalculator />

      {/* Main Content Area: Properties Portfolio */}
      <main id="properties-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-20">
        
        {/* Saved for Later Indicator Bar */}
        {showingFavoritesOnly && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-emerald-800 dark:text-emerald-200 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bookmark className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>
                {isHindi 
                  ? `आपकी सहेजी गई ${favorites.length} संपत्तियां दिखाई जा रही हैं` 
                  : `Showing your ${favorites.length} properties saved for later`}
              </span>
            </div>
            <button
              onClick={() => {
                setShowingFavoritesOnly(false);
                setCurrentPage(1);
              }}
              className="text-xs bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-800 px-3 py-1.5 rounded-lg text-emerald-900 dark:text-emerald-100 font-semibold cursor-pointer"
            >
              {isHindi ? 'सभी संपत्तियां देखें' : 'Show All Properties'}
            </button>
          </div>
        )}

        {/* Properties Grid Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-emerald-200/80 dark:border-emerald-950/80">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0a271c] dark:text-white font-serif-luxury">
              {showingFavoritesOnly 
                ? (isHindi ? 'सहेजी गई संपत्तियां' : 'Saved for Later') 
                : (isHindi 
                    ? `सभी संपत्तियां (${filteredProperties.length})` 
                    : `Show all properties (${filteredProperties.length})`)}
            </h3>
          </div>

          {/* Common List Button (Directs to Chooser for Sale or Rent GUI) */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <button
              onClick={() => {
                requireAuth(() => {
                  setShowListChooser(true);
                }, isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' : 'Please sign in with your email via OTP to list a property.');
              }}
              className="text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold flex items-center gap-2 transition-all shadow-md shadow-emerald-700/25 hover:shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer"
              title={isHindi ? 'प्रॉपर्टी लिस्ट करें' : 'List Property'}
            >
              <PlusCircle className="w-4 h-4 text-emerald-100 shrink-0" />
              <span>{isHindi ? 'लिस्ट' : 'List'}</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full uppercase ml-0.5">
                FREE
              </span>
            </button>
          </div>
        </div>

        {/* Properties Grid: 10 properties per page */}
        {displayedProperties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {displayedProperties.map((property, idx) => (
                <PropertyCard
                  key={property.id}
                  index={idx}
                  property={property}
                  onSelect={(p) => handleSelectProperty(p)}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={toggleFavorite}
                  onStartChat={handleStartChat}
                  onDeleteProperty={handleDeleteProperty}
                  onToggleSold={handleToggleSoldStatus}
                  onEditProperty={(prop) => setEditingProperty(prop)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl border border-emerald-200/70 dark:border-emerald-950/70 shadow-xs">
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {isHindi ? (
                    <>
                      दिखाए जा रहे हैं <span className="font-bold text-emerald-700 dark:text-emerald-400">{startIndex + 1}</span> - <span className="font-bold text-emerald-700 dark:text-emerald-400">{endIndex}</span> कुल <span className="font-bold text-emerald-700 dark:text-emerald-400">{filteredProperties.length}</span> संपत्तियों में से
                    </>
                  ) : (
                    <>
                      Showing <span className="font-bold text-emerald-700 dark:text-emerald-400">{startIndex + 1}</span> - <span className="font-bold text-emerald-700 dark:text-emerald-400">{endIndex}</span> of <span className="font-bold text-emerald-700 dark:text-emerald-400">{filteredProperties.length}</span> properties
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    className="p-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= safeCurrentPage - 1 && pageNum <= safeCurrentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            safeCurrentPage === pageNum
                              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/25'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (
                      (pageNum === safeCurrentPage - 2 && pageNum > 1) || 
                      (pageNum === safeCurrentPage + 2 && pageNum < totalPages)
                    ) {
                      return <span key={pageNum} className="text-slate-400 px-1 text-xs">...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    className="p-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl border border-dashed border-emerald-300 dark:border-emerald-800 p-8 shadow-xs">
            <RotateCcw className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-spin-slow opacity-60" />
            <h4 className="text-lg font-bold text-[#0a271c] dark:text-white mb-2 font-serif-luxury">
              {isHindi ? 'कोई संपत्ति नहीं मिली' : 'No Properties Found'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              {showingFavoritesOnly
                ? (isHindi 
                    ? 'आपने अभी तक कोई संपत्ति सहेज कर नहीं रखी है। दिल आइकन पर क्लिक करके संपत्तियों को बाद के लिए सुरक्षित करें।' 
                    : 'You haven\'t saved any properties yet. Click the bookmark icon on any property to save it here.')
                : (isHindi 
                    ? 'आपके वर्तमान फ़िल्टर के अनुसार कोई संपत्ति उपलब्ध नहीं है। कृपया फ़िल्टर रीसेट करें या अलग स्थान चुनें।' 
                    : 'No properties match your current filter criteria. Try resetting filters or searching a different hill town.')}
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
            >
              {isHindi ? 'सभी फ़िल्टर साफ़ करें' : 'Clear All Filters'}
            </button>
          </div>
        )}
      </main>

      {/* SECTION 7: About Uttarakhand Gateways & Contact Details */}
      <AboutAndContact />

      {/* SECTION 8: Footer & Copyright Notice */}
      <Footer 
        onOpenPolicy={handleOpenLegalPolicy} 
        onAdminClick={() => setIsAdminAccountsOpen(true)}
      />
      </>
      )}

      {/* Persistent Bottom Mobile Navigation Bar */}
      <BottomNavigationBar
        activeCategory={filters.category}
        onCategorySelect={(cat) => {
          if (cat === 'Rent') {
            setShowRentFilter(true);
            setFilters((prev) => ({ ...prev, category: 'Rent/Lease' }));
          } else if (cat === 'All Types') {
            setShowRentFilter(false);
            setFilters((prev) => ({ ...prev, category: 'All Types' }));
          } else {
            setShowRentFilter(false);
            setFilters((prev) => ({ ...prev, category: cat as any }));
          }
          scrollToProperties();
        }}
        onListPropertyClick={() => {
          requireAuth(() => {
            setListChooserStep('type');
            setShowListChooser(true);
          }, isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' : 'Please sign in with your email via OTP to list a property.');
        }}
        onGuideClick={() => setIsGuideOpen(true)}
        onProfileClick={() => {
          if (currentUser) {
            setIsUserProfileModalOpen(true);
          } else {
            openAuthModal('login');
          }
        }}
      />

      {/* Modals */}

      {/* Land & Property Laws Guide Modal */}
      <LandGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenUnitConverter={() => {
          setIsGuideOpen(false);
          setIsUnitConverterOpen(true);
        }}
      />

      {/* User Profile & Account Management Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        onClose={() => setIsUserProfileModalOpen(false)}
        allProperties={properties}
        onSelectProperty={handleSelectProperty}
        onEditProperty={(prop) => setEditingProperty(prop)}
        onDeleteProperty={handleDeleteProperty}
        onDeleteAllProperties={() => setIsDeleteAllModalOpen(true)}
        onOpenSellModal={() => {
          requireAuth(() => {
            navigateToPage('sell-gui');
          }, isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' : 'Please sign in with your email via OTP to list a property.');
        }}
        onOpenRentalModal={() => {
          requireAuth(() => {
            navigateToPage('rent-gui');
          }, isHindi ? 'किराये की प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' : 'Please sign in with your email via OTP to list a property.');
        }}
        onOpenDashboard={() => navigateToPage('dashboard')}
      />

      <LandUnitConverterModal
        isOpen={isUnitConverterOpen}
        onClose={() => setIsUnitConverterOpen(false)}
      />

      {/* Chat Confirmation Dialog Before Sending Request */}
      <ChatConfirmationModal
        property={pendingChatProperty}
        isOpen={!!pendingChatProperty}
        onClose={() => setPendingChatProperty(null)}
        onConfirm={handleConfirmChatRequest}
      />

      {/* E-Commerce Sell / Upload Property Modal */}
      <UploadPropertyModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onPropertyUploaded={handlePropertyUploaded}
        lastUploadTime={lastUploadTime}
        onUpdateLastUploadTime={setLastUploadTime}
        onOpenLegalPolicy={handleOpenLegalPolicy}
      />

      {/* Dedicated List Your Rental Modal */}
      <ListRentalModal
        isOpen={isRentalModalOpen}
        onClose={() => setIsRentalModalOpen(false)}
        onRentalUploaded={(rentalProp) => {
          handlePropertyUploaded(rentalProp);
          setShowRentFilter(true);
          setFilters((prev) => ({ ...prev, category: 'Rent/Lease' }));
        }}
        onOpenLegalPolicy={handleOpenLegalPolicy}
      />

      {/* Edit Property Modal */}
      <EditPropertyModal
        isOpen={Boolean(editingProperty)}
        onClose={() => setEditingProperty(null)}
        property={editingProperty}
        onPropertyUpdated={handlePropertyUpdated}
      />

      {/* Direct Buyer-to-Owner Messaging & Phone Request Inbox Modal */}
      <InboxModal
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        chatThreads={chatThreads}
        onSendMessage={handleSendMessage}
        activeThreadId={activeThreadId}
        onSelectThread={(id) => setActiveThreadId(id)}
        allProperties={properties}
        onSelectProperty={(id) => {
          const prop = properties.find((p) => p.id === id);
          if (prop) {
            setSelectedProperty(prop);
            setIsInboxOpen(false);
          }
        }}
      />

      {/* Toast Notification when a user lists their property */}
      {uploadToast && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 max-w-md bg-slate-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <strong className="block font-bold text-emerald-300">Property Listed in Marketplace!</strong>
            <span>{uploadToast}</span>
          </div>
        </div>
      )}

      {/* Authentication & Registration Gate Modal */}
      <AuthModal />

      {/* First-visit Language Choice Modal (Hindi vs English floating buttons) */}
      <FirstVisitLanguageModal />

      {/* Comprehensive Legal & Compliance Center Modal (All 7 statutory policies) */}
      <LegalModal
        isOpen={legalModalState.isOpen}
        onClose={() => setLegalModalState((prev) => ({ ...prev, isOpen: false }))}
        initialTab={legalModalState.activeTab}
      />

      {/* Platform Owner Account Directory Modal */}
      <AdminAccountsModal
        isOpen={isAdminAccountsOpen}
        onClose={() => setIsAdminAccountsOpen(false)}
        onOpenReports={() => { setIsAdminAccountsOpen(false); setIsAdminReportsOpen(true); }}
        onDeleteAllProperties={() => setIsDeleteAllModalOpen(true)}
        totalPropertiesCount={properties.length}
      />

      <AdminReportsModal
        isOpen={isAdminReportsOpen}
        onClose={() => setIsAdminReportsOpen(false)}
        allProperties={properties}
        onSelectProperty={(property) => { setSelectedProperty(property); setIsAdminReportsOpen(false); }}
        onDeleteAllProperties={() => setIsDeleteAllModalOpen(true)}
      />

      {/* Platform Owner Delete All Properties Confirmation Modal */}
      <DeleteAllPropertiesModal
        isOpen={isDeleteAllModalOpen}
        onClose={() => setIsDeleteAllModalOpen(false)}
        onConfirmDeleteAll={handleDeleteAllProperties}
        totalProperties={properties.length}
      />

      <ReportListingModal
        isOpen={Boolean(reportingProperty)}
        property={reportingProperty}
        onClose={() => setReportingProperty(null)}
      />

      {/* Home Loan & EMI Calculator Modal */}
      <EmiCalculatorModal
        isOpen={isEmiCalculatorOpen}
        onClose={() => setIsEmiCalculatorOpen(false)}
        initialPrice={emiCalculatorInitialPrice}
      />

      {/* Common List Chooser Modal */}
      <ListChooserModal
        isOpen={showListChooser}
        onClose={() => setShowListChooser(false)}
        initialStep={listChooserStep}
        onSelectSale={(role) => {
          setSellListingRole(role);
          setShowListChooser(false);
          requireAuth(() => {
            navigateToPage('sell-gui');
          }, isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' : 'Please sign in with your email via OTP to list a property.');
        }}
        onSelectRent={() => {
          setShowListChooser(false);
          requireAuth(() => {
            navigateToPage('rent-gui');
          }, isHindi ? 'किराये की प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' : 'Please sign in with your email via OTP to list a property.');
        }}
      />

      {/* Celebratory Login Success Animation */}
      <LoginSuccessAnimation
        isOpen={showLoginAnimation}
        username={loginAnimationUser}
        onComplete={dismissLoginAnimation}
      />

      {/* Sleek AI Chatbot in Bottom Right Corner - strictly on home screen, hidden when on sell/rent GUI, listing modals, or detail views */}
      {activePage === 'home' && !selectedProperty && !urlPropId && !isUploadModalOpen && !isRentalModalOpen && !showListChooser && !editingProperty && (
        <AiChatbot
          onOpenSellModal={() => {
            requireAuth(() => {
              setListChooserStep('type');
              setShowListChooser(true);
            }, isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल से लॉगिन करें।' : 'Please sign in to list a property.');
          }}
          onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
          onExploreProperties={() => {
            navigateToPage('home');
            window.scrollTo({ top: 500, behavior: 'smooth' });
          }}
        />
      )}

      {/* Floating Switch Button to return to Mobile App View */}
      {viewMode === 'desktop' && (
        <aside aria-label="Mobile App Switcher" className="fixed bottom-22 left-6 z-50">
          <button
            type="button"
            onClick={() => setViewMode('app')}
            className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-2xl border-2 border-emerald-400 flex items-center gap-2 active:scale-95 transition-all cursor-pointer animate-bounce"
          >
            <span className="text-base">📱</span>
            <span>Switch to Mobile App</span>
          </button>
        </aside>
      )}

    </div>
  );
}