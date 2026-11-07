import { UnifiedListingModal } from './UnifiedListingModal';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Property, 
  FilterState, 
  UttarakhandCity, 
  PropertyType, 
  PropertyCategory, 
  ChatThread 
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CITIES, PROPERTIES } from '../data/properties';
import { IMPORTANT_AMENITIES } from '../data/amenities';
import { 
  Compass, 
  MapPin, 
  Bookmark, 
  User,
  CircleUserRound,
  Plus, 
  PlusCircle, 
  MessageSquare, 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  Building2, 
  Home, 
  Key, 
  Mountain, 
  ShieldCheck, 
  Share2, 
  Phone, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Calculator, 
  Scale, 
  Sparkles, 
  Sun, 
  Moon, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  LogIn, 
  Check, 
  Upload, 
  Layers, 
  Trash2, 
  Edit3, 
  Tag, 
  MoreVertical,
  ArrowRight,
  ExternalLink,
  PhoneCall,
  Loader2,
  Camera,
  Heart,
  Menu,
  RotateCw,
  BarChart3,
  TrendingUp,
  IndianRupee,
  Eye,
  Video,
  AlertTriangle,
  Calendar,
  Lock,
  Droplets,
  Car,
  Wifi
} from 'lucide-react';
import { resolveApiUrl } from '../config/apiConfig';
import { 
  formatPropertyArea, 
  formatPropertyRate, 
  isLandOrPlotProperty,
  AREA_UNITS,
  AreaUnit,
  getAreaUnitShortLabel,
  getAreaUnitConfig
} from '../utils/areaUnits';
import { formatPostTime } from '../utils/timeAgo';
import { getPropertyOwnerDisplayName, isPropertyOwner } from '../utils/propertyOwnership';
import { compressAndNormalizeImage, moderateImageWithAI } from '../utils/imageModeration';
import api from '../services/api';
import { formatEnhancedDescription } from '../utils/descriptionEnhancer';
import { BuyHouseIcon } from './BuyHouseIcon';
import { TrendingCarousel } from './TrendingCarousel';
import { LandPlotsSection } from './LandPlotsSection';
import { StandaloneEmiCalculator } from './StandaloneEmiCalculator';
import { StandaloneLandCalculator } from './StandaloneLandCalculator';
import { HomeLoanBanner } from './HomeLoanBanner';
import { AiChatbot } from './AiChatbot';
import { MobileBottomNav, MobileNavTab } from './MobileBottomNav';
import { MobileAppSidebar } from './MobileAppSidebar';

export interface MobileAppViewProps {
  properties: Property[];
  currentUser: any;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onStartChat: (property: Property) => void;
  onSelectProperty?: (property: Property) => void;
  selectedProperty?: Property | null;
  onClearSelectedProperty?: () => void;
  activeTab?: MobileNavTab;
  onTabChange?: (tab: MobileNavTab) => void;
  onOpenSellModal?: () => void;
  onOpenRentalModal?: () => void;
  onOpenInbox?: () => void;
  onOpenDashboard?: () => void;
  unreadInboxCount?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  requireAuth: (callback: () => void, prompt?: string) => void;
  openAuthModal: (mode: 'login' | 'register') => void;
  onDeleteProperty: (id: string) => void;
  onToggleSold: (id: string) => void;
  onEditProperty: (property: Property) => void;
  onOpenLegalPolicy?: (policy: any) => void;
  onPropertyUploaded?: (property: Property) => void;
  onOpenUnitConverter?: () => void;
  onOpenEmiCalculator?: (price?: number) => void;
  onOpenGuide?: () => void;
  onOpenAdminAccounts?: () => void;
  onOpenAdminReports?: () => void;
  onRefreshProperties?: () => Promise<void> | void;
  isLoading?: boolean;
  loadError?: string | null;
  onRetryLoad?: () => void;
}

// Curated Uttarakhand Hill Station Information with real photos & elevation
const DESTINATIONS_INFO = [
  {
    name: 'Mussoorie',
    tagline: 'Queen of the Hills',
    elevation: '6,580 ft (2,005 m)',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    popularFor: 'Heritage Cottages, Valley Flats'
  },
  {
    name: 'Mukteshwar',
    tagline: 'Himalayan Panorama & Orchards',
    elevation: '7,500 ft (2,286 m)',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    popularFor: 'Scenic Plots, Homestays'
  },
  {
    name: 'Rishikesh',
    tagline: 'World Yoga Capital & Holy Ganges',
    elevation: '1,120 ft (340 m)',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
    popularFor: 'Gated Apartments, Ganges Plots'
  },
  {
    name: 'Nainital',
    tagline: 'Lake City of Kumaon',
    elevation: '6,837 ft (2,084 m)',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    popularFor: 'Hillside Villas, Tourism Stays'
  },
  {
    name: 'Dehradun',
    tagline: 'Capital Valley Hub',
    elevation: '1,400 ft (450 m)',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    popularFor: 'Modern Flats, Luxury Plots'
  },
  {
    name: 'Ranikhet',
    tagline: "The Queen's Meadow",
    elevation: '6,100 ft (1,860 m)',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    popularFor: 'Pine Forests, Eco-Homes'
  },
  {
    name: 'Dhanaulti',
    tagline: 'Peaceful Deodar Sanctuary',
    elevation: '7,500 ft (2,286 m)',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    popularFor: 'Pine Land, Glamping Stays'
  },
  {
    name: 'Almora',
    tagline: 'Cultural Heart of Kumaon',
    elevation: '5,400 ft (1,650 m)',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80',
    popularFor: 'Village Cottages, Organic Farms'
  }
];

const RENTAL_SUBTYPE_OPTIONS: Record<'Residential' | 'Commercial' | 'Land/Plot', string[]> = {
  Residential: [
    'Flat',
    'House',
    'Studio',
    'PG',
    'Hostel',
    'Villa',
    'Cottage',
    'Homestay',
    'Duplex',
    'Farmhouse',
    'Penthouse'
  ],
  Commercial: [
    'Shop',
    'Showroom',
    'Office Space',
    'Hotel',
    'Resort',
    'Restaurant',
    'Cafe',
    'Warehouse'
  ],
  'Land/Plot': [
    'Agricultural Land',
    'Commercial Plot',
    'Industrial Land'
  ]
};

export interface TenantCategoryOption {
  id: string;
  labelEn: string;
  labelHi: string;
}

export const TENANT_CATEGORIES: TenantCategoryOption[] = [
  { id: 'Family', labelEn: 'Family', labelHi: 'परिवार (Family)' },
  { id: 'Bachelors', labelEn: 'Bachelors', labelHi: 'बैचलर्स (Bachelors)' },
  { id: 'Working Professionals', labelEn: 'Working Professionals', labelHi: 'कामकाजी पेशेवर' },
  { id: 'Students', labelEn: 'Students', labelHi: 'छात्र (Students)' },
  { id: 'Couples', labelEn: 'Couples / Newly Weds', labelHi: 'दंपति (Couples)' },
  { id: 'Corporate / Companies', labelEn: 'Corporate / Companies', labelHi: 'कंपनी लीज (Corporate)' },
  { id: 'Tourists / Holidayers', labelEn: 'Tourists / Holidayers', labelHi: 'पर्यटक (Tourists)' },
  { id: 'Doctors / Healthcare Staff', labelEn: 'Doctors / Healthcare', labelHi: 'डॉक्टर्स / हेल्थकेयर' },
  { id: 'Govt / Defense Officers', labelEn: 'Govt / Defense Officers', labelHi: 'सरकारी / रक्षा अधिकारी' },
  { id: 'Anyone / All Welcome', labelEn: 'Anyone / All Welcome', labelHi: 'कोई भी (All Welcome)' },
];

export const SALE_PRESET_AMENITIES = [
  '24/7 Water Supply',
  'Electricity Connection',
  'Dedicated Car Parking',
  'Modular Kitchen',
  'Solar Water / Power System',
  'Mountain & Valley View',
  'Gated Society / 24x7 Security',
  'High-Speed Wi-Fi / Fiber',
  'Private Garden / Lawn',
  'Balcony with View',
];

const RENTAL_PRESET_AMENITIES = [
  '24/7 Water Supply',
  'Electricity / Power Backup',
  'Dedicated Car Parking',
  'Modular Kitchen',
  'High-Speed Wi-Fi / Fiber',
  'Mountain & Valley View',
  'Geyser / Hot Water',
  '24x7 Security & CCTV',
  'Solar Water / Power System',
];

