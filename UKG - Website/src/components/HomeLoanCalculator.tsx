import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  IndianRupee, 
  Percent, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Sparkles,
  Award,
  ArrowRight,
  Landmark,
  Check,
  X,
  RotateCcw,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BankLogo } from './BankLogo';

export function formatIndianCurrency(amount: number): string {
  if (isNaN(amount) || amount === 0) return '₹0';
  const isNegative = amount < 0;
  const abs = Math.round(Math.abs(amount));
  const s = abs.toString();
  
  if (s.length <= 3) {
    return `${isNegative ? '-' : ''}₹${s}`;
  }
  
  const lastThree = s.substring(s.length - 3);
  const otherNumbers = s.substring(0, s.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  
  return `${isNegative ? '-' : ''}₹${formattedOther},${lastThree}`;
}

export function formatInLakhsOrCrores(amount: number, isHindi: boolean = false): string {
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2);
    return `₹${cr} ${isHindi ? 'करोड़' : 'Cr'}`;
  }
  if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(2);
    return `₹${lk} ${isHindi ? 'लाख' : 'Lakh'}`;
  }
  return formatIndianCurrency(amount);
}

export interface HomeLoanCalculatorProps {
  initialPrice?: number;
  isModal?: boolean;
  onClose?: () => void;
  initialTab?: 'emi' | 'banks' | 'amortization' | 'subsidies';
  isDark?: boolean;
}

export interface BankRateInfo {
  name: string;
  code: string;
  rate: number;
  maxTerm: string;
  tag: string;
  processingFee: string;
  maxLtv: string;
  category: 'Public Sector' | 'Private Sector' | 'Regional Hill Bank';
  perks: string[];
}

export const TOP_BANKS: BankRateInfo[] = [
  { 
    name: 'Bank of Baroda', 
    code: 'BOB',
    rate: 8.40, 
    maxTerm: '30yrs',
    tag: 'Lowest Rate', 
    processingFee: '0.25% (Max ₹8,500)',
    maxLtv: 'Up to 90%',
    category: 'Public Sector',
    perks: ['Lowest interest rate in industry', 'Digital Baroda Home Loan sanction', 'Nil processing charges on select schemes'],
  },
  { 
    name: 'State Bank of India', 
    code: 'SBI',
    rate: 8.50, 
    maxTerm: '30yrs',
    tag: 'Most Popular', 
    processingFee: '0.35% (Max ₹10,000)',
    maxLtv: 'Up to 90%',
    category: 'Public Sector',
    perks: ['Govt. Backed & Most Trusted', 'Special 0.05% discount for women borrowers', 'Zero prepayment penalties'],
  },
  { 
    name: 'HDFC Bank', 
    code: 'HDFC',
    rate: 8.70, 
    maxTerm: '30yrs',
    tag: 'Fastest Sanction', 
    processingFee: '0.50% (Max ₹15,000)',
    maxLtv: 'Up to 80%',
    category: 'Private Sector',
    perks: ['In-principle digital sanction in 30 minutes', 'Flexible repayment tenure up to 30 years', 'Minimal physical documentation'],
  },
  { 
    name: 'ICICI Bank', 
    code: 'ICICI',
    rate: 8.75, 
    maxTerm: '30yrs',
    tag: 'Flexible Terms', 
    processingFee: '0.50% (Max ₹15,000)',
    maxLtv: 'Up to 80%',
    category: 'Private Sector',
    perks: ['Instant pre-approved loan sanctions', 'Step Up loan repayment options', 'Express door-step legal support'],
  },
  { 
    name: 'Punjab National Bank', 
    code: 'PNB',
    rate: 8.45, 
    maxTerm: '30yrs',
    tag: 'Govt. Backed', 
    processingFee: '0.35% (Max ₹10,000)',
    maxLtv: 'Up to 85%',
    category: 'Public Sector',
    perks: ['PNB Max-Saver flexi overdraft', 'Concessions for green and solar homes', 'Fast hill-district branch verification'],
  },
  { 
    name: 'Uttarakhand Gramin Bank', 
    code: 'UKGB',
    rate: 8.65, 
    maxTerm: '30yrs',
    tag: 'Hill Specialist', 
    processingFee: '0.25% (Nominal)',
    maxLtv: 'Up to 85%',
    category: 'Regional Hill Bank',
    perks: ['Branches in every remote hill tehsil & block', 'Seamless verification of Uttarakhand land titles & Nali records', 'Tourism Homestay scheme linkage'],
  },
];

