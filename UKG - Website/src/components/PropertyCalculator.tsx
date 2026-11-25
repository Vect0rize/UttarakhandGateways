import React, { useState } from 'react';
import { 
  Compass, 
  ArrowRightLeft, 
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type LandUnitKey = 
  | 'sqft' 
  | 'gaj' 
  | 'nali' 
  | 'mutthi' 
  | 'bigha_uk' 
  | 'bigha_pucca' 
  | 'bigha_kaccha' 
  | 'biswa_uk' 
  | 'biswansi'
  | 'acre' 
  | 'hectare' 
  | 'sqm' 
  | 'guntha' 
  | 'kanal' 
  | 'marla'
  | 'cent'
  | 'ground'
  | 'katha';

export interface UnitInfo {
  key: LandUnitKey;
  label: string;
  hindiLabel: string;
  sqFtMultiplier: number; // 1 unit in sq.ft
  description: string;
  hindiDescription: string;
  region: 'Uttarakhand Hill Standard' | 'National / North India' | 'Standard Metric';
}

export const LAND_UNITS: UnitInfo[] = [
  {
    key: 'nali',
    label: 'Nali (नाली)',
    hindiLabel: 'नाली',
    sqFtMultiplier: 2160,
    description: '1 Nali = 2,160 sq.ft = 240 Gaj = 16 Mutthi',
    hindiDescription: '1 नाली = 2,160 वर्ग फुट = 240 गज = 16 मुट्ठी',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'mutthi',
    label: 'Mutthi (मुट्ठी)',
    hindiLabel: 'मुट्ठी',
    sqFtMultiplier: 135,
    description: '16 Mutthi = 1 Nali. 1 Mutthi = 135 sq.ft = 15 Gaj',
    hindiDescription: '16 मुट्ठी = 1 नाली। 1 मुट्ठी = 135 वर्ग फुट = 15 गज',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'gaj',
    label: 'Gaj / Sq. Yards (गज)',
    hindiLabel: 'गज (वर्ग गज)',
    sqFtMultiplier: 9,
    description: '1 Gaj = 9 sq.ft = 0.836 sq.m. Standard plot unit in Dehradun & plains',
    hindiDescription: '1 गज = 9 वर्ग फुट = 0.836 वर्ग मीटर। मैदानी व शहरी प्लॉट माप',
    region: 'National / North India',
  },
  {
    key: 'sqft',
    label: 'Square Feet (वर्ग फुट)',
    hindiLabel: 'वर्ग फुट',
    sqFtMultiplier: 1,
    description: 'Standard global unit for carpet area, villas, and apartments',
    hindiDescription: 'फ्लैट, विला व कारपेट एरिया के लिए मानक इकाई',
    region: 'Standard Metric',
  },
  {
    key: 'bigha_uk',
    label: 'Uttarakhand Bigha (पहाड़ी बीघा)',
    hindiLabel: 'पहाड़ी बीघा',
    sqFtMultiplier: 6804,
    description: 'Uttarakhand revenue Bigha = 3.15 Nali = 6,804 sq.ft = 756 Gaj',
    hindiDescription: 'उत्तराखंड राजस्व बीघा = 3.15 नाली = 6,804 वर्ग फुट = 756 गज',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'bigha_pucca',
    label: 'Pucca Bigha (पक्का बीघा)',
    hindiLabel: 'पक्का बीघा',
    sqFtMultiplier: 27225,
    description: 'Plains standard Bigha = 3,025 Gaj = 27,225 sq.ft (~12.6 Nali)',
    hindiDescription: 'मैदानी पक्का बीघा = 3,025 गज = 27,225 वर्ग फुट (~12.6 नाली)',
    region: 'National / North India',
  },
  {
    key: 'bigha_kaccha',
    label: 'Kaccha Bigha (कच्चा बीघा)',
    hindiLabel: 'कच्चा बीघा',
    sqFtMultiplier: 9075,
    description: '1 Kaccha Bigha = 1,008.33 Gaj = 9,075 sq.ft (~4.2 Nali)',
    hindiDescription: '1 कच्चा बीघा = 1,008.33 गज = 9,075 वर्ग फुट (~4.2 नाली)',
    region: 'National / North India',
  },
  {
    key: 'biswa_uk',
    label: 'Biswa UK (पहाड़ी बिस्वा)',
    hindiLabel: 'पहाड़ी बिस्वा',
    sqFtMultiplier: 340.2,
    description: '1/20th of a hill Bigha = 340.2 sq.ft = 37.8 Gaj (~2.52 Mutthi)',
    hindiDescription: 'पहाड़ी बीघा का 20वां हिस्सा = 340.2 वर्ग फुट = 37.8 गज',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'biswansi',
    label: 'Biswansi (बिस्वांसी)',
    hindiLabel: 'बिस्वांसी',
    sqFtMultiplier: 17.01,
    description: '1/20th of a Biswa = 17.01 sq.ft',
    hindiDescription: 'बिस्वा का 20वां भाग = 17.01 वर्ग फुट',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'acre',
    label: 'Acre (एकड़)',
    hindiLabel: 'एकड़',
    sqFtMultiplier: 43560,
    description: '1 Acre = 43,560 sq.ft = 4,840 Gaj = 20.166 Nali',
    hindiDescription: '1 एकड़ = 43,560 वर्ग फुट = 4,840 गज = 20.166 नाली',
    region: 'Standard Metric',
  },
  {
    key: 'hectare',
    label: 'Hectare (हेक्टेयर)',
    hindiLabel: 'हेक्टेयर',
    sqFtMultiplier: 107639,
    description: '1 Hectare = 10,000 sq.m = 107,639 sq.ft = 49.83 Nali',
    hindiDescription: '1 हेक्टेयर = 10,000 वर्ग मीटर = 107,639 वर्ग फुट = 49.83 नाली',
    region: 'Standard Metric',
  },
  {
    key: 'sqm',
    label: 'Square Meter (वर्ग मीटर)',
    hindiLabel: 'वर्ग मीटर',
    sqFtMultiplier: 10.7639,
    description: '1 sq.m = 10.7639 sq.ft = 1.196 Gaj',
    hindiDescription: '1 वर्ग मीटर = 10.7639 वर्ग फुट = 1.196 गज',
    region: 'Standard Metric',
  },
  {
    key: 'guntha',
    label: 'Guntha (गुंठा)',
    hindiLabel: 'गुंठा',
    sqFtMultiplier: 1089,
    description: '1 Guntha = 1,089 sq.ft = 121 Gaj',
    hindiDescription: '1 गुंठा = 1,089 वर्ग फुट = 121 गज',
    region: 'National / North India',
  },
  {
    key: 'kanal',
    label: 'Kanal (कनाल)',
    hindiLabel: 'कनाल',
    sqFtMultiplier: 5445,
    description: '1 Kanal = 5,445 sq.ft = 605 Gaj (~2.52 Nali)',
    hindiDescription: '1 कनाल = 5,445 वर्ग फुट = 605 गज (~2.52 नाली)',
    region: 'National / North India',
  },
  {
    key: 'marla',
    label: 'Marla (मरला)',
    hindiLabel: 'मरला',
    sqFtMultiplier: 272.25,
    description: '1 Marla = 272.25 sq.ft = 30.25 Gaj',
    hindiDescription: '1 मरला = 272.25 वर्ग फुट = 30.25 गज',
    region: 'National / North India',
  },
  {
    key: 'cent',
    label: 'Cent (सेंट)',
    hindiLabel: 'सेंट',
    sqFtMultiplier: 435.6,
    description: '1 Cent = 435.6 sq.ft (~48.4 Gaj)',
    hindiDescription: '1 सेंट = 435.6 वर्ग फुट (~48.4 गज)',
    region: 'Standard Metric',
  },
  {
    key: 'ground',
    label: 'Ground (ग्राउंड)',
    hindiLabel: 'ग्राउंड',
    sqFtMultiplier: 2400,
    description: '1 Ground = 2,400 sq.ft (~266.67 Gaj)',
    hindiDescription: '1 ग्राउंड = 2,400 वर्ग फुट (~266.67 गज)',
    region: 'Standard Metric',
  },
  {
    key: 'katha',
    label: 'Katha (कट्ठा)',
    hindiLabel: 'कट्ठा',
    sqFtMultiplier: 1361.25,
    description: '1 Katha = 1,361.25 sq.ft (~151.25 Gaj)',
    hindiDescription: '1 कट्ठा = 1,361.25 वर्ग फुट (~151.25 गज)',
    region: 'National / North India',
  },
];

export interface PropertyCalculatorProps {
  onClose?: () => void;
  isModal?: boolean;
  initialMode?: string;
}

export const PropertyCalculator: React.FC<PropertyCalculatorProps> = ({ 
  onClose, 
  isModal = false
}) => {
  const { isHindi } = useLanguage();

  // Unit Converter State
  const [inputValue, setInputValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<LandUnitKey>('nali');
  const [toUnit, setToUnit] = useState<LandUnitKey>('gaj');

  // Unit calculations
  const fromUnitObj = LAND_UNITS.find((u) => u.key === fromUnit) || LAND_UNITS[0];
  const toUnitObj = LAND_UNITS.find((u) => u.key === toUnit) || LAND_UNITS[1];

  const currentSqFtBase = (inputValue || 0) * fromUnitObj.sqFtMultiplier;
  const convertedResult = currentSqFtBase / toUnitObj.sqFtMultiplier;

  const handleInputQuantityChange = (nextQty: number) => {
    setInputValue(nextQty);
  };

  // Swap Units
  const handleSwapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <div className={`w-full bg-white dark:bg-[#071f16] rounded-3xl border border-emerald-200/90 dark:border-emerald-800/80 shadow-xl overflow-hidden flex flex-col transition-colors duration-300 ${isModal ? 'max-h-[90vh]' : 'my-4'}`}>
      
      {/* Top Header - Responsive Uttarakhand Land Theme */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-[#092b20] via-[#0b3829] to-[#07241a] text-white flex items-start sm:items-center justify-between gap-3 border-b border-emerald-800/60 flex-shrink-0">
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-100" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-serif-luxury break-words">
                {isHindi ? 'उत्तराखंड भूमि कैलकुलेटर' : 'Uttarakhand Land Calculator'}
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/30">
                Nali • Gaj • Sq.Ft • Bigha
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-200/80 leading-snug break-words mt-0.5">
              {isHindi 
                ? 'उत्तराखंड की पहाड़ी (नाली, मुट्ठी, बीघा) व मैदानी इकाइयों का त्वरित सटीक रूपांतरण' 
                : 'Instant, precise conversion for Uttarakhand hill & plains land measurements'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close calculator"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* Main Land Converter - Mobile Responsive & Zero Overflow */}
      <div className="p-3.5 sm:p-6 md:p-7 space-y-5 overflow-x-hidden">
        <div className="p-3.5 sm:p-6 rounded-2xl bg-slate-50/90 dark:bg-[#08281d] border border-emerald-200/90 dark:border-emerald-800/70 shadow-xs min-w-0">
          
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 sm:gap-5 items-center min-w-0">
            
            {/* FROM SECTION — Unified Amount + Unit Box */}
            <div className="lg:col-span-5 space-y-2 min-w-0">
              <label className="text-xs font-bold text-slate-700 dark:text-emerald-200 block">
                {isHindi ? 'मात्रा दर्ज करें (From):' : 'Enter Quantity (From):'}
              </label>
              <div className="flex items-stretch w-full min-w-0 rounded-xl border border-slate-300 dark:border-emerald-700/70 bg-white dark:bg-[#04160f] focus-within:ring-2 focus-within:ring-emerald-500 shadow-xs overflow-hidden">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={inputValue || ''}
                  onWheel={(e) => e.currentTarget.blur()}
                  onChange={(e) => handleInputQuantityChange(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="flex-1 min-w-0 px-3.5 py-2.5 sm:py-3 text-base font-black bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  placeholder="1"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value as LandUnitKey)}
                  aria-label="From unit"
                  className="shrink-0 max-w-[54%] px-3 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-l border-slate-200 dark:border-emerald-800/80 bg-slate-50/80 dark:bg-[#07241a] text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {LAND_UNITS.map((u) => (
                    <option key={u.key} value={u.key} className="bg-white dark:bg-[#04160f] text-slate-900 dark:text-white">
                      {isHindi ? u.hindiLabel : u.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-emerald-300/80 italic leading-snug break-words">
                {isHindi ? fromUnitObj.hindiDescription : fromUnitObj.description}
              </p>
            </div>

            {/* SWAP BUTTON */}
            <div className="lg:col-span-1 flex justify-center items-center py-0.5 lg:py-0">
              <button
                type="button"
                onClick={handleSwapUnits}
                className="p-3 sm:p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                title={isHindi ? 'इकाइयां आपस में बदलें' : 'Swap From and To units'}
                aria-label="Swap units"
              >
                <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 rotate-90 lg:rotate-0 transition-transform" />
              </button>
            </div>

            {/* TO SECTION — Unified Converted Result + Unit Box */}
            <div className="lg:col-span-5 space-y-2 min-w-0">
              <label className="text-xs font-bold text-slate-700 dark:text-emerald-200 block">
                {isHindi ? 'रूपांतरित परिणाम (To):' : 'Converted Result (To):'}
              </label>
              <div className="flex items-stretch w-full min-w-0 rounded-xl border-2 border-emerald-500/60 bg-emerald-100/70 dark:bg-[#04140e] shadow-xs overflow-hidden">
                <div className="flex-1 min-w-0 px-3.5 py-2.5 sm:py-3 text-emerald-950 dark:text-emerald-300 font-black text-base sm:text-lg flex items-center overflow-hidden">
                  <span className="truncate block w-full">
                    {convertedResult < 0.001 && convertedResult > 0 
                      ? convertedResult.toExponential(4) 
                      : Number(convertedResult.toFixed(4)).toLocaleString('en-IN')}
                  </span>
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value as LandUnitKey)}
                  aria-label="To unit"
                  className="shrink-0 max-w-[54%] px-3 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-l border-emerald-400/50 dark:border-emerald-800/80 bg-white/90 dark:bg-[#07241a] text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {LAND_UNITS.map((u) => (
                    <option key={u.key} value={u.key} className="bg-white dark:bg-[#04160f] text-slate-900 dark:text-white">
                      {isHindi ? u.hindiLabel : u.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-emerald-300/80 italic leading-snug break-words">
                {isHindi ? toUnitObj.hindiDescription : toUnitObj.description}
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

// Also export alias LandCalculator
export const LandCalculator = PropertyCalculator;
