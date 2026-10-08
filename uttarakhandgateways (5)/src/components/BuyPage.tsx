import React, { useState, useMemo } from 'react';
import { Property, FilterState } from '../types';
import { PropertyCard } from './PropertyCard';
import { Logo } from './Logo';
import { 
  ArrowLeft, 
  Search, 
  RotateCcw, 
  Building2, 
  MapPin, 
  PlusCircle, 
  ShieldCheck, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CITIES } from '../data/properties';

interface BuyPageProps {
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

export const BuyPage: React.FC<BuyPageProps> = ({
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
  const [selectedType, setSelectedType] = useState('All');
  const [budgetRange, setBudgetRange] = useState('all');
  const [himalayanViewOnly, setHimalayanViewOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter only for-sale properties
  const forSaleProperties = useMemo(() => {
    return properties.filter((p) => {
      // Strictly exclude rental properties
      const isRental = p.type === 'Rent/Lease' || 
        Boolean(p.isAvailableForRent) || 
        p.purpose === 'rent' ||
        p.pricingUnit === 'monthly_rent' || 
        p.pricingUnit === 'yearly_lease' || 
        (Boolean(p.priceDisplay) && (p.priceDisplay.toLowerCase().includes('/ month') || p.priceDisplay.toLowerCase().includes('/month') || p.priceDisplay.toLowerCase().includes('/mo')));
      if (isRental) {
        return false;
      }

      if (selectedCity !== 'All' && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      if (selectedType !== 'All') {
        const t = selectedType.toLowerCase();
        const pt = (p.type || '').toLowerCase();
        if (!pt.includes(t) && !p.title.toLowerCase().includes(t)) {
          return false;
        }
      }

      if (budgetRange !== 'all') {
        const l = p.price / 100000;
        if (budgetRange === 'under-25l' && l >= 25) return false;
        if (budgetRange === '25l-50l' && (l < 25 || l > 50)) return false;
        if (budgetRange === '50l-1cr' && (l < 50 || l > 100)) return false;
        if (budgetRange === '1cr-2.5cr' && (l < 100 || l > 250)) return false;
        if (budgetRange === 'above-2.5cr' && l <= 250) return false;
      }

      if (himalayanViewOnly && !p.himalayanPeakView) {
        return false;
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
  }, [properties, selectedCity, selectedType, budgetRange, himalayanViewOnly, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(forSaleProperties.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const displayed = forSaleProperties.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCity('All');
    setSelectedType('All');
    setBudgetRange('all');
    setHimalayanViewOnly(false);
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold text-xs border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer shadow-xs active:scale-95"
              title={isHindi ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Return to Home'}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? 'वापस (Return)' : 'Return'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>0% Brokerage Properties for Sale</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Banner for Buy Page */}
      <div className="relative py-10 sm:py-14 bg-gradient-to-b from-emerald-100/70 via-emerald-50/50 to-transparent dark:from-[#092b1e] dark:via-[#072218] dark:to-transparent border-b border-emerald-200/60 dark:border-emerald-950 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <button 
              onClick={onBackToMain}
              className="inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? 'वापस (Return)' : 'Return'}</span>
            </button>
            <span>/</span>
            <span className="font-bold text-emerald-800 dark:text-emerald-300">{isHindi ? 'खरीदें (Buy)' : 'Buy Properties'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs">
            <span>🏷️ 100% Outright Sale • 0% Brokerage</span>
          </div>

          <h1 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-black text-[#0a271c] dark:text-white">
            {isHindi ? 'उत्तराखंड में बिक्री हेतु संपत्तियां' : 'Properties For Sale in Uttarakhand'}
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-200/80 max-w-2xl mx-auto">
            {isHindi 
              ? 'आवासीय प्लॉट, विला, कॉटेज, फ्लैट और फार्महाउस सीधे मालिकों व सत्यापित बिल्डरों से खरीदें।' 
              : 'Explore verified residential plots, hill cottages, luxury villas, and apartments for outright purchase.'}
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
                placeholder={isHindi ? 'स्थान, प्रोजेक्ट या कीवर्ड खोजें...' : 'Search location, project, title...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* City Dropdown */}
            <select
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="All">{isHindi ? 'सभी शहर (All Cities)' : 'All Locations'}</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Budget Range */}
            <select
              value={budgetRange}
              onChange={(e) => { setBudgetRange(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">{isHindi ? 'सभी बजट (All Budgets)' : 'All Budgets'}</option>
              <option value="under-25l">&lt; ₹25 Lakh</option>
              <option value="25l-50l">₹25L – ₹50 Lakh</option>
              <option value="50l-1cr">₹50L – ₹1 Crore</option>
              <option value="1cr-2.5cr">₹1Cr – ₹2.5 Crore</option>
              <option value="above-2.5cr">&gt; ₹2.5 Crore</option>
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
        <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-emerald-200/80 dark:border-emerald-950">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-slate-900 dark:text-white">
              {isHindi ? `बिक्री हेतु कुल ${forSaleProperties.length} परिणाम उपलब्ध` : `${forSaleProperties.length} Properties Available For Sale`}
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
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-slate-800 max-w-lg mx-auto my-8 space-y-3">
            <Building2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isHindi ? 'कोई प्रॉपर्टी नहीं मिली' : 'No For-Sale Properties Match Your Filters'}
            </h3>
            <p className="text-xs text-slate-500">
              {isHindi ? 'कृपया अपने फिल्टर बदलें या नया सर्च करें।' : 'Try resetting your search filters.'}
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2 rounded-full bg-emerald-600 text-white font-bold text-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

    </div>
  );
};
