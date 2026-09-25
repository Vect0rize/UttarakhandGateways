import React, { useState } from 'react';
import { Property } from '../types';
import { 
  MapPin, 
  Bookmark, 
  Home, 
  Maximize2, 
  Star,
  ChevronLeft, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onBookVisit: (property: Property) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  isFavorite,
  onToggleFavorite,
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

  // Clean area display without confusing math or unit conversion clutter
  const cleanArea = property.areaSqFt 
    ? `${property.areaSqFt.toLocaleString()} sq.ft` 
    : property.areaDisplay.split('(')[0].trim();

  // Pipe-separated tags list: "Mountain View | Amenity 1 | Amenity 2"
  const tagList: string[] = [];
  if (property.himalayanPeakView) {
    tagList.push('Mountain View');
  }
  property.amenities.slice(0, 3).forEach((a) => tagList.push(a));

  return (
    <article
      id={`property-card-${property.id}`}
      onClick={handleCardClick}
      className="bg-[#0c1825]/90 hover:bg-[#0f1f30] rounded-2xl overflow-hidden border border-slate-700/60 hover:border-emerald-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl flex flex-col justify-between cursor-pointer group relative backdrop-blur-md"
    >
      {/* 1. PHOTO CONTAINER */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-950">
        
        {/* Main Image */}
        <img
          src={property.images[activeImageIndex]}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient dark overlay for crystal-clear readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1825] via-black/25 to-black/35 pointer-events-none" />

        {/* Top Header: Property Type on left, Save for Later button on right */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          
          {/* Property Type Badge */}
          <span className="bg-slate-900/85 backdrop-blur-md text-slate-200 border border-white/20 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm pointer-events-none">
            {property.type}
          </span>

          {/* Explicit "Save for later" Button (As Requested) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(property.id);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-200 shadow-md cursor-pointer ${
              isFavorite 
                ? 'bg-rose-500 text-white border border-rose-400 shadow-rose-900/40' 
                : 'bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/20'
            }`}
            title={isFavorite ? "Saved for later (Click to remove)" : "Save this property for later"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white text-white' : 'text-slate-300'}`} />
            <span>{isFavorite ? 'Saved' : 'Save for later'}</span>
          </button>

        </div>

        {/* Bottom of Photo: Outright Sale Price + Rating */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between z-10 pointer-events-none">
          
          {/* Price */}
          <div className="leading-tight">
            <div className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
              {property.priceDisplay}
            </div>
            {property.ratePerSqFt && (
              <span className="text-[10px] text-slate-300 font-mono font-medium drop-shadow">
                {property.ratePerSqFt}
              </span>
            )}
          </div>

          {/* Rating Badge */}
          <div className="bg-slate-900/85 backdrop-blur-md border border-white/15 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 text-[11px] font-bold text-slate-200">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>4.9</span>
            <span className="text-slate-400 font-normal text-[10px]">(128)</span>
          </div>

        </div>

        {/* Multi-Image Carousel Arrows on Hover */}
        {property.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 z-20 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20 z-20 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

      </div>

      {/* 2. CARD BODY */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 bg-[#0c1825]/90 text-slate-100">
        
        <div>
          {/* Property Title */}
          <h3 className="text-[15px] sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug line-clamp-1 mb-1 font-serif-luxury">
            {property.title}
          </h3>

          {/* Location with Pin */}
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#e67e22] flex-shrink-0" />
            <span className="truncate font-medium">{property.location}, {property.city}</span>
          </div>

          {/* Short Description */}
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-2">
            {property.description}
          </p>

          {/* Key Specs Row (Beds / Baths / Area) */}
          <div className="flex items-center gap-3 text-xs text-slate-300 py-1.5 border-y border-white/10 font-medium">
            {property.bedrooms > 0 ? (
              <span className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-emerald-400" />
                <span>{property.bedrooms} Beds</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">Plot</span>
            )}

            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-slate-400 text-xs">🛁</span>
                <span>{property.bathrooms} Baths</span>
              </span>
            )}

            <span className="flex items-center gap-1 ml-auto text-slate-300">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{cleanArea}</span>
            </span>
          </div>

          {/* 3. PIPE-SEPARATED TAGS: tag1 | tag2 | tag3 (No horizontal scrollbars) */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-300 pt-1.5">
            {tagList.map((tag, idx) => (
              <React.Fragment key={idx}>
                <span className={`font-medium ${idx === 0 && property.himalayanPeakView ? 'text-emerald-400 font-semibold' : 'text-slate-300'}`}>
                  {tag}
                </span>
                {idx < tagList.length - 1 && (
                  <span className="text-slate-600 font-light select-none">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 4. SOLID DEEP EMERALD CTA BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#00674f] hover:bg-[#005440] active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer"
            title="View Property Details"
          >
            <span>View Property</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </article>
  );
};
