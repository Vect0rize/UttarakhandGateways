import React, { useState, useRef, useEffect } from 'react';
import { Property } from '../types';
import { 
  MapPin, 
  Bookmark, 
  Home, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight,
  MessageSquare,
  Lock,
  Unlock,
  User,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Tag
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isPropertyOwner } from '../utils/propertyOwnership';
import { formatLocalizedPrice, translatePropertyType } from '../utils/language';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onStartChat?: (property: Property) => void;
  onRequestPhoneNumber?: (property: Property) => void;
  phoneRequestStatus?: 'none' | 'pending' | 'approved' | 'declined';
  approvedPhoneNumber?: string;
  onDeleteProperty?: (propertyId: string) => void;
  onToggleSold?: (propertyId: string) => void;
  index?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  isFavorite,
  onToggleFavorite,
  onStartChat,
  onRequestPhoneNumber,
  phoneRequestStatus = 'none',
  approvedPhoneNumber,
  onDeleteProperty,
  onToggleSold,
  index = 0,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [localSold, setLocalSold] = useState(Boolean(property.isSold));
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setLocalSold(Boolean(property.isSold));
  }, [property.isSold]);

  const { isHindi } = useLanguage();
  const { currentUser, openAuthModal } = useAuth();

  const isOwner = isPropertyOwner(property, currentUser);
  const isAmitTyagi = currentUser?.username?.trim().toLowerCase() === 'amit tyagi';

  // Subtle scroll-triggered viewport entrance animation
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08,
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleCardClick = () => {
    onSelect(property);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const cleanArea = property.areaSqFt 
    ? `${property.areaSqFt.toLocaleString()} ${isHindi ? 'वर्ग फुट' : 'sq.ft'}` 
    : property.areaDisplay.split('(')[0].trim().replace(/sq\.ft/gi, isHindi ? 'वर्ग फुट' : 'sq.ft');

  const isForRent = property.type === 'Rent/Lease' || Boolean(property.isAvailableForRent) || (Boolean(property.priceDisplay) && property.priceDisplay.toLowerCase().includes('/ month'));

  // Pipe-separated tags list
  const tagList: string[] = [
    isForRent ? (isHindi ? 'किराये पर (For Rent)' : 'For Rent') : (isHindi ? 'बिक्री हेतु (For Sale)' : 'For Sale')
  ];
  if (property.himalayanPeakView) {
    tagList.push(isHindi ? 'पर्वत दृश्य' : 'Mountain View');
  }
  property.amenities.slice(0, 3).forEach((a) => {
    if (isHindi) {
      if (a.toLowerCase().includes('clear title') || a.toLowerCase().includes('registry')) {
        tagList.push('तत्काल रजिस्ट्री');
      } else if (a.toLowerCase().includes('road')) {
        tagList.push('पक्की सड़क');
      } else if (a.toLowerCase().includes('water')) {
        tagList.push('24x7 जल आपूर्ति');
      } else if (a.toLowerCase().includes('view')) {
        tagList.push('पर्वतीय दृश्य');
      } else if (a.toLowerCase().includes('garden')) {
        tagList.push('बगीचा व लॉन');
      } else if (a.toLowerCase().includes('parking')) {
        tagList.push('कार पार्किंग');
      } else {
        tagList.push(a);
      }
    } else {
      tagList.push(a);
    }
  });

  const isPhoneApproved = phoneRequestStatus === 'approved';
  const isPhonePending = phoneRequestStatus === 'pending';
  const sellerDisplayName = property.sellerName || (isHindi ? 'सीधे मालिक' : 'Direct Owner');

  return (
    <article
      ref={cardRef}
      id={`property-card-${property.id}`}
      onClick={handleCardClick}
      style={{
        transitionDelay: isVisible ? `${(index % 4) * 80}ms` : '0ms',
      }}
      className={`bg-white dark:bg-[#082218] rounded-3xl overflow-hidden border border-emerald-100/90 dark:border-emerald-900/60 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/10 dark:hover:shadow-black/40 shadow-sm flex flex-col justify-between cursor-pointer group relative transition-all duration-700 ease-out will-change-transform motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-7 scale-[0.98]'
      }`}
    >
      {/* 1. PHOTO CONTAINER */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-[#061911]">
        <img
          src={(property.images && property.images.length > 0) ? property.images[activeImageIndex] || property.images[0] : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Subtle Dark Gradient Overlay for Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

        {/* Top Badges Row */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          
          {/* Property Category / Type Pill, For Rent/Sale Badge & Owner Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* For Rent or For Sale Badge */}
            {isForRent ? (
              <span className="bg-teal-600 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md border border-teal-300 flex items-center gap-1.5 ring-1 ring-teal-400/50">
                <span className="w-2 h-2 rounded-full bg-teal-200 animate-pulse shrink-0" />
                <span>{isHindi ? 'किराये पर • For Rent' : 'For Rent'}</span>
              </span>
            ) : (
              <span className="bg-amber-400 backdrop-blur-md text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md border border-amber-300 flex items-center gap-1.5 ring-1 ring-amber-500/50">
                <span className="w-2 h-2 rounded-full bg-slate-950 shrink-0" />
                <span>{isHindi ? 'बिक्री हेतु • For Sale' : 'For Sale'}</span>
              </span>
            )}

            <span className="bg-emerald-950/80 backdrop-blur-md border border-emerald-400/40 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              {translatePropertyType(property.type, isHindi ? 'hi' : 'en')}
            </span>

            {isOwner && (
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                <span>👑</span>
                <span>{isHindi ? 'आपकी लिस्टिंग' : 'My Property'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Owner Delete Button (ONLY FOR OWNER) */}
            {isOwner && onDeleteProperty && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600/90 hover:bg-rose-600 text-white backdrop-blur-md shadow-sm transition-all cursor-pointer border border-rose-400"
                title={isHindi ? 'यह प्रॉपर्टी हटाएं' : 'Delete this property'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isHindi ? 'हटाएं' : 'Delete'}</span>
              </button>
            )}

            {/* Explicit "Save for later" Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!currentUser) {
                  openAuthModal('login', isHindi ? 'संपत्ति को सहेजने हेतु कृपया पहले लॉगिन करें।' : 'Please log in to save properties.', () => {
                    onToggleFavorite(property.id);
                  });
                  return;
                }
                onToggleFavorite(property.id);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 shadow-sm cursor-pointer ${
                isFavorite 
                  ? 'bg-emerald-600 text-white border border-emerald-500 shadow-emerald-900/30' 
                  : 'bg-white/90 dark:bg-[#082218]/90 hover:bg-white dark:hover:bg-[#0c3123] text-slate-700 dark:text-slate-200 hover:text-emerald-900 border border-emerald-200 dark:border-emerald-800'
              }`}
              title={isFavorite ? (isHindi ? "सहेजा गया (हटाने के लिए क्लिक करें)" : "Saved for later (Click to remove)") : (isHindi ? "प्रॉपर्टी को सहेजें" : "Save this property for later")}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{isFavorite ? (isHindi ? 'सहेजा गया' : 'Saved') : (isHindi ? 'सहेजें' : 'Save')}</span>
            </button>
          </div>

        </div>

        {/* Sold Out Banner if marked sold by owner */}
        {localSold && (
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 bg-rose-600/95 text-white text-center font-black py-1.5 tracking-widest text-xs uppercase shadow-lg backdrop-blur-xs z-10 border-y border-rose-400">
            {isHindi ? '⚠️ बिक चुकी है (SOLD OUT)' : '⚠️ SOLD OUT / OFF MARKET'}
          </div>
        )}

        {/* Bottom of Photo: Outright Sale Price */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between z-10 pointer-events-none">
          {/* Price */}
          <div className="leading-tight">
            <div className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
              {formatLocalizedPrice(property.priceDisplay, isHindi ? 'hi' : 'en')}
            </div>
            {property.ratePerSqFt && (
              <span className="text-[10px] text-emerald-100 font-mono font-medium drop-shadow-sm">
                {property.ratePerSqFt.replace(/sq\.ft/gi, isHindi ? 'वर्ग फुट' : 'sq.ft')}
              </span>
            )}
          </div>

          {/* For Rent or For Sale Status Pill */}
          <span className={`backdrop-blur-md border px-2.5 py-0.5 rounded-full text-[10px] font-black ${
            isForRent
              ? 'bg-teal-950/85 border-teal-400/50 text-teal-200'
              : 'bg-emerald-950/85 border-emerald-400/50 text-emerald-200'
          }`}>
            {isForRent ? (isHindi ? 'किराये पर (For Rent)' : 'For Rent') : (isHindi ? 'बिक्री हेतु (For Sale)' : 'For Sale')}
          </span>
        </div>

        {/* Multi-Image Carousel Arrows on Hover */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 z-20 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 z-20 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* 2. CARD CONTENT BODY */}
      <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between space-y-2.5">
        
        <div className="space-y-1.5">
          {/* Title */}
          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-emerald-200/80 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Key Specs Row */}
          <div className="flex items-center gap-3 text-xs pt-1 border-t border-slate-100 dark:border-emerald-950/80 text-slate-600 dark:text-slate-300 font-medium">
            {property.bedrooms > 0 ? (
              <span className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-slate-400 dark:text-emerald-400" />
                <span>{property.bedrooms} {isHindi ? 'कमरे' : 'BHK'}</span>
              </span>
            ) : (property.type === 'Studio' || property.configuration?.toLowerCase().includes('studio')) ? (
              <span className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-slate-400 dark:text-emerald-400" />
                <span>Studio</span>
              </span>
            ) : null}

            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <span>{property.bathrooms} {isHindi ? 'बाथरूम' : 'Baths'}</span>
              </span>
            )}

            <span className="flex items-center gap-1 ml-auto text-slate-700 dark:text-slate-300">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400 dark:text-emerald-400" />
              <span className="truncate">{cleanArea}</span>
            </span>
          </div>

          {/* Owner Privacy & Phone Status Row */}
          <div className="pt-2 border-t border-slate-100 dark:border-emerald-950/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-[150px]">
              <User className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              <span className="truncate font-medium">{sellerDisplayName}</span>
            </div>

            {/* Masked / Protected Phone Pill */}
            {isPhoneApproved ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                <Unlock className="w-3 h-3 text-emerald-600" />
                <span>{approvedPhoneNumber || property.sellerPhone || '+91 98971 23456'}</span>
              </span>
            ) : isPhonePending ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>{isHindi ? 'अनुरोध लंबित' : 'Request Pending'}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onRequestPhoneNumber) {
                    onRequestPhoneNumber(property);
                  }
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-[#071c14] hover:bg-emerald-100 dark:hover:bg-[#0b291e] px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 cursor-pointer transition-colors"
                title={isHindi ? 'मालिक का फोन नंबर देखने हेतु अनुरोध करें' : 'Request permission to view owner phone number'}
              >
                <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>+91 98••••••••</span>
              </button>
            )}
          </div>

          {/* Pipe-separated tags */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
            {tagList.map((tag, idx) => (
              <React.Fragment key={idx}>
                <span className={`font-medium ${idx === 0 && property.himalayanPeakView ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                  {tag}
                </span>
                {idx < tagList.length - 1 && (
                  <span className="text-slate-300 dark:text-slate-600 font-light select-none">|</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* OWNER MANAGEMENT BAR (ONLY VISIBLE IF CURRENT USER IS THE OWNER) */}
          {isOwner && (
            <div className="p-2.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between text-xs mt-1">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${localSold ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="text-[11px] font-bold text-amber-950 dark:text-amber-200">
                  {localSold 
                    ? (isHindi ? 'स्थिति: बिक चुकी है (Sold)' : 'Status: Marked Sold') 
                    : (isHindi ? 'स्थिति: सक्रिय (Active)' : 'Status: Active Listing')
                  }
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {onToggleSold && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = !localSold;
                      setLocalSold(next);
                      onToggleSold(property.id);
                    }}
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-950/60 cursor-pointer transition-colors shadow-2xs"
                  >
                    {localSold 
                      ? (isHindi ? 'उपलब्ध करें' : 'Mark Available') 
                      : (isHindi ? 'बिक चुका मार्क करें' : 'Mark Sold')
                    }
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CTA BUTTONS (VIEW DETAILS & CHAT WITH OWNER / DELETE FOR OWNER) */}
        <div className="pt-2 flex items-center gap-2">
          {/* If Owner: Show Delete Property Button; If Buyer: Show Chat With Owner */}
          {isOwner && onDeleteProperty ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-900 cursor-pointer"
              title={isHindi ? 'प्रॉपर्टी लिस्टिंग हमेशा के लिए हटाएं' : 'Permanently delete this property listing'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isHindi ? 'प्रॉपर्टी हटाएं' : 'Delete Property'}</span>
            </button>
          ) : (
            onStartChat && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!currentUser) {
                    openAuthModal('login', isHindi ? 'मालिक से सीधे चैट करने हेतु कृपया लॉगिन करें।' : 'Please log in to chat with the property owner.', () => {
                      if (onStartChat) onStartChat(property);
                    });
                    return;
                  }
                  onStartChat(property);
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                title={isHindi ? 'संपत्ति मालिक से सीधे चैट करें' : 'Chat directly with property owner'}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'चैट करें' : 'Chat'}</span>
              </button>
            )
          )}

          {/* Solid View Property CTA Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
            title={isHindi ? 'प्रॉपर्टी विवरण देखें' : 'View Property Details'}
          >
            <span>{isHindi ? 'विवरण देखें' : 'View Details'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isHindi ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                  if (onDeleteProperty) {
                    onDeleteProperty(property.id);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-all cursor-pointer"
              >
                {isHindi ? 'हां, हटाएं' : 'Delete Listing'}
              </button>
            </div>
          </div>
        </div>
      )}

    </article>
  );
};
