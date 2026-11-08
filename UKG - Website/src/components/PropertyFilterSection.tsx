import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Building2, 
  SlidersHorizontal, 
  RotateCcw, 
  IndianRupee, 
  Tag, 
  Key,
  Compass,
  Check
} from 'lucide-react';
import { FilterState, Property } from '../types';
import { CITIES } from '../data/properties';
import { useLanguage } from '../context/LanguageContext';

interface PropertyFilterSectionProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  totalResults: number;
  onSearchSubmit?: () => void;
  isRentActive?: boolean;
  onToggleRent?: (isRent: boolean) => void;
  className?: string;
}

export const PropertyFilterSection: React.FC<PropertyFilterSectionProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
  onSearchSubmit,
  isRentActive = false,
  onToggleRent,
  className = '',
}) => {
  const { isHindi } = useLanguage();
  const [searchInput, setSearchInput] = useState(filters.searchQuery || '');
  const [isBuyMode, setIsBuyMode] = useState<boolean>(() => filters.category !== 'Rent/Lease' && !isRentActive);

  const PROPERTY_TYPES = [
    { value: 'All Types', labelEn: 'All Types', labelHi: 'सभी प्रकार' },
    { value: 'Residential', labelEn: 'Residential', labelHi: 'आवासीय' },
    { value: 'Land / Plot', labelEn: 'Land / Plot', labelHi: 'जमीन / प्लॉट' },
    { value: 'Apartment', labelEn: 'Apartment / Flat', labelHi: 'अपार्टमेंट / फ्लैट' },
    { value: 'House', labelEn: 'House / Villa', labelHi: 'मकान / विला' },
    { value: 'Commercial', labelEn: 'Commercial', labelHi: 'वाणिज्यिक' },
  ];

  const BUDGET_RANGES = [
    { value: 'all', labelEn: 'All Budgets', labelHi: 'सभी बजट' },
    { value: 'under-25l', labelEn: 'Under ₹25 Lakh', labelHi: '₹25 लाख से कम' },
    { value: '25l-50l', labelEn: '₹25L – ₹50 Lakh', labelHi: '₹25L – ₹50 लाख' },
    { value: '50l-1cr', labelEn: '₹50L – ₹1 Crore', labelHi: '₹50L – ₹1 करोड़' },
    { value: 'above-1cr', labelEn: 'Above ₹1 Crore', labelHi: '₹1 करोड़ से अधिक' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      ...filters,
      searchQuery: searchInput,
    });
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const handleBuyRentToggle = (buy: boolean) => {
    setIsBuyMode(buy);
    if (onToggleRent) {
      onToggleRent(!buy);
    }
    onFilterChange({
      ...filters,
      category: buy ? 'All Types' : 'Rent/Lease',
    });
  };

  const handleTypeSelect = (typeVal: string) => {
    onFilterChange({
      ...filters,
      category: typeVal,
    });
  };

  return (
    <section id="search-filter-section" className={`w-full py-6 sm:py-8 bg-gradient-to-b from-[#edf6f0] via-[#f4faf6] to-transparent dark:from-[#061e16] dark:via-[#07241a] dark:to-transparent border-b border-emerald-100 dark:border-emerald-950/60 transition-colors ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Compact Heading & Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0a271c] dark:text-white font-serif-luxury tracking-tight flex items-center gap-2">
              <span>{isHindi ? 'उत्तराखंड में अपनी मनपसंद प्रॉपर्टी खोजें' : 'Find Verified Properties Across Uttarakhand'}</span>
              <span className="hidden sm:inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-sans">
                0% Brokerage
              </span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {isHindi 
                ? 'देहरादून, ऋषिकेश, मसूरी, नैनीताल, हरिद्वार और अल्मोड़ा में सीधे मालिकों व बिल्डरों से प्लॉट, विला और फ्लैट' 
                : 'Direct buyer-to-owner marketplace with legal clearance across Dehradun, Rishikesh, Nainital, Mussoorie & hill towns.'}
            </p>
          </div>

          {/* Buy vs Rent Toggle Pill */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/80 shadow-xs self-start sm:self-center">
            <button
              type="button"
              onClick={() => handleBuyRentToggle(true)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isBuyMode
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{isHindi ? 'खरीदें (Buy)' : 'Buy'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleBuyRentToggle(false)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isBuyMode
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isHindi ? 'किराया (Rent)' : 'Rent'}</span>
            </button>
          </div>
        </div>

        {/* Primary Filter Box */}
        <div className="bg-white dark:bg-[#071f17] rounded-3xl p-4 sm:p-5 border border-emerald-200/90 dark:border-emerald-900/80 shadow-xl shadow-emerald-950/5 space-y-4">
          
          {/* Main Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch gap-2.5">
            
            {/* 1. Keyword / Name / Locality Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={isHindi ? 'शहर, कॉलोनी, प्लॉट या प्रॉपर्टी का नाम खोजें...' : 'Search by city, locality, project, or property name...'}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* 2. City / Location Select */}
            <div className="w-full md:w-52 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                aria-label={isHindi ? 'स्थान / शहर चुनें' : 'Select City'}
                value={filters.city}
                onChange={(e) => onFilterChange({ ...filters, city: e.target.value as any })}
                className="w-full pl-10 pr-8 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
              >
                <option value="All Locations">{isHindi ? 'सभी स्थान (All Locations)' : 'All Locations'}</option>
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-slate-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Budget Range Select */}
            <div className="w-full md:w-48 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
                <IndianRupee className="w-4 h-4" />
              </div>
              <select
                aria-label={isHindi ? 'बजट चुनें' : 'Select Budget'}
                value={filters.budgetRange}
                onChange={(e) => onFilterChange({ ...filters, budgetRange: e.target.value as any })}
                className="w-full pl-10 pr-8 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer"
              >
                {BUDGET_RANGES.map((b) => (
                  <option key={b.value} value={b.value} className="bg-white dark:bg-slate-900">
                    {isHindi ? b.labelHi : b.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Search & Search Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-emerald-700/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{isHindi ? 'खोजें' : 'Search'}</span>
              </button>

              {(searchInput || filters.city !== 'All Locations' || filters.category !== 'All Types' || filters.budgetRange !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    onResetFilters();
                  }}
                  title={isHindi ? 'फिल्टर रीसेट करें' : 'Reset all filters'}
                  className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

          </form>

          {/* Property Type Quick Chips */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isHindi ? 'प्रकार:' : 'Type:'}</span>
              </span>

              {PROPERTY_TYPES.map((t) => {
                const isSelected = filters.category === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleTypeSelect(t.value)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs scale-[1.02]'
                        : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 border border-transparent hover:border-emerald-300'
                    }`}
                  >
                    {isHindi ? t.labelHi : t.labelEn}
                  </button>
                );
              })}
            </div>

            {/* Results Count Badge */}
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isHindi ? (
                <span>कुल <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{totalResults}</strong> संपत्तियां उपलब्ध</span>
              ) : (
                <span>Found <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{totalResults}</strong> properties</span>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
