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
import { FilterState } from '../types';
import { CITIES, PROPERTIES } from '../data/properties';
import { CustomDropdown, DropdownOption } from './CustomDropdown';

interface SearchBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  totalResults: number;
  onSearchSubmit?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
  onSearchSubmit,
}) => {
  // Coordinated open dropdown state to prevent any overlapping
  const [openDropdown, setOpenDropdown] = useState<'location' | 'category' | null>(null);

  // Every famous location across Uttarakhand
  const locationOptions: DropdownOption[] = [
    { 
      value: 'All Locations', 
      label: 'Select Your Location', 
      subLabel: 'All Famous Uttarakhand Destinations', 
      count: PROPERTIES.length 
    },
    ...CITIES.map((city) => ({
      value: city,
      label: city,
      count: PROPERTIES.filter((p) => p.city === city).length,
    })),
  ];

  // Every type of property in Uttarakhand
  const propertyTypeOptions: DropdownOption[] = [
    { 
      value: 'All Types', 
      label: 'Flats/Plots/Commercial/Etc.', 
      subLabel: 'Every Real Estate Property Type', 
      count: PROPERTIES.length 
    },
    { 
      value: 'Flats & Apartments', 
      label: 'Flats & Apartments', 
      subLabel: '1, 2, 3 & 4 BHK Mountain Apartments', 
      count: PROPERTIES.filter((p) => p.category === 'Flats & Apartments').length 
    },
    { 
      value: 'Residential Plots', 
      label: 'Residential Plots', 
      subLabel: 'Clear Title Plots & Gated Registry Land', 
      count: PROPERTIES.filter((p) => p.category === 'Residential Plots').length 
    },
    { 
      value: 'Himalayan Villas & Cottages', 
      label: 'Himalayan Villas & Cottages', 
      subLabel: 'Independent Luxury Mountain Villas & Estates', 
      count: PROPERTIES.filter((p) => p.category === 'Himalayan Villas & Cottages').length 
    },
    { 
      value: 'Commercial Properties & Shops', 
      label: 'Commercial Properties & Shops', 
      subLabel: 'Retail Shops, Showrooms & Commercial Spaces', 
      count: PROPERTIES.filter((p) => p.category === 'Commercial Properties & Shops').length 
    },
    { 
      value: 'Hotels, Resorts & Homestays', 
      label: 'Hotels, Resorts & Homestays', 
      subLabel: 'Running Boutique Hotels, Resorts & B&Bs', 
      count: PROPERTIES.filter((p) => p.category === 'Hotels, Resorts & Homestays').length 
    },
    { 
      value: 'Farmhouses & Land', 
      label: 'Farmhouses & Agricultural Land', 
      subLabel: 'Apple Orchards, Farmland & Mountain Estates', 
      count: PROPERTIES.filter((p) => p.category === 'Farmhouses & Land').length 
    },
    { 
      value: 'Studio Apartments & Suites', 
      label: 'Studio Apartments & Suites', 
      subLabel: 'Serviced Holiday Suites & Airbnb Units', 
      count: PROPERTIES.filter((p) => p.category === 'Studio Apartments & Suites').length 
    },
    { 
      value: 'Penthouses & Duplexes', 
      label: 'Penthouses & Duplexes', 
      subLabel: 'Panoramic Snow Peak Sky Penthouses', 
      count: PROPERTIES.filter((p) => p.category === 'Penthouses & Duplexes').length 
    },
    { 
      value: 'Industrial & Institutional Land', 
      label: 'Industrial & Institutional Land', 
      subLabel: 'Highway Warehouses & Yoga Retreat Land', 
      count: PROPERTIES.filter((p) => p.category === 'Industrial & Institutional Land').length 
    },
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const handleLocationSelect = (city: string) => {
    onFilterChange({ ...filters, city });
    setOpenDropdown(null);
  };

  const handleCategorySelect = (category: string) => {
    onFilterChange({ ...filters, category });
    setOpenDropdown(null);
  };

  const isFiltered = filters.city !== 'All Locations' || filters.category !== 'All Types' || filters.searchQuery !== '';

  return (
    <div id="property-search-filter-hub" className="w-full max-w-3xl mx-auto space-y-3 text-left">
      
      {/* 1. SMALL MENU ABOVE: LOCATIONS DROPBOX & PROPERTY TYPE DROPBOX IN THE SAME MENU */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-md border border-sky-200/90 dark:border-slate-700/80 p-2 sm:p-2.5 relative z-30 transition-colors">
        <div className="flex items-center justify-between px-2 pt-1 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Select Location & Property Type</span>
          </div>
          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-200 font-semibold underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-sky-600 dark:text-sky-400" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Dropboxes in the same menu - isolated stacking context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Locations Dropdown: Every Famous Location in Uttarakhand */}
          <div className="relative">
            <CustomDropdown
              label="Location"
              placeholder="Select Your Location"
              value={filters.city}
              options={locationOptions}
              onChange={handleLocationSelect}
              icon={<MapPin className="w-4 h-4" />}
              searchable={true}
              searchPlaceholder="Type city (e.g. Mussoorie, Auli, Lansdowne)..."
              isOpenControlled={openDropdown === 'location'}
              onToggleControlled={(isOpen) => setOpenDropdown(isOpen ? 'location' : null)}
            />
          </div>

          {/* Property Type Dropdown: Every Type of Property */}
          <div className="relative">
            <CustomDropdown
              label="Property Type"
              placeholder="Flats/Plots/Commercial/Etc."
              value={filters.category}
              options={propertyTypeOptions}
              onChange={handleCategorySelect}
              icon={<Building2 className="w-4 h-4" />}
              searchable={true}
              searchPlaceholder="Filter property types (e.g. Villas, Plots)..."
              isOpenControlled={openDropdown === 'category'}
              onToggleControlled={(isOpen) => setOpenDropdown(isOpen ? 'category' : null)}
            />
          </div>
        </div>

        {/* Active Selection Feedback Pills with direct jump */}
        {isFiltered && (
          <div className="mt-2.5 pt-2 border-t border-sky-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Active:</span>
              {filters.city !== 'All Locations' && (
                <span className="inline-flex items-center gap-1 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full text-xs font-semibold border border-sky-200 dark:border-sky-800">
                  <span>📍 {filters.city}</span>
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
                <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-slate-800 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-semibold border border-blue-200 dark:border-slate-700">
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
                className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
              >
                <span>View {totalResults} Properties</span>
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
          className="relative flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-sky-950/5 dark:shadow-black/30 border border-sky-200/90 dark:border-slate-700/80 p-2 sm:p-2.5 transition-all focus-within:ring-3 focus-within:ring-sky-400/30 focus-within:border-sky-500"
        >
          <div className="pl-3 sm:pl-4 pr-2.5 flex items-center pointer-events-none text-sky-600 dark:text-sky-400">
            <Search className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by project name, area, or peak view..."
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 text-sm sm:text-base font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none py-2 sm:py-2.5 pr-3"
          />

          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-sky-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mr-1 sm:mr-2 cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-500/25 transition-all cursor-pointer flex items-center gap-2 active:scale-98"
          >
            <span>Search</span>
          </button>
        </form>
      </div>

    </div>
  );
};
