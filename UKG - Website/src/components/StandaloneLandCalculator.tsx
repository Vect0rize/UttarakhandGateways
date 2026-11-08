import React, { useState, useMemo } from 'react';
import { Compass, Info, ArrowRightLeft, Layers, Check, Copy } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { AREA_UNITS, AreaUnit } from '../utils/areaUnits';

interface StandaloneLandCalculatorProps {
  className?: string;
  compact?: boolean;
}

export const StandaloneLandCalculator: React.FC<StandaloneLandCalculatorProps> = ({
  className = '',
  compact = false,
}) => {
  const { isHindi } = useLanguage();
  const [inputValue, setInputValue] = useState<number>(100);
  const [selectedUnit, setSelectedUnit] = useState<AreaUnit>('gaj');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute total square feet equivalent
  const totalSqFt = useMemo(() => {
    const val = Math.max(0, inputValue || 0);
    const unitConfig = AREA_UNITS.find((u) => u.value === selectedUnit);
    const multiplier = unitConfig ? unitConfig.toSqFt : 1;
    return val * multiplier;
  }, [inputValue, selectedUnit]);

  // Convert to all major units
  const conversions = useMemo(() => {
    return AREA_UNITS.map((u) => {
      const converted = totalSqFt / u.toSqFt;
      // Format with reasonable decimal places
      let formatted: string;
      if (converted >= 1000) {
        formatted = converted.toLocaleString('en-IN', { maximumFractionDigits: 2 });
      } else if (converted >= 1) {
        formatted = converted.toLocaleString('en-IN', { maximumFractionDigits: 3 });
      } else {
        formatted = converted.toLocaleString('en-IN', { maximumFractionDigits: 4 });
      }

      return {
        unit: u.value,
        label: isHindi ? u.labelHi : u.labelEn,
        short: isHindi ? u.shortHi : u.shortEn,
        value: formatted,
        raw: converted,
        isSource: u.value === selectedUnit,
        toSqFt: u.toSqFt,
      };
    });
  }, [totalSqFt, selectedUnit, isHindi]);

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {}
  };

  const [showAllUnits, setShowAllUnits] = useState(false);

  // In compact mode, show top 6 primary units unless expanded
  const displayedConversions = useMemo(() => {
    if (!compact || showAllUnits) return conversions;
    const primaryValues = ['sqft', 'gaj', 'nali', 'mutthi', 'bigha', 'acre'];
    // Include selected unit if not in primary
    if (!primaryValues.includes(selectedUnit)) {
      primaryValues.push(selectedUnit);
    }
    return conversions.filter((c) => primaryValues.includes(c.unit));
  }, [conversions, compact, showAllUnits, selectedUnit]);

  // Compact Mobile Mode
  if (compact) {
    return (
      <section className={`w-full px-4 space-y-2.5 ${className}`}>
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif-luxury font-bold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isHindi ? 'क्षेत्रफल कैलकुलेटर' : 'Area Calculator'}</span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {isHindi ? 'नाली, गज, बीघा एवं वर्ग फुट में त्वरित रूपांतरण' : 'Instant conversion for Nali, Gaj, Bigha & Sq.Ft'}
            </p>
          </div>
        </div>

        {/* Mobile Calculator Box */}
        <div className="bg-white dark:bg-[#0a281d] rounded-2xl p-3.5 border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs space-y-3">
          {/* Input & Unit Row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                {isHindi ? 'क्षेत्रफल (Area)' : 'Enter Area'}
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={inputValue || ''}
                onChange={(e) => setInputValue(Math.max(0, Number(e.target.value)))}
                placeholder="100"
                className="w-full text-base font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                {isHindi ? 'इकाई (Unit)' : 'Source Unit'}
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value as AreaUnit)}
                className="w-full text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 px-2.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {AREA_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {isHindi ? u.labelHi : u.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Presets Scroll */}
          <div className="overflow-x-auto scrollbar-none -mx-1 px-1">
            <div className="flex items-center gap-1.5 min-w-max pb-0.5">
              {[
                { label: isHindi ? '100 गज' : '100 Gaj', val: 100, unit: 'gaj' as AreaUnit },
                { label: isHindi ? '1 नाली' : '1 Nali', val: 1, unit: 'nali' as AreaUnit },
                { label: isHindi ? '2 नाली' : '2 Nali', val: 2, unit: 'nali' as AreaUnit },
                { label: isHindi ? '1 पहाड़ी बीघा' : '1 Hill Bigha', val: 1, unit: 'bigha' as AreaUnit },
                { label: isHindi ? '1 एकड़' : '1 Acre', val: 1, unit: 'acre' as AreaUnit },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputValue(p.val);
                    setSelectedUnit(p.unit);
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    inputValue === p.val && selectedUnit === p.unit
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Conversions in 2-column mobile grid */}
          <div className="grid grid-cols-2 gap-2">
            {displayedConversions.map((conv) => (
              <div
                key={conv.unit}
                onClick={() => handleCopy(`${conv.value} ${conv.short}`, conv.unit)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
                  conv.isSource
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900/70 border-emerald-200/60 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] font-semibold truncate ${conv.isSource ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {conv.label}
                  </span>
                  {copiedKey === conv.unit ? (
                    <Check className="w-3 h-3 text-emerald-300" />
                  ) : (
                    <Copy className={`w-2.5 h-2.5 ${conv.isSource ? 'text-emerald-200' : 'text-slate-400'}`} />
                  )}
                </div>
                <div className="text-sm font-black tracking-tight mt-0.5 truncate">
                  {conv.value}
                </div>
                <span className={`text-[9px] block ${conv.isSource ? 'text-emerald-100 font-medium' : 'text-slate-400'}`}>
                  {conv.short}
                </span>
              </div>
            ))}
          </div>

          {/* Show More / Show Less Toggle */}
          <div className="text-center pt-0.5">
            <button
              type="button"
              onClick={() => setShowAllUnits((prev) => !prev)}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline active:scale-95 transition-all cursor-pointer"
            >
              {showAllUnits
                ? (isHindi ? 'कम इकाइयां देखें' : 'Show Fewer Units')
                : (isHindi ? `+ ${conversions.length - displayedConversions.length} अन्य इकाइयां (हेक्टेयर, कट्ठा, कनाल...)` : `+ ${conversions.length - displayedConversions.length} More Units (Hectare, Katha, Biswa...)`)}
            </button>
          </div>

          {/* Regional Advisory Notice */}
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-2 text-[10px] text-amber-900 dark:text-amber-200 leading-snug">
            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>{isHindi ? 'पहाड़ी मानक:' : 'Hill Land Standard:'}</strong> 1 नाली = 16 मुट्ठी = 2,160 वर्ग फुट (240 गज)। 1 पहाड़ी बीघा = 4 नाली = 8,640 वर्ग फुट (960 गज)।
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Full Desktop / Standard Mode
  return (
    <section id="land-calculator-section" className={`w-full py-12 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-xs font-bold mb-3 border border-teal-200 dark:border-teal-800">
            <Compass className="w-3.5 h-3.5" />
            <span>{isHindi ? 'भूमि क्षेत्रफल मापन' : 'Land Measurement System'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0a271c] dark:text-white font-serif-luxury tracking-tight">
            {isHindi ? 'क्षेत्रफल मापन कैलकुलेटर' : 'Area Measurement Calculator'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            {isHindi 
              ? 'उत्तराखंड की पहाड़ी इकाइयों (नाली, मुट्ठी, पहाड़ी बीघा) और राष्ट्रीय मानक इकाइयों (गज, वर्ग फुट, एकड़, हेक्टेयर) में तुरंत रूपांतरण करें।' 
              : 'Instantly convert between Uttarakhand hill measurement units (Nali, Mutthi, Hill Bigha) and standard Indian units (Gaj, Sq.Ft, Acres, Hectares).'}
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="bg-white dark:bg-[#061e16] rounded-3xl p-6 sm:p-8 lg:p-10 border border-teal-200/80 dark:border-teal-900/60 shadow-xl shadow-teal-950/5 transition-colors space-y-8">
          
          {/* Input Controls Bar */}
          <div className="bg-slate-50 dark:bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            <div className="flex-1 space-y-1.5">
              <label htmlFor="land-area-number-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                {isHindi ? 'क्षेत्रफल दर्ज करें (Enter Area Value)' : 'Enter Land Area'}
              </label>
              <div className="relative">
                <input
                  id="land-area-number-input"
                  type="number"
                  aria-label={isHindi ? 'क्षेत्रफल दर्ज करें' : 'Enter Land Area'}
                  min={0}
                  step={0.1}
                  value={inputValue}
                  onChange={(e) => setInputValue(Math.max(0, Number(e.target.value)))}
                  placeholder="e.g. 150"
                  className="w-full text-xl sm:text-2xl font-black text-slate-900 dark:text-white bg-white dark:bg-slate-950 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-center text-slate-400 px-1 pt-4 sm:pt-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>

            <div className="flex-1 space-y-1.5">
              <label htmlFor="land-unit-select-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                {isHindi ? 'इकाई चुनें (Select Source Unit)' : 'Select Unit'}
              </label>
              <select
                id="land-unit-select-input"
                aria-label={isHindi ? 'इकाई चुनें' : 'Select Unit'}
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value as AreaUnit)}
                className="w-full text-base sm:text-lg font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-950 px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all cursor-pointer"
              >
                {AREA_UNITS.map((u) => (
                  <option key={u.value} value={u.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {isHindi ? u.labelHi : u.labelEn}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
              {isHindi ? 'त्वरित चयन:' : 'Quick Presets:'}
            </span>
            {[
              { label: isHindi ? '100 गज' : '100 Gaj', val: 100, unit: 'gaj' as AreaUnit },
              { label: isHindi ? '150 गज' : '150 Gaj', val: 150, unit: 'gaj' as AreaUnit },
              { label: isHindi ? '1 नाली' : '1 Nali', val: 1, unit: 'nali' as AreaUnit },
              { label: isHindi ? '2 नाली' : '2 Nali', val: 2, unit: 'nali' as AreaUnit },
              { label: isHindi ? '1 पहाड़ी बीघा' : '1 Hill Bigha', val: 1, unit: 'bigha' as AreaUnit },
              { label: isHindi ? '1 एकड़' : '1 Acre', val: 1, unit: 'acre' as AreaUnit },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputValue(p.val);
                  setSelectedUnit(p.unit);
                }}
                className="text-xs px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/60 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Real-time Conversions Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{isHindi ? 'रूपांतरण परिणाम (Conversion Results)' : 'Equivalent Conversions'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {conversions.map((conv) => (
                <div
                  key={conv.unit}
                  className={`p-4 rounded-2xl border transition-all relative group ${
                    conv.isSource
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-700/20'
                      : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[11px] font-bold truncate ${conv.isSource ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {conv.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${conv.value} ${conv.short}`, conv.unit)}
                      title="Copy value"
                      className={`p-1 rounded-md transition-opacity opacity-0 group-hover:opacity-100 ${
                        conv.isSource ? 'hover:bg-teal-700 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {copiedKey === conv.unit ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className={`text-lg sm:text-xl font-black tracking-tight ${conv.isSource ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {conv.value}
                  </div>

                  <span className={`text-[10px] block mt-0.5 font-medium ${conv.isSource ? 'text-teal-200' : 'text-slate-400'}`}>
                    {conv.short}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Unit Advisory / Explanatory Note */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs sm:text-[13px] leading-relaxed">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                {isHindi ? 'महत्वपूर्ण क्षेत्रीय इकाई स्पष्टीकरण (Important Regional Measurement Note):' : 'Important Regional Measurement Disclaimer:'}
              </p>
              <p className="text-amber-800/90 dark:text-amber-300/90">
                {isHindi ? (
                  <>
                    <strong>बीघा (Bigha)</strong> और <strong>बिस्वा (Biswa)</strong> का मान पूरे भारत में राज्य एवं क्षेत्र अनुसार भिन्न होता है। उत्तराखंड के पहाड़ी जनपदों में <strong>1 पहाड़ी बीघा = 4 नाली = 8,640 वर्ग फुट (960 गज)</strong> होता है। जबकि मैदानी जनपदों (हरिद्वार/उधमसिंह नगर/तराई) में <strong>1 मैदानी बीघा = 27,000 वर्ग फुट (3,000 गज)</strong> माना जाता है। 1 नाली = 16 मुट्ठी = 2,160 वर्ग फुट (240 गज)।
                  </>
                ) : (
                  <>
                    Land units such as <strong>Bigha</strong> and <strong>Biswa</strong> vary by geographic region across India. In the <strong>Uttarakhand Hill Districts</strong>, 1 Hill Bigha = 4 Nali = <strong>8,640 Sq.Ft (960 Gaj)</strong>. In the <strong>Plains (Terai / Haridwar / Udham Singh Nagar)</strong>, 1 Plains Bigha is conventionally standardized at <strong>27,000 Sq.Ft (3,000 Gaj)</strong>. In hill land, 1 Nali = 16 Mutthi = 2,160 Sq.Ft (240 Gaj).
                  </>
                )}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
