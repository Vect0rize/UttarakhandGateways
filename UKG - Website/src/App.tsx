import React, { Suspense, lazy, useState, useMemo, useEffect } from 'react';
import { Property, FilterState } from './types';
import { PROPERTIES, isSyntheticFakeProperty } from './data/properties';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchBar } from './components/SearchBar';
import { PropertyCard } from './components/PropertyCard';
import { resolveProgrammaticSeoRoute, getPropertySlugPath, getCitySlug, findPropertyBySlugOrId } from './data/programmaticSeo';
import { AdminAccountsModal } from './components/AdminAccountsModal';
import { AdminReportsModal } from './components/AdminReportsModal';
import { DeleteAllPropertiesModal } from './components/DeleteAllPropertiesModal';
import { ReportListingModal } from './components/ReportListingModal';
import { LandUnitConverterModal } from './components/LandUnitConverterModal';
import { UnifiedListingModal } from './components/UnifiedListingModal';
import { InboxModal } from './components/InboxModal';
import { ListPage } from './components/ListPage';
import { getPageSeoMeta, ROUTE_PATH_MAP, type AppPageRouteKey } from './data/seoMetadata';
import { AboutAndContact } from './components/AboutAndContact';
import { Footer } from './components/Footer';
import { PropertyCalculator } from './components/PropertyCalculator';
import { InboxPage } from './components/InboxPage';
import { AiChatbot } from './components/AiChatbot';
import { BackToTopButton } from './components/BackToTopButton';
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
  Building2,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Compass
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
const PropertyDetailPage = lazy(() =>
  import('./components/PropertyDetailPage').then((m) => ({ default: m.PropertyDetailPage }))
);
const BuyPage = lazy(() =>
  import('./components/BuyPage').then((m) => ({ default: m.BuyPage }))
);
const RentPage = lazy(() =>
  import('./components/RentPage').then((m) => ({ default: m.RentPage }))
);
const SellGuiPage = lazy(() =>
  import('./components/SellGuiPage').then((m) => ({ default: m.SellGuiPage }))
);
const RentGuiPage = lazy(() =>
  import('./components/RentGuiPage').then((m) => ({ default: m.RentGuiPage }))
);
const ListerDashboard = lazy(() =>
  import('./components/ListerDashboard').then((m) => ({ default: m.ListerDashboard }))
);
const CityPropertyLandingPage = lazy(() =>
  import('./components/CityPropertyLandingPage').then((m) => ({ default: m.CityPropertyLandingPage }))
);
const GuidesHubPage = lazy(() =>
  import('./components/GuidesHubPage').then((m) => ({ default: m.GuidesHubPage }))
);
const HomeLoanPage = lazy(() =>
  import('./components/HomeLoanPage').then((m) => ({ default: m.HomeLoanPage }))
);
const TrustPolicyPage = lazy(() =>
  import('./components/TrustPolicyPage').then((m) => ({ default: m.TrustPolicyPage }))
);
const ProgrammaticLandingPage = lazy(() =>
  import('./components/ProgrammaticLandingPage').then((m) => ({ default: m.ProgrammaticLandingPage }))
);
const AdminDashboardPage = lazy(() =>
  import('./components/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
import { LoginPage } from './components/LoginPage';
import { EmiCalculatorModal } from './components/EmiCalculatorModal';
import { ListChooserModal } from './components/ListChooserModal';
import { HomeSeoGuideSection } from './components/HomeSeoGuideSection';
import { LoginSuccessAnimation } from './components/LoginSuccessAnimation';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeLoanBanner } from './components/HomeLoanBanner';
import { TrendingCarousel } from './components/TrendingCarousel';
import {
  scrollToPropertyListingsStart,
  readPageParamFromUrl,
  syncListingsUrlParams,
} from './utils/scrollToListings';

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

export type ActivePageView = AppPageRouteKey;

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

  // Selected City Landing Hub state (e.g. Dehradun, Rishikesh, Haridwar)
  const [activeCityHub, setActiveCityHub] = useState<string>(() => {
    try {
      const path = (window.location.pathname || '').toLowerCase();
      if (path.startsWith('/properties-in-')) {
        const raw = path.replace('/properties-in-', '');
        return raw.charAt(0).toUpperCase() + raw.slice(1);
      }
      const p = new URLSearchParams(window.location.search).get('city');
      if (p) return p.charAt(0).toUpperCase() + p.slice(1);
    } catch {}
    return 'Dehradun';
  });

  // Selected Legal Guide state
  const [activeGuideSlug, setActiveGuideSlug] = useState<string | undefined>(() => {
    try {
      const path = (window.location.pathname || '').toLowerCase();
      if (path.startsWith('/guides/')) {
        return path.replace('/guides/', '');
      }
    } catch {}
    return undefined;
  });

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

  const KNOWN_CITY_SLUGS = [
    'dehradun', 'rishikesh', 'haridwar', 'nainital', 'mussoorie', 'haldwani',
    'mukteshwar', 'bhimtal', 'almora', 'ranikhet', 'lansdowne', 'dhanaulti',
    'kanatal', 'kausani', 'chakrata', 'devprayag', 'rudraprayag', 'uttarkashi',
    'kotdwar', 'bhowali', 'tehri-garhwal', 'auli',
  ];

  const resolveRouteFromUrl = (rawPathname: string, rawSearch: string): {
    page: ActivePageView;
    cleanPath: string;
    cityName?: string;
    guideSlug?: string;
  } => {
    const params = new URLSearchParams(rawSearch);
    const rawPageParam = (params.get('page') || '').trim().toLowerCase();
    const p = /^\d+$/.test(rawPageParam) ? '' : rawPageParam;
    const rawPath = (rawPathname || '/').toLowerCase().replace(/\/+$/, '');
    const path = rawPath === '' ? '/' : rawPath;

    if (path === '/' && !p) return { page: 'home', cleanPath: '/' };
    if (p === 'list' || path === '/list') return { page: 'list', cleanPath: '/list' };
    if (p === 'buy' || path === '/buy' || path === '/lbuy' || path === '/buy-property') return { page: 'buy', cleanPath: '/buy' };
    if (p === 'rent' || path === '/rent' || p === 'rent-property' || path === '/rent-property') return { page: 'rent', cleanPath: '/rent' };
    if (p === 'about' || path === '/about') return { page: 'about', cleanPath: '/about' };
    if (p === 'contact' || path === '/contact') return { page: 'contact', cleanPath: '/contact' };
    if (p === 'privacy' || path === '/privacy') return { page: 'privacy', cleanPath: '/privacy' };
    if (p === 'terms' || path === '/terms') return { page: 'terms', cleanPath: '/terms' };
    if (p === 'disclaimer' || path === '/disclaimer') return { page: 'disclaimer', cleanPath: '/disclaimer' };
    if (p === 'listing-guidelines' || path === '/listing-guidelines') return { page: 'listing-guidelines', cleanPath: '/listing-guidelines' };

    if (path.startsWith('/properties-in-') && path !== '/properties-in-uttarakhand') {
      const slug = path.replace('/properties-in-', '');
      if (KNOWN_CITY_SLUGS.includes(slug)) {
        const display = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return { page: 'city', cleanPath: path, cityName: display };
      }
    }
    if (p === 'city') {
      const c = params.get('city') || 'dehradun';
      return { page: 'city', cleanPath: `/properties-in-${getCitySlug(c)}`, cityName: c };
    }
    if (resolveProgrammaticSeoRoute(path, [])) {
      return { page: 'programmatic', cleanPath: path };
    }
    if (path.startsWith('/guides') || path.startsWith('/guide') || p === 'guides') {
      const gSlug = path.startsWith('/guides/') ? path.replace('/guides/', '') : undefined;
      return { page: 'guides', cleanPath: path, guideSlug: gSlug };
    }
    if (p === 'login' || path === '/login' || path === '/reset-password' || params.get('token') || params.get('resetToken') || p === 'forgot-password') return { page: 'login', cleanPath: path };
    if (p === 'register' || path === '/register') return { page: 'register', cleanPath: '/register' };
    if (p === 'sell-gui' || p === 'sell' || path === '/list/buy' || path === '/list/sell' || path === '/sell' || p === 'sell-property' || path === '/sell-property') return { page: 'sell-gui', cleanPath: '/list/buy' };
    if (p === 'rent-gui' || p === 'rent-list' || path === '/list/rent' || path === '/rent-gui' || path === '/rent-list') return { page: 'rent-gui', cleanPath: '/list/rent' };
    if (p === 'inbox' || path === '/inbox') return { page: 'inbox', cleanPath: '/inbox' };
    if (p === 'dashboard' || path === '/dashboard' || path === '/lister-dashboard') return { page: 'dashboard', cleanPath: '/dashboard' };
    if (p === 'admin' || path === '/admin' || path === '/admin-dashboard') return { page: 'admin', cleanPath: '/admin' };
    if (p === 'home-loan' || p === 'emi-calculator' || path === '/home-loan' || path === '/emi-calculator' || path === '/homeloan') return { page: 'home-loan', cleanPath: '/home-loan' };
    if (path.startsWith('/property/') || params.get('property')) return { page: 'home', cleanPath: path };

    return { page: 'not-found', cleanPath: path };
  };

  const [activePath, setActivePath] = useState<string>(() => {
    try {
      return resolveRouteFromUrl(window.location.pathname, window.location.search).cleanPath;
    } catch {
      return '/';
    }
  });

  const getInitialActivePage = (): ActivePageView => {
    try {
      return resolveRouteFromUrl(window.location.pathname, window.location.search).page;
    } catch {}
    return 'home';
  };

  const [activePage, setActivePage] = useState<ActivePageView>(getInitialActivePage);
  const [showListChooser, setShowListChooser] = useState(false);
  const [listChooserStep, setListChooserStep] = useState<'type' | 'sale-role' | 'rent-role'>('type');
  const [sellListingRole, setSellListingRole] = useState<'Owner' | 'Broker'>('Owner');
  const [rentListingRole, setRentListingRole] = useState<'Owner' | 'Broker'>('Owner');

  // Support history navigation between marketplace, buy page, rent page, sell gui, rent gui, login, register, and inbox
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const propId = params.get('property');
      const path = (window.location.pathname || '').toLowerCase().replace(/\/+$/, '') || '/';

      if (propId || path.startsWith('/property/')) {
        return; // Handled by handlePopStateProperty
      }

      const resolved = resolveRouteFromUrl(window.location.pathname, window.location.search);
      setActivePath(resolved.cleanPath);
      if (resolved.cityName) setActiveCityHub(resolved.cityName);
      setActiveGuideSlug(resolved.guideSlug);
      setActivePage(resolved.page);
      setSelectedProperty(null);
      setPropertyNotFound(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPath = (nextPath: string) => {
    const cleanTarget = nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
    const [pathnameOnly, searchOnly] = cleanTarget.split('?');
    const searchStr = searchOnly ? `?${searchOnly}` : '';
    const resolved = resolveRouteFromUrl(pathnameOnly, searchStr);
    setActivePath(resolved.cleanPath);
    if (resolved.cityName) setActiveCityHub(resolved.cityName);
    setActiveGuideSlug(resolved.guideSlug);
    setActivePage(resolved.page);
    setSelectedProperty(null);
    setPropertyNotFound(false);
    try {
      window.history.pushState({ page: resolved.page, path: cleanTarget }, '', cleanTarget);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPage = (target: ActivePageView, queryOrHash?: string) => {
    setActivePage(target);
    setSelectedProperty(null);
    setPropertyNotFound(false);
    try {
      const basePath = target === 'city'
        ? `/properties-in-${getCitySlug(activeCityHub)}`
        : target === 'guides'
          ? (activeGuideSlug ? `/guides/${activeGuideSlug}` : '/guides')
          : target === 'programmatic' || target === 'not-found'
            ? activePath
            : (ROUTE_PATH_MAP[target] || '/');
      setActivePath(basePath);
      const nextUrl = queryOrHash ? `${basePath}${queryOrHash}` : basePath;
      window.history.pushState({ page: target }, '', nextUrl);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCity = (cityName: string) => {
    const slug = getCitySlug(cityName);
    if (!KNOWN_CITY_SLUGS.includes(slug)) {
      navigateToPath(`/properties-in-${slug}`);
      return;
    }
    setActiveCityHub(cityName);
    setActivePage('city');
    setActivePath(`/properties-in-${slug}`);
    setSelectedProperty(null);
    setPropertyNotFound(false);
    try {
      window.history.pushState({ page: 'city', city: cityName }, '', `/properties-in-${slug}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navigateToGuides = (guideSlug?: string) => {
    setActiveGuideSlug(guideSlug);
    setActivePage('guides');
    const nextPath = guideSlug ? `/guides/${guideSlug}` : '/guides';
    setActivePath(nextPath);
    setSelectedProperty(null);
    setPropertyNotFound(false);
    try {
      window.history.pushState({ page: 'guides' }, '', nextPath);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const [filters, setFilters] = useState<FilterState>(() => {
    try {
      const path = (window.location.pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';
      if (path !== '/') return INITIAL_FILTERS;
      const sp = new URLSearchParams(window.location.search);
      const sortParam = sp.get('sort');
      const allowedSorts: FilterState['sortBy'][] = ['featured', 'price-low', 'price-high', 'area-large', 'area-small'];
      return {
        ...INITIAL_FILTERS,
        searchQuery: sp.get('q') || sp.get('search') || '',
        city: sp.get('city') || 'All Locations',
        category: sp.get('category') || 'All Types',
        budgetRange: sp.get('budget') || 'all',
        bhkConfig: sp.get('bhk') || 'all',
        sortBy: allowedSorts.includes(sortParam as FilterState['sortBy'])
          ? (sortParam as FilterState['sortBy'])
          : INITIAL_FILTERS.sortBy,
      };
    } catch {
      return INITIAL_FILTERS;
    }
  });
  const [showRentFilter, setShowRentFilter] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const path = (window.location.pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';
      return path === '/' ? readPageParamFromUrl() : 1;
    } catch {
      return 1;
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_favorites');
      const parsed: string[] = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.filter((id) => !isSyntheticFakeProperty({ id })) : [];
    } catch {
      return [];
    }
  });
  const [showingFavoritesOnly, setShowingFavoritesOnly] = useState(false);

  // The server is the source of truth for uploaded properties.
  // Never hardcode listings into client bundle; fetch dynamically from backend.
  const [properties, setProperties] = useState<Property[]>([]);
  const [platformConfig, setPlatformConfig] = useState<{
    showFeaturedSection: boolean;
    featuredMode: 'manual_and_top' | 'manual_only';
    enabledCategories: string[];
  }>({
    showFeaturedSection: true,
    featuredMode: 'manual_and_top',
    enabledCategories: ['Residential', 'Commercial', 'Agriculture'],
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

  // Synchronize browser tab title, meta keywords, description & canonical across every route
  useEffect(() => {
    const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const selfManagedSeoPages: ActivePageView[] = [
      'programmatic',
      'city',
      'guides',
      'about',
      'contact',
      'privacy',
      'terms',
      'listing-guidelines',
      'not-found',
    ];
    if (!selectedProperty && selfManagedSeoPages.includes(activePage)) {
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'page_view', {
          page_path: window.location.pathname,
          page_title: document.title,
        });
      }
      return;
    }

    const noIndexPages: ActivePageView[] = ['login', 'register', 'inbox', 'dashboard', 'admin'];
    const robotsDirective = (!selectedProperty && noIndexPages.includes(activePage))
      ? 'noindex, nofollow'
      : 'index, follow';
    upsertMeta('name', 'robots', robotsDirective);

    const seo = selectedProperty
      ? {
          title: `${selectedProperty.title} | ${selectedProperty.city} Uttarakhand Property - Uttarakhand Gateways`,
          description: `${selectedProperty.title} in ${selectedProperty.location}, ${selectedProperty.city}, Uttarakhand. ${selectedProperty.type || 'Property'} for ${(selectedProperty.type === 'Rent/Lease' || selectedProperty.purpose === 'rent') ? 'rent' : 'sale'} on Uttarakhand Gateways.`,
          keywords: `${selectedProperty.title}, properties in ${selectedProperty.city}, ${selectedProperty.city} real estate, properties in uttarakhand, real estate uttarakhand`,
          canonicalPath: getPropertySlugPath(selectedProperty),
        }
      : getPageSeoMeta(activePage, { cityName: activeCityHub, guideSlug: activeGuideSlug });

    document.title = seo.title;
    upsertMeta('name', 'description', seo.description);
    upsertMeta('name', 'keywords', seo.keywords);
    upsertMeta('property', 'og:title', seo.title);
    upsertMeta('property', 'og:description', seo.description);
    upsertMeta('property', 'og:url', `https://uttarakhandgateways.com${seo.canonicalPath}`);
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `https://uttarakhandgateways.com${seo.canonicalPath}`);
    }
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'page_view', {
        page_path: window.location.pathname,
        page_title: seo.title,
      });
    }
  }, [activePage, activeCityHub, activeGuideSlug, selectedProperty, activePath]);

  useEffect(() => {
    let active = true;

    // Purge any stale fake properties cached in localStorage on startup
    try {
      const cachedRaw = localStorage.getItem('uk_gateways_uploaded_properties');
      if (cachedRaw) {
        const cachedList = JSON.parse(cachedRaw);
        if (Array.isArray(cachedList)) {
          const cleanCached = cachedList.filter((p) => !isSyntheticFakeProperty(p));
          if (cleanCached.length !== cachedList.length) {
            localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(cleanCached));
          }
        }
      }
    } catch {}

    const applyPropertyViewCount = (propertyId: string, views: number) => {
      if (!propertyId || typeof views !== 'number') return;
      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, views } : p))
      );
      setSelectedProperty((prev) =>
        prev && prev.id === propertyId ? { ...prev, views } : prev
      );
    };

    const refreshFromServer = async () => {
      try {
        const headers: Record<string, string> = {};
        try {
          const token = localStorage.getItem('ukg_session_token');
          if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch {}

        const [res, cfgRes] = await Promise.all([
          fetch('/api/properties', { cache: 'no-store', credentials: 'include', headers }),
          fetch('/api/platform-config', { cache: 'no-store' }).catch(() => null),
        ]);

        if (cfgRes && cfgRes.ok) {
          const cfgData = await cfgRes.json().catch(() => null);
          if (active && cfgData?.settings) {
            setPlatformConfig((prev) => ({ ...prev, ...cfgData.settings }));
          }
        }

        if (!res.ok) return;
        const data = await res.json();
        const rawProps: Property[] = Array.isArray(data)
          ? data
          : (Array.isArray(data.properties) ? data.properties : []);
        const serverProps = rawProps.filter((p) => !isSyntheticFakeProperty(p));
        if (active) {
          setProperties((prev) => {
            if (prev.length === serverProps.length && JSON.stringify(prev) === JSON.stringify(serverProps)) {
              return prev;
            }
            return serverProps;
          });
        }
        try {
          localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(serverProps));
        } catch {}
      } catch (err) {
        console.warn('Failed to refresh properties from server:', err);
      }
    };

    const handlePropsUpdate = () => { void refreshFromServer(); };
    const handleViewEvent = (e: any) => {
      if (e?.detail?.propertyId && typeof e.detail.views === 'number') {
        applyPropertyViewCount(e.detail.propertyId, e.detail.views);
      }
    };
    window.addEventListener('uk_gateways_properties_updated', handlePropsUpdate);
    window.addEventListener('uk_gateways_property_viewed', handleViewEvent);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('uk_gateways_properties_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'PROPERTIES_UPDATED') void refreshFromServer();
        if (event.data?.type === 'PROPERTY_VIEW_UPDATED' && event.data.propertyId) {
          applyPropertyViewCount(event.data.propertyId, Number(event.data.views) || 0);
        }
      };
    } catch {}

    void refreshFromServer();
    const interval = setInterval(refreshFromServer, 30000);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('uk_gateways_properties_updated', handlePropsUpdate);
      window.removeEventListener('uk_gateways_property_viewed', handleViewEvent);
      if (bc) bc.close();
    };
  }, [currentUser?.id]);

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
        const headers: Record<string, string> = {};
        try {
          const token = localStorage.getItem('ukg_session_token');
          if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch {}
        const res = await fetch(`/api/properties/${encodeURIComponent(propId)}`, {
          cache: 'no-store',
          credentials: 'include',
          headers,
        });
        if (!res.ok) {
          if (isMounted) {
            setSelectedProperty(null);
            setPropertyNotFound(true);
          }
          return;
        }

        const data = await res.json();
        const isMatched = data?.property && (
          data.property.id === propId ||
          propId.endsWith('-' + data.property.id) ||
          decodeURIComponent(propId).endsWith('-' + data.property.id) ||
          Boolean(findPropertyBySlugOrId(propId, [data.property]))
        );
        if (isMounted && isMatched) {
          setSelectedProperty(data.property);
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
      let propId = params.get('property');
      if (!propId && window.location.pathname.startsWith('/property/')) {
        propId = decodeURIComponent(window.location.pathname.replace('/property/', ''));
      }

      if (!propId) {
        setSelectedProperty(null);
        setPropertyNotFound(false);
        return;
      }

      try {
        const headers: Record<string, string> = {};
        try {
          const token = localStorage.getItem('ukg_session_token');
          if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch {}
        const res = await fetch(`/api/properties/${encodeURIComponent(propId)}`, {
          cache: 'no-store',
          credentials: 'include',
          headers,
        });
        if (!res.ok) {
          if (active) {
            setSelectedProperty(null);
            setPropertyNotFound(true);
          }
          return;
        }
        const data = await res.json();
        const isMatched = data?.property && (
          data.property.id === propId ||
          propId.endsWith('-' + data.property.id) ||
          decodeURIComponent(propId).endsWith('-' + data.property.id) ||
          Boolean(findPropertyBySlugOrId(propId, [data.property]))
        );
        if (active && isMatched) {
          setSelectedProperty(data.property);
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

  // Persist saved bookmarks locally for guests AND merge/retain guest bookmarks when signing in
  const prevAuthUserIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    const userId = currentUser?.id || null;
    if (userId && prevAuthUserIdRef.current !== userId) {
      prevAuthUserIdRef.current = userId;
      let guestSaved: string[] = [];
      let localUserSaved: string[] = [];
      try {
        const gRaw = localStorage.getItem('uk_gateways_favorites');
        if (gRaw) guestSaved = JSON.parse(gRaw);
      } catch {}
      try {
        const uRaw = localStorage.getItem(`uk_gateways_favorites_${userId}`);
        if (uRaw) localUserSaved = JSON.parse(uRaw);
      } catch {}

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      try {
        const token = localStorage.getItem('ukg_session_token');
        if (token) headers['Authorization'] = `Bearer ${token}`;
      } catch {}

      fetch('/api/favorites', { credentials: 'include', headers })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const serverSaved: string[] = Array.isArray(data?.favorites) ? data.favorites : [];
          const merged = Array.from(
            new Set(
              [...serverSaved, ...localUserSaved, ...guestSaved, ...favorites].filter(
                (id) => typeof id === 'string' && id.trim().length > 0 && !isSyntheticFakeProperty({ id })
              )
            )
          );
          setFavorites(merged);
          try {
            localStorage.setItem(`uk_gateways_favorites_${userId}`, JSON.stringify(merged));
            localStorage.setItem('uk_gateways_favorites', JSON.stringify(merged));
          } catch {}
          fetch('/api/favorites', {
            method: 'PUT',
            credentials: 'include',
            headers,
            body: JSON.stringify({ favorites: merged }),
          }).catch(() => {});
        })
        .catch(() => {});
    } else if (!userId && prevAuthUserIdRef.current !== null) {
      prevAuthUserIdRef.current = null;
      try {
        const gRaw = localStorage.getItem('uk_gateways_favorites');
        const parsed = gRaw ? JSON.parse(gRaw) : [];
        if (Array.isArray(parsed)) {
          setFavorites(parsed.filter((id) => typeof id === 'string' && !isSyntheticFakeProperty({ id })));
        }
      } catch {}
    }
  }, [currentUser?.id]);

  useEffect(() => {
    try {
      localStorage.setItem('uk_gateways_favorites', JSON.stringify(favorites));
      if (currentUser?.id) {
        localStorage.setItem(`uk_gateways_favorites_${currentUser.id}`, JSON.stringify(favorites));
      }
    } catch {}
  }, [favorites, currentUser?.id]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (currentUser?.id) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        try {
          const token = localStorage.getItem('ukg_session_token');
          if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch {}
        fetch('/api/favorites', {
          method: 'PUT',
          credentials: 'include',
          headers,
          body: JSON.stringify({ favorites: next }),
        }).catch(() => {});
      }
      return next;
    });
  };

  const handleSelectProperty = (property: Property) => {
    // Open canonical slugged property webpage in a new tab
    const fullUrl = `${window.location.origin}${getPropertySlugPath(property)}`;
    window.open(fullUrl, '_blank');
  };

  const handleBackToMarketplace = () => {
    setSelectedProperty(null);
    setPropertyNotFound(false);
    try {
      localStorage.removeItem('uk_gateways_selected_property');
      sessionStorage.removeItem('uk_gateways_selected_property');
      const routeMap: Record<string, string> = ROUTE_PATH_MAP;
      const targetPath = activePage === 'city'
        ? `/properties-in-${getCitySlug(activeCityHub)}`
        : activePage === 'guides'
          ? (activeGuideSlug ? `/guides/${activeGuideSlug}` : '/guides')
          : activePage === 'programmatic' || activePage === 'not-found'
            ? activePath
            : (routeMap[activePage] || '/');
      window.history.pushState({ page: activePage }, '', targetPath);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleOpenUnitConverter = () => {
    setIsUnitConverterOpen(true);
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
    }, isHindi ? 'किराये हेतु संपत्ति लिस्ट करने के लिए कृपया पहले लॉगिन या रजिस्टर करें।' : 'Please sign in or register to list your rental property.');
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
      } catch {}
      return updated;
    });

    if ((newProperty as any).__persistedOnServer) {
      broadcastPropertiesUpdated([]);
      setUploadToast(isHindi ? `"${newProperty.title}" अब लाइव है!` : `"${newProperty.title}" is now live in the marketplace!`);
      setTimeout(() => setUploadToast(null), 6000);
      return;
    }

    // Save to shared server database so other users (and logged-out visitors) see it
    try {
      const token = (() => { try { return localStorage.getItem('ukg_session_token'); } catch { return null; } })();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/properties', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(newProperty),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data?.property) {
        setProperties((prev) => [data.property, ...prev.filter((p) => p.id !== data.property.id)]);
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
      let token = localStorage.getItem('ukg_session_token');

      // Auto-sync session before save if token is missing but user is logged in
      if (!token && currentUser) {
        try {
          const syncRes = await fetch('/api/auth/sync-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ user: currentUser }),
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData?.token || syncData?.sessionId) {
              token = syncData.token || syncData.sessionId;
              try { localStorage.setItem('ukg_session_token', token as string); } catch {}
            }
          }
        } catch {}
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.contact) headers['X-User-Contact'] = currentUser.contact;
      if (currentUser?.id) headers['X-User-Id'] = currentUser.id;

      let res = await fetch(`/api/properties/${encodeURIComponent(updatedProperty.id)}`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(updatedProperty),
      });

      // If server session expired (401), auto-renew session and retry once
      if (res.status === 401 && currentUser) {
        try {
          const syncRes = await fetch('/api/auth/sync-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ user: currentUser }),
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData?.token || syncData?.sessionId) {
              token = syncData.token || syncData.sessionId;
              try { localStorage.setItem('ukg_session_token', token as string); } catch {}
              headers['Authorization'] = `Bearer ${token}`;
              res = await fetch(`/api/properties/${encodeURIComponent(updatedProperty.id)}`, {
                method: 'PUT',
                credentials: 'include',
                headers,
                body: JSON.stringify(updatedProperty),
              });
            }
          }
        } catch {}
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }

      const resData = await res.json().catch(() => ({}));
      const savedProperty = resData?.property || finalProperty;

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
      console.error('Failed to update property on server:', err);
      // Revert to previous list on failure
      setProperties(prevList);
      setUploadToast(
        isHindi
          ? `प्रॉपर्टी अपडेट विफल: ${err.message || 'सर्वर एरर'}`
          : `Failed to update property on server: ${err.message || 'Server error'}`
      );
      throw err;
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
      let token = localStorage.getItem('ukg_session_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.contact) headers['X-User-Contact'] = currentUser.contact;
      if (currentUser?.id) headers['X-User-Id'] = currentUser.id;

      let res = await fetch(`/api/properties/${encodeURIComponent(propertyId)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      if (res.status === 401 && currentUser) {
        try {
          const syncRes = await fetch('/api/auth/sync-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ user: currentUser }),
          });
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData?.token || syncData?.sessionId) {
              token = syncData.token || syncData.sessionId;
              try { localStorage.setItem('ukg_session_token', token as string); } catch {}
              headers['Authorization'] = `Bearer ${token}`;
              res = await fetch(`/api/properties/${encodeURIComponent(propertyId)}`, {
                method: 'DELETE',
                credentials: 'include',
                headers,
              });
            }
          }
        } catch {}
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${res.status}`);
      }

      broadcastPropertiesUpdated([]);
      setUploadToast(isHindi ? 'आपकी प्रॉपर्टी लिस्टिंग सफलतापूर्वक हटा दी गई।' : 'Your property listing has been successfully deleted.');
    } catch (err: any) {
      console.error('Failed to delete property from server:', err);
      // Revert if delete failed
      setProperties(prevList);
      setUploadToast(
        isHindi
          ? `प्रॉपर्टी हटाने में विफल: ${err.message || 'सर्वर एरर'}`
          : `Failed to delete property from server: ${err.message || 'Server error'}`
      );
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
      const token = (() => { try { return localStorage.getItem('ukg_session_token'); } catch { return null; } })();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/properties/clear-all', {
        method: 'POST',
        credentials: 'include',
        headers,
      });
      if (!res.ok) {
        await fetch('/api/properties', {
          method: 'DELETE',
          credentials: 'include',
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
    let targetProp: Property | undefined;
    setProperties((prev) => {
      const updated = prev.map((p) => {
        if (p.id === propertyId) {
          const next = { ...p, isSold: !p.isSold };
          targetProp = next;
          return next;
        }
        return p;
      });
      try {
        localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Update selectedProperty if open
    if (selectedProperty?.id === propertyId && targetProp) {
      setSelectedProperty(targetProp);
    }

    if (targetProp) {
      try {
        const token = localStorage.getItem('ukg_session_token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (currentUser?.contact) headers['X-User-Contact'] = currentUser.contact;
        if (currentUser?.id) headers['X-User-Id'] = currentUser.id;

        const res = await fetch(`/api/properties/${encodeURIComponent(propertyId)}`, {
          method: 'PUT',
          credentials: 'include',
          headers,
          body: JSON.stringify(targetProp),
        });
        if (!res.ok) {
          throw new Error('Failed to update property status on server');
        }
      } catch (err) {
        console.error('[UKG ToggleSold] Revert due to error:', err);
        const revertedIsSold = !targetProp.isSold;
        setProperties((prev) =>
          prev.map((p) => (p.id === propertyId ? { ...p, isSold: revertedIsSold } : p))
        );
        if (selectedProperty?.id === propertyId) {
          setSelectedProperty((prev) => (prev ? { ...prev, isSold: revertedIsSold } : prev));
        }
      }
      broadcastPropertiesUpdated([]);
    }
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
    } else {
      const newThread: ChatThread = {
        id: `thread-${property.id}-${Date.now()}`,
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
    }

    setPendingChatProperty(null);
    const ownerName = getPropertyOwnerDisplayName(property, currentUser) || 'owner';
    setUploadToast(`Chat request sent to ${ownerName}! Opening conversation...`);
    setTimeout(() => setUploadToast(null), 3500);

    // Open standalone inbox webpage in new tab or open modal
    try {
      window.open(`/inbox?propertyId=${encodeURIComponent(property.id)}`, '_blank');
    } catch {
      setIsInboxOpen(true);
    }
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

    // Simulate owner reply after 1.2s
    setTimeout(() => {
      const ownerReply = {
        id: `msg-${Date.now() + 1}`,
        sender: 'seller' as const,
        senderName: 'Property Owner',
        text: `Namaste! Thanks for reaching out. Yes, clear title and immediate mutation are available. Feel free to call or WhatsApp me directly using the contact number on the listing.`,
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

  // Curated Featured Properties for the Highlights Carousel
  const featuredProperties = useMemo(() => {
    if (!platformConfig.showFeaturedSection) return [];
    const explicitlyFeatured = properties.filter((p) => Boolean(p.featured));
    if (platformConfig.featuredMode === 'manual_only') {
      return explicitlyFeatured;
    }
    const featuredIds = new Set(explicitlyFeatured.map((p) => p.id));
    const others = properties.filter((p) => !featuredIds.has(p.id) && !p.isSold);
    return [...explicitlyFeatured, ...others].slice(0, Math.max(8, explicitlyFeatured.length));
  }, [properties, platformConfig.showFeaturedSection, platformConfig.featuredMode]);

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

      // Himalayan View toggle
      if (filters.himalayanViewOnly && !property.himalayanPeakView) {
        return false;
      }

      // RERA / Clear title toggle
      if (filters.reraApprovedOnly && !property.reraStatus?.includes('RERA')) {
        return false;
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
        const matchesRoad = property.roadAccess ? property.roadAccess.toLowerCase().includes(query) : false;
        const matchesBhooKanoon = property.bhooKanoonStatus ? property.bhooKanoonStatus.toLowerCase().includes(query) : false;
        const matchesWater = property.waterSource ? property.waterSource.toLowerCase().includes(query) : false;

        if (!matchesTitle && !matchesLocation && !matchesCity && !matchesDesc && !matchesType && !matchesAmenities && !matchesRoad && !matchesBhooKanoon && !matchesWater) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'featured') {
        const featDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        if (featDiff !== 0) return featDiff;
      }
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
    scrollToPropertyListingsStart('all-properties-heading');
  };

  const scrollToContact = () => {
    const el = document.getElementById('contact-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activePage !== 'home' || selectedProperty) return;
    const hasPropParam = (() => {
      try {
        return Boolean(
          new URLSearchParams(window.location.search).get('property') ||
            window.location.pathname.startsWith('/property/')
        );
      } catch {
        return false;
      }
    })();
    if (hasPropParam) return;

    const effectivePage = properties.length === 0 ? currentPage : safeCurrentPage;

    syncListingsUrlParams({
      q: filters.searchQuery.trim() || null,
      city: filters.city !== 'All Locations' ? filters.city : null,
      category: filters.category !== 'All Types' ? filters.category : null,
      budget: filters.budgetRange && filters.budgetRange !== 'all' ? filters.budgetRange : null,
      bhk: filters.bhkConfig && filters.bhkConfig !== 'all' ? filters.bhkConfig : null,
      sort: filters.sortBy !== INITIAL_FILTERS.sortBy ? filters.sortBy : null,
      page: effectivePage > 1 ? effectivePage : null,
    });
  }, [activePage, selectedProperty, filters, currentPage, safeCurrentPage, properties.length]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      syncListingsUrlParams({ page: newPage > 1 ? newPage : null });
      scrollToPropertyListingsStart('all-properties-heading');
    }
  };

  const isDark = theme === 'dark';

  const urlPropId = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('property') ||
      (window.location.pathname.startsWith('/property/')
        ? window.location.pathname.replace('/property/', '')
        : null))
    : null;

  const lazyFallback = (
    <div className="min-h-screen flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
      Loading...
    </div>
  );

  // Standalone Web Pages (Inbox, Login, Buy, Rent, Sell GUI, Rent GUI)
  
  if (activePage === 'home-loan') {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Home Loan Eligibility & EMI Calculator" onReset={() => navigateToPage('home')}>
        <Suspense fallback={lazyFallback}>
          <HomeLoanPage
            onBackToMain={() => navigateToPage('home')}
            onNavigatePage={(page) => navigateToPage(page as ActivePageView)}
            onNavigateCity={navigateToCity}
            isDark={isDark}
            onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (activePage === 'inbox') {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Inbox" onReset={() => navigateToPage('home')}>
        <InboxPage
          onBackToMarketplace={() => navigateToPage('home')}
          onNavigatePage={(page) => navigateToPage(page as ActivePageView)}
          onNavigateCity={navigateToCity}
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
          onNavigatePage={(page) => navigateToPage(page as ActivePageView)}
          onNavigateCity={navigateToCity}
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
          onNavigatePage={(page) => navigateToPage(page as ActivePageView)}
          onNavigateCity={navigateToCity}
        />
      </ErrorBoundary>
    );
  }

  if (activePage === 'sell-gui') {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Property Listing GUI" onReset={() => navigateToPage('home')}>
        <Suspense fallback={lazyFallback}>
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
            onNavigatePage={(page) => navigateToPage(page as ActivePageView)}
            onNavigateCity={navigateToCity}
          />
        </Suspense>
        <AuthModal />
      </ErrorBoundary>
    );
  }

  if (activePage === 'rent-gui') {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Rental Listing GUI" onReset={() => navigateToPage('home')}>
        <Suspense fallback={lazyFallback}>
          <RentGuiPage
            onBackToMain={() => navigateToPage('home')}
            onRentalUploaded={(p) => {
              handlePropertyUploaded(p);
              navigateToPage('rent');
            }}
            initialRole={rentListingRole}
            onOpenLegalPolicy={handleOpenLegalPolicy}
            onNavigatePage={(page) => navigateToPage(page as ActivePageView)}
            onNavigateCity={navigateToCity}
          />
        </Suspense>
        <AuthModal />
      </ErrorBoundary>
    );
  }

  if (activePage === 'admin' && !selectedProperty) {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Admin Dashboard" onReset={() => navigateToPage('home')}>
        <Suspense fallback={lazyFallback}>
          <AdminDashboardPage
            onBackToMain={() => navigateToPage('home')}
            onOpenAddProperty={() => navigateToPage('list')}
            onOpenFullEditModal={(prop) => setEditingProperty(prop)}
          />
        </Suspense>
        <EditPropertyModal
          isOpen={Boolean(editingProperty)}
          onClose={() => setEditingProperty(null)}
          property={editingProperty}
          onPropertyUpdated={handlePropertyUpdated}
        />
        <AuthModal />
      </ErrorBoundary>
    );
  }

  if (activePage === 'dashboard' && !selectedProperty) {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Listing Analysis" onReset={() => navigateToPage('home')}>
        <Suspense fallback={lazyFallback}>
          <ListerDashboard
            properties={properties}
            onSelectProperty={handleSelectProperty}
            onEditProperty={(prop) => setEditingProperty(prop)}
            onDeleteProperty={handleDeleteProperty}
            onToggleSold={handleToggleSoldStatus}
            onBackToMain={() => navigateToPage('home')}
            onOpenListChooser={() => navigateToPage('list')}
            onNavigatePage={(page) => navigateToPage(page as ActivePageView)}
            onNavigateCity={navigateToCity}
          />
        </Suspense>
        <EditPropertyModal
          isOpen={Boolean(editingProperty)}
          onClose={() => setEditingProperty(null)}
          property={editingProperty}
          onPropertyUpdated={handlePropertyUpdated}
        />
      </ErrorBoundary>
    );
  }

  if (activePage === 'list' && !selectedProperty) {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Property Listing Options" onReset={() => navigateToPage('home')}>
        <ListPage
          onBackToMain={() => navigateToPage('home')}
          onSelectSaleRole={(role) => {
            setSellListingRole(role);
            navigateToPage('sell-gui');
          }}
          onSelectRent={(role) => {
            setRentListingRole(role || 'Owner');
            navigateToPage('rent-gui');
          }}
          onNavigatePage={(page, slug) => {
            if (page === 'guides') navigateToGuides(slug);
            else navigateToPage(page);
          }}
          onNavigateCity={navigateToCity}
        />
      </ErrorBoundary>
    );
  }

  if (activePage === 'buy' && !selectedProperty) {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Buy Properties" onReset={() => navigateToPage('home')}>
        <Suspense fallback={lazyFallback}>
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
            onNavigatePage={(page) => navigateToPage(page as ActivePageView)}
            onNavigateCity={navigateToCity}
          />
        </Suspense>
        <EditPropertyModal
          isOpen={Boolean(editingProperty)}
          onClose={() => setEditingProperty(null)}
          property={editingProperty}
          onPropertyUpdated={handlePropertyUpdated}
        />
      </ErrorBoundary>
    );
  }

  if (activePage === 'city' && !selectedProperty) {
    return (
      <ErrorBoundary fallbackTitle="Unable to load City Properties" onReset={() => navigateToPage('home')}>
        <Suspense fallback={lazyFallback}>
          <CityPropertyLandingPage
            cityName={activeCityHub}
            properties={properties}
            onBackToMain={() => navigateToPage('home')}
            onSelectProperty={handleSelectProperty}
            onNavigateCity={navigateToCity}
            onNavigatePage={(page) => navigateToPage(page as ActivePageView)}
            onNavigatePath={navigateToPath}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onStartChat={handleStartChat}
            onDeleteProperty={handleDeleteProperty}
            onToggleSold={handleToggleSoldStatus}
            onEditProperty={(prop) => setEditingProperty(prop)}
          />
        </Suspense>
        <EditPropertyModal
          isOpen={Boolean(editingProperty)}
          onClose={() => setEditingProperty(null)}
          property={editingProperty}
          onPropertyUpdated={handlePropertyUpdated}
        />
      </ErrorBoundary>
    );
  }

  if (activePage === 'guides' && !selectedProperty) {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Property Guides" onReset={() => navigateToPage('home')}>
        <Suspense fallback={lazyFallback}>
          <GuidesHubPage
            onBackToMain={() => navigateToPage('home')}
            onNavigatePage={(page) => navigateToPage(page as ActivePageView)}
            onNavigateCity={navigateToCity}
            onNavigatePath={navigateToPath}
            onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
            initialGuideSlug={activeGuideSlug}
          />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (activePage === 'rent' && !selectedProperty) {
    return (
      <ErrorBoundary fallbackTitle="Unable to load Rental Properties" onReset={() => navigateToPage('home')}>
        <Suspense fallback={lazyFallback}>
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
            onNavigatePage={(page) => navigateToPage(page as ActivePageView)}
            onNavigateCity={navigateToCity}
          />
        </Suspense>
        <EditPropertyModal
          isOpen={Boolean(editingProperty)}
          onClose={() => setEditingProperty(null)}
          property={editingProperty}
          onPropertyUpdated={handlePropertyUpdated}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#032D1F] text-[#F4F3EF]' : 'bg-[#f1f2ef] text-[#12231a]'} flex flex-col selection:bg-[#0E3A2B] selection:text-[#F4F3EF] relative overflow-x-hidden w-full transition-colors duration-300`}>
      
      {/* BACKGROUND CANVAS: Oaken Warm Chalk Ivory & Deep Evergreen Pine */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Ivory Wash / Deep Forest Pine Wash */}
        <div className={`absolute inset-0 transition-colors duration-500 ${
          isDark 
            ? 'bg-gradient-to-b from-[#0E3A2B] via-[#082F21] to-[#032D1F]' 
            : 'bg-gradient-to-b from-[#eceee9] via-[#f4f5f2] to-[#e9ebe7]'
        }`} />
        
        {/* Ambient Radial Forest & Rose-Bronze Glow Points */}
        <div className={`absolute -top-40 left-1/4 w-[700px] h-[700px] rounded-full blur-[140px] transition-colors duration-500 ${
          isDark ? 'bg-[#32463D]/25' : 'bg-[#0E3A2B]/8'
        }`} />
        <div className={`absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] transition-colors duration-500 ${
          isDark ? 'bg-[#AA8F7C]/12' : 'bg-[#AA8F7C]/12'
        }`} />
        <div className={`absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full blur-[160px] transition-colors duration-500 ${
          isDark ? 'bg-[#2A382B]/25' : 'bg-[#32463D]/10'
        }`} />

        {/* Topographic Contour Map Pattern */}
        <svg className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isDark ? 'opacity-[0.05]' : 'opacity-[0.035]'}`} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="topo-contours" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 0 50 Q 50 20 100 50 T 200 50" fill="none" stroke="#AA8F7C" strokeWidth="1" />
              <path d="M 0 100 Q 60 70 120 100 T 200 100" fill="none" stroke="#32463D" strokeWidth="0.8" />
              <path d="M 0 150 Q 40 180 100 150 T 200 150" fill="none" stroke="#AA8F7C" strokeWidth="0.8" />
              <circle cx="100" cy="100" r="35" fill="none" stroke="#AA8F7C" strokeWidth="0.6" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="#32463D" strokeWidth="0.5" />
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
        onOpenSellModal={() => navigateToPage('sell-gui')}
        onOpenRentalModal={() => navigateToPage('rent-gui')}
        onOpenListChooser={() => navigateToPage('list')}
        onOpenSignIn={() => navigateToPage('login')}
        onOpenRegister={() => navigateToPage('register')}
        onOpenHomeLoanPage={() => navigateToPage('home-loan')}
        onNavigateGuides={() => navigateToGuides()}
        onNavigateCity={navigateToCity}
        isRentActive={showRentFilter || filters.category === 'Rent/Lease'}
        isPropertyViewActive={Boolean(selectedProperty)}
        onReturnToProperties={handleBackToMarketplace}
        onBuyClick={() => navigateToPage('buy')}
        onRentClick={() => navigateToPage('rent')}
        onOpenAdminAccounts={() => setIsAdminAccountsOpen(true)}
        onOpenAdminDashboard={() => navigateToPage('admin')}
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
          setShowingFavoritesOnly(!showingFavoritesOnly);
          setCurrentPage(1);
        }}
        showingFavoritesOnly={showingFavoritesOnly}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* If a property is selected: Render dedicated full PropertyDetailPage instead of popup modal! */}
      {selectedProperty ? (
        <main className="relative z-20 flex-1 w-full">
          <Suspense fallback={lazyFallback}>
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
              onNavigatePage={(page) => navigateToPage(page as ActivePageView)}
              onNavigateCity={navigateToCity}
              onNavigatePath={navigateToPath}
              onReportListing={(property) => setReportingProperty(property)}
              onPropertyViewed={(propId, nextViews) => {
                setProperties((prev) => prev.map((p) => (p.id === propId ? { ...p, views: nextViews } : p)));
                setSelectedProperty((prev) => (prev && prev.id === propId ? { ...prev, views: nextViews } : prev));
              }}
            />
          </Suspense>
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
              {isHindi ? 'कृपया प्रतीक्षा करें, संपत्ति की जानकारी लाई जा रही है।' : 'Please wait while we retrieve the property listing.'}
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
      ) : activePage === 'programmatic' ? (
        <main className="relative z-20 flex-1 w-full">
          {(() => {
            const progRoute = resolveProgrammaticSeoRoute(activePath, properties);
            if (!progRoute) {
              return (
                <Suspense fallback={lazyFallback}>
                  <TrustPolicyPage
                    routeKey="not-found"
                    onNavigatePath={navigateToPath}
                    totalPropertiesCount={properties.length}
                  />
                </Suspense>
              );
            }
            return (
              <Suspense fallback={lazyFallback}>
                <ProgrammaticLandingPage
                  route={progRoute}
                  onSelectProperty={handleSelectProperty}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onStartChat={handleStartChat}
                  onDeleteProperty={handleDeleteProperty}
                  onToggleSold={handleToggleSoldStatus}
                  onEditProperty={(prop) => setEditingProperty(prop)}
                  onNavigatePath={navigateToPath}
                />
              </Suspense>
            );
          })()}
        </main>
      ) : (['about', 'contact', 'privacy', 'terms', 'disclaimer', 'listing-guidelines', 'not-found'].includes(activePage)) ? (
        <main className="relative z-20 flex-1 w-full">
          <Suspense fallback={lazyFallback}>
            <TrustPolicyPage
              routeKey={activePage as 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | 'listing-guidelines' | 'not-found'}
              onNavigatePath={navigateToPath}
              totalPropertiesCount={properties.length}
            />
          </Suspense>
        </main>
      ) : (
        <>
          {/* Hero Section with Buy, Sell, Rent buttons above Filters & Search Bar */}
          <Hero
            isRentActive={false}
            onSellClick={() => navigateToPage('sell-gui')}
            onRentalClick={() => navigateToPage('rent-gui')}
            onBuyClick={() => navigateToPage('buy')}
            onRentClick={() => navigateToPage('rent')}
            onExploreClick={scrollToProperties}
            onContactClick={scrollToContact}
            searchBarSlot={
              <SearchBar
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                totalResults={filteredProperties.length}
                onSearchSubmit={scrollToProperties}
                propertiesList={properties}
              />
            }
          />

      {/* Main Content Area: Properties Portfolio */}
      <main id="properties-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-20">
        
        {/* Saved for Later Indicator Bar */}
        {showingFavoritesOnly && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2 text-emerald-800 dark:text-emerald-200 shadow-xs text-sm font-semibold">
            <Bookmark className="w-4 h-4 fill-emerald-600 text-emerald-600 shrink-0" />
            <span>
              {isHindi 
                ? `आपकी सहेजी गई ${favorites.length} संपत्तियां दिखाई जा रही हैं` 
                : `Showing your ${favorites.length} properties saved for later`}
            </span>
          </div>
        )}

        {/* SECTION: Featured Properties Carousel (Like Mobile App) */}
        {!showingFavoritesOnly && featuredProperties.length > 0 && (
          <section className="mb-10 sm:mb-12">
            <div className="mb-4 px-1">
              <h3 className="font-serif-luxury font-bold text-xl sm:text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
                <span>{isHindi ? 'फीचर्ड संपत्तियां' : 'Featured Properties'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {isHindi ? 'कोई प्लेटफॉर्म शुल्क नहीं • सीधा संपर्क' : 'NO PLATFORM FEE • Direct lister contact'}
              </p>
            </div>

            <TrendingCarousel
              properties={featuredProperties}
              onSelectProperty={handleSelectProperty}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              currentUser={currentUser}
              onDeleteProperty={handleDeleteProperty}
              onToggleSold={handleToggleSoldStatus}
              onEditProperty={(prop) => setEditingProperty(prop)}
            />
          </section>
        )}

        {/* SECTION: Platform Features Showcase (Like Mobile App) */}
        {!showingFavoritesOnly && (
          <section className="mb-10 sm:mb-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white dark:from-[#062016] dark:via-[#092c20] dark:to-[#051710] border border-emerald-200/90 dark:border-emerald-800/80 shadow-xs">
            <div className="max-w-3xl mb-6">
              <span className="text-[11px] font-black tracking-widest uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/90 px-3 py-1 rounded-full">
                {isHindi ? 'उत्तराखंड गेटवेज के मुख्य फीचर्स' : 'Key Platform Features'}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif-luxury text-slate-900 dark:text-white mt-2.5">
                {isHindi ? 'उत्तराखंड में सीधा प्रॉपर्टी डिस्कवरी मंच' : 'Property Listing & Discovery Across Uttarakhand'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                {isHindi 
                  ? 'बिना किसी प्लेटफॉर्म शुल्क के संपत्ति मालिकों और लिस्टिंगकर्ताओं से सीधे जुड़ें।' 
                  : 'Connect directly with property owners and listers across Uttarakhand with NO PLATFORM FEE.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Feature 1 */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#0C3628] border border-emerald-200/80 dark:border-[#32463D]/70 shadow-xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {isHindi ? 'कोई प्लेटफॉर्म शुल्क नहीं' : 'NO PLATFORM FEE'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {isHindi ? 'प्रॉपर्टी देखने व लिस्ट करने पर कोई प्लेटफॉर्म शुल्क नहीं।' : 'Browse and post standard listings with no platform fee.'}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#0C3628] border border-emerald-200/80 dark:border-[#32463D]/70 shadow-xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {isHindi ? 'भूमि नियम जानकारी' : 'Land Law Guides'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {isHindi ? 'खतौनी, धारा 143 व स्वतंत्र जांच हेतु सूचनात्मक गाइड।' : 'Informational guides on Uttarakhand land rules and due diligence.'}
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#0C3628] border border-emerald-200/80 dark:border-[#32463D]/70 shadow-xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {isHindi ? 'डायरेक्ट चैट और कॉल' : 'Direct Owner Chat'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {isHindi ? 'व्हाट्सएप और फोन से सीधे ओनर से बात करें।' : 'Instant WhatsApp and phone calls with property listers.'}
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-4 rounded-2xl bg-[#FAF9F6] dark:bg-[#0C3628] border border-emerald-200/80 dark:border-[#32463D]/70 shadow-xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {isHindi ? 'पहाड़ी भूमि यूनिट कनवर्टर' : 'Hill Land Units'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {isHindi ? 'नाली, मुट्ठी, बीघा, बिस्वा और गज की सटीक गणना।' : 'Accurate local Nali, Mutthi, Bigha, and Gaj conversions.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Scroll Anchor at Start of Property Listings */}
        <div id="all-properties-heading" className="scroll-mt-24 sm:scroll-mt-28" />
        {showingFavoritesOnly && (
          <div className="mb-6 pb-4 border-b border-emerald-200/80 dark:border-emerald-950/80">
            <h3 className="text-xl sm:text-2xl font-bold text-[#0E3A2B] dark:text-[#F4F3EF] font-serif-luxury">
              {isHindi ? 'सहेजी गई संपत्तियां' : 'Saved for Later'}
            </h3>
          </div>
        )}

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

            {/* Centered Page Count & Pagination at the bottom of the property list */}
            {totalPages > 1 && (
              <div className="mt-12 pt-8 border-t border-emerald-200/80 dark:border-emerald-950/80 flex flex-col items-center justify-center gap-3 text-center">
                {/* Page Count in the Middle */}
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
                  {isHindi ? (
                    <>पृष्ठ {safeCurrentPage} / {totalPages}</>
                  ) : (
                    <>Page {safeCurrentPage} of {totalPages}</>
                  )}
                </div>

                {/* Centered Navigation Buttons */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage <= 1}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                      safeCurrentPage <= 1
                        ? 'opacity-40 cursor-not-allowed border-emerald-200 dark:border-slate-800 text-slate-400'
                        : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer shadow-xs'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{isHindi ? 'पिछला' : 'Previous'}</span>
                  </button>

                  <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
                    {(() => {
                      const pages: (number | string)[] = [];
                      if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else if (safeCurrentPage <= 3) {
                        pages.push(1, 2, 3, 4, 'ellipsis-end', totalPages);
                      } else if (safeCurrentPage >= totalPages - 2) {
                        pages.push(1, 'ellipsis-start', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                      } else {
                        pages.push(1, 'ellipsis-start', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, 'ellipsis-end', totalPages);
                      }
                      return pages.map((item, idx) => {
                        if (typeof item === 'string') {
                          return (
                            <span key={`el-${idx}`} className="px-1 text-xs font-bold text-slate-400 select-none">
                              ...
                            </span>
                          );
                        }
                        const pageNum = item as number;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              safeCurrentPage === pageNum
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-emerald-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      });
                    })()}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage >= totalPages}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                      safeCurrentPage >= totalPages
                        ? 'opacity-40 cursor-not-allowed border-emerald-200 dark:border-slate-800 text-slate-400'
                        : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer shadow-xs'
                    }`}
                  >
                    <span>{isHindi ? 'अगला' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : properties.length === 0 ? (
          /* Zero Properties in Catalog State: All Fake Properties Removed */
          <div className="bg-white/95 dark:bg-[#082218]/95 rounded-3xl p-8 sm:p-14 text-center border-2 border-dashed border-emerald-300 dark:border-emerald-800 shadow-xl max-w-2xl mx-auto my-8 space-y-5 transition-colors">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <span>{isHindi ? '100% प्रामाणिक प्रत्यक्ष मंच' : '100% Authentic Direct Marketplace'}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#0E3A2B] dark:text-[#F4F3EF] font-serif-luxury">
                {isHindi ? 'अभी कोई लिस्टेड प्रॉपर्टी नहीं है' : 'No Listed Properties Yet'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                {isHindi 
                  ? 'सभी काल्पनिक संपत्तियां हटा दी गई हैं। यहाँ केवल उपयोगकर्ताओं द्वारा सबमिट की गई लिस्टिंग दिखाई जाती हैं।' 
                  : 'All mock and dummy property listings have been removed. Only listings submitted by users appear here.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigateToPage((showRentFilter || filters.category === 'Rent/Lease') ? 'rent-gui' : 'list')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {(showRentFilter || filters.category === 'Rent/Lease') ? (
                  <>
                    <Key className="w-4 h-4" />
                    <span>{isHindi ? '+ किराये हेतु प्रॉपर्टी लिस्ट करें' : '+ List Your Rental'}</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>{isHindi ? '+ अपनी संपत्ति लिस्ट करें' : '+ List Your Property'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Filtered Empty State */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-emerald-200 dark:border-slate-800 shadow-xl space-y-4 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {showingFavoritesOnly 
                ? (isHindi ? 'कोई सहेजी गई प्रॉपर्टी नहीं है' : 'No Saved Properties Yet') 
                : (isHindi ? 'वर्तमान फिल्टर के अनुसार कोई प्रॉपर्टी नहीं मिली' : 'No Properties Match Your Current Filters')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {showingFavoritesOnly 
                ? (isHindi ? 'किसी भी प्रॉपर्टी पर "सहेजें" बटन दबाकर अपनी पसंदीदा सूची तैयार करें।' : 'Click "Save for later" on any property card to build your personal shortlist.') 
                : (isHindi ? 'कृपया स्थान बदलें, खोज शब्द सुधारें अथवा प्रॉपर्टी प्रकार का दायरा बढ़ाएं।' : 'Try adjusting your search query, selecting "Select Your Location", or expanding the property type.')}
            </p>
            <div className="pt-2">
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                {isHindi ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
              </button>
            </div>
          </div>
        )}

        {/* Embedded Calculator Section for direct scroll & discovery */}
        <div id="calculator-section" className="my-16 pt-8 border-t border-emerald-200/80 dark:border-emerald-950/80 scroll-mt-20 sm:scroll-mt-24">
          <div className="mb-6 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2 border border-emerald-200 dark:border-emerald-800">
              <Calculator className="w-3.5 h-3.5" />
              <span>{isHindi ? 'भूमि मापन रूपांतरण' : 'Land Measurement Converter'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0E3A2B] dark:text-[#F4F3EF] font-serif-luxury">
              {isHindi ? 'यूकेजी भूमि कैलकुलेटर' : 'UKG Land Calculator'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              {isHindi 
                ? 'उत्तराखंड की पहाड़ी इकाइयों (नाली, मुट्ठी, बीघा) और मानक इकाइयों (गज, वर्ग फुट, एकड़) में आसानी से बदलें।' 
                : 'Easily convert between Uttarakhand land units (Nali, Mutthi, UK Bigha) and standard units (Gaj, Sq.Ft, Acres, Guntha, Katha).'}
            </p>
          </div>
          <PropertyCalculator isModal={false} />
        </div>

        {/* Banner beneath Land Calculator: Home Loan Graphics & Check Eligibility */}
        <HomeLoanBanner
          isDark={isDark}
          onOpenEligibility={() => navigateToPage('home-loan')}
          onOpenBankOffers={() => navigateToPage('home-loan', '#banks')}
        />

        {/* Authoritative SEO Knowledge & FAQ Guide */}
        <HomeSeoGuideSection />

        {/* About & Contact Section */}
        <AboutAndContact />

      </main>
        </>
      )}

      {/* Footer */}
      <Footer
        onCityClick={(city) => {
          navigateToCity(city);
        }}
        onNavigateCity={navigateToCity}
        onNavigateGuides={navigateToGuides}
        onNavigatePage={(page) => navigateToPage(page)}
        onNavigatePath={navigateToPath}
        onCategoryClick={(category) => {
          navigateToPage('buy', `?category=${encodeURIComponent(category)}`);
        }}
        onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
        onOpenLegalPolicy={handleOpenLegalPolicy}
      />

      {/* Modals */}

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
      <UnifiedListingModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        mode="create-sale"
        initialRole={sellListingRole || 'Owner'}
        onPropertySaved={(savedProp) => {
          setIsUploadModalOpen(false);
          handlePropertyUploaded(savedProp);
        }}
        lastUploadTime={lastUploadTime}
        onUpdateLastUploadTime={setLastUploadTime}
        onOpenLegalPolicy={handleOpenLegalPolicy}
      />

      {/* Dedicated List Your Rental Modal with Mobile App Features */}
      <UnifiedListingModal
        isOpen={isRentalModalOpen}
        onClose={() => setIsRentalModalOpen(false)}
        mode="create-rent"
        initialRole={rentListingRole || 'Owner'}
        onPropertySaved={(rentalProp) => {
          setIsRentalModalOpen(false);
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
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
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
        onSelectRent={(role) => {
          setRentListingRole(role || 'Owner');
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

      {/* Responsive Floating Back to Top Shortcut on Homepage */}
      {activePage === 'home' && !selectedProperty && !urlPropId && !isUploadModalOpen && !isRentalModalOpen && !showListChooser && !editingProperty && (
        <BackToTopButton />
      )}

      {/* Sleek AI Chatbot in Bottom Right Corner - strictly on home screen, hidden when on sell/rent GUI, listing modals, or detail views */}
      {activePage === 'home' && !selectedProperty && !urlPropId && !isUploadModalOpen && !isRentalModalOpen && !showListChooser && !editingProperty && (
        <AiChatbot
          onOpenSellModal={() => navigateToPage('list')}
          onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
          onOpenCalculator={() => {
            const el = document.getElementById('calculator-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onExploreProperties={() => {
            navigateToPage('home');
            window.scrollTo({ top: 500, behavior: 'smooth' });
          }}
        />
      )}

    </div>
  );
}