import React, { useState } from 'react';
import { X, Compass } from 'lucide-react';

interface LandUnitConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LandUnitConverterModal: React.FC<LandUnitConverterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [value, setValue] = useState<number>(1);
  const [unit, setUnit] = useState<'nali' | 'sqft' | 'gaj' | 'bigha' | 'sqmtr' | 'acre'>('nali');

  if (!isOpen) return null;

  // Conversion to Sq. Feet as standard base:
  // 1 Nali = 2160 sqft
  // 1 Gaj = 9 sqft
  // 1 Bigha (UK) = 6804 sqft
  // 1 Sq Mtr = 10.7639 sqft
  // 1 Acre = 43560 sqft
  const toSqFt = (val: number, fromUnit: string): number => {
    switch (fromUnit) {
      case 'nali': return val * 2160;
      case 'sqft': return val;
      case 'gaj': return val * 9;
      case 'bigha': return val * 6804;
      case 'sqmtr': return val * 10.7639;
      case 'acre': return val * 43560;
      default: return val;
    }
  };

  const sqFtBase = toSqFt(value, unit);

  const naliVal = (sqFtBase / 2160).toFixed(3);
  const gajVal = (sqFtBase / 9).toFixed(1);
  const sqftVal = Math.round(sqFtBase).toLocaleString('en-IN');
  const bighaVal = (sqFtBase / 6804).toFixed(3);
  const sqmtrVal = (sqFtBase / 10.7639).toFixed(2);
  const acreVal = (sqFtBase / 43560).toFixed(4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-sky-100 dark:border-slate-800 bg-sky-50/80 dark:bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Uttarakhand Land Unit Converter
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nali ↔ Sq. Feet ↔ Gaj (Sq. Yards) ↔ Bigha ↔ Acres
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-sky-200 dark:border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Input Section */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-sky-900 dark:text-sky-400">
              Enter Land Measurement
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={value || ''}
                onChange={(e) => setValue(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-sky-50/50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800"
                placeholder="1"
              />

              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full bg-sky-50/50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 rounded-xl px-3 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="nali">Nali (Uttarakhand)</option>
                <option value="sqft">Sq. Feet (sq.ft)</option>
                <option value="gaj">Gaj (Sq. Yards)</option>
                <option value="bigha">Bigha (Pukka UK)</option>
                <option value="sqmtr">Square Meters</option>
                <option value="acre">Acres</option>
              </select>
            </div>
          </div>

          {/* Real-time Output Grid */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Equivalent Units in Uttarakhand
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              
              <div className="p-3 rounded-xl bg-sky-50/80 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700">
                <span className="text-[10px] text-sky-800 dark:text-sky-400 font-bold uppercase tracking-wider block">
                  NALI (Traditional)
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-serif-luxury">
                  {naliVal} Nali
                </span>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/80 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700">
                <span className="text-[10px] text-sky-800 dark:text-sky-400 font-bold uppercase tracking-wider block">
                  SQUARE FEET
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-serif-luxury">
                  {sqftVal} sq.ft
                </span>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/80 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700">
                <span className="text-[10px] text-sky-800 dark:text-sky-400 font-bold uppercase tracking-wider block">
                  GAJ (Sq. Yards)
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-serif-luxury">
                  {gajVal} Gaj
                </span>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/80 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700">
                <span className="text-[10px] text-sky-800 dark:text-sky-400 font-bold uppercase tracking-wider block">
                  BIGHA (UK)
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-serif-luxury">
                  {bighaVal} Bigha
                </span>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/80 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700">
                <span className="text-[10px] text-sky-800 dark:text-sky-400 font-bold uppercase tracking-wider block">
                  SQ. METERS
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-serif-luxury">
                  {sqmtrVal} sq.m
                </span>
              </div>

              <div className="p-3 rounded-xl bg-sky-50/80 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700">
                <span className="text-[10px] text-sky-800 dark:text-sky-400 font-bold uppercase tracking-wider block">
                  ACRES
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-serif-luxury">
                  {acreVal} Acres
                </span>
              </div>

            </div>
          </div>

          {/* Uttarakhand Rule Reminder */}
          <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            💡 <strong>Uttarakhand Non-Domicile Land Law Rule:</strong> Indian citizens residing outside Uttarakhand can purchase up to <strong>250 sq. meters (~2,690 sq.ft or ~1.25 Nali)</strong> of residential agricultural land without prior state government permission. Plots within municipal limits (MDDA/HRDA) have no area ceiling.
          </div>

        </div>

      </div>
    </div>
  );
};
