import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Building2,
  SlidersHorizontal,
  RotateCcw,
  Banknote,
  Sparkles,
  Clock,
  History,
  Trash2
} from 'lucide-react';
import { FilterState, Property } from '../types';
import { CITIES } from '../data/properties';
import { CustomDropdown, DropdownOption } from './CustomDropdown';
import { useLanguage } from '../context/LanguageContext';

interface SearchBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  totalResults: number;
  onSearchSubmit?: () => void;
  propertiesList?: Property[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
  onSearchSubmit,
  propertiesList = [],
}) => {
  const { t, isHindi } = useLanguage();
  const currentProps = propertiesList;

  // Coordinated open dropdown state to prevent any overlapping
  const [openDropdown, setOpenDropdown] = useState<'location' | 'category' | 'budget' | null>(null);
  const [isCustomLocationActive, setIsCustomLocationActive] = useState(false);
  const [customLocationInput, setCustomLocationInput] = useState('');

  // Recent Searches feature (saves and displays the last 5 user search queries)
  const RECENT_SEARCHES_KEY = 'uk_gateways_recent_searches';
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, 5);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close recent searches dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowRecentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveSearchQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5); // Strictly keep the last 5 queries
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeRecentSearch = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== itemToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  const handleSelectRecentSearch = (query: string) => {
    onFilterChange({ ...filters, searchQuery: query });
    saveSearchQuery(query);
    setShowRecentDropdown(false);
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const cityLabels: Record<string, string> = {
    'Dehradun': 'देहरादून',
    'Rishikesh': 'ऋषिकेश',
    'Haridwar': 'हरिद्वार',
    'Mussoorie': 'मसूरी',
    'Nainital': 'नैनीताल',
    'Mukteshwar': 'मुक्तेश्वर',
    'Almora': 'अल्मोड़ा',
    'Bhimtal': 'भीमताल',
    'Ranikhet': 'रानीखेत',
    'Lansdowne': 'लैंसडाउन',
    'Auli': 'औली',
    'Dhanaulti': 'धनौल्टी',
    'Kanatal': 'कनाताल',
    'Kausani': 'कौसानी',
    'Chakrata': 'चकराता',
    'Tehri Garhwal': 'टिहरी गढ़वाल',
    'Rudraprayag': 'रुद्रप्रयाग',
    'Uttarkashi': 'उत्तरकाशी',
    'Kotdwar': 'कोटद्वार',
    'Haldwani': 'हल्द्वानी',
    'Bhowali': 'भवाली',
    'Devprayag': 'देवप्रयाग',
  };

  // Locations dropdown options
  const locationOptions: DropdownOption[] = [
    { 
      value: 'All Locations', 
      label: isHindi ? 'अपना स्थान चुनें' : 'All Locations', 
      subLabel: isHindi ? 'उत्तराखंड के सभी प्रमुख स्थल' : 'All Uttarakhand Destinations', 
      count: currentProps.length > 0 ? currentProps.length : undefined
    },
    ...CITIES.map((city) => {
      const cnt = currentProps.filter((p) => p.city === city).length;
      return {
        value: city,
        label: isHindi ? cityLabels[city] || city : city,
        count: cnt > 0 ? cnt : undefined,
      };
    }),
    {
      value: 'Other',
      label: isHindi ? 'अन्य स्थान...' : 'Other Location...',
      subLabel: isHindi ? 'कस्टम शहर या क्षेत्र का नाम लिखें' : 'Type custom town, village, or area',
    },
  ];

  // Exactly requested Property Types list
  const propertyTypeOptions: DropdownOption[] = [
    { 
      value: 'All Types', 
      label: isHindi ? 'सभी प्रकार की संपत्तियां' : 'All Property Types', 
      subLabel: isHindi ? 'विला, फ्लैट, प्लॉट, कॉटेज, दुकान व भूमि' : 'Villas, Flats, Plots, Cottages & Land', 
      count: currentProps.length > 0 ? currentProps.length : undefined
    },
    { 
      value: 'Villa', 
      label: isHindi ? 'विला (Villa)' : 'Villa', 
      subLabel: isHindi ? 'स्वतंत्र लक्जरी पहाड़ी विला' : 'Luxury Hill Villas & Independent Houses', 
      count: currentProps.filter((p) => p.type === 'Villa').length || undefined
    },
    { 
      value: 'Flat', 
      label: isHindi ? 'फ्लैट (Flat)' : 'Flat', 
      subLabel: isHindi ? '1, 2, 3 BHK अपार्टमेंट्स' : '1, 2, 3 BHK Apartments', 
      count: currentProps.filter((p) => p.type === 'Flat' || p.type === 'Apartment').length || undefined
    },
    { 
      value: 'Plot', 
      label: isHindi ? 'प्लॉट (Plot)' : 'Plot', 
      subLabel: isHindi ? 'आवासीय फ्रीहोल्ड प्लॉट' : 'Residential Freehold Land Plots', 
      count: currentProps.filter((p) => p.type === 'Plot').length || undefined
    },
    { 
      value: 'Cottage', 
      label: isHindi ? 'कॉटेज (Cottage)' : 'Cottage', 
      subLabel: isHindi ? 'लकड़ी व पत्थर के हेरिटेज कॉटेज' : 'Wooden & Stone Heritage Hill Cottages', 
      count: currentProps.filter((p) => p.type === 'Cottage').length || undefined
    },
    { 
      value: 'Farmhouse', 
      label: isHindi ? 'फार्महाउस (Farmhouse)' : 'Farmhouse', 
      subLabel: isHindi ? 'प्रकृति की गोद में फार्महाउस व एस्टेट' : 'Scenic Mountain Farmhouses & Estates', 
      count: currentProps.filter((p) => p.type === 'Farmhouse').length || undefined
    },
    { 
      value: 'Shop', 
      label: isHindi ? 'दुकान (Shop)' : 'Shop', 
      subLabel: isHindi ? 'दुकानें, शोरूम व व्यावसायिक जगह' : 'Shops, Showrooms & Commercial Spaces', 
      count: currentProps.filter((p) => p.type === 'Shop' || p.category === 'Commercial').length || undefined
    },
    { 
      value: 'Hotel', 
      label: isHindi ? 'होटल (Hotel)' : 'Hotel', 
      subLabel: isHindi ? 'पर्यटक होटल व रनिंग प्रॉपर्टी' : 'Running Hotels & Commercial Stays', 
      count: currentProps.filter((p) => p.type === 'Hotel').length || undefined
    },
    { 
      value: 'Resort', 
      label: isHindi ? 'रिसॉर्ट (Resort)' : 'Resort', 
      subLabel: isHindi ? 'इको-रिसॉर्ट्स, रिट्रीट व होमस्टे' : 'Eco-Resorts, Wellness Retreats & Homestays', 
      count: currentProps.filter((p) => p.type === 'Resort').length || undefined
    },
    { 
      value: 'Studio', 
      label: isHindi ? 'स्टूडियो (Studio)' : 'Studio', 
      subLabel: isHindi ? 'कॉम्पैक्ट 1RK व स्टूडियो अपार्टमेंट' : 'Compact Studio Apartments & Suites', 
      count: currentProps.filter((p) => p.type === 'Studio').length || undefined
    },
    { 
      value: 'Penthouse', 
      label: isHindi ? 'पेंटहाउस (Penthouse)' : 'Penthouse', 
      subLabel: isHindi ? 'टॉप फ्लोर व्यू व रूफटॉप लाउंज' : 'Panoramic Mountain View Penthouses', 
      count: currentProps.filter((p) => p.type === 'Penthouse').length || undefined
    },
    { 
      value: 'Duplex', 
      label: isHindi ? 'डुप्लेक्स (Duplex)' : 'Duplex', 
      subLabel: isHindi ? 'दो मंजिला लग्जरी घर' : 'Two-Level Hillside Luxury Homes', 
      count: currentProps.filter((p) => p.type === 'Duplex').length || undefined
    },
    { 
      value: 'Land', 
      label: isHindi ? 'भूमि / जमीन (Land)' : 'Land', 
      subLabel: isHindi ? 'कृषि भूमि, सेब के बगीचे व बड़े रकबे' : 'Agricultural Land, Orchards & Large Acreage', 
      count: currentProps.filter((p) => p.type === 'Land' || p.category === 'Agriculture').length || undefined
    },
    { 
      value: 'PG', 
      label: isHindi ? 'पेइंग गेस्ट (PG)' : 'PG / Co-Living', 
      subLabel: isHindi ? 'छात्र व कामकाजी पेशेवरों हेतु पीजी' : 'PG Hostels & Co-Living Spaces', 
      count: currentProps.filter((p) => p.type === 'PG' || p.configuration?.includes('PG')).length || undefined
    },
  ];

  // Budget Filter options as requested
  const budgetOptions: DropdownOption[] = [
    { 
      value: 'all', 
      label: isHindi ? 'सभी बजट' : 'All Budgets', 
      subLabel: isHindi ? 'किसी भी बजट में संपत्तियां देखें' : 'Any Price Range' 
    },
    { 
      value: 'under-25l', 
      label: isHindi ? '₹25 लाख से कम' : 'Under ₹25 Lakhs', 
      subLabel: isHindi ? 'किफायती प्लॉट व फ्लैट' : 'Affordable plots & 1 BHK flats' 
    },
    { 
      value: '25l-50l', 
      label: isHindi ? '₹25 लाख - ₹50 लाख' : '₹25 Lakhs - ₹50 Lakhs', 
      subLabel: isHindi ? '2 BHK फ्लैट व आवासीय प्लॉट' : 'Mid-budget mountain plots' 
    },
    { 
      value: '50l-1cr', 
      label: isHindi ? '₹50 लाख - ₹1 करोड़' : '₹50 Lakhs - ₹1 Crore', 
      subLabel: isHindi ? 'प्रीमियम कॉटेज व विला' : 'Premium cottages & luxury flats' 
    },
    { 
      value: '1cr-2.5cr', 
      label: isHindi ? '₹1 करोड़ - ₹2.5 करोड़' : '₹1 Cr - ₹2.5 Crore', 
      subLabel: isHindi ? 'लक्जरी हिमालयन विला' : 'Luxury Himalayan peak-view villas' 
    },
    { 
      value: '2.5cr-5cr', 
      label: isHindi ? '₹2.5 करोड़ - ₹5 करोड़' : '₹2.5 Cr - ₹5 Crore', 
      subLabel: isHindi ? 'सुपर लक्जरी एस्टेट व रिसॉर्ट्स' : 'Super luxury estates & homestays' 
    },
    { 
      value: 'above-5cr', 
      label: isHindi ? '₹5 करोड़ से अधिक' : 'Above ₹5 Crore', 
      subLabel: isHindi ? 'होटल, रिसॉर्ट व हेरिटेज संपत्तियां' : 'Heritage estates & boutique hotels' 
    },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filters.searchQuery.trim()) {
      saveSearchQuery(filters.searchQuery.trim());
    }
    setShowRecentDropdown(false);
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const handleLocationSelect = (city: string) => {
    if (city === 'Other') {
      setIsCustomLocationActive(true);
      setOpenDropdown(null);
      return;
    }
    setIsCustomLocationActive(false);
    onFilterChange({ ...filters, city });
    setOpenDropdown(null);
  };

  const handleApplyCustomLocation = () => {
    const trimmed = customLocationInput.trim();
    if (trimmed) {
      onFilterChange({ ...filters, city: trimmed });
    }
    setIsCustomLocationActive(false);
  };

  const handleCategorySelect = (category: string) => {
    onFilterChange({ ...filters, category });
    setOpenDropdown(null);
  };

  const handleBudgetSelect = (budgetRange: string) => {
    onFilterChange({ ...filters, budgetRange });
    setOpenDropdown(null);
  };

  // Determine current dropdown value for Location
  const dropdownLocationValue = 
    filters.city === 'All Locations' 
      ? 'All Locations' 
      : CITIES.includes(filters.city as any) 
        ? filters.city 
        : 'Other';

  const isFiltered = 
    filters.city !== 'All Locations' || 
    filters.category !== 'All Types' || 
    (filters.budgetRange && filters.budgetRange !== 'all') || 
    filters.searchQuery !== '';

  return (
    <div id="property-search-filter-hub" className="w-full max-w-4xl mx-auto space-y-3 text-left">
      
      {/* 1. FILTER MENU: LOCATIONS, PROPERTY TYPE & BUDGET DROPBOXES IN LIGHT GREEN SHADE */}
      <div className="bg-[#f2f8f4]/95 dark:bg-[#07241a]/95 backdrop-blur-xl rounded-3xl shadow-lg border border-emerald-300/80 dark:border-emerald-800/80 p-2.5 sm:p-3 relative z-50 transition-colors">
        <div className="flex items-center px-2 pt-1 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isHindi ? 'स्थान, प्रॉपर्टी प्रकार और बजट' : 'Location, Property Type & Budget'}</span>
          </div>
        </div>

        {/* 3 Dropboxes in the same menu: Location, Property Type, Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* 1. Locations Dropdown */}
          <div className="relative">
            <CustomDropdown
              label={isHindi ? 'स्थान' : 'Location'}
              placeholder={filters.city !== 'All Locations' ? (isHindi ? (cityLabels[filters.city] || filters.city) : filters.city) : (isHindi ? 'स्थान चुनें' : 'All Locations')}
              value={dropdownLocationValue}
              options={locationOptions}
              onChange={handleLocationSelect}
              icon={<MapPin className="w-4 h-4" />}
              searchable={true}
              searchPlaceholder={isHindi ? 'शहर का नाम लिखें...' : 'Type city (Mussoorie, Auli)...'}
              isOpenControlled={openDropdown === 'location'}
              onToggleControlled={(isOpen) => setOpenDropdown(isOpen ? 'location' : null)}
            />
          </div>

          {/* 2. Property Type Dropdown */}
          <div className="relative">
            <CustomDropdown
              label={isHindi ? 'प्रॉपर्टी प्रकार' : 'Property Type'}
              placeholder={isHindi ? 'विला, फ्लैट, प्लॉट...' : 'Villa, Flat, Plot...'}
              value={filters.category}
              options={propertyTypeOptions}
              onChange={handleCategorySelect}
              icon={<Building2 className="w-4 h-4" />}
              searchable={true}
              searchPlaceholder={isHindi ? 'प्रकार खोजें (विला, फ्लैट, प्लॉट)...' : 'Filter types...'}
              isOpenControlled={openDropdown === 'category'}
              onToggleControlled={(isOpen) => setOpenDropdown(isOpen ? 'category' : null)}
            />
          </div>

          {/* 3. Budget Filter Dropdown (Added as requested) */}
          <div className="relative">
            <CustomDropdown
              label={isHindi ? 'बजट (मूल्य)' : 'Budget (Price)'}
              placeholder={isHindi ? 'सभी बजट' : 'All Budgets'}
              value={filters.budgetRange || 'all'}
              options={budgetOptions}
              onChange={handleBudgetSelect}
              icon={<Banknote className="w-4 h-4" />}
              isOpenControlled={openDropdown === 'budget'}
              onToggleControlled={(isOpen) => setOpenDropdown(isOpen ? 'budget' : null)}
            />
          </div>
        </div>

        {/* Custom Location Input Box */}
        {isCustomLocationActive && (
          <div className="mt-2.5 p-3 rounded-2xl bg-emerald-100/70 dark:bg-[#093023] border border-emerald-300 dark:border-emerald-700 animate-in fade-in duration-200">
            <label className="block text-[11px] font-bold text-emerald-950 dark:text-emerald-200 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{isHindi ? 'उत्तराखंड में अपनी पसंद का स्थान / शहर लिखें:' : 'Enter custom town or area in Uttarakhand:'}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customLocationInput}
                onChange={(e) => setCustomLocationInput(e.target.value)}
                placeholder={isHindi ? 'उदा: धनौल्टी, कानाताल, कनाताल, रानीखेत...' : 'e.g. Dhanaulti, Kanatal, Ranikhet...'}
                className="flex-1 px-3.5 py-2 text-xs text-emerald-950 dark:text-emerald-100 bg-white dark:bg-[#061e15] rounded-xl border border-emerald-300 dark:border-emerald-600 focus:outline-none focus:border-emerald-500 font-medium"
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCustomLocation()}
                autoFocus
              />
              <button
                type="button"
                onClick={handleApplyCustomLocation}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                {isHindi ? 'लागू करें' : 'Apply'}
              </button>
              <button
                type="button"
                onClick={() => setIsCustomLocationActive(false)}
                className="p-2 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200/50 cursor-pointer"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. TEXT SEARCH BAR: Keyword search with Recent Searches dropdown */}
      <div ref={searchContainerRef} className="relative z-10">
        <form onSubmit={handleFormSubmit}>
          <div className="relative flex items-center">
            <input
              id="main-property-search-input"
              type="text"
              value={filters.searchQuery}
              onFocus={() => setShowRecentDropdown(true)}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder={
                isHindi 
                  ? 'कीवर्ड द्वारा खोजें (उदा: हिमालयन व्यू, 3 BHK, 143 कनवर्टेड, प्लॉट)...' 
                  : 'Search by keyword (e.g., Himalayan peak view, 3 BHK villa, freehold plot)...'
              }
              className="w-full pl-11 pr-24 sm:pr-28 py-3 sm:py-3.5 rounded-full bg-white/95 dark:bg-[#07241a]/95 text-slate-800 dark:text-emerald-100 placeholder-slate-400 dark:placeholder-emerald-400/50 text-xs sm:text-sm font-medium border border-emerald-300/80 dark:border-emerald-800/80 shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-4 pointer-events-none" />

            <div className="absolute right-2 flex items-center gap-1">
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                  title="Clear text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                {isHindi ? 'खोजें' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {/* RECENT SEARCHES DROPDOWN MENU (Saves and displays the last 5 user search queries) */}
        {showRecentDropdown && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 dark:bg-[#07241a]/95 backdrop-blur-2xl border border-emerald-300/90 dark:border-emerald-800/90 rounded-3xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            {recentSearches.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-emerald-100 dark:border-emerald-900/60 mb-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'हाल की खोजें (अंतिम ५)' : 'Recent Searches (Last 5)'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearAllRecentSearches}
                    className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isHindi ? 'सभी हटाएं' : 'Clear All'}</span>
                  </button>
                </div>

                <div className="space-y-0.5">
                  {recentSearches.map((query, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectRecentSearch(query)}
                      className="w-full px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/70 flex items-center justify-between transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <History className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 shrink-0" />
                        <span className="truncate group-hover:text-emerald-900 dark:group-hover:text-emerald-200">
                          {query}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(e, query)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors shrink-0 cursor-pointer"
                        title={isHindi ? 'यह खोज हटाएं' : 'Remove search query'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-3 text-center space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  {isHindi ? 'कोई हाल की खोज नहीं मिली।' : 'No recent searches yet.'}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                  {isHindi ? 'सुझाव: देहरादून प्लॉट, मसूरी विला, ऋषिकेश फ्लैट' : 'Tip: Try searching "Mussoorie Villa", "Dehradun Plot", "Ganga View"'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
