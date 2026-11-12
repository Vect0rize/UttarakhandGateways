import React from 'react';
import { Search, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { AppPageRouteKey } from '../data/seoMetadata';

interface SeoKeywordLink {
  label: string;
  href: string;
  page?: AppPageRouteKey;
  city?: string;
}

const POPULAR_SEO_LINKS: SeoKeywordLink[] = [
  { label: 'Properties in Uttarakhand', href: '/properties-in-uttarakhand' },
  { label: 'Buy Property in Uttarakhand', href: '/buy-property-in-uttarakhand' },
  { label: 'Flats for Sale in Dehradun', href: '/flats-for-sale-in-dehradun' },
  { label: 'Plots for Sale in Rishikesh', href: '/plots-for-sale-in-rishikesh' },
  { label: 'Land for Sale in Uttarakhand', href: '/land-for-sale-in-uttarakhand' },
  { label: 'Houses for Sale in Uttarakhand', href: '/houses-for-sale-in-uttarakhand' },
  { label: 'Commercial Property in Uttarakhand', href: '/commercial-property-in-uttarakhand' },
  { label: 'Rental Properties in Dehradun', href: '/rental-properties-in-dehradun' },
  { label: 'Agricultural Land in Uttarakhand', href: '/agricultural-land-in-uttarakhand' },
  { label: 'Property Dealers in Uttarakhand', href: '/property-dealers-in-uttarakhand' },
  { label: 'Properties in Dehradun', href: '/properties-in-dehradun', city: 'Dehradun' },
  { label: 'Properties in Rishikesh', href: '/properties-in-rishikesh', city: 'Rishikesh' },
  { label: 'Properties in Haridwar', href: '/properties-in-haridwar', city: 'Haridwar' },
  { label: 'Properties in Nainital', href: '/properties-in-nainital', city: 'Nainital' },
  { label: 'Properties in Mussoorie', href: '/properties-in-mussoorie', city: 'Mussoorie' },
  { label: 'Properties in Haldwani', href: '/properties-in-haldwani', city: 'Haldwani' },
  { label: 'Properties in Tehri Garhwal', href: '/properties-in-tehri-garhwal', city: 'Tehri Garhwal' },
  { label: 'Sell Property in Uttarakhand', href: '/list/buy', page: 'sell-gui' },
  { label: 'Rent Property in Uttarakhand', href: '/list/rent', page: 'rent-gui' },
  { label: 'Uttarakhand Property Guides', href: '/guides', page: 'guides' },
  { label: 'About Uttarakhand Gateways', href: '/about' },
];

interface SeoKeywordsSectionProps {
  onNavigatePage?: (page: AppPageRouteKey) => void;
  onNavigateCity?: (city: string) => void;
  onNavigatePath?: (path: string) => void;
  compact?: boolean;
}

export const SeoKeywordsSection: React.FC<SeoKeywordsSectionProps> = ({
  onNavigatePage,
  onNavigateCity,
  onNavigatePath,
  compact = false,
}) => {
  const { isHindi } = useLanguage();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, item: SeoKeywordLink) => {
    if (e.ctrlKey || e.metaKey || e.button !== 0) return;
    if (onNavigatePath && !item.page && !item.city) {
      e.preventDefault();
      onNavigatePath(item.href);
      return;
    }
    if (item.city && onNavigateCity) {
      e.preventDefault();
      onNavigateCity(item.city);
      return;
    }
    if (item.page && onNavigatePage) {
      e.preventDefault();
      onNavigatePage(item.page);
    }
  };

  return (
    <section
      aria-label="Popular Real Estate Searches in Uttarakhand"
      className={`border-t border-emerald-200/70 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-[#05150f] transition-colors ${
        compact ? 'py-5 px-4' : 'py-7 px-4 sm:px-6 lg:px-8'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span>
            {isHindi
              ? 'उत्तराखंड में लोकप्रिय प्रॉपर्टी खोजें (UKG Properties)'
              : 'Popular Uttarakhand Real Estate Searches • UKG Properties'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {POPULAR_SEO_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-[#092319] hover:bg-emerald-100 dark:hover:bg-emerald-900/70 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-semibold text-slate-700 dark:text-emerald-100 transition-colors shadow-2xs"
            >
              {item.city && <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />}
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {isHindi
            ? 'उत्तराखंड गेटवेज (UKG Properties) पर देहरादून, ऋषिकेश, हरिद्वार, नैनीताल, मसूरी और हल्द्वानी में 0% ब्रोकरेज के साथ प्रॉपर्टी खरीदें, बेचें या किराये पर लें।'
            : 'Buy, purchase, sell, or rent properties in Uttarakhand directly with 0% brokerage — featuring plots, houses, flats, cottages, villas, commercial spaces, and PG in Uttarakhand across Dehradun, Rishikesh, Haridwar, Nainital, Mussoorie & Haldwani.'}
        </p>
      </div>
    </section>
  );
};
