import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { 
  X, 
  MapPin, 
  Home, 
  Maximize2, 
  Compass, 
  ShieldCheck, 
  Calendar, 
  MessageCircle, 
  Phone, 
  Share2, 
  Download, 
  Plane, 
  Train, 
  ChevronLeft, 
  ChevronRight,
  Calculator,
  Bookmark,
  MessageSquare,
  Lock,
  Clock,
  Unlock,
  User,
  Trash2,
  Layers,
  Video
} from 'lucide-react';
import { resolveApiUrl } from '../config/apiConfig';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isPropertyOwner, canManageProperty, getPropertyOwnerDisplayName } from '../utils/propertyOwnership';
import { formatLocalizedPrice, translatePropertyType } from '../utils/language';
import { formatPropertyArea, formatPropertyRate, isLandOrPlotProperty } from '../utils/areaUnits';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onOpenEmiCalculator: (price: number) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onStartChat?: (property: Property) => void;
  onRequestPhoneNumber?: (property: Property) => void;
  phoneRequestStatus?: 'none' | 'pending' | 'approved' | 'declined';
  approvedPhoneNumber?: string;
  onDeleteProperty?: (propertyId: string) => void;
  onToggleSold?: (propertyId: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onOpenEmiCalculator,
  isFavorite,
  onToggleFavorite,
  onStartChat,
  onRequestPhoneNumber,
  phoneRequestStatus = 'none',
  approvedPhoneNumber,
  onDeleteProperty,
  onToggleSold,
}) => {
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadingBrochure, setDownloadingBrochure] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localPhoneRequested, setLocalPhoneRequested] = useState(false);
  const { isHindi } = useLanguage();
  const { currentUser, openAuthModal } = useAuth();

  const isDirectOwner = property ? isPropertyOwner(property, currentUser) : false;
  const canManage = property ? canManageProperty(property, currentUser) : false;
  const isOwner = canManage;
  const isForRent = property ? (property.type === 'Rent/Lease' || Boolean(property.isAvailableForRent) || (Boolean(property.priceDisplay) && property.priceDisplay.toLowerCase().includes('/ month'))) : false;

  if (!property) return null;

  const isLandOrPlot = isLandOrPlotProperty(property);
  const formattedArea = formatPropertyArea(property, isHindi);
  const formattedRate = formatPropertyRate(property, isHindi);
  const safeAmenities = Array.isArray(property.amenities) ? property.amenities.filter(Boolean) : [];

  useEffect(() => {
    if (property?.id) {
      fetch(`/api/properties/${encodeURIComponent(property.id)}/view`, { method: 'POST' }).catch(() => {});
    }
  }, [property?.id]);

  const getDeepLink = () => {
    const origin = window.location.origin;
    const rawPath = window.location.pathname.startsWith('/?') ? '/' : window.location.pathname;
    const cleanPath = rawPath === '' ? '/' : rawPath;
    return `${origin}${cleanPath}?property=${encodeURIComponent(property.id)}`;
  };

  const handleShare = () => {
    if (!currentUser) {
      openAuthModal('login', isHindi ? 'प्रॉपर्टी शेयर करने हेतु कृपया पहले लॉगिन करें।' : 'Please sign in to share listings.');
      return;
    }
    const deepLink = getDeepLink();
    try {
      fetch(`/api/properties/${encodeURIComponent(property.id)}/share`, { method: 'POST' }).catch(() => {});
      navigator.clipboard.writeText(deepLink);
    } catch {}
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      const priceText = property.priceDisplay ? ` | ${property.priceDisplay}` : '';
      const shareMessage = `🏡 *${property.title}*${priceText}\n📍 ${property.location || property.city}, Uttarakhand\n\n🔗 ${deepLink}`;
      window.location.href = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
    }
  };

  const handleDownloadBrochure = () => {
    if (!currentUser) {
      openAuthModal('login', isHindi ? 'विवरण पुस्तिका डाउनलोड करने हेतु कृपया पहले लॉगिन करें।' : 'Please sign in to download property brochures.');
      return;
    }
    setDownloadingBrochure(true);
    setTimeout(() => {
      setDownloadingBrochure(false);
      window.print();
    }, 800);
  };

  // Rough estimation of monthly EMI for Indian 20-year loan at 8.5%
  const loanPrincipal = property.price * 0.8;
  const monthlyRate = 8.5 / (12 * 100);
  const tenureMonths = 20 * 12;
  const estimatedEmi = Math.round(
    (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/70 backdrop-blur-md">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#071c14] border border-emerald-200 dark:border-emerald-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-[#051810]/95 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 truncate pr-4">
            {isForRent ? (
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-600 text-white border border-teal-400 flex items-center gap-1 shadow-xs shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-200 animate-pulse" />
                <span>{isHindi ? 'किराये पर • For Rent' : 'For Rent'}</span>
              </span>
            ) : (
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 border border-amber-300 flex items-center gap-1 shadow-xs shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                <span>{isHindi ? 'बिक्री हेतु • For Sale' : 'For Sale'}</span>
              </span>
            )}
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
              {translatePropertyType(property.type, isHindi ? 'hi' : 'en')}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate font-serif-luxury">
              {property.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Save for later toggle button */}
            <button
              onClick={() => {
                if (!currentUser) {
                  openAuthModal('login', isHindi ? 'संपत्ति सहेजने हेतु कृपया पहले लॉगिन करें।' : 'Please sign in to save properties.');
                  return;
                }
                onToggleFavorite(property.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isFavorite 
                  ? 'bg-rose-500 text-white border-rose-400' 
                  : 'bg-white dark:bg-[#0a281c] hover:bg-emerald-50 dark:hover:bg-[#0f3427] text-slate-700 dark:text-slate-200 border-emerald-200 dark:border-emerald-800'
              }`}
              title={isFavorite ? (isHindi ? "सहेजा गया" : "Saved for later") : (isHindi ? "सहेजें" : "Save for later")}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{isFavorite ? (isHindi ? 'सहेजा गया' : 'Saved') : (isHindi ? 'सहेजें' : 'Save for later')}</span>
            </button>

            {/* Share link */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white dark:bg-[#0a281c] hover:bg-emerald-50 dark:hover:bg-[#0f3427] border border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors relative cursor-pointer"
              title={isHindi ? "प्रॉपर्टी लिंक शेयर करें" : "Share Property"}
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                  {isHindi ? 'लिंक कॉपी हो गया!' : 'Link Copied!'}
                </span>
              )}
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white dark:bg-[#0a281c] hover:bg-emerald-100 dark:hover:bg-[#0f3427] border border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-200 transition-colors ml-1 cursor-pointer"
              aria-label={isHindi ? "बंद करें" : "Close dialog"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#061811] border border-emerald-200 dark:border-emerald-800 shadow-inner">
              <img
                src={property.images[selectedImgIdx]}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white">
                {isHindi ? `फोटो ${selectedImgIdx + 1} / ${property.images.length}` : `Photo ${selectedImgIdx + 1} of ${property.images.length}`}
              </div>

              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImgIdx((prev) => (prev - 1 + property.images.length) % property.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImgIdx((prev) => (prev + 1) % property.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails row */}
            {property.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-emerald-200 dark:scrollbar-thumb-emerald-800">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImgIdx(idx)}
                    className={`relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImgIdx === idx 
                        ? 'border-emerald-600 scale-105' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Property Walkthrough Videos */}
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
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Video className="w-4 h-4" />
                    <span>{isHindi ? 'प्रॉपर्टी वीडियो टूर' : 'Property Video Tour'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {propVideos.map((vid, vIdx) => (
                      <div key={vIdx} className="rounded-2xl overflow-hidden bg-black border border-emerald-200 dark:border-emerald-800 aspect-video shadow-md">
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

          {/* Details Section: 2 Columns on Desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 8 Cols: Specs & Highlights */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Title & Pricing Block */}
              <div>
                <div className="flex flex-wrap items-baseline gap-3 mb-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-serif-luxury">
                    {formatLocalizedPrice(property.priceDisplay, isHindi ? 'hi' : 'en')}
                  </span>
                  {formattedRate && (
                    <span className="text-sm font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      ({formattedRate})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-emerald-200/80 text-sm mb-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="font-medium">{property.location}, {property.city} ({property.region} {isHindi ? 'उत्तराखंड' : 'Uttarakhand'})</span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                  "{property.tagline}"
                </p>
              </div>

              {/* Property Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                <div className="bg-emerald-50/70 dark:bg-[#0a281c] p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                  <div className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Maximize2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'क्षेत्रफल' : 'Area'}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {formattedArea}
                  </div>
                </div>

                {!isLandOrPlot && (
                  <div className="bg-emerald-50/70 dark:bg-[#0a281c] p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                    <div className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                      <Home className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{isHindi ? 'संरचना' : 'Configuration'}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {property.configuration.replace(/BHK/gi, isHindi ? 'बीएचके' : 'BHK')}
                    </div>
                  </div>
                )}

                {!isLandOrPlot && (
                  <div className="bg-emerald-50/70 dark:bg-[#0a281c] p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                    <div className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                      <Layers className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{isHindi ? 'फर्निशिंग' : 'Furnishing'}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {property.furnishing === 'Furnished' && (isHindi ? 'फर्निश्ड' : 'Furnished')}
                      {property.furnishing === 'Semi-Furnished' && (isHindi ? 'सेमी-फर्निश्ड' : 'Semi-Furnished')}
                      {property.furnishing === 'Unfurnished' && (isHindi ? 'अनफर्निश्ड' : 'Unfurnished')}
                      {!property.furnishing && '-'}
                    </div>
                  </div>
                )}

                <div className="bg-emerald-50/70 dark:bg-[#0a281c] p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                  <div className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Compass className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'दिशा व धूप' : 'Facing & Light'}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate" title={property.facing || '-'}>
                    {property.facing ? (isHindi ? property.facing.replace(/North/gi, 'उत्तर').replace(/South/gi, 'दक्षिण').replace(/East/gi, 'पूर्व').replace(/West/gi, 'पश्चिम') : property.facing) : '-'}
                  </div>
                </div>

                <div className="bg-emerald-50/70 dark:bg-[#0a281c] p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'कब्जा' : 'Possession'}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 truncate">
                    {property.possession ? (isHindi ? (property.possession.toLowerCase().includes('immediate') ? 'तत्काल रजिस्ट्री' : property.possession) : property.possession) : '-'}
                  </div>
                </div>
              </div>

              {/* Uttarakhand Mountain & Legal Infrastructure Details */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 dark:from-[#0a281c] dark:via-[#092218] dark:to-[#0a281c] border border-emerald-200/90 dark:border-emerald-800/80 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'उत्तराखंड पहाड़ी इन्फ्रास्ट्रक्चर व भू-कानून' : 'Uttarakhand Land Law & Hill Infrastructure'}</span>
                  </h4>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-emerald-300/80">
                    👁️ {property.views || 48} {isHindi ? 'व्यूज' : 'views'} • 🔄 {property.shares || 12} {isHindi ? 'शेयर' : 'shares'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* Road Access */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#071f16] border border-emerald-200/60 dark:border-emerald-800/60 flex items-start gap-2.5">
                    <span className="text-lg shrink-0 mt-0.5">🛣️</span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase block">{isHindi ? 'सड़क पहुंच व चौड़ाई' : 'Road Access & Width'}</span>
                      <strong className="text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm">{property.roadAccess || (isHindi ? '20 फीट मोटर योग्य पक्की सड़क' : '20 ft Motorable Pukka Road')}</strong>
                    </div>
                  </div>

                  {/* Bhoo-Kanoon Status */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#071f16] border border-emerald-200/60 dark:border-emerald-800/60 flex items-start gap-2.5">
                    <span className="text-lg shrink-0 mt-0.5">📜</span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase block">{isHindi ? 'भू-कानून स्थिति (Section 154 / 143)' : 'Bhoo-Kanoon & Outsider Limit'}</span>
                      <strong className="text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm">{property.bhooKanoonStatus || (isHindi ? 'बाहरी व्यक्तियों हेतु मान्य (1.25 नाली / 250 sq.m)' : 'Outsider Eligible (Under 250 sq.m / 143)')}</strong>
                    </div>
                  </div>

                  {/* Water Source */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#071f16] border border-emerald-200/60 dark:border-emerald-800/60 flex items-start gap-2.5">
                    <span className="text-lg shrink-0 mt-0.5">💧</span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase block">{isHindi ? 'पानी व बिजली कनेक्शन' : 'Water & Power Source'}</span>
                      <strong className="text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm">{property.waterSource || (isHindi ? 'जल संस्थान सरकारी सप्लाई + 3-फेज बिजली' : 'Jal Sansthan Tap Supply + 3-Phase Power')}</strong>
                    </div>
                  </div>

                  {/* Homestay Subsidy */}
                  <div className="p-3 rounded-xl bg-white dark:bg-[#071f16] border border-emerald-200/60 dark:border-emerald-800/60 flex items-start gap-2.5">
                    <span className="text-lg shrink-0 mt-0.5">🏔️</span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase block">{isHindi ? 'पर्यटन होमस्टे सब्सिडी' : 'Homestay Scheme (Govt Subsidy)'}</span>
                      <strong className="text-emerald-700 dark:text-emerald-300 font-semibold text-xs sm:text-sm">{isHindi ? 'पं. दीनदयाल उपाध्याय योजना पात्र (Eligible)' : 'Eligible for Tourism Scheme'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <h3 className="text-base font-bold text-[#0a271c] dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  <span>{isHindi ? 'प्रॉपर्टी विवरण' : 'Property Overview'}</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Key Highlights */}
              <div>
                <h3 className="text-base font-bold text-[#0a271c] dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  <span>{isHindi ? 'प्रमुख विशेषताएं' : 'Key Highlights'}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.highlights.map((highlight, i) => (
                    <div 
                      key={i} 
                      className="p-3 rounded-xl bg-emerald-50/60 dark:bg-[#0a281c] border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities List */}
              {!isLandOrPlot && safeAmenities.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-[#0a271c] dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                    <span>{isHindi ? 'सुविधाएं व व्यवस्थाएं' : 'Features & Amenities'}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {safeAmenities.map((amenity, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-[#0a281c] border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Distances & Access */}
              <div className="bg-emerald-50/70 dark:bg-[#0a281c] p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 mb-3">
                  {isHindi ? 'आवागमन और प्रमुख दूरियां' : 'Travel & Connectivity'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>{isHindi ? 'हवाई अड्डा:' : 'Airport:'} {property.distanceFromAirport}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Train className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>{isHindi ? 'रेलवे स्टेशन:' : 'Railway:'} {property.distanceFromRailway}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Contact & Consultation */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Primary Action Card: Direct Owner Contact & Privacy Protection */}
              <div className="bg-gradient-to-b from-emerald-50/90 to-teal-50/60 dark:from-[#09251b] dark:to-[#071f16] p-5 rounded-3xl border border-emerald-200 dark:border-emerald-800 shadow-md space-y-3.5">
                
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a271c] dark:text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>{getPropertyOwnerDisplayName(property, currentUser, isHindi) || (isHindi ? 'सीधे संपत्ति मालिक' : 'Direct Property Owner')}</span>
                  </h3>
                  {property.sellerType === 'Broker' ? (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Broker
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Owner
                    </span>
                  )}
                </div>

                {/* Owner Management Controls (if currentUser is owner or admin) */}
                {canManage && (
                  <div className="space-y-2.5 p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <span>👑</span>
                        <span>{isHindi ? 'आप इस प्रॉपर्टी के मालिक हैं' : 'You are the Owner of this Listing'}</span>
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${property.isSold ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                        {property.isSold ? (isHindi ? 'बिक चुकी है' : 'Sold Out') : (isHindi ? 'सक्रिय (Active)' : 'Active')}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      {onToggleSold && (
                        <button
                          type="button"
                          onClick={() => onToggleSold(property.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-950 dark:text-amber-200 hover:bg-amber-100 cursor-pointer transition-colors shadow-2xs"
                        >
                          {property.isSold ? (isHindi ? 'उपलब्ध मार्क करें' : 'Mark Available') : (isHindi ? 'बिक चुका मार्क करें' : 'Mark as Sold')}
                        </button>
                      )}

                      {onDeleteProperty && (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isHindi ? 'प्रॉपर्टी हटाएं' : 'Delete Property'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Protected Phone Number & Ask Access to Owner */}
                {!isDirectOwner && (
                  <div className="space-y-2.5 p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-[#061911]/80 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800 dark:text-slate-100">
                          {isHindi ? 'फ़ोन नंबर सुरक्षा सुरक्षित:' : 'Phone Privacy Protected:'}{' '}
                        </strong>
                        {isHindi
                          ? 'अवांछित स्पैम रोकने के लिए मालिक का फ़ोन नंबर सुरक्षित रखा गया है। आप सीधे मालिक से नंबर का अनुरोध कर सकते हैं।'
                          : "To protect owner privacy and prevent spam, the phone number is kept private. You can ask access from the owner for their number."}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 pt-1 border-t border-emerald-200/60 dark:border-emerald-900/40">
                      <span>{isHindi ? 'मालिक का फोन:' : 'Owner Phone:'}</span>
                      <span className="font-mono text-sm tracking-wider font-extrabold text-slate-700 dark:text-slate-200">
                        {phoneRequestStatus === 'approved' || approvedPhoneNumber
                          ? (approvedPhoneNumber || property.sellerPhone || '+91 98971 23456')
                          : '+91 98••••••••'}
                      </span>
                    </div>

                    <div className="pt-1">
                      {phoneRequestStatus === 'approved' || approvedPhoneNumber ? (
                        <a
                          href={`tel:${(approvedPhoneNumber || property.sellerPhone || '').replace(/[^0-9+]/g, '')}`}
                          onClick={(e) => {
                            if (!currentUser) {
                              e.preventDefault();
                              openAuthModal('login', isHindi ? 'मालिक को कॉल करने हेतु कृपया पहले लॉगिन करें।' : 'Please sign in to contact the property owner.');
                              return;
                            }
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{isHindi ? 'मालिक को सीधे कॉल करें' : 'Call Owner Directly'}</span>
                        </a>
                      ) : (phoneRequestStatus === 'pending' || localPhoneRequested) ? (
                        <div className="w-full py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>{isHindi ? 'फोन अनुरोध भेजा गया (स्वीकृति लंबित)' : 'Phone Access Requested • Pending'}</span>
                          </span>
                          <span className="text-[10px] bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded-full font-mono">
                            {isHindi ? 'इनबॉक्स देखें' : 'Check Inbox'}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentUser) {
                              openAuthModal('login', isHindi ? 'मालिक के फोन नंबर का अनुरोध करने के लिए कृपया पहले लॉगिन करें।' : 'Please sign in to ask access to the owner for their phone number.');
                              return;
                            }
                            setLocalPhoneRequested(true);
                            if (onRequestPhoneNumber) {
                              onRequestPhoneNumber(property);
                            } else {
                              fetch(`/api/properties/${encodeURIComponent(property.id)}/inquiry`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ type: 'phone_access_request', propertyId: property.id, timestamp: Date.now() })
                              }).catch(() => {});
                            }
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>{isHindi ? 'मालिक से फोन नंबर मांगें (Ask Access)' : 'Ask Access to Owner for Number'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Direct Chat with Owner Button (Only shown to buyers) */}
                {!isDirectOwner && onStartChat && (
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        openAuthModal('login', isHindi ? 'मालिक से इनबॉक्स में चैट करने हेतु कृपया लॉगिन करें।' : 'Please sign in to chat with the property owner.');
                        return;
                      }
                      onStartChat(property);
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-[#071c14] hover:bg-emerald-50 dark:hover:bg-[#0c2f22] text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'मालिक से इनबॉक्स में चैट करें' : 'Chat with Owner in Inbox'}</span>
                  </button>
                )}

                {/* Save for later button */}
                <button
                  onClick={() => {
                    if (!currentUser) {
                      openAuthModal('login', isHindi ? 'प्रॉपर्टी को शॉर्टलिस्ट करने हेतु कृपया लॉगिन करें।' : 'Please sign in to save properties.', () => onToggleFavorite(property.id));
                      return;
                    }
                    onToggleFavorite(property.id);
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-white dark:bg-[#071c14] hover:bg-emerald-50 dark:hover:bg-[#0c2f22] text-slate-700 dark:text-slate-200 text-xs font-medium border border-emerald-200 dark:border-emerald-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{isFavorite ? (isHindi ? 'सहेजी गई सूची में शामिल' : 'Saved in Your Shortlist') : (isHindi ? 'प्रॉपर्टी को सहेजें' : 'Save Property for Later')}</span>
                </button>

                {/* Download Brochure Button */}
                <button
                  onClick={() => {
                    if (!currentUser) {
                      openAuthModal('login', isHindi ? 'दस्तावेज़ डाउनलोड करने हेतु कृपया लॉगिन करें।' : 'Please sign in to download legal brochure.', handleDownloadBrochure);
                      return;
                    }
                    handleDownloadBrochure();
                  }}
                  disabled={downloadingBrochure}
                  className="w-full py-2 px-4 rounded-xl bg-white dark:bg-[#071c14] hover:bg-emerald-50 dark:hover:bg-[#0c2f22] text-slate-700 dark:text-slate-200 text-xs font-medium border border-emerald-200 dark:border-emerald-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>{downloadingBrochure ? (isHindi ? 'दस्तावेज़ तैयार हो रहा है...' : "Generating Dossier...") : (isHindi ? 'प्रिंट / ब्रोशर डाउनलोड' : "Print / Download Brochure")}</span>
                </button>

              </div>

              {/* Indian Home Loan & EMI Quick Card */}
              <div className="bg-white dark:bg-[#0a281c] p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-emerald-200 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'गृह ऋण ईएमआई' : 'Home Loan EMI'}</span>
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                    ~₹{estimatedEmi.toLocaleString('en-IN')}/{isHindi ? 'माह*' : 'mo*'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  {isHindi 
                    ? '80% लोन और 8.5% ब्याज दर पर 20 वर्ष की अनुमानित ईएमआई। एसबीआई, एचडीएफसी और आईसीआईसीआई से लोन सुविधा उपलब्ध।' 
                    : 'Estimated based on 80% loan at 8.5% interest for 20 years. Bank loans available from SBI, HDFC & ICICI.'}
                </p>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      openAuthModal('login', isHindi ? 'गृह ऋण ईएमआई कैलकुलेटर हेतु कृपया लॉगिन करें।' : 'Please sign in to calculate home loan EMI.', () => onOpenEmiCalculator(property.price));
                      return;
                    }
                    onOpenEmiCalculator(property.price);
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-50 dark:bg-[#061811] hover:bg-emerald-100 dark:hover:bg-[#09251a] border border-emerald-200 dark:border-emerald-700 text-xs text-emerald-800 dark:text-emerald-300 font-semibold transition-colors cursor-pointer"
                >
                  {isHindi ? 'ऋण कैलकुलेटर कस्टमाइज़ करें →' : 'Customize Loan Calculator →'}
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal for Property Owner */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#071c14] border border-rose-300 dark:border-rose-900/80 rounded-3xl p-6 shadow-2xl text-slate-800 dark:text-slate-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-center text-slate-900 dark:text-white mb-1.5">
              {isHindi ? 'प्रॉपर्टी लिस्टिंग हटाएं?' : 'Delete Property Listing?'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 text-center mb-5 leading-relaxed">
              {isHindi 
                ? `क्या आप वाकई "${property.title}" को उत्तराखंड गेटवेज से हमेशा के लिए हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।` 
                : `Are you sure you want to permanently delete "${property.title}"? This property listing will be permanently removed from the marketplace.`
              }
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                {isHindi ? 'हां, हटाएं' : 'Delete Listing'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
