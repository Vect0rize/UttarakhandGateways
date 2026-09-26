import React, { useState } from 'react';
import { 
  Calculator, 
  ArrowRightLeft, 
  X
} from 'lucide-react';

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
  region: 'Uttarakhand Hill Standard' | 'National / North India' | 'Standard Metric';
}

export const LAND_UNITS: UnitInfo[] = [
  {
    key: 'nali',
    label: 'Nali (नाली)',
    hindiLabel: 'नाली',
    sqFtMultiplier: 2160,
    description: 'Iconic Uttarakhand hill measurement. 1 Nali = 2,160 sq.ft = 240 Gaj = 16 Mutthi',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'sqft',
    label: 'Square Feet (sq.ft)',
    hindiLabel: 'वर्ग फुट',
    sqFtMultiplier: 1,
    description: 'Standard global residential unit for flats, villas, and floor areas.',
    region: 'Standard Metric',
  },
  {
    key: 'gaj',
    label: 'Gaj / Sq. Yards (गज)',
    hindiLabel: 'गज',
    sqFtMultiplier: 9,
    description: '1 Gaj = 9 sq.ft. Most popular plot unit in Dehradun, Haridwar & plains.',
    region: 'National / North India',
  },
  {
    key: 'mutthi',
    label: 'Mutthi (मुट्ठी)',
    hindiLabel: 'मुट्ठी',
    sqFtMultiplier: 135,
    description: 'Traditional hill subdivision. 16 Mutthi = 1 Nali. 1 Mutthi = 135 sq.ft = 15 Gaj.',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'bigha_uk',
    label: 'Uttarakhand Bigha (पहाड़ी बीघा)',
    hindiLabel: 'पहाड़ी बीघा',
    sqFtMultiplier: 6804,
    description: 'Official Uttarakhand revenue Bigha = 3.15 Nali = 6,804 sq.ft = 756 Gaj.',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'bigha_pucca',
    label: 'Pucca Bigha (पक्का बीघा)',
    hindiLabel: 'पक्का बीघा',
    sqFtMultiplier: 27225,
    description: 'Standard plains Bigha = 3,025 Gaj = 27,225 sq.ft (~12.6 Nali).',
    region: 'National / North India',
  },
  {
    key: 'bigha_kaccha',
    label: 'Kaccha Bigha (कच्चा बीघा)',
    hindiLabel: 'कच्चा बीघा',
    sqFtMultiplier: 9075,
    description: 'Used in parts of western UP/Haridwar plains = 1,008.33 Gaj = 9,075 sq.ft.',
    region: 'National / North India',
  },
  {
    key: 'biswa_uk',
    label: 'Biswa Uttarakhand (बिस्वा)',
    hindiLabel: 'बिस्वा',
    sqFtMultiplier: 340.2,
    description: '1/20th of a hill Bigha = 340.2 sq.ft = 37.8 Gaj (~2.52 Mutthi).',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'biswansi',
    label: 'Biswansi / Unsi (बिस्वांसी)',
    hindiLabel: 'बिस्वांसी',
    sqFtMultiplier: 17.01,
    description: 'Micro revenue measurement = 1/20th of a Biswa = 17.01 sq.ft.',
    region: 'Uttarakhand Hill Standard',
  },
  {
    key: 'acre',
    label: 'Acre (एकड़)',
    hindiLabel: 'एकड़',
    sqFtMultiplier: 43560,
    description: 'International land measure = 43,560 sq.ft = 4,840 Gaj = 20.166 Nali.',
    region: 'Standard Metric',
  },
  {
    key: 'hectare',
    label: 'Hectare (हेक्टेयर)',
    hindiLabel: 'हेक्टेयर',
    sqFtMultiplier: 107639,
    description: 'Metric revenue unit = 10,000 sq.m = 107,639 sq.ft = 49.83 Nali = 2.471 Acres.',
    region: 'Standard Metric',
  },
  {
    key: 'sqm',
    label: 'Square Meter (sq.m)',
    hindiLabel: 'वर्ग मीटर',
    sqFtMultiplier: 10.7639,
    description: '1 sq.m = 10.7639 sq.ft = 1.196 Gaj.',
    region: 'Standard Metric',
  },
  {
    key: 'guntha',
    label: 'Guntha (गुंठा)',
    hindiLabel: 'गुंठा',
    sqFtMultiplier: 1089,
    description: '1 Guntha = 1,089 sq.ft = 121 Gaj.',
    region: 'National / North India',
  },
  {
    key: 'kanal',
    label: 'Kanal (कनाल)',
    hindiLabel: 'कनाल',
    sqFtMultiplier: 5445,
    description: 'North Indian unit = 5,445 sq.ft = 605 Gaj = 2.52 Nali.',
    region: 'National / North India',
  },
  {
    key: 'marla',
    label: 'Marla (मरला)',
    hindiLabel: 'मरला',
    sqFtMultiplier: 272.25,
    description: '1/20th of a Kanal = 272.25 sq.ft = 30.25 Gaj.',
    region: 'National / North India',
  },
  {
    key: 'biswa_pucca',
    label: 'Pucca Biswa (पक्का बिस्वा)',
    hindiLabel: 'पक्का बिस्वा',
    sqFtMultiplier: 1361.25,
    description: '1/20th of a Pucca Bigha = 1,361.25 sq.ft = 151.25 Gaj.',
    region: 'National / North India',
  },
  {
    key: 'cent',
    label: 'Cent (सेंट)',
    hindiLabel: 'सेंट',
    sqFtMultiplier: 435.6,
    description: 'Common plot measure = 435.6 sq.ft = 1/100 of an Acre.',
    region: 'Standard Metric',
  },
  {
    key: 'ground',
    label: 'Ground (ग्राउंड)',
    hindiLabel: 'ग्राउंड',
    sqFtMultiplier: 2400,
    description: '1 Ground = 2,400 sq.ft (~266.67 Gaj).',
    region: 'Standard Metric',
  },
  {
    key: 'katha',
    label: 'Katha (कट्ठा)',
    hindiLabel: 'कट्ठा',
    sqFtMultiplier: 1361.25,
    description: '1 Katha = 1,361.25 sq.ft (~151.25 Gaj).',
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
    <div className={`w-full bg-white dark:bg-slate-900 rounded-3xl border border-sky-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col ${isModal ? 'max-h-[90vh]' : 'my-4'}`}>
      
      {/* Top Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 text-white flex items-center justify-between border-b border-sky-800/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-lg shadow-sky-500/25 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                UKG Land Calculator
              </h2>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Any Unit ↔ Any Unit
              </span>
            </div>
            <p className="text-xs text-sky-200/70">
              Convert Nali, Gaj, Sq.Ft, Bigha, Mutthi, Biswa, Acres and more
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close calculator"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* LAND UNIT CONVERTER */}
      <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
        {/* Interactive Dual Converter Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-sky-50 via-slate-50 to-blue-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800 border border-sky-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            
            {/* FROM SECTION */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Enter Quantity:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={inputValue || ''}
                  onChange={(e) => setInputValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-1/2 px-3 py-2.5 text-base font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="1"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value as LandUnitKey)}
                  className="w-1/2 px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  {LAND_UNITS.map((u) => (
                    <option key={u.key} value={u.key}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {fromUnitObj.description}
              </p>
            </div>

            {/* SWAP BUTTON */}
            <div className="flex justify-center items-center py-2 md:py-0">
              <button
                type="button"
                onClick={handleSwapUnits}
                className="p-3 rounded-full bg-white dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-slate-600 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-slate-600 shadow-md hover:rotate-180 transition-all cursor-pointer"
                title="Swap From and To units"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            {/* TO SECTION */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Converted Result in:
              </label>
              <div className="flex gap-2">
                <div className="w-1/2 px-3 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-extrabold text-base flex items-center justify-between">
                  <span className="truncate">
                    {convertedResult < 0.001 && convertedResult > 0 
                      ? convertedResult.toExponential(4) 
                      : Number(convertedResult.toFixed(4)).toLocaleString('en-IN')}
                  </span>
                </div>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value as LandUnitKey)}
                  className="w-1/2 px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  {LAND_UNITS.map((u) => (
                    <option key={u.key} value={u.key}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                {toUnitObj.description}
              </p>
            </div>

          </div>

          {/* Direct conversion summary sentence */}
          <div className="mt-4 pt-3 border-t border-sky-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 dark:text-slate-300 gap-1">
            <span className="font-semibold">
              Formula: <span className="font-mono text-sky-700 dark:text-sky-400">{inputValue} {fromUnitObj.label}</span> = <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{Number(convertedResult.toFixed(4)).toLocaleString('en-IN')} {toUnitObj.label}</span>
            </span>
            <span className="text-[11px] text-slate-500">
              1 {fromUnitObj.hindiLabel} = {(fromUnitObj.sqFtMultiplier / toUnitObj.sqFtMultiplier).toFixed(4)} {toUnitObj.hindiLabel}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
