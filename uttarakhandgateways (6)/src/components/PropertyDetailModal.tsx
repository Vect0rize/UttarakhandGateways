import React, { useState } from 'react';
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
  Unlock,
  User,
  Trash2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isPropertyOwner } from '../utils/propertyOwnership';
import { formatLocalizedPrice, translatePropertyType } from '../utils/language';

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
  const { isHindi } = useLanguage();
  const { currentUser } = useAuth();

  const isOwner = property ? isPropertyOwner(property, currentUser) : false;

  if (!property) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadBrochure = () => {
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
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {translatePropertyType(property.type, isHindi ? 'hi' : 'en')}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate font-serif-luxury">
              {property.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Save for later toggle button */}
            <button
              onClick={() => onToggleFavorite(property.id)}
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
                  {property.ratePerSqFt && (
                    <span className="text-sm font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      ({property.ratePerSqFt.replace(/sq\.ft/gi, isHindi ? 'वर्ग फुट' : 'sq.ft')})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-emerald-200/80 text-sm mb-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="font-medium">{property.location}, {property.city} ({property.region} {isHindi ? 'उत्तराखंड' : 'Uttarakhand'})</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{property.altitudeMsl}</span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                  "{property.tagline}"
                </p>
              </div>

              {/* Property Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50/70 dark:bg-[#0a281c] p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Maximize2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'प्लॉट / क्षेत्रफल' : 'Plot / Area'}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {property.areaDisplay.replace(/sq\.ft/gi, isHindi ? 'वर्ग फुट' : 'sq.ft')}
                  </div>
                </div>

                <div className="bg-emerald-50/70 dark:bg-[#0a281c] p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Home className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'संरचना' : 'Configuration'}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {property.configuration.replace(/BHK/gi, isHindi ? 'बीएचके' : 'BHK')}
                  </div>
                </div>

                <div className="bg-emerald-50/70 dark:bg-[#0a281c] p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <Compass className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'दिशा व धूप' : 'Facing & Light'}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate" title={property.facing}>
                    {isHindi ? property.facing.replace(/North/gi, 'उत्तर').replace(/South/gi, 'दक्षिण').replace(/East/gi, 'पूर्व').replace(/West/gi, 'पश्चिम') : property.facing}
                  </div>
                </div>

                <div className="bg-emerald-50/70 dark:bg-[#0a281c] p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'कब्जा' : 'Possession'}</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {isHindi ? (property.possession.toLowerCase().includes('immediate') ? 'तत्काल रजिस्ट्री' : property.possession) : property.possession}
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <h3 className="text-base font-bold text-[#0a271c] dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  <span>{isHindi ? 'प्रॉपर्टी विवरण' : 'Property Overview'}</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
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
              <div>
                <h3 className="text-base font-bold text-[#0a271c] dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                  <span>{isHindi ? 'सुविधाएं व व्यवस्थाएं' : 'Features & Amenities'}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-[#0a281c] border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

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
                    <span>{property.sellerName || (isHindi ? 'सीधे संपत्ति मालिक' : 'Direct Property Owner')}</span>
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    {isHindi ? (property.sellerType === 'Verified Builder' ? 'बिल्डर' : 'मालिक') : (property.sellerType || 'Owner')}
                  </span>
                </div>

                {/* Privacy Shield Notice */}
                <div className="p-3 rounded-2xl bg-white/80 dark:bg-[#061911]/80 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {isHindi ? 'फोन नंबर सुरक्षित:' : 'Phone Privacy Protected:'}{' '}
                    </span>
                    <span>
                      {isHindi 
                        ? 'अनचाहे कॉल से सुरक्षा हेतु मालिक का फोन नंबर सुरक्षित है। आप अनुरोध भेज सकते हैं या सीधे चैट कर सकते हैं।' 
                        : "To prevent unsolicited spam, the owner's phone number is masked. You can request access or start a direct chat."}
                    </span>
                  </div>
                </div>

                {/* Phone Status & Actions or Owner Management */}
                {isOwner ? (
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
                ) : phoneRequestStatus === 'approved' ? (
                  <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1">
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isHindi ? 'स्वीकृत संपर्क:' : 'Owner Approved Contact:'}</span>
                      </span>
                      <span className="font-mono text-sm">{approvedPhoneNumber || property.sellerPhone || '+91 98971 23456'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={`tel:${(approvedPhoneNumber || property.sellerPhone || '').replace(/[^0-9+]/g, '')}`}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{isHindi ? 'कॉल करें' : 'Call Owner'}</span>
                      </a>
                      <a
                        href={`https://wa.me/${(approvedPhoneNumber || property.sellerPhone || '').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>व्हाट्सएप</span>
                      </a>
                    </div>
                  </div>
                ) : phoneRequestStatus === 'pending' ? (
                  <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      <span>{isHindi ? 'फोन अनुरोध स्वीकृति लंबित' : 'Phone Request Pending Approval'}</span>
                    </span>
                    <span className="text-[10px] bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded-full font-mono">
                      {isHindi ? 'इनबॉक्स देखें' : 'Check Inbox'}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (onRequestPhoneNumber) {
                        onRequestPhoneNumber(property);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isHindi ? "मालिक का फोन नंबर मांगें (+91 98••••••••)" : "Request Owner's Phone Number (+91 98••••••••)"}</span>
                  </button>
                )}

                {/* Direct Chat with Owner Button (Only shown to buyers) */}
                {!isOwner && onStartChat && (
                  <button
                    onClick={() => {
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
                  onClick={() => onToggleFavorite(property.id)}
                  className="w-full py-2 px-4 rounded-xl bg-white dark:bg-[#071c14] hover:bg-emerald-50 dark:hover:bg-[#0c2f22] text-slate-700 dark:text-slate-200 text-xs font-medium border border-emerald-200 dark:border-emerald-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-400'}`} />
                  <span>{isFavorite ? (isHindi ? 'सहेजी गई सूची में शामिल' : 'Saved in Your Shortlist') : (isHindi ? 'प्रॉपर्टी को सहेजें' : 'Save Property for Later')}</span>
                </button>

                {/* Download Brochure Button */}
                <button
                  onClick={handleDownloadBrochure}
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
                  onClick={() => onOpenEmiCalculator(property.price)}
                  className="w-full py-2 rounded-lg bg-emerald-50 dark:bg-[#061811] hover:bg-emerald-100 dark:hover:bg-[#09251a] border border-emerald-200 dark:border-emerald-700 text-xs text-emerald-800 dark:text-emerald-300 font-semibold transition-colors cursor-pointer"
                >
                  {isHindi ? 'ऋण कैलकुलेटर कस्टमाइज़ करें →' : 'Customize Loan Calculator →'}
                </button>
              </div>

              {/* Platform Trust & Legal Land Standards */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-[#0a281c] border border-emerald-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-white">
                  {isHindi ? 'उत्तराखंड भूमि एवं रजिस्ट्री आश्वासन:' : 'Uttarakhand Land & Registry Assurance:'}
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                  <span>✓</span>
                  <span>{isHindi ? '100% फ्रीहोल्ड व स्पष्ट टाइटल खोज सहायता' : '100% Freehold & Clear Title Search Support'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                  <span>✓</span>
                  <span>{isHindi ? 'धारा 143 गैर-कृषि भूमि दाखिल-खारिज मार्गदर्शन' : 'Section 143 Non-Agricultural Land Mutation Guidance'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                  <span>✓</span>
                  <span>{isHindi ? '0% ब्रोकरेज के साथ सीधा क्रेता-विक्रेता संपर्क' : 'Direct Buyer-Seller Connection with 0% Brokerage'}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-emerald-200/80 dark:border-emerald-900/60">
                  {isHindi ? 'उत्तराखंड प्रॉपर्टी मानक · उप-पंजीयक तहसील तत्काल रजिस्ट्री' : 'Uttarakhand Property Standards · Immediate Sub-Registrar Tehsil Registration'}
                </div>
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
