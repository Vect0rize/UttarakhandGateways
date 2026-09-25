import React, { useState, useMemo, useEffect } from 'react';
import { Property, FilterState } from './types';
import { PROPERTIES } from './data/properties';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchBar } from './components/SearchBar';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { EmiCalculatorModal } from './components/EmiCalculatorModal';
import { LandUnitConverterModal } from './components/LandUnitConverterModal';
import { AboutAndContact } from './components/AboutAndContact';
import { Footer } from './components/Footer';
import { 
  RotateCcw, 
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

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
  // Theme state: light / dark mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('uk_gateways_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

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
  const [isEmiCalcOpen, setIsEmiCalcOpen] = useState(false);
  const [emiInitialPrice, setEmiInitialPrice] = useState<number>(8500000);
  const [isUnitConverterOpen, setIsUnitConverterOpen] = useState(false);

  // Synchronize HTML & Body theme classes
  useEffect(() => {
    try {
      localStorage.setItem('uk_gateways_theme', theme);
    } catch {}
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

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

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleOpenEmiCalc = (price?: number) => {
    if (price) setEmiInitialPrice(price);
    setIsEmiCalcOpen(true);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setShowingFavoritesOnly(false);
    setCurrentPage(1);
  };

  // Filter and sort properties
  const filteredProperties = useMemo(() => {
    return PROPERTIES.filter((property) => {
      // Favorites filter
      if (showingFavoritesOnly && !favorites.includes(property.id)) {
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

  // Pagination calculation: 10 properties per page
  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredProperties.length);
  const displayedProperties = filteredProperties.slice(startIndex, endIndex);

  const scrollToProperties = () => {
    const el = document.getElementById('properties-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    const el = document.getElementById('contact-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      scrollToProperties();
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#071526] text-slate-100' : 'bg-[#eef6fb] text-slate-800'} flex flex-col selection:bg-sky-500 selection:text-white relative overflow-x-hidden w-full transition-colors duration-300`}>
      
      {/* BACKGROUND CANVAS: Light Ocean Blue & Dark Himalayan Night */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Ocean Gradient Wash / Dark Obsidian Wash */}
        <div className={`absolute inset-0 transition-colors duration-500 ${
          isDark 
            ? 'bg-gradient-to-b from-[#071526] via-[#0b1c31] to-[#071526]' 
            : 'bg-gradient-to-b from-[#eaf4fb] via-[#f1f8fd] to-[#e7f3fa]'
        }`} />
        
        {/* Ambient Radial Sky & Azure Glow Points */}
        <div className={`absolute -top-40 left-1/4 w-[700px] h-[700px] rounded-full blur-[140px] transition-colors duration-500 ${
          isDark ? 'bg-sky-500/10' : 'bg-sky-300/15'
        }`} />
        <div className={`absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] transition-colors duration-500 ${
          isDark ? 'bg-blue-600/10' : 'bg-cyan-300/15'
        }`} />
        <div className={`absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full blur-[160px] transition-colors duration-500 ${
          isDark ? 'bg-indigo-600/10' : 'bg-blue-300/15'
        }`} />

        {/* Topographic Contour Map Pattern */}
        <svg className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isDark ? 'opacity-[0.05]' : 'opacity-[0.035]'}`} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="topo-contours" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M 0 50 Q 50 20 100 50 T 200 50" fill="none" stroke="#0284c7" strokeWidth="1" />
              <path d="M 0 100 Q 60 70 120 100 T 200 100" fill="none" stroke="#0369a1" strokeWidth="0.8" />
              <path d="M 0 150 Q 40 180 100 150 T 200 150" fill="none" stroke="#0284c7" strokeWidth="0.8" />
              <circle cx="100" cy="100" r="35" fill="none" stroke="#0284c7" strokeWidth="0.6" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="70" fill="none" stroke="#0369a1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo-contours)" />
        </svg>
      </div>
      
      {/* Navigation Bar with Theme Toggle and Organized Mobile Top Bar */}
      <Navbar
        onOpenEmiCalculator={() => handleOpenEmiCalc()}
        onOpenUnitConverter={() => setIsUnitConverterOpen(true)}
        favoriteCount={favorites.length}
        onToggleFavoritesOnly={() => {
          setShowingFavoritesOnly(!showingFavoritesOnly);
          setCurrentPage(1);
        }}
        showingFavoritesOnly={showingFavoritesOnly}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Hero Section with Locations & Search Bar embedded above Explore Properties & Contact Us */}
      <Hero
        onExploreClick={scrollToProperties}
        onContactClick={scrollToContact}
        searchBarSlot={
          <SearchBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalResults={filteredProperties.length}
            onSearchSubmit={scrollToProperties}
          />
        }
      />

      {/* Main Content Area: Properties Portfolio */}
      <main id="properties-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-20">
        
        {/* Saved for Later Indicator Bar */}
        {showingFavoritesOnly && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-rose-800 dark:text-rose-200 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bookmark className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>Showing your {favorites.length} properties saved for later</span>
            </div>
            <button
              onClick={() => {
                setShowingFavoritesOnly(false);
                setCurrentPage(1);
              }}
              className="text-xs bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 dark:hover:bg-rose-800 px-3 py-1.5 rounded-lg text-rose-900 dark:text-rose-100 font-semibold cursor-pointer"
            >
              Show All Properties
            </button>
          </div>
        )}

        {/* Properties Grid Header - Page controls moved to bottom center as requested */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-sky-200/80 dark:border-slate-800">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0c2340] dark:text-white font-serif-luxury">
              {showingFavoritesOnly 
                ? 'Saved for Later' 
                : filters.city !== 'All Locations'
                  ? `Properties in ${filters.city}`
                  : 'Our Property Portfolio'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Showing <span className="text-sky-700 dark:text-sky-400 font-bold">{filteredProperties.length}</span> exclusive clear title properties across Uttarakhand
            </p>
          </div>

          {/* Quick filter summary & reset controls */}
          <div className="flex items-center gap-2">
            {(filters.city !== 'All Locations' || filters.category !== 'All Types' || filters.searchQuery || filters.budgetRange !== 'all' || filters.bhkConfig !== 'all' || filters.himalayanViewOnly || filters.reraApprovedOnly) && (
              <button
                onClick={handleResetFilters}
                className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 border border-sky-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-sky-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                <span>Reset All Filters</span>
              </button>
            )}

            <button
              onClick={() => {
                const el = document.getElementById('hero');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Refine Search ↑</span>
            </button>
          </div>
        </div>

        {/* Properties Grid: 10 properties per page */}
        {displayedProperties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {displayedProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={(p) => handleSelectProperty(p)}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>

            {/* Centered Page Count & Pagination at the bottom of the property list */}
            {totalPages > 1 && (
              <div className="mt-12 pt-8 border-t border-sky-200/80 dark:border-slate-800 flex flex-col items-center justify-center gap-3 text-center">
                {/* Page Count in the Middle */}
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Showing properties <strong className="text-slate-900 dark:text-slate-100">{startIndex + 1}–{endIndex}</strong> of <strong className="text-slate-900 dark:text-slate-100">{filteredProperties.length}</strong> (Page {safeCurrentPage} of {totalPages})
                </div>

                {/* Centered Navigation Buttons */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handlePageChange(safeCurrentPage - 1)}
                    disabled={safeCurrentPage <= 1}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                      safeCurrentPage <= 1
                        ? 'opacity-40 cursor-not-allowed border-sky-200 dark:border-slate-800 text-slate-400'
                        : 'bg-white dark:bg-slate-900 border-sky-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer shadow-xs'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          safeCurrentPage === pageNum
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-sky-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePageChange(safeCurrentPage + 1)}
                    disabled={safeCurrentPage >= totalPages}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
                      safeCurrentPage >= totalPages
                        ? 'opacity-40 cursor-not-allowed border-sky-200 dark:border-slate-800 text-slate-400'
                        : 'bg-white dark:bg-slate-900 border-sky-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer shadow-xs'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-sky-200 dark:border-slate-800 shadow-xl space-y-4 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
              <RotateCcw className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {showingFavoritesOnly ? 'No Saved Properties Yet' : 'No Properties Match Your Current Filters'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {showingFavoritesOnly 
                ? 'Click "Save for later" on any property card to build your personal shortlist.' 
                : 'Try adjusting your search query, selecting "Select Your Location", or expanding the property type.'}
            </p>
            <div className="pt-2">
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer"
              >
                {showingFavoritesOnly ? 'Explore All Properties' : 'Reset All Filters'}
              </button>
            </div>
          </div>
        )}

        {/* About & Contact Section */}
        <AboutAndContact />

      </main>

      {/* Footer */}
      <Footer
        onCityClick={(city) => {
          handleFilterChange({ ...filters, city });
          scrollToProperties();
        }}
        onCategoryClick={(category) => {
          handleFilterChange({ ...filters, category });
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
          onOpenEmiCalculator={(price) => handleOpenEmiCalc(price)}
          isFavorite={favorites.includes(selectedProperty.id)}
          onToggleFavorite={toggleFavorite}
        />
      )}

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
