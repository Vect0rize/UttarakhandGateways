import React from 'react';
import { Logo } from './Logo';
import { MapPin, Phone } from 'lucide-react';
import { CITIES } from '../data/properties';

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
  return (
    <footer className="relative bg-gradient-to-b from-[#e8f4fc] to-[#d8edf9] dark:from-[#0a1b2e] dark:to-[#050f1a] border-t border-sky-200 dark:border-slate-800 pt-16 pb-12 text-slate-600 dark:text-slate-400 text-xs transition-colors">
      
      {/* Subtle top ocean blue line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-sky-400 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" showTagline={true} darkText={true} />
            
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Uttarakhand Gateways is our private portfolio representing handpicked flats, residential plots, and Himalayan villas across Dev Bhoomi.
            </p>

            <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-sky-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 max-w-sm space-y-1.5 shadow-xs">
              <div className="text-sky-800 dark:text-sky-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Office: Rishikesh, Uttarakhand</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Tapovan & Badrinath Marg, Rishikesh, Uttarakhand – 249201
              </p>
              <div className="pt-1">
                <a href="tel:+917535981704" className="text-sky-700 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1.5 text-xs">
                  <Phone className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  <span>+91 7535981704</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Property Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#0c2340] dark:text-slate-100 uppercase tracking-wider">
              Properties
            </h4>
            <ul className="space-y-2">
              {[
                'Flats & Apartments',
                'Residential Plots',
                'Himalayan Villas & Cottages',
                'Farmhouses & Land'
              ].map((category) => (
                <li key={category}>
                  <button
                    onClick={() => onCategoryClick(category)}
                    className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-left cursor-pointer"
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Uttarakhand Destinations */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#0c2340] dark:text-slate-100 uppercase tracking-wider">
              Destinations
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => onCityClick(city)}
                  className="text-left hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer text-xs truncate"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Clear Title Registry */}
        <div className="pt-8 border-t border-sky-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <div>
            © {new Date().getFullYear()} Uttarakhand Gateways. All Rights Reserved. Rishikesh, Uttarakhand.
          </div>
          
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-500">
            <span>Clear Title Uttarakhand Registry</span>
            <span>•</span>
            <span className="text-sky-700 dark:text-sky-400 font-medium">Jai Badri Vishal · Jai Baba Kedar</span>
          </div>
        </div>

      </div>

    </footer>
  );
};
