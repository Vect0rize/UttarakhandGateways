import React, { useState, useEffect, useMemo } from 'react';
import { Property } from '../types';
import { 
  ArrowLeft,
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
  Unlock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Printer,
  Sparkles,
  Check,
  Video,
  Film
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isPropertyOwner } from '../utils/propertyOwnership';
import { formatLocalizedPrice, translatePropertyType } from '../utils/language';
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
  allProperties?: Property[];
  onSelectProperty?: (property: Property) => void;
  onOpenLegalPolicy?: (policyId: LegalPolicyId) => void;
}

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
  allProperties = [],
  onSelectProperty,
  onOpenLegalPolicy,
}) => {
  // Safe Image & Amenities Guards to guarantee 0 runtime crashes
  const safeImages = useMemo(() => {
    if (Array.isArray(property?.images) && property.images.length > 0) {
      return property.images.filter(Boolean);
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

  // Optimistic Sold Status (0ms instant response on click!)
  const [isSoldLocal, setIsSoldLocal] = useState<boolean>(Boolean(property?.isSold));
  const [soldNotice, setSoldNotice] = useState<string | null>(null);

  useEffect(() => {
    setIsSoldLocal(Boolean(property?.isSold));
  }, [property?.isSold]);

  // In-page EMI Calculator State
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTenureYears, setLoanTenureYears] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);

  const { isHindi } = useLanguage();
  const { currentUser, openAuthModal } = useAuth();

  const isOwner = property ? isPropertyOwner(property, currentUser) : false;
  const isAmitTyagi = currentUser?.username?.trim().toLowerCase() === 'amit tyagi';

  // Scroll to top when page mounts & listen for Escape key to undo/go back
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (property?.title) {
      document.title = `${property.title} | Uttarakhand Gateways`;
    }
  }, [property]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const handleShare = () => {
    if (!property) return;
    const url = `${window.location.origin}${window.location.pathname}?property=${property.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!property) return;
    const url = `${window.location.origin}${window.location.pathname}?property=${property.id}`;
    
    // Construct rich pre-filled message with property details & direct link
    const lines = [
      `🏡 *${property.title}*`,
      `📍 *Location:* ${property.location || property.city}, Uttarakhand`,
      `💰 *Price:* ${property.priceDisplay || `₹${priceNum.toLocaleString('en-IN')}`}`,
      `📐 *Area:* ${property.areaDisplay || `${property.areaSqFt} sq.ft`}`,
      ...(property.bedrooms > 0 
        ? [`🛏️ *Configuration:* ${property.bedrooms} BHK (${property.type})`] 
        : (property.type === 'Studio' || property.configuration?.toLowerCase().includes('studio'))
        ? [`🛏️ *Configuration:* Studio (${property.type})`]
        : [`🏷️ *Type:* ${property.type}`]),
      ...(property.possession ? [`📅 *Possession:* ${property.possession}`] : []),
      `⚡ *Brokerage:* 0% Direct Deal`,
      '',
      `👉 *Click to view photos & full details:*`,
      url
    ];

    const message = lines.join('\n');
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleInstantToggleSold = () => {
    if (!property) return;
    const nextStatus = !isSoldLocal;
    setIsSoldLocal(nextStatus); // Instant local update (0ms lag!)
    setSoldNotice(nextStatus ? (isHindi ? '✅ प्रॉपर्टी बिक चुकी (Sold Out) मार्क कर दी गई!' : '✅ Property marked as Sold Out!') : (isHindi ? '✅ प्रॉपर्टी फिर से उपलब्ध (Active) मार्क कर दी गई!' : '✅ Property marked as Available for Sale!'));
    setTimeout(() => setSoldNotice(null), 3000);
    
    // Call parent handler
    if (onToggleSold) {
      onToggleSold(property.id);
    }
  };

  // Price calculations
  const priceNum = typeof property?.price === 'string' ? parseFloat(property.price) : (property?.price || 0);
  const areaNum = typeof property?.areaSqFt === 'string' ? parseFloat(property.areaSqFt) : (property?.areaSqFt || 0);
  const pricePerSqFt = areaNum > 0 ? Math.round(priceNum / areaNum) : 0;

  // Approximate Uttarakhand land conversions
  const gajVal = areaNum > 0 ? Math.round(areaNum / 9) : 0;
  const naliVal = areaNum > 0 ? (areaNum / 2160).toFixed(1) : '0';

  // Inline EMI Calculation
  const loanAmount = priceNum * (1 - downPaymentPercent / 100);
  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = loanTenureYears * 12;
  const calculatedEmi = Math.round(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  const isPhoneApproved = phoneRequestStatus === 'approved';
  const isPhonePending = phoneRequestStatus === 'pending';
  const sellerDisplayName = property?.sellerName || (isHindi ? 'सीधे मालिक' : 'Direct Owner');
  const isForRent = property?.type === 'Rent/Lease' || Boolean(property?.isAvailableForRent) || (Boolean(property?.priceDisplay) && property.priceDisplay.toLowerCase().includes('/ month'));

  // Similar properties in the same city / category
  const similarProps = allProperties
    .filter((p) => p && p.id !== property?.id && (p.city === property?.city || p.category === property?.category))
    .slice(0, 3);

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-[#04160f]">
        <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Property Not Found</h2>
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 rounded-full bg-emerald-600 text-white font-bold text-sm cursor-pointer"
        >
          {isHindi ? 'सभी प्रॉपर्टीज पर वापस जाएं' : 'Back to Properties'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#04160f] text-slate-900 dark:text-slate-100 transition-colors pt-16 sm:pt-20 md:pt-24 pb-16">
      
      {/* 1. TOP STICKY NAVIGATION BAR WITH BACK BUTTON (Offset below fixed Navbar so info is never covered) */}
      <div className="sticky top-[58px] sm:top-[68px] md:top-[76px] z-40 bg-white/95 dark:bg-[#071f16]/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-emerald-900/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          
          {/* Back button & Breadcrumb */}
          <div className="flex items-center gap-3 truncate">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border border-emerald-500 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-95 group shrink-0"
              title={isHindi ? 'सभी प्रॉपर्टीज पर वापस लौटें' : 'Return to Properties'}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform text-white shrink-0" />
              <span>{isHindi ? '← वापस लौटें (Return)' : '← Return to Properties'}</span>
            </button>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-emerald-300/70 font-medium truncate">
              <span>{isHindi ? 'उत्तराखंड' : 'Uttarakhand'}</span>
              <span>/</span>
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">{property.city}</span>
              <span>/</span>
              <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-300">{property.title}</span>
            </div>
          </div>

          {/* Quick Actions (WhatsApp, Share, Save, Print) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Share on WhatsApp */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-2 sm:px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer"
              title={isHindi ? 'व्हाट्सएप पर शेयर करें' : 'Share on WhatsApp'}
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.505-4.475 9.98-9.969 9.98-1.749 0-3.385-.45-4.821-1.239l-4.71 1.234 1.258-4.593c-.879-1.488-1.396-3.228-1.396-5.082 0-5.505 4.475-9.98 9.969-9.98 5.494 0 9.969 4.475 9.969 9.98z" />
              </svg>
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 sm:px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isHindi ? 'प्रॉपर्टी लिंक कॉपी करें' : 'Share property link'}
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
              <span className="hidden sm:inline">{copiedLink ? (isHindi ? 'कॉपी हुआ!' : 'Copied!') : (isHindi ? 'शेयर' : 'Share')}</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleFavorite(property.id)}
              className={`p-2 sm:px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800'
              }`}
              title={isFavorite ? (isHindi ? 'सहेजी गई सूची से हटाएं' : 'Remove from saved') : (isHindi ? 'सहेजें' : 'Save Property')}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">{isFavorite ? (isHindi ? 'सहेजा गया' : 'Saved') : (isHindi ? 'सहेजें' : 'Save')}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden lg:flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              title={isHindi ? 'विवरण प्रिंट करें' : 'Print Property Sheet'}
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Instant Action Feedback Toast */}
      {soldNotice && (
        <div className="max-w-md mx-auto mt-4 px-4">
          <div className="p-3 bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{soldNotice}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* 2. PHOTO GALLERY MOSAIC & HERO VIEW */}
        <div className="space-y-3">
          
          {/* Main Large Display & Thumbnails */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            
            {/* Primary Featured Photo (spans 3 cols on desktop) */}
            <div className="lg:col-span-3 relative h-[300px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden bg-slate-950 shadow-lg border border-emerald-200 dark:border-emerald-900/80 group">
              <img
                src={safeImages[activeImgIdx] || safeImages[0]}
                alt={property.title}
                className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-[1.02]"
                onClick={() => setIsLightboxOpen(true)}
              />

              {/* Gradient Scrim for readable badges */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

              {/* Top Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* For Rent or For Sale badge */}
                  {isForRent ? (
                    <span className="bg-teal-600/95 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-teal-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-200 animate-pulse" />
                      <span>{isHindi ? 'किराये पर (For Rent)' : 'For Rent'}</span>
                    </span>
                  ) : (
                    <span className="bg-amber-400/95 backdrop-blur-md text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-amber-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                      <span>{isHindi ? 'बिक्री हेतु (For Sale)' : 'For Sale'}</span>
                    </span>
                  )}

                  <span className="bg-emerald-950/90 backdrop-blur-md border border-emerald-400/50 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {translatePropertyType(property.type, isHindi ? 'hi' : 'en')}
                  </span>
                  <span className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md text-emerald-800 dark:text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-300 shadow-sm flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>0% BROKERAGE</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isSoldLocal ? (
                    <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {isHindi ? 'बिक चुकी है (Sold Out)' : 'Sold Out'}
                    </span>
                  ) : (
                    <span className="bg-emerald-600/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {isHindi ? 'सत्यापित लिस्टिंग' : 'Verified Available'}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Caption on Photo */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                <div>
                  <span className="text-[11px] text-emerald-300 font-semibold tracking-wide uppercase">
                    Photo {activeImgIdx + 1} of {safeImages.length}
                  </span>
                  <div className="text-sm font-semibold truncate max-w-md drop-shadow-md">
                    {property.location || property.city}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'सभी तस्वीरें देखें' : 'View Fullscreen'}</span>
                </button>
              </div>

              {/* Prev / Next arrows */}
              {safeImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImgIdx((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    title="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Column on desktop */}
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-2.5">
              {safeImages.slice(0, 4).map((img, idx) => {
                const isSelected = activeImgIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`relative h-20 sm:h-24 lg:h-[112px] rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/30 scale-[1.02]'
                        : 'border-transparent opacity-75 hover:opacity-100 hover:border-emerald-300'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
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

        {/* 3. MAIN CONTENT: 2-COLUMN LUXURY LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLUMNS: Property Information, Specs, Video Tour, Amenities */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Title, Location & Price Header */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4">
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {property.category}
                </span>
                {property.reraStatus && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                    {property.reraStatus}
                  </span>
                )}
                {property.possession && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    {property.possession}
                  </span>
                )}
              </div>

              <div>
                <h1 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight">
                  {property.title}
                </h1>
                
                <div className="flex items-center gap-2 text-slate-600 dark:text-emerald-200/80 text-sm mt-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{property.location || property.city}, Uttarakhand</span>
                </div>
              </div>

              {/* Price & Rate banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-[#082b1f] dark:via-[#06241a] dark:to-[#041911] border border-emerald-200 dark:border-emerald-800/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-emerald-300/80 block">
                    {isHindi ? 'मांग मूल्य (Direct Owner Price)' : 'Asking Price (0% Commission)'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-300">
                    {formatLocalizedPrice(property.priceDisplay || `₹${priceNum.toLocaleString('en-IN')}`, isHindi ? 'hi' : 'en')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 dark:text-emerald-300/80 block">
                    {isHindi ? 'दर प्रति वर्ग फुट' : 'Rate per Sq.Ft'}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-emerald-200">
                    {property.ratePerSqFt || (pricePerSqFt > 0 ? `₹${pricePerSqFt.toLocaleString('en-IN')} / sq.ft` : 'N/A')}
                  </span>
                </div>
              </div>

            </div>

            {/* Quick Specification Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  {isHindi ? 'कुल क्षेत्रफल' : 'Super Area'}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white block">
                  {property.areaSqFt} sq.ft
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                  ≈ {gajVal} Gaj • {naliVal} Nali
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  {isHindi ? 'कमरे (Bedrooms)' : 'Configuration'}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white block">
                  {property.bedrooms > 0 
                    ? `${property.bedrooms} BHK` 
                    : (property.type === 'Studio' || property.configuration?.toLowerCase().includes('studio'))
                    ? 'Studio'
                    : (isHindi ? 'प्लॉट / भूमि' : 'Plot / Land')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {property.bathrooms > 0 ? `${property.bathrooms} ${isHindi ? 'बाथरूम' : 'Bathrooms'}` : '-'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  {isHindi ? 'दिशा (Facing)' : 'Facing'}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white block truncate">
                  {property.facing || '-'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {property.facing ? (isHindi ? 'दिशा' : 'Direction') : '-'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                  {isHindi ? 'कब्जा / रजिस्ट्री' : 'Possession'}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white block truncate">
                  {property.possession || '-'}
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block">
                  {property.possession ? (isHindi ? 'कब्जा स्थिति' : 'Possession Status') : '-'}
                </span>
              </div>
            </div>

            {/* Video Tour Walkthrough (if uploaded) */}
            {property.videoUrl && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#072118] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isHindi ? 'प्रॉपर्टी वीडियो व वर्चुअल टूर' : 'Property Video & Virtual Walkthrough'}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Live Video
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-md">
                  {property.videoUrl.startsWith('http') && (property.videoUrl.includes('youtube.com') || property.videoUrl.includes('youtu.be')) ? (
                    <iframe
                      src={property.videoUrl.replace('watch?v=', 'embed/')}
                      title="Property Video Tour"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <video
                      src={property.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Himalayan Mountain View & Altitude Card (Only if true) */}
            {property.himalayanPeakView && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-900 via-[#072c21] to-emerald-900 text-white border border-teal-400/40 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
                      {isHindi ? '360° हिमालयन दृश्य' : 'Himalayan Snow Peak View'}
                    </span>
                  </div>
                  {property.altitudeMsl && (
                    <span className="px-2.5 py-0.5 rounded-full bg-black/40 border border-teal-300/30 text-xs font-mono font-bold text-teal-200">
                      ⛰️ {property.altitudeMsl}
                    </span>
                  )}
                </div>

                <div className="text-base sm:text-lg font-serif-luxury font-semibold">
                  {property.peakName ? `Direct View of ${property.peakName}` : 'Spectacular Panoramic Himalayan Snow Range View'}
                </div>
              </div>
            )}

            {/* Detailed Description (Only if provided) */}
            {property.description?.trim() && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isHindi ? 'विस्तृत विवरण (Property Description)' : 'Property Overview & Description'}</span>
                </h3>

                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {property.description}
                </div>
              </div>
            )}

            {/* Amenities Grid (Only if selected) */}
            {safeAmenities.length > 0 && (
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isHindi ? 'सुविधाएं एवं विशेषताएं' : 'Amenities & Features'}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {safeAmenities.map((amenity, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {amenity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Embedded Mortgage / Loan EMI Calculator */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isHindi ? 'ईएमआई कैलकुलेटर' : 'Mortgage & EMI Calculator'}</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  Price: ₹{priceNum.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Down Payment</span>
                    <span className="font-bold text-emerald-600">{downPaymentPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={5}
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Tenure</span>
                    <span className="font-bold text-emerald-600">{loanTenureYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={loanTenureYears}
                    onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Interest Rate</span>
                    <span className="font-bold text-emerald-600">{interestRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={7}
                    max={12}
                    step={0.1}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              {/* Calculated Result Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-600 dark:text-emerald-300 block">
                    {isHindi ? 'अनुमानित मासिक किस्त (Monthly EMI)' : 'Estimated Monthly EMI'}
                  </span>
                  <span className="text-2xl font-black text-emerald-800 dark:text-emerald-300">
                    ₹{calculatedEmi.toLocaleString('en-IN')} <span className="text-xs font-normal">/ month</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenEmiCalculator?.(priceNum)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  {isHindi ? 'विस्तृत ब्रेकअप' : 'Full Amortization'}
                </button>
              </div>
            </div>

            {/* Legal Due Diligence & Title Notice */}
            <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{isHindi ? 'उत्तराखंड रजिस्ट्री व भू-कानून अनुपालन' : 'Uttarakhand Land Law & Title Verification'}</span>
              </div>
              <p className="leading-relaxed">
                {isHindi 
                  ? 'उत्तराखंड में ग्रामीण कृषि भूमि हेतु गैर-मूल निवासियों की सीमा २५० वर्ग मीटर निर्धारित है। धारा १४३ (आबादी) परिवर्तित संपत्तियां फ्रीहोल्ड रूप से सीधे पंजीकृत होती हैं। सौदे से पूर्व उप-निबंधक कार्यालय में १२ वर्षीय भार-मुक्त (Non-Encumbrance) जांच अनिवार्य है।' 
                  : 'For non-domiciles of Uttarakhand, unconverted agricultural land is subject to the statutory 250 sq. meter ceiling. Section 143 converted residential properties can be registered with clear title. Independent revenue check is recommended.'}
              </p>
              <button
                type="button"
                onClick={() => onOpenLegalPolicy?.('disclaimer')}
                className="text-emerald-700 dark:text-emerald-400 font-bold underline cursor-pointer pt-1 block"
              >
                {isHindi ? 'विधिक अस्वीकरण व नीतियां पढ़ें →' : 'Read Legal Due Diligence Notice →'}
              </button>
            </div>

          </div>

          {/* RIGHT 1 COLUMN: STICKY OWNER & INQUIRY CARD */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-20">
            
            {/* Direct Owner & Action Box */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#072118] border-2 border-emerald-300 dark:border-emerald-700 shadow-xl space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {sellerDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                      {isHindi ? 'सीधे संपत्ति विक्रेता' : 'Direct Property Seller'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {sellerDisplayName}
                    </h4>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase">
                  Verified
                </span>
              </div>

              {/* Price Callout */}
              <div className="text-center py-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  {isHindi ? 'प्रत्यक्ष सौदा मूल्य' : 'Direct Price'}
                </span>
                <span className="text-3xl font-black text-emerald-800 dark:text-emerald-300">
                  {formatLocalizedPrice(property.priceDisplay || `₹${priceNum.toLocaleString('en-IN')}`, isHindi ? 'hi' : 'en')}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                  ⚡ 0% Brokerage • Direct to Owner
                </span>
              </div>

              {/* Action 1: Protected Phone Number Reveal */}
              <div className="space-y-2">
                {isPhoneApproved && approvedPhoneNumber ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isHindi ? 'सत्यापित फ़ोन नंबर अनब्लॉक' : 'Verified Phone Unlocked'}</span>
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Approved
                      </span>
                    </div>

                    <div className="text-lg font-black text-emerald-950 dark:text-white tracking-wide text-center">
                      {approvedPhoneNumber}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`tel:${approvedPhoneNumber}`}
                        className="py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/91${approvedPhoneNumber.replace(/\D/g, '')}?text=Hello, I am interested in your property on Uttarakhand Gateways: ${property.title}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ) : isPhonePending ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-center space-y-1">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isHindi ? 'अनुरोध भेजा गया' : 'Phone Request Pending'}</span>
                    </span>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      {isHindi 
                        ? 'मालिक द्वारा इनबॉक्स में स्वीकृति मिलते ही नंबर दिखेगा।' 
                        : 'Owner has been notified in their Inbox. Number will unlock once approved.'}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        openAuthModal('login', isHindi ? 'मालिक का फ़ोन नंबर प्राप्त करने हेतु लॉगिन आवश्यक है।' : 'Please log in to request owner phone number.', () => {
                          onRequestPhoneNumber?.(property);
                        });
                        return;
                      }
                      onRequestPhoneNumber?.(property);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <span>{isHindi ? 'मालिक का नंबर मांगें (अनुरोध)' : 'Request Owner Phone Number'}</span>
                  </button>
                )}

                {/* Action 2: Direct In-App Chat */}
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser) {
                      openAuthModal('login', isHindi ? 'मालिक से सीधे इनबॉक्स चैट शुरू करने हेतु लॉगिन करें।' : 'Please log in to chat with property owner.', () => {
                        onStartChat?.(property);
                      });
                      return;
                    }
                    onStartChat?.(property);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isHindi ? 'मालिक से सीधे चैट करें' : 'Chat Directly with Owner'}</span>
                </button>

                {/* Action 3: Share on WhatsApp with pre-filled details */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/10 hover:shadow-lg active:scale-95 cursor-pointer"
                  title={isHindi ? 'व्हाट्सएप पर शेयर करें' : 'Share on WhatsApp'}
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.505-4.475 9.98-9.969 9.98-1.749 0-3.385-.45-4.821-1.239l-4.71 1.234 1.258-4.593c-.879-1.488-1.396-3.228-1.396-5.082 0-5.505 4.475-9.98 9.969-9.98 5.494 0 9.969 4.475 9.969 9.98z" />
                  </svg>
                  <span>{isHindi ? 'व्हाट्सएप पर शेयर करें (WhatsApp)' : 'Share on WhatsApp'}</span>
                </button>
              </div>

              {/* Instant Owner Controls: Mark Sold & Delete (0ms lag!) */}
              {(isOwner || isAmitTyagi) && (
                <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/60 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block uppercase tracking-wider">
                    {isAmitTyagi && !isOwner ? 'Platform Admin Controls' : 'Your Listing Controls'}
                  </span>

                  <button
                    type="button"
                    onClick={handleInstantToggleSold}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                      isSoldLocal
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    {isSoldLocal ? (isHindi ? '✅ पुनः बिक्री हेतु उपलब्ध करें (Mark Available)' : '✅ Mark Available for Sale') : (isHindi ? '⚠️ बिक चुकी मार्क करें (Mark as Sold)' : '⚠️ Mark as Sold Out')}
                  </button>

                  {showDeleteConfirm ? (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-200 text-xs space-y-2">
                      <p className="text-rose-800 dark:text-rose-200 font-semibold">
                        Are you sure you want to permanently delete this listing?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onDeleteProperty?.(property.id)}
                          className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full py-2 px-3 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'प्रॉपर्टी डिलीट करें' : 'Delete Listing'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Direct Return Option in Owner Action Box */}
              <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/60">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-2.5 px-4 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isHindi ? '← सभी प्रॉपर्टीज पर वापस जाएं' : '← Return to All Properties'}</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* 4. SIMILAR PROPERTIES SECTION */}
        {similarProps.length > 0 && (
          <div className="pt-10 border-t border-emerald-200/80 dark:border-emerald-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-serif-luxury">
                  {isHindi ? 'समान संपत्तियां (उत्तराखंड)' : `More Properties in ${property.city}`}
                </h3>
              </div>

              <button
                type="button"
                onClick={onBack}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {isHindi ? 'सभी देखें →' : 'View All Properties →'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarProps.map((simProp) => (
                <div
                  key={simProp.id}
                  onClick={() => onSelectProperty?.(simProp)}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#072118] border border-emerald-100 dark:border-emerald-900/60 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex gap-3 group"
                >
                  <img
                    src={simProp.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'}
                    alt={simProp.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">
                      {simProp.type}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                      {simProp.title}
                    </h5>
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block">
                      {formatLocalizedPrice(simProp.priceDisplay, isHindi ? 'hi' : 'en')}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate block">
                      {simProp.city} • {simProp.areaSqFt} sq.ft
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. BOTTOM ACTIONS: RETURN TO PROPERTIES & SHARE ON WHATSAPP */}
        <div className="pt-8 pb-4 flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-emerald-200/80 dark:border-emerald-900/60">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-700/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
            <span>{isHindi ? '← सभी प्रॉपर्टीज पर वापस लौटें' : '← Return to All Properties'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-950/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.505-4.475 9.98-9.969 9.98-1.749 0-3.385-.45-4.821-1.239l-4.71 1.234 1.258-4.593c-.879-1.488-1.396-3.228-1.396-5.082 0-5.505 4.475-9.98 9.969-9.98 5.494 0 9.969 4.475 9.969 9.98z" />
            </svg>
            <span>{isHindi ? 'व्हाट्सएप पर शेयर करें (WhatsApp)' : 'Share on WhatsApp'}</span>
          </button>
        </div>

      </div>

      {/* Floating Return Button for instant return anywhere on screen */}
      <button
        type="button"
        onClick={onBack}
        className="fixed bottom-4 left-4 z-40 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-slate-900/90 dark:bg-emerald-950/90 hover:bg-black dark:hover:bg-emerald-900 text-white border border-emerald-400/60 backdrop-blur-md shadow-xl flex items-center gap-2 text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-emerald-500/40"
        title={isHindi ? 'वापस प्रॉपर्टीज सूची पर जाएं' : 'Return to Properties'}
      >
        <ArrowLeft className="w-4 h-4 text-emerald-400" />
        <span>{isHindi ? 'वापस लौटें' : 'Return'}</span>
      </button>

      {/* 6. FULLSCREEN LIGHTBOX MODAL FOR ALL PHOTOS */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm font-semibold">
              {property.title} • {activeImgIdx + 1} / {safeImages.length}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Lightbox Center Image */}
          <div className="flex-1 flex items-center justify-center p-4 relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={safeImages[activeImgIdx]}
              alt={`Fullscreen ${activeImgIdx + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />

            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImgIdx((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1))}
                  className="absolute left-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImgIdx((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Bottom Carousel */}
          <div className="overflow-x-auto py-2 flex items-center justify-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            {safeImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIdx(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 cursor-pointer ${
                  activeImgIdx === idx ? 'border-emerald-400 scale-105' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img} alt={`thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
