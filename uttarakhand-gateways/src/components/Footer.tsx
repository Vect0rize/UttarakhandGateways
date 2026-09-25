import React from 'react';
import { Logo } from './Logo';
import { MapPin, Phone, Mail, Mountain, Heart, ShieldCheck } from 'lucide-react';
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
    <footer className="relative bg-[#070e15] border-t border-white/10 pt-16 pb-12 text-slate-400 text-xs">
      
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" showTagline={true} />
            
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Uttarakhand Gateways is our private portfolio representing handpicked flats, residential plots, and Himalayan villas across Dev Bhoomi.
            </p>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 max-w-sm space-y-1.5">
              <div className="text-emerald-400 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Office: Rishikesh, Uttarakhand</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Tapovan & Badrinath Marg, Rishikesh, Uttarakhand – 249201
              </p>
              <div className="pt-1">
                <a href="tel:+917535981704" className="text-amber-300 font-semibold hover:underline flex items-center gap-1.5 text-xs">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  <span>+91 7535981704</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Property Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Properties
            </h4>
            <ul className="space-y-2">
              {[
                'Flats & Apartments',
                'Residential Plots',
                'Himalayan Villas & Cottages',
                'Farmhouses & Land',
              ].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onCategoryClick(cat)}
                    className="hover:text-amber-400 transition-colors text-left cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Prime Uttarakhand Locations */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Locations
            </h4>
            <ul className="space-y-1.5 grid grid-cols-2 gap-x-2">
              {CITIES.map((city) => (
                <li key={city}>
                  <button
                    onClick={() => onCityClick(city)}
                    className="hover:text-amber-400 transition-colors text-left cursor-pointer truncate"
                  >
                    {city}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Uttarakhand Gateways. All Rights Reserved. Rishikesh, Uttarakhand.
          </div>
          
          <div className="flex items-center gap-4 text-slate-400">
            <span>Freehold Uttarakhand Registry</span>
            <span>•</span>
            <span className="text-amber-400">Jai Badri Vishal · Jai Baba Kedar</span>
          </div>
        </div>

      </div>

    </footer>
  );
};
