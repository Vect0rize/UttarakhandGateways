import React, { useState, useMemo } from 'react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';
import { Logo } from './Logo';
import { 
  ArrowLeft, 
  Search, 
  RotateCcw, 
  Key, 
  MapPin, 
  ShieldCheck, 
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CITIES } from '../data/properties';

interface RentPageProps {
  properties: Property[];
  onBackToMain: () => void;
  onSelectProperty: (property: Property) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onStartChat: (property: Property) => void;
  onRequestPhoneNumber?: (property: Property) => void;
  getPhoneRequestStatus?: (id: string) => 'none' | 'pending' | 'approved' | 'declined';
  getApprovedPhoneNumber?: (id: string) => string | undefined;
  onDeleteProperty: (id: string) => void;
  onToggleSold: (id: string) => void;
  onEditProperty: (property: Property) => void;
}

const ITEMS_PER_PAGE = 10;

export const RentPage: React.FC<RentPageProps> = ({
  properties,
  onBackToMain,
  onSelectProperty,
  favorites,
  onToggleFavorite,
  onStartChat,
  onRequestPhoneNumber,
  getPhoneRequestStatus,
  getApprovedPhoneNumber,
  onDeleteProperty,
  onToggleSold,
  onEditProperty,
}) => {
  const { isHindi } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [bhkConfig, setBhkConfig] = useState('all');
  const [rentBudget, setRentBudget] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter only rent / lease properties
  const rentProperties = useMemo(() => {
    return properties.filter((p) => {
      const isRent = 
        p.type === 'Rent/Lease' || 
        Boolean(p.isAvailableForRent) || 
        p.purpose === 'rent' ||
        p.pricingUnit === 'monthly_rent' ||
        p.pricingUnit === 'yearly_lease' ||
        (Boolean(p.priceDisplay) && (
          p.priceDisplay.toLowerCase().includes('/ month') ||
          p.priceDisplay.toLowerCase().includes('/month') ||
          p.priceDisplay.toLowerCase().includes('/mo')
        ));
      if (!isRent) return false;

      if (selectedCity !== 'All' && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      if (bhkConfig !== 'all') {
        const bhkNum = parseInt(bhkConfig, 10);
        if (p.bedrooms !== bhkNum) return false;
      }

      if (rentBudget !== 'all') {
        const val = p.price; // monthly rent in rupees
        if (rentBudget === 'under-15k' && val >= 15000) return false;
        if (rentBudget === '15k-30k' && (val < 15000 || val > 30000)) return false;
        if (rentBudget === '30k-60k' && (val < 30000 || val > 60000)) return false;
        if (rentBudget === 'above-60k' && val <= 60000) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = 
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [properties, selectedCity, bhkConfig, rentBudget, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(rentProperties.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const displayed = rentProperties.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCity('All');
    setBhkConfig('all');
    setRentBudget('all');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f2f7f4] dark:bg-[#061811] text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#071f16]/95 backdrop-blur-xl border-b border-emerald-200/80 dark:border-emerald-900/60 py-3.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div onClick={onBackToMain} className="cursor-pointer">
              <Logo size="md" darkText={true} />
            </div>

            <button
              type="button"
              onClick={onBackToMain}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/80 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold text-xs border border-teal-200 dark:border-teal-800 transition-all cursor-pointer shadow-xs active:scale-95"
              title={isHindi ? 'मुख्य पृष्ठ (होम) पर जाएं' : 'Go to Home'}
            >
              <Home className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isHindi ? 'होम (Home)' : 'Home'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>0% Brokerage Rentals</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Banner for Rent Page */}
      <div className="relative py-10 sm:py-14 bg-gradient-to-b from-teal-100/70 via-teal-50/50 to-transparent dark:from-[#06281e] dark:via-[#072018] dark:to-transparent border-b border-teal-200/60 dark:border-teal-950 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <button 
              onClick={onBackToMain}
              className="inline-flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 font-semibold cursor-pointer transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isHindi ? 'होम' : 'Home'}</span>
            </button>
            <span>/</span>
            <span className="font-bold text-teal-700 dark:text-teal-300">{isHindi ? 'किराये पर (Rent)' : 'Rental Properties'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-600 text-white text-xs font-black uppercase tracking-wider shadow-xs">
            <span>🔑 Rentals & Leases • 0% Brokerage</span>
          </div>

          <h1 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-black text-[#07261b] dark:text-white">
            {isHindi ? 'उत्तराखंड में किराये की संपत्तियां' : 'Rental Properties in Uttarakhand'}
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-600 dark:text-teal-200/80 max-w-2xl mx-auto">
            {isHindi 
              ? 'आवासीय फ्लैट, विला, कॉटेज, होमस्टे और दुकानें 0% ब्रोकरेज पर सीधे उपलब्ध हैं।' 
              : 'Browse verified flats, apartments, mountain cottages, and commercial spaces available for rent.'}
          </p>

          {/* Quick Filter Bar */}
          <div className="pt-4 max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder={isHindi ? 'स्थान, प्रोजेक्ट या कीवर्ड खोजें...' : 'Search location, area, title...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* City Dropdown */}
            <select
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="All">{isHindi ? 'सभी शहर (All Locations)' : 'All Locations'}</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Budget Dropdown */}
            <select
              value={rentBudget}
              onChange={(e) => { setRentBudget(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">{isHindi ? 'सभी बजट (All Budgets)' : 'All Budgets'}</option>
              <option value="under-15k">&lt; ₹15,000</option>
              <option value="15k-30k">₹15,000 – ₹30,000</option>
              <option value="30k-60k">₹30,000 – ₹60,000</option>
              <option value="above-60k">&gt; ₹60,000</option>
            </select>

            {/* BHK config */}
            <select
              value={bhkConfig}
              onChange={(e) => { setBhkConfig(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">{isHindi ? 'सभी कमरे (Any BHK)' : 'Any Configuration'}</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Results count header */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-teal-200/80 dark:border-teal-950">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-slate-900 dark:text-white">
              {isHindi ? `किराये हेतु कुल ${rentProperties.length} परिणाम उपलब्ध` : `${rentProperties.length} Rental Properties Available`}
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Page {safePage} of {totalPages}
          </span>
        </div>

        {/* Properties Grid */}
        {displayed.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {displayed.map((property, idx) => (
                <PropertyCard
                  key={property.id}
                  index={idx}
                  property={property}
                  onSelect={onSelectProperty}
                  isFavorite={favorites.includes(property.id)}
                  onToggleFavorite={onToggleFavorite}
                  onStartChat={onStartChat}
                  onDeleteProperty={onDeleteProperty}
                  onToggleSold={onToggleSold}
                  onEditProperty={onEditProperty}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage(safePage - 1)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 inline" /> Previous
                </button>
                <span className="text-xs font-bold px-3">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage(safePage + 1)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40 cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4 inline" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-teal-200 dark:border-slate-800 max-w-lg mx-auto my-8 space-y-4">
            <Key className="w-12 h-12 text-teal-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isHindi ? 'वर्तमान में कोई मेल खाती किराये की प्रॉपर्टी नहीं मिली' : 'No Matching Rental Properties Found'}
            </h3>
            <p className="text-xs text-slate-500">
              {isHindi ? 'कृपया अपने फ़िल्टर रीसेट करें या कोई भिन्न स्थान खोजें।' : 'Try resetting your search filters or selecting a different location.'}
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
            >
              {isHindi ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
            </button>
          </div>
        )}
      </main>

    </div>
  );
};
