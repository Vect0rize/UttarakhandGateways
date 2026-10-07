import React, { useState, useMemo, useEffect } from 'react';
import { Property, FilterState } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchBar } from './components/SearchBar';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailPage } from './components/PropertyDetailPage';
import { AdminAccountsModal } from './components/AdminAccountsModal';
import { AdminReportsModal } from './components/AdminReportsModal';
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
import { AuthModal } from './components/AuthModal';
import { FirstVisitLanguageModal } from './components/FirstVisitLanguageModal';
import { SaveInfoPromptModal } from './components/SaveInfoPromptModal';
import { LegalModal } from './components/LegalModal';
import { EditPropertyModal } from './components/EditPropertyModal';
import { LegalPolicyId } from './data/legalPolicies';
import { BuyPage } from './components/BuyPage';
import { RentPage } from './components/RentPage';
import { LoginPage } from './components/LoginPage';
import { SellGuiPage } from './components/SellGuiPage';
import { RentGuiPage } from './components/RentGuiPage';
import { ListChooserModal } from './components/ListChooserModal';

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

export type ActivePageView = 'home' | 'buy' | 'rent' | 'login' | 'sell-gui' | 'rent-gui' | 'inbox';

export default function App() {
  const { isHindi } = useLanguage();
  const { currentUser, requireAuth, openAuthModal } = useAuth();

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

  const getInitialActivePage = (): ActivePageView => {
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('page');
      if (p === 'buy' || window.location.pathname === '/buy') return 'buy';
      if (p === 'rent' || window.location.pathname === '/rent') return 'rent';
      if (p === 'login' || window.location.pathname === '/login') return 'login';
      if (p === 'sell-gui' || p === 'sell' || window.location.pathname === '/sell') return 'sell-gui';
      if (p === 'rent-gui' || p === 'rent-list' || window.location.pathname === '/rent-gui') return 'rent-gui';
      if (p === 'inbox' || window.location.pathname === '/inbox') return 'inbox';
    } catch {}
    return 'home';
  };

  const [activePage, setActivePage] = useState<ActivePageView>(getInitialActivePage);
  const [showListChooser, setShowListChooser] = useState(false);

  // Support history navigation between marketplace, buy page, rent page, sell gui, rent gui, login, and inbox
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('page');
      const propId = params.get('property');

      if (propId) {
        return; // Handled by handleCheckUrlProperty
      }

      if (p === 'buy' || window.location.pathname === '/buy') {
        setActivePage('buy');
        setSelectedProperty(null);
      } else if (p === 'rent' || window.location.pathname === '/rent') {
        setActivePage('rent');
        setSelectedProperty(null);
      } else if (p === 'login' || window.location.pathname === '/login') {
        setActivePage('login');
        setSelectedProperty(null);
      } else if (p === 'sell-gui' || p === 'sell' || window.location.pathname === '/sell') {
        setActivePage('sell-gui');
        setSelectedProperty(null);
      } else if (p === 'rent-gui' || p === 'rent-list' || window.location.pathname === '/rent-gui') {
        setActivePage('rent-gui');
        setSelectedProperty(null);
      } else if (p === 'inbox' || window.location.pathname === '/inbox') {
        setActivePage('inbox');
        setSelectedProperty(null);
      } else {
        setActivePage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPage = (target: ActivePageView) => {
    setActivePage(target);
    setSelectedProperty(null);
    try {
      if (target === 'home') {
        window.history.pushState({}, '', window.location.pathname.startsWith('/?') || window.location.search ? '/' : window.location.pathname);
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

  // E-commerce Properties Catalog (Built-in + Community Uploaded)
  const [properties, setProperties] = useState<Property[]>([]);

  // Modals state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isUnitConverterOpen, setIsUnitConverterOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isAdminAccountsOpen, setIsAdminAccountsOpen] = useState(false);
  const [isAdminReportsOpen, setIsAdminReportsOpen] = useState(false);
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

  useEffect(() => {
    const handlePropsUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setProperties(e.detail);
      }
    };
    window.addEventListener('uk_gateways_properties_updated', handlePropsUpdate);

    // Cross-tab and window real-time sync via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('uk_gateways_properties_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'PROPERTIES_UPDATED' && Array.isArray(event.data.properties)) {
          setProperties(event.data.properties);
        }
      };
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'uk_gateways_uploaded_properties' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setProperties(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('uk_gateways_properties_updated', handlePropsUpdate);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, []);

  // Fetch properties from shared server database so ALL visitors (logged in or not) see all properties
  useEffect(() => {
    try { localStorage.removeItem('uk_gateways_uploaded_properties'); } catch {}

    const fetchPropertiesFromServer = async () => {
      try {
        const res = await fetch('/api/properties');
        if (res.ok) {
          const data = await res.json();
          const serverProps: Property[] = Array.isArray(data) ? data : (data.properties || []);
          
          let localProps: Property[] = [];
          try {
            const raw = localStorage.getItem('uk_gateways_uploaded_properties');
            if (raw) localProps = JSON.parse(raw);
          } catch {}

          const serverIds = new Set(serverProps.map((p) => p.id));
          const unsynced = localProps.filter((p) => !serverIds.has(p.id));

          if (unsynced.length > 0) {
            try {
              const syncRes = await fetch('/api/properties/bulk-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ properties: unsynced })
              });
              if (syncRes.ok) {
                const syncData = await syncRes.json();
                const merged = syncData.properties || [...unsynced, ...serverProps];
                setProperties(merged);
                localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(merged));
                return;
              }
            } catch {}
          }

          if (serverProps.length === 0) {
            setProperties([]);
            localStorage.removeItem('uk_gateways_uploaded_properties');
          } else {
            setProperties((prev) => {
              if (prev.length === serverProps.length && prev.every((p, i) => p.id === serverProps[i]?.id && p.isSold === serverProps[i]?.isSold)) {
                return prev;
              }
              return serverProps;
            });
            localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(serverProps));
          }
        }
      } catch (err) {
        console.warn('Failed to fetch properties from server:', err);
      }
    };

    fetchPropertiesFromServer();
    const interval = setInterval(fetchPropertiesFromServer, 30000);
    return () => clearInterval(interval);
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

  // Initial check for ?property=<id> in URL parameter on load
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const propId = params.get('property');
      if (propId && properties.length > 0) {
        const found = properties.find((p) => p.id === propId);
        if (found) {
          setSelectedProperty((prev) => (prev?.id === found.id ? prev : found));
        }
      }
    } catch {}
  }, [properties.length]);

  // Listen for browser back / forward navigation popstate
  useEffect(() => {
    const handlePopStateProperty = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const propId = params.get('property');
        if (propId) {
          const found = properties.find((p) => p.id === propId);
          if (found) {
            setSelectedProperty((prev) => (prev?.id === found.id ? prev : found));
            return;
          }
        } else {
          // Navigated back from property view
          setSelectedProperty(null);
        }
      } catch {}
    };

    window.addEventListener('popstate', handlePopStateProperty);
    return () => window.removeEventListener('popstate', handlePopStateProperty);
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem('uk_gateways_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    requireAuth(() => {
      setFavorites((prev) => 
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }, isHindi ? 'संपत्ति को सहेजने हेतु कृपया पहले लॉगिन या रजिस्टर करें।' : 'Please sign in or register to save properties.');
  };

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    try {
      window.history.pushState({ propertyId: property.id }, '', `?property=${property.id}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMarketplace = () => {
    setSelectedProperty(null);
    try {
      if (activePage === 'buy') {
        window.history.pushState({ page: 'buy' }, '', '?page=buy');
      } else if (activePage === 'rent') {
        window.history.pushState({ page: 'rent' }, '', '?page=rent');
      } else {
        window.history.pushState({}, '', window.location.pathname.startsWith('/?') || window.location.search ? '/' : window.location.pathname);
      }
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
      setIsUploadModalOpen(true);
    }, isHindi ? 'अपनी संपत्ति लिस्ट करने हेतु कृपया पहले लॉगिन या रजिस्टर करें।' : 'Please sign in or register to list your property.');
  };

  const handleOpenRentalModal = () => {
    requireAuth(() => {
      setIsRentalModalOpen(true);
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
    setProperties((prev) => {
      const updated = [newProperty, ...prev.filter((p) => p.id !== newProperty.id)];
      try {
        localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(updated));
      } catch {}
      broadcastPropertiesUpdated(updated);
      return updated;
    });

    // Save to shared server database so other users (and logged-out visitors) see it
    try {
      await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProperty),
      });
    } catch (err) {
      console.error('Failed to save property to server:', err);
    }

    setUploadToast(`"${newProperty.title}" is now live in the marketplace!`);
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
    setProperties((prev) => {
      const updated = prev.map((p) => (p.id === updatedProperty.id ? updatedProperty : p));
      try {
        localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(updated));
      } catch {}
      broadcastPropertiesUpdated(updated);
      return updated;
    });

    if (selectedProperty?.id === updatedProperty.id) {
      setSelectedProperty(updatedProperty);
    }

    // Save to shared server database
    try {
      await fetch(`/api/properties/${encodeURIComponent(updatedProperty.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProperty),
      });
    } catch (err) {
      console.error('Failed to update property on server:', err);
    }

    setUploadToast(isHindi ? `प्रॉपर्टी "${updatedProperty.title}" सफलतापूर्वक अपडेट की गई!` : `Property "${updatedProperty.title}" updated successfully!`);
    setTimeout(() => {
      setUploadToast(null);
    }, 5000);
  };

  // Handler when an owner deletes their property listing
  const handleDeleteProperty = async (propertyId: string) => {
    setProperties((prev) => {
      const updated = prev.filter((p) => p.id !== propertyId);
      try {
        localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(updated));
      } catch {}
      broadcastPropertiesUpdated(updated);
      return updated;
    });

    // Remove from favorites if saved
    setFavorites((prev) => prev.filter((id) => id !== propertyId));

    // Close detail modal if open
    if (selectedProperty?.id === propertyId) {
      setSelectedProperty(null);
    }

    // Delete from shared server database
    try {
      await fetch(`/api/properties/${encodeURIComponent(propertyId)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete property from server:', err);
    }

    setUploadToast(isHindi ? 'आपकी प्रॉपर्टी लिस्टिंग सफलतापूर्वक हटा दी गई।' : 'Your property listing has been successfully deleted.');
    setTimeout(() => {
      setUploadToast(null);
    }, 4500);
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
        await fetch(`/api/properties/${encodeURIComponent(propertyId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetProp),
        });
      } catch (err) {}
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
        sellerName: property.sellerName || 'Direct Property Owner',
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
    setUploadToast(`Chat request sent to ${property.sellerName || 'owner'}! Opening conversation...`);
    setTimeout(() => setUploadToast(null), 3500);

    // Open standalone inbox webpage in new tab or open modal
    try {
      window.open('?page=inbox&propertyId=' + property.id, '_blank');
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

      // If user selected Rent/Lease category explicitly:
      if (filters.category === 'Rent/Lease') {
        if (!isRentProperty) return false;
      }
      // On the website main page all properties are shown together by default (both for sale & rent)

      // Category / Property Type filter
      if (filters.category !== 'All Types' && filters.category !== 'Rent/Lease') {
        const cat = filters.category.toLowerCase();
        const propType = (property.type || '').toLowerCase();
        const propCat = (property.category || '').toLowerCase();
        const propTitle = (property.title || '').toLowerCase();
        const propDesc = (property.description || '').toLowerCase();

        let matchesType = false;
        if (cat === 'villa') {
          matchesType = propType === 'villa' || propTitle.includes('villa');
        } else if (cat === 'plot') {
          matchesType = propType === 'plot' || propType === 'land' || propTitle.includes('plot');
        } else if (cat === 'flat') {
          matchesType = propType === 'flat' || propType === 'apartment' || propTitle.includes('flat') || propTitle.includes('apartment') || propTitle.includes('bhk');
        } else if (cat === 'cottage') {
          matchesType = propType === 'cottage' || propTitle.includes('cottage');
        } else if (cat === 'farmhouse') {
          matchesType = propType === 'farmhouse' || propTitle.includes('farmhouse') || propTitle.includes('estate');
        } else if (cat === 'shop') {
          matchesType = propType === 'shop' || propCat === 'commercial' || propTitle.includes('shop') || propTitle.includes('commercial');
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
          matchesType = propType === 'land' || propCat === 'agriculture' || propType === 'plot' || propTitle.includes('land') || propTitle.includes('orchard');
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

  // Standalone Web Pages (Inbox, Login, Buy, Rent, Sell GUI, Rent GUI)
  if (activePage === 'inbox') {
    return (
      <InboxPage 
        onBackToMarketplace={() => navigateToPage('home')} 
      />
    );
  }

  if (activePage === 'login') {
    return (
      <LoginPage 
        onBackToMain={() => navigateToPage('home')}
        onLoginSuccess={() => navigateToPage('home')}
      />
    );
  }

  if (activePage === 'sell-gui') {
    return (
      <SellGuiPage
        onBackToMain={() => navigateToPage('home')}
        onPropertyUploaded={(p) => {
          handlePropertyUploaded(p);
          navigateToPage('home');
        }}
        lastUploadTime={lastUploadTime}
        onUpdateLastUploadTime={setLastUploadTime}
        onOpenLegalPolicy={handleOpenLegalPolicy}
      />
    );
  }

  if (activePage === 'rent-gui') {
    return (
      <RentGuiPage
        onBackToMain={() => navigateToPage('home')}
        onRentalUploaded={(p) => {
          handlePropertyUploaded(p);
          navigateToPage('rent');
        }}
        onOpenLegalPolicy={handleOpenLegalPolicy}
      />
    );
  }

  if (activePage === 'buy' && !selectedProperty) {
    return (
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
    );
  }

  if (activePage === 'rent' && !selectedProperty) {
    return (
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
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#071a14] text-slate-100' : 'bg-[#f2f7f4] text-slate-800'} flex flex-col selection:bg-emerald-600 selection:text-white relative overflow-x-hidden w-full transition-colors duration-300`}>
      
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
      ) : (
        <>
          {/* Hero Section with Buy, Sell, Rent buttons above Filters & Search Bar */}
          <Hero
            isRentActive={false}
            onSellClick={() => {
              requireAuth(() => {
                setShowListChooser(true);
              }, isHindi ? 'प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' : 'Please sign in with your email via OTP to list a property.');
            }}
            onRentalClick={() => {
              requireAuth(() => {
                navigateToPage('rent-gui');
              }, isHindi ? 'किराये की प्रॉपर्टी लिस्ट करने हेतु कृपया ईमेल (OTP) से लॉगिन करें।' : 'Please sign in with your email via OTP to list a property.');
            }}
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
                    ? `कुल ${filteredProperties.length} संपत्तियां उपलब्ध (बिक्री व किराया)` 
                    : `Showing ${filteredProperties.length} All Properties (Sale & Rent)`)}
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

            {/* Centered Page Count & Pagination at the bottom of the property list */}
            {totalPages > 1 && (
              <div className="mt-12 pt-8 border-t border-emerald-200/80 dark:border-emerald-950/80 flex flex-col items-center justify-center gap-3 text-center">
                {/* Page Count in the Middle */}
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {isHindi ? (
                    <>
                      प्रॉपर्टीज <strong className="text-slate-900 dark:text-slate-100">{startIndex + 1}–{endIndex}</strong> (कुल <strong className="text-slate-900 dark:text-slate-100">{filteredProperties.length}</strong> में से) | पृष्ठ {safeCurrentPage} / {totalPages}
                    </>
                  ) : (
                    <>
                      Showing properties <strong className="text-slate-900 dark:text-slate-100">{startIndex + 1}–{endIndex}</strong> of <strong className="text-slate-900 dark:text-slate-100">{filteredProperties.length}</strong> (Page {safeCurrentPage} of {totalPages})
                    </>
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

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          safeCurrentPage === pageNum
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-emerald-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
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
              <h3 className="text-2xl sm:text-3xl font-bold text-[#0a271c] dark:text-white font-serif-luxury">
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
                onClick={(showRentFilter || filters.category === 'Rent/Lease') ? handleOpenRentalModal : handleOpenUploadModal}
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
                {isHindi ? 'सभी संपत्तियां देखें' : 'Explore All Properties'}
              </button>
            </div>
          </div>
        )}

        {/* Embedded Calculator Section for direct scroll & discovery */}
        <div id="calculator-section" className="my-16 pt-8 border-t border-emerald-200/80 dark:border-emerald-950/80">
          <div className="mb-6 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2 border border-emerald-200 dark:border-emerald-800">
              <Calculator className="w-3.5 h-3.5" />
              <span>{isHindi ? 'भूमि मापन रूपांतरण' : 'Land Measurement Converter'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0a271c] dark:text-white font-serif-luxury">
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

        {/* About & Contact Section */}
        <AboutAndContact />

      </main>
        </>
      )}

      {/* Footer */}
      <Footer
        onCityClick={(city) => {
          handleFilterChange({ ...filters, city });
          scrollToProperties();
        }}
        onCategoryClick={(category) => {
          handleFilterChange({ ...filters, category });
          scrollToProperties();
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

      {/* Save Login Info on this device Prompt Modal */}
      <SaveInfoPromptModal />

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
      />

      <AdminReportsModal
        isOpen={isAdminReportsOpen}
        onClose={() => setIsAdminReportsOpen(false)}
        allProperties={properties}
        onSelectProperty={(property) => { setSelectedProperty(property); setIsAdminReportsOpen(false); }}
      />

      <ReportListingModal
        isOpen={Boolean(reportingProperty)}
        property={reportingProperty}
        onClose={() => setReportingProperty(null)}
      />

      {/* Common List Chooser Modal */}
      <ListChooserModal
        isOpen={showListChooser}
        onClose={() => setShowListChooser(false)}
        onSelectSale={() => {
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

    </div>
  );
}
