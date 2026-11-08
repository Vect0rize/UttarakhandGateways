import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  MapPin, 
  Maximize2, 
  Bookmark, 
  Building2,
  CheckCircle2,
  MoreVertical,
  Edit3,
  Tag,
  Trash2,
  X
} from 'lucide-react';
import { Property } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { formatLocalizedPrice } from '../utils/language';
import { isLandOrPlotProperty } from '../utils/areaUnits';
import { isPropertyOwner } from '../utils/propertyOwnership';

interface TrendingCarouselProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  className?: string;
  currentUser?: any;
  onDeleteProperty?: (propertyId: string) => void;
  onToggleSold?: (propertyId: string) => void;
  onEditProperty?: (property: Property) => void;
  onOpenActionMenu?: (property: Property) => void;
}

export const TrendingCarousel: React.FC<TrendingCarouselProps> = ({
  properties,
  onSelectProperty,
  favorites,
  onToggleFavorite,
  className = '',
  currentUser: propUser,
  onDeleteProperty,
  onToggleSold,
  onEditProperty,
  onOpenActionMenu,
}) => {
  const { isHindi } = useLanguage();
  const { currentUser: authUser, openAuthModal } = useAuth();
  const currentUser = propUser || authUser;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Curate properties by views and recency
  const trendingList = React.useMemo(() => {
    return [...properties].sort((a, b) => {
      const viewsA = a.views || 0;
      const viewsB = b.views || 0;
      if (viewsB !== viewsA) return viewsB - viewsA;
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [properties]);

  // Reset horizontal scroll position so the first card never touches the left wall
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, [trendingList]);

  // If no properties, do not render empty padding
  if (trendingList.length === 0) {
    return null;
  }

  return (
    <div className={`w-full relative ${className}`}>
      {/* Global Transparent Backdrop to close active dropdown menu */}
      {activeMenuId && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenuId(null);
          }}
        />
      )}

      {/* Horizontal Mobile Card Track - Clean, Fast, Native Feel */}
      <div
        ref={scrollContainerRef}
        className="w-full flex items-stretch gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar px-4 pb-2 pt-0.5 scroll-pl-4 scroll-pr-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollPaddingLeft: '16px',
          scrollPaddingRight: '16px',
        }}
      >
        {trendingList.map((property, idx) => {
          const isFav = favorites.includes(property.id);
          const isLand = isLandOrPlotProperty(property);
          const isOwner = isPropertyOwner(property, currentUser);
          const primaryImage = Array.isArray(property.images) && property.images.length > 0 
            ? property.images[0] 
            : '/logo.png';

          return (
            <div
              key={property.id || idx}
              onClick={() => onSelectProperty(property)}
              className="w-[76vw] sm:w-[280px] max-w-[300px] min-w-[250px] shrink-0 snap-start bg-white dark:bg-[#071f17] rounded-xl overflow-hidden border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group active:scale-[0.98]"
            >
              {/* Image Container with Natural Brightness */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                <img
                  src={primaryImage}
                  alt={property.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />

                {/* Soft Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25 pointer-events-none" />

                {/* Sold Out Banner */}
                {property.isSold && (
                  <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 bg-rose-600/95 text-white text-center font-black py-1 tracking-widest text-[10px] uppercase shadow-lg backdrop-blur-xs z-20 border-y border-rose-400 pointer-events-none">
                    {isHindi ? '⚠️ बिक चुकी है (SOLD OUT)' : '⚠️ SOLD OUT'}
                  </div>
                )}

                {/* Top Badges: Category & Action Buttons */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-md text-white font-black text-[9px] uppercase tracking-wider backdrop-blur-md shadow-xs ${
                      (property.type === 'Rent/Lease' || property.purpose === 'rent' || property.isAvailableForRent)
                        ? 'bg-teal-600/95'
                        : 'bg-emerald-600/95'
                    }`}>
                      {(property.type === 'Rent/Lease' || property.purpose === 'rent' || property.isAvailableForRent) ? (isHindi ? 'Rent (किराया)' : 'Rent') : (isHindi ? 'Sale (बिक्री)' : 'Sale')}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900/80 text-white font-extrabold text-[9px] uppercase tracking-wider backdrop-blur-md shadow-xs border border-white/20">
                      {property.type || property.category || 'Featured'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pointer-events-auto">
                    {/* Three Dots Owner Action Menu - ONLY for property lister */}
                    {isOwner && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenActionMenu) {
                              onOpenActionMenu(property);
                            } else {
                              setActiveMenuId(activeMenuId === property.id ? null : property.id);
                            }
                          }}
                          aria-label="Owner options"
                          className="w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-md bg-black/60 hover:bg-black/80 text-white border border-white/25 transition-all active:scale-90 cursor-pointer shadow-sm"
                          title={isHindi ? 'विकल्प (एडिट / सोल्ड / डिलीट)' : 'Options (Edit / Sold / Delete)'}
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {activeMenuId === property.id && typeof document !== 'undefined' && createPortal(
                          <div
                            className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                            }}
                          >
                            <div
                              className="w-full sm:max-w-sm bg-white dark:bg-[#071c14] border-t sm:border border-emerald-300 dark:border-emerald-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-slate-800 dark:text-slate-100 modal-animate-pop space-y-3.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950">
                                <div className="min-w-0 pr-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                                    {isHindi ? 'प्रॉपर्टी विकल्प' : 'Property Options'}
                                  </span>
                                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                                    {property.title}
                                  </h4>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveMenuId(null)}
                                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>

                              <div className="space-y-2">
                                {onEditProperty && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      onEditProperty(property);
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
                                )}

                                {onToggleSold && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      onToggleSold(property.id);
                                    }}
                                    className="w-full p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center gap-3 cursor-pointer active:scale-98 transition-all"
                                  >
                                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                      <Tag className="w-4 h-4" />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                      <div className="font-black text-sm">{property.isSold ? (isHindi ? 'उपलब्ध मार्क करें' : 'Mark Available') : (isHindi ? 'बिक चुका मार्क करें' : 'Mark as Sold')}</div>
                                      <div className="text-[10px] opacity-75 truncate">{property.isSold ? (isHindi ? 'सोल्ड स्टेटस हटाएं' : 'Set listing as active') : (isHindi ? 'सोल्ड बैनर दिखाएं' : 'Display sold banner')}</div>
                                    </div>
                                  </button>
                                )}

                                {onDeleteProperty && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      setPropertyToDelete(property);
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
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => setActiveMenuId(null)}
                                className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                              >
                                {isHindi ? 'रद्द करें' : 'Cancel'}
                              </button>
                            </div>
                          </div>,
                          document.body
                        )}
                      </div>
                    )}

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
                      aria-label="Save to favorites"
                      className={`w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${
                        isFav 
                          ? 'bg-rose-600 text-white shadow-sm' 
                          : 'bg-black/40 hover:bg-black/60 text-white border border-white/25'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-white text-white' : 'text-white'}`} />
                    </button>
                  </div>
                </div>

                {/* Price Display on Bottom of Photo with zero clipping */}
                <div className="absolute bottom-2 left-2.5 right-2.5 z-10 pointer-events-none flex flex-wrap items-baseline justify-between gap-1">
                  <div className="text-base font-black text-white leading-tight drop-shadow-md">
                    {formatLocalizedPrice(property.priceDisplay || '', isHindi ? 'hi' : 'en')}
                  </div>
                  {property.ratePerSqFt && (() => {
                    const rawRate = String(property.ratePerSqFt).replace(/^[₹Rs.\s]+/i, '').replace(/\/?\s*(sq\.?ft|sqft).*$/i, '').trim();
                    return rawRate ? (
                      <span className="text-[9.5px] font-bold text-emerald-200 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded shrink-0">
                        ₹{rawRate}/sq.ft
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-snug truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {property.title}
                  </h4>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{property.location || property.city}</span>
                  </div>
                </div>

                {/* Property Specs (Area & Configuration) */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-emerald-950 text-[10.5px]">
                  <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                    <Maximize2 className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[120px]">{property.areaDisplay || `${property.areaSqFt} Sq.Ft`}</span>
                  </div>

                  <span className="text-[9.5px] font-bold text-slate-600 dark:text-emerald-300 bg-slate-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded border border-slate-200 dark:border-emerald-800/60 truncate max-w-[100px] shrink-0">
                    {isLand ? 'Plot/Land' : (property.configuration || (property.bedrooms ? `${property.bedrooms} BHK` : property.type))}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {propertyToDelete && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
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
                  if (onDeleteProperty) {
                    onDeleteProperty(targetId);
                  }
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
    </div>
  );
};
