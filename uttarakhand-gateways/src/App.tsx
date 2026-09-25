import React, { useState, useMemo, useEffect } from 'react';
import { Property, FilterState } from './types';
import { PROPERTIES } from './data/properties';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchBar } from './components/SearchBar';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { BookVisitModal } from './components/BookVisitModal';
import { EmiCalculatorModal } from './components/EmiCalculatorModal';
import { LandUnitConverterModal } from './components/LandUnitConverterModal';
import { AboutAndContact } from './components/AboutAndContact';
import { Footer } from './components/Footer';
import { 
  RotateCcw, 
  Bookmark, 
  Sparkles,
} from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  region: 'All',
  searchQuery: '',
  category: 'All Types',
  city: 'All Locations',
  budgetRange: 'all',
  bhkConfig: 'all',
  himalayanViewOnly: false,
  reraApprovedOnly: false,
  sortBy: 'price-low',
};

export default function App() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showingFavoritesOnly, setShowingFavoritesOnly] = useState(false);

  // Modals state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isBookVisitOpen, setIsBookVisitOpen] = useState(false);
  const [visitingProperty, setVisitingProperty] = useState<Property | null>(null);
  const [isEmiCalcOpen, setIsEmiCalcOpen] = useState(false);
  const [emiInitialPrice, setEmiInitialPrice] = useState<number>(8500000);
  const [isUnitConverterOpen, setIsUnitConverterOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('uk_gateways_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenBookVisit = (property?: Property | null) => {
    setVisitingProperty(property || null);
    setIsBookVisitOpen(true);
  };

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleOpenEmiCalc = (price?: number) => {
    if (price) setEmiInitialPrice(price);
    setIsEmiCalcOpen(true);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setShowingFavoritesOnly(false);
  };

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    return PROPERTIES.filter((property) => {
      // Favorites filter
      if (showingFavoritesOnly && !favorites.includes(property.id)) {
        return false;
      }

      // Region filter
      if (filters.region !== 'All' && property.region !== filters.region) {
        return false;
      }

      // Category filter
      if (filters.category !== 'All Types' && property.category !== filters.category) {
        return false;
      }

      // City filter
      if (filters.city !== 'All Locations' && property.city !== filters.city) {
        return false;
      }

      // Budget filter
      if (filters.budgetRange !== 'all') {
        const priceLakhs = property.price / 100000;
        if (filters.budgetRange === 'under-50' && priceLakhs >= 50) return false;
        if (filters.budgetRange === '50-100' && (priceLakhs < 50 || priceLakhs > 100)) return false;
        if (filters.budgetRange === '100-200' && (priceLakhs < 100 || priceLakhs > 200)) return false;
        if (filters.budgetRange === 'above-200' && priceLakhs <= 200) return false;
      }

      // BHK / Config filter
      if (filters.bhkConfig !== 'all') {
        if (filters.bhkConfig === 'plot') {
          if (property.type !== 'Plot') return false;
        } else {
          const bhkNum = parseInt(filters.bhkConfig, 10);
          if (property.bedrooms !== bhkNum) return false;
        }
      }

      // Himalayan View toggle
      if (filters.himalayanViewOnly && !property.himalayanPeakView) {
        return false;
      }

      // RERA / Clear title toggle
      if (filters.reraApprovedOnly && !property.reraStatus.includes('RERA')) {
        return false;
      }

      // Search text query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = property.title.toLowerCase().includes(query);
        const matchesLocation = property.location.toLowerCase().includes(query);
        const matchesCity = property.city.toLowerCase().includes(query);
        const matchesDesc = property.description.toLowerCase().includes(query);
        const matchesType = property.type.toLowerCase().includes(query);
        const matchesAmenities = property.amenities.some((a) => a.toLowerCase().includes(query));

        if (!matchesTitle && !matchesLocation && !matchesCity && !matchesDesc && !matchesType && !matchesAmenities) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-low') {
        return a.price - b.price;
      }
      if (filters.sortBy === 'price-high') {
        return b.price - a.price;
      }
      if (filters.sortBy === 'area-large') {
        return b.areaSqFt - a.areaSqFt;
      }
      if (filters.sortBy === 'area-small') {
        return a.areaSqFt - b.areaSqFt;
      }
      return 0;
    });
  }, [filters, favorites, showingFavoritesOnly]);

  const scrollToProperties = () => {
    const el = document.getElementById('properties-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    const el = document.getElementById('contact-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070e16] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden w-full">
      
      {/* 
        BACKGROUND: Seamless Himalayan Night theme
      */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep Mountain Gradient Wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060c13] via-[#091522] to-[#050b12]" />
        
        {/* Subtle Ambient Radial Light Points */}
        <div className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[160px]" />

        {/* Delicate Topographic Contour Vector Map Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="topo-contours" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 0 50 Q 50 20 100 50 T 200 50" fill="none" stroke="#fef08a" strokeWidth="1" />
              <path d="M 0 100 Q 60 70 120 100 T 200 100" fill="none" stroke="#ffffff" strokeWidth="0.8" />
              <path d="M 0 150 Q 40 180 100 150 T 200 150" fill="none" stroke="#6ee7b7" strokeWidth="0.8" />
              <circle cx="100" cy="100" r="35" fill="none" stroke="#fef08a" strokeWidth="0.6" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="#ffffff" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo-contours)" />
        </svg>

        {/* Faint Constellation / Star Dust Texture */}
        <div 
          className="absolute inset-0 opacity-[0.12]" 
          style={{
            backgroundImage: `radial-gradient(1.5px 1.5px at 40px 60px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 150px 220px, #f59e0b, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 300px 120px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 450px 380px, #10b981, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 600px 250px, #ffffff, rgba(0,0,0,0))`,
            backgroundSize: '550px 550px'
          }}
        />
      </div>
      
      {/* Navigation Bar */}
      <Navbar
        onOpenBookVisit={() => handleOpenBookVisit()}
        onOpenEmiCalculator={() => handleOpenEmiCalc()}
        onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
        favoriteCount={favorites.length}
        onToggleFavoritesOnly={() => setShowingFavoritesOnly(!showingFavoritesOnly)}
        showingFavoritesOnly={showingFavoritesOnly}
      />

      {/* Hero Section */}
      <Hero
        onExploreClick={scrollToProperties}
        onContactClick={scrollToContact}
      />

      {/* Main Content Area */}
      <main id="properties-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-20">
        
        {/* Search & Filter Hub */}
        <SearchBar
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          totalResults={filteredProperties.length}
        />

        {/* Saved for Later Indicator Bar */}
        {showingFavoritesOnly && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bookmark className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>Showing your {favorites.length} properties saved for later</span>
            </div>
            <button
              onClick={() => setShowingFavoritesOnly(false)}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-white font-medium cursor-pointer"
            >
              Show All Properties
            </button>
          </div>
        )}

        {/* Properties Grid Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-serif-luxury">
              {showingFavoritesOnly ? 'Saved for Later' : (filters.region !== 'All' ? `Our ${filters.region} Valley Portfolio` : 'Our Property Portfolio')}
            </h3>
            <p className="text-xs text-slate-400">
              {filteredProperties.length} exclusive freehold properties curated & owned directly by Uttarakhand Gateways
            </p>
          </div>
        </div>

        {/* Properties Grid (4 Columns) */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onSelect={(p) => handleSelectProperty(p)}
                onBookVisit={(p) => handleOpenBookVisit(p)}
                isFavorite={favorites.includes(property.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="glass-panel rounded-3xl p-12 text-center border border-white/10 space-y-4 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {showingFavoritesOnly ? 'No Saved Properties Yet' : 'No Properties Match Your Current Filters'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {showingFavoritesOnly 
                ? 'Click "Save for later" on any property card to build your personal shortlist.' 
                : 'Try adjusting your search query, clearing specific location constraints, or expanding the budget range.'}
            </p>
            <div className="pt-2">
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {showingFavoritesOnly ? 'Explore All Properties' : 'Reset All Filters'}
              </button>
            </div>
          </div>
        )}

        {/* About & Contact Section */}
        <AboutAndContact
          onOpenBookVisit={() => handleOpenBookVisit()}
        />

      </main>

      {/* Footer */}
      <Footer
        onCityClick={(city) => {
          setFilters({ ...filters, city });
          scrollToProperties();
        }}
        onCategoryClick={(category) => {
          setFilters({ ...filters, category });
          scrollToProperties();
        }}
        onOpenEmiCalc={() => handleOpenEmiCalc()}
        onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
      />

      {/* Modals */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onBookVisit={(p) => handleOpenBookVisit(p)}
          onOpenEmiCalculator={(price) => handleOpenEmiCalc(price)}
          isFavorite={favorites.includes(selectedProperty.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      <BookVisitModal
        isOpen={isBookVisitOpen}
        onClose={() => setIsBookVisitOpen(false)}
        selectedProperty={visitingProperty}
      />

      <EmiCalculatorModal
        isOpen={isEmiCalcOpen}
        onClose={() => setIsEmiCalcOpen(false)}
        initialPrice={emiInitialPrice}
      />

      <LandUnitConverterModal
        isOpen={isUnitConverterOpen}
        onClose={() => setIsUnitConverterOpen(false)}
      />

    </div>
  );
}
