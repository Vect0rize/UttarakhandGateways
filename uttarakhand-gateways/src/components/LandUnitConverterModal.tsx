import React, { useState } from 'react';
import { X, Compass, ArrowRightLeft, Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0d1722] border border-amber-400/30 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Uttarakhand Land Unit Converter
              </h2>
              <p className="text-xs text-slate-400">
                Nali ↔ Sq. Feet ↔ Gaj (Sq. Yards) ↔ Bigha ↔ Acres
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Converter Form */}
        <div className="p-6 space-y-5">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Enter Value
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full bg-slate-950/80 border border-white/15 text-white text-base font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                From Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full bg-slate-950/80 border border-white/15 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-400"
              >
                <option value="nali">Nali (नाली)</option>
                <option value="gaj">Gaj / Sq. Yards</option>
                <option value="sqft">Sq. Feet</option>
                <option value="sqmtr">Sq. Meters</option>
                <option value="bigha">Bigha (Uttarakhand)</option>
                <option value="acre">Acres</option>
              </select>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span>Quick Presets:</span>
            <button
              onClick={() => { setValue(1); setUnit('nali'); }}
              className="bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-amber-300 border border-white/10"
            >
              1 Nali
            </button>
            <button
              onClick={() => { setValue(250); setUnit('sqmtr'); }}
              className="bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-emerald-300 border border-white/10"
            >
              250 Sq. Mtr (Section 154 Limit)
            </button>
            <button
              onClick={() => { setValue(200); setUnit('gaj'); }}
              className="bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded text-slate-300 border border-white/10"
            >
              200 Gaj Plot
            </button>
          </div>

          {/* Output Results Grid */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Equivalent Measurements:
            </span>

            <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
              
              <div className="p-3 bg-slate-950/70 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block font-sans">Nali (नाली)</span>
                <span className="text-base font-bold text-amber-400">{naliVal} Nali</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block font-sans">Gaj (Sq. Yards)</span>
                <span className="text-base font-bold text-white">{gajVal} Gaj</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block font-sans">Square Feet</span>
                <span className="text-base font-bold text-white">{sqftVal} sq.ft</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block font-sans">Square Meters</span>
                <span className="text-base font-bold text-emerald-400">{sqmtrVal} sq.m</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block font-sans">Bigha (UK Hill)</span>
                <span className="text-base font-bold text-white">{bighaVal} Bigha</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-white/10">
                <span className="text-[11px] text-slate-400 block font-sans">Acres</span>
                <span className="text-base font-bold text-white">{acreVal} Acres</span>
              </div>

            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
            ℹ️ In Uttarakhand revenue terminology, <strong>1 Nali is exactly equal to 2,160 square feet (240 Gaj)</strong> and is subdivided into 16 Mutthi (मुट्ठी). 1 Mutthi = 135 sq.ft.
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
          >
            Close Converter
          </button>
        </div>

      </div>
    </div>
  );
};
