import React, { useState } from 'react';
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
  Phone,
  ShieldCheck,
  User
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onStartChat?: (property: Property) => void;
  onRequestPhoneNumber?: (property: Property) => void;
  phoneRequestStatus?: 'none' | 'pending' | 'approved' | 'declined';
  approvedPhoneNumber?: string;
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
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
    ? `${property.areaSqFt.toLocaleString()} sq.ft` 
    : property.areaDisplay.split('(')[0].trim();

  // Pipe-separated tags list
  const tagList: string[] = [];
  if (property.himalayanPeakView) {
    tagList.push('Mountain View');
  }
  property.amenities.slice(0, 3).forEach((a) => tagList.push(a));

  const isPhoneApproved = phoneRequestStatus === 'approved';
  const isPhonePending = phoneRequestStatus === 'pending';
  const sellerDisplayName = property.sellerName || 'Direct Owner';

  return (
    <article
      id={`property-card-${property.id}`}
      onClick={handleCardClick}
      className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-sky-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-500 hover:shadow-xl hover:shadow-sky-900/10 dark:hover:shadow-black/40 transition-all duration-300 shadow-sm flex flex-col justify-between cursor-pointer group relative"
    >
      {/* 1. PHOTO CONTAINER */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={property.images[activeImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Subtle Dark Gradient Overlay for Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

        {/* Top Badges Row */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          
          {/* Property Category / Type Pill */}
          <span className="bg-sky-950/80 backdrop-blur-md border border-sky-300/40 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {property.type}
          </span>

          {/* Explicit "Save for later" Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(property.id);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 shadow-sm cursor-pointer ${
              isFavorite 
                ? 'bg-rose-500 text-white border border-rose-400 shadow-rose-900/30' 
                : 'bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-sky-900 border border-sky-200 dark:border-slate-700'
            }`}
            title={isFavorite ? "Saved for later (Click to remove)" : "Save this property for later"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white text-white' : 'text-slate-500 dark:text-slate-400'}`} />
            <span>{isFavorite ? 'Saved' : 'Save for later'}</span>
          </button>

        </div>

        {/* Bottom of Photo: Outright Sale Price */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between z-10 pointer-events-none">
          {/* Price */}
          <div className="leading-tight">
            <div className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
              {property.priceDisplay}
            </div>
            {property.ratePerSqFt && (
              <span className="text-[10px] text-sky-100 font-mono font-medium drop-shadow-sm">
                {property.ratePerSqFt}
              </span>
            )}
          </div>

          {/* Clean Clear Title Assurance Pill */}
          <span className="bg-sky-950/70 backdrop-blur-md border border-sky-400/40 px-2 py-0.5 rounded-full text-[10px] font-medium text-sky-200">
            Clear Title
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
          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>

          {/* Key Specs Row */}
          <div className="flex items-center gap-3 text-xs pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>{property.bedrooms} BHK</span>
              </span>
            )}

            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <span>{property.bathrooms} Baths</span>
              </span>
            )}

            <span className="flex items-center gap-1 ml-auto text-slate-700 dark:text-slate-300">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{cleanArea}</span>
            </span>
          </div>

          {/* Owner Privacy & Phone Status Row */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-[150px]">
              <User className="w-3 h-3 text-sky-600 flex-shrink-0" />
              <span className="truncate font-medium">{sellerDisplayName}</span>
            </div>

            {/* Masked / Protected Phone Pill */}
            {isPhoneApproved ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                <Unlock className="w-3 h-3 text-emerald-600" />
                <span>{approvedPhoneNumber || property.sellerPhone || '+91 7535981704'}</span>
              </span>
            ) : isPhonePending ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Request Pending</span>
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
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 px-2 py-0.5 rounded-full border border-sky-200 dark:border-slate-700 cursor-pointer transition-colors"
                title="Request permission to view owner phone number"
              >
                <Lock className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                <span>+91 98••••••••</span>
              </button>
            )}
          </div>

          {/* Pipe-separated tags */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
            {tagList.map((tag, idx) => (
              <React.Fragment key={idx}>
                <span className={`font-medium ${idx === 0 && property.himalayanPeakView ? 'text-sky-700 dark:text-sky-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                  {tag}
                </span>
                {idx < tagList.length - 1 && (
                  <span className="text-slate-300 dark:text-slate-600 font-light select-none">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* CTA BUTTONS (VIEW DETAILS & CHAT WITH OWNER) */}
        <div className="pt-2 flex items-center gap-2">
          {/* Quick Chat With Owner Button */}
          {onStartChat && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartChat(property);
              }}
              className="py-2.5 px-3 rounded-xl bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-sky-800 dark:text-sky-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-sky-200 dark:border-slate-700 cursor-pointer"
              title="Chat directly with property owner"
            >
              <MessageSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Chat</span>
            </button>
          )}

          {/* Solid View Property CTA Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm shadow-sky-600/20 cursor-pointer"
            title="View Property Details"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </article>
  );
};
