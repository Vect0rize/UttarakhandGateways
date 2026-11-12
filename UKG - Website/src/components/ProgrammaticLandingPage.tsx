import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Compass,
  Home,
  Info,
  MapPin,
  Mountain,
  ShieldCheck,
} from 'lucide-react';
import { Property } from '../types';
import {
  getPropertySlugPath,
  ResolvedProgrammaticRoute,
} from '../data/programmaticSeo';
import { REAL_ESTATE_GUIDES } from '../data/guidesData';
import { PropertyCard } from './PropertyCard';

interface ProgrammaticLandingPageProps {
  route: ResolvedProgrammaticRoute;
  onSelectProperty: (property: Property) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onStartChat?: (property: Property) => void;
  onDeleteProperty?: (id: string) => void;
  onToggleSold?: (id: string) => void;
  onEditProperty?: (property: Property) => void;
  onNavigatePath: (path: string) => void;
}

const PAGE_SIZE = 18;

export const ProgrammaticLandingPage: React.FC<ProgrammaticLandingPageProps> = ({
  route,
  onSelectProperty,
  favorites,
  onToggleFavorite,
  onStartChat,
  onDeleteProperty,
  onToggleSold,
  onEditProperty,
  onNavigatePath,
}) => {
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setOpenFaq(0);
  }, [route.canonicalPath]);

  useEffect(() => {
    document.title = route.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', route.description);

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) metaKeywords.setAttribute('content', route.keywords);

    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute('content', route.robotsMeta);

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute(
        'href',
        `https://uttarakhandgateways.com${route.canonicalPath}`
      );
    }

    const scriptId = 'ukg-programmatic-ldjson';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const topItems = route.matchedProperties.slice(0, 12);
    const ldGraph: Record<string, unknown>[] = [
      {
        '@type': 'CollectionPage',
        name: route.h1,
        description: route.description,
        url: `https://uttarakhandgateways.com${route.canonicalPath}`,
        isPartOf: {
          '@type': 'WebSite',
          url: 'https://uttarakhandgateways.com/',
          name: 'Uttarakhand Gateways',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: route.breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.label,
          item: `https://uttarakhandgateways.com${b.path === '/' ? '/' : b.path}`,
        })),
      },
    ];

    if (topItems.length > 0) {
      ldGraph.push({
        '@type': 'ItemList',
        name: route.h1,
        numberOfItems: route.activeCount,
        itemListElement: topItems.map((prop, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: prop.title,
          url: `https://uttarakhandgateways.com${getPropertySlugPath(prop)}`,
        })),
      });
    }

    if (route.faqs.length > 0) {
      ldGraph.push({
        '@type': 'FAQPage',
        mainEntity: route.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      });
    }

    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': ldGraph,
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [route]);

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigatePath(path);
  };

  const displayedProperties = route.matchedProperties.slice(0, visibleCount);
  const relatedGuides = route.relatedGuideSlugs
    .map((slug) => REAL_ESTATE_GUIDES.find((g) => g.slug === slug))
    .filter(Boolean);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-emerald-200/75"
      >
        {route.breadcrumbs.map((crumb, idx) => {
          const isLast = idx === route.breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.path}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              {isLast ? (
                <span className="font-bold text-slate-900 dark:text-white">
                  {crumb.label}
                </span>
              ) : (
                <a
                  href={crumb.path}
                  onClick={(e) => handleLinkClick(e, crumb.path)}
                  className="inline-flex items-center gap-1 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
                >
                  {idx === 0 && <Home className="w-3.5 h-3.5" />}
                  {crumb.label}
                </a>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Hero Header Card */}
      <section className="rounded-3xl bg-gradient-to-br from-[#062419] via-[#0a3022] to-[#0e3f2d] text-white p-6 sm:p-10 shadow-2xl border border-emerald-500/20">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-200 text-xs font-extrabold tracking-wide">
            <MapPin className="w-3.5 h-3.5" /> {route.location.district} • {route.location.region}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-bold">
            <Mountain className="w-3.5 h-3.5" /> Elevation: {route.location.elevation}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
          {route.h1}
        </h1>
        <p className="text-emerald-100/85 text-sm sm:text-base max-w-4xl leading-relaxed mb-6">
          {route.introParagraph}
        </p>

        {/* Live Database Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="rounded-2xl bg-black/25 border border-white/10 p-3.5">
            <div className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-bold">
              Active Listings
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white mt-0.5 tabular-nums">
              {route.activeCount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="rounded-2xl bg-black/25 border border-white/10 p-3.5">
            <div className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-bold">
              Active Price Range
            </div>
            <div className="text-sm sm:text-base font-extrabold text-emerald-200 mt-1">
              {route.priceRangeDisplay}
            </div>
          </div>
          <div className="rounded-2xl bg-black/25 border border-white/10 p-3.5">
            <div className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-bold">
              For Sale / Rent
            </div>
            <div className="text-sm sm:text-base font-extrabold text-white mt-1 tabular-nums">
              {route.saleCount} Sale • {route.rentCount} Rent
            </div>
          </div>
          <div className="rounded-2xl bg-black/25 border border-white/10 p-3.5">
            <div className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-bold">
              Portal Brokerage
            </div>
            <div className="text-sm sm:text-base font-extrabold text-emerald-300 mt-1">
              0% Commission
            </div>
          </div>
        </div>
      </section>

      {/* Related Categories in Same Location */}
      {route.relatedCategoryLinks.length > 0 && (
        <section aria-label="Property categories">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-emerald-300/80">
              Browse Categories in {route.location.name}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {route.relatedCategoryLinks.map((cat) => (
              <a
                key={cat.path}
                href={cat.path}
                onClick={(e) => handleLinkClick(e, cat.path)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#10231a] border border-emerald-900/15 dark:border-emerald-700/35 text-xs font-bold text-slate-800 dark:text-emerald-100 hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300 shadow-sm transition"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                {cat.label}
                {typeof cat.count === 'number' && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold tabular-nums">
                    {cat.count}
                  </span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Property Grid */}
      <section aria-label="Available property listings">
        {route.matchedProperties.length > 0 ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Showing {displayedProperties.length} of{' '}
                <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {route.matchedProperties.length}
                </span>{' '}
                Listings
              </h2>
              <a
                href="/list"
                onClick={(e) => handleLinkClick(e, '/list')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
              >
                Post Your Property in {route.location.name} <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedProperties.map((prop, idx) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  index={idx}
                  onSelect={onSelectProperty}
                  isFavorite={favorites.includes(prop.id)}
                  onToggleFavorite={onToggleFavorite}
                  onStartChat={onStartChat}
                  onDeleteProperty={onDeleteProperty}
                  onToggleSold={onToggleSold}
                  onEditProperty={onEditProperty}
                />
              ))}
            </div>

            {visibleCount < route.matchedProperties.length && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
                >
                  Load More Listings ({route.matchedProperties.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-6 sm:p-8 space-y-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
                  No exact active listings currently matched for this filter
                </h2>
                <p className="text-sm text-slate-600 dark:text-emerald-100/80">
                  We never publish synthetic or fake listings. Explore all active properties in {route.location.name} or browse similar Uttarakhand listings below.
                </p>
              </div>
            </div>
            {route.fallbackProperties.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {route.fallbackProperties.map((prop, idx) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    index={idx}
                    onSelect={onSelectProperty}
                    isFavorite={favorites.includes(prop.id)}
                    onToggleFavorite={onToggleFavorite}
                    onStartChat={onStartChat}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Local Market Insight & Buyer Due Diligence */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#10231a] border border-emerald-900/15 dark:border-emerald-700/30 p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {route.location.name} Real Estate & Buyer Checklist
          </h2>
          <p className="text-sm text-slate-600 dark:text-emerald-100/80 leading-relaxed">
            {route.secondaryInsight}
          </p>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
              Key Localities & Corridors
            </h3>
            <div className="flex flex-wrap gap-2">
              {route.location.popularLocalities.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/50 text-xs font-semibold text-emerald-900 dark:text-emerald-200"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-emerald-300/80">
              Location-Specific Verification Steps
            </h3>
            {route.location.buyerChecklist.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-emerald-100/85">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-emerald-950/40 border border-slate-200 dark:border-emerald-800/40 p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-emerald-100/75 leading-relaxed">
              <strong>Independent Verification Notice:</strong> All listings on Uttarakhand Gateways are submitted directly by sellers or local brokers. Buyers should always verify registered sale deeds, Bhulekh Uttarakhand Khatauni records, RERA details, and Section 154 land limits independently before payment.
            </p>
          </div>
        </div>

        {/* Nearby Markets & Guides Sidebar */}
        <aside className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-[#10231a] border border-emerald-900/15 dark:border-emerald-700/30 p-6 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <Compass className="w-4 h-4 text-emerald-600" /> Nearby Uttarakhand Markets
            </h3>
            <div className="space-y-2">
              {route.relatedLocationLinks.map((loc) => (
                <a
                  key={loc.path}
                  href={loc.path}
                  onClick={(e) => handleLinkClick(e, loc.path)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-emerald-950/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-xs font-bold text-slate-800 dark:text-emerald-100 transition"
                >
                  <span>{loc.label}</span>
                  {typeof loc.count === 'number' && (
                    <span className="text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {loc.count} →
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {relatedGuides.length > 0 && (
            <div className="rounded-3xl bg-white dark:bg-[#10231a] border border-emerald-900/15 dark:border-emerald-700/30 p-6 shadow-sm space-y-3">
              <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                <BookOpen className="w-4 h-4 text-emerald-600" /> Helpful Buyer Guides
              </h3>
              <div className="space-y-2">
                {relatedGuides.map((g) => (
                  <a
                    key={g!.slug}
                    href={`/guides/${g!.slug}`}
                    onClick={(e) => handleLinkClick(e, `/guides/${g!.slug}`)}
                    className="block p-3 rounded-xl bg-slate-50 dark:bg-emerald-950/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 transition"
                  >
                    <div className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-400 mb-0.5">
                      {g!.category}
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-emerald-100 leading-snug">
                      {g!.titleEn}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>

      {/* FAQs */}
      {route.faqs.length > 0 && (
        <section className="rounded-3xl bg-white dark:bg-[#10231a] border border-emerald-900/15 dark:border-emerald-700/30 p-6 sm:p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-5">
            Frequently Asked Questions — {route.h1}
          </h2>
          <div className="space-y-3">
            {route.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-emerald-800/40 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-emerald-950/30 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-sm text-slate-600 dark:text-emerald-100/80 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