export const MobileAppView: React.FC<MobileAppViewProps> = ({
  properties,
  currentUser,
  favorites,
  onToggleFavorite,
  onStartChat,
  onSelectProperty,
  selectedProperty = null,
  onClearSelectedProperty,
  activeTab: controlledActiveTab,
  onTabChange: controlledOnTabChange,
  onOpenSellModal,
  onOpenRentalModal,
  onOpenInbox,
  onOpenDashboard,
  unreadInboxCount = 0,
  theme = 'light',
  onToggleTheme,
  requireAuth,
  openAuthModal,
  onDeleteProperty,
  onToggleSold,
  onEditProperty,
  onOpenLegalPolicy,
  onPropertyUploaded,
  onOpenUnitConverter,
  onOpenEmiCalculator,
  onOpenGuide,
  onOpenAdminAccounts,
  onOpenAdminReports,
  onRefreshProperties,
  isLoading = false,
  loadError = null,
  onRetryLoad,
}) => {
  const { isHindi, toggleLanguage } = useLanguage();
  const { logout } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleTriggerRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (onRefreshProperties) {
        await onRefreshProperties();
      } else {
        window.location.reload();
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  // Navigation Drawer State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Internal Navigation State
  const [internalTab, setInternalTab] = useState<MobileNavTab>('home');
  const activeTab = controlledActiveTab || internalTab;
  const setActiveTab = (tab: MobileNavTab) => {
    setActiveCardMenuId(null);
    if (controlledOnTabChange) {
      controlledOnTabChange(tab);
    } else {
      setInternalTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Property Details State
  const [internalDetailProperty, setInternalDetailProperty] = useState<Property | null>(null);
  const activeDetailProperty = selectedProperty || internalDetailProperty;
  const setActiveDetailProperty = (p: Property | null) => {
    setActiveCardMenuId(null);
    if (!p && onClearSelectedProperty) {
      onClearSelectedProperty();
    }
    setInternalDetailProperty(p);
    setDetailImgIdx(0);
    if (p) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Keep internalDetailProperty synchronized with properties list updates (edit, sold, delete)
  useEffect(() => {
    if (internalDetailProperty) {
      const refreshed = properties.find((p) => p.id === internalDetailProperty.id);
      if (refreshed && refreshed !== internalDetailProperty) {
        setInternalDetailProperty(refreshed);
      } else if (!refreshed) {
        setInternalDetailProperty(null);
      }
    }
  }, [properties]);

  const [detailImgIdx, setDetailImgIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  // Three-dots action menu & bottom-sheet state for properties
  const [selectedActionProperty, setSelectedActionProperty] = useState<Property | null>(null);
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const activeMenuRef = useRef<HTMLDivElement>(null);

  // Close active card menu when clicking outside without blocking child button events
  useEffect(() => {
    if (!activeCardMenuId) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (activeMenuRef.current && !activeMenuRef.current.contains(e.target as Node)) {
        setActiveCardMenuId(null);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handleOutsideClick);
    }, 60);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [activeCardMenuId]);

  // Search & Filtering State for Explore tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [bhkFilter, setBhkFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showCitySheet, setShowCitySheet] = useState(false);

  // List Property Form State (for Tab 4: List)
  const [listRole, setListRole] = useState<'Owner' | 'Broker'>('Owner');
  const [listType, setListType] = useState<'sale' | 'rent'>('sale');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<PropertyCategory>('Residential');
  const [formPropertyType, setFormPropertyType] = useState<PropertyType>('Villa');
  const [formCity, setFormCity] = useState<UttarakhandCity>('Dehradun');
  const [formLocation, setFormLocation] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formRatePerUnit, setFormRatePerUnit] = useState('');
  const [formPricingMode, setFormPricingMode] = useState<'total' | 'rate_unit'>('total');
  const [formAreaValue, setFormAreaValue] = useState('');
  const [formAreaUnit, setFormAreaUnit] = useState<AreaUnit>('sqft');
  const [formBedrooms, setFormBedrooms] = useState<number>(2);
  const [formBathrooms, setFormBathrooms] = useState<number>(2);
  const [formFacing, setFormFacing] = useState('');
  const [formFurnishing, setFormFurnishing] = useState<'Unfurnished' | 'Semi-Furnished' | 'Furnished'>('Unfurnished');
  const [formReraStatus, setFormReraStatus] = useState('');
  const [formReraId, setFormReraId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [descEnhanceNotice, setDescEnhanceNotice] = useState<string | null>(null);
  const [profileSubTab, setProfileSubTab] = useState<'listings' | 'analytics'>('listings');
  const [formAmenities, setFormAmenities] = useState<string[]>([
    '24/7 Water Supply',
    'Electricity Connection',
    'Dedicated Car Parking'
  ]);
  const [formOtherAmenity, setFormOtherAmenity] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isSubmittingProperty, setIsSubmittingProperty] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isEnhancingDescription, setIsEnhancingDescription] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dedicated Rental Form State (matching ListRentalModal.tsx)
  const [rentalRole, setRentalRole] = useState<'Owner' | 'Broker'>('Owner');
  const [rentalCategory, setRentalCategory] = useState<'Residential' | 'Commercial' | 'Land/Plot'>('Residential');
  const [rentalSubtype, setRentalSubtype] = useState<string>('Flat');
  const [rentalTitle, setRentalTitle] = useState('');
  const [rentalCity, setRentalCity] = useState<UttarakhandCity>('Dehradun');
  const [rentalLocation, setRentalLocation] = useState('');
  const [rentalLandmark, setRentalLandmark] = useState('');
  const [rentalBedrooms, setRentalBedrooms] = useState<number>(2);
  const [rentalBathrooms, setRentalBathrooms] = useState<number>(2);
  const [rentalFurnishing, setRentalFurnishing] = useState<'Furnished' | 'Semi-Furnished' | 'Unfurnished'>('Furnished');
  const [rentalTenantPreferences, setRentalTenantPreferences] = useState<string[]>(['Family']);
  const [rentalAvailableFrom, setRentalAvailableFrom] = useState<string>('Immediate');
  const [rentalAreaValue, setRentalAreaValue] = useState<string>('1200');
  const [rentalAreaUnit, setRentalAreaUnit] = useState<AreaUnit>('sqft');
  const [rentalRentPrice, setRentalRentPrice] = useState<string>('25000');
  const [rentalFrequency, setRentalFrequency] = useState<'month' | 'quarter' | 'year'>('month');
  const [rentalSecurityDeposit, setRentalSecurityDeposit] = useState<string>('50000');
  const [rentalMaintenance, setRentalMaintenance] = useState<string>('Included in Rent');
  const [rentalTagline, setRentalTagline] = useState('Mountain View, Low Deposit, Family Friendly');
  const [rentalDescription, setRentalDescription] = useState('');
  const [rentalPrevDescription, setRentalPrevDescription] = useState<string | null>(null);
  const [rentalAmenities, setRentalAmenities] = useState<string[]>([
    '24/7 Water Supply',
    'Electricity / Power Backup',
    'Dedicated Car Parking',
    'High-Speed Wi-Fi / Fiber'
  ]);
  const [rentalOtherAmenity, setRentalOtherAmenity] = useState('');
  const [rentalSellerName, setRentalSellerName] = useState('');
  const [rentalSellerPhone, setRentalSellerPhone] = useState('');
  const [rentalImages, setRentalImages] = useState<string[]>([]);
  const [rentalVideoUrl, setRentalVideoUrl] = useState('');
  const rentalFileInputRef = useRef<HTMLInputElement>(null);
  const rentalVideoInputRef = useRef<HTMLInputElement>(null);

  const [formSellerPhone, setFormSellerPhone] = useState<string>('');
  const [formSellerName, setFormSellerName] = useState<string>('');
  const [salePrevDescription, setSalePrevDescription] = useState<string | null>(null);

  // Format Indian Price helper with Lakhs, Crores, and Thousands (1000 = 1k)
  const formatIndianPriceHelper = (valStr: string) => {
    const cleanStr = String(valStr || '').replace(/[^\d.]/g, '');
    const num = parseFloat(cleanStr);
    if (isNaN(num) || num <= 0) return '';
    if (num >= 10000000) {
      const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '');
      return `₹${cr} Crore (₹${num.toLocaleString('en-IN')})`;
    }
    if (num >= 100000) {
      const lakh = (num / 100000).toFixed(2).replace(/\.00$/, '');
      return `₹${lakh} Lakh (₹${num.toLocaleString('en-IN')})`;
    }
    if (num >= 1000) {
      const k = (num / 1000).toFixed(1).replace(/\.0$/, '');
      return `₹${k}k (${k} Thousand • ₹${num.toLocaleString('en-IN')})`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Two-way auto-calculation handlers between Price and Rate per Unit
  const handleFormPriceChange = (val: string) => {
    setFormPrice(val);
    const priceNum = parseFloat(val);
    const areaNum = parseFloat(formAreaValue);
    if (!isNaN(priceNum) && priceNum > 0 && !isNaN(areaNum) && areaNum > 0) {
      setFormRatePerUnit(Math.round(priceNum / areaNum).toString());
    } else if (!val.trim()) {
      setFormRatePerUnit('');
    }
  };

  const handleFormRatePerUnitChange = (val: string) => {
    setFormRatePerUnit(val);
    const rateNum = parseFloat(val);
    const areaNum = parseFloat(formAreaValue);
    if (!isNaN(rateNum) && rateNum > 0 && !isNaN(areaNum) && areaNum > 0) {
      setFormPrice(Math.round(rateNum * areaNum).toString());
    } else if (!val.trim()) {
      setFormPrice('');
    }
  };

  const handleFormAreaValueChange = (val: string) => {
    setFormAreaValue(val);
    const areaNum = parseFloat(val);
    const priceNum = parseFloat(formPrice);
    if (!isNaN(priceNum) && priceNum > 0 && !isNaN(areaNum) && areaNum > 0) {
      setFormRatePerUnit(Math.round(priceNum / areaNum).toString());
    }
  };

  const handleFormAreaUnitChange = (unit: AreaUnit) => {
    setFormAreaUnit(unit);
    const areaNum = parseFloat(formAreaValue);
    const priceNum = parseFloat(formPrice);
    if (!isNaN(priceNum) && priceNum > 0 && !isNaN(areaNum) && areaNum > 0) {
      setFormRatePerUnit(Math.round(priceNum / areaNum).toString());
    }
  };

  // Filter properties logic for Explore & Discovery
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (!p) return false;

      // City filter
      if (selectedCity !== 'All' && String(p.city || '').toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Category filter (Robust multi-type alias matching)
      if (selectedCategory !== 'All') {
        const cat = selectedCategory.toLowerCase();
        const pType = String(p.type || '').toLowerCase();
        if (cat === 'rent') {
          const isRent = pType.includes('rent') || pType.includes('lease') || pType.includes('pg') || Boolean(p.isAvailableForRent);
          if (!isRent) return false;
        } else if (cat === 'plot') {
          if (!pType.includes('plot') && !pType.includes('land')) return false;
        } else if (cat === 'flat') {
          if (!pType.includes('flat') && !pType.includes('apartment') && !pType.includes('studio') && !pType.includes('penthouse')) return false;
        } else if (cat === 'cottage') {
          if (!pType.includes('cottage') && !pType.includes('villa') && !pType.includes('house') && !pType.includes('farmhouse') && !pType.includes('duplex')) return false;
        } else if (cat === 'commercial') {
          if (!pType.includes('commercial') && !pType.includes('shop') && !pType.includes('office') && !pType.includes('hotel') && !pType.includes('resort') && !pType.includes('restaurant') && !pType.includes('cafe') && !pType.includes('warehouse') && !pType.includes('showroom')) return false;
        } else if (!pType.includes(cat) && !cat.includes(pType)) {
          return false;
        }
      }

      // BHK Config Filter (Checks configuration, bedrooms count, and title)
      if (bhkFilter !== 'all') {
        const bhkCandidates = [
          p.configuration,
          p.bedrooms ? `${p.bedrooms} bhk` : null,
          p.bedrooms ? `${p.bedrooms}bhk` : null,
          p.title
        ].filter(Boolean).join(' ').toLowerCase();
        if (!bhkCandidates.includes(bhkFilter.toLowerCase())) return false;
      }

      // Budget filter
      if (budgetFilter !== 'all') {
        const priceLakhs = (Number(p.price) || 0) / 100000;
        if (budgetFilter === 'under-25l' && priceLakhs >= 25) return false;
        if (budgetFilter === '25l-50l' && (priceLakhs < 25 || priceLakhs > 50)) return false;
        if (budgetFilter === '50l-1cr' && (priceLakhs < 50 || priceLakhs > 100)) return false;
        if (budgetFilter === 'above-1cr' && priceLakhs <= 100) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = String(p.title || '').toLowerCase().includes(q);
        const locMatch = String(p.location || '').toLowerCase().includes(q);
        const cityMatch = String(p.city || '').toLowerCase().includes(q);
        const typeMatch = String(p.type || '').toLowerCase().includes(q);
        if (!titleMatch && !locMatch && !cityMatch && !typeMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sortBy === 'price-high') return (Number(b.price) || 0) - (Number(a.price) || 0);
      if (sortBy === 'newest') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });
  }, [properties, selectedCity, selectedCategory, bhkFilter, budgetFilter, searchQuery, sortBy]);

  // Saved Properties List
  const savedPropertiesList = useMemo(() => {
    return properties.filter((p) => favorites.includes(p.id));
  }, [properties, favorites]);

  // Featured Properties (Curated from properties, guaranteed non-empty fallback)
  const featuredProperties = useMemo(() => {
    const activeList = properties.length > 0 ? properties : PROPERTIES;
    const list = activeList.filter((p) => p.featured || (p.price && p.price > 5000000));
    return list.length > 0 ? list : activeList.slice(0, 8);
  }, [properties]);

  // Recently Added Properties
  const recentlyAddedProperties = useMemo(() => {
    const activeList = properties.length > 0 ? properties : PROPERTIES;
    return [...activeList].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    }).slice(0, 5);
  }, [properties]);

  // User's own listings (for Profile Tab)
  const myListings = useMemo(() => {
    if (!currentUser) return [];
    return properties.filter((p) => isPropertyOwner(p, currentUser));
  }, [properties, currentUser]);

  // 100% Real Analytics derived strictly from live database counts (0% simulated)
  const realAnalytics = useMemo(() => {
    const totalViews = myListings.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalInquiries = myListings.reduce((sum, p) => sum + (p.inquiries || 0), 0);
    const totalShares = myListings.reduce((sum, p) => sum + (p.shares || 0), 0);
    const activeCount = myListings.filter((p) => !p.isSold).length;
    const soldCount = myListings.filter((p) => p.isSold).length;
    const conversionRate = totalViews > 0 ? ((totalInquiries / totalViews) * 100).toFixed(1) : '0';
    return {
      totalViews,
      totalInquiries,
      totalShares,
      activeCount,
      soldCount,
      conversionRate
    };
  }, [myListings]);

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setShowCitySheet(false);
    setActiveTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCity('All');
    setSelectedCategory('All');
    setBhkFilter('all');
    setBudgetFilter('all');
    setSortBy('featured');
    setShowFilterSheet(false);
  };

  // Image Upload Handler for List Tab (Direct Supabase Storage integration)
  const handleImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const compressedBase64 = await compressAndNormalizeImage(file, 1600, 0.85);
        try {
          const uploadRes = await api.uploadImage(compressedBase64);
          if (uploadRes.success && uploadRes.url) {
            setFormImages((prev) => [...prev, uploadRes.url]);
          } else {
            setFormImages((prev) => [...prev, compressedBase64]);
          }
        } catch {
          setFormImages((prev) => [...prev, compressedBase64]);
        }
      } catch (err) {
        console.error('Image compression failed:', err);
      }
    }
  };

  // Rental Image Upload Handler
  const handleRentalImageFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const compressedBase64 = await compressAndNormalizeImage(file, 1400, 0.85);
        try {
          const uploadRes = await api.uploadImage(compressedBase64);
          if (uploadRes.success && uploadRes.url) {
            setRentalImages((prev) => [...prev, uploadRes.url]);
          } else {
            setRentalImages((prev) => [...prev, compressedBase64]);
          }
        } catch {
          setRentalImages((prev) => [...prev, compressedBase64]);
        }
      } catch (err) {
        console.error('Rental image compression failed:', err);
      }
    }
  };

  const handleRentalVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRentalVideoUrl(url);
  };

  // AI Description Enhancer for Rental
  const handleEnhanceRentalDescription = async () => {
    if (!rentalDescription.trim() || isEnhancingDescription) {
      alert(isHindi ? 'कृपया सुधारने से पहले किराये की संपत्ति के बारे में कुछ विवरण लिखें।' : 'Please enter a few details about your rental property first before enhancing.');
      return;
    }
    setIsEnhancingDescription(true);
    setDescEnhanceNotice(null);

    const meta = {
      title: rentalTitle.trim(),
      city: rentalCity,
      location: rentalLocation.trim() || undefined,
      propertyType: rentalSubtype,
      amenities: [...rentalAmenities, ...(rentalOtherAmenity.trim() ? [rentalOtherAmenity.trim()] : [])],
      language: isHindi ? 'hi' : 'en'
    };

    try {
      const url = resolveApiUrl('/api/enhance-description');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: rentalDescription.trim(),
          existingDescription: rentalDescription.trim(),
          ...meta,
        })
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.success && data?.enhancedDescription) {
          setRentalPrevDescription(rentalDescription);
          setRentalDescription(data.enhancedDescription);
          setDescEnhanceNotice(isHindi ? '✨ AI द्वारा रेंटल विवरण सुधारा गया (0 नई जानकारी जोड़ी गई)' : '✨ Rental description refined with AI (0 extra info added)');
        } else {
          const clientEnhanced = formatEnhancedDescription(rentalDescription.trim(), meta);
          setRentalPrevDescription(rentalDescription);
          setRentalDescription(clientEnhanced);
          setDescEnhanceNotice(isHindi ? '✨ रेंटल विवरण संरचित किया गया' : '✨ Presentation refined (structured highlights & layout)');
        }
      } else {
        const clientEnhanced = formatEnhancedDescription(rentalDescription.trim(), meta);
        setRentalPrevDescription(rentalDescription);
        setRentalDescription(clientEnhanced);
        setDescEnhanceNotice(isHindi ? '✨ रेंटल विवरण संरचित किया गया' : '✨ Presentation refined (structured highlights & layout)');
      }
    } catch {
      const clientEnhanced = formatEnhancedDescription(rentalDescription.trim(), meta);
      setRentalPrevDescription(rentalDescription);
      setRentalDescription(clientEnhanced);
      setDescEnhanceNotice(isHindi ? '✨ रेंटल विवरण संरचित किया गया' : '✨ Presentation refined (structured highlights & layout)');
    } finally {
      setIsEnhancingDescription(false);
      setTimeout(() => setDescEnhanceNotice(null), 6000);
    }
  };

  // AI Description Enhancer for Sale
  const handleEnhanceSaleDescription = async () => {
    if (!formTitle && !formLocation && !formDescription) {
      alert(isHindi ? 'कृपया सुधारने से पहले शीर्षक, स्थान या संक्षिप्त विवरण दर्ज करें।' : 'Please enter a title, location, or brief details first before enhancing.');
      return;
    }
    setIsEnhancingDescription(true);
    setDescEnhanceNotice(null);

    const baseDraft = formDescription.trim().length >= 5
      ? formDescription.trim()
      : `${formTitle || 'Property'} located in ${formLocation || formCity}, Uttarakhand. Direct owner listing with 0% brokerage. ${formPropertyType} featuring clear legal documentation.`;

    const meta = {
      title: formTitle.trim() || undefined,
      city: formCity,
      location: formLocation.trim() || undefined,
      propertyType: formPropertyType,
      amenities: formAmenities,
      language: isHindi ? 'hi' : 'en'
    };

    try {
      const url = resolveApiUrl('/api/enhance-description');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: baseDraft,
          existingDescription: baseDraft,
          ...meta,
        })
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.success && data?.enhancedDescription) {
          setSalePrevDescription(formDescription);
          setFormDescription(data.enhancedDescription);
          setDescEnhanceNotice(isHindi ? '✨ AI द्वारा विवरण को आकर्षक व स्पष्ट बनाया गया' : '✨ Presentation refined with AI (0 extra info added)');
        } else {
          const clientEnhanced = formatEnhancedDescription(baseDraft, meta);
          setSalePrevDescription(formDescription);
          setFormDescription(clientEnhanced);
          setDescEnhanceNotice(isHindi ? '✨ विवरण को संरचित रूप में व्यवस्थित किया गया' : '✨ Presentation refined (structured highlights & layout)');
        }
      } else {
        const clientEnhanced = formatEnhancedDescription(baseDraft, meta);
        setSalePrevDescription(formDescription);
        setFormDescription(clientEnhanced);
        setDescEnhanceNotice(isHindi ? '✨ विवरण को संरचित रूप में व्यवस्थित किया गया' : '✨ Presentation refined (structured highlights & layout)');
      }
    } catch {
      const clientEnhanced = formatEnhancedDescription(baseDraft, meta);
      setSalePrevDescription(formDescription);
      setFormDescription(clientEnhanced);
      setDescEnhanceNotice(isHindi ? '✨ विवरण को संरचित रूप में व्यवस्थित किया गया' : '✨ Presentation refined (structured highlights & layout)');
    } finally {
      setIsEnhancingDescription(false);
      setTimeout(() => setDescEnhanceNotice(null), 6000);
    }
  };

  // Submit Handler for Dedicated Sale GUI
  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    if (!formTitle.trim()) {
      setSubmitError(isHindi ? 'कृपया संपत्ति का शीर्षक दर्ज करें।' : 'Please enter a property title.');
      return;
    }

    const priceNum = parseFloat(formPrice.replace(/[^0-9.]/g, ''));
    if (!priceNum || isNaN(priceNum) || priceNum <= 0) {
      setSubmitError(isHindi ? 'कृपया वैध बिक्री मूल्य दर्ज करें।' : 'Please enter a valid sale price.');
      return;
    }

    const areaNum = parseFloat(formAreaValue) || 1000;
    if (areaNum <= 0) {
      setSubmitError(isHindi ? 'कृपया वैध क्षेत्रफल दर्ज करें।' : 'Please enter a valid area.');
      return;
    }

    const phoneContact = formSellerPhone.trim().replace(/\D/g, '');
    if (phoneContact.length < 10) {
      setSubmitError(isHindi ? 'कृपया वैध 10-अंकीय फ़ोन नंबर दर्ज करें।' : 'Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSubmittingProperty(true);
    setSubmitError(null);

    const unitConfig = getAreaUnitConfig(formAreaUnit);
    const sqftArea = Math.round(areaNum * unitConfig.toSqFt);

    const finalSaleAmenities = [...formAmenities];
    if (formOtherAmenity.trim() && !finalSaleAmenities.includes(formOtherAmenity.trim())) {
      finalSaleAmenities.push(formOtherAmenity.trim());
    }

    const newPropId = `prop-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newProperty: Property = {
      id: newPropId,
      title: formTitle.trim(),
      tagline: `${formCity} ${formPropertyType} • Direct 0% Brokerage`,
      type: formPropertyType,
      category: formCategory,
      price: priceNum,
      priceDisplay: formatIndianPriceHelper(formPrice) || `₹${priceNum.toLocaleString('en-IN')}`,
      location: formLocation.trim() ? `${formLocation.trim()}, ${formCity}` : formCity,
      city: formCity,
      region: ['Nainital', 'Mukteshwar', 'Ranikhet', 'Almora', 'Bhimtal', 'Bhowali', 'Haldwani', 'Kausani'].includes(formCity) ? 'Kumaon' : 'Garhwal',
      areaSqFt: sqftArea,
      areaValue: areaNum,
      areaDisplay: `${formAreaValue} ${getAreaUnitShortLabel(formAreaUnit, isHindi)}`,
      areaUnit: formAreaUnit,
      pricingUnit: 'Total Price',
      configuration: isLandOrPlotProperty({ type: formPropertyType } as any) ? 'Residential Plot' : `${formBedrooms} BHK ${formPropertyType}`,
      bedrooms: isLandOrPlotProperty({ type: formPropertyType } as any) ? 0 : formBedrooms,
      bathrooms: isLandOrPlotProperty({ type: formPropertyType } as any) ? 0 : formBathrooms,
      images: formImages.length > 0 ? formImages : [
        isLandOrPlotProperty({ type: formPropertyType } as any)
          ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      ],
      description: formDescription || `${formTitle} located in scenic ${formCity}, Uttarakhand. Direct owner listing with 0% brokerage.`,
      highlights: [
        '0% Brokerage Direct Listing',
        `${formCity} Prime Location`
      ],
      amenities: finalSaleAmenities,
      furnishing: formFurnishing,
      sellerName: formSellerName.trim() || 'Direct Owner',
      sellerPhone: formSellerPhone.trim(),
      sellerEmail: undefined,
      sellerType: listRole,
      ownerId: currentUser?.id,
      ownerContact: (formSellerPhone.trim() || currentUser?.contact),
      ownerUsername: currentUser?.username,
      isAvailableForRent: false,
      purpose: 'sale',
      createdAt: new Date().toISOString(),
      views: 0,
      inquiries: 0
    };

    try {
      const created = await api.createProperty(newProperty);
      if (onPropertyUploaded) {
        onPropertyUploaded(created || newProperty);
      }
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setFormTitle('');
        setFormPrice('');
        setFormLocation('');
        setFormDescription('');
        setFormImages([]);
        setActiveTab('home');
      }, 1500);
    } catch (err: any) {
      console.error('Property upload error:', err);
      if (onPropertyUploaded) {
        onPropertyUploaded(newProperty);
      }
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('home');
      }, 1500);
    } finally {
      setIsSubmittingProperty(false);
    }
  };

  // Submit Handler for Dedicated Rental GUI
  const handleRentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    if (!rentalTitle.trim()) {
      setSubmitError(isHindi ? 'कृपया रेंटल संपत्ति का शीर्षक दर्ज करें।' : 'Please enter a rental property title.');
      return;
    }

    const numericRent = parseFloat(rentalRentPrice.replace(/[^0-9.]/g, ''));
    if (!numericRent || isNaN(numericRent) || numericRent <= 0) {
      setSubmitError(isHindi ? 'कृपया वैध मासिक/आवधिक किराया राशि दर्ज करें।' : 'Please enter a valid rental amount.');
      return;
    }

    const numericAreaVal = parseFloat(rentalAreaValue) || 1200;
    if (numericAreaVal <= 0) {
      setSubmitError(isHindi ? 'कृपया वैध क्षेत्रफल दर्ज करें।' : 'Please enter a valid area.');
      return;
    }

    const phoneContact = rentalSellerPhone.trim().replace(/\D/g, '');
    if (phoneContact.length < 10) {
      setSubmitError(isHindi ? 'कृपया वैध 10-अंकीय संपर्क फ़ोन नंबर दर्ज करें (अनिवार्य)।' : 'Please enter a valid 10-digit contact phone number (Compulsory).');
      return;
    }

    setIsSubmittingProperty(true);
    setSubmitError(null);

    const unitConfig = getAreaUnitConfig(rentalAreaUnit);
    const sqftArea = Math.round(numericAreaVal * unitConfig.toSqFt);

    const monthlyEquivalent = rentalFrequency === 'month' 
      ? numericRent 
      : rentalFrequency === 'quarter' 
      ? Math.round(numericRent / 3) 
      : Math.round(numericRent / 12);

    const freqLabel = rentalFrequency === 'month' 
      ? (isHindi ? 'माह' : 'month') 
      : rentalFrequency === 'quarter' 
      ? (isHindi ? 'तिमाही' : 'quarter') 
      : (isHindi ? 'वर्ष' : 'year');

    const priceDisp = `₹${numericRent.toLocaleString('en-IN')} / ${freqLabel}`;
    const isLand = rentalCategory === 'Land/Plot';

    let configStr = '';
    if (isLand) {
      configStr = `${rentalAreaValue} ${getAreaUnitShortLabel(rentalAreaUnit, isHindi)} Lease Plot`;
    } else if (rentalSubtype.includes('PG') || rentalSubtype === 'Room') {
      configStr = `${rentalBedrooms > 1 ? `${rentalBedrooms}-Sharing` : 'Single Room'} PG (${rentalFurnishing})`;
    } else if (rentalBedrooms === 0 || rentalSubtype === 'Studio') {
      configStr = `Studio Apartment (${rentalFurnishing})`;
    } else {
      configStr = `${rentalBedrooms} BHK ${rentalSubtype} (${rentalFurnishing})`;
    }

    const mappedCategory: PropertyCategory = rentalCategory === 'Commercial' ? 'Commercial' : isLand ? 'Agriculture' : 'Residential';

    let mappedType: PropertyType = 'Rent/Lease';
    if (['PG', 'Hostel', 'House', 'Villa', 'Flat', 'Apartment', 'Cottage', 'Homestay', 'Studio', 'Penthouse', 'Duplex', 'Farmhouse', 'Shop', 'Showroom', 'Office', 'Hotel', 'Resort', 'Restaurant', 'Cafe', 'Warehouse', 'Plot', 'Land'].includes(rentalSubtype)) {
      mappedType = rentalSubtype as PropertyType;
    }

    const effectiveRentalImages = rentalImages.length > 0 ? rentalImages : [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ];

    const finalRentalAmenities = [
      ...rentalAmenities,
      ...(rentalOtherAmenity.trim() ? [rentalOtherAmenity.trim()] : [])
    ];

    const parsedHighlights = rentalTagline
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newRentalProperty: Property = {
      id: `rental-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: rentalTitle.trim(),
      tagline: parsedHighlights[0] || (isHindi ? 'सत्यापित रेंटल प्रॉपर्टी (0% ब्रोकरेज)' : 'Verified Rental Property (0% Brokerage)'),
      type: mappedType,
      category: mappedCategory,
      price: monthlyEquivalent,
      priceDisplay: priceDisp,
      location: rentalLocation.trim() ? `${rentalLocation.trim()}, ${rentalCity}` : rentalCity,
      city: rentalCity,
      region: ['Nainital', 'Mukteshwar', 'Ranikhet', 'Almora', 'Bhimtal', 'Bhowali', 'Haldwani', 'Kausani'].includes(rentalCity) ? 'Kumaon' : 'Garhwal',
      areaSqFt: sqftArea,
      areaValue: numericAreaVal,
      areaDisplay: `${rentalAreaValue} ${getAreaUnitShortLabel(rentalAreaUnit, isHindi)}`,
      areaUnit: rentalAreaUnit,
      pricingUnit: rentalFrequency === 'month' ? 'Per Month' : rentalFrequency === 'quarter' ? 'Per Quarter' : 'Per Year',
      configuration: configStr,
      bedrooms: isLand || rentalCategory === 'Commercial' ? 0 : rentalBedrooms,
      bathrooms: isLand ? 0 : rentalBathrooms,
      images: effectiveRentalImages,
      videoUrl: rentalVideoUrl.trim() || undefined,
      description: rentalDescription.trim() || (isHindi 
        ? `उत्तराखंड में किराये हेतु उत्तम संपत्ति। सुसज्जित: ${rentalFurnishing}, प्राथमिकता: ${rentalTenantPreferences.join(', ') || 'सभी' }। सुरक्षा जमा: ₹${rentalSecurityDeposit}, रखरखाव: ${rentalMaintenance}। 0% ब्रोकरेज।` 
        : `Well-maintained rental property in ${rentalCity}. Furnishing: ${rentalFurnishing}, Preferred Tenants: ${rentalTenantPreferences.join(', ') || 'All Welcome'}। Security Deposit: ₹${rentalSecurityDeposit}, Maintenance: ${rentalMaintenance}. 0% Brokerage.`),
      highlights: parsedHighlights.length > 0 ? parsedHighlights : [
        '0% Brokerage Rental',
        ...(isLand ? [] : [rentalFurnishing]),
        `Preferred: ${rentalTenantPreferences.join(', ') || 'All Welcome'}`,
        `Deposit: ₹${rentalSecurityDeposit}`
      ],
      amenities: isLand ? [] : finalRentalAmenities,
      furnishing: isLand ? undefined : rentalFurnishing,
      sellerName: rentalSellerName.trim() || 'Property Owner',
      sellerPhone: rentalSellerPhone.trim(),
      sellerEmail: undefined,
      sellerType: rentalRole,
      ownerId: currentUser?.id || `guest-${Date.now()}`,
      ownerContact: (rentalSellerPhone.trim() || currentUser?.contact),
      ownerUsername: (rentalRole === 'Owner' && currentUser?.username) ? currentUser.username : (currentUser?.username || 'Property Owner'),
      isSold: false,
      isAvailableForRent: true,
      purpose: 'rent',
      views: 0,
      inquiries: 0,
      createdAt: new Date().toISOString()
    };

    try {
      const created = await api.createProperty(newRentalProperty);
      if (onPropertyUploaded) {
        onPropertyUploaded(created || newRentalProperty);
      }
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setRentalTitle('');
        setRentalRentPrice('25000');
        setRentalLocation('');
        setRentalDescription('');
        setRentalImages([]);
        setActiveTab('home');
      }, 1500);
    } catch (err: any) {
      console.error('Rental upload error:', err);
      if (onPropertyUploaded) {
        onPropertyUploaded(newRentalProperty);
      }
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('home');
      }, 1500);
    } finally {
      setIsSubmittingProperty(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`w-full min-h-screen ${isDark ? 'dark bg-[#061811] text-slate-100' : 'bg-[#f4f8f5] text-slate-900'} flex flex-col font-sans transition-colors duration-200 select-none`}>


      {/* 1. TOP MOBILE APP HEADER (Consistent across main views) */}
      {!activeDetailProperty && (
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#071f17]/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-emerald-800/80 shadow-xs safe-top">
          <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2 max-w-lg mx-auto w-full h-16">
            
            {/* Logo & Brand: Logo Icon + "Uttarakhand Gateways" Branding (Large & Prominent) */}
            <div className="flex items-center min-w-0">
              <div 
                onClick={() => {
                  setActiveTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2.5 cursor-pointer shrink-0 active:scale-95 transition-transform min-w-0"
                title="Uttarakhand Gateways"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#04210d] dark:bg-[#02120c] border border-emerald-500/40 shadow-md flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  <img src="/logo.png" alt="Uttarakhand Gateways" className="w-full h-full object-contain filter drop-shadow-xs" />
                </div>
                <div className="flex flex-col justify-center leading-none min-w-0">
                  <span className="font-serif-luxury font-black text-[16px] sm:text-[18px] tracking-tight text-[#0a271c] dark:text-emerald-50 whitespace-nowrap">
                    Uttarakhand Gateways
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.24em] font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                    Real Estate
                  </span>
                </div>
              </div>
            </div>

            {/* Header Right Actions: Location Tab, Refresh, Menu Drawer Trigger */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Tap to Change Location (Shifted beside Menu) */}
              <button
                type="button"
                onClick={() => setShowCitySheet(true)}
                className="inline-flex items-center gap-1 text-[10.5px] sm:text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-50/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-800 active:scale-95 transition-all cursor-pointer shadow-xs shrink-0"
              >
                <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate max-w-[65px] sm:max-w-[80px]">{selectedCity === 'All' ? (isHindi ? 'उत्तराखंड' : 'All UK') : selectedCity}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 rotate-90 shrink-0" />
              </button>

              {/* Instant Refresh Button */}
              <button
                type="button"
                onClick={handleTriggerRefresh}
                className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200/90 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer"
                title={isHindi ? 'ताज़ा करें' : 'Refresh'}
                aria-label="Refresh Properties"
              >
                <RotateCw className={`w-4 h-4 stroke-[2.2] ${isRefreshing ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
              </button>

              {/* Menu Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200/90 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 flex items-center justify-center shadow-xs active:scale-95 transition-all cursor-pointer relative"
                title={isHindi ? 'मेन्यू' : 'Menu'}
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5 stroke-[2.2]" />
                {unreadInboxCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                    {unreadInboxCount}
                  </span>
                )}
              </button>
            </div>

          </div>
        </header>
      )}

      {/* 2. MAIN CONTENT CONTAINER (Directly below header with natural flow, no banner) */}
      <main className="flex-1 pb-nav max-w-lg mx-auto w-full">

        {/* ======================================================== */}
        {/* TAB 1: HOME SCREEN (Homepage & Featured Properties)     */}
        {/* ======================================================== */}
        {activeTab === 'home' && !activeDetailProperty && (
          <div className="space-y-4 pt-3">
            
            {/* Search Bar with quick filter trigger */}
            <div className="px-4">
              <div className="relative flex items-center h-11">
                <Search className="w-4 h-4 absolute left-3.5 text-emerald-600 dark:text-emerald-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery) setActiveTab('explore');
                  }}
                  placeholder={isHindi ? 'मसूरी, मुक्तेश्वर, कॉटेज, प्लॉट खोजें...' : 'Search Mussoorie, Mukteshwar, plots, villas...'}
                  className="w-full h-full pl-10 pr-11 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200 dark:border-emerald-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs transition-all"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                    }}
                    className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowFilterSheet(true)}
                    className="absolute right-2 p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 active:scale-95 transition-all cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Category Chips with Consistent Lucide Icons (No emojis) */}
            <div className="overflow-x-auto scrollbar-none px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex items-center gap-1.5 min-w-max pb-1">
                {[
                  { id: 'All', label: isHindi ? 'सभी' : 'All', icon: Compass },
                  { id: 'Plot', label: isHindi ? 'प्लॉट / जमीन' : 'Plots & Land', icon: Mountain },
                  { id: 'Flat', label: isHindi ? 'फ्लैट्स' : 'Flats & Apts', icon: Building2 },
                  { id: 'Cottage', label: isHindi ? 'कॉटेज व विला' : 'Cottages & Villas', icon: Home },
                  { id: 'rent', label: isHindi ? 'किराया' : 'Rent / Lease', icon: Key },
                  { id: 'Commercial', label: isHindi ? 'व्यावसायिक' : 'Commercial', icon: Building2 },
                ].map((chip) => {
                  const isActive = selectedCategory === chip.id;
                  const IconComp = chip.icon;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(chip.id);
                        setActiveTab('explore');
                      }}
                      className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer shrink-0 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-emerald-700/30 ring-1 ring-emerald-400'
                          : 'bg-white dark:bg-[#0a281d] text-slate-700 dark:text-emerald-200 border border-emerald-200/90 dark:border-emerald-800 hover:border-emerald-400'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5 shrink-0" />
                      <span>{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick App Launcher (3 Wide & Long Action Buttons) */}
            <div className="px-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                
                {/* 1. Buy */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setActiveTab('explore');
                  }}
                  className="h-12 w-full rounded-xl bg-white dark:bg-[#071f17] border border-emerald-200/90 dark:border-emerald-800/80 text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-[13px] shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 active:scale-95 transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/90 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BuyHouseIcon className="w-4 h-4" strokeWidth={2.2} />
                  </div>
                  <span className="leading-none">{isHindi ? 'खरीदें' : 'Buy'}</span>
                </button>

                {/* 2. Rent */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('rent');
                    setActiveTab('explore');
                  }}
                  className="h-12 w-full rounded-xl bg-white dark:bg-[#071f17] border border-emerald-200/90 dark:border-emerald-800/80 text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-[13px] shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 active:scale-95 transition-all cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/90 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Key className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="leading-none">{isHindi ? 'किराया' : 'Rent'}</span>
                </button>

                {/* 3. Post Ad (with FREE badge) */}
                <button
                  type="button"
                  onClick={() => {
                    requireAuth(() => setActiveTab('list'), isHindi ? 'विज्ञापन देने हेतु लॉगिन करें।' : 'Please sign in to post an ad.');
                  }}
                  className="relative h-12 w-full rounded-xl bg-white dark:bg-[#071f17] border border-emerald-200/90 dark:border-emerald-800/80 text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-[13px] shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 active:scale-95 transition-all cursor-pointer group"
                >
                  <span className="absolute -top-2 -right-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-slate-950 font-black text-[9px] sm:text-[9.5px] tracking-wider uppercase shadow-sm border border-yellow-200 dark:border-amber-400/50">
                    FREE
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/90 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <PlusCircle className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <span className="leading-none">{isHindi ? 'विज्ञापन दें' : 'Post Ad'}</span>
                </button>

              </div>
            </div>

            {/* FEATURED PROPERTIES SECTION (Zero artificial spacing, hidden if empty) */}
            {featuredProperties.length > 0 && (
              <div className="space-y-2">
                <div className="px-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif-luxury font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
                      <span>{isHindi ? 'फीचर्ड संपत्तियां' : 'Featured Properties'}</span>
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {isHindi ? 'डायरेक्ट ओनर लिस्टिंग्स • 0% ब्रोकरेज' : 'Direct owner listings • 0% brokerage'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('explore')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 active:scale-95 cursor-pointer shrink-0"
                  >
                    <span>{isHindi ? 'सभी देखें' : 'See all'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <TrendingCarousel
                  properties={featuredProperties}
                  onSelectProperty={(p) => {
                    setActiveDetailProperty(p);
                    if (onSelectProperty) onSelectProperty(p);
                  }}
                  favorites={favorites}
                  onToggleFavorite={onToggleFavorite}
                  currentUser={currentUser}
                  onDeleteProperty={onDeleteProperty}
                  onToggleSold={onToggleSold}
                  onEditProperty={onEditProperty}
                  onOpenActionMenu={(p) => setSelectedActionProperty(p)}
                />
              </div>
            )}

            {/* RECENTLY ADDED PROPERTIES */}
            {recentlyAddedProperties.length > 0 && (
              <div className="space-y-2.5 px-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-luxury font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{isHindi ? 'हाल ही में जोड़ी गई संपत्तियां' : 'Recently Added Properties'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('newest');
                      setActiveTab('explore');
                    }}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 active:scale-95 cursor-pointer shrink-0"
                  >
                    <span>{isHindi ? 'सभी देखें' : 'View new'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {recentlyAddedProperties.slice(0, 3).map((prop) => {
                    const isOwner = isPropertyOwner(prop, currentUser);
                    return (
                    <div
                      key={prop.id}
                      onClick={() => {
                        setActiveDetailProperty(prop);
                        if (onSelectProperty) onSelectProperty(prop);
                      }}
                      className={`bg-white dark:bg-[#0a281d] rounded-2xl p-2.5 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs flex gap-3 cursor-pointer active:scale-[0.99] transition-transform relative ${
                        activeCardMenuId === `recent-${prop.id}` ? 'z-50' : 'z-0'
                      }`}
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-900 relative">
                        <img 
                          src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'} 
                          alt={prop.title} 
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {prop.city}
                        </span>
                        {prop.isSold && (
                          <div className="absolute inset-0 bg-rose-950/70 backdrop-blur-xs flex items-center justify-center">
                            <span className="text-[9px] font-black uppercase text-white bg-rose-600 px-1.5 py-0.5 rounded shadow-xs">
                              {isHindi ? 'बिक चुकी' : 'Sold'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                (prop.type === 'Rent/Lease' || prop.purpose === 'rent' || prop.isAvailableForRent || (prop.priceDisplay && prop.priceDisplay.toLowerCase().includes('/ month')))
                                  ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}>
                                {(prop.type === 'Rent/Lease' || prop.purpose === 'rent' || prop.isAvailableForRent || (prop.priceDisplay && prop.priceDisplay.toLowerCase().includes('/ month'))) ? 'Rent' : 'Sale'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                                {prop.type}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400">
                              {formatPostTime(prop.createdAt || prop.postedAt)}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                            {prop.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{prop.location || prop.city}</span>
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-emerald-950">
                          <span className="text-sm font-black text-emerald-800 dark:text-white">
                            {prop.priceDisplay || `₹${prop.price}`}
                          </span>
                          <div className="flex items-center gap-1">
                            {/* Three Dots Owner Action Menu */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedActionProperty(prop);
                              }}
                              className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer active:scale-95 transition-colors"
                              title={isHindi ? 'विकल्प (एडिट / सोल्ड / डिलीट)' : 'Options (Edit / Sold / Delete)'}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(prop.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${favorites.includes(prop.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {/* POPULAR LOCATIONS IN UTTARAKHAND */}
            <div className="space-y-2.5 px-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-luxury font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{isHindi ? 'उत्तराखंड के लोकप्रिय स्थान' : 'Popular Locations in Uttarakhand'}</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isHindi ? 'स्थान पर टैप कर संपत्तियां देखें' : 'Tap on any location to browse properties'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {DESTINATIONS_INFO.slice(0, 6).map((dest) => {
                  const count = properties.filter((p) => p.city?.toLowerCase() === dest.name.toLowerCase()).length;
                  return (
                    <div
                      key={dest.name}
                      onClick={() => handleCitySelect(dest.name)}
                      className="group relative h-28 rounded-2xl overflow-hidden shadow-xs border border-emerald-300/40 dark:border-emerald-800/60 cursor-pointer active:scale-95 transition-transform"
                    >
                      <img 
                        src={dest.image} 
                        alt={dest.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-2.5 text-white">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif-luxury font-bold text-sm tracking-tight leading-tight">
                            {dest.name}
                          </h4>
                          <span className="text-[9px] font-bold bg-emerald-600/90 px-1.5 py-0.5 rounded-full">
                            {count} listings
                          </span>
                        </div>
                        <span className="text-[9px] text-emerald-300 line-clamp-1 mt-0.5 font-medium">
                          {dest.elevation}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DEDICATED LAND & PLOTS SECTION (Horizontal mobile snap carousel) */}
            {properties.some((p) => isLandOrPlotProperty(p)) && (
              <div className="space-y-1">
                <LandPlotsSection
                  properties={properties}
                  onSelectProperty={(p) => {
                    setActiveDetailProperty(p);
                    if (onSelectProperty) onSelectProperty(p);
                  }}
                  favorites={favorites}
                  onToggleFavorite={onToggleFavorite}
                  currentUser={currentUser}
                  onDeleteProperty={onDeleteProperty}
                  onToggleSold={onToggleSold}
                  onEditProperty={onEditProperty}
                  onOpenActionMenu={(p) => setSelectedActionProperty(p)}
                  onViewAll={() => {
                    setSelectedCategory('Plot');
                    setActiveTab('explore');
                  }}
                  onListLandClick={() => {
                    requireAuth(() => setActiveTab('list'), isHindi ? 'जमीन लिस्ट करने हेतु लॉगिन करें।' : 'Please sign in to list land.');
                  }}
                />
              </div>
            )}

            {/* AREA CALCULATOR & HOME LOAN TOOLS */}
            <div id="calculator-section" className="space-y-4 pt-1">
              <StandaloneLandCalculator compact={true} />

              {/* HOME LOAN / EMI CALCULATOR BANNER (Directly below Area Calculator) */}
              <HomeLoanBanner 
                compact={true} 
                onOpenEligibility={() => {
                  if (onOpenEmiCalculator) onOpenEmiCalculator(5000000);
                }}
                onOpenBankOffers={() => {
                  if (onOpenEmiCalculator) onOpenEmiCalculator(5000000);
                }}
              />
            </div>

            {/* Platform Branding Notice */}
            <div className="text-center pt-2 pb-6 space-y-1">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Uttarakhand Gateways Mobile Companion App v2.0
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                100% Authentic • 0% Brokerage • Uttarakhand, India
              </p>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: EXPLORE SCREEN (Dedicated Discovery & Filters)     */}
        {/* ======================================================== */}
        {activeTab === 'explore' && !activeDetailProperty && (
          <div className="space-y-3.5 pt-3">
            
            {/* Search Input Bar */}
            <div className="px-4">
              <div className="relative flex items-center h-11">
                <Search className="w-4 h-4 absolute left-3.5 text-emerald-600 dark:text-emerald-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isHindi ? 'स्थान, कॉलोनी, प्रोजेक्ट खोजें...' : 'Search location, project, colony, villa...'}
                  className="w-full h-full pl-10 pr-11 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200 dark:border-emerald-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowFilterSheet(true)}
                    className="absolute right-2 p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Pills Row (Horizontal Scroll) */}
            <div className="overflow-x-auto scrollbar-none px-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="flex items-center gap-1.5 min-w-max pb-1">
                {/* City Pill */}
                <button
                  type="button"
                  onClick={() => setShowCitySheet(true)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    selectedCity !== 'All'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-[#0a281d] text-slate-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{selectedCity === 'All' ? (isHindi ? 'स्थान' : 'Location') : selectedCity}</span>
                </button>

                {/* Category Pills */}
                {['All', 'Plot', 'Flat', 'Cottage', 'rent'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-[#0a281d] text-slate-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {cat === 'All' ? (isHindi ? 'सभी' : 'All') : cat === 'rent' ? (isHindi ? 'किराया' : 'Rent') : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Header with Sorting */}
            <div className="px-3.5 flex items-center justify-between text-xs text-slate-600 dark:text-emerald-200">
              <span className="font-bold">
                {isHindi 
                  ? `उपलब्ध संपत्तियां (${filteredProperties.length})` 
                  : `Properties (${filteredProperties.length})`}
              </span>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="text-[11px] font-bold bg-white dark:bg-[#0a281d] border border-emerald-200 dark:border-emerald-800 rounded-xl px-2.5 py-1 text-slate-700 dark:text-emerald-200 focus:outline-none cursor-pointer"
              >
                <option value="featured">{isHindi ? 'फीचर्ड' : 'Featured'}</option>
                <option value="price-low">{isHindi ? 'मूल्य: कम से ज्यादा' : 'Price: Low to High'}</option>
                <option value="price-high">{isHindi ? 'मूल्य: ज्यादा से कम' : 'Price: High to Low'}</option>
                <option value="newest">{isHindi ? 'नवीनतम' : 'Newest First'}</option>
              </select>
            </div>

            {/* Active Filters Clear Bar */}
            {(selectedCity !== 'All' || selectedCategory !== 'All' || searchQuery || budgetFilter !== 'all') && (
              <div className="px-3.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold">{isHindi ? 'सक्रिय फिल्टर:' : 'Active:'}</span>
                {selectedCity !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    {selectedCity}
                    <button type="button" onClick={() => setSelectedCity('All')} className="cursor-pointer">×</button>
                  </span>
                )}
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    {selectedCategory}
                    <button type="button" onClick={() => setSelectedCategory('All')} className="cursor-pointer">×</button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[10px] text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer ml-1"
                >
                  {isHindi ? 'सभी हटाएं' : 'Clear All'}
                </button>
              </div>
            )}

            {/* VERTICAL PROPERTY FEED */}
            <div className="px-3.5 space-y-3.5">
              {isLoading && properties.length === 0 ? (
                /* Shimmer Skeletons */
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-[#0a281d] rounded-3xl overflow-hidden border border-emerald-200/80 dark:border-emerald-800/80 p-3 space-y-3">
                      <div className="h-44 bg-slate-200 dark:bg-emerald-950/80 rounded-2xl" />
                      <div className="h-4 bg-slate-200 dark:bg-emerald-950/80 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 dark:bg-emerald-950/40 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : loadError && properties.length === 0 ? (
                /* Error State */
                <div className="p-8 text-center bg-white dark:bg-[#0a281d] rounded-3xl border border-rose-200 dark:border-rose-900 space-y-3">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {isHindi ? 'डेटा लोड करने में असमर्थ' : 'Unable to load properties'}
                  </h4>
                  <p className="text-xs text-slate-500">{loadError}</p>
                  {onRetryLoad && (
                    <button
                      type="button"
                      onClick={onRetryLoad}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm cursor-pointer"
                    >
                      {isHindi ? 'पुनः प्रयास करें' : 'Retry'}
                    </button>
                  )}
                </div>
              ) : filteredProperties.length === 0 ? (
                /* Empty Filter State */
                <div className="p-8 text-center bg-white dark:bg-[#0a281d] rounded-3xl border border-emerald-200 dark:border-emerald-800 space-y-3 my-4">
                  <RotateCcw className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {isHindi ? 'कोई संपत्ति नहीं मिली' : 'No properties match your filters'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isHindi ? 'स्थान बदलें या फ़िल्टर रीसेट करें।' : 'Try adjusting your search query, budget range, or location.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm cursor-pointer"
                  >
                    {isHindi ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
                  </button>
                </div>
              ) : (
                /* Vertical Card Listing */
                filteredProperties.map((prop) => {
                  const isLand = isLandOrPlotProperty(prop);
                  const fallback = isLand
                    ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
                    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80';
                  const coverImage = prop.images?.[0] || fallback;
                  const isFav = favorites.includes(prop.id);
                  const isOwner = isPropertyOwner(prop, currentUser);
                  const isForRent =
                    prop.type === 'Rent/Lease' ||
                    prop.purpose === 'rent' ||
                    Boolean(prop.isAvailableForRent) ||
                    (Boolean(prop.priceDisplay) && prop.priceDisplay.toLowerCase().includes('/ month'));

                  return (
                    <div
                      key={prop.id}
                      onClick={() => {
                        setActiveDetailProperty(prop);
                        if (onSelectProperty) onSelectProperty(prop);
                      }}
                      className={`bg-white dark:bg-[#0a281d] rounded-3xl border border-emerald-200/90 dark:border-emerald-800/80 shadow-md active:scale-[0.99] transition-transform cursor-pointer relative ${
                        activeCardMenuId === `explore-${prop.id}` ? 'z-50' : 'z-0'
                      }`}
                    >
                      {/* Property Image Container */}
                      <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                        <img
                          src={coverImage}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                        {/* Sold Out Banner */}
                        {prop.isSold && (
                          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 bg-rose-600/95 text-white text-center font-black py-1.5 tracking-widest text-xs uppercase shadow-xl backdrop-blur-xs z-10 border-y border-rose-400 pointer-events-none">
                            {isHindi ? '⚠️ बिक चुकी है (SOLD OUT)' : '⚠️ SOLD OUT'}
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-md flex items-center gap-1 border ${
                              isForRent 
                                ? 'bg-teal-600/95 border-teal-300' 
                                : 'bg-emerald-600/95 border-emerald-300'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
                              <span>{isForRent ? (isHindi ? 'Rent (किराया)' : 'Rent') : (isHindi ? 'Sale (बिक्री)' : 'Sale')}</span>
                            </span>

                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-white shadow-xs backdrop-blur-xs border border-white/20">
                              {prop.type || 'Property'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 pointer-events-auto">
                            {/* Three Dots Owner Action Menu */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedActionProperty(prop);
                              }}
                              className="w-8 h-8 rounded-full backdrop-blur-md bg-black/60 hover:bg-black/80 text-white border border-white/25 transition-transform active:scale-90 cursor-pointer shadow-md flex items-center justify-center"
                              title={isHindi ? 'विकल्प (एडिट / सोल्ड / डिलीट)' : 'Options (Edit / Sold / Delete)'}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(prop.id);
                              }}
                              className={`w-8 h-8 rounded-full backdrop-blur-md transition-transform active:scale-90 cursor-pointer flex items-center justify-center ${
                                isFav ? 'bg-rose-500 text-white' : 'bg-black/40 text-white hover:bg-black/60 border border-white/20'
                              }`}
                            >
                              <Bookmark className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Bottom Image Info */}
                        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white pointer-events-none">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-300 block">
                              📍 {prop.city}
                            </span>
                            <span className="text-xl font-black drop-shadow-md">
                              {prop.priceDisplay || `₹${Number(prop.price).toLocaleString('en-IN')}`}
                            </span>
                          </div>
                          {formatPropertyRate(prop, isHindi) && (
                            <span className="text-[10px] font-bold bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs border border-white/20">
                              {formatPropertyRate(prop, isHindi)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-3.5 space-y-2.5">
                        <h4 className="font-serif-luxury font-bold text-sm text-slate-900 dark:text-white line-clamp-1 leading-snug">
                          {prop.title}
                        </h4>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{prop.location || prop.city}</span>
                        </div>

                        {/* Specs Chips */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-300 flex-wrap">
                          {(prop.configuration || (prop.bedrooms ? `${prop.bedrooms} BHK` : null)) && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold">
                              {prop.configuration || `${prop.bedrooms} BHK`}
                            </span>
                          )}
                          {formatPropertyArea(prop, isHindi) && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold">
                              {formatPropertyArea(prop, isHindi)}
                            </span>
                          )}
                        </div>

                        {/* Owner & Action Footer */}
                        <div className="pt-2 border-t border-slate-100 dark:border-emerald-950 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px] flex items-center justify-center shrink-0">
                              {(getPropertyOwnerDisplayName(prop, currentUser) || 'O').charAt(0).toUpperCase()}
                            </span>
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                              {getPropertyOwnerDisplayName(prop, currentUser) || 'Direct Owner'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              requireAuth(() => onStartChat(prop), isHindi ? 'मालिक से चैट करने हेतु लॉगिन करें।' : 'Please sign in to chat with owner.');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>{isHindi ? 'चैट' : 'Chat'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SAVED SCREEN (Wishlist & Shortlisted Properties)  */}
        {/* ======================================================== */}
        {activeTab === 'saved' && !activeDetailProperty && (
          <div className="space-y-4 pt-3 px-3.5">
            <div className="space-y-1">
              <h2 className="font-serif-luxury font-bold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                <span>{isHindi ? 'सहेजी गई संपत्तियां' : 'Saved Properties'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                  {savedPropertiesList.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isHindi ? 'आपकी पसंदीदा संपत्तियां एक ही स्थान पर' : 'Your personal property shortlist'}
              </p>
            </div>

            {savedPropertiesList.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0a281d] rounded-3xl border border-emerald-200 dark:border-emerald-800 space-y-4 my-6">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Bookmark className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {isHindi ? 'कोई सहेजी गई संपत्ति नहीं है' : 'No Saved Properties Yet'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    {isHindi 
                      ? 'किसी भी संपत्ति कार्ड पर बुकमार्क आइकन दबाकर अपनी पसंदीदा सूची तैयार करें।' 
                      : 'Tap the bookmark icon on any property to save it here for quick access and comparison.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('explore')}
                  className="px-6 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30 active:scale-95 cursor-pointer"
                >
                  {isHindi ? 'संपत्तियां खोजें' : 'Discover Properties'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedPropertiesList.map((prop) => {
                  const isOwner = isPropertyOwner(prop, currentUser);
                  return (
                  <div
                    key={prop.id}
                    onClick={() => {
                      setActiveDetailProperty(prop);
                      if (onSelectProperty) onSelectProperty(prop);
                    }}
                    className={`bg-white dark:bg-[#0a281d] rounded-2xl p-3 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs flex gap-3 cursor-pointer active:scale-[0.99] transition-transform relative ${
                      activeCardMenuId === `saved-${prop.id}` ? 'z-50' : 'z-0'
                    }`}
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-900 relative">
                      <img 
                        src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'} 
                        alt={prop.title} 
                        className="w-full h-full object-cover" 
                      />
                      <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {prop.city}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              (prop.type === 'Rent/Lease' || prop.purpose === 'rent' || prop.isAvailableForRent || (prop.priceDisplay && prop.priceDisplay.toLowerCase().includes('/ month')))
                                ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}>
                              {(prop.type === 'Rent/Lease' || prop.purpose === 'rent' || prop.isAvailableForRent || (prop.priceDisplay && prop.priceDisplay.toLowerCase().includes('/ month'))) ? 'Rent' : 'Sale'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                              {prop.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Three Dots Owner Action Menu */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedActionProperty(prop);
                              }}
                              className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer active:scale-95 transition-colors"
                              title={isHindi ? 'विकल्प (एडिट / सोल्ड / डिलीट)' : 'Options (Edit / Sold / Delete)'}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(prop.id);
                              }}
                              className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                              title="Remove from saved"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                          {prop.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{prop.location || prop.city}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-emerald-950">
                        <span className="text-sm font-black text-emerald-800 dark:text-white">
                          {prop.priceDisplay || `₹${prop.price}`}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <span>{isHindi ? 'विवरण' : 'Details'}</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: LIST PROPERTY SCREEN (Unified Master GUI)         */}
        {/* ======================================================== */}
        {activeTab === 'list' && !activeDetailProperty && (
          <div className="pt-2 pb-24 px-1 sm:px-3">
            <UnifiedListingModal
              isPageMode={true}
              isOpen={true}
              mode={listType === 'rent' ? 'create-rent' : 'create-sale'}
              onClose={() => onTabChange('home')}
              onPropertySaved={(saved) => {
                if (onPropertyUploaded) onPropertyUploaded(saved);
                onTabChange('home');
              }}
              onOpenLegalPolicy={onOpenLegalPolicy}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: PROFILE & 100% REAL ANALYTICS SCREEN             */}
        {/* ======================================================== */}
        {(activeTab === 'profile' || activeTab === 'analytics') && !activeDetailProperty && (
          <div className="space-y-4 pt-3 px-3.5">
            
            {/* User Profile Card */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0a281d] border border-emerald-200/90 dark:border-emerald-800/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shrink-0 uppercase shadow-xs">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    (currentUser?.username || 'G').charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {currentUser?.username || (isHindi ? 'अतिथि उपयोगकर्ता' : 'Guest Explorer')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.contact || (isHindi ? 'खाता बनाएं या लॉगिन करें' : 'Sign in to access your dashboard')}
                  </p>
                  {currentUser && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase mt-0.5">
                      ✓ {currentUser.role === 'admin' ? 'Platform Administrator' : 'Direct Verified Account'}
                    </span>
                  )}
                </div>
              </div>

              {!currentUser ? (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-xs active:scale-95 cursor-pointer shrink-0"
                >
                  {isHindi ? 'लॉगिन' : 'Sign In'}
                </button>
              ) : null}
            </div>

            {/* Quick Stats Strip (if authenticated) */}
            {currentUser && (
              <div className="grid grid-cols-3 gap-2">
                <div 
                  onClick={() => setActiveTab('saved')}
                  className="p-3 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200/80 dark:border-emerald-800/80 text-center cursor-pointer active:scale-95 transition-transform"
                >
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-400 block">
                    {favorites.length}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {isHindi ? 'सहेजे' : 'Saved'}
                  </span>
                </div>

                <div 
                  onClick={() => setProfileSubTab('listings')}
                  className={`p-3 rounded-2xl border text-center cursor-pointer active:scale-95 transition-transform ${
                    profileSubTab === 'listings' && activeTab !== 'analytics'
                      ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500'
                      : 'bg-white dark:bg-[#0a281d] border-emerald-200/80 dark:border-emerald-800/80'
                  }`}
                >
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-400 block">
                    {myListings.length}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {isHindi ? 'मेरी लिस्टिंग' : 'My Listings'}
                  </span>
                </div>

                <div 
                  onClick={() => {
                    if (onOpenInbox) onOpenInbox();
                  }}
                  className="p-3 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200/80 dark:border-emerald-800/80 text-center cursor-pointer active:scale-95 transition-transform"
                >
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-400 block">
                    {unreadInboxCount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    {isHindi ? 'संदेश' : 'Enquiries'}
                  </span>
                </div>
              </div>
            )}

            {/* SUB-TAB TOGGLE: My Listings vs 100% Real Analytics */}
            {currentUser && (
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-[#071f16] border border-emerald-200/60 dark:border-emerald-900/60">
                <button
                  type="button"
                  onClick={() => setProfileSubTab('listings')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    (profileSubTab === 'listings' && activeTab !== 'analytics')
                      ? 'bg-white dark:bg-[#0a281d] text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{isHindi ? `मेरी संपत्तियां (${myListings.length})` : `My Listings (${myListings.length})`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileSubTab('analytics')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    (profileSubTab === 'analytics' || activeTab === 'analytics')
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>{isHindi ? '100% वास्तविक आंकड़े' : '100% Real Analytics'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW A: 100% REAL ANALYTICS VIEW                         */}
            {/* ======================================================== */}
            {(profileSubTab === 'analytics' || activeTab === 'analytics') ? (
              <div className="space-y-3">
                {/* Real Analytics Header Badge */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-md border border-emerald-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 text-[10px] font-black uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      100% Direct Real Data
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold">
                      Supabase PostgreSQL Verified
                    </span>
                  </div>
                  <h4 className="font-serif-luxury font-black text-sm text-white">
                    {isHindi ? 'आपकी संपत्तियों का सीधा प्रदर्शन' : 'Listing Performance Dashboard'}
                  </h4>
                  <p className="text-[11px] text-emerald-200/90 mt-0.5 leading-snug">
                    {isHindi 
                      ? 'ये आंकड़े केवल वास्तविक खरीदार व्यूज, पूछताछ और शेयर से लिए गए हैं। 0% सिमुलेशन।'
                      : 'Live direct metrics from real verified buyers and visitors. Exactly zero fake or multiplied numbers.'}
                  </p>
                </div>

                {!currentUser ? (
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200/80 dark:border-emerald-800/80 text-center space-y-2">
                    <BarChart3 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                      {isHindi ? 'वास्तविक आंकड़े देखने के लिए साइन इन करें' : 'Sign in to view real analytics'}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isHindi ? 'अपने लिस्टिंग्स के दृश्य, पूछताछ और रूपांतरण दर लाइव ट्रैक करें।' : 'Track live verified views, buyer inquiries, and conversions for your properties.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-xs active:scale-95 cursor-pointer"
                    >
                      {isHindi ? 'लॉगिन / साइन अप' : 'Sign In / Register'}
                    </button>
                  </div>
                ) : (
                  <>
                    {/* 4 Real Metric KPI Cards */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200/80 dark:border-emerald-800/80">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                          <span className="text-[11px] font-bold">{isHindi ? 'कुल वास्तविक व्यूज' : 'Total Views'}</span>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {realAnalytics.totalViews.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                          {isHindi ? 'सत्यापित विज़िटर' : 'Verified visits'}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200/80 dark:border-emerald-800/80">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                          <span className="text-[11px] font-bold">{isHindi ? 'सीधी पूछताछ' : 'Buyer Inquiries'}</span>
                          <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                        </div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {realAnalytics.totalInquiries.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400">
                          {isHindi ? 'सीधे खरीदार चैट/कॉल' : 'Direct buyer chats'}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200/80 dark:border-emerald-800/80">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                          <span className="text-[11px] font-bold">{isHindi ? 'शेयर संख्या' : 'Total Shares'}</span>
                          <Share2 className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {realAnalytics.totalShares.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">
                          {isHindi ? 'सोशल व व्हाट्सएप' : 'WhatsApp & social'}
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200/80 dark:border-emerald-800/80">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                          <span className="text-[11px] font-bold">{isHindi ? 'रूपांतरण दर' : 'Inquiry Rate'}</span>
                          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <div className="text-xl font-black text-slate-900 dark:text-white">
                          {realAnalytics.conversionRate}%
                        </div>
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                          {isHindi ? 'व्यू से पूछताछ' : 'Views to leads'}
                        </span>
                      </div>
                    </div>

                    {/* Listing Status Summary Strip */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#071f16] border border-slate-200 dark:border-emerald-900/60 text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {isHindi ? 'सक्रिय संपत्तियां:' : 'Active listings:'}{' '}
                        <b className="text-emerald-600 dark:text-emerald-400">{realAnalytics.activeCount}</b>
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {isHindi ? 'बिक चुकी:' : 'Marked sold:'}{' '}
                        <b className="text-amber-600 dark:text-amber-400">{realAnalytics.soldCount}</b>
                      </span>
                    </div>

                    {/* Per-Listing Real Breakdown */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isHindi ? 'प्रत्येक संपत्ति का विवरण' : 'Per-Listing Real Metrics'}</span>
                        </h5>
                        <span className="text-[10px] text-slate-500 font-bold">
                          {myListings.length} {isHindi ? 'लिस्टिंग्स' : 'listed'}
                        </span>
                      </div>

                      {myListings.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200/70 dark:border-emerald-800/70 text-center space-y-2">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {isHindi ? 'आपने अभी तक कोई संपत्ति पोस्ट नहीं की है।' : 'You have not listed any properties yet.'}
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab('list')}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs active:scale-95 cursor-pointer"
                          >
                            + {isHindi ? 'मुफ्त लिस्टिंग जोड़ें' : 'Post Free Listing'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {myListings.map((prop) => {
                            const propViews = prop.views || 0;
                            const propInquiries = prop.inquiries || 0;
                            const propShares = prop.shares || 0;
                            return (
                              <div
                                key={`analytics-${prop.id}`}
                                className="p-3 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs space-y-2"
                              >
                                <div 
                                  onClick={() => setActiveDetailProperty(prop)}
                                  className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                                >
                                  <img 
                                    src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80'} 
                                    alt={prop.title} 
                                    className="w-12 h-12 rounded-xl object-cover shrink-0" 
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-1">
                                      <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                        {prop.title}
                                      </h5>
                                      <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-black uppercase shrink-0 ${
                                        prop.isSold ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                      }`}>
                                        {prop.isSold ? 'Sold' : 'Active'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                        (prop.type === 'Rent/Lease' || prop.purpose === 'rent' || prop.isAvailableForRent || (prop.priceDisplay && prop.priceDisplay.toLowerCase().includes('/ month')))
                                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      }`}>
                                        {(prop.type === 'Rent/Lease' || prop.purpose === 'rent' || prop.isAvailableForRent || (prop.priceDisplay && prop.priceDisplay.toLowerCase().includes('/ month'))) ? 'Rent' : 'Sale'}
                                      </span>
                                      <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        {prop.type}
                                      </span>
                                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                        {prop.priceDisplay || `₹${prop.price}`} • {prop.city}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* 3 Real Metrics Strip for this Property */}
                                <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-slate-100 dark:border-emerald-950 text-center">
                                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-emerald-950/40">
                                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                                      {propViews}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                      {isHindi ? 'व्यूज' : 'Views'}
                                    </span>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-emerald-950/40">
                                    <span className="text-xs font-black text-teal-600 dark:text-teal-400 block">
                                      {propInquiries}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                      {isHindi ? 'पूछताछ' : 'Inquiries'}
                                    </span>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-emerald-950/40">
                                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">
                                      {propShares}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                      {isHindi ? 'शेयर' : 'Shares'}
                                    </span>
                                  </div>
                                </div>

                                {/* Quick actions */}
                                <div className="flex items-center justify-end gap-2 pt-1 text-[11px]">
                                  <button
                                    type="button"
                                    onClick={() => onEditProperty(prop)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:text-emerald-600 cursor-pointer flex items-center gap-1"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>{isHindi ? 'संपादित करें' : 'Edit'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActiveDetailProperty(prop)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold cursor-pointer flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>{isHindi ? 'देखें' : 'View'}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* ======================================================== */
              /* VIEW B: MY LISTINGS VIEW (Standard)                      */
              /* ======================================================== */
              currentUser && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif-luxury font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span>{isHindi ? 'मेरी संपत्तियां (My Properties)' : 'My Properties'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 active:scale-95 cursor-pointer"
                    >
                      <span>+ {isHindi ? 'नई जोड़ें' : 'Add New'}</span>
                    </button>
                  </div>

                  {myListings.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200/70 dark:border-emerald-800/70 text-center space-y-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isHindi ? 'आपने अभी तक कोई संपत्ति लिस्ट नहीं की है।' : 'You have not listed any properties yet.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('list')}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs active:scale-95 cursor-pointer"
                      >
                        {isHindi ? 'मुफ्त लिस्टिंग बनाएं' : 'List Property FREE'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {myListings.map((prop) => (
                        <div
                          key={prop.id}
                          className="p-3 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs flex items-center justify-between gap-3"
                        >
                          <div 
                            onClick={() => setActiveDetailProperty(prop)}
                            className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                          >
                            <img 
                              src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80'} 
                              alt={prop.title} 
                              className="w-12 h-12 rounded-xl object-cover shrink-0" 
                            />
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {prop.title}
                              </h5>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                  (prop.type === 'Rent/Lease' || prop.purpose === 'rent' || prop.isAvailableForRent || (prop.priceDisplay && prop.priceDisplay.toLowerCase().includes('/ month')))
                                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}>
                                  {(prop.type === 'Rent/Lease' || prop.purpose === 'rent' || prop.isAvailableForRent || (prop.priceDisplay && prop.priceDisplay.toLowerCase().includes('/ month'))) ? 'Rent' : 'Sale'}
                                </span>
                                <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {prop.type}
                                </span>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                  prop.isSold ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {prop.isSold ? 'Sold' : 'Available'}
                                </span>
                              </div>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                                {prop.priceDisplay || `₹${prop.price}`} • {prop.city}
                              </span>
                            </div>
                          </div>

                          {/* Owner Quick Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onEditProperty(prop)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 cursor-pointer"
                              title="Edit Property"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onToggleSold(prop.id)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 cursor-pointer text-[10px] font-bold"
                              title="Toggle Sold"
                            >
                              <Tag className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPropertyToDelete(prop);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-rose-500 hover:bg-rose-50 cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            {/* ACTION SHORTCUTS LIST */}
            <div className="rounded-3xl bg-white dark:bg-[#0a281d] border border-emerald-200/80 dark:border-emerald-800/80 overflow-hidden divide-y divide-slate-100 dark:divide-emerald-950 shadow-xs">
              
              {/* Inbox / Enquiries */}
              <button
                type="button"
                onClick={() => {
                  requireAuth(() => {
                    if (onOpenInbox) onOpenInbox();
                  }, isHindi ? 'संदेश देखने हेतु लॉगिन करें।' : 'Please sign in to view messages.');
                }}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {isHindi ? 'संदेश और खरीदार पूछताछ' : 'Buyer Enquiries & Chat Inbox'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {unreadInboxCount > 0 ? `${unreadInboxCount} unread messages` : 'Direct conversations with owners and buyers'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Loan & EMI Calculator */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenEmiCalculator) onOpenEmiCalculator();
                }}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {isHindi ? 'होम लोन EMI कैलकुलेटर' : 'Home Loan EMI Calculator'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isHindi ? 'मासिक किस्त एवं ब्याज की गणना करें' : 'Calculate monthly payments & bank interest'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Land Unit Converter */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenUnitConverter) onOpenUnitConverter();
                }}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                    <Mountain className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {isHindi ? 'पहाड़ी जमीन नाप कन्वर्टर (नाली-बीघा)' : 'Hill Land Unit Converter (Nali/Bigha)'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isHindi ? 'नाली, मुट्ठी, बीघा, गज एवं वर्ग फीट' : 'Nali, Mutthi, Bigha, Gaj & Sq.Ft conversions'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                    {isHindi ? 'अ' : 'EN'}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {isHindi ? 'भाषा: हिन्दी (बदलें)' : 'Language: English (Switch)'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isHindi ? 'Switch to English' : 'हिन्दी भाषा में बदलें'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Theme Toggle */}
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="w-full p-3.5 flex items-center justify-between text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 flex items-center justify-center">
                      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        {isDark ? (isHindi ? 'थीम: डार्क मोड (सक्रिय)' : 'Theme: Dark Mode') : (isHindi ? 'थीम: लाइट मोड (सक्रिय)' : 'Theme: Light Mode')}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isDark ? 'Tap to switch to Light mode' : 'Tap to switch to Dark mode'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {/* Admin Access (if owner/admin) */}
              {currentUser?.role === 'admin' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAdminAccounts) onOpenAdminAccounts();
                    }}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">
                          Platform Admin Management
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Accounts & system administration
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAdminReports) onOpenAdminReports();
                    }}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">
                          Listing Reports & Compliance
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Review flagged properties
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </>
              )}

            </div>

            {/* Legal & Compliance Links */}
            <div className="p-3 rounded-2xl bg-white dark:bg-[#0a281d] border border-emerald-200/80 dark:border-emerald-800/80 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
              <button type="button" onClick={() => onOpenLegalPolicy && onOpenLegalPolicy('terms')} className="hover:underline cursor-pointer">
                Terms of Service
              </button>
              <span>•</span>
              <button type="button" onClick={() => onOpenLegalPolicy && onOpenLegalPolicy('privacy')} className="hover:underline cursor-pointer">
                Privacy Policy
              </button>
              <span>•</span>
              <button type="button" onClick={() => onOpenLegalPolicy && onOpenLegalPolicy('disclaimer')} className="hover:underline cursor-pointer">
                Legal Disclaimer
              </button>
              <span>•</span>
              <button type="button" onClick={() => onOpenLegalPolicy && onOpenLegalPolicy('grievance')} className="hover:underline cursor-pointer">
                Grievance Officer
              </button>
            </div>

            {/* Logout Button (if logged in) */}
            {currentUser && (
              <div className="pt-1 pb-4">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await logout();
                    } catch {
                      localStorage.removeItem('uk_gateways_auth_user');
                      window.location.reload();
                    }
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isHindi ? 'लॉगआउट करें (Sign Out)' : 'Sign Out of Account'}</span>
                </button>
              </div>
            )}

            {/* Platform Branding Notice */}
            <div className="text-center pt-2 pb-6 space-y-1">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Uttarakhand Gateways Mobile Companion App v2.0
              </p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                100% Authentic • 0% Brokerage • Uttarakhand, India
              </p>
            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* PROPERTY DETAILS SCREEN (Mobile-First Detail Page)      */}
        {/* ======================================================== */}
        {activeDetailProperty && (
          <div className="space-y-4 pb-28">
            
            {/* Top Detail Navigation Header */}
            <div className="sticky top-0 z-40 bg-white/95 dark:bg-[#071f17]/95 backdrop-blur-md px-3.5 py-2.5 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between safe-top">
              <button
                type="button"
                onClick={() => setActiveDetailProperty(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 active:scale-95 cursor-pointer py-1"
              >
                <ChevronLeft className="w-5 h-5 text-emerald-600" />
                <span>{isHindi ? 'वापस' : 'Back'}</span>
              </button>

              <div className="flex items-center gap-2">
                {/* Three Dots Owner Action Menu */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedActionProperty(activeDetailProperty);
                  }}
                  className="p-2 rounded-full bg-white dark:bg-[#0a281d] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-emerald-800 active:scale-90 cursor-pointer flex items-center justify-center shadow-xs"
                  title={isHindi ? 'विकल्प (एडिट / सोल्ड / डिलीट)' : 'Options (Edit / Sold / Delete)'}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(activeDetailProperty.id)}
                  className={`p-2 rounded-full border transition-all cursor-pointer active:scale-90 ${
                    favorites.includes(activeDetailProperty.id)
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-white dark:bg-[#0a281d] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-emerald-800'
                  }`}
                  title="Save to favorites"
                >
                  <Bookmark className={`w-4 h-4 ${favorites.includes(activeDetailProperty.id) ? 'fill-rose-600' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/?property=${activeDetailProperty.id}`;
                    if (navigator.share) {
                      navigator.share({
                        title: activeDetailProperty.title,
                        text: `Check out ${activeDetailProperty.title} on Uttarakhand Gateways`,
                        url
                      }).catch(() => {});
                    } else {
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${activeDetailProperty.title} on Uttarakhand Gateways: ${url}`)}`, '_blank');
                    }
                  }}
                  className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 active:scale-90 cursor-pointer"
                  title="Share Property"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Photo Gallery Carousel */}
            {(() => {
              const isLand = isLandOrPlotProperty(activeDetailProperty);
              const fallback = isLand
                ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
                : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
              const images = Array.isArray(activeDetailProperty.images) && activeDetailProperty.images.filter(Boolean).length > 0
                ? activeDetailProperty.images.filter(Boolean)
                : [fallback];

              return (
                <div className="space-y-2">
                  <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={images[detailImgIdx] || fallback}
                      alt={activeDetailProperty.title}
                      className="w-full h-full object-cover"
                      onClick={() => setLightboxOpen(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                    {/* Image Counter */}
                    {images.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold border border-white/20">
                        {detailImgIdx + 1} / {images.length}
                      </div>
                    )}

                    {/* Arrow Navigation */}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setDetailImgIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer active:scale-90"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailImgIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-xs cursor-pointer active:scale-90"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {images.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto px-3.5 scrollbar-none py-1">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setDetailImgIdx(i)}
                          className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            detailImgIdx === i ? 'border-emerald-600 scale-105' : 'border-transparent opacity-60'
                          }`}
                        >
                          <img src={img} alt="thumb" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Overview & Metadata */}
            <div className="px-3.5 space-y-4">
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {activeDetailProperty.type || 'Property'}
                  </span>
                  {activeDetailProperty.city && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      📍 {activeDetailProperty.city}
                    </span>
                  )}
                </div>

                <h2 className="font-serif-luxury font-bold text-xl text-slate-900 dark:text-white leading-snug">
                  {activeDetailProperty.title}
                </h2>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{activeDetailProperty.location || activeDetailProperty.city}</span>
                </p>
              </div>

              {/* Asking Price & Rate Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                    {isHindi ? 'मांग मूल्य' : 'Asking Price'}
                  </span>
                  <div className="text-2xl font-black text-emerald-900 dark:text-white leading-tight">
                    {activeDetailProperty.priceDisplay || `₹${Number(activeDetailProperty.price).toLocaleString('en-IN')}`}
                  </div>
                </div>

                {formatPropertyRate(activeDetailProperty, isHindi) && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      {isHindi ? 'दर (Rate)' : 'Rate'}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      {formatPropertyRate(activeDetailProperty, isHindi)}
                    </span>
                  </div>
                )}
              </div>

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(activeDetailProperty.configuration || (activeDetailProperty.bedrooms ? `${activeDetailProperty.bedrooms} BHK` : null)) && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0a281d] border border-slate-200 dark:border-emerald-900/60">
                    <span className="text-[10px] text-slate-400 block">{isHindi ? 'कॉन्फ़िगरेशन' : 'Configuration'}</span>
                    <strong className="font-bold text-slate-800 dark:text-white">
                      {activeDetailProperty.configuration || `${activeDetailProperty.bedrooms} BHK`}
                    </strong>
                  </div>
                )}
                {formatPropertyArea(activeDetailProperty, isHindi) && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0a281d] border border-slate-200 dark:border-emerald-900/60">
                    <span className="text-[10px] text-slate-400 block">{isHindi ? 'कुल क्षेत्रफल' : 'Total Area'}</span>
                    <strong className="font-bold text-slate-800 dark:text-white">{formatPropertyArea(activeDetailProperty, isHindi)}</strong>
                  </div>
                )}
                {activeDetailProperty.furnishing && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#0a281d] border border-slate-200 dark:border-emerald-900/60">
                    <span className="text-[10px] text-slate-400 block">{isHindi ? 'फर्निशिंग' : 'Furnishing'}</span>
                    <strong className="font-bold text-slate-800 dark:text-white">{activeDetailProperty.furnishing}</strong>
                  </div>
                )}
              </div>

              {/* Description */}
              {activeDetailProperty.description && (
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-white dark:bg-[#0a281d] border border-slate-200 dark:border-emerald-900/60">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {isHindi ? 'विवरण' : 'About Property'}
                  </h4>
                  <p className={`text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line ${
                    !descExpanded ? 'line-clamp-4' : ''
                  }`}>
                    {activeDetailProperty.description}
                  </p>
                  {activeDetailProperty.description.length > 200 && (
                    <button
                      type="button"
                      onClick={() => setDescExpanded(!descExpanded)}
                      className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer pt-1"
                    >
                      {descExpanded ? (isHindi ? 'कम दिखाएं' : 'Show Less') : (isHindi ? 'पूरा विवरण पढ़ें...' : 'Read Full Description...')}
                    </button>
                  )}
                </div>
              )}

              {/* Amenities Grid */}
              {Array.isArray(activeDetailProperty.amenities) && activeDetailProperty.amenities.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0a281d] border border-slate-200 dark:border-emerald-900/60 space-y-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {isHindi ? 'सुविधाएं (Amenities)' : 'Amenities & Facilities'}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                    {activeDetailProperty.amenities.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner / Seller Card */}
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0a281d] border border-slate-200 dark:border-emerald-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-sm flex items-center justify-center shrink-0 uppercase">
                    {(getPropertyOwnerDisplayName(activeDetailProperty, currentUser) || 'O').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                      {getPropertyOwnerDisplayName(activeDetailProperty, currentUser) || 'Direct Owner'}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                      ✓ 0% Brokerage Direct Listing
                    </span>
                  </div>
                </div>
              </div>

              {/* Dedicated In-Page Owner Management Panel */}
              {isPropertyOwner(activeDetailProperty, currentUser) && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-[#0a281d] dark:to-[#072017] border-2 border-emerald-300 dark:border-emerald-700 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      {isHindi ? 'आपकी लिस्टिंग प्रबंधन (मालिक पैनल)' : 'Listing Owner Controls'}
                    </span>
                    {activeDetailProperty.isSold && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">
                        {isHindi ? 'बिक चुका' : 'Sold'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* 1. Edit Listing Button */}
                    <button
                      type="button"
                      onClick={() => onEditProperty(activeDetailProperty)}
                      className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-white dark:bg-[#071c14] border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-5 h-5 text-blue-600" />
                      <span>{isHindi ? 'संपादित करें' : 'Edit Listing'}</span>
                    </button>

                    {/* 2. Mark Sold / Available Button */}
                    <button
                      type="button"
                      onClick={() => onToggleSold(activeDetailProperty.id)}
                      className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-white dark:bg-[#071c14] border border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Tag className="w-5 h-5 text-amber-600" />
                      <span>{activeDetailProperty.isSold ? (isHindi ? 'उपलब्ध मार्क करें' : 'Mark Available') : (isHindi ? 'बिका मार्क करें' : 'Mark as Sold')}</span>
                    </button>

                    {/* 3. Delete Listing Button */}
                    <button
                      type="button"
                      onClick={() => setPropertyToDelete(activeDetailProperty)}
                      className="flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl bg-white dark:bg-[#071c14] border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5 text-rose-600" />
                      <span>{isHindi ? 'लिस्टिंग हटाएं' : 'Delete Listing'}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* STICKY BOTTOM ACTION BAR FOR DETAIL VIEW */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#071f17]/95 backdrop-blur-xl border-t border-emerald-200 dark:border-emerald-800 p-3 pb-safe shadow-2xl">
              <div className="max-w-[480px] mx-auto flex items-center justify-between gap-3 px-2">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">{isHindi ? 'कुल मूल्य' : 'Price'}</span>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-400 leading-tight">
                    {activeDetailProperty.priceDisplay || `₹${Number(activeDetailProperty.price).toLocaleString('en-IN')}`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/?property=${activeDetailProperty.id}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hi, I am interested in ${activeDetailProperty.title} (${url})`)}`, '_blank');
                    }}
                    className="p-2.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold active:scale-95 shadow-sm cursor-pointer"
                    title="WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {isPropertyOwner(activeDetailProperty, currentUser) ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditProperty(activeDetailProperty)}
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                        title={isHindi ? 'संपादित करें' : 'Edit Listing'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isHindi ? 'एडिट' : 'Edit'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleSold(activeDetailProperty.id)}
                        className={`px-3 py-2 rounded-xl text-white font-extrabold text-xs shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer ${
                          activeDetailProperty.isSold ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                        title={activeDetailProperty.isSold ? (isHindi ? 'उपलब्ध मार्क करें' : 'Mark Available') : (isHindi ? 'बिका मार्क करें' : 'Mark as Sold')}
                      >
                        <Tag className="w-3.5 h-3.5" />
                        <span>{activeDetailProperty.isSold ? (isHindi ? 'उपलब्ध' : 'Available') : (isHindi ? 'बिका' : 'Sold')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropertyToDelete(activeDetailProperty)}
                        className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                        title={isHindi ? 'लिस्टिंग हटाएं' : 'Delete Listing'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isHindi ? 'हटाएं' : 'Delete'}</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        requireAuth(() => onStartChat(activeDetailProperty), isHindi ? 'मालिक से सीधे चैट करने हेतु लॉगिन करें।' : 'Please sign in to chat with the owner.');
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-700/30 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{isHindi ? 'मालिक से चैट करें' : 'Chat with Owner'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 4. PERMANENT FIXED BOTTOM NAVIGATION BAR (Visible across every screen) */}
      {!activeDetailProperty && (
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
          }}
          savedCount={favorites.length}
          unreadInboxCount={unreadInboxCount}
          currentUser={currentUser}
        />
      )}

      {/* 5. FLOATING AI CHATBOT & CALCULATOR LAUNCHER (Available on Home tab) */}
      {!activeDetailProperty && activeTab === 'home' && (
        <AiChatbot
          onOpenSellModal={() => setActiveTab('list')}
          onOpenUnitConverter={() => {
            if (onOpenUnitConverter) onOpenUnitConverter();
          }}
          onOpenCalculator={() => {
            const calcEl = document.getElementById('calculator-section');
            if (calcEl) {
              calcEl.scrollIntoView({ behavior: 'smooth' });
            } else if (onOpenUnitConverter) {
              onOpenUnitConverter();
            }
          }}
          onExploreProperties={() => {
            setActiveTab('explore');
          }}
        />
      )}

      {/* 6. BOTTOM SHEETS & SLIDEOVERS */}

      {/* Town / City Selection Bottom Sheet */}
      {showCitySheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white dark:bg-[#071f17] rounded-t-3xl max-h-[80vh] flex flex-col p-4 shadow-2xl max-w-lg mx-auto w-full border-t border-emerald-300 dark:border-emerald-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isHindi ? 'उत्तराखंड के शहर चुनें' : 'Select Uttarakhand City'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCitySheet(false)}
                className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-1.5">
              <button
                type="button"
                onClick={() => handleCitySelect('All')}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  selectedCity === 'All'
                    ? 'bg-emerald-600 text-white'
                    : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200'
                }`}
              >
                <span>🏔️ {isHindi ? 'पूरा उत्तराखंड (All Uttarakhand)' : 'All Uttarakhand'}</span>
                <span className="text-[10px] opacity-75">{properties.length} properties</span>
              </button>

              {CITIES.map((cityName) => {
                const count = properties.filter((p) => p.city?.toLowerCase() === cityName.toLowerCase()).length;
                const isSel = selectedCity.toLowerCase() === cityName.toLowerCase();
                return (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => handleCitySelect(cityName)}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isSel
                        ? 'bg-emerald-600 text-white'
                        : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>📍 {cityName}</span>
                    <span className="text-[10px] opacity-75">{count} properties</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Bottom Sheet */}
      {showFilterSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-white dark:bg-[#071f17] rounded-t-3xl max-h-[85vh] flex flex-col p-4 shadow-2xl max-w-lg mx-auto w-full border-t border-emerald-300 dark:border-emerald-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-900">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isHindi ? 'फ़िल्टर एवं वरीयताएं' : 'Filters & Preferences'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFilterSheet(false)}
                className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-4">
              {/* Budget Range Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-white block">
                  {isHindi ? 'बजट दायरा (Budget Range)' : 'Budget Range'}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'all', label: isHindi ? 'सभी बजट' : 'All Budgets' },
                    { id: 'under-25l', label: isHindi ? '₹25 लाख से कम' : 'Under ₹25 Lakh' },
                    { id: '25l-50l', label: '₹25L – ₹50L' },
                    { id: '50l-1cr', label: '₹50L – ₹1 Crore' },
                    { id: 'above-1cr', label: isHindi ? '₹1 करोड़ से ऊपर' : 'Above ₹1 Crore' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBudgetFilter(b.id)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        budgetFilter === b.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* BHK Configuration */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-white block">
                  {isHindi ? 'बेडरूम (BHK)' : 'Bedrooms (BHK)'}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: '1 bhk', label: '1 BHK' },
                    { id: '2 bhk', label: '2 BHK' },
                    { id: '3 bhk', label: '3+ BHK' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBhkFilter(b.id)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        bhkFilter === b.id
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-emerald-900 flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer active:scale-95"
              >
                {isHindi ? 'रीसेट करें' : 'Reset'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowFilterSheet(false);
                  setActiveTab('explore');
                }}
                className="flex-2 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-700/30 cursor-pointer active:scale-95"
              >
                {isHindi ? `परिणाम देखें (${filteredProperties.length})` : `Show Results (${filteredProperties.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Property Photos */}
      {lightboxOpen && activeDetailProperty && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-4 select-none">
          <div className="flex items-center justify-between text-white safe-top">
            <span className="text-xs font-bold">
              {detailImgIdx + 1} / {activeDetailProperty.images?.length || 1}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/20 text-white cursor-pointer active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <img
              src={activeDetailProperty.images?.[detailImgIdx] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
              alt={activeDetailProperty.title}
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>

          {activeDetailProperty.images && activeDetailProperty.images.length > 1 && (
            <div className="flex items-center justify-center gap-4 text-white safe-bottom pb-4">
              <button
                type="button"
                onClick={() => setDetailImgIdx((prev) => (prev > 0 ? prev - 1 : (activeDetailProperty.images?.length || 1) - 1))}
                className="p-3 rounded-full bg-white/20 text-white active:scale-90 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => setDetailImgIdx((prev) => (prev < (activeDetailProperty.images?.length || 1) - 1 ? prev + 1 : 0))}
                className="p-3 rounded-full bg-white/20 text-white active:scale-90 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Sidebar Navigation Drawer */}
      <MobileAppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={(tab, extra) => {
          if (tab === 'list') {
            if (extra === 'rent') setListType('rent');
            else if (extra === 'sale') setListType('sale');
          }
          setActiveTab(tab);
          if (controlledOnTabChange) controlledOnTabChange(tab);
        }}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onSelectCity={(city) => setSelectedCity(city)}
        onOpenUnitConverter={onOpenUnitConverter}
        onOpenEmiCalculator={onOpenEmiCalculator}
        onOpenGuide={onOpenGuide}
        onOpenInbox={onOpenInbox}
        onOpenLegalPolicy={(pol) => onOpenLegalPolicy && onOpenLegalPolicy(pol)}
        currentUser={currentUser}
        onOpenAuthModal={openAuthModal}
        onLogout={logout}
        savedCount={favorites.length}
        unreadInboxCount={unreadInboxCount}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        isHindi={isHindi}
        onToggleLanguage={toggleLanguage}
      />

      {/* Delete Confirmation Modal for Mobile App */}
      {propertyToDelete && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setPropertyToDelete(null)}
          onClick={() => setPropertyToDelete(null)}
        >
          <div 
            className="w-full max-w-xs bg-white dark:bg-[#071c14] border border-rose-300 dark:border-rose-900 rounded-3xl p-5 shadow-2xl text-slate-800 dark:text-slate-100 modal-animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-center text-slate-900 dark:text-white mb-1.5">
              {isHindi ? 'लिस्टिंग हटाएं?' : 'Delete Listing?'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 text-center mb-5 leading-relaxed">
              {isHindi 
                ? `क्या आप वाकई "${propertyToDelete.title}" को हमेशा के लिए हटाना चाहते हैं?` 
                : `Are you sure you want to permanently delete "${propertyToDelete.title}"?`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = propertyToDelete.id;
                  setPropertyToDelete(null);
                  if (activeDetailProperty?.id === targetId) {
                    setActiveDetailProperty(null);
                  }
                  onDeleteProperty(targetId);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                {isHindi ? 'हां, हटाएं' : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Global Property Action Sheet Modal (Guaranteed 100% visibility & clicks for Edit, Sold, Delete) */}
      {selectedActionProperty && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelectedActionProperty(null)}
        >
          <div 
            className="w-full sm:max-w-sm bg-white dark:bg-[#071c14] border-t sm:border border-emerald-300 dark:border-emerald-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-slate-800 dark:text-slate-100 modal-animate-pop space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  {isHindi ? 'प्रॉपर्टी विकल्प' : 'Property Options'}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  {selectedActionProperty.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedActionProperty(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions List */}
            <div className="space-y-2">
              {/* 1. Edit Listing */}
              <button
                type="button"
                onClick={() => {
                  const target = selectedActionProperty;
                  setSelectedActionProperty(null);
                  onEditProperty(target);
                }}
                className="w-full p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-3 cursor-pointer active:scale-98 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-black text-sm">{isHindi ? 'लिस्टिंग संपादित करें (Edit)' : 'Edit Listing'}</div>
                  <div className="text-[10px] opacity-75 truncate">{isHindi ? 'कीमत, फोटो व जानकारी बदलें' : 'Update price, photos & details'}</div>
                </div>
              </button>

              {/* 2. Mark Sold / Available */}
              <button
                type="button"
                onClick={() => {
                  const target = selectedActionProperty;
                  setSelectedActionProperty(null);
                  onToggleSold(target.id);
                  if (activeDetailProperty?.id === target.id) {
                    setActiveDetailProperty({
                      ...activeDetailProperty,
                      isSold: !activeDetailProperty.isSold,
                    });
                  }
                }}
                className="w-full p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-3 cursor-pointer active:scale-98 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Tag className="w-4 h-4" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-black text-sm">
                    {selectedActionProperty.isSold 
                      ? (isHindi ? 'उपलब्ध मार्क करें (Make Active)' : 'Mark as Available') 
                      : (isHindi ? 'बिक चुका मार्क करें (Mark Sold)' : 'Mark as Sold')}
                  </div>
                  <div className="text-[10px] opacity-75 truncate">
                    {selectedActionProperty.isSold 
                      ? (isHindi ? 'सोल्ड स्टेटस हटाएं' : 'Set listing as active') 
                      : (isHindi ? 'सोल्ड बैनर दिखाएं' : 'Display sold banner')}
                  </div>
                </div>
              </button>

              {/* 3. Delete Listing */}
              <button
                type="button"
                onClick={() => {
                  const target = selectedActionProperty;
                  setSelectedActionProperty(null);
                  setPropertyToDelete(target);
                }}
                className="w-full p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-3 cursor-pointer active:scale-98 transition-all"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <div className="font-black text-sm">{isHindi ? 'लिस्टिंग हटाएं (Delete)' : 'Delete Listing'}</div>
                  <div className="text-[10px] opacity-75 truncate">{isHindi ? 'मार्केटप्लेस से हमेशा के लिए हटाएं' : 'Permanently remove listing'}</div>
                </div>
              </button>
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => setSelectedActionProperty(null)}
              className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
