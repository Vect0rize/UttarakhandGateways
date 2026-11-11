import React from 'react';
import { Logo } from './Logo';
import { MapPin, ShieldCheck, FileText, Cookie, AlertTriangle, HelpCircle, Building2, Handshake, BookOpen } from 'lucide-react';
import { CITIES } from '../data/properties';
import { useLanguage } from '../context/LanguageContext';
import { LegalPolicyId } from '../data/legalPolicies';
import { SeoKeywordsSection } from './SeoKeywordsSection';
import type { AppPageRouteKey } from '../data/seoMetadata';

interface FooterProps {
  onCityClick: (city: string) => void;
  onCategoryClick: (category: string) => void;
  onOpenUnitConverter?: () => void;
  onOpenLegalPolicy?: (policyId: LegalPolicyId) => void;
  onNavigateCity?: (city: string) => void;
  onNavigateGuides?: (slug?: string) => void;
  onNavigatePage?: (page: AppPageRouteKey) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onCityClick,
  onCategoryClick,
  onOpenLegalPolicy,
  onNavigateCity,
  onNavigateGuides,
  onNavigatePage,
}) => {
  const { isHindi } = useLanguage();

  const categoryLabels: Record<string, { en: string; hi: string }> = {
    'Residential': { en: 'Residential', hi: 'आवासीय' },
    'Commercial': { en: 'Commercial', hi: 'व्यावसायिक' },
    'Agriculture': { en: 'Agriculture', hi: 'कृषि भूमि' },
  };

  const cityLabels: Record<string, string> = {
    'Dehradun': 'देहरादून',
    'Rishikesh': 'ऋषिकेश',
    'Haridwar': 'हरिद्वार',
    'Mussoorie': 'मसूरी',
    'Nainital': 'नैनीताल',
    'Mukteshwar': 'मुक्तेश्वर',
    'Almora': 'अल्मोड़ा',
  };

  const legalLinks: { id: LegalPolicyId; titleEn: string; titleHi: string; icon: React.ReactNode }[] = [
    { id: 'terms', titleEn: 'Terms & Conditions', titleHi: 'उपयोग की शर्तें', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'privacy', titleEn: 'Privacy Policy', titleHi: 'गोपनीयता नीति', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'cookie', titleEn: 'Cookie Policy', titleHi: 'कुकी नीति (Cookies)', icon: <Cookie className="w-3.5 h-3.5" /> },
    { id: 'disclaimer', titleEn: 'Disclaimer', titleHi: 'अस्वीकरण (Disclaimer)', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'grievance', titleEn: 'Grievance Redressal', titleHi: 'शिकायत निवारण (IT Rules)', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'listing_policy', titleEn: 'Property Listing Policy', titleHi: 'प्रॉपर्टी लिस्टिंग नीति', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'seller_agreement', titleEn: 'User / Seller Agreement', titleHi: 'उपयोगकर्ता विक्रेता अनुबंध', icon: <Handshake className="w-3.5 h-3.5" /> },
  ];

  const handleOpenLegal = (id: LegalPolicyId) => {
    if (onOpenLegalPolicy) {
      onOpenLegalPolicy(id);
    }
  };

  return (
    <footer className="relative bg-[#e8eae6] dark:bg-[#07261A] border-t border-[#d0d7d2] dark:border-[#32463D] text-[#12231a] dark:text-[#e6ebe7] transition-colors">
      
      {/* Decorative top trim in Oaken Forest -> Rose-Bronze -> Slate Pine */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0E3A2B] via-[#AA8F7C] to-[#32463D] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col (Spans 2 columns on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" showTagline={true} darkText={true} />
            
            <p className="text-slate-600 dark:text-emerald-200/90 text-xs sm:text-sm leading-relaxed max-w-sm">
              {isHindi
                ? 'उत्तराखंड गेटवेज 0% ब्रोकरेज के साथ सत्यापित फ्लैट, आवासीय प्लॉट और विला खोजने का प्रमुख मंच है।'
                : 'Discover Uttarakhand with Uttarakhand Gateways, a trusted real estate platform for buying, selling, and exploring properties across Uttarakhand. Find residential properties, houses, apartments, flats, plots, land, villas, commercial properties, shops, offices, and investment opportunities in popular locations including Dehradun, Rishikesh, Haridwar, Nainital, Mussoorie, Haldwani, Almora, Roorkee, Rudrapur, and other beautiful cities and hill stations of Uttarakhand. Whether you are looking for a house for sale in Uttarakhand, land for sale in Uttarakhand, property for sale in Dehradun, plots in Rishikesh, apartments in Haridwar, villas in Nainital, or commercial property in Uttarakhand, Uttarakhand Gateways makes property discovery simple. Browse property listings, explore locations, view property details, and connect directly with property owners. Our platform helps buyers, sellers, property owners, and real estate professionals connect in one place. Explore residential and commercial real estate, compare available properties, and discover opportunities for property investment in Uttarakhand. Find your next home, plot, land, villa, apartment, or commercial property with Uttarakhand Gateways — your online gateway to Uttarakhand real estate.'}
            </p>

            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 max-w-sm space-y-1.5 shadow-xs">
              <div className="text-emerald-800 dark:text-emerald-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'पूरे उत्तराखंड में कवरेज' : 'Coverage Across Uttarakhand'}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {isHindi 
                  ? 'देहरादून, ऋषिकेश, हरिद्वार, मसूरी, नैनीताल, मुक्तेश्वर, अल्मोड़ा आदि।'
                  : 'Dehradun, Rishikesh, Haridwar, Mussoorie, Nainital, Mukteshwar & Almora'}
              </p>
              <div className="pt-1">
                <a href="mailto:ukg@uttarakhandgateways.com" className="text-[11px] text-emerald-700 dark:text-emerald-300 hover:underline">
                  <span>{isHindi ? 'पूछताछ:' : 'Inquiries:'} ukg@uttarakhandgateways.com</span>
                </a>
              </div>
            </div>

            <div className="pt-1">
              <a
                href="/UKG - App.apk?v=7"
                download="UKG - App.apk"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0E3A2B] to-[#32463D] hover:from-[#164A37] hover:to-[#3c5348] text-[#F4F3EF] border border-[#AA8F7C]/40 font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <span>📲</span>
                <span>{isHindi ? 'ऑफिशियल एंड्रॉइड ऐप (APK)' : 'Download Android App (APK)'}</span>
              </a>
            </div>
          </div>

          {/* Quick Property Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#0a271c] dark:text-slate-100 uppercase tracking-wider">
              {isHindi ? 'संपत्तियां' : 'Properties'}
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                'Residential',
                'Commercial',
                'Agriculture'
              ].map((category) => (
                <li key={category}>
                  <a
                    href={`/buy?category=${encodeURIComponent(category)}`}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        onCategoryClick(category);
                      }
                    }}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer text-inherit"
                  >
                    {isHindi ? categoryLabels[category]?.hi || category : category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Uttarakhand Destinations */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#0a271c] dark:text-slate-100 uppercase tracking-wider">
              {isHindi ? 'प्रमुख स्थल' : 'Destinations'}
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
              {CITIES.map((city) => (
                <a
                  key={city}
                  href={`/properties-in-${city.toLowerCase()}`}
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                      e.preventDefault();
                      if (onNavigateCity) {
                        onNavigateCity(city);
                      } else {
                        onCityClick(city);
                      }
                    }
                  }}
                  className="text-left hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-xs truncate text-inherit"
                >
                  {isHindi ? cityLabels[city] || city : city}
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
              <a
                href="/guides"
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                    e.preventDefault();
                    if (onNavigateGuides) onNavigateGuides();
                  }
                }}
                className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 text-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isHindi ? 'भूमि कानून व गाइड' : 'Land Laws & Guides'}</span>
              </a>
            </div>
          </div>

          {/* Legal & Compliance Column (All 7 required legal policies) */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-sm font-bold text-[#0a271c] dark:text-slate-100 uppercase tracking-wider">
                {isHindi ? 'विधिक एवं नीतियां' : 'Legal & Compliance'}
              </h4>
            </div>

            <ul className="space-y-1.5">
              {legalLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => handleOpenLegal(link.id)}
                    className="text-xs text-slate-700 dark:text-emerald-200/90 hover:text-emerald-800 dark:hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1.5 py-0.5 group"
                  >
                    <span className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                      {link.icon}
                    </span>
                    <span className="group-hover:underline">
                      {isHindi ? link.titleHi : link.titleEn}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Mid Bar: All 7 Quick Policy Badges */}
        <div className="pt-6 border-t border-emerald-200/80 dark:border-emerald-900/60 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-emerald-200">
          {legalLinks.map((link, idx) => (
            <React.Fragment key={link.id}>
              <button
                type="button"
                onClick={() => handleOpenLegal(link.id)}
                className="hover:text-emerald-800 dark:hover:text-white hover:underline cursor-pointer transition-colors"
              >
                {isHindi ? link.titleHi : link.titleEn}
              </button>
              {idx < legalLinks.length - 1 && (
                <span className="text-slate-300 dark:text-emerald-900 hidden sm:inline">•</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Bottom Bar: Clear Title Registry & Statutory Rights */}
        <div className="pt-6 border-t border-emerald-200/80 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-emerald-200">
          <div>
            © {new Date().getFullYear()} Uttarakhand Gateways. <span className="text-emerald-700 dark:text-emerald-300 font-bold">{isHindi ? 'सर्वाधिकार सुरक्षित। उत्तराखंड।' : 'All Rights Reserved. Uttarakhand.'}</span>
          </div>
          
          <div className="flex items-center gap-3 text-slate-600 dark:text-emerald-200 font-medium flex-wrap justify-center">
            <span className="text-slate-800 dark:text-emerald-100 font-bold">
              {isHindi ? 'आईटी अधिनियम २००० धारा ७९ अनुपालित' : 'IT Act 2000 Section 79 Intermediary'}
            </span>
          </div>
        </div>

      </div>

      <SeoKeywordsSection
        onNavigatePage={onNavigatePage}
        onNavigateCity={onNavigateCity || onCityClick}
        compact={true}
      />

    </footer>
  );
};
