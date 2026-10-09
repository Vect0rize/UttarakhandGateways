import React, { useState } from 'react';
import { 
  Calculator, 
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
  | 'biswa_pucca'
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

interface UnitInfo {
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
    description: 'Iconic Uttarakhand hill measurement. 1 Nali = 2,160 sq.ft = 240 Gaj = 16 Mutthi',
    hindiDescription: 'उत्तराखंड की प्रसिद्ध पर्वतीय इकाई। 1 नाली = 2,160 वर्ग फुट = 240 गज = 16 मुट्ठी',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'sqft',
    label: 'Square Feet (वर्ग फुट)',
    hindiLabel: 'वर्ग फुट',
    sqFtMultiplier: 1,
    description: 'Standard global residential unit for flats, villas, and floor areas.',
    hindiDescription: 'फ्लैट, विला व कारपेट एरिया के लिए वैश्विक मानक इकाई।',
    region: 'Standard Metric',
  },
  {
    key: 'gaj',
    label: 'Gaj / Sq. Yards (गज)',
    hindiLabel: 'गज (वर्ग गज)',
    sqFtMultiplier: 9,
    description: '1 Gaj = 9 sq.ft. Most popular plot unit in Dehradun, Haridwar & plains.',
    hindiDescription: '1 गज = 9 वर्ग फुट। देहरादून, हरिद्वार व मैदानी इलाकों में सबसे लोकप्रिय प्लॉट इकाई।',
    region: 'National / North India',
  },
  {
    key: 'mutthi',
    label: 'Mutthi (मुट्ठी)',
    hindiLabel: 'मुट्ठी',
    sqFtMultiplier: 135,
    description: 'Traditional hill subdivision. 16 Mutthi = 1 Nali. 1 Mutthi = 135 sq.ft = 15 Gaj.',
    hindiDescription: 'पारंपरिक पर्वतीय उप-इकाई। 16 मुट्ठी = 1 नाली। 1 मुट्ठी = 135 वर्ग फुट = 15 गज।',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'bigha_uk',
    label: 'Uttarakhand Bigha (पहाड़ी बीघा)',
    hindiLabel: 'पहाड़ी बीघा',
    sqFtMultiplier: 6804,
    description: 'Official Uttarakhand revenue Bigha = 3.15 Nali = 6,804 sq.ft = 756 Gaj.',
    hindiDescription: 'उत्तराखंड राजस्व बीघा = 3.15 नाली = 6,804 वर्ग फुट = 756 गज।',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'bigha_pucca',
    label: 'Pucca Bigha (पक्का बीघा)',
    hindiLabel: 'पक्का बीघा',
    sqFtMultiplier: 27225,
    description: 'Standard plains Bigha = 3,025 Gaj = 27,225 sq.ft (~12.6 Nali).',
    hindiDescription: 'मैदानी पक्का बीघा = 3,025 गज = 27,225 वर्ग फुट (~12.6 नाली)।',
    region: 'National / North India',
  },
  {
    key: 'bigha_kaccha',
    label: 'Kaccha Bigha (कच्चा बीघा)',
    hindiLabel: 'कच्चा बीघा',
    sqFtMultiplier: 9075,
    description: 'Used in parts of western UP/Haridwar plains = 1,008.33 Gaj = 9,075 sq.ft.',
    hindiDescription: 'हरिद्वार मैदानों में प्रयुक्त = 1,008.33 गज = 9,075 वर्ग फुट।',
    region: 'National / North India',
  },
  {
    key: 'biswa_uk',
    label: 'Biswa Uttarakhand (बिस्वा)',
    hindiLabel: 'बिस्वा',
    sqFtMultiplier: 340.2,
    description: '1/20th of a hill Bigha = 340.2 sq.ft = 37.8 Gaj (~2.52 Mutthi).',
    hindiDescription: 'पहाड़ी बीघा का 20वां हिस्सा = 340.2 वर्ग फुट = 37.8 गज।',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'biswansi',
    label: 'Biswansi / Unsi (बिस्वांसी)',
    hindiLabel: 'बिस्वांसी',
    sqFtMultiplier: 17.01,
    description: 'Micro revenue measurement = 1/20th of a Biswa = 17.01 sq.ft.',
    hindiDescription: 'सूक्ष्म राजस्व माप = बिस्वा का 20वां भाग = 17.01 वर्ग फुट।',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'acre',
    label: 'Acre (एकड़)',
    hindiLabel: 'एकड़',
    sqFtMultiplier: 43560,
    description: 'International land measure = 43,560 sq.ft = 4,840 Gaj = 20.166 Nali.',
    hindiDescription: 'अंतर्राष्ट्रीय माप = 43,560 वर्ग फुट = 4,840 गज = 20.166 नाली।',
    region: 'Standard Metric',
  },
  {
    key: 'hectare',
    label: 'Hectare (हेक्टेयर)',
    hindiLabel: 'हेक्टेयर',
    sqFtMultiplier: 107639,
    description: 'Metric revenue unit = 10,000 sq.m = 107,639 sq.ft = 49.83 Nali = 2.471 Acres.',
    hindiDescription: 'मीट्रिक राजस्व इकाई = 10,000 वर्ग मीटर = 107,639 वर्ग फुट = 49.83 नाली।',
    region: 'Standard Metric',
  },
  {
    key: 'sqm',
    label: 'Square Meter (वर्ग मीटर)',
    hindiLabel: 'वर्ग मीटर',
    sqFtMultiplier: 10.7639,
    description: '1 sq.m = 10.7639 sq.ft = 1.196 Gaj.',
    hindiDescription: '1 वर्ग मीटर = 10.7639 वर्ग फुट = 1.196 गज।',
    region: 'Standard Metric',
  },
  {
    key: 'guntha',
    label: 'Guntha (गुंठा)',
    hindiLabel: 'गुंठा',
    sqFtMultiplier: 1089,
    description: '1 Guntha = 1,089 sq.ft = 121 Gaj.',
    hindiDescription: '1 गुंठा = 1,089 वर्ग फुट = 121 गज।',
    region: 'National / North India',
  },
  {
    key: 'kanal',
    label: 'Kanal (कनाल)',
    hindiLabel: 'कनाल',
    sqFtMultiplier: 5445,
    description: '1 Kanal = 5,445 sq.ft = 605 Gaj (~2.52 Nali).',
    hindiDescription: '1 कनाल = 5,445 वर्ग फुट = 605 गज (~2.52 नाली)।',
    region: 'National / North India',
  },
  {
    key: 'marla',
    label: 'Marla (मरला)',
    hindiLabel: 'मरला',
    sqFtMultiplier: 272.25,
    description: '1 Marla = 272.25 sq.ft = 30.25 Gaj.',
    hindiDescription: '1 मरला = 272.25 वर्ग फुट = 30.25 गज।',
    region: 'National / North India',
  },
  {
    key: 'cent',
    label: 'Cent (सेंट)',
    hindiLabel: 'सेंट',
    sqFtMultiplier: 435.6,
    description: '1 Cent = 435.6 sq.ft (~48.4 Gaj).',
    hindiDescription: '1 सेंट = 435.6 वर्ग फुट (~48.4 गज)।',
    region: 'Standard Metric',
  },
  {
    key: 'ground',
    label: 'Ground (ग्राउंड)',
    hindiLabel: 'ग्राउंड',
    sqFtMultiplier: 2400,
    description: '1 Ground = 2,400 sq.ft (~266.67 Gaj).',
    hindiDescription: '1 ग्राउंड = 2,400 वर्ग फुट (~266.67 गज)।',
    region: 'Standard Metric',
  },
  {
    key: 'katha',
    label: 'Katha (कट्ठा)',
    hindiLabel: 'कट्ठा',
    sqFtMultiplier: 1361.25,
    description: '1 Katha = 1,361.25 sq.ft (~151.25 Gaj).',
    hindiDescription: '1 कट्ठा = 1,361.25 वर्ग फुट (~151.25 गज)।',
    region: 'National / North India',
  },
];

