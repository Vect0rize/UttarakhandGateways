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

    if (routeKey === 'contact') {
      requestAnimationFrame(() => {
        const el = document.getElementById('about-contact-details');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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

      {(routeKey === 'about' || routeKey === 'contact') && (
        <article className="bg-white dark:bg-[#10231a] border border-emerald-900/15 dark:border-emerald-700/30 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
          <header className="border-b border-slate-200 dark:border-emerald-800/40 pb-6 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isHindi ? 'उत्तराखंड रियल एस्टेट पोर्टल' : 'About Us & Contact'}</span>
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {isHindi ? 'उत्तराखंड गेटवेज के बारे में' : 'About Uttarakhand Gateways'}
            </h1>
            <p className="text-slate-600 dark:text-emerald-100/85 text-sm sm:text-base leading-relaxed max-w-3xl">
              {isHindi
                ? 'उत्तराखंड गेटवेज (uttarakhandgateways.com) उत्तराखंड भर में प्रॉपर्टी मालिकों, लिस्टिंगकर्ताओं और खरीदारों या किरायेदारों को बिना किसी प्लेटफॉर्म शुल्क (NO PLATFORM FEE) के सीधे जोड़ने वाला रियल एस्टेट लिस्टिंग और डिस्कवरी मंच है।'
                : 'Uttarakhand Gateways (uttarakhandgateways.com) is an online property listing and discovery platform built specifically for Uttarakhand — connecting property owners, listers, buyers, and tenants directly with NO PLATFORM FEE.'}
            </p>
          </header>

          {/* Core Pillars */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50 space-y-2">
              <Building2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
                {isHindi ? 'संपूर्ण उत्तराखंड कवरेज' : 'Dedicated to Uttarakhand'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-emerald-100/75 leading-relaxed">
                {isHindi
                  ? 'देहरादून, ऋषिकेश, हरिद्वार, हल्द्वानी, नैनीताल, मसूरी, मुक्तेश्वर, अल्मोड़ा और आसपास के जिलों में आवासीय प्लॉट, फ्लैट, विला, कॉटेज व व्यावसायिक संपत्तियां।'
                  : 'Explore residential plots, flats, hillside cottages, luxury villas, and commercial spaces across Dehradun, Rishikesh, Haridwar, Haldwani, Nainital, Mussoorie, Mukteshwar, Almora, and surrounding districts.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50 space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
                {isHindi ? 'शून्य प्लेटफॉर्म शुल्क' : 'NO PLATFORM FEE'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-emerald-100/75 leading-relaxed">
                {isHindi
                  ? 'संपत्ति का विवरण खोलने पर मालिक या लिस्टर से सीधे कॉल या व्हाट्सएप के माध्यम से बिना किसी बिचौलिया शुल्क के संपर्क करें।'
                  : 'Connect directly with property owners and listers via phone call, WhatsApp, or inbox chat on individual property pages with zero platform commission.'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50 space-y-2">
              <FileText className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
                {isHindi ? 'पहाड़ी भूमि इकाइयां व आवश्यकता बोर्ड' : 'Local Land Tools & Requirements'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-emerald-100/75 leading-relaxed">
                {isHindi
                  ? 'नाली, मुट्ठी, बीघा और गज रूपांतरण कैलकुलेटर, प्रॉपर्टी आवश्यकता बोर्ड (निजी नंबर गोपनीय रखते हुए) और उत्तराखंड भूमि मार्गदर्शिकाएं।'
                  : 'Built-in Uttarakhand land unit converter (Nali, Mutthi, Bigha, Gaj, Sq.Ft), private Post Your Requirements board, and regional property guides.'}
              </p>
            </div>
          </section>

          {/* Platform Role Notice */}
          <section className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0b1b14] border border-slate-200 dark:border-emerald-900/60 space-y-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              {isHindi ? 'हमारी भूमिका एवं पारदर्शिता' : 'Our Role & Transparency'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-100/80 leading-relaxed">
              {isHindi
                ? 'उत्तराखंड गेटवेज एक ऑनलाइन लिस्टिंग और डिस्कवरी प्लेटफॉर्म के रूप में कार्य करता है। प्रत्येक खरीदार या किरायेदार को किसी भी लेनदेन से पूर्व मूल स्वामित्व दस्तावेज, खतौनी/खसरा रिकॉर्ड और सरकारी स्वीकृतियों की स्वतंत्र कानूनी जांच अवश्य करनी चाहिए।'
                : 'Uttarakhand Gateways operates strictly as an online listing and discovery platform displaying details submitted by property listers. Prospective buyers and tenants should always verify title deeds, Bhulekh Khatauni records, and local approvals independently before any transaction.'}
            </p>
          </section>

          {/* CONTACT US SECTION ON THE ABOUT US PAGE */}
          <section id="about-contact-details" className="pt-4 border-t border-slate-200 dark:border-emerald-800/40 space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                <Mail className="w-3.5 h-3.5" />
                <span>{isHindi ? 'संपर्क और सहायता' : 'Contact Us'}</span>
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {isHindi ? 'हमसे संपर्क करें' : 'Get in Touch With Us'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-100/80 mt-1 max-w-2xl">
                {isHindi
                  ? 'प्रॉपर्टी लिस्टिंग सहायता, तकनीकी सहयोग, साझेदारी अथवा किसी लिस्टिंग से जुड़ी शिकायत या पूछताछ के लिए हमें लिखें।'
                  : 'Have questions about listing your property, posting a requirement, technical support, or grievance redressal? Reach our team directly below.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0E3A2B] via-[#0B3124] to-[#072118] text-white border border-emerald-800 shadow-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#C2A691]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                    {isHindi ? 'आधिकारिक ईमेल व सहायता डेस्क' : 'Official Support & Inquiries Email'}
                  </span>
                  <a
                    href="mailto:ukg@uttarakhandgateways.com"
                    className="text-base sm:text-lg font-extrabold text-white hover:text-[#C2A691] underline underline-offset-4 break-all block mt-1"
                  >
                    ukg@uttarakhandgateways.com
                  </a>
                </div>
                <p className="text-xs text-emerald-100/85 leading-relaxed">
                  {isHindi
                    ? 'लिस्टिंग सहायता, खाता सहयोग, गोपनीयता प्रश्नों और शिकायत निवारण हेतु ईमेल करें।'
                    : 'Write to us anytime for listing support, account help, privacy inquiries, or content takedown / grievance requests.'}
                </p>
                <div className="pt-1">
                  <a
                    href="mailto:ukg@uttarakhandgateways.com"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C2A691] hover:bg-[#d4baa6] text-[#032D1F] font-black text-xs transition no-underline"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'अभी ईमेल भेजें' : 'Email Us Now'}</span>
                  </a>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/50 space-y-3 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    {isHindi ? 'सेवा क्षेत्र एवं कवरेज' : 'Operating Region & Coverage'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-emerald-100/80 leading-relaxed">
                    {isHindi
                      ? 'उत्तराखंड, भारत — देहरादून, ऋषिकेश, हरिद्वार, मसूरी, नैनीताल, हल्द्वानी, मुक्तेश्वर, भीमताल, अल्मोड़ा, रानीखेत और संपूर्ण गढ़वाल व कुमाऊं मंडल।'
                      : 'Uttarakhand, India — Serving Dehradun, Rishikesh, Haridwar, Mussoorie, Nainital, Haldwani, Mukteshwar, Bhimtal, Almora, Ranikhet, and across Garhwal & Kumaon.'}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <a
                    href="/buy"
                    onClick={(e) => handleLinkClick(e, '/buy')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition no-underline"
                  >
                    {isHindi ? 'प्रॉपर्टी खरीदें' : 'Browse Properties'}
                  </a>
                  <a
                    href="/list"
                    onClick={(e) => handleLinkClick(e, '/list')}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-[#0c241c] border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 text-xs font-bold transition no-underline"
                  >
                    {isHindi ? 'प्रॉपर्टी लिस्ट करें (FREE)' : 'List Property (FREE)'}
                  </a>
                </div>
              </div>
            </div>
          </section>

          <footer className="pt-4 border-t border-slate-200 dark:border-emerald-800/40 flex flex-wrap gap-3">
            <a
              href="/"
              onClick={(e) => handleLinkClick(e, '/')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900/50 text-slate-800 dark:text-emerald-100 text-xs font-bold transition no-underline inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isHindi ? 'होम पर वापस जाएं' : 'Back to Home'}</span>
            </a>
            <a
              href="/terms"
              onClick={(e) => handleLinkClick(e, '/terms')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900/50 text-slate-800 dark:text-emerald-100 text-xs font-bold transition no-underline"
            >
              Terms & Conditions
            </a>
            <a
              href="/privacy"
              onClick={(e) => handleLinkClick(e, '/privacy')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900/50 text-slate-800 dark:text-emerald-100 text-xs font-bold transition no-underline"
            >
              Privacy Policy
            </a>
            <a
              href="/disclaimer"
              onClick={(e) => handleLinkClick(e, '/disclaimer')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-emerald-900/50 text-slate-800 dark:text-emerald-100 text-xs font-bold transition no-underline"
            >
              Disclaimer
            </a>
          </footer>
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
