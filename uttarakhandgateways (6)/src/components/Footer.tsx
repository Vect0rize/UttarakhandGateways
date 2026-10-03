import React from 'react';
import { Logo } from './Logo';
import { MapPin, ShieldCheck, FileText, Cookie, AlertTriangle, HelpCircle, Building2, Handshake } from 'lucide-react';
import { CITIES } from '../data/properties';
import { useLanguage } from '../context/LanguageContext';
import { LegalPolicyId } from '../data/legalPolicies';

interface FooterProps {
  onCityClick: (city: string) => void;
  onCategoryClick: (category: string) => void;
  onOpenEmiCalc?: () => void;
  onOpenUnitConverter?: () => void;
  onOpenLegalPolicy?: (policyId: LegalPolicyId) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onCityClick,
  onCategoryClick,
  onOpenLegalPolicy,
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
    <footer className="relative bg-emerald-100/50 dark:bg-[#071c14] border-t border-emerald-300 dark:border-emerald-800/80 text-slate-800 dark:text-emerald-100 transition-colors">
      
      {/* Decorative mountain landscape silhouette */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 pointer-events-none" />

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
                <a href="mailto:ukg@uttarakhandgateways.com" className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1.5 text-xs break-all">
                  <span>{isHindi ? 'पूछताछ:' : 'Inquiries:'} ukg@uttarakhandgateways.com</span>
                </a>
              </div>
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
                  <button
                    onClick={() => onCategoryClick(category)}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left cursor-pointer"
                  >
                    {isHindi ? categoryLabels[category]?.hi || category : category}
                  </button>
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
                <button
                  key={city}
                  onClick={() => onCityClick(city)}
                  className="text-left hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-xs truncate"
                >
                  {isHindi ? cityLabels[city] || city : city}
                </button>
              ))}
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
        <div className="pt-6 border-t border-emerald-200/80 dark:border-emerald-900/60">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-700 dark:text-emerald-200">
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
        </div>

        {/* Bottom Bar: Clear Title Registry & Statutory Rights */}
        <div className="pt-6 border-t border-emerald-200/80 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-emerald-200">
          <div className="font-semibold text-slate-800 dark:text-emerald-100">
            © {new Date().getFullYear()} Uttarakhand Gateways. <span className="text-emerald-700 dark:text-emerald-300 font-bold">{isHindi ? 'सर्वाधिकार सुरक्षित। उत्तराखंड।' : 'All Rights Reserved. Uttarakhand.'}</span>
          </div>
          
          <div className="flex items-center gap-3 text-slate-600 dark:text-emerald-200 font-medium flex-wrap justify-center">
            <span className="text-slate-800 dark:text-emerald-100 font-bold">
              {isHindi ? 'आईटी अधिनियम २००० धारा ७९ अनुपालित' : 'IT Act 2000 Section 79 Intermediary'}
            </span>
            <span>•</span>
            <span className="text-emerald-700 dark:text-emerald-300 font-bold">
              {isHindi ? '०% ब्रोकरेज मार्केटप्लेस' : '0% Brokerage Marketplace'}
            </span>
          </div>
        </div>

      </div>

    </footer>
  );
};
