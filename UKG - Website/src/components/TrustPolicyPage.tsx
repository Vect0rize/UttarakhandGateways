import React, { useEffect } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Home,
  Mail,
  MapPin,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { LAWYER_CONFIRMATION_NOTES, LEGAL_POLICIES, type LegalPolicyId } from '../data/legalPolicies';
import { getPageSeoMeta } from '../data/seoMetadata';
import { useLanguage } from '../context/LanguageContext';

export type TrustPageRouteKey =
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'disclaimer'
  | 'listing-guidelines'
  | 'not-found';

interface TrustPolicyPageProps {
  routeKey: TrustPageRouteKey;
  onNavigatePath: (path: string) => void;
  totalPropertiesCount?: number;
}

export const TrustPolicyPage: React.FC<TrustPolicyPageProps> = ({
  routeKey,
  onNavigatePath,
}) => {
  const { isHindi } = useLanguage();

  useEffect(() => {
    const seo = getPageSeoMeta(routeKey);
    document.title = seo.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', seo.description);

    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      metaRobots.setAttribute(
        'content',
        routeKey === 'not-found'
          ? 'noindex, follow'
          : 'index, follow, max-image-preview:large'
      );
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://uttarakhandgateways.com${seo.canonicalPath}`);
    }

    const scriptId = 'ukg-trust-page-ldjson';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const payload = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          name: seo.title,
          description: seo.description,
          url: `https://uttarakhandgateways.com${seo.canonicalPath}`,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://uttarakhandgateways.com/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: seo.title.split('|')[0].trim(),
              item: `https://uttarakhandgateways.com${seo.canonicalPath}`,
            },
          ],
        },
      ],
    };
    script.textContent = JSON.stringify(payload);

    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [routeKey]);

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    onNavigatePath(path);
  };

  if (routeKey === 'not-found') {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="bg-white dark:bg-[#11241b] border border-emerald-900/15 dark:border-emerald-700/30 rounded-3xl p-8 sm:p-12 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/40 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 mb-2">
            HTTP 404 • Page Not Found
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            We couldn’t find that property or page
          </h1>
          <p className="text-slate-600 dark:text-emerald-100/75 max-w-xl mx-auto mb-8">
            The listing may have been removed or marked unavailable by the lister, or the URL may have changed. Browse available Uttarakhand listings below.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/properties-in-uttarakhand"
              onClick={(e) => handleLinkClick(e, '/properties-in-uttarakhand')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition"
            >
              Browse All Uttarakhand Properties <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/buy"
              onClick={(e) => handleLinkClick(e, '/buy')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-emerald-950/70 text-slate-800 dark:text-emerald-100 font-bold text-sm hover:bg-slate-200 dark:hover:bg-emerald-900/70 transition"
            >
              Buy Property
            </a>
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 dark:border-emerald-700/50 text-slate-700 dark:text-emerald-200 font-bold text-sm transition"
            >
              Return Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  const policyMap: Partial<Record<TrustPageRouteKey, LegalPolicyId>> = {
    privacy: 'privacy',
    terms: 'terms',
    disclaimer: 'disclaimer',
    'listing-guidelines': 'listing_policy',
  };

  const policyKey = policyMap[routeKey];
  const policy = policyKey ? LEGAL_POLICIES[policyKey] : null;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-emerald-200/70">
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="inline-flex items-center gap-1 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
        >
          <Home className="w-3.5 h-3.5" /> Home
        </a>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-slate-800 dark:text-white capitalize">
          {routeKey.replace('-', ' ')}
        </span>
      </nav>

      {routeKey === 'about' && (
        <article className="bg-white dark:bg-[#10231a] border border-emerald-900/15 dark:border-emerald-700/30 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
          <header className="border-b border-slate-200 dark:border-emerald-800/40 pb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Property Listing & Discovery Platform
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-3">
              About Uttarakhand Gateways
            </h1>
            <p className="text-slate-600 dark:text-emerald-100/80 text-base leading-relaxed max-w-3xl">
              Uttarakhand Gateways (uttarakhandgateways.com) is an online property listing and discovery platform connecting property owners, listers, and interested buyers or tenants across Uttarakhand with NO PLATFORM FEE.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50">
              <Building2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400 mb-2" />
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">
                Regional Discovery
              </h2>
              <p className="text-xs text-slate-600 dark:text-emerald-100/75 leading-relaxed">
                Browse residential, hill-station, commercial, and land listings across Dehradun, Rishikesh, Haridwar, Haldwani, Nainital, Mussoorie, Mukteshwar, Almora, and surrounding districts.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400 mb-2" />
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">
                No Platform Fee
              </h2>
              <p className="text-xs text-slate-600 dark:text-emerald-100/75 leading-relaxed">
                Listers publish their contact details openly so buyers and tenants can call or message via WhatsApp directly without platform charges.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50">
              <FileText className="w-6 h-6 text-emerald-700 dark:text-emerald-400 mb-2" />
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">
                Informational Tools
              </h2>
              <p className="text-xs text-slate-600 dark:text-emerald-100/75 leading-relaxed">
                Practical educational guides, local land unit conversions (Nali, Mutthi, Bigha, Gaj), and an informational EMI estimate calculator.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Intermediary Role & Independent Verification Notice
            </h2>
            <p className="text-sm text-slate-600 dark:text-emerald-100/80 leading-relaxed">
              Uttarakhand Gateways acts solely as an online listing platform displaying information submitted by property listers. UKG does not own, sell, purchase, rent, inspect, or independently verify listed properties, and does not act as a real estate agent, broker, legal adviser, or financial adviser. Every prospective buyer or tenant must independently verify property ownership, title deeds, land records, permissions, measurements, legal status, and pricing with a qualified lawyer before entering into any transaction.
            </p>
          </section>

          <footer className="pt-4 border-t border-slate-200 dark:border-emerald-800/40 flex flex-wrap gap-3">
            <a
              href="/buy"
              onClick={(e) => handleLinkClick(e, '/buy')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
            >
              Browse Properties
            </a>
            <a
              href="/terms"
              onClick={(e) => handleLinkClick(e, '/terms')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900/50 text-slate-800 dark:text-emerald-100 text-xs font-bold transition"
            >
              Terms & Conditions
            </a>
            <a
              href="/disclaimer"
              onClick={(e) => handleLinkClick(e, '/disclaimer')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900/50 text-slate-800 dark:text-emerald-100 text-xs font-bold transition"
            >
              Disclaimer
            </a>
          </footer>
        </article>
      )}

      {routeKey === 'contact' && (
        <article className="bg-white dark:bg-[#10231a] border border-emerald-900/15 dark:border-emerald-700/30 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
          <header className="border-b border-slate-200 dark:border-emerald-800/40 pb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-3">
              <Mail className="w-3.5 h-3.5" /> Support & Grievance Desk
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
              Contact Uttarakhand Gateways
            </h1>
            <p className="text-slate-600 dark:text-emerald-100/80 text-base max-w-2xl">
              Need help publishing a listing, reporting an inaccurate or unauthorized listing, or submitting a privacy or grievance inquiry? Contact our support desk below.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50 space-y-3">
              <Mail className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Support & Grievance Email
              </h2>
              <p className="text-sm text-slate-600 dark:text-emerald-100/80">
                For listing assistance, abuse reports, takedown requests, or privacy queries:
              </p>
              <a
                href="mailto:ukg@uttarakhandgateways.com"
                className="inline-flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300 underline break-all"
              >
                ukg@uttarakhandgateways.com
              </a>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-emerald-950/30 border border-slate-200 dark:border-emerald-800/40 space-y-3">
              <MapPin className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Service Region
              </h2>
              <p className="text-sm text-slate-600 dark:text-emerald-100/80">
                Online property listing and discovery across Uttarakhand — including Dehradun, Rishikesh, Haridwar, Haldwani, Nainital, Mussoorie, Almora, Mukteshwar, and surrounding districts.
              </p>
            </div>
          </div>

          <section className="flex flex-wrap gap-3 pt-2">
            <a
              href="/list"
              onClick={(e) => handleLinkClick(e, '/list')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
            >
              Post a Property
            </a>
            <a
              href="/terms"
              onClick={(e) => handleLinkClick(e, '/terms')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-emerald-900/50 text-slate-800 dark:text-emerald-100 text-xs font-bold transition"
            >
              Terms & Conditions
            </a>
            <a
              href="/privacy"
              onClick={(e) => handleLinkClick(e, '/privacy')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-emerald-900/50 text-slate-800 dark:text-emerald-100 text-xs font-bold transition"
            >
              Privacy Policy
            </a>
            <a
              href="/disclaimer"
              onClick={(e) => handleLinkClick(e, '/disclaimer')}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-emerald-900/50 text-slate-800 dark:text-emerald-100 text-xs font-bold transition"
            >
              Disclaimer
            </a>
          </section>
        </article>
      )}

      {policy && (
        <article className="bg-white dark:bg-[#10231a] border border-emerald-900/15 dark:border-emerald-700/30 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
          <header className="border-b border-slate-200 dark:border-emerald-800/40 pb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-3">
              {isHindi ? policy.badgeHi : policy.badgeEn} • {isHindi ? policy.lastUpdatedHi : policy.lastUpdatedEn}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
              {isHindi ? policy.fullTitleHi : policy.fullTitleEn}
            </h1>
            <p className="text-slate-600 dark:text-emerald-100/80 text-base">
              {isHindi ? policy.summaryHi : policy.summaryEn}
            </p>
          </header>

          <div className="space-y-6">
            {policy.sections.map((section, idx) => (
              <section key={idx} className="space-y-2.5">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {isHindi ? section.titleHi : section.titleEn}
                </h2>
                <p className="text-sm text-slate-600 dark:text-emerald-100/80 leading-relaxed">
                  {isHindi ? section.contentHi : section.contentEn}
                </p>
                {(isHindi ? section.bulletsHi : section.bulletsEn)?.length ? (
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600 dark:text-emerald-100/80">
                    {(isHindi ? section.bulletsHi : section.bulletsEn)!.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          <section className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {isHindi
                  ? 'विधिक समीक्षा सूचना (प्रकाशन से पूर्व भारतीय वकील द्वारा पुष्टि योग्य बिंदु)'
                  : 'Legal Review Notice — Points for Confirmation by a Qualified Indian Lawyer'}
              </span>
            </div>
            <ul className="space-y-1.5 text-xs text-amber-900/90 dark:text-amber-100/85 list-disc pl-5">
              {LAWYER_CONFIRMATION_NOTES.map((note, idx) => (
                <li key={idx}>
                  <strong>{isHindi ? note.topicHi : note.topicEn}:</strong>{' '}
                  {isHindi ? note.detailHi : note.detailEn}
                </li>
              ))}
            </ul>
          </section>

          <footer className="pt-6 border-t border-slate-200 dark:border-emerald-800/40 flex flex-wrap items-center justify-between gap-3">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Uttarakhand Gateways
            </a>
            <div className="flex flex-wrap gap-3 text-xs font-bold">
              <a href="/about" onClick={(e) => handleLinkClick(e, '/about')} className="text-slate-600 dark:text-emerald-200 hover:text-emerald-600">
                About Us
              </a>
              <a href="/contact" onClick={(e) => handleLinkClick(e, '/contact')} className="text-slate-600 dark:text-emerald-200 hover:text-emerald-600">
                Contact
              </a>
              <a href="/terms" onClick={(e) => handleLinkClick(e, '/terms')} className="text-slate-600 dark:text-emerald-200 hover:text-emerald-600">
                Terms
              </a>
              <a href="/privacy" onClick={(e) => handleLinkClick(e, '/privacy')} className="text-slate-600 dark:text-emerald-200 hover:text-emerald-600">
                Privacy
              </a>
              <a href="/disclaimer" onClick={(e) => handleLinkClick(e, '/disclaimer')} className="text-slate-600 dark:text-emerald-200 hover:text-emerald-600">
                Disclaimer
              </a>
              <a href="/listing-guidelines" onClick={(e) => handleLinkClick(e, '/listing-guidelines')} className="text-slate-600 dark:text-emerald-200 hover:text-emerald-600">
                Listing Policy
              </a>
            </div>
          </footer>
        </article>
      )}
    </main>
  );
};
