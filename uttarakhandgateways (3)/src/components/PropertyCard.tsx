import React, { useState, useRef, useEffect } from 'react';
import { Property } from '../types';
import { 
  MapPin, 
  Home, 
  Maximize2, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Edit3, 
  Tag, 
  Trash2, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { isPropertyOwner } from '../utils/propertyOwnership';
import { formatLocalizedPrice, translatePropertyType } from '../utils/language';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onStartChat?: (property: Property) => void;
  onDeleteProperty?: (propertyId: string) => void;
  onToggleSold?: (propertyId: string) => void;
  onEditProperty?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  isFavorite,
  onToggleFavorite,
  onStartChat,
  onDeleteProperty,
  onToggleSold,
  onEditProperty,
}) => {
  const { isHindi } = useLanguage();
  const { currentUser, openAuthModal } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localSold, setLocalSold] = useState(Boolean(property.isSold));

  const isOwner = isPropertyOwner(property, currentUser);
  const cardRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalSold(Boolean(property.isSold));
  }, [property.isSold]);

  // Click outside to close owner dropdown menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowOwnerMenu(false);
      }
    };
    if (showOwnerMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOwnerMenu]);

  const images = property.images && property.images.length > 0
    ? property.images
    : [];

  const currentImage = images[activeImageIndex] || images[0];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const cleanArea = property.areaSqFt
    ? `${property.areaSqFt.toLocaleString('en-IN')} ${isHindi ? 'वर्ग फुट' : 'sq.ft'}`
    : (property.areaDisplay || '').split('(')[0].trim();

  const isForRent =
    property.type === 'Rent/Lease' ||
    property.purpose === 'rent' ||
    Boolean(property.isAvailableForRent) ||
    (Boolean(property.priceDisplay) && property.priceDisplay.toLowerCase().includes('/ month'));

  const sellerDisplayName = property.sellerName || '';

  return (
    <article
      ref={cardRef}
      id={`property-card-${property.id}`}
      onClick={() => onSelect(property)}
      className="bg-white dark:bg-[#0c2e22] rounded-3xl overflow-hidden border border-emerald-200/90 dark:border-emerald-600/50 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-950/20 dark:hover:shadow-black/70 shadow-sm flex flex-col justify-between cursor-pointer group relative transition-all duration-300 ease-out hover:-translate-y-1.5"
    >
      {/* 1. PHOTO CONTAINER */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-900">
        <img
          src={currentImage}
          alt={property.title || 'Property'}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Clean Vignette & Bottom Contrast Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30 pointer-events-none" />

        {/* Top-Left: Clean Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20 pointer-events-none">
          <span className={`text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md flex items-center gap-1.5 border ${
            isForRent 
              ? 'bg-teal-600/95 border-teal-300' 
              : 'bg-emerald-600/95 border-emerald-300'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
            <span>{isForRent ? (isHindi ? 'किराया' : 'Rent') : (isHindi ? 'बिक्री' : 'Sale')}</span>
          </span>

          <span className="bg-slate-950/70 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
            {translatePropertyType(property.type, isHindi ? 'hi' : 'en')}
          </span>
        </div>

        {/* Top-Right: Bookmark & Owner Action Menu */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOwnerMenu((prev) => !prev);
                }}
                className="w-8 h-8 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white backdrop-blur-md border border-white/25 transition-all flex items-center justify-center cursor-pointer shadow-md active:scale-95"
                title={isHindi ? 'विकल्प' : 'More Options'}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showOwnerMenu && (
                <div
                  className="absolute right-0 top-10 z-50 w-48 rounded-2xl bg-white dark:bg-[#071f16] border border-emerald-200 dark:border-emerald-800 shadow-2xl py-1.5 text-xs text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  {onEditProperty && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOwnerMenu(false);
                        onEditProperty(property);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/60 flex items-center gap-2.5 cursor-pointer font-medium text-slate-800 dark:text-slate-200"
                    >
                      <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{isHindi ? 'संपादित करें' : 'Edit Listing'}</span>
                    </button>
                  )}

                  {onToggleSold && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOwnerMenu(false);
                        const next = !localSold;
                        setLocalSold(next);
                        onToggleSold(property.id);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-amber-50 dark:hover:bg-amber-950/60 flex items-center gap-2.5 cursor-pointer font-medium text-amber-700 dark:text-amber-300"
                    >
                      <Tag className="w-4 h-4" />
                      <span>{localSold ? (isHindi ? 'उपलब्ध मार्क करें' : 'Mark Available') : (isHindi ? 'बिक चुका मार्क करें' : 'Mark as Sold')}</span>
                    </button>
                  )}

                  {onDeleteProperty && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOwnerMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center gap-2.5 cursor-pointer font-medium border-t border-slate-100 dark:border-slate-800/80"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isHindi ? 'लिस्टिंग हटाएं' : 'Delete Listing'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!currentUser) {
                openAuthModal('login', isHindi ? 'संपत्ति सहेजने हेतु कृपया पहले लॉगिन करें।' : 'Please log in to save properties.', () => {
                  onToggleFavorite(property.id);
                });
                return;
              }
              onToggleFavorite(property.id);
            }}
            className={`w-8 h-8 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95 ${
              isFavorite
                ? 'bg-emerald-600 text-white border border-emerald-400'
                : 'bg-black/55 text-white hover:bg-black/80 border border-white/25'
            }`}
            title={isFavorite ? (isHindi ? 'सहेजी गई सूची से हटाएं' : 'Remove from saved') : (isHindi ? 'सहेजें' : 'Save')}
          >
            <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-white text-white' : 'text-white'}`} />
          </button>
        </div>

        {/* Sold Out Banner */}
        {localSold && (
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 bg-rose-600/95 text-white text-center font-black py-2 tracking-widest text-xs uppercase shadow-xl backdrop-blur-xs z-10 border-y border-rose-400">
            {isHindi ? '⚠️ बिक चुकी है (SOLD OUT)' : '⚠️ SOLD OUT'}
          </div>
        )}

        {/* Bottom of Photo: Property Price */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10 pointer-events-none">
          <div>
            <div className="text-2xl font-black text-white drop-shadow-lg leading-tight tracking-tight">
              {formatLocalizedPrice(property.priceDisplay || '', isHindi ? 'hi' : 'en')}
            </div>
            {property.ratePerSqFt && (
              <span className="text-[11px] text-emerald-200 font-bold drop-shadow-sm block">
                {property.ratePerSqFt}
              </span>
            )}
          </div>

        </div>

        {/* Photo Nav Arrows on Hover */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/65 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 z-20 cursor-pointer shadow-md"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/65 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 z-20 cursor-pointer shadow-md"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* 2. CARD BODY: CLEAN, CRYSTAL CLEAR & UNCLUTTERED */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-2.5">
          {/* Title */}
          <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-[17px] leading-snug line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
            {property.title}
          </h3>

          {/* Location with Pin */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-emerald-200/90 font-medium">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{property.location || property.city}</span>
          </div>

          {/* Key Specs Bar */}
          <div className="flex items-center gap-3 text-xs pt-2.5 border-t border-slate-100 dark:border-emerald-800/60 text-slate-700 dark:text-slate-200 font-semibold">
            {property.bedrooms > 0 ? (
              <span className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{property.bedrooms} BHK</span>
              </span>
            ) : property.type === 'Studio' || property.configuration?.toLowerCase().includes('studio') ? (
              <span className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Studio</span>
              </span>
            ) : null}

            {property.bathrooms > 0 && (
              <span>{property.bathrooms} {isHindi ? 'बाथ' : 'Baths'}</span>
            )}

            <span className="flex items-center gap-1 ml-auto text-slate-900 dark:text-emerald-200 font-bold">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              {cleanArea && <span>{cleanArea}</span>}
            </span>
          </div>

          {/* Seller / Verified Deal Info */}
          {(property.sellerName || property.reraStatus) && (
            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 dark:text-slate-300">
              {property.sellerName && (
                <span className="truncate">
                  {property.sellerType === 'Broker' ? 'Broker' : ''}{property.sellerType === 'Broker' ? ': ' : ''}<strong className="text-slate-800 dark:text-white">{property.sellerName}</strong>
                </span>
              )}
              {property.reraStatus && (
                <span className="text-emerald-700 dark:text-emerald-300 font-bold shrink-0 ml-1">
                  {property.reraStatus}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Clean 2-Button Action Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-emerald-800/60 flex items-center gap-2">
          {!isOwner && onStartChat && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!currentUser) {
                  openAuthModal('login', isHindi ? 'मालिक से सीधे चैट करने हेतु कृपया लॉगिन करें।' : 'Please log in to chat with property owner.', () => {
                    onStartChat(property);
                  });
                  return;
                }
                onStartChat(property);
              }}
              className="py-2.5 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-300 dark:border-emerald-700 cursor-pointer transition-all active:scale-95 shadow-xs"
              title={isHindi ? 'मालिक से चैट करें' : 'Chat with owner'}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? 'चैट' : 'Chat'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(property);
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 cursor-pointer"
            title={isHindi ? 'पूरा विवरण देखें' : 'View Full Details'}
          >
            <span>{isHindi ? 'विवरण देखें' : 'View Details'}</span>
            <ArrowRight className="w-4 h-4 text-emerald-100" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
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
                ? `क्या आप वाकई "${property.title}" को हमेशा के लिए हटाना चाहते हैं?`
                : `Are you sure you want to permanently delete "${property.title}"?`}
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
                {isHindi ? 'हां, हटाएं' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
