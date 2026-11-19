import React, { useState, useMemo, useEffect } from 'react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';
import { Logo } from './Logo';
import { CITY_MARKET_DATA, CityMarketData, getCityMarketData } from '../data/citySeoData';
import { getCitySlug, slugify } from '../data/programmaticSeo';
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Home,
  TrendingUp,
  Sparkles,
  Plane,
  Train,
  Scale
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SeoKeywordsSection } from './SeoKeywordsSection';
import type { AppPageRouteKey } from '../data/seoMetadata';
import {
  scrollToPropertyListingsStart,
  readPageParamFromUrl,
  syncListingsUrlParams,
} from '../utils/scrollToListings';

const ITEMS_PER_PAGE = 12;

interface CityPropertyLandingPageProps {
  cityName: string;
  properties: Property[];
  onBackToMain: () => void;
  onSelectProperty: (property: Property) => void;
  onNavigateCity?: (cityName: string) => void;
  onNavigatePage?: (page: string) => void;
  onNavigatePath?: (path: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onStartChat: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  onToggleSold: (id: string) => void;
  onEditProperty: (property: Property) => void;
}

export const CityPropertyLandingPage: React.FC<CityPropertyLandingPageProps> = ({
  cityName,
  properties,
  onBackToMain,
  onSelectProperty,
  onNavigateCity,
  onNavigatePage,
  onNavigatePath,
  favorites,
  onToggleFavorite,
  onStartChat,
  onDeleteProperty,
  onToggleSold,
  onEditProperty,
}) => {
  const { isHindi } = useLanguage();
  const [filterMode, setFilterMode] = useState<'all' | 'sale' | 'rent' | 'plot' | 'flat'>(() => {
    try {
      const m = new URLSearchParams(window.location.search).get('filter');
      if (m === 'sale' || m === 'rent' || m === 'plot' || m === 'flat') return m;
    } catch {}
    return 'all';
  });
  const [currentPage, setCurrentPage] = useState<number>(() => readPageParamFromUrl());
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Normalize city name
  const marketData: CityMarketData = useMemo(() => {
    return getCityMarketData(cityName, properties) || CITY_MARKET_DATA['Dehradun'];
  }, [cityName, properties]);

  // Filter actual genuine listings from database for this city
  const cityProperties = useMemo(() => {
    if (!Array.isArray(properties)) return [];
    const targetSlug = slugify(marketData.city);
    const targetLower = marketData.city.toLowerCase();
    return properties.filter((p) => {
      if (!p || p.isSold) return false;
      if (targetSlug === 'uttarakhand') return true;
      const pCitySlug = slugify(p.city || '');
      const pLoc = (p.location || '').toLowerCase();
      return pCitySlug === targetSlug || pLoc.includes(targetLower);
    });
  }, [properties, marketData.city]);

  // Sub-filter by mode
  const filteredListings = useMemo(() => {
    return cityProperties.filter((p) => {
      const isRent = p.type === 'Rent/Lease' || p.purpose === 'rent' || Boolean(p.isAvailableForRent);
      if (filterMode === 'sale') return !isRent;
      if (filterMode === 'rent') return isRent;
      if (filterMode === 'plot') {
        const cat = (p.category || '').toLowerCase();
        const typ = (p.type || '').toLowerCase();
        return cat.includes('land') || cat.includes('plot') || typ.includes('land') || typ.includes('plot');
      }
      if (filterMode === 'flat') {
        const typ = (p.type || '').toLowerCase();
        return typ.includes('flat') || typ.includes('apartment') || typ.includes('studio');
      }
      return true;
    });
  }, [cityProperties, filterMode]);

  // Dynamic SEO metadata injection for this city hub
  useEffect(() => {
    document.title = marketData.metaTitle;

    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) {
      descTag = document.createElement('meta');
      descTag.setAttribute('name', 'description');
      document.head.appendChild(descTag);
    }
    descTag.setAttribute('content', marketData.metaDescription);

    const canonicalSlug = getCitySlug(marketData.city);
    const canonicalUrl = `https://uttarakhandgateways.com/properties-in-${canonicalSlug}`;

    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      metaRobots.setAttribute(
        'content',
        cityProperties.length >= 2 ? 'index, follow, max-image-preview:large' : 'noindex, follow'
      );
    }

    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    const schemaId = `schema-city-${canonicalSlug}`;
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const citySchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://uttarakhandgateways.com/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Uttarakhand Properties', 'item': 'https://uttarakhandgateways.com/properties-in-uttarakhand' },
            { '@type': 'ListItem', 'position': 3, 'name': `Properties in ${marketData.city}`, 'item': `https://uttarakhandgateways.com/properties-in-${getCitySlug(marketData.city)}` }
          ]
        },
        {
          '@type': 'FAQPage',
          'mainEntity': marketData.faqs.map(f => ({
            '@type': 'Question',
            'name': f.q,
            'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
          }))
        }
      ]
    };
    scriptTag.textContent = JSON.stringify(citySchema);

    window.scrollTo({ top: 0, behavior: 'instant' });

    return () => {
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [marketData]);

  const otherCities = Object.keys(CITY_MARKET_DATA).filter((c) => c !== marketData.city);

  return (
    <div className="min-h-screen bg-[#f4f9f6] dark:bg-[#061811] text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-600 selection:text-white transition-colors">
      
      {/* 1. TOP HEADER & BREADCRUMB */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#071f17]/95 backdrop-blur-md border-b border-emerald-200 dark:border-emerald-800/80 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMain}
              className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{isHindi ? 'मुख्य पृष्ठ' : 'Home'}</span>
            </button>
            <div className="h-5 w-px bg-emerald-300 dark:bg-emerald-800" />
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <a href="/" onClick={(e) => { e.preventDefault(); onBackToMain(); }} className="hover:underline flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-emerald-600" />
                <span>Home</span>
              </a>
              <span>&gt;</span>
              <span className="font-semibold text-slate-800 dark:text-white">Properties in {marketData.city}</span>
            </div>
          </div>

          <Logo size="sm" showTagline={false} darkText={true} />
        </div>
      </header>

      {/* 2. AUTHORITATIVE CITY HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-[#07281d] to-[#041a12] text-white pt-10 pb-12 px-4 sm:px-6 border-b border-emerald-700/60 shadow-lg">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold tracking-wide">
              <MapPin className="w-3.5 h-3.5" />
              <span>{marketData.city}, Uttarakhand ({marketData.elevation})</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-sm uppercase tracking-wider">0% BROKERAGE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif-luxury tracking-tight leading-tight">
              {marketData.h1}
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 max-w-3xl leading-relaxed">
              {marketData.tagline}
            </p>
          </div>

          {/* Key Market Intelligence Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-[11px] text-emerald-300 uppercase tracking-wider font-bold block">Verified Listings</span>
              <span className="text-xl sm:text-2xl font-black text-white">{cityProperties.length} Properties</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-[11px] text-emerald-300 uppercase tracking-wider font-bold block">Budget Range</span>
              <span className="text-base sm:text-lg font-black text-white">{marketData.priceRange}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-[11px] text-emerald-300 uppercase tracking-wider font-bold block">Land Rates</span>
              <span className="text-xs sm:text-sm font-bold text-white">{marketData.landPriceRange}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
              <span className="text-[11px] text-emerald-300 uppercase tracking-wider font-bold block">Flat Rates</span>
              <span className="text-xs sm:text-sm font-bold text-white">{marketData.avgFlatRate}</span>
            </div>
          </div>

          {/* Popular Micro-Markets Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-emerald-300 font-bold">Top Localities:</span>
            {marketData.popularLocalities.map((loc) => (
              <span key={loc} className="px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-600/40 text-white font-medium">
                {loc}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. INVENTORY FILTER TABS */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-8 pb-4">
        <div id="city-listings-start" className="scroll-mt-24 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200 dark:border-emerald-800 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#0E3A2B] dark:text-[#F4F3EF] font-serif-luxury flex items-center flex-wrap gap-2">
              <span>Available Properties in {marketData.city}</span>
              <span className="font-sans tabular-nums text-xs sm:text-sm font-extrabold px-2.5 py-0.5 rounded-full bg-[#0E3A2B] text-[#F4F3EF] dark:bg-[#C2A691] dark:text-[#032D1F]">
                {filteredListings.length.toLocaleString('en-IN')}
              </span>
            </h2>
          </div>

          {/* Quick Segmented Control */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex-wrap">
            <button
              onClick={() => { setFilterMode('all'); setCurrentPage(1); syncListingsUrlParams({ filter: null, page: null }); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterMode === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 dark:text-emerald-200 hover:text-emerald-800'}`}
            >
              All ({cityProperties.length})
            </button>
            <button
              onClick={() => { setFilterMode('sale'); setCurrentPage(1); syncListingsUrlParams({ filter: 'sale', page: null }); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterMode === 'sale' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 dark:text-emerald-200 hover:text-emerald-800'}`}
            >
              Buy Outright
            </button>
            <button
              onClick={() => { setFilterMode('rent'); setCurrentPage(1); syncListingsUrlParams({ filter: 'rent', page: null }); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterMode === 'rent' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 dark:text-emerald-200 hover:text-emerald-800'}`}
            >
              Rent / Lease
            </button>
            <button
              onClick={() => { setFilterMode('plot'); setCurrentPage(1); syncListingsUrlParams({ filter: 'plot', page: null }); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterMode === 'plot' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 dark:text-emerald-200 hover:text-emerald-800'}`}
            >
              Plots / Land
            </button>
            <button
              onClick={() => { setFilterMode('flat'); setCurrentPage(1); syncListingsUrlParams({ filter: 'flat', page: null }); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${filterMode === 'flat' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 dark:text-emerald-200 hover:text-emerald-800'}`}
            >
              Flats / Apts
            </button>
          </div>
        </div>

        {/* Real Properties Grid */}
        {(() => {
          const totalPages = Math.max(1, Math.ceil(filteredListings.length / ITEMS_PER_PAGE));
          const safePage = Math.min(currentPage, totalPages);
          const displayedCityProps = filteredListings.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
          const handleCityPageChange = (nextPage: number) => {
            if (nextPage >= 1 && nextPage <= totalPages) {
              setCurrentPage(nextPage);
              syncListingsUrlParams({ page: nextPage > 1 ? nextPage : null });
              scrollToPropertyListingsStart('city-listings-start');
            }
          };

          return filteredListings.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                {displayedCityProps.map((property, idx) => (
                  <PropertyCard
                    key={property.id}
                    index={idx}
                    property={property}
                    onSelect={(p) => onSelectProperty(p)}
                    isFavorite={favorites.includes(property.id)}
                    onToggleFavorite={onToggleFavorite}
                    onStartChat={onStartChat}
                    onDeleteProperty={onDeleteProperty}
                    onToggleSold={onToggleSold}
                    onEditProperty={onEditProperty}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Page {safePage} of {totalPages} ({filteredListings.length} properties)
                  </div>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => handleCityPageChange(safePage - 1)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer hover:bg-emerald-50 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>{isHindi ? 'पिछला' : 'Previous'}</span>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handleCityPageChange(pageNum)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          safePage === pageNum
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-emerald-200 dark:border-slate-700 hover:bg-emerald-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => handleCityPageChange(safePage + 1)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer hover:bg-emerald-50 flex items-center gap-1"
                    >
                      <span>{isHindi ? 'अगला' : 'Next'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#071f17] border border-emerald-200 dark:border-emerald-800 my-8 space-y-3">
              <Building2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold">No properties match this specific category filter in {marketData.city}.</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">Try resetting the category filter above to browse listings in {marketData.city}.</p>
              <button
                onClick={() => { setFilterMode('all'); setCurrentPage(1); syncListingsUrlParams({ filter: null, page: null }); }}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
              >
                Reset Category Filter
              </button>
            </div>
          );
        })()}
      </section>

      {/* 4. LOCAL MARKET INSIGHTS & LEGAL OVERVIEW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 my-12 space-y-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#071f17] border border-emerald-200 dark:border-emerald-800/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Real Estate Market Overview: {marketData.city}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-serif-luxury text-slate-900 dark:text-white">
            Investing in {marketData.city} Real Estate with 0% Brokerage
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {marketData.description}
          </p>

          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
            <strong>Legal Land Title Note:</strong> {marketData.legalNotes}
          </div>
        </div>

        {/* Local City FAQs */}
        <div className="space-y-4">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold font-serif-luxury text-slate-900 dark:text-white">
              Frequently Asked Questions About Properties in {marketData.city}
            </h3>
          </div>

          <div className="space-y-3">
            {marketData.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="rounded-2xl bg-white dark:bg-[#071f17] border border-emerald-200 dark:border-emerald-800 overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 cursor-pointer"
                  >
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{faq.q}</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-emerald-100 dark:border-emerald-900/50 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Programmatic Category Links in Current City */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#071f17] border border-emerald-200 dark:border-emerald-800 space-y-3">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
            Explore Categories in {marketData.city}
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: `Buy Property in ${marketData.city}`, path: `/buy-property-in-${getCitySlug(marketData.city)}` },
              { label: `Rental Properties in ${marketData.city}`, path: `/rental-properties-in-${getCitySlug(marketData.city)}` },
              { label: `Flats for Sale in ${marketData.city}`, path: `/flats-for-sale-in-${getCitySlug(marketData.city)}` },
              { label: `Plots for Sale in ${marketData.city}`, path: `/plots-for-sale-in-${getCitySlug(marketData.city)}` },
              { label: `Land for Sale in ${marketData.city}`, path: `/land-for-sale-in-${getCitySlug(marketData.city)}` },
              { label: `Houses for Sale in ${marketData.city}`, path: `/houses-for-sale-in-${getCitySlug(marketData.city)}` },
              { label: `Villas in ${marketData.city}`, path: `/villas-for-sale-in-${getCitySlug(marketData.city)}` },
              { label: `Cottages in ${marketData.city}`, path: `/cottages-for-sale-in-${getCitySlug(marketData.city)}` },
            ].map((cat) => (
              <a
                key={cat.path}
                href={cat.path}
                onClick={(e) => {
                  if (onNavigatePath) {
                    e.preventDefault();
                    onNavigatePath(cat.path);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-200 hover:bg-emerald-600 hover:text-white transition-colors"
              >
                {cat.label}
              </a>
            ))}
          </div>
        </div>

        {/* Explore Other Uttarakhand Mountain Cities */}
        <div className="p-6 rounded-3xl bg-emerald-100/50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
            Explore More Uttarakhand Mountain Destinations
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {otherCities.map((c) => (
              <a
                key={c}
                href={`/properties-in-${getCitySlug(c)}`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigateCity) onNavigateCity(c);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#071f17] border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-slate-800 dark:text-white hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-colors shadow-xs"
              >
                Properties in {c}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SEO Keywords & FOOTER */}
      <SeoKeywordsSection
        onNavigatePage={onNavigatePage ? (p: AppPageRouteKey) => onNavigatePage(p) : undefined}
        onNavigateCity={onNavigateCity}
        onNavigatePath={onNavigatePath}
      />
      <footer className="py-6 border-t border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#071f17] text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Uttarakhand Gateways. 0% Brokerage Mountain Real Estate Marketplace.</p>
      </footer>
    </div>
  );
};
