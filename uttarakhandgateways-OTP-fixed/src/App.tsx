import React, { useState, useMemo, useEffect } from 'react';
import { Property, FilterState } from './types';
import { PROPERTIES } from './data/properties';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchBar } from './components/SearchBar';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { EmiCalculatorModal } from './components/EmiCalculatorModal';
import { LandUnitConverterModal } from './components/LandUnitConverterModal';
import { UploadPropertyModal } from './components/UploadPropertyModal';
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
  CheckCircle2,
  MessageSquare,
  Lock,
  Unlock,
  Phone,
  Calculator,
  Building2
} from 'lucide-react';
import { ChatThread, PhoneNumberRequest } from './types';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

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

  // Check if URL requests standalone Inbox webpage
  const [isStandaloneInbox, setIsStandaloneInbox] = useState<boolean>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('page') === 'inbox' || window.location.pathname === '/inbox';
    } catch {
      return false;
    }
  });

  // Support history navigation between marketplace and inbox webpage
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setIsStandaloneInbox(params.get('page') === 'inbox' || window.location.pathname === '/inbox');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
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
  // All fake/mock properties removed. Only real user/owner uploaded properties are retained.
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_uploaded_properties');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Exclude any fake mock properties (ids starting with 'prop-')
          return parsed.filter((p: Property) => p.id && p.id.startsWith('user-prop-'));
        }
      }
    } catch {}
    return [];
  });

  // Modals state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isEmiCalcOpen, setIsEmiCalcOpen] = useState(false);
  const [emiInitialPrice, setEmiInitialPrice] = useState<number>(8500000);
  const [isUnitConverterOpen, setIsUnitConverterOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [uploadToast, setUploadToast] = useState<string | null>(null);

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
  const [phoneRequests, setPhoneRequests] = useState<PhoneNumberRequest[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_phone_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((r: any) => !r.id.startsWith('req-incoming-') && !r.id.startsWith('req-outgoing-'));
        }
      }
    } catch {}
    return [];
  });

  // Pending chat property awaiting user confirmation before sending request
  const [pendingChatProperty, setPendingChatProperty] = useState<Property | null>(null);

  // Sync chat threads to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uk_gateways_chat_threads', JSON.stringify(chatThreads));
    } catch {}
  }, [chatThreads]);

  // Sync phone requests to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uk_gateways_phone_requests', JSON.stringify(phoneRequests));
    } catch {}
  }, [phoneRequests]);

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

  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

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
    requireAuth(() => {
      setSelectedProperty(property);
    }, isHindi ? 'संपत्ति का पूरा विवरण देखने व मालिक से संपर्क हेतु लॉगिन आवश्यक है।' : 'Please sign in or register to view full property details and contact the owner.');
  };

  const handleOpenEmiCalc = (price?: number) => {
    requireAuth(() => {
      if (price) setEmiInitialPrice(price);
      setIsEmiCalcOpen(true);
    }, isHindi ? 'ईएमआई कैलकुलेटर उपयोग करने हेतु कृपया लॉगिन करें।' : 'Please sign in or register to use the EMI calculator.');
  };

  const handleOpenUnitConverter = () => {
    requireAuth(() => {
      setIsUnitConverterOpen(true);
    }, isHindi ? 'भूमि इकाई कैलकुलेटर उपयोग करने हेतु कृपया लॉगिन करें।' : 'Please sign in or register to use the land unit converter.');
  };

  const handleOpenUploadModal = () => {
    requireAuth(() => {
      setIsUploadModalOpen(true);
    }, isHindi ? 'अपनी संपत्ति 0% ब्रोकरेज पर लिस्ट करने हेतु कृपया पहले लॉगिन या रजिस्टर करें।' : 'Please sign in or register to list your property with 0% brokerage.');
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setShowingFavoritesOnly(false);
    setCurrentPage(1);
  };

  // Handler when a user uploads a new property to the marketplace
  const handlePropertyUploaded = (newProperty: Property) => {
    setProperties((prev) => {
      const updated = [newProperty, ...prev];
      try {
        const userProps = updated.filter((p) => p.id.startsWith('user-prop-'));
        localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(userProps));
      } catch {}
      return updated;
    });

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

  // Handler when an owner deletes their property listing
  const handleDeleteProperty = (propertyId: string) => {
    setProperties((prev) => {
      const updated = prev.filter((p) => p.id !== propertyId);
      try {
        const userProps = updated.filter((p) => p.id.startsWith('user-prop-'));
        localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(userProps));
      } catch {}
      return updated;
    });

    // Remove from favorites if saved
    setFavorites((prev) => prev.filter((id) => id !== propertyId));

    // Close detail modal if open
    if (selectedProperty?.id === propertyId) {
      setSelectedProperty(null);
    }

    setUploadToast(isHindi ? 'आपकी प्रॉपर्टी लिस्टिंग सफलतापूर्वक हटा दी गई।' : 'Your property listing has been successfully deleted.');
    setTimeout(() => {
      setUploadToast(null);
    }, 4500);
  };

  // Handler when an owner toggles sold status
  const handleToggleSoldStatus = (propertyId: string) => {
    setProperties((prev) => {
      const updated = prev.map((p) => {
        if (p.id === propertyId) {
          return {
            ...p,
            isSold: !p.isSold,
          };
        }
        return p;
      });
      try {
        const userProps = updated.filter((p) => p.id.startsWith('user-prop-'));
        localStorage.setItem('uk_gateways_uploaded_properties', JSON.stringify(userProps));
      } catch {}
      return updated;
    });

    // Update selectedProperty if open
    setSelectedProperty((prev) => {
      if (prev && prev.id === propertyId) {
        return { ...prev, isSold: !prev.isSold };
      }
      return prev;
    });
  };

  // Helper to determine phone access status for a property
  const getPhoneRequestStatus = (propertyId: string): 'none' | 'pending' | 'approved' | 'declined' => {
    const req = phoneRequests.find((r) => r.propertyId === propertyId && !r.isIncomingForUserListing);
    return req ? req.status : 'none';
  };

  const getApprovedPhoneNumber = (propertyId: string): string | undefined => {
    const req = phoneRequests.find((r) => r.propertyId === propertyId && !r.isIncomingForUserListing && r.status === 'approved');
    return req?.sellerPhone;
  };

  // Prompt confirmation dialog before sending chat request to property owner
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
        sellerPhone: property.sellerPhone,
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

  // Send request to view owner phone number
  const handleRequestPhoneNumber = (property: Property) => {
    requireAuth(() => {
      const existing = phoneRequests.find((r) => r.propertyId === property.id && !r.isIncomingForUserListing);
      if (existing) {
        setUploadToast(`Phone access status for "${property.title}": ${existing.status.toUpperCase()}. Check your Inbox.`);
        setTimeout(() => setUploadToast(null), 4000);
        setIsInboxOpen(true);
        return;
      }

      const newRequest: PhoneNumberRequest = {
        id: `req-${Date.now()}`,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyCity: property.city,
        propertyImage: property.images[0] || '',
        sellerName: property.sellerName || 'Direct Owner',
        sellerPhone: property.sellerPhone || '+91 98971 23456',
        requesterName: currentUser?.username || 'You',
        requesterNote: 'Looking to verify title documents and coordinate physical site visit.',
        requestedAt: 'Just now',
        status: 'pending',
        isIncomingForUserListing: false,
      };

      setPhoneRequests((prev) => [newRequest, ...prev]);
      setUploadToast(`📞 Phone access requested from ${property.sellerName || 'owner'}. You can track approval in your Inbox.`);
      setTimeout(() => setUploadToast(null), 5000);
    }, isHindi ? 'मालिक का फोन नंबर देखने हेतु लॉगिन या रजिस्टर करें।' : 'Please sign in or register to request the owner\'s verified phone number.');
  };

  const handleApproveRequest = (requestId: string) => {
    setPhoneRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'approved', approvedAt: 'Just now' }
          : r
      )
    );
    setUploadToast('✅ Phone access granted! The buyer can now call or WhatsApp you directly.');
    setTimeout(() => setUploadToast(null), 4000);
  };

  const handleDeclineRequest = (requestId: string) => {
    setPhoneRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'declined' }
          : r
      )
    );
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

      // Category / Property Type filter
      if (filters.category !== 'All Types') {
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
      if (filters.budgetRange !== 'all') {
        const priceLakhs = property.price / 100000;
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
      if (filters.reraApprovedOnly && !property.reraStatus.includes('RERA')) {
        return false;
      }

      // Search text query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = property.title.toLowerCase().includes(query);
        const matchesLocation = property.location.toLowerCase().includes(query);
        const matchesCity = property.city.toLowerCase().includes(query);
        const matchesDesc = property.description.toLowerCase().includes(query);
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
  }, [filters, favorites, showingFavoritesOnly]);

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

  // If user requested standalone inbox webpage (via ?page=inbox)
  if (isStandaloneInbox) {
    return (
      <InboxPage 
        onBackToMarketplace={() => {
          try {
            window.history.pushState({}, '', window.location.pathname);
          } catch {}
          setIsStandaloneInbox(false);
        }} 
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

      {/* Google Maps Quota Defense Banner */}
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      
      {/* Navigation Bar with Theme Toggle, Sell CTA, Inbox and Organized Mobile Top Bar */}
      <Navbar
        onOpenSellModal={handleOpenUploadModal}
        onOpenInbox={() => {
          requireAuth(() => {
            window.open('?page=inbox', '_blank');
          }, isHindi ? 'संदेश और इनबॉक्स देखने हेतु लॉगिन आवश्यक है।' : 'Please sign in or register to access your Inbox.');
        }}
        onOpenCalculator={() => {
          const el = document.getElementById('calculator-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        unreadInboxCount={
          chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0) +
          phoneRequests.filter((r) => r.isIncomingForUserListing && r.status === 'pending').length
        }
        onOpenEmiCalculator={() => handleOpenEmiCalc()}
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

      {/* Hero Section with Buy Property & Sell Property above Filters & Search Bar */}
      <Hero
        onSellClick={handleOpenUploadModal}
        onBuyClick={scrollToProperties}
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
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-rose-800 dark:text-rose-200 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bookmark className="w-4 h-4 fill-rose-500 text-rose-500" />
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
              className="text-xs bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 dark:hover:bg-rose-800 px-3 py-1.5 rounded-lg text-rose-900 dark:text-rose-100 font-semibold cursor-pointer"
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
                    ? `कुल ${filteredProperties.length} परिणाम उपलब्ध` 
                    : `Showing ${filteredProperties.length} Result${filteredProperties.length === 1 ? '' : 's'}`)}
            </h3>
          </div>

          {/* Quick filter summary & reset controls + Sell CTA */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenUploadModal}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isHindi ? '+ संपत्ति बेचें / लिस्ट करें' : '+ Sell / List Property'}</span>
            </button>

            {(filters.city !== 'All Locations' || filters.category !== 'All Types' || filters.searchQuery || filters.budgetRange !== 'all' || filters.bhkConfig !== 'all' || filters.himalayanViewOnly || filters.reraApprovedOnly) && (
              <button
                onClick={handleResetFilters}
                className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-emerald-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'सभी फिल्टर हटाएं' : 'Reset All Filters'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Properties Grid: 10 properties per page */}
        {displayedProperties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {displayedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={(p) => handleSelectProperty(p)}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={toggleFavorite}
                  onStartChat={handleStartChat}
                  onRequestPhoneNumber={handleRequestPhoneNumber}
                  phoneRequestStatus={getPhoneRequestStatus(property.id)}
                  approvedPhoneNumber={getApprovedPhoneNumber(property.id)}
                  onDeleteProperty={handleDeleteProperty}
                  onToggleSold={handleToggleSoldStatus}
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
                  ? 'सभी काल्पनिक संपत्तियां हटा दी गई हैं। यहाँ केवल वास्तविक संपत्ति मालिक और सत्यापित बिल्डर 0% ब्रोकरेज पर अपनी प्रॉपर्टी जोड़ सकते हैं।' 
                  : 'All mock and dummy property listings have been removed. Only real owners and verified builders can list properties directly with 0% brokerage.'}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenUploadModal}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isHindi ? '+ अपनी संपत्ति लिस्ट करें (0% ब्रोकरेज)' : '+ List Your Property (0% Brokerage)'}</span>
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
                {showingFavoritesOnly 
                  ? (isHindi ? 'सभी संपत्तियां देखें' : 'Explore All Properties') 
                  : (isHindi ? 'सभी फिल्टर हटाएं' : 'Reset All Filters')}
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
        onOpenEmiCalc={() => handleOpenEmiCalc()}
        onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
      />

      {/* Modals */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onOpenEmiCalculator={(price) => handleOpenEmiCalc(price)}
          isFavorite={favorites.includes(selectedProperty.id)}
          onToggleFavorite={toggleFavorite}
          onStartChat={handleStartChat}
          onRequestPhoneNumber={handleRequestPhoneNumber}
          phoneRequestStatus={getPhoneRequestStatus(selectedProperty.id)}
          approvedPhoneNumber={getApprovedPhoneNumber(selectedProperty.id)}
          onDeleteProperty={handleDeleteProperty}
          onToggleSold={handleToggleSoldStatus}
        />
      )}

      <EmiCalculatorModal
        isOpen={isEmiCalcOpen}
        onClose={() => setIsEmiCalcOpen(false)}
        initialPrice={emiInitialPrice}
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
      />

      {/* Direct Buyer-to-Owner Messaging & Phone Request Inbox Modal */}
      <InboxModal
        isOpen={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
        chatThreads={chatThreads}
        onSendMessage={handleSendMessage}
        phoneRequests={phoneRequests}
        onApproveRequest={handleApproveRequest}
        onDeclineRequest={handleDeclineRequest}
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

      {/* Floating AI Chatbot in bottom corner with site info & guidance */}
      <AiChatbot
        onOpenSellModal={handleOpenUploadModal}
        onOpenUnitConverter={handleOpenUnitConverter}
        onOpenCalculator={() => {
          const el = document.getElementById('calculator-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onExploreProperties={scrollToProperties}
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

    </div>
  );
}
