import React from 'react';
import { Logo } from './Logo';
import { MapPin } from 'lucide-react';
import { CITIES } from '../data/properties';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onCityClick: (city: string) => void;
  onCategoryClick: (category: string) => void;
  onOpenEmiCalc?: () => void;
  onOpenUnitConverter?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onCityClick,
  onCategoryClick,
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
    'Bhimtal': 'भीमताल',
    'Ranikhet': 'रानीखेत',
    'Lansdowne': 'लैंसडाउन',
    'Auli': 'औली',
    'Dhanaulti': 'धनौल्टी',
    'Kanatal': 'कनाताल',
    'Kausani': 'कौसानी',
    'Chakrata': 'चकराता',
    'Tehri Garhwal': 'टिहरी गढ़वाल',
    'Rudraprayag': 'रुद्रप्रयाग',
    'Uttarkashi': 'उत्तरकाशी',
    'Kotdwar': 'कोटद्वार',
    'Haldwani': 'हल्द्वानी',
    'Bhowali': 'भवाली',
    'Devprayag': 'देवप्रयाग',
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#eaf4ec] to-[#d8ebd9] dark:from-[#081f18] dark:to-[#04120e] border-t border-emerald-200 dark:border-slate-800 pt-16 pb-12 text-slate-600 dark:text-slate-400 text-xs transition-colors">
      
      {/* Subtle top light green line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" showTagline={true} darkText={true} />
            
            <p className="text-slate-600 dark:text-emerald-200/90 text-xs sm:text-sm leading-relaxed max-w-sm">
              {isHindi
                ? 'उत्तराखंड गेटवेज 0% ब्रोकरेज के साथ सत्यापित फ्लैट, आवासीय प्लॉट और विला खोजने का प्रमुख मंच है।'
                : 'Uttarakhand Gateways is a dedicated real estate platform for discovering verified flats, residential plots, and villas with 0% brokerage.'}
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
            <ul className="space-y-2">
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

        </div>

        {/* Bottom Bar: Clear Title Registry */}
        <div className="pt-8 border-t border-emerald-200/80 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-emerald-200">
          <div className="font-semibold text-slate-800 dark:text-emerald-100">
            © {new Date().getFullYear()} Uttarakhand Gateways. <span className="text-emerald-700 dark:text-emerald-300 font-bold">{isHindi ? 'सर्वाधिकार सुरक्षित। उत्तराखंड।' : 'All Rights Reserved. Uttarakhand.'}</span>
          </div>
          
          <div className="flex items-center gap-4 text-slate-600 dark:text-emerald-200 font-medium">
            <span className="text-slate-800 dark:text-emerald-100 font-bold">{isHindi ? 'स्पष्ट मालिकाना हक उत्तराखंड रजिस्ट्री' : 'Clear Title Uttarakhand Registry'}</span>
            <span>•</span>
            <span className="text-emerald-700 dark:text-emerald-300 font-bold">
              {isHindi ? '100% प्रत्यक्ष स्वामित्व' : '100% Direct Ownership'}
            </span>
          </div>
        </div>

      </div>

    </footer>
  );
};
