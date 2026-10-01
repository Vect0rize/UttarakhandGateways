import React, { useState } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Building2,
  SlidersHorizontal,
  RotateCcw,
  ArrowDown
} from 'lucide-react';
import { FilterState, Property } from '../types';
import { CITIES, PROPERTIES } from '../data/properties';
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
  const [openDropdown, setOpenDropdown] = useState<'location' | 'category' | null>(null);
  const [isCustomLocationActive, setIsCustomLocationActive] = useState(false);
  const [customLocationInput, setCustomLocationInput] = useState('');

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
      label: isHindi ? 'अपना स्थान चुनें' : 'Select Your Location', 
      subLabel: isHindi ? 'उत्तराखंड के सभी प्रमुख स्थल' : 'All Famous Uttarakhand Destinations', 
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

  // Exactly requested Property Types list:
  // Villa, Flat, Plot, Cottage, Farmhouse, Shop, Hotel, Resort, Studio, Penthouse, Duplex, Land
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
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  // Determine current dropdown value for Location
  const dropdownLocationValue = 
    filters.city === 'All Locations' 
      ? 'All Locations' 
      : CITIES.includes(filters.city as any) 
        ? filters.city 
        : 'Other';

  const isFiltered = filters.city !== 'All Locations' || filters.category !== 'All Types' || filters.searchQuery !== '';

  return (
    <div id="property-search-filter-hub" className="w-full max-w-3xl mx-auto space-y-3 text-left">
      
      {/* 1. SMALL MENU ABOVE: LOCATIONS DROPBOX & PROPERTY TYPE DROPBOX IN THE SAME MENU */}
      <div className="bg-white/95 dark:bg-[#082218]/95 backdrop-blur-xl rounded-2xl shadow-md border border-emerald-200/90 dark:border-emerald-900/70 p-2 sm:p-2.5 relative z-50 transition-colors">
        <div className="flex items-center justify-between px-2 pt-1 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isHindi ? 'स्थान और प्रॉपर्टी प्रकार' : 'Select Location & Property Type'}</span>
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                setIsCustomLocationActive(false);
                setCustomLocationInput('');
                onResetFilters();
              }}
              className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 font-semibold underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? 'रीसेट' : t('search.reset')}</span>
            </button>
          )}
        </div>

        {/* Dropboxes in the same menu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Locations Dropdown */}
          <div className="relative">
            <CustomDropdown
              label={isHindi ? 'स्थान' : 'Location'}
              placeholder={filters.city !== 'All Locations' ? (isHindi ? (cityLabels[filters.city] || filters.city) : filters.city) : (isHindi ? 'स्थान चुनें' : 'Select Your Location')}
              value={dropdownLocationValue}
              options={locationOptions}
              onChange={handleLocationSelect}
              icon={<MapPin className="w-4 h-4" />}
              searchable={true}
              searchPlaceholder={isHindi ? 'शहर का नाम लिखें...' : 'Type city (e.g. Mussoorie, Auli)...'}
              isOpenControlled={openDropdown === 'location'}
              onToggleControlled={(isOpen) => setOpenDropdown(isOpen ? 'location' : null)}
            />
          </div>

          {/* Property Type Dropdown: Exact requested types */}
          <div className="relative">
            <CustomDropdown
              label={isHindi ? 'प्रॉपर्टी प्रकार' : 'Property Type'}
              placeholder={isHindi ? 'विला, फ्लैट, प्लॉट, कॉटेज, दुकान...' : 'Villa, Flat, Plot, Cottage...'}
              value={filters.category}
              options={propertyTypeOptions}
              onChange={handleCategorySelect}
              icon={<Building2 className="w-4 h-4" />}
              searchable={true}
              searchPlaceholder={isHindi ? 'प्रॉपर्टी प्रकार खोजें (विला, फ्लैट, प्लॉट)...' : 'Filter property types (e.g. Villa, Flat, Plot)...'}
              isOpenControlled={openDropdown === 'category'}
              onToggleControlled={(isOpen) => setOpenDropdown(isOpen ? 'category' : null)}
            />
          </div>
        </div>

        {/* Custom Location Input Box */}
        {isCustomLocationActive && (
          <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-[#071c14] border border-emerald-300 dark:border-emerald-700 animate-in fade-in duration-200">
            <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-300 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? 'उत्तराखंड में अपनी पसंद का स्थान / शहर लिखें:' : 'Enter your desired location / town in Uttarakhand:'}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customLocationInput}
                onChange={(e) => setCustomLocationInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyCustomLocation();
                  }
                }}
                placeholder={isHindi ? 'जैसे जोशीमठ, बागेश्वर, पिथौरागढ़, चम्पावत...' : 'e.g. Joshimath, Bageshwar, Pithoragarh, Champawat...'}
                className="flex-1 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-white dark:bg-[#05150f] rounded-xl border border-emerald-300 dark:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <button
                type="button"
                onClick={handleApplyCustomLocation}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                {isHindi ? 'स्थान सेट करें' : 'Set Location'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCustomLocationActive(false);
                  onFilterChange({ ...filters, city: 'All Locations' });
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Active Selection Feedback Pills with direct jump */}
        {isFiltered && (
          <div className="mt-2.5 pt-2 border-t border-emerald-100 dark:border-emerald-900/60 flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isHindi ? 'सक्रिय फिल्टर:' : 'Active:'}
              </span>
              {filters.city !== 'All Locations' && (
                <span className="inline-flex items-center gap-1 bg-emerald-100/80 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-full text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                  <span>📍 {isHindi ? (cityLabels[filters.city] || filters.city) : filters.city}</span>
                  <button
                    type="button"
                    onClick={() => handleLocationSelect('All Locations')}
                    className="hover:text-red-600 cursor-pointer ml-0.5"
                    title="Clear location filter"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.category !== 'All Types' && (
                <span className="inline-flex items-center gap-1 bg-teal-100/80 dark:bg-slate-800 text-teal-900 dark:text-teal-300 px-2 py-0.5 rounded-full text-xs font-semibold border border-teal-200 dark:border-slate-700">
                  <span>🏢 {filters.category}</span>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('All Types')}
                    className="hover:text-red-600 cursor-pointer ml-0.5"
                    title="Clear type filter"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            {onSearchSubmit && (
              <button
                type="button"
                onClick={onSearchSubmit}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <span>{isHindi ? `${totalResults} संपत्तियां देखें` : `View ${totalResults} Properties`}</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. SEARCH BAR KEPT BELOW THE MENU */}
      <div className="w-full relative z-10">
        <form 
          onSubmit={handleFormSubmit}
          className="relative flex items-center bg-white/95 dark:bg-[#082218]/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-emerald-950/5 dark:shadow-black/30 border border-emerald-200/90 dark:border-emerald-900/70 p-2 sm:p-2.5 transition-all focus-within:ring-3 focus-within:ring-emerald-400/30 focus-within:border-emerald-500"
        >
          <div className="pl-3 sm:pl-4 pr-2.5 flex items-center pointer-events-none text-emerald-600 dark:text-emerald-400">
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder={isHindi ? 'स्थान, बिल्डर, प्रोजेक्ट या प्रकार द्वारा खोजें (जैसे मसूरी, 3BHK, प्लॉट)...' : t('search.inputPlaceholder')}
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 text-sm sm:text-base font-medium placeholder-slate-400 dark:placeholder-emerald-200/50 focus:outline-none py-2 sm:py-2.5 pr-3"
          />

          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mr-1 sm:mr-2 cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-2 active:scale-98"
          >
            <span>{isHindi ? 'खोजें' : t('search.searchBtn')}</span>
          </button>
        </form>
      </div>

    </div>
  );
};
