import React from 'react';
import { Search, X, MapPin, IndianRupee, Home, ArrowUpDown, Mountain, ShieldCheck, RotateCcw } from 'lucide-react';
import { FilterState } from '../types';
import { CITIES, PROPERTIES } from '../data/properties';
import { CustomDropdown, DropdownOption } from './CustomDropdown';

interface SearchBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const isFiltered = 
    filters.region !== 'All' ||
    filters.searchQuery !== '' ||
    filters.category !== 'All Types' ||
    filters.city !== 'All Locations' ||
    filters.budgetRange !== 'all' ||
    filters.bhkConfig !== 'all' ||
    filters.himalayanViewOnly ||
    filters.reraApprovedOnly;

  // City options with count
  const cityOptions: DropdownOption[] = [
    { value: 'All Locations', label: 'All Uttarakhand', subLabel: 'Garhwal & Kumaon', count: PROPERTIES.length },
    ...CITIES.map((city) => ({
      value: city,
      label: city,
      count: PROPERTIES.filter((p) => p.city === city).length,
    })),
  ];

  // Budget options
  const budgetOptions: DropdownOption[] = [
    { value: 'all', label: 'All Budgets', subLabel: 'Any Price Range' },
    { value: 'under-50', label: 'Under ₹50 Lakhs', subLabel: 'Plots & 1 BHK' },
    { value: '50-100', label: '₹50 Lakhs - ₹1 Cr', subLabel: '2 BHK & Plots' },
    { value: '100-200', label: '₹1 Cr - ₹2 Cr', subLabel: 'Luxury 3 BHK & Cottages' },
    { value: 'above-200', label: 'Above ₹2 Cr', subLabel: 'Himalayan Estates & Villas' },
  ];

  // BHK / Config options - clean without unnecessary unit math
  const configOptions: DropdownOption[] = [
    { value: 'all', label: 'All Configurations' },
    { value: 'plot', label: 'Plots & Land Only', subLabel: 'Residential & Villa Plots' },
    { value: '1', label: '1 BHK Flats' },
    { value: '2', label: '2 BHK Flats & Floors' },
    { value: '3', label: '3 BHK Flats & Cottages' },
    { value: '4', label: '4+ BHK Villas & Estates' },
  ];

  // Sort options
  const sortOptions: DropdownOption[] = [
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'area-large', label: 'Area: Largest First' },
    { value: 'area-small', label: 'Area: Smallest First' },
  ];

  const propertyTypes = [
    { label: 'All', value: 'All Types' },
    { label: 'Flats & Apartments', value: 'Flats & Apartments' },
    { label: 'Residential Plots', value: 'Residential Plots' },
    { label: 'Himalayan Villas', value: 'Himalayan Villas & Cottages' },
    { label: 'Farmhouses & Land', value: 'Farmhouses & Land' },
  ];

  // Specific 8 locations requested by the user
  const requestedLocations: { name: string; region: 'Garhwal' | 'Kumaon' }[] = [
    { name: 'Dehradun', region: 'Garhwal' },
    { name: 'Rishikesh', region: 'Garhwal' },
    { name: 'Mukteshwar', region: 'Kumaon' },
    { name: 'Ranikhet', region: 'Kumaon' },
    { name: 'Mussoorie', region: 'Garhwal' },
    { name: 'Nainital', region: 'Kumaon' },
    { name: 'Bhimtal', region: 'Kumaon' },
    { name: 'Almora', region: 'Kumaon' },
  ];

  return (
    <div id="property-search-filter-hub" className="w-full mb-8 space-y-3">
      
      {/* 1. TOP FILTER BARS: REGION, TYPE & UNDER-REGION LOCATIONS */}
      <div className="space-y-2.5">
        
        {/* Main Tab Bars: Region & Type */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* REGION PILL BAR: [All] [Garhwal] [Kumaon] */}
          <div className="bg-[#0c1825]/90 backdrop-blur-md rounded-full shadow-lg border border-white/10 px-3.5 py-1.5 flex items-center gap-1.5 text-xs">
            <span className="font-bold text-[11px] tracking-wider text-slate-400 mr-1 select-none flex items-center gap-1">
              <Mountain className="w-3.5 h-3.5 text-emerald-400" />
              REGION:
            </span>
            {(['All', 'Garhwal', 'Kumaon'] as const).map((r) => {
              const isActive = filters.region === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    let nextCity = filters.city;
                    if (r === 'Garhwal' && !['Dehradun', 'Mussoorie', 'Rishikesh'].includes(filters.city)) {
                      nextCity = 'All Locations';
                    } else if (r === 'Kumaon' && !['Nainital', 'Mukteshwar', 'Bhimtal', 'Ranikhet', 'Almora'].includes(filters.city)) {
                      nextCity = 'All Locations';
                    }
                    onFilterChange({ ...filters, region: r, city: nextCity });
                  }}
                  className={`px-3 py-1 rounded-full font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#00674f] text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {r === 'All' ? 'All Uttarakhand' : r}
                </button>
              );
            })}
          </div>

          {/* TYPE PILL BAR */}
          <div className="bg-[#0c1825]/90 backdrop-blur-md rounded-full shadow-lg border border-white/10 px-3.5 py-1.5 flex items-center gap-1.5 text-xs overflow-x-auto max-w-full scrollbar-none">
            <span className="font-bold text-[11px] tracking-wider text-slate-400 mr-1 select-none flex-shrink-0">
              TYPE:
            </span>
            {propertyTypes.map((t) => {
              const isActive = filters.category === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, category: t.value })}
                  className={`px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer flex-shrink-0 ${
                    isActive
                      ? 'bg-[#e67e22] text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

        </div>

        {/* LOCATIONS UNDER REGION TAB */}
        <div className="bg-[#0c1825]/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 p-3 sm:px-4 sm:py-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Locations in {filters.region === 'All' ? 'Uttarakhand' : filters.region}:</span>
            </div>
            {filters.city !== 'All Locations' && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, city: 'All Locations' })}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1 cursor-pointer w-fit"
              >
                Clear Location ({filters.city})
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* All Locations button */}
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, city: 'All Locations' })}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filters.city === 'All Locations'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              All Locations
            </button>

            {/* Requested 8 Locations */}
            {requestedLocations.map((loc) => {
              const isSelected = filters.city === loc.name;
              const count = PROPERTIES.filter((p) => p.city === loc.name).length;
              const isDimmed = filters.region !== 'All' && loc.region !== filters.region;

              return (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => {
                    const nextCity = isSelected ? 'All Locations' : loc.name;
                    // Auto-align region if a specific region was selected that doesn't match
                    const nextRegion = isSelected
                      ? filters.region
                      : (filters.region !== 'All' && loc.region !== filters.region ? loc.region : filters.region);
                    onFilterChange({ ...filters, city: nextCity, region: nextRegion });
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#00674f] text-white font-bold shadow-md ring-1 ring-emerald-300'
                      : isDimmed
                        ? 'bg-white/[0.02] border border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5'
                        : 'bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
                  title={`${loc.name} (${loc.region} - ${count} properties)`}
                >
                  <span>{loc.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    isSelected ? 'bg-black/25 text-emerald-100' : 'bg-white/10 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 2. GROUNDED SEARCH BAR MATCHING BACKGROUND THEME */}
      <div className="bg-[#0c1825]/90 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/10 text-white">
        
        {/* Main Search Input & Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Keyword Search Input (4 Cols on large) */}
          <div className="lg:col-span-4">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                placeholder="Search project, location, or peak view..."
                className="w-full bg-slate-900/80 hover:bg-slate-900 focus:bg-slate-950 text-white text-xs sm:text-sm font-medium rounded-2xl pl-10 pr-9 py-3 border border-white/10 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-slate-400"
              />
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                  className="absolute right-3 p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Location Dropdown (2 Cols) */}
          <div className="lg:col-span-2">
            <CustomDropdown
              label="Location"
              value={filters.city}
              options={cityOptions}
              onChange={(city) => onFilterChange({ ...filters, city })}
              icon={<MapPin className="w-4 h-4" />}
              searchable={true}
              searchPlaceholder="Type city..."
            />
          </div>

          {/* Budget Dropdown (2 Cols) */}
          <div className="lg:col-span-2">
            <CustomDropdown
              label="Budget"
              value={filters.budgetRange}
              options={budgetOptions}
              onChange={(budgetRange) => onFilterChange({ ...filters, budgetRange })}
              icon={<IndianRupee className="w-4 h-4" />}
            />
          </div>

          {/* Configuration Dropdown (2 Cols) */}
          <div className="lg:col-span-2">
            <CustomDropdown
              label="Config / Type"
              value={filters.bhkConfig}
              options={configOptions}
              onChange={(bhkConfig) => onFilterChange({ ...filters, bhkConfig })}
              icon={<Home className="w-4 h-4" />}
            />
          </div>

          {/* Sort By Dropdown (2 Cols) */}
          <div className="lg:col-span-2">
            <CustomDropdown
              label="Sort By"
              value={filters.sortBy}
              options={sortOptions}
              onChange={(sortBy) => onFilterChange({ ...filters, sortBy: sortBy as any })}
              icon={<ArrowUpDown className="w-4 h-4" />}
            />
          </div>

        </div>

        {/* Bottom Bar: Quick Filter Pills + Active Count (Clean, without unnecessary legal jargon) */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Quick Checkbox Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, himalayanViewOnly: !filters.himalayanViewOnly })}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filters.himalayanViewOnly
                  ? 'bg-teal-500/20 border-teal-400/40 text-teal-300 shadow-sm'
                  : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Mountain className={`w-3.5 h-3.5 ${filters.himalayanViewOnly ? 'text-teal-400' : 'text-slate-400'}`} />
              <span>Himalayan Peak View</span>
            </button>

            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, reraApprovedOnly: !filters.reraApprovedOnly })}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filters.reraApprovedOnly
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-sm'
                  : 'bg-slate-900/60 border-white/10 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${filters.reraApprovedOnly ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>RERA Approved Freehold</span>
            </button>

            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilters}
                className="px-3 py-1.5 rounded-full bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Results Counter */}
          <div className="flex items-center gap-3 text-slate-400 text-xs font-medium">
            <span>
              Showing <strong className="text-white font-bold">{totalResults}</strong> properties in our portfolio
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
