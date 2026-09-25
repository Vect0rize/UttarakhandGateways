import React, { useState } from 'react';
import { Property } from '../types';
import { 
  MapPin, 
  Bookmark, 
  Home, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
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
      className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-sky-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-500 hover:shadow-xl hover:shadow-sky-900/10 dark:hover:shadow-black/40 transition-all duration-300 shadow-sm flex flex-col justify-between cursor-pointer group relative"
    >
      {/* 1. PHOTO CONTAINER */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        
        {/* Main Image */}
        <img
          src={property.images[activeImageIndex]}
          alt={property.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient dark overlay for crystal-clear readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/35 pointer-events-none" />

        {/* Top Header: Property Type on left, Save for Later button on right */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          
          {/* Property Type Badge */}
          <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-sky-900 dark:text-sky-300 border border-sky-200 dark:border-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs pointer-events-none">
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

        {/* Bottom of Photo: Outright Sale Price (Rating removed as requested) */}
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

      {/* 2. CARD BODY */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        
        <div>
          {/* Property Title */}
          <h3 className="text-[15px] sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors leading-snug line-clamp-1 mb-1 font-serif-luxury">
            {property.title}
          </h3>

          {/* Location with Pin */}
          <div className="flex items-center gap-1 text-xs text-sky-800 dark:text-sky-300 mb-2">
            <MapPin className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 flex-shrink-0" />
            <span className="truncate font-medium">{property.location}, {property.city}</span>
          </div>

          {/* Short Description */}
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
            {property.description}
          </p>

          {/* Key Specs Row (Beds / Baths / Area) */}
          <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 py-1.5 border-y border-sky-100 dark:border-slate-800 font-medium">
            {property.bedrooms > 0 ? (
              <span className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>{property.bedrooms} Beds</span>
              </span>
            ) : (
              <span className="text-sky-700 dark:text-sky-400 font-semibold">Plot</span>
            )}

            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-slate-400 text-xs">🛁</span>
                <span>{property.bathrooms} Baths</span>
              </span>
            )}

            <span className="flex items-center gap-1 ml-auto text-slate-700 dark:text-slate-300">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{cleanArea}</span>
            </span>
          </div>

          {/* 3. PIPE-SEPARATED TAGS */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-600 dark:text-slate-400 pt-1.5">
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

        {/* 4. SOLID OCEAN BLUE CTA BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-sky-600/20 cursor-pointer"
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
