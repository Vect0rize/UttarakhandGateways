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
  Calculator,
  Bookmark,
  MessageSquare,
  Lock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  ExternalLink,
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
  Building,
  CheckCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isPropertyOwner } from '../utils/propertyOwnership';
import { formatLocalizedPrice } from '../utils/language';
import { LegalPolicyId } from '../data/legalPolicies';

interface PropertyDetailPageProps {
  property: Property;
  onBack: () => void;
  onOpenEmiCalculator?: (price: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onStartChat?: (property: Property) => void;
  onRequestPhoneNumber?: (property: Property) => void;
  phoneRequestStatus?: 'none' | 'pending' | 'approved' | 'declined';
  approvedPhoneNumber?: string;
  onDeleteProperty?: (propertyId: string) => void;
  onToggleSold?: (propertyId: string) => void;
  onEditProperty?: (property: Property) => void;
  allProperties?: Property[];
  onSelectProperty?: (property: Property) => void;
  onOpenLegalPolicy?: (policyId: LegalPolicyId) => void;
}

// Safe numeric parser helper
const parseSafeNumber = (val: any, fallback = 0): number => {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
};

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  onBack,
  onOpenEmiCalculator,
  isFavorite,
  onToggleFavorite,
  onStartChat,
  onRequestPhoneNumber,
  phoneRequestStatus = 'none',
  approvedPhoneNumber,
  onDeleteProperty,
  onToggleSold,
  onEditProperty,
  allProperties = [],
  onSelectProperty,
  onOpenLegalPolicy,
}) => {
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

  // In-page Loan & EMI Calculator State
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTenureYears, setLoanTenureYears] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);

  const { isHindi } = useLanguage();
  const { currentUser, openAuthModal } = useAuth();

  const isOwner = property ? isPropertyOwner(property, currentUser) : false;

  // IMPORTANT: Guard against repeated auto-scrolling!
  // ONLY scroll to top once when the property ID changes (never on re-renders or polling intervals)
  const propertyId = property?.id;
  const lastScrolledPropId = useRef<string | null>(null);

  useEffect(() => {
    if (propertyId && lastScrolledPropId.current !== propertyId) {
      lastScrolledPropId.current = propertyId;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    if (property?.title) {
      document.title = `${property.title} | Uttarakhand Gateways`;
    }
  }, [propertyId, property?.title]);

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

  const handleShare = () => {
    if (!property) return;
    const url = `${window.location.origin}${window.location.pathname}?property=${property.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!property) return;
    const text = `🏡 *${property.title}*\n📍 ${property.location || property.city}, Uttarakhand\n💰 ${property.priceDisplay || ''}\n⚡ 0% Brokerage Direct Owner Deal\n\nCheck out this verified listing on Uttarakhand Gateways:\n${window.location.origin}${window.location.pathname}?property=${property.id}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
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

  // Comprehensive Uttarakhand land & size conversions
  const gajVal = areaNum > 0 ? Math.round(areaNum / 9) : 0;
  const naliVal = areaNum > 0 ? (areaNum / 2160).toFixed(2) : '0';
  const mutthiVal = areaNum > 0 ? (areaNum / 135).toFixed(1) : '0';
  const bighaVal = areaNum > 0 ? (areaNum / 8640).toFixed(2) : '0';
  const sqMeterVal = areaNum > 0 ? (areaNum / 10.7639).toFixed(1) : '0';
  const pricePerGaj = gajVal > 0 ? Math.round(priceNum / gajVal) : 0;

  // Safe EMI Calculation
  const loanAmount = priceNum > 0 ? priceNum * (1 - downPaymentPercent / 100) : 0;
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = loanTenureYears * 12;
  const calculatedEmi = (loanAmount > 0 && monthlyRate > 0)
    ? Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1))
    : 0;

  const isPhoneApproved = phoneRequestStatus === 'approved';
  const isPhonePending = phoneRequestStatus === 'pending';
  const sellerDisplayName = property?.sellerName || (isHindi ? 'सीधे मालिक' : 'Direct Owner');
  const isForRent = property?.type === 'Rent/Lease' || property?.purpose === 'rent' || Boolean(property?.isAvailableForRent) || (Boolean(property?.priceDisplay) && property.priceDisplay.toLowerCase().includes('/ month'));

  // Distance calculations based on city
  const city = property?.city || 'Dehradun';
  const airportInfo = property?.distanceFromAirport || (
    city === 'Dehradun' ? '28 km (Jolly Grant Airport)' :
    city === 'Mussoorie' ? '54 km (Jolly Grant Airport)' :
    city === 'Rishikesh' ? '21 km (Jolly Grant Airport)' :
    city === 'Haridwar' ? '38 km (Jolly Grant Airport)' :
    city === 'Nainital' || city === 'Bhimtal' || city === 'Bhowali' || city === 'Mukteshwar' ? '65-90 km (Pantnagar Airport)' :
    'Nearest Airport: Jolly Grant / Pantnagar'
  );

  const railwayInfo = property?.distanceFromRailway || (
    city === 'Dehradun' ? '6 km (Dehradun Railway Station)' :
    city === 'Mussoorie' ? '34 km (Dehradun Railway Station)' :
    city === 'Rishikesh' ? '4 km (Yog Nagari Rishikesh Station)' :
    city === 'Haridwar' ? '5 km (Haridwar Junction)' :
    city === 'Nainital' || city === 'Bhimtal' || city === 'Bhowali' ? '28-35 km (Kathgodam Railway Station)' :
    city === 'Mukteshwar' ? '62 km (Kathgodam Railway Station)' :
    'Connected via major railway network'
  );

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
    <div className="min-h-screen bg-[#f8faf9] dark:bg-[#071711] text-slate-900 dark:text-slate-100 transition-colors pt-20 sm:pt-24 pb-28 sm:pb-20 overflow-x-hidden relative z-10 w-full">
      
      {/* 1. TOP BREADCRUMB & ACTION BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 border-b border-slate-200 dark:border-emerald-900/50">
        
        {/* Back Link & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer group shrink-0"
            title={isHindi ? 'मार्केटप्लेस पर वापस जाएं' : 'Back to Marketplace'}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{isHindi ? 'वापस मार्केटप्लेस' : 'Back to Listings'}</span>
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
          {/* Copy Link */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-emerald-800 bg-white dark:bg-[#0c241c] hover:bg-slate-100 dark:hover:bg-[#102e24] text-slate-700 dark:text-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title={isHindi ? 'लिंक कॉपी करें' : 'Copy link'}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copiedLink ? (isHindi ? 'कॉपी हुआ!' : 'Copied!') : (isHindi ? 'लिंक' : 'Copy Link')}</span>
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={() => onToggleFavorite(property.id)}
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

            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-200 border border-emerald-400/50 flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>0% BROKERAGE DIRECT OWNER</span>
            </span>

            {isSoldLocal ? (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white uppercase tracking-wider">
                {isHindi ? '⚠️ बिक चुकी है (Sold Out)' : '⚠️ Sold Out'}
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-emerald-800 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>{property.reraStatus || 'Verified Property'}</span>
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
                  <span>{property.location || property.city}, {property.city}, Uttarakhand</span>
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
                {isForRent ? (isHindi ? 'मासिक किराया' : 'Monthly Rent') : (isHindi ? 'मांग मूल्य (Direct Deal)' : 'Direct Owner Price')}
              </span>
              <span className="text-3xl font-black text-emerald-700 dark:text-white tracking-tight block">
                {formatLocalizedPrice(property.priceDisplay || (priceNum > 0 ? `₹${priceNum.toLocaleString('en-IN')}` : 'Price on Request'), isHindi ? 'hi' : 'en')}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-emerald-300">
                {property.ratePerSqFt || (pricePerSqFt > 0 ? `₹${pricePerSqFt.toLocaleString('en-IN')} / sq.ft` : '')}
                {gajVal > 0 && pricePerGaj > 0 && ` • ₹${pricePerGaj.toLocaleString('en-IN')} / Gaj`}
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
                alt={property.title}
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
                  className="pointer-events-auto px-3.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-md"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'फुलस्क्रीन' : 'Fullscreen'}</span>
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
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
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
        </div>

        {/* 4. MAIN DETAILS & OWNER SIDEBAR (2-COLUMN GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          
          {/* LEFT 2 COLUMNS: ALL PROPERTY DETAILS CLEANLY DISPLAYED */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* SECTION A: KEY HIGHLIGHTS STAT CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Super Area */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-emerald-300/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider">{isHindi ? 'कुल क्षेत्रफल' : 'Super Area'}</span>
                  <Ruler className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2">
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block">
                    {areaNum > 0 ? `${areaNum.toLocaleString('en-IN')} sq.ft` : (property.areaDisplay || 'Spacious')}
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold block mt-0.5">
                    ≈ {gajVal} Gaj / {naliVal} Nali
                  </span>
                </div>
              </div>

              {/* Bedrooms / Configuration */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-emerald-300/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider">{isHindi ? 'कॉन्फ़िगरेशन' : 'Configuration'}</span>
                  <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2">
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block">
                    {property.bedrooms > 0 ? `${property.bedrooms} BHK` : property.type}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                    {property.bathrooms > 0 ? `${property.bathrooms} Bathrooms` : 'Ready Plot / Site'}
                  </span>
                </div>
              </div>

              {/* Facing & Vastu */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-emerald-300/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider">{isHindi ? 'दिशा / वास्तु' : 'Facing & Vastu'}</span>
                  <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2">
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block truncate">
                    {property.facing || (isHindi ? 'उत्तर-पूर्व' : 'North-East')}
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold block mt-0.5">
                    {isHindi ? '100% वास्तु अनुकूल' : 'Vastu Compliant'}
                  </span>
                </div>
              </div>

              {/* Possession */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 dark:text-emerald-300/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider">{isHindi ? 'कब्जा स्थिति' : 'Possession'}</span>
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-2">
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block truncate">
                    {property.possession || (isHindi ? 'तत्काल कब्जा' : 'Immediate')}
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold block mt-0.5">
                    {isHindi ? 'कब्जा हेतु तैयार' : 'Ready to Move / Build'}
                  </span>
                </div>
              </div>

            </div>

            {/* SECTION B: COMPLETE SIZE CONVERSION TABLE (GAJ, NALI, MUTTHI, BIGH) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-800/60">
                <div className="flex items-center gap-2.5">
                  <Ruler className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {isHindi ? 'भूमि माप और आकार विवरण (सभी इकाइयां)' : 'Land Size & Measurement Conversion'}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-emerald-300 font-semibold">
                  Uttarakhand Standard
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#081a13] border border-slate-100 dark:border-emerald-900/40">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-emerald-300 uppercase block">Square Feet</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">
                    {areaNum > 0 ? `${areaNum.toLocaleString('en-IN')} sq.ft` : (property.areaDisplay || 'N/A')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#081a13] border border-slate-100 dark:border-emerald-900/40">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-emerald-300 uppercase block">Gaj (Sq. Yards)</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">
                    {gajVal > 0 ? `${gajVal} Gaj` : 'N/A'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#081a13] border border-slate-100 dark:border-emerald-900/40">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-emerald-300 uppercase block">Hill Nali</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">
                    {naliVal} Nali
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-emerald-400/80 block">1 Nali = 2,160 sq.ft</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#081a13] border border-slate-100 dark:border-emerald-900/40">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-emerald-300 uppercase block">Square Meters</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">
                    {sqMeterVal} m²
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION C: ABOUT THIS PROPERTY (NARRATIVE) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-sm space-y-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'प्रॉपर्टी के बारे में संपूर्ण जानकारी' : 'About this Property'}</span>
              </h3>

              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 whitespace-pre-line font-normal">
                {property.description || (
                  `Exceptional ${property.type} located in prime ${property.location || property.city}, Uttarakhand. Ideal for luxury living, vacation home, or long-term high-yield investment. The property features clear freehold registry title with direct road access, scenic Himalayan nature surroundings, and high quality civic infrastructure.`
                )}
              </div>
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

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-emerald-900/40">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-medium">{isHindi ? 'सड़क चौड़ाई' : 'Road Access Width'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{(property as any).roadWidth ? `${(property as any).roadWidth} ft Wide` : '20-25 ft Paved Road'}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-emerald-900/40">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-medium">{isHindi ? 'भूमि रूपांतरण स्थिति' : 'Land Conversion (Sec 143)'}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">{(property as any).is143Approved ? 'Section 143 Approved Non-Agri' : 'Standard Mutation Clear'}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-emerald-900/40">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-medium">{isHindi ? 'बिजली आपूर्ति' : 'Electricity Connection'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{(property as any).electricitySupply || '3-Phase UPCL Grid Connected'}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-emerald-900/40">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-medium">{isHindi ? 'पानी की उपलब्धता' : 'Water Supply'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{(property as any).waterSource || '24/7 Jal Sansthan & Natural Spring'}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-emerald-900/40">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-medium">{isHindi ? 'फर्निशिंग' : 'Furnishing'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{(property as any).furnishing || 'Semi-Furnished'}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-emerald-900/40">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-medium">{isHindi ? 'निर्माण आयु' : 'Age of Construction'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{(property as any).ageOfConstruction || 'New / Under 2 Years'}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-emerald-900/40">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-medium">{isHindi ? 'मंजिल' : 'Floor Level'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{(property as any).floorNumber ? `${(property as any).floorNumber} of ${(property as any).totalFloors || 3}` : 'Independent Ground Level'}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-emerald-900/40">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-medium">{isHindi ? 'पार्किंग' : 'Dedicated Parking'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{(property as any).parking || 'Yes (Covered + Open)'}</span>
                </div>

              </div>
            </div>

            {/* SECTION E: AMENITIES & FEATURES */}
            {safeAmenities.length > 0 && (
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

            {/* SECTION G: LOCATION & CONNECTIVITY */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'आसपास की कनेक्टिविटी एवं दूरी' : 'Location & Connectivity'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#081a13] border border-slate-100 dark:border-emerald-900/40 space-y-1">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-bold block">{isHindi ? 'निकटतम रेलवे स्टेशन' : 'Nearest Railway Station'}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white block">{railwayInfo}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#081a13] border border-slate-100 dark:border-emerald-900/40 space-y-1">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-bold block">{isHindi ? 'निकटतम हवाई अड्डा' : 'Nearest Airport'}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white block">{airportInfo}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#081a13] border border-slate-100 dark:border-emerald-900/40 space-y-1">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-bold block">{isHindi ? 'राष्ट्रीय राजमार्ग' : 'National Highway'}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white block">Connected via All-Weather Road</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#081a13] border border-slate-100 dark:border-emerald-900/40 space-y-1">
                  <span className="text-slate-500 dark:text-emerald-300/80 font-bold block">{isHindi ? 'स्वास्थ्य व बाजार' : 'Hospital & Market'}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white block">Within 2.5 - 5.0 km</span>
                </div>
              </div>
            </div>

            {/* SECTION H: INTERACTIVE LOAN & EMI CALCULATOR */}
            {!isForRent && priceNum > 0 && (
              <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0c241c] border border-slate-200 dark:border-emerald-800/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-emerald-800/60">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {isHindi ? 'गृह ऋण ईएमआई कैलकुलेटर' : 'Home Loan EMI Calculator'}
                    </h3>
                  </div>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                    ₹{calculatedEmi.toLocaleString('en-IN')} / mo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Down payment */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-emerald-300/80">{isHindi ? 'डाउन पेमेंट' : 'Down Payment'}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{downPaymentPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      step={5}
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* Tenure */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-emerald-300/80">{isHindi ? 'लोन अवधि' : 'Tenure'}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{loanTenureYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={30}
                      step={1}
                      value={loanTenureYears}
                      onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* Rate */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-emerald-300/80">{isHindi ? 'ब्याज दर' : 'Interest Rate'}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{interestRate}% p.a.</span>
                    </div>
                    <input
                      type="range"
                      min={7.0}
                      max={12.0}
                      step={0.25}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-[#081a13] border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-emerald-200">
                  <span>Estimated Loan Amount: ₹{Math.round(loanAmount).toLocaleString('en-IN')}</span>
                  <span>Monthly EMI: <strong className="text-emerald-700 dark:text-emerald-300 font-extrabold text-sm">₹{calculatedEmi.toLocaleString('en-IN')}</strong></span>
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
                  {isForRent ? (isHindi ? 'मासिक किराया' : 'Monthly Rent') : (isHindi ? 'मांग मूल्य (Direct Deal)' : 'Direct Owner Price')}
                </span>
                <span className="text-3xl font-black text-emerald-700 dark:text-white tracking-tight block">
                  {formatLocalizedPrice(property.priceDisplay || (priceNum > 0 ? `₹${priceNum.toLocaleString('en-IN')}` : 'Price on Request'), isHindi ? 'hi' : 'en')}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>0% Brokerage • Direct to Owner</span>
                </span>
              </div>

              {/* Owner Info */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#081a13] border border-slate-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm uppercase">
                    {sellerDisplayName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate block">
                      {sellerDisplayName}
                    </span>
                    {property.sellerType === 'Broker' && (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5">
                        Broker
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action 1: Chat with Owner */}
              <button
                type="button"
                onClick={() => {
                  if (onStartChat) {
                    if (!currentUser) {
                      openAuthModal('login', isHindi ? 'मालिक से सीधे चैट करने हेतु कृपया लॉगिन करें।' : 'Please sign in with your email or WhatsApp number and password to chat with the owner.', () => {
                        onStartChat(property);
                      });
                    } else {
                      onStartChat(property);
                    }
                  }
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isHindi ? 'मालिक से चैट करें (Chat)' : 'Chat with Owner'}</span>
              </button>

              {/* Action 2: Request / View Phone Number */}
              {isPhoneApproved && approvedPhoneNumber ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700/80 text-center space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">Verified Owner Phone</span>
                  <a 
                    href={`tel:${approvedPhoneNumber}`}
                    className="text-base font-black text-emerald-700 dark:text-emerald-200 hover:underline flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{approvedPhoneNumber}</span>
                  </a>
                </div>
              ) : isPhonePending ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/80 text-center text-xs text-amber-800 dark:text-amber-200 font-semibold">
                  <span>⏳ Phone number request sent to owner. You will be notified once approved.</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onRequestPhoneNumber) {
                      if (!currentUser) {
                        openAuthModal('login', isHindi ? 'मालिक का फ़ोन नंबर प्राप्त करने हेतु लॉगिन आवश्यक है।' : 'Please sign in with your email or WhatsApp number via OTP to request the owner phone number.', () => {
                          onRequestPhoneNumber(property);
                        });
                      } else {
                        onRequestPhoneNumber(property);
                      }
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-emerald-800 hover:bg-slate-50 dark:hover:bg-[#102e24] text-slate-800 dark:text-emerald-100 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'मालिक का फ़ोन नंबर मांगें' : 'Request Owner Phone Number'}</span>
                </button>
              )}

              {/* Owner Edit / Sold Controls */}
              {isOwner && (
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
            {isForRent ? 'Rent' : 'Direct Deal'} • 0% Brokerage
          </span>
          <span className="text-lg font-black text-emerald-700 dark:text-white truncate block">
            {formatLocalizedPrice(property.priceDisplay || (priceNum > 0 ? `₹${priceNum.toLocaleString('en-IN')}` : 'Price on Request'), isHindi ? 'hi' : 'en')}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (onStartChat) {
                if (!currentUser) {
                  openAuthModal('login', isHindi ? 'मालिक से सीधे चैट करने हेतु कृपया लॉगिन करें।' : 'Please sign in with your email or WhatsApp number and password to chat with the owner.', () => {
                    onStartChat(property);
                  });
                } else {
                  onStartChat(property);
                }
              }
            }}
            className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isHindi ? 'मालिक से चैट' : 'Chat with Owner'}</span>
          </button>
        </div>
      </div>

      {/* 6. FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white py-2 px-4 z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm">{property.title}</span>
              <span className="text-xs text-emerald-400">({activeImgIdx + 1} of {safeImages.length})</span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Main Photo Center */}
          <div className="relative flex-1 flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
            <img 
              src={safeImages[activeImgIdx]} 
              alt={`Full view ${activeImgIdx + 1}`} 
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
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
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

    </div>
  );
};
