import React, { useState, useRef, useEffect } from 'react';
import { Property } from '../types';
import {
  MapPin,
  Home,
  Maximize2,
  Bookmark,
  MoreVertical,
  Edit3,
  Tag,
  Trash2,
  MessageSquare,
  ArrowRight,
  Clock,
  Share2,
  Eye,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  isPropertyOwner,
  canManageProperty,
  formatCardDisplayViewsCount,
  formatPropertyAge,
} from '../utils/propertyOwnership';
import { formatLocalizedPrice, translatePropertyType } from '../utils/language';
import { getPropertySlugPath } from '../data/programmaticSeo';
import { formatPostTime } from '../utils/timeAgo';
import { formatPropertyArea, formatPropertyRate, isLandOrPlotProperty } from '../utils/areaUnits';
import { sharePropertyListing } from '../utils/propertyShare';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  index?: number;
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
  index = 99,
  isFavorite,
  onToggleFavorite,
  onStartChat,
  onDeleteProperty,
  onToggleSold,
  onEditProperty,
}) => {
  const { isHindi } = useLanguage();
  const { currentUser, openAuthModal } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [showOwnerMenu, setShowOwnerMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localSold, setLocalSold] = useState(Boolean(property.isSold));

  const isDirectOwner = isPropertyOwner(property, currentUser);
  const isOwner = canManageProperty(property, currentUser);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalSold(Boolean(property.isSold));
  }, [property.isSold]);

  useEffect(() => {
    setImgError(false);
  }, [property.id]);

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

  const isLandOrPlot = isLandOrPlotProperty(property);

  const fallbackImage = isLandOrPlot
    ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
    : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

  const images = property.images && property.images.length > 0 ? property.images.filter(Boolean) : [];
  const primaryImage = images.length > 0 ? images[0] : fallbackImage;
  const currentImage = !imgError ? primaryImage : fallbackImage;

  const cleanArea = formatPropertyArea(property, isHindi);
  const rateDisplay = formatPropertyRate(property, isHindi);

  const isForRent =
    property.type === 'Rent/Lease' ||
    property.purpose === 'rent' ||
    Boolean(property.isAvailableForRent) ||
    (Boolean(property.priceDisplay) && property.priceDisplay.toLowerCase().includes('/ month'));

  const postTimestamp = formatPostTime(property.createdAt || property.postedAt, property.id);

  return (
    <article
      id={`property-card-${property.id}`}
      onClick={() => onSelect(property)}
      className="bg-[#FAF9F6] dark:bg-[#0C3628] rounded-2xl overflow-hidden border border-[#D0D7D2] dark:border-[#32463D] hover:border-[#0E3A2B] dark:hover:border-[#AA8F7C] hover:shadow-xl hover:shadow-[#032D1F]/15 dark:hover:shadow-black/60 shadow-xs flex flex-col justify-between cursor-pointer group relative transition-all duration-200 ease-out hover:-translate-y-1 select-none"
    >
      {/* 1. COMPACT PHOTO HEADER */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900 shrink-0">
        <img
          src={currentImage}
          alt={`${property.title} - ${property.category || 'Property'} in ${property.location || property.city || 'Uttarakhand'}`}
          width="400"
          height="192"
          loading={index < 4 ? 'eager' : 'lazy'}
          fetchPriority={index < 4 ? 'high' : 'auto'}
          decoding="async"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/25 pointer-events-none" />

        {/* Top-Left Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20 pointer-events-none">
          <span
            className={`text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm backdrop-blur-md flex items-center gap-1 border ${
              isForRent ? 'bg-teal-600/95 border-teal-300/80' : 'bg-emerald-600/95 border-emerald-300/80'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
            <span>{isForRent ? (isHindi ? 'किराया' : 'Rent') : (isHindi ? 'बिक्री' : 'Sale')}</span>
          </span>

          <span className="bg-slate-950/75 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {translatePropertyType(property.type, isHindi ? 'hi' : 'en')}
          </span>

          {property.featured && (
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
              <span>{isHindi ? 'फीचर्ड' : 'Featured'}</span>
            </span>
          )}
        </div>

        {/* Top-Right Bookmark & Owner Menu */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOwnerMenu((prev) => !prev);
                }}
                className="w-7 h-7 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white backdrop-blur-md border border-white/25 transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                title={isHindi ? 'विकल्प' : 'More Options'}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showOwnerMenu && (
                <div
                  className="absolute right-0 top-9 z-50 w-44 rounded-2xl bg-white dark:bg-[#071f16] border border-emerald-200 dark:border-emerald-800 shadow-2xl py-1.5 text-xs text-slate-800 dark:text-slate-100"
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
                      className="w-full px-3.5 py-2 text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/60 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{isHindi ? 'संपादित करें' : 'Edit Listing'}</span>
                    </button>
                  )}

                  {onToggleSold && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOwnerMenu(false);
                        setLocalSold((prev) => !prev);
                        onToggleSold(property.id);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-amber-50 dark:hover:bg-amber-950/60 flex items-center gap-2 cursor-pointer font-medium text-amber-700 dark:text-amber-300"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        {localSold
                          ? isHindi
                            ? 'उपलब्ध मार्क करें'
                            : 'Mark Available'
                          : isHindi
                            ? 'बिक चुका मार्क करें'
                            : 'Mark as Sold'}
                      </span>
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
                      className="w-full px-3.5 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer font-medium border-t border-slate-100 dark:border-slate-800/80"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'लिस्टिंग हटाएं' : 'Delete Listing'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(property.id);
            }}
            className={`w-7 h-7 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer flex items-center justify-center active:scale-95 ${
              isFavorite
                ? 'bg-emerald-600 text-white border border-emerald-400'
                : 'bg-black/55 text-white hover:bg-black/80 border border-white/25'
            }`}
            title={isFavorite ? (isHindi ? 'सहेजी गई सूची से हटाएं' : 'Remove from saved') : (isHindi ? 'सहेजें' : 'Save')}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white text-white' : 'text-white'}`} />
          </button>
        </div>

        {/* Sold Out Banner */}
        {localSold && (
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 bg-rose-600/95 text-white text-center font-black py-1.5 tracking-widest text-[11px] uppercase shadow-xl z-10 border-y border-rose-400">
            {isHindi ? '⚠️ बिक चुकी है (SOLD OUT)' : '⚠️ SOLD OUT'}
          </div>
        )}

        {/* Bottom Price & Photo Count */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2 z-10 pointer-events-none">
          <div className="min-w-0">
            <div className="text-xl font-black text-white drop-shadow-md leading-tight tracking-tight truncate">
              {formatLocalizedPrice(property.priceDisplay || '', isHindi ? 'hi' : 'en')}
            </div>
            {rateDisplay && (
              <span className="text-[10.5px] text-emerald-200 font-bold drop-shadow-xs block truncate">
                {rateDisplay}
              </span>
            )}
          </div>
          {images.length > 1 && (
            <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 shrink-0">
              📷 {images.length}
            </span>
          )}
        </div>
      </div>

      {/* 2. COMPACT CARD BODY (Zero Owner Name / Phone Exposed on Card) */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          {/* Title & Location */}
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-[15px] leading-snug line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
              <a
                href={getPropertySlugPath(property)}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                  }
                }}
                className="hover:underline text-inherit"
                title={property.title}
              >
                {property.title}
              </a>
            </h3>

            <div className="flex items-center justify-between gap-2 mt-1 text-[11.5px] text-slate-600 dark:text-emerald-200/85 font-medium">
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{property.location || property.city}</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-emerald-300/80 shrink-0 whitespace-nowrap">
                <Clock className="w-2.5 h-2.5 shrink-0" />
                <span>{postTimestamp}</span>
              </span>
            </div>
          </div>

          {/* Key Specs + Property Age + Views Pill */}
          <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200/70 dark:border-emerald-800/50">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              {cleanArea && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-200/90 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-[11px] font-bold whitespace-nowrap shrink-0">
                  <Maximize2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{cleanArea}</span>
                </span>
              )}

              {isLandOrPlot ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10.5px] font-semibold truncate">
                  {property.category || 'Land / Plot'}
                </span>
              ) : property.bedrooms > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold whitespace-nowrap shrink-0">
                  <Home className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{property.bedrooms} BHK</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold truncate">
                  {property.type === 'Studio' ? 'Studio' : translatePropertyType(property.type, isHindi ? 'hi' : 'en')}
                </span>
              )}
            </div>

            <span
              className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-600 dark:text-emerald-200/85 bg-slate-100/90 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-slate-200/80 dark:border-emerald-800/70 shrink-0 tabular-nums whitespace-nowrap"
              title={isHindi ? 'प्रॉपर्टी व्यूज' : 'Property views'}
            >
              <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{formatCardDisplayViewsCount(property, isHindi)}</span>
            </span>
          </div>
        </div>

        {/* Single-Line Actions Footer (Owner Name & Number Shown Only Inside Property Details) */}
        <div className="pt-2 border-t border-slate-200/70 dark:border-emerald-800/50 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sharePropertyListing(property, { isHindi });
            }}
            className="h-9 w-9 shrink-0 rounded-xl bg-green-50 dark:bg-green-950/80 hover:bg-green-100 dark:hover:bg-green-900/80 text-green-700 dark:text-green-300 flex items-center justify-center border border-green-300 dark:border-green-800 cursor-pointer transition-all active:scale-95"
            title={isHindi ? 'प्रॉपर्टी शेयर करें' : 'Share Property'}
            aria-label={isHindi ? 'प्रॉपर्टी शेयर करें' : 'Share Property'}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          {!isDirectOwner && onStartChat && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!currentUser) {
                  openAuthModal(
                    'login',
                    isHindi ? 'मालिक से सीधे चैट करने हेतु कृपया लॉगिन करें।' : 'Please log in to chat with property owner.',
                    () => onStartChat(property)
                  );
                  return;
                }
                onStartChat(property);
              }}
              className="h-9 px-3 shrink-0 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-1 border border-emerald-300 dark:border-emerald-700 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
              title={isHindi ? 'मालिक से चैट करें' : 'Chat'}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{isHindi ? 'चैट' : 'Chat'}</span>
            </button>
          )}

          <a
            href={`/property/${encodeURIComponent(property.id)}`}
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                e.preventDefault();
                e.stopPropagation();
                onSelect(property);
              }
            }}
            className="flex-1 h-9 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer no-underline whitespace-nowrap"
            title={isHindi ? 'पूरा विवरण व संपर्क नंबर देखें' : 'View Full Details & Contact'}
          >
            <span>{isHindi ? 'विवरण देखें' : 'View Details'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
          </a>
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
