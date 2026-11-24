import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Property } from '../types';
import { 
  ArrowLeft,
  Edit3,
  MapPin, 
  Home, 
  Maximize2, 
  Compass, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Bookmark,
  MessageSquare,
  Lock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  ExternalLink,
  FileText,
  Navigation,
  Check,
  Ruler,
  Layers,
  Droplets,
  Zap,
  Wifi,
  Scale,
  Car,
  TreePine,
  Shield,
  Video,
  Building,
  CheckCheck,
  Clock,
  Link2,
  IndianRupee,
  ArrowRight,
  Calculator,
  Flag,
  Eye
} from 'lucide-react';
import { resolveApiUrl, isNativeAndroidApp } from '../config/apiConfig';
import { SeoKeywordsSection } from './SeoKeywordsSection';
import type { AppPageRouteKey } from '../data/seoMetadata';
import { EmiCalculatorModal } from './EmiCalculatorModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  isPropertyOwner, 
  canManageProperty, 
  getPropertyOwnerDisplayName,
  isAppOwner,
  formatPropertyViewsCount,
  formatPropertyAge,
  getOrCreateVisitorId,
  getPublicPropertyPhone,
  formatPhoneForDisplay,
  getTelHref,
  buildDefaultWhatsAppMessage,
  getWhatsAppContactUrl
} from '../utils/propertyOwnership';
import { formatLocalizedPrice } from '../utils/language';
import { formatPostTime } from '../utils/timeAgo';
import { LegalPolicyId } from '../data/legalPolicies';
import { formatPropertyArea, formatPropertyRate, isLandOrPlotProperty } from '../utils/areaUnits';
import { getCitySlug, getPropertySlugPath } from '../data/programmaticSeo';
import { getPropertyShareUrl, sharePropertyListing } from '../utils/propertyShare';

interface PropertyDetailPageProps {
  property: Property;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onStartChat?: (property: Property) => void;
  onDeleteProperty?: (propertyId: string) => void;
  onToggleSold?: (propertyId: string) => void;
  onEditProperty?: (property: Property) => void;
  allProperties?: Property[];
  onSelectProperty?: (property: Property) => void;
  onOpenLegalPolicy?: (policyId: LegalPolicyId) => void;
  onReportListing?: (property: Property) => void;
  onNavigatePage?: (page: AppPageRouteKey) => void;
  onNavigateCity?: (city: string) => void;
  onNavigatePath?: (path: string) => void;
  onPropertyViewed?: (propertyId: string, views: number) => void;
}

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.414z"/>
  </svg>
);