export const HomeLoanCalculator: React.FC<HomeLoanCalculatorProps> = ({
  initialPrice = 5000000,
  isModal = false,
  onClose,
  initialTab = 'emi',
  isDark: propIsDark,
}) => {
  const { isHindi } = useLanguage();

  // Automatically adapt to website's active theme
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof propIsDark === 'boolean') return propIsDark;
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             document.body.classList.contains('dark') || 
             localStorage.getItem('uk_gateways_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (typeof propIsDark === 'boolean') {
      setSystemIsDark(propIsDark);
      return;
    }
    const updateTheme = () => {
      const dark = document.documentElement.classList.contains('dark') || 
                   document.body.classList.contains('dark') || 
                   localStorage.getItem('uk_gateways_theme') === 'dark';
      setSystemIsDark(dark);
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', updateTheme);
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', updateTheme);
    };
  }, [propIsDark]);

  const isDark = typeof propIsDark === 'boolean' ? propIsDark : systemIsDark;

  const [activeTab, setActiveTab] = useState<'emi' | 'banks' | 'amortization' | 'subsidies'>(
    initialTab === 'emi' ? 'emi' : initialTab
  );

  // Core EMI Calculator State
  const defaultPrice = initialPrice > 0 ? initialPrice : 5000000;
  const [propertyPrice, setPropertyPrice] = useState<number>(defaultPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [downPaymentAmount, setDownPaymentAmount] = useState<number>(() => Math.round(defaultPrice * 0.20));
  const [downPaymentMode, setDownPaymentMode] = useState<'percent' | 'amount'>('percent');

  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [tenureMode, setTenureMode] = useState<'years' | 'months'>('years');

  // Handle Property Price Change
  const handlePriceChange = (newPrice: number) => {
    const val = Math.max(0, newPrice);
    setPropertyPrice(val);
    if (downPaymentMode === 'percent') {
      setDownPaymentAmount(Math.round(val * (downPaymentPercent / 100)));
    } else {
      const pct = val > 0 ? Math.min(100, Math.round((downPaymentAmount / val) * 100)) : 20;
      setDownPaymentPercent(pct);
    }
  };

  // Handle Down Payment Percent Change
  const handlePercentChange = (pct: number) => {
    const clampedPct = Math.min(90, Math.max(0, pct));
    setDownPaymentPercent(clampedPct);
    setDownPaymentAmount(Math.round(propertyPrice * (clampedPct / 100)));
  };

  // Handle Down Payment Amount Change
  const handleAmountChange = (amt: number) => {
    const clampedAmt = Math.min(propertyPrice * 0.9, Math.max(0, amt));
    setDownPaymentAmount(clampedAmt);
    const pct = propertyPrice > 0 ? Math.min(90, Math.round((clampedAmt / propertyPrice) * 100)) : 20;
    setDownPaymentPercent(pct);
  };

  // Loan Amount is Property Price minus Down Payment
  const loanAmount = useMemo(() => {
    return Math.max(0, propertyPrice - downPaymentAmount);
  }, [propertyPrice, downPaymentAmount]);

  // Standard Reducing-Balance EMI Calculation
  const { monthlyEmi, totalInterest, totalRepayment, principalPercent, interestPercent } = useMemo(() => {
    const P = Math.max(0, loanAmount);
    const N = tenureMode === 'years' ? tenureYears * 12 : tenureYears;
    
    if (P <= 0 || N <= 0) {
      return { monthlyEmi: 0, totalInterest: 0, totalRepayment: 0, principalPercent: 0, interestPercent: 0 };
    }

    if (interestRate <= 0) {
      const emi = Math.round(P / N);
      return { monthlyEmi: emi, totalInterest: 0, totalRepayment: P, principalPercent: 100, interestPercent: 0 };
    }

    const r = (interestRate / 12) / 100;
    const numerator = P * r * Math.pow(1 + r, N);
    const denominator = Math.pow(1 + r, N) - 1;
    const emi = denominator === 0 ? 0 : Math.round(numerator / denominator);
    const repayment = Math.round(emi * N);
    const interest = Math.max(0, repayment - P);

    const pPct = repayment > 0 ? Math.min(100, Math.max(0, Math.round((P / repayment) * 100))) : 50;
    const iPct = 100 - pPct;

    return {
      monthlyEmi: emi,
      totalInterest: interest,
      totalRepayment: repayment,
      principalPercent: pPct,
      interestPercent: iPct,
    };
  }, [loanAmount, interestRate, tenureYears, tenureMode]);

  // Reset to initial defaults
  const handleReset = () => {
    const p = initialPrice > 0 ? initialPrice : 5000000;
    setPropertyPrice(p);
    setDownPaymentPercent(20);
    setDownPaymentAmount(Math.round(p * 0.20));
    setDownPaymentMode('percent');
    setInterestRate(8.5);
    setTenureYears(20);
    setTenureMode('years');
  };

  // Slider background track filler
  const getSliderTrackBg = (val: number, min: number, max: number) => {
    const pct = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
    const activeColor = '#10b981';
    const trackColor = isDark ? '#083324' : '#e2e8f0';
    return `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${pct}%, ${trackColor} ${pct}%, ${trackColor} 100%)`;
  };

  // Year-wise Amortization Schedule
  const amortizationSchedule = useMemo(() => {
    const schedule: Array<{
      year: number;
      openingBalance: number;
      principalPaid: number;
      interestPaid: number;
      totalPayment: number;
      closingBalance: number;
    }> = [];

    let balance = loanAmount;
    const r = interestRate / (12 * 100);
    const emi = monthlyEmi;
    const totalYears = tenureMode === 'years' ? tenureYears : Math.ceil(tenureYears / 12);

    for (let year = 1; year <= totalYears; year++) {
      let annualPrincipal = 0;
      let annualInterest = 0;
      const opening = balance;

      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) break;
        const interestForMonth = balance * r;
        const principalForMonth = Math.min(balance, emi - interestForMonth);
        annualInterest += interestForMonth;
        annualPrincipal += principalForMonth;
        balance = Math.max(0, balance - principalForMonth);
      }

      schedule.push({
        year,
        openingBalance: Math.round(opening),
        principalPaid: Math.round(annualPrincipal),
        interestPaid: Math.round(annualInterest),
        totalPayment: Math.round(annualPrincipal + annualInterest),
        closingBalance: Math.round(balance),
      });

      if (balance <= 0) break;
    }

    return schedule;
  }, [loanAmount, monthlyEmi, interestRate, tenureYears, tenureMode]);

  return (
    <div className={`w-full rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-colors duration-300 ${
      isDark 
        ? 'dark bg-[#061e16] border-emerald-800/80 text-white shadow-emerald-950/60' 
        : 'bg-[#faf9f6] border-slate-200 text-slate-900 shadow-xl'
    }`}>
      
      {/* Top Header Row with Logo & Close Button */}
      <div className={`px-4 sm:px-6 py-4 border-b flex items-center justify-between gap-3 ${
        isDark ? 'bg-[#07241a] border-emerald-800/70' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Calculator className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold tracking-tight truncate leading-tight">
              {isHindi ? 'होम लोन ईएमआई कैलकुलेटर' : 'Home Loan EMI Calculator'}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-emerald-300/80 truncate">
              {isHindi ? 'सटीक मासिक किस्त व ब्याज दर विश्लेषण' : 'Accurate monthly repayment & interest calculation'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-200 dark:border-emerald-800/80 text-xs font-semibold text-slate-600 dark:text-emerald-300 hover:bg-slate-100 dark:hover:bg-emerald-950/60 flex items-center gap-1 transition-all cursor-pointer"
            title="Reset to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isHindi ? 'रीसेट' : 'Reset'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs: Only EMI Calculator, Bank Offers, Amortization Table, Subsidies */}
      <div className={`px-4 sm:px-6 pt-2 pb-0 border-b flex gap-3 sm:gap-6 overflow-x-auto scrollbar-none text-xs font-bold ${
        isDark ? 'bg-[#04160f] border-emerald-900/60' : 'bg-slate-50 border-slate-200'
      }`}>
        <button
          type="button"
          onClick={() => setActiveTab('emi')}
          className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'emi'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>{isHindi ? 'ईएमआई कैलकुलेटर' : 'Calculate EMI'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('banks')}
          className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'banks'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>{isHindi ? 'बैंक लोन ऑफर्स' : 'Bank Loan Offers'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
            {TOP_BANKS.length}+
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('amortization')}
          className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'amortization'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{isHindi ? 'वर्षवार तालिका' : 'Amortization Table'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subsidies')}
          className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'subsidies'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>{isHindi ? 'उत्तराखंड सब्सिडी' : 'UK Tourism Subsidies'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[80vh] sm:max-h-[82vh]">

        {/* TAB 1: HOME LOAN EMI CALCULATOR (Mobile-First 2-Column Responsive Layout) */}
        {activeTab === 'emi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start animate-in fade-in">
            
            {/* LEFT COLUMN: Input Sliders & Controls */}
            <div className={`lg:col-span-7 p-4 sm:p-6 rounded-3xl border shadow-xs space-y-5 transition-colors ${
              isDark ? 'bg-[#07241a] border-emerald-900/60' : 'bg-white border-slate-200 shadow-sm'
            }`}>

              {/* 1. Property Price Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'प्रॉपर्टी का मूल्य (Property Price)' : 'Property Price'}</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs font-semibold text-slate-400">₹</span>
                    <input
                      type="number"
                      min={100000}
                      max={100000000}
                      step={50000}
                      value={propertyPrice}
                      onChange={(e) => handlePriceChange(Number(e.target.value))}
                      className="w-28 sm:w-36 text-right font-black text-sm text-slate-900 dark:text-white bg-transparent outline-none"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min={500000}
                  max={25000000}
                  step={100000}
                  value={propertyPrice}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  style={{ background: getSliderTrackBg(propertyPrice, 500000, 25000000) }}
                  className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span>₹5 Lakh</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-black">{formatInLakhsOrCrores(propertyPrice, isHindi)}</span>
                  <span>₹2.5 Cr</span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[2500000, 3500000, 5000000, 7500000, 10000000, 15000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handlePriceChange(amt)}
                      className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                        propertyPrice === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                      }`}
                    >
                      {formatInLakhsOrCrores(amt, isHindi)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Down Payment (% or Amount) */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                      {isHindi ? 'डाउन पेमेंट (Down Payment)' : 'Down Payment'}
                    </label>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setDownPaymentMode('percent')}
                        className={`px-2 py-0.5 rounded-md transition-all ${
                          downPaymentMode === 'percent'
                            ? 'bg-white dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shadow-xs font-black'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        %
                      </button>
                      <button
                        type="button"
                        onClick={() => setDownPaymentMode('amount')}
                        className={`px-2 py-0.5 rounded-md transition-all ${
                          downPaymentMode === 'amount'
                            ? 'bg-white dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shadow-xs font-black'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        ₹
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    {downPaymentMode === 'amount' ? (
                      <>
                        <span className="text-xs font-semibold text-slate-400">₹</span>
                        <input
                          type="number"
                          min={0}
                          max={propertyPrice * 0.9}
                          step={50000}
                          value={downPaymentAmount}
                          onChange={(e) => handleAmountChange(Number(e.target.value))}
                          className="w-24 sm:w-28 text-right font-black text-sm text-slate-900 dark:text-white bg-transparent outline-none"
                        />
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          min={0}
                          max={90}
                          step={1}
                          value={downPaymentPercent}
                          onChange={(e) => handlePercentChange(Number(e.target.value))}
                          className="w-12 text-right font-black text-sm text-slate-900 dark:text-white bg-transparent outline-none"
                        />
                        <span className="text-xs font-bold text-slate-400">%</span>
                      </>
                    )}
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={80}
                  step={5}
                  value={downPaymentPercent}
                  onChange={(e) => handlePercentChange(Number(e.target.value))}
                  style={{ background: getSliderTrackBg(downPaymentPercent, 0, 80) }}
                  className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span>0% (₹0)</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {downPaymentPercent}% = {formatInLakhsOrCrores(downPaymentAmount, isHindi)}
                  </span>
                  <span>80%</span>
                </div>

                {/* Down Payment Quick Percent Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[10, 20, 25, 30, 40, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePercentChange(pct)}
                      className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                        downPaymentPercent === pct
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Auto-Calculated Principal Loan Amount Pill */}
              <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
                    {isHindi ? 'कुल ऋण राशि (Loan Amount)' : 'Principal Loan Amount'}
                  </span>
                  <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400">
                    {isHindi ? 'मूल्य - डाउन पेमेंट' : 'Property Price − Down Payment'}
                  </span>
                </div>
                <span className="text-lg sm:text-xl font-black text-emerald-950 dark:text-white">
                  {formatIndianCurrency(loanAmount)}
                </span>
              </div>

              {/* 4. Interest Rate Input */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'वार्षिक ब्याज दर (Interest Rate)' : 'Interest Rate (% p.a.)'}</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <input
                      type="number"
                      min={6}
                      max={18}
                      step={0.05}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Math.max(1, Number(e.target.value)))}
                      className="w-16 text-right font-black text-sm text-slate-900 dark:text-white bg-transparent outline-none"
                    />
                    <span className="text-xs font-semibold text-slate-400">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={6.5}
                  max={15}
                  step={0.05}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  style={{ background: getSliderTrackBg(interestRate, 6.5, 15) }}
                  className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span>6.5%</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-black">{interestRate.toFixed(2)}% p.a.</span>
                  <span>15.0%</span>
                </div>

                {/* Popular Bank Benchmark Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[
                    { label: 'BOB 8.4%', val: 8.4 },
                    { label: 'SBI 8.5%', val: 8.5 },
                    { label: 'HDFC 8.7%', val: 8.7 },
                    { label: 'ICICI 8.75%', val: 8.75 },
                  ].map((bank) => (
                    <button
                      key={bank.label}
                      type="button"
                      onClick={() => setInterestRate(bank.val)}
                      className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                        interestRate === bank.val
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                      }`}
                    >
                      {bank.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Loan Tenure */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{isHindi ? 'ऋण अवधि (Tenure)' : 'Loan Tenure'}</span>
                    </label>
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          if (tenureMode === 'months') {
                            setTenureYears(Math.max(1, Math.round(tenureYears / 12)));
                            setTenureMode('years');
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md transition-all ${
                          tenureMode === 'years' 
                            ? 'bg-white dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shadow-xs font-black' 
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {isHindi ? 'वर्ष' : 'Yr'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (tenureMode === 'years') {
                            setTenureYears(tenureYears * 12);
                            setTenureMode('months');
                          }
                        }}
                        className={`px-2 py-0.5 rounded-md transition-all ${
                          tenureMode === 'months' 
                            ? 'bg-white dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shadow-xs font-black' 
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {isHindi ? 'माह' : 'Mo'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <input
                      type="number"
                      min={1}
                      max={tenureMode === 'years' ? 30 : 360}
                      step={1}
                      value={tenureYears}
                      onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value)))}
                      className="w-14 text-right font-black text-sm text-slate-900 dark:text-white bg-transparent outline-none"
                    />
                    <span className="text-xs font-semibold text-slate-400">
                      {tenureMode === 'years' ? (isHindi ? 'वर्ष' : 'Yrs') : (isHindi ? 'माह' : 'Mos')}
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={1}
                  max={tenureMode === 'years' ? 30 : 360}
                  step={1}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  style={{ background: getSliderTrackBg(tenureYears, 1, tenureMode === 'years' ? 30 : 360) }}
                  className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span>{tenureMode === 'years' ? '1 Year' : '12 Mos'}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-black">
                    {tenureYears} {tenureMode === 'years' ? (isHindi ? 'वर्ष' : 'Years') : (isHindi ? 'महीने' : 'Months')}
                  </span>
                  <span>{tenureMode === 'years' ? '30 Years' : '360 Mos'}</span>
                </div>

                {/* Tenure Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[5, 10, 15, 20, 25, 30].map((yr) => {
                    const actualVal = tenureMode === 'years' ? yr : yr * 12;
                    const isActive = tenureYears === actualVal;
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setTenureYears(actualVal)}
                        className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                        }`}
                      >
                        {yr} {isHindi ? 'वर्ष' : 'Yrs'}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Results Summary Card (Fully Mobile Optimized) */}
            <div className={`lg:col-span-5 p-5 sm:p-6 rounded-3xl border shadow-lg flex flex-col justify-between gap-5 transition-colors ${
              isDark 
                ? 'bg-gradient-to-b from-[#082a1f] to-[#04160f] border-emerald-800/80 shadow-emerald-950/60' 
                : 'bg-gradient-to-b from-white to-emerald-50/40 border-emerald-200/90 shadow-emerald-950/5'
            }`}>
              
              {/* Estimated Monthly EMI Display */}
              <div className="text-center space-y-1 pt-1">
                <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-emerald-300/90 uppercase tracking-wider block">
                  {isHindi ? 'मासिक ईएमआई (Monthly EMI)' : 'Estimated Monthly EMI'}
                </span>
                
                <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-serif-luxury py-1">
                  {formatIndianCurrency(monthlyEmi)}
                  <span className="text-xs font-normal text-slate-400 dark:text-emerald-300 ml-1">/ {isHindi ? 'माह' : 'month'}</span>
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-400">
                  {isHindi ? 'घटती शेष ब्याज दर गणना (Reducing Balance)' : 'Standard Reducing-Balance Amortization'}
                </p>
              </div>

              {/* Two-Tone Visual Breakdown Bar: Principal % vs Interest % */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-emerald-950/50 border border-slate-200/80 dark:border-emerald-900/60">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>{isHindi ? 'मूलधन (Principal)' : 'Principal'}: {principalPercent}%</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>{isHindi ? 'ब्याज (Interest)' : 'Interest'}: {interestPercent}%</span>
                  </span>
                </div>

                {/* Progress Strip */}
                <div className="h-3 w-full bg-amber-500 rounded-full overflow-hidden flex shadow-inner">
                  <div 
                    style={{ width: `${principalPercent}%` }} 
                    className="h-full bg-emerald-600 transition-all duration-300"
                  />
                </div>
              </div>

              {/* 4-Item Breakdown Metric Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-white dark:bg-[#071f16] border border-slate-200/90 dark:border-emerald-900/60">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
                    {isHindi ? 'मूल ऋण राशि' : 'Principal Amount'}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                    {formatIndianCurrency(loanAmount)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#071f16] border border-slate-200/90 dark:border-emerald-900/60">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
                    {isHindi ? 'डाउन पेमेंट' : 'Down Payment'}
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {formatIndianCurrency(downPaymentAmount)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#071f16] border border-slate-200/90 dark:border-emerald-900/60">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
                    {isHindi ? 'कुल ब्याज देय' : 'Total Interest'}
                  </span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                    {formatIndianCurrency(totalInterest)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-[#071f16] border border-slate-200/90 dark:border-emerald-900/60">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
                    {isHindi ? 'कुल भुगतान राशि' : 'Total Repayment'}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                    {formatIndianCurrency(totalRepayment)}
                  </span>
                </div>
              </div>

              {/* Action Buttons: View Amortization / View Bank Offers */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('amortization')}
                  className="flex-1 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'वर्षवार तालिका' : 'View Schedule'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('banks')}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Landmark className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'बैंक ऑफर्स देखें' : 'Bank Offers'}</span>
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 leading-tight">
                {isHindi 
                  ? 'अनुमानित गणना। वास्तविक ब्याज दर व स्वीकृति बैंक सत्यापन पर निर्भर करती है।' 
                  : 'Indicative estimate only. Actual EMI and approval depend on bank assessment.'}
              </p>

            </div>

          </div>
        )}

        {/* TAB 2: TOP BANK OFFERS */}
        {activeTab === 'banks' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold">
                  {isHindi ? 'प्रमुख बैंकों की होम लोन ब्याज दरें (2026)' : 'Top Bank Home Loan Interest Rates (2026)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isHindi ? 'उत्तराखंड में संपत्तियों के लिए सबसे कम ब्याज दरें व शर्तें' : 'Lowest benchmark rates and LTV terms for Uttarakhand buyers'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('emi')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                ← {isHindi ? 'ईएमआई कैलकुलेटर' : 'Back to Calculator'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {TOP_BANKS.map((b) => (
                <div 
                  key={b.code}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    isDark 
                      ? 'bg-[#07241a] border-emerald-900/60' 
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <BankLogo code={b.code} size="md" />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                          {b.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {b.category} • Max {b.maxTerm}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      {b.tag}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-[#051810]">
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-semibold">{isHindi ? 'ब्याज दर' : 'Interest Rate'}</span>
                      <strong className="text-sm font-black text-emerald-600 dark:text-emerald-400">{b.rate}%</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-semibold">{isHindi ? 'अधिकतम LTV' : 'Max LTV'}</span>
                      <strong className="text-xs font-bold text-slate-800 dark:text-slate-200">{b.maxLtv}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-semibold">{isHindi ? 'प्रोसेसिंग फीस' : 'Processing'}</span>
                      <strong className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate block">{b.processingFee.split(' ')[0]}</strong>
                    </div>
                  </div>

                  <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    {b.perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => {
                      setInterestRate(b.rate);
                      setActiveTab('emi');
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                  >
                    <span>{isHindi ? `${b.rate}% दर से ईएमआई गणना करें` : `Apply ${b.rate}% Rate to EMI`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: AMORTIZATION SCHEDULE TABLE */}
        {activeTab === 'amortization' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold">
                  {isHindi ? 'वर्षवार पुनर्भुगतान अनुसूची (Amortization)' : 'Year-wise Repayment Schedule (Amortization)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isHindi ? 'देखें कि प्रत्येक वर्ष आपके मूलधन और ब्याज का कितना भुगतान होगा' : 'Breakdown of annual principal, interest paid, and closing loan balance'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('emi')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                ← {isHindi ? 'ईएमआई कैलकुलेटर' : 'Back to Calculator'}
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-emerald-900/80">
              <table className="w-full text-xs text-left">
                <thead className={`text-[11px] font-black uppercase tracking-wider ${
                  isDark ? 'bg-[#051810] text-emerald-300' : 'bg-slate-100 text-slate-700'
                }`}>
                  <tr>
                    <th className="py-2.5 px-3">{isHindi ? 'वर्ष' : 'Year'}</th>
                    <th className="py-2.5 px-3 text-right">{isHindi ? 'प्रारंभिक शेष' : 'Opening (₹)'}</th>
                    <th className="py-2.5 px-3 text-right">{isHindi ? 'मूलधन चुकाया' : 'Principal (₹)'}</th>
                    <th className="py-2.5 px-3 text-right">{isHindi ? 'ब्याज चुकाया' : 'Interest (₹)'}</th>
                    <th className="py-2.5 px-3 text-right">{isHindi ? 'अंतिम शेष' : 'Closing (₹)'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/60 font-medium">
                  {amortizationSchedule.map((row) => (
                    <tr key={row.year} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40">
                      <td className="py-2 px-3 font-bold">{row.year}</td>
                      <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-300">{row.openingBalance.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{row.principalPaid.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400">{row.interestPaid.toLocaleString('en-IN')}</td>
                      <td className="py-2 px-3 text-right font-bold">{row.closingBalance.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: UTTARAKHAND TOURISM SUBSIDIES */}
        {activeTab === 'subsidies' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>{isHindi ? 'उत्तराखंड होमस्टे व पर्यटन सब्सिडी योजनाएं' : 'Uttarakhand Homestay & Tourism Subsidy Schemes'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isHindi ? 'राज्य सरकार द्वारा 33% से 50% तक की पूंजीगत सब्सिडी का लाभ उठाएं' : 'State government capital subsidies up to 33%-50% for hill properties'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('emi')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                ← {isHindi ? 'ईएमआई कैलकुलेटर' : 'Back to Calculator'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#07241a] border-emerald-900/60' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
                    {isHindi ? 'दीन दयाल उपाध्याय होमस्टे योजना' : 'Deen Dayal Upadhyay Homestay Scheme'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    33% - 50% Subsidy
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isHindi 
                    ? 'पहाड़ी क्षेत्रों में नई होमस्टे स्थापना के लिए पूंजीगत लागत पर ₹7.5 लाख से ₹15 लाख तक की सीधी सब्सिडी और 5 वर्षों तक 50% ब्याज उपादान।'
                    : 'Provides capital subsidy of ₹7.5 Lakh to ₹15 Lakh on home construction and renovation for registered tourism homestays in hill districts.'}
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'सभी 13 पर्वतीय जिलों में मान्य' : 'Applicable across all 13 hill districts'}</span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border space-y-2 ${
                isDark ? 'bg-[#07241a] border-emerald-900/60' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-teal-700 dark:text-teal-300">
                    {isHindi ? 'वीर चंद्र सिंह गढ़वाली पर्यटन स्वरोजगार योजना' : 'Veer Chandra Singh Garhwali Tourism Scheme'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    Up to ₹33 Lakh
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isHindi 
                    ? 'होटल, मोटल, रिजॉर्ट व पर्यावरण अनुकूल कॉटेज निर्माण हेतु ₹40 लाख तक की परियोजना लागत पर 33% तक की पूंजी अनुदान सहायता।'
                    : 'A flagship scheme offering up to 33% capital grant on projects up to ₹40 Lakh for eco-cottages, mountain lodges, and wellness centers.'}
                </p>
                <div className="pt-2 flex items-center gap-2 text-[11px] font-bold text-teal-600 dark:text-teal-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'बैंक ऋण से सीधे लिंक' : 'Directly linked with nationalized banks'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
