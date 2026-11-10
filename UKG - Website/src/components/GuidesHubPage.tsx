import React, { useState, useEffect } from 'react';
import { REAL_ESTATE_GUIDES, RealEstateGuide } from '../data/guidesData';
import { Logo } from './Logo';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Share2, 
  ChevronRight, 
  CheckCircle2, 
  Scale, 
  Building2, 
  MapPin, 
  Home, 
  ArrowRight,
  Sparkles,
  Calculator
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface GuidesHubPageProps {
  onBackToMain: () => void;
  onNavigatePage?: (page: string) => void;
  onOpenUnitConverter?: () => void;
  initialGuideSlug?: string;
}

export const GuidesHubPage: React.FC<GuidesHubPageProps> = ({
  onBackToMain,
  onNavigatePage,
  onOpenUnitConverter,
  initialGuideSlug,
}) => {
  const { isHindi } = useLanguage();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(initialGuideSlug || null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const selectedGuide: RealEstateGuide | undefined = REAL_ESTATE_GUIDES.find(
    (g) => g.slug === selectedSlug
  );

  const categories = ['All', 'Legal & Registry', 'State Land Laws', 'Land Measurements', 'Investment Strategy', 'Rental Living'];

  const filteredGuides = activeCategory === 'All' 
    ? REAL_ESTATE_GUIDES 
    : REAL_ESTATE_GUIDES.filter(g => g.category === activeCategory);

  useEffect(() => {
    if (selectedGuide) {
      document.title = `${selectedGuide.titleEn} | Uttarakhand Gateways Legal Guides`;

      let descTag = document.querySelector('meta[name="description"]');
      if (!descTag) {
        descTag = document.createElement('meta');
        descTag.setAttribute('name', 'description');
        document.head.appendChild(descTag);
      }
      descTag.setAttribute('content', selectedGuide.metaDescription);

      let canonicalTag = document.querySelector('link[rel="canonical"]');
      if (!canonicalTag) {
        canonicalTag = document.createElement('link');
        canonicalTag.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.setAttribute('href', `https://uttarakhandgateways.com/guides/${selectedGuide.slug}`);

      // Article Schema
      const schemaId = `schema-guide-${selectedGuide.slug}`;
      let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = schemaId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }

      scriptTag.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            'itemListElement': [
              { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://uttarakhandgateways.com/' },
              { '@type': 'ListItem', 'position': 2, 'name': 'Uttarakhand Property Guides', 'item': 'https://uttarakhandgateways.com/guides' },
              { '@type': 'ListItem', 'position': 3, 'name': selectedGuide.titleEn, 'item': `https://uttarakhandgateways.com/guides/${selectedGuide.slug}` }
            ]
          },
          {
            '@type': 'Article',
            '@id': `https://uttarakhandgateways.com/guides/${selectedGuide.slug}#article`,
            'headline': selectedGuide.titleEn,
            'description': selectedGuide.metaDescription,
            'inLanguage': ['en-IN', 'hi-IN'],
            'author': {
              '@type': 'Organization',
              'name': 'Uttarakhand Gateways Legal & Research Editorial'
            },
            'publisher': {
              '@type': 'Organization',
              'name': 'Uttarakhand Gateways',
              'logo': { '@type': 'ImageObject', 'url': 'https://uttarakhandgateways.com/logo.png' }
            }
          }
        ]
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

      return () => {
        const el = document.getElementById(schemaId);
        if (el) el.remove();
      };
    } else {
      document.title = 'Uttarakhand Real Estate Legal Guides & Land Laws | Uttarakhand Gateways';
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedGuide]);

  return (
    <div className="min-h-screen bg-[#f4f9f6] dark:bg-[#061811] text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-600 selection:text-white transition-colors">
      
      {/* 1. TOP HEADER & BREADCRUMB */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#071f17]/95 backdrop-blur-md border-b border-emerald-200 dark:border-emerald-800/80 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (selectedSlug) {
                  setSelectedSlug(null);
                } else {
                  onBackToMain();
                }
              }}
              className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{selectedSlug ? (isHindi ? 'सभी गाइड्स' : 'All Guides') : (isHindi ? 'होम' : 'Home')}</span>
            </button>
            <div className="h-5 w-px bg-emerald-300 dark:bg-emerald-800" />
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <a href="/" onClick={(e) => { e.preventDefault(); onBackToMain(); }} className="hover:underline flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-emerald-600" />
                <span>Home</span>
              </a>
              <span>&gt;</span>
              <a href="/guides" onClick={(e) => { e.preventDefault(); setSelectedSlug(null); }} className="hover:underline">
                Guides & Land Laws
              </a>
              {selectedGuide && (
                <>
                  <span>&gt;</span>
                  <span className="font-semibold text-slate-800 dark:text-white truncate max-w-[180px] sm:max-w-xs">{selectedGuide.titleEn}</span>
                </>
              )}
            </div>
          </div>

          <Logo size="sm" showTagline={false} darkText={true} />
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      {selectedGuide ? (
        /* SINGLE GUIDE DETAIL VIEW */
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8 flex-1">
          <article className="bg-white dark:bg-[#071f17] rounded-3xl p-6 sm:p-10 border border-emerald-200 dark:border-emerald-800/80 shadow-md space-y-6">
            
            <div className="space-y-3 pb-6 border-b border-emerald-100 dark:border-emerald-800/60">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {selectedGuide.category}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{selectedGuide.readTime}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif-luxury text-slate-900 dark:text-white tracking-tight leading-tight">
                {isHindi ? selectedGuide.titleHi : selectedGuide.titleEn}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {isHindi ? selectedGuide.summaryHi : selectedGuide.summaryEn}
              </p>
            </div>

            {/* In-depth Article Sections */}
            <div className="space-y-8 text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
              {selectedGuide.sections.map((sec, idx) => (
                <section key={idx} className="space-y-3 p-5 rounded-2xl bg-emerald-50/50 dark:bg-[#06241a]/60 border border-emerald-100 dark:border-emerald-800/50">
                  <h2 className="text-lg sm:text-xl font-bold font-serif-luxury text-emerald-950 dark:text-emerald-100">
                    {isHindi ? sec.headingHi : sec.headingEn}
                  </h2>
                  <p className="leading-relaxed">
                    {isHindi ? sec.contentHi : sec.contentEn}
                  </p>
                </section>
              ))}
            </div>

            {/* Quick Action Footer inside Guide */}
            <div className="pt-6 border-t border-emerald-100 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSlug(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  ← {isHindi ? 'अन्य गाइड्स देखें' : 'Back to All Guides'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {onOpenUnitConverter && (
                  <button
                    onClick={onOpenUnitConverter}
                    className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-300 dark:border-emerald-700"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Nali Converter</span>
                  </button>
                )}
                <a
                  href="/buy"
                  onClick={(e) => { e.preventDefault(); if (onNavigatePage) onNavigatePage('buy'); }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Explore Verified Listings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </article>
        </main>
      ) : (
        /* GUIDES HUB OVERVIEW LIST */
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full space-y-10 flex-1">
          
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Uttarakhand Gateways Knowledge Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif-luxury text-[#0a271c] dark:text-white tracking-tight">
              Uttarakhand Real Estate Legal Guides & Land Laws
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Clear, authentic legal guidance on Section 154 land ceiling, Section 143 non-agricultural conversion, traditional hill measurements (Nali/Mutthi), stamp duty, and registry verification.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${activeCategory === cat ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-[#071f17] text-slate-700 dark:text-slate-200 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Guides Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <article
                key={guide.slug}
                onClick={() => setSelectedSlug(guide.slug)}
                className="bg-white dark:bg-[#071f17] rounded-3xl p-6 border border-emerald-200/90 dark:border-emerald-800/80 shadow-xs hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {guide.category}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{guide.readTime}</span>
                    </span>
                  </div>

                  <h2 className="text-lg font-bold font-serif-luxury text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                    {isHindi ? guide.titleHi : guide.titleEn}
                  </h2>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {isHindi ? guide.summaryHi : guide.summaryEn}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-emerald-900/40 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Read Guide</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            ))}
          </div>

        </main>
      )}

      {/* 3. FOOTER */}
      <footer className="py-6 border-t border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#071f17] text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Uttarakhand Gateways. Authentic Mountain Real Estate Legal Insights.</p>
      </footer>
    </div>
  );
};