// Safe numeric parser helper
const parseSafeNumber = (val: any, fallback = 0): number => {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
};

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property: propertyProp,
  onBack,
  isFavorite,
  onToggleFavorite,
  onStartChat,
  onDeleteProperty,
  onToggleSold,
  onEditProperty,
  allProperties = [],
  onSelectProperty,
  onOpenLegalPolicy,
  onReportListing,
  onNavigatePage,
  onNavigateCity,
  onNavigatePath,
  onPropertyViewed,
}) => {
  // Hydrate full property details (including owner name & phone) when individual detail page opens
  const [hydratedProperty, setHydratedProperty] = useState<Property>(propertyProp);
  useEffect(() => {
    setHydratedProperty(propertyProp);
    if (!propertyProp?.id) return;
    let cancelled = false;
    const headers: Record<string, string> = {};
    try {
      const token = localStorage.getItem('ukg_session_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['X-Session-Token'] = token;
      }
    } catch {}
    fetch(resolveApiUrl(`/api/properties/${encodeURIComponent(propertyProp.id)}`), {
      credentials: isNativeAndroidApp() ? 'omit' : 'include',
      headers,
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.success && data?.property) {
          setHydratedProperty((prev) => ({ ...prev, ...data.property }));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [propertyProp]);

  const property = hydratedProperty || propertyProp;
  const formattedPropertyAge = formatPropertyAge(property?.propertyAgeYears, isHindiCaseSafe());
  function isHindiCaseSafe(): boolean {
    try {
      return typeof document !== 'undefined' && document.documentElement.lang === 'hi';
    } catch {
      return false;
    }
  }

  // Safe Image & Amenities Guards to guarantee zero runtime crashes
  const safeImages = useMemo(() => {
    if (Array.isArray(property?.images) && property.images.length > 0) {
      const filtered = property.images.filter(Boolean);
      if (filtered.length > 0) return filtered;
    }
    return ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];
  }, [property?.images]);

  const safeAmenities = useMemo(() => {
    return Array.isArray(property?.amenities) ? property.amenities.filter(Boolean) : [];
  }, [property?.amenities]);

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Optimistic Sold Status
  const [isSoldLocal, setIsSoldLocal] = useState<boolean>(Boolean(property?.isSold));
  const [soldNotice, setSoldNotice] = useState<string | null>(null);

  useEffect(() => {
    setIsSoldLocal(Boolean(property?.isSold));
  }, [property?.isSold]);


  const { isHindi } = useLanguage();
  const { currentUser, openAuthModal } = useAuth();

  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState<string>(() =>
    buildDefaultWhatsAppMessage(property, isHindi)
  );

  useEffect(() => {
    setCustomWhatsAppMsg(buildDefaultWhatsAppMessage(property, isHindi));
  }, [property?.id, isHindi]);

  const isDirectOwner = property ? isPropertyOwner(property, currentUser) : false;
  const canManage = property ? canManageProperty(property, currentUser) : false;
  const isOwner = canManage;
  const isLandOrPlot = property ? isLandOrPlotProperty(property) : false;
  const formattedArea = property ? formatPropertyArea(property, isHindi) : '';
  const formattedRate = property ? formatPropertyRate(property, isHindi) : '';

  // Home Loan & EMI Calculator State
  const [showEmiModal, setShowEmiModal] = useState(false);
  const estimatedMonthlyEmi = useMemo(() => {
    if (!property?.price || property.price <= 0 || property.isAvailableForRent) return 0;
    const principal = property.price * 0.8;
    const r = 8.5 / (12 * 100);
    const n = 20 * 12;
    const emi = Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    return isNaN(emi) ? 0 : emi;
  }, [property?.price, property?.isAvailableForRent]);

  // IMPORTANT: Guard against repeated auto-scrolling!
  // ONLY scroll to top once when the property ID changes (never on re-renders or polling intervals)
  const propertyId = property?.id;
  const lastScrolledPropId = useRef<string | null>(null);
  const [liveViews, setLiveViews] = useState<number>(() => Math.max(0, Math.floor(Number(property?.views) || 0)));

  useEffect(() => {
    setLiveViews(Math.max(0, Math.floor(Number(property?.views) || 0)));
  }, [property?.id, property?.views]);

  useEffect(() => {
    if (propertyId && lastScrolledPropId.current !== propertyId) {
      lastScrolledPropId.current = propertyId;
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Genuine duplicate-protected view tracking (excludes Admin, Direct Owner & ?preview=admin / internal test previews)
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const isUrlPreview =
        searchParams?.get('preview') === 'admin' || searchParams?.get('internal_test') === 'true';
      const isAdminOrOwnerPreview = Boolean(
        isUrlPreview || (currentUser && (isAppOwner(currentUser) || isDirectOwner))
      );
      if (!isAdminOrOwnerPreview) {
        const visitorId = getOrCreateVisitorId();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (visitorId) headers['X-Visitor-Id'] = visitorId;
        try {
          const token = localStorage.getItem('ukg_session_token');
          if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch {}

        fetch(`/api/properties/${encodeURIComponent(propertyId)}/view`, {
          method: 'POST',
          credentials: 'include',
          headers,
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data && typeof data.views === 'number') {
              const updatedViews = Math.max(0, Math.floor(data.views));
              setLiveViews(updatedViews);
              onPropertyViewed?.(propertyId, updatedViews);
              try {
                window.dispatchEvent(
                  new CustomEvent('uk_gateways_property_viewed', {
                    detail: { propertyId, views: updatedViews },
                  })
                );
              } catch {}
              try {
                const bc = new BroadcastChannel('uk_gateways_properties_channel');
                bc.postMessage({ type: 'PROPERTY_VIEW_UPDATED', propertyId, views: updatedViews });
                bc.close();
              } catch {}
            }
          })
          .catch(() => {});
      }
    }

    if (property?.title) {
      const pageTitle = `${property.title} | ${property.city || 'Uttarakhand'} Real Estate | Uttarakhand Gateways`;
      document.title = pageTitle;

      // Dynamic Meta Description
      const cleanDesc = (property.description || '').replace(/\s+/g, ' ').slice(0, 160).trim();
      const metaDescText = `${property.category || 'Property'} for ${property.purpose === 'rent' || property.isAvailableForRent ? 'rent' : 'sale'} in ${property.location || property.city || 'Uttarakhand'}. ${cleanDesc || 'Discover properties on Uttarakhand Gateways with NO PLATFORM FEE.'}`;
      
      let descTag = document.querySelector('meta[name="description"]');
      if (!descTag) {
        descTag = document.createElement('meta');
        descTag.setAttribute('name', 'description');
        document.head.appendChild(descTag);
      }
      descTag.setAttribute('content', metaDescText);

      // Dynamic Canonical URL
      const canonicalSlugPath = getPropertySlugPath(property);
      const fullCanonicalUrl = `https://uttarakhandgateways.com${canonicalSlugPath}`;
      const citySlugPath = `/properties-in-${getCitySlug(property.city || 'Uttarakhand')}`;

      const tLower = (property.type || '').toLowerCase();
      const cLower = (property.category || '').toLowerCase();
      const listingSchemaType: string | string[] =
        tLower === 'plot' || tLower === 'land' || cLower === 'commercial' || cLower === 'agricultural'
          ? 'RealEstateListing'
          : ['flat', 'apartment', 'studio', 'penthouse', 'duplex'].includes(tLower)
          ? ['RealEstateListing', 'Apartment']
          : ['RealEstateListing', 'SingleFamilyResidence'];

      let canonicalTag = document.querySelector('link[rel="canonical"]');
      if (!canonicalTag) {
        canonicalTag = document.createElement('link');
        canonicalTag.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.setAttribute('href', fullCanonicalUrl);

      // Dynamic JSON-LD Structured Data
      const schemaScriptId = `schema-property-${property.id}`;
      let scriptTag = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = schemaScriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }

      const propertySchema = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': 'https://uttarakhandgateways.com/'
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': `Properties in ${property.city || 'Uttarakhand'}`,
                'item': `https://uttarakhandgateways.com${citySlugPath}`
              },
              {
                '@type': 'ListItem',
                'position': 3,
                'name': property.title,
                'item': fullCanonicalUrl
              }
            ]
          },
          {
            '@type': listingSchemaType,
            '@id': `${fullCanonicalUrl}#listing`,
            'name': property.title,
            'description': metaDescText,
            'url': fullCanonicalUrl,
            'image': safeImages,
            'offers': {
              '@type': 'Offer',
              'price': property.price || 0,
              'priceCurrency': 'INR',
              'availability': isSoldLocal ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
              'seller': {
                '@type': 'Person',
                'name': getPropertyOwnerDisplayName(property, null, false) || 'Property Owner'
              }
            },
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': property.city || 'Uttarakhand',
              'addressRegion': 'Uttarakhand',
              'addressCountry': 'IN'
            }
          }
        ]
      };
      scriptTag.textContent = JSON.stringify(propertySchema);

      return () => {
        const el = document.getElementById(schemaScriptId);
        if (el) el.remove();
      };
    }
  }, [propertyId, property?.title, property?.description, property?.city, property?.price, property?.category, property?.location]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, isLightboxOpen]);

  // Generates canonical share URL to the current property page
  const getPropertyDeepLink = () => {
    if (!property) return typeof window !== 'undefined' ? window.location.href : 'https://uttarakhandgateways.com';
    return getPropertyShareUrl(property);
  };

  const handleCopyDeepLink = async () => {
    if (!property) return;
    const deepLink = getPropertyDeepLink();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(deepLink);
      }
    } catch {}
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    if (property.id) {
      fetch(`/api/properties/${property.id}/share`, { method: 'POST' }).catch(() => {});
    }
  };

  const handleInitiateChat = () => {
    if (property?.id) {
      fetch(`/api/properties/${property.id}/inquiry`, { method: 'POST' }).catch(() => {});
    }
    if (onStartChat && property) {
      if (!currentUser) {
        openAuthModal('login', isHindi ? 'मालिक से सीधे चैट करने हेतु कृपया ईमेल OTP से लॉगिन करें।' : 'Please sign in with your email via OTP to chat with the owner.', () => {
          onStartChat(property);
        });
      } else {
        onStartChat(property);
      }
    }
  };

  /**
   * Universally shares the property listing without requiring user login.
   * Anyone can share any property listing at any time.
   */
  const handleShareWhatsApp = async () => {
    if (!property) return;
    await sharePropertyListing(property, {
      isHindi,
      onCopied: () => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      },
    });
  };

  const handleShare = () => {
    handleShareWhatsApp();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenGoogleMaps = () => {
    if (!property) return;
    if (property.coordinates && property.coordinates.lat && property.coordinates.lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${property.coordinates.lat},${property.coordinates.lng}`, '_blank');
      return;
    }
    const query = encodeURIComponent(`${property.location || property.city}, ${property.city}, Uttarakhand, India`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleToggleSoldClick = () => {
    if (!property) return;
    const nextStatus = !isSoldLocal;
    setIsSoldLocal(nextStatus);
    setSoldNotice(nextStatus 
      ? (isHindi ? '✅ प्रॉपर्टी बिक चुकी (Sold Out) मार्क कर दी गई!' : '✅ Property marked as Sold Out!') 
      : (isHindi ? '✅ प्रॉपर्टी फिर से उपलब्ध (Active) मार्क कर दी गई!' : '✅ Property marked as Available!'));
    setTimeout(() => setSoldNotice(null), 3000);
    
    if (onToggleSold) {
      onToggleSold(property.id);
    }
  };

  // Safe numerical calculations
  const priceNum = parseSafeNumber(property?.price, 0);
  const areaNum = parseSafeNumber(property?.areaSqFt, 0);
  const pricePerSqFt = areaNum > 0 ? Math.round(priceNum / areaNum) : 0;



  const publicPhone = getPublicPropertyPhone(property);
  const publicTelHref = getTelHref(publicPhone);
  const publicWhatsAppHref = getWhatsAppContactUrl(publicPhone, customWhatsAppMsg);
  const sellerDisplayName = getPropertyOwnerDisplayName(property, currentUser, isHindi);
  const isForRent = property?.type === 'Rent/Lease' || property?.purpose === 'rent' || Boolean(property?.isAvailableForRent) || (Boolean(property?.priceDisplay) && property.priceDisplay.toLowerCase().includes('/ month'));

  const airportInfo = property?.distanceFromAirport;
  const railwayInfo = property?.distanceFromRailway;

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-[#071a14] relative z-20">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Property Not Found</h2>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-sm cursor-pointer shadow-md hover:bg-emerald-700"
        >
          {isHindi ? 'सभी प्रॉपर्टीज पर वापस जाएं' : 'Back to Properties'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-[#071711] text-slate-900 dark:text-slate-100 transition-colors pt-24 sm:pt-28 pb-28 sm:pb-20 overflow-x-hidden relative z-10 w-full">
      
      {/* 1. TOP BREADCRUMB & ACTION BAR */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4 border-b border-slate-200 dark:border-emerald-900/50">
        
        {/* Back Link & Breadcrumb */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800 text-[11px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 transition-colors cursor-pointer group shrink-0"
            title={isHindi ? 'मार्केटप्लेस पर वापस जाएं' : 'Back to Marketplace'}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform shrink-0" />
            <span className="sm:hidden">{isHindi ? 'वापस' : 'Back'}</span>
            <span className="hidden sm:inline">{isHindi ? 'वापस मार्केटप्लेस' : 'Back to Listings'}</span>
          </button>

          <span className="text-slate-300 dark:text-emerald-800/80 hidden sm:inline">•</span>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-emerald-300/80 font-medium truncate">
            <span>Uttarakhand</span>
            <span>/</span>
            <span className="font-semibold text-slate-700 dark:text-emerald-200">{property.city}</span>
            <span>/</span>
            <span className="truncate max-w-[180px] md:max-w-[280px] text-slate-600 dark:text-slate-400">{property.type}</span>
          </div>
        </div>

        {/* Quick Action Buttons (Share, Save, Print) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Native WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-3 py-1.5 rounded-xl border border-emerald-500 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
            title={isHindi ? 'व्हाट्सएप पर डीप लिंक शेयर करें' : 'Share deep link on WhatsApp'}
          >
            <WhatsAppIcon className="w-4 h-4 fill-white" />
            <span>{isHindi ? 'शेयर' : 'Share'}</span>
          </button>

          {/* Copy Deep Link Button */}
          <button
            type="button"
            onClick={handleCopyDeepLink}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-white dark:bg-[#0c241c] hover:bg-slate-100 dark:hover:bg-[#102e24] text-slate-700 dark:text-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isHindi ? 'डीप लिंक कॉपी करें' : 'Copy deep link'}
          >
            <Link2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">{copiedLink ? (isHindi ? 'कॉपी हुआ!' : 'Copied!') : (isHindi ? 'लिंक' : 'Copy Link')}</span>
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={() => {
              onToggleFavorite(property.id);
            }}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isFavorite
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-[#0c241c] border-slate-200 dark:border-emerald-800 text-slate-700 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-[#102e24]'
            }`}
            title={isFavorite ? (isHindi ? 'सहेजी गई सूची से हटाएं' : 'Remove from saved') : (isHindi ? 'सहेजें' : 'Save')}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">{isFavorite ? (isHindi ? 'सहेजा गया' : 'Saved') : (isHindi ? 'सहेजें' : 'Save')}</span>
          </button>

          {/* Report Listing */}
          {onReportListing && (
            <button
              type="button"
              onClick={() => onReportListing(property)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/70 bg-white dark:bg-[#0c241c] hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isHindi ? 'लिस्टिंग की रिपोर्ट करें' : 'Report Listing'}
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHindi ? 'रिपोर्ट' : 'Report'}</span>
            </button>
          )}

          {/* Print */}
          <button
            type="button"
            onClick={handlePrint}
            className="hidden lg:flex p-2 rounded-xl border border-slate-200 dark:border-emerald-800 bg-white dark:bg-[#0c241c] hover:bg-slate-100 dark:hover:bg-[#102e24] text-slate-700 dark:text-emerald-100 transition-colors cursor-pointer"
            title={isHindi ? 'विवरण प्रिंट करें' : 'Print Property Sheet'}
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Sold Notification Toast */}
      {soldNotice && (
        <div className="max-w-md mx-auto mt-4 px-4">
          <div className="p-3 bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{soldNotice}</span>
          </div>
        </div>
      )}

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 space-y-6 sm:space-y-8">
        
        {/* 2. PROPERTY HERO HEADER (TITLE, BADGES, LOCATION) */}
        <div className="space-y-3">
          
          {/* Badge Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${
              isForRent
                ? 'bg-teal-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{isForRent ? (isHindi ? 'किराये पर (Rent)' : 'For Rent') : (isHindi ? 'बिक्री हेतु (Sale)' : 'For Sale')}</span>
            </span>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
              {property.type} • {property.category}
            </span>

            {isSoldLocal ? (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white uppercase tracking-wider">
                {isHindi ? '⚠️ बिक चुकी है (Sold Out)' : '⚠️ Sold Out'}
              </span>
            ) : property.reraStatus ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>{property.reraStatus}</span>
              </span>
            ) : null}

            {/* Post Timestamp */}
            <span 
              className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-emerald-950/80 text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs"
              title={property.createdAt ? new Date(property.createdAt).toLocaleString() : undefined}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{formatPostTime(property.createdAt || property.postedAt, property.id)}</span>
            </span>

            {/* Total Views counter */}
            <span 
              className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs tabular-nums"
              title={isHindi ? 'कुल दृश्य (Total Views)' : 'Total Property Views'}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{formatPropertyViewsCount(liveViews, isHindi)}</span>
            </span>

            {/* Mountain Feature Badges */}
            {property.roadAccess && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 flex items-center gap-1 shadow-xs">
                <span>🛣️</span>
                <span>{property.roadAccess}</span>
              </span>
            )}

            {property.bhooKanoonStatus && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800 flex items-center gap-1 shadow-xs">
                <span>📜</span>
                <span>{property.bhooKanoonStatus}</span>
              </span>
            )}

            {property.homestaySubsidyEligible && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shadow-xs">
                <span>🏔️</span>
                <span>{isHindi ? 'होमस्टे सब्सिडी पात्र' : 'Homestay Subsidy Eligible'}</span>
              </span>
            )}
          </div>

          {/* Title & Location */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-1">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {property.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-emerald-200/90 text-sm">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-emerald-100">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{property.location || property.city}</span>
                </div>

                <button
                  type="button"
                  onClick={handleOpenGoogleMaps}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                  title="View on Google Maps"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{isHindi ? 'मैप पर देखें' : 'View on Map'}</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </button>
              </div>
            </div>

            {/* Desktop Price Header */}
            <div className="hidden lg:block text-right shrink-0">
              <span className="text-xs font-bold text-slate-500 dark:text-emerald-300 uppercase tracking-wider block">
                {isForRent ? (isHindi ? 'मासिक किराया' : 'Monthly Rent') : (isHindi ? 'मांग मूल्य' : 'Asking Price')}
              </span>
              <span className="text-3xl font-black text-emerald-700 dark:text-white tracking-tight block">
                {property.priceDisplay ? formatLocalizedPrice(property.priceDisplay, isHindi ? 'hi' : 'en') : ''}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-emerald-300">
                {formattedRate || ''}
                {property.ratePerGajOrNali && property.ratePerGajOrNali !== formattedRate ? ` • ${property.ratePerGajOrNali}` : ''}
              </span>
            </div>
          </div>

        </div>

        {/* 3. PHOTO GALLERY MOSAIC (CLEAN HERO PRESENTATION) */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            
            {/* Primary Featured Photo */}
            <div className="lg:col-span-3 relative h-[280px] sm:h-[380px] md:h-[480px] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 shadow-lg border border-slate-200 dark:border-emerald-800/80 group">
              <img
                src={safeImages[activeImgIdx] || safeImages[0]}
                alt={`${property.title} - ${property.category || 'Property'} in ${property.location || property.city || 'Uttarakhand'}`}
                width={900}
                height={520}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-105"
                onClick={() => setIsLightboxOpen(true)}
              />

              {/* Bottom Caption on Photo */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-between text-white gap-2 z-10 pointer-events-none">
                <div>
                  <span className="text-xs text-emerald-300 font-bold tracking-wide uppercase block">
                    Photo {activeImgIdx + 1} of {safeImages.length}
                  </span>
                  <div className="text-sm sm:text-base font-bold truncate max-w-[240px] sm:max-w-md drop-shadow-md">
                    {property.location || property.city}, Uttarakhand
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="pointer-events-auto p-2.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white transition-colors cursor-pointer shrink-0 shadow-md flex items-center justify-center active:scale-95"
                  title={isHindi ? 'फुलस्क्रीन' : 'Fullscreen'}
                  aria-label="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Prev / Next photo buttons */}
              {safeImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIdx((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer shadow-lg active:scale-90 z-20"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIdx((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white transition-all cursor-pointer shadow-lg active:scale-90 z-20"
                    title="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Column */}
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-2.5">
              {safeImages.slice(0, 4).map((img, idx) => {
                const isSelected = activeImgIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`relative h-18 sm:h-22 lg:h-[110px] rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/30 scale-[1.02]'
                        : 'border-transparent opacity-75 hover:opacity-100 hover:border-emerald-300'
                    }`}
                  >
                    <img src={img} alt={`${property.title} - photo thumbnail ${idx + 1}`} width={220} height={140} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    {idx === 3 && safeImages.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-black">
                        +{safeImages.length - 4} more
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Property Video Tour */}
          {(() => {
            const propVideos = Array.from(
              new Set(
                [...(Array.isArray(property.videos) ? property.videos : []), ...(property.videoUrl ? [property.videoUrl] : [])].filter(
                  (v): v is string => Boolean(v && typeof v === 'string')
                )
              )
            );
            if (propVideos.length === 0) return null;
            return (
              <div className="pt-2 space-y-2.5">
                <h3 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isHindi ? 'प्रॉपर्टी वीडियो टूर' : 'Property Video Tour'}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {propVideos.map((vid, vIdx) => (
                    <div key={vIdx} className="rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-emerald-800/80 aspect-video shadow-lg">
                      <video
                        src={resolveApiUrl(vid)}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* 4. MAIN DETAILS & OWNER SIDEBAR (2-COLUMN GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* LEFT 2 COLUMNS: ALL PROPERTY DETAILS CLEANLY DISPLAYED */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* SECTION A: KEY HIGHLIGHTS STAT CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Area */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-emerald-300/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider">{isHindi ? 'क्षेत्रफल' : 'Area'}</span>
                  <Ruler className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2">
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block">
                    {formattedArea}
                  </span>
                </div>
              </div>

              {/* Bedrooms / Configuration */}
              {!isLandOrPlot && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 dark:text-emerald-300/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider">{isHindi ? 'कॉन्फ़िगरेशन' : 'Configuration'}</span>
                    <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="mt-2">
                    <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block">
                      {property.bedrooms > 0 ? `${property.bedrooms} BHK` : (property.configuration || property.type)}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                      {property.bathrooms > 0 ? `${property.bathrooms} Bathrooms` : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Facing & Vastu */}
              {property.facing && (<div className="p-4 rounded-2xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-emerald-300/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider">{isHindi ? 'दिशा / वास्तु' : 'Facing'}</span>
                  <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2">
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block truncate">
                    {property.facing || ''}
                  </span>
                </div>
              </div>)}

              {/* Property Age */}
              {formatPropertyAge(property.propertyAgeYears, isHindi) && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500 dark:text-emerald-300/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {isHindi ? 'प्रॉपर्टी की आयु' : 'Property Age'}
                    </span>
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="mt-2">
                    <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block truncate">
                      {formatPropertyAge(property.propertyAgeYears, isHindi)}
                    </span>
                  </div>
                </div>
              )}

              {/* Possession */}
              {property.possession && (<div className="p-4 rounded-2xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-emerald-300/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider">{isHindi ? 'कब्जा स्थिति' : 'Possession'}</span>
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2">
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block truncate">
                    {property.possession || ''}
                  </span>
                </div>
              </div>)}

            </div>

            {/* SECTION C: ABOUT THIS PROPERTY (NARRATIVE) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-sm space-y-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'प्रॉपर्टी के बारे में संपूर्ण जानकारी' : 'About this Property'}</span>
              </h3>

              {property.description && (
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 whitespace-pre-line font-normal">
                  {property.description}
                </div>
              )}
            </div>

            {/* SECTION D: SPECIFICATIONS TABLE (DETAILED KEY-VALUE GRID) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-emerald-800/60">
                <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'विस्तृत विनिर्देश एवं तकनीकी विवरण' : 'Detailed Property Specifications'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs sm:text-sm">
                
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-emerald-900/40">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-medium">{isHindi ? 'प्रॉपर्टी प्रकार' : 'Property Type'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{property.type}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-emerald-900/40">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-medium">{isHindi ? 'श्रेणी' : 'Category'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{property.category}</span>
                </div>

                {formatPropertyAge(property.propertyAgeYears, isHindi) && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-emerald-900/40">
                    <span className="text-slate-500 dark:text-emerald-300/80 font-medium">
                      {isHindi ? 'प्रॉपर्टी कितनी पुरानी है' : 'Property Age'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatPropertyAge(property.propertyAgeYears, isHindi)}
                    </span>
                  </div>
                )}

                {!isLandOrPlot && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-emerald-900/40">
                    <span className="text-slate-500 dark:text-emerald-300/80 font-medium">{isHindi ? 'फर्निशिंग' : 'Furnishing'}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {property.furnishing === 'Furnished' && (isHindi ? 'फर्निश्ड (Furnished)' : 'Furnished')}
                      {property.furnishing === 'Semi-Furnished' && (isHindi ? 'सेमी-फर्निश्ड (Semi-Furnished)' : 'Semi-Furnished')}
                      {property.furnishing === 'Unfurnished' && (isHindi ? 'अनफर्निश्ड (Unfurnished)' : 'Unfurnished')}
                      {!property.furnishing && '-'}
                    </span>
                  </div>
                )}

              </div>
            </div>

            {/* SECTION: UTTARAKHAND MOUNTAIN & LEGAL INFRASTRUCTURE */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white dark:from-[#09291e] dark:via-[#0c241c] dark:to-[#071912] border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-emerald-200/80 dark:border-emerald-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isHindi ? 'उत्तराखंड कानूनी व पहाड़ी अवसंरचना विवरण' : 'Uttarakhand Mountain & Legal Infrastructure'}</span>
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-700 dark:bg-emerald-900 text-white uppercase tracking-wider">
                  {isHindi ? 'लिस्टर द्वारा दी गई जानकारी' : 'Lister-Provided Details'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#071d15] border border-emerald-100 dark:border-emerald-900/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      {isHindi ? 'सड़क पहुंच व चौड़ाई' : 'Road Access & Width'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {property.roadAccess || (isHindi ? 'मोटरेबल पक्की सड़क संपर्क उपलब्ध' : 'Motorable Paved Road Access')}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#071d15] border border-emerald-100 dark:border-emerald-900/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      {isHindi ? 'भू-कानून व बाहरी खरीदार पात्रता (Sec 154 / 143)' : 'Bhoo-Kanoon & Outsider Quota (Sec 154 / 143)'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {property.bhooKanoonStatus || (isHindi ? 'अखिल भारतीय नागरिक हेतु पात्र (Freehold Outsider Allowed)' : 'All-India Outsider Freehold Eligible')}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#071d15] border border-emerald-100 dark:border-emerald-900/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      {isHindi ? 'जल स्रोत व आपूर्ति' : 'Water Source & Pipeline'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {property.waterSource || (isHindi ? 'जल संस्थान पाइपलाइन व प्राकृतिक पहाड़ी स्रोत' : 'Jal Sansthan Connection & Spring Line')}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white dark:bg-[#071d15] border border-emerald-100 dark:border-emerald-900/60 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <TreePine className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      {isHindi ? 'पर्यटन होमस्टे योजना' : 'Homestay Subsidy Scheme'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {property.homestaySubsidyEligible !== false 
                        ? (isHindi ? 'उत्तराखंड पर्यटन दीन दयाल होमस्टे सब्सिडी हेतु पात्र' : 'Eligible for Uttarakhand Tourism Homestay Subsidy')
                        : (isHindi ? 'लागू नहीं' : 'Not Applicable')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* OPTIONAL PROPERTY DOCUMENTS (PDF) */}
            {Array.isArray(property.documents) && property.documents.length > 0 && (
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-sm space-y-3">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isHindi ? 'प्रॉपर्टी दस्तावेज़ व लेआउट प्लान' : 'Property Documents & Layout Plans'}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={resolveApiUrl(doc.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#081a13] border border-slate-200 dark:border-emerald-900/50 hover:border-emerald-500 flex items-center justify-between gap-2 text-xs sm:text-sm font-bold text-slate-800 dark:text-emerald-100 transition-colors no-underline"
                    >
                      <span className="truncate">{doc.name || `Document ${idx + 1}.pdf`}</span>
                      <ExternalLink className="w-4 h-4 text-emerald-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION E: AMENITIES & FEATURES */}
            {!isLandOrPlot && safeAmenities.length > 0 && (
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isHindi ? 'सुविधाएं और प्रमुख विशेषताएं' : 'Amenities & Features'}</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {safeAmenities.map((amenity, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#081a13] border border-slate-100 dark:border-emerald-900/40 flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-emerald-100"
                    >
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY OWNER & INQUIRY CARD */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
            
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c241c] border-2 border-emerald-300/80 dark:border-emerald-800/80 shadow-xl space-y-5">
              
              {/* Asking Price Banner */}
              <div className="space-y-1 border-b border-slate-100 dark:border-emerald-800/60 pb-4">
                <span className="text-xs font-bold text-slate-500 dark:text-emerald-300 uppercase tracking-wider block">
                  {isForRent ? (isHindi ? 'मासिक किराया' : 'Monthly Rent') : (isHindi ? 'मांग मूल्य' : 'Asking Price')}
                </span>
                <span className="text-3xl font-black text-emerald-700 dark:text-white tracking-tight block">
                  {property.priceDisplay ? formatLocalizedPrice(property.priceDisplay, isHindi ? 'hi' : 'en') : ''}
                </span>
              </div>



              {/* Public Lister Information & Direct Phone / WhatsApp Contact */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#081a13] border border-slate-200 dark:border-emerald-900/50 space-y-3">
                {sellerDisplayName && (
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm uppercase">
                      {sellerDisplayName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                        {property.sellerType === 'Broker'
                          ? (isHindi ? 'ब्रोकर:' : 'Broker:')
                          : (isHindi ? 'मालिक:' : 'Owner:')}
                      </span>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate block">
                        {sellerDisplayName}
                      </span>
                    </div>
                  </div>
                )}

                {publicPhone && publicTelHref ? (
                  <div className="space-y-3 pt-2 border-t border-slate-200/70 dark:border-emerald-900/50">
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white truncate">
                          {formatPhoneForDisplay(publicPhone)}
                        </span>
                      </div>
                      <a
                        href={publicTelHref}
                        onClick={() => {
                          if (property.id) {
                            fetch(`/api/properties/${encodeURIComponent(property.id)}/inquiry`, { method: 'POST' }).catch(() => {});
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{isHindi ? 'कॉल करें' : 'Call'}</span>
                      </a>
                    </div>

                    {/* Customizable Direct WhatsApp Message */}
                    {publicWhatsAppHref && (
                      <div className="space-y-2">
                        <label
                          htmlFor="ukg-whatsapp-inquiry-msg"
                          className="block text-[11px] font-bold text-slate-700 dark:text-emerald-200"
                        >
                          {isHindi ? 'व्हाट्सएप संदेश (भेजने से पहले बदल सकते हैं):' : 'WhatsApp Message (customizable before sending):'}
                        </label>
                        <textarea
                          id="ukg-whatsapp-inquiry-msg"
                          rows={3}
                          value={customWhatsAppMsg}
                          onChange={(e) => setCustomWhatsAppMsg(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#25D366] resize-y"
                        />
                        <a
                          href={publicWhatsAppHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            if (property.id) {
                              fetch(`/api/properties/${encodeURIComponent(property.id)}/inquiry`, { method: 'POST' }).catch(() => {});
                            }
                          }}
                          className="w-full py-3 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 no-underline"
                        >
                          <WhatsAppIcon className="w-4 h-4 fill-white" />
                          <span>{isHindi ? 'व्हाट्सएप पर लिस्र्टर को संदेश भेजें' : 'Message Lister on WhatsApp'}</span>
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                    {isHindi
                      ? 'लिस्र्टर द्वारा सार्वजनिक फ़ोन नंबर प्रदान नहीं किया गया है।'
                      : 'No public phone number was provided for this listing.'}
                  </p>
                )}
              </div>

              {/* Optional In-App Chat & Share */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleInitiateChat}
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isHindi ? 'इनबॉक्स चैट' : 'Inbox Chat'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'लिंक शेयर करें' : 'Share Listing'}</span>
                </button>
              </div>

              {/* Owner Edit / Sold Controls */}
              {canManage && (
                <div className="pt-3 border-t border-slate-100 dark:border-emerald-800/60 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-emerald-400/80 uppercase block text-center">
                    {isHindi ? 'आपकी अपनी लिस्टिंग नियंत्रण' : 'Your Listing Controls'}
                  </span>

                  <div className="flex gap-2">
                    {onEditProperty && (
                      <button
                        type="button"
                        onClick={() => onEditProperty(property)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isHindi ? 'संपादित करें' : 'Edit'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleToggleSoldClick}
                      className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer ${
                        isSoldLocal
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                          : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                      }`}
                    >
                      <span>{isSoldLocal ? (isHindi ? 'उपलब्ध करें' : 'Mark Available') : (isHindi ? 'बिका हुआ करें' : 'Mark Sold')}</span>
                    </button>
                  </div>

                  {onDeleteProperty && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full py-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center justify-center gap-1 cursor-pointer pt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{isHindi ? 'लिस्टिंग हटाएं' : 'Delete Listing'}</span>
                    </button>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* 5. MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#071f16]/95 backdrop-blur-xl border-t border-slate-200 dark:border-emerald-800/80 p-3 shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-slate-500 dark:text-emerald-300 uppercase block truncate">
            {isForRent ? 'Rent' : ''}
          </span>
          <span className="text-lg font-black text-emerald-700 dark:text-white truncate block">
            {property.priceDisplay ? formatLocalizedPrice(property.priceDisplay, isHindi ? 'hi' : 'en') : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {publicTelHref && (
            <a
              href={publicTelHref}
              className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer no-underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{isHindi ? 'कॉल' : 'Call'}</span>
            </a>
          )}
          {publicWhatsAppHref ? (
            <a
              href={publicWhatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer no-underline"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>WhatsApp</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>{isHindi ? 'शेयर' : 'Share'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 6. FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar: Only keep the back icon */}
          <div className="flex items-center justify-start text-white py-2 px-2 sm:px-4 z-10" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all cursor-pointer border border-white/20 active:scale-95 shadow-xl flex items-center justify-center group"
              title={isHindi ? "वापस जाएं (Back)" : "Back to property details"}
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Main Photo Center */}
          <div className="relative flex-1 flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
            <img 
              src={safeImages[activeImgIdx]} 
              alt={`${property.title} - photo view ${activeImgIdx + 1}`} 
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl"
            />

            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImgIdx((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1))}
                  className="absolute left-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white cursor-pointer shadow-lg active:scale-90"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImgIdx((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white cursor-pointer shadow-lg active:scale-90"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="flex justify-center gap-2 overflow-x-auto py-2 px-4 z-10" onClick={(e) => e.stopPropagation()}>
            {safeImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIdx(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  activeImgIdx === idx ? 'border-emerald-500 scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${property.title} - photo preview ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. DELETE CONFIRMATION DIALOG */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#0c241c] rounded-3xl p-6 shadow-2xl border border-rose-300 dark:border-rose-900 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {isHindi ? 'क्या आप इस लिस्टिंग को हटाना चाहते हैं?' : 'Delete Property Listing?'}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isHindi 
                ? 'यह क्रिया स्थायी है। आपकी संपत्ति उत्तराखंड गेटवेज मार्केटप्लेस से हटा दी जाएगी।'
                : 'This action is irreversible. Your property listing will be permanently removed from Uttarakhand Gateways.'}
            </p>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  if (onDeleteProperty) {
                    onDeleteProperty(property.id);
                  }
                  onBack();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                {isHindi ? 'हां, हटाएं' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Uttarakhand Real Estate SEO Keyword Links */}
      {/* Related Properties & Buyer Verification Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-6">
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-slate-700 dark:text-emerald-100/85 leading-relaxed">
          <strong>Buyer Due Diligence Notice:</strong> This listing is submitted directly by the stated advertiser ({property.sellerType === 'Owner' ? 'Property Owner' : 'Broker'}). Prospective buyers and tenants must independently verify original title deeds, Bhulekh Uttarakhand Khatauni mutation entries, authority map approvals, and Section 154 land limits prior to token payment.
        </div>

        {(() => {
          const related = allProperties
            .filter((p) => p && p.id !== property.id && !p.isSold)
            .sort((a, b) => {
              const aSameCity = a.city === property.city ? 1 : 0;
              const bSameCity = b.city === property.city ? 1 : 0;
              const aSamePurpose = a.purpose === property.purpose ? 1 : 0;
              const bSamePurpose = b.purpose === property.purpose ? 1 : 0;
              return bSameCity + bSamePurpose - (aSameCity + aSamePurpose);
            })
            .slice(0, 3);

          const citySlug = getCitySlug(property.city || 'Uttarakhand');
          return (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Similar Properties in {property.city || 'Uttarakhand'}
                </h2>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <a
                    href={`/properties-in-${citySlug}`}
                    onClick={(e) => {
                      if (onNavigatePath) {
                        e.preventDefault();
                        onNavigatePath(`/properties-in-${citySlug}`);
                      } else if (onNavigateCity && property.city) {
                        e.preventDefault();
                        onNavigateCity(property.city);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white transition"
                  >
                    All in {property.city || 'Uttarakhand'}
                  </a>
                  <a
                    href={`/buy-property-in-${citySlug}`}
                    onClick={(e) => {
                      if (onNavigatePath) {
                        e.preventDefault();
                        onNavigatePath(`/buy-property-in-${citySlug}`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c241c] text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-800 hover:border-emerald-500 transition"
                  >
                    Buy in {property.city || 'Uttarakhand'}
                  </a>
                  <a
                    href={`/rental-properties-in-${citySlug}`}
                    onClick={(e) => {
                      if (onNavigatePath) {
                        e.preventDefault();
                        onNavigatePath(`/rental-properties-in-${citySlug}`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#0c241c] text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-800 hover:border-emerald-500 transition"
                  >
                    Rent in {property.city || 'Uttarakhand'}
                  </a>
                </div>
              </div>

              {related.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {related.map((rel) => {
                    const relImg =
                      Array.isArray(rel.images) && rel.images.length > 0
                        ? rel.images[0]
                        : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
                    const relHref = getPropertySlugPath(rel);
                    return (
                      <a
                        key={rel.id}
                        href={relHref}
                        onClick={(e) => {
                          if (onSelectProperty && !e.ctrlKey && !e.metaKey) {
                            e.preventDefault();
                            onSelectProperty(rel);
                          }
                        }}
                        className="group rounded-2xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                      >
                        <div className="h-40 overflow-hidden bg-slate-200 dark:bg-emerald-950">
                          <img
                            src={relImg}
                            alt={`${rel.title} - ${rel.type} in ${rel.city}`}
                            width={400}
                            height={160}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                                {formatLocalizedPrice(rel.priceDisplay || '', isHindi ? 'hi' : 'en')}
                              </div>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-emerald-200/80 tabular-nums shrink-0">
                                <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>{formatPropertyViewsCount(rel.views, isHindi)}</span>
                              </span>
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 transition">
                              {rel.title}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-emerald-200/75 truncate">
                              {rel.location || rel.city} • {formatPropertyArea(rel, isHindi)}
                            </div>
                          </div>
                          <div className="pt-1.5 border-t border-slate-100 dark:border-emerald-900/40 text-[11px] text-slate-500 dark:text-slate-300 truncate">
                            {rel.sellerType === 'Broker' ? (isHindi ? 'ब्रोकर: ' : 'Broker: ') : (isHindi ? 'मालिक: ' : 'Owner: ')}
                            <strong className="font-semibold text-slate-700 dark:text-white">
                              {getPropertyOwnerDisplayName(rel, currentUser, isHindi)}
                            </strong>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </section>

      <SeoKeywordsSection
        onNavigatePage={onNavigatePage}
        onNavigateCity={onNavigateCity}
        onNavigatePath={onNavigatePath}
      />

    </div>
  );
};