interface PropertyCalculatorProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const PropertyCalculator: React.FC<PropertyCalculatorProps> = ({ 
  onClose, 
  isModal = false 
}) => {
  const { isHindi } = useLanguage();

  // LAND CONVERTER STATE
  const [inputValue, setInputValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<LandUnitKey>('nali');
  const [toUnit, setToUnit] = useState<LandUnitKey>('gaj');

  // Convert any unit to sq.ft base
  const fromUnitObj = LAND_UNITS.find((u) => u.key === fromUnit) || LAND_UNITS[0];
  const toUnitObj = LAND_UNITS.find((u) => u.key === toUnit) || LAND_UNITS[1];

  const currentSqFtBase = (inputValue || 0) * fromUnitObj.sqFtMultiplier;
  const convertedResult = currentSqFtBase / toUnitObj.sqFtMultiplier;

  // Swap Units
  const handleSwapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <div className={`w-full bg-white dark:bg-[#071c14] rounded-3xl border border-emerald-200/90 dark:border-emerald-800/60 shadow-xl overflow-hidden flex flex-col ${isModal ? 'max-h-[90vh]' : 'my-4'}`}>
      
      {/* Top Header - Organized & Polished for Mobile */}
      <div className="px-4 py-3.5 sm:px-6 sm:py-4.5 bg-[#09241b] dark:bg-[#051810] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 shadow-md flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {isHindi ? 'यूकेजी भूमि कैलकुलेटर' : 'UKG Land Calculator'}
              </h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                {isHindi ? 'सभी इकाइयां ↔ सभी इकाइयां' : 'Any Unit ↔ Any Unit'}
              </span>
            </div>
            <p className="text-xs text-emerald-200/70 truncate sm:whitespace-normal mt-0.5">
              {isHindi 
                ? 'नाली, गज, वर्ग फुट, बीघा, मुट्ठी, बिस्वा, एकड़ आदि का सटीक रूपांतरण' 
                : 'Convert Nali, Gaj, Sq.Ft, Bigha, Mutthi, Biswa, Acres and more'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-end sm:self-center p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close calculator"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* LAND UNIT CONVERTER BODY - Gorgeous Dark Mode Palette */}
      <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
        {/* Interactive Dual Converter Box */}
        <div className="p-4 sm:p-6 rounded-2xl bg-slate-50/90 dark:bg-[#0a271d] border border-emerald-200/90 dark:border-emerald-800/60 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            
            {/* FROM SECTION */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-emerald-200 block">
                {isHindi ? 'मात्रा दर्ज करें:' : 'Enter Quantity:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={inputValue || ''}
                  onChange={(e) => setInputValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-1/2 px-3 py-2.5 text-base font-bold rounded-xl border border-slate-300 dark:border-emerald-700/60 bg-white dark:bg-[#061811] text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  placeholder="1"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value as LandUnitKey)}
                  className="w-1/2 px-2.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-emerald-700/60 bg-white dark:bg-[#061811] text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
                >
                  {LAND_UNITS.map((u) => (
                    <option key={u.key} value={u.key} className="bg-white dark:bg-[#061811] text-slate-900 dark:text-emerald-100">
                      {isHindi ? u.hindiLabel : u.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-emerald-300/80 italic leading-snug">
                {isHindi ? fromUnitObj.hindiDescription : fromUnitObj.description}
              </p>
            </div>

            {/* SWAP BUTTON */}
            <div className="flex justify-center items-center py-1 md:py-0">
              <button
                type="button"
                onClick={handleSwapUnits}
                className="p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                title={isHindi ? 'इकाइयां आपस में बदलें' : 'Swap From and To units'}
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* TO SECTION */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-emerald-200 block">
                {isHindi ? 'रूपांतरित परिणाम:' : 'Converted Result in:'}
              </label>
              <div className="flex gap-2">
                <div className="w-1/2 px-3 py-2.5 rounded-xl border-2 border-emerald-500/50 bg-emerald-100/70 dark:bg-[#04140e] text-emerald-950 dark:text-emerald-300 font-extrabold text-base flex items-center justify-between shadow-xs">
                  <span className="truncate">
                    {convertedResult < 0.001 && convertedResult > 0 
                       ? convertedResult.toExponential(4) 
                      : Number(convertedResult.toFixed(4)).toLocaleString('en-IN')}
                  </span>
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value as LandUnitKey)}
                  className="w-1/2 px-2.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-emerald-700/60 bg-white dark:bg-[#061811] text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
                >
                  {LAND_UNITS.map((u) => (
                    <option key={u.key} value={u.key} className="bg-white dark:bg-[#061811] text-slate-900 dark:text-emerald-100">
                      {isHindi ? u.hindiLabel : u.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-emerald-300/80 italic leading-snug">
                {isHindi ? toUnitObj.hindiDescription : toUnitObj.description}
              </p>
            </div>

          </div>

          {/* Direct conversion summary sentence */}
          <div className="mt-4 pt-3 border-t border-emerald-200/80 dark:border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 dark:text-emerald-200 gap-1.5 bg-white/60 dark:bg-[#061911] p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
            <span className="font-semibold text-center sm:text-left">
              {isHindi ? 'सूत्र:' : 'Formula:'}{' '}
              <span className="font-mono text-emerald-700 dark:text-emerald-400">
                {inputValue} {isHindi ? fromUnitObj.hindiLabel : fromUnitObj.label}
              </span>{' '}
              ={' '}
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {Number(convertedResult.toFixed(4)).toLocaleString('en-IN')} {isHindi ? toUnitObj.hindiLabel : toUnitObj.label}
              </span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-emerald-400/80 font-mono">
              1 {fromUnitObj.hindiLabel} = {(fromUnitObj.sqFtMultiplier / toUnitObj.sqFtMultiplier).toFixed(4)} {toUnitObj.hindiLabel}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
