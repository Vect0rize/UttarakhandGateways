import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  IndianRupee, 
  Percent, 
  Clock, 
  ShieldCheck, 
  Building2, 
  Info, 
  Sparkles,
  Scale,
  Award,
  ArrowRight,
  Landmark,
  Check,
  X,
  CheckCircle2,
  } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BankLogo } from './BankLogo';

export interface HomeLoanCalculatorProps {
  initialPrice?: number;
  isModal?: boolean;
  onClose?: () => void;
  initialTab?: 'eligibility' | 'emi' | 'banks' | 'amortization' | 'subsidies';
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
  initialTab = 'eligibility',
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

  const [activeTab, setActiveTab] = useState<'eligibility' | 'banks' | 'amortization' | 'subsidies'>(
    initialTab === 'emi' ? 'eligibility' : initialTab
  );

  // Exact Fields from Magicbricks Inspiration Screenshot:
  // 1. Net Monthly Income
  const [monthlyIncome, setMonthlyIncome] = useState<number>(50000);

  // 2. Additional Income Checkboxes
  const [hasCoApplicant, setHasCoApplicant] = useState<boolean>(false);
  const [coApplicantIncome, setCoApplicantIncome] = useState<number>(30000);

  const [hasInvestmentIncome, setHasInvestmentIncome] = useState<boolean>(false);
  const [investmentIncome, setInvestmentIncome] = useState<number>(15000);

  const [hasRentalIncome, setHasRentalIncome] = useState<boolean>(false);
  const [rentalIncome, setRentalIncome] = useState<number>(10000);

  // 3. Ongoing EMIs
  const [ongoingEmi, setOngoingEmi] = useState<number>(0);

  // 4. Loan Tenure & Interest Rate
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(7.0);

  // 5. Finalized Property Radio
  const [finalizedProperty, setFinalizedProperty] = useState<'yes' | 'no'>('no');

  // Read more modal / toggle
  const [showReadMore, setShowReadMore] = useState<boolean>(false);

  // Slider background track filler
  const getSliderTrackBg = (val: number, min: number, max: number) => {
    const pct = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
    const activeColor = isDark ? '#10b981' : '#d8232a';
    const trackColor = isDark ? '#083324' : '#e2e8f0';
    return `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${pct}%, ${trackColor} ${pct}%, ${trackColor} 100%)`;
  };

  // Total household eligible monthly income
  const totalEligibleIncome = useMemo(() => {
    let sum = monthlyIncome;
    if (hasCoApplicant) sum += coApplicantIncome;
    if (hasInvestmentIncome) sum += investmentIncome;
    if (hasRentalIncome) sum += rentalIncome;
    return sum;
  }, [monthlyIncome, hasCoApplicant, coApplicantIncome, hasInvestmentIncome, investmentIncome, hasRentalIncome, rentalIncome]);

  // Magicbricks Calculation Logic (FOIR 50%-60% standard depending on income bracket):
  // Max affordable EMI = (Total Income * FOIR) - Ongoing EMIs
  // Principal = (EMI * ( (1+r)^n - 1 )) / ( r * (1+r)^n )
  const eligibility = useMemo(() => {
    const foir = totalEligibleIncome >= 100000 ? 0.60 : totalEligibleIncome >= 50000 ? 0.55 : 0.50;
    const maxAffordableEmi = Math.max(1000, Math.round(totalEligibleIncome * foir - ongoingEmi));
    
    const r = interestRate / (12 * 100);
    const n = tenureYears * 12;

    const maxLoan = Math.round(
      (maxAffordableEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n))
    );

    return {
      maxLoanAmount: Math.max(0, maxLoan),
      monthlyEmi: maxAffordableEmi,
    };
  }, [totalEligibleIncome, ongoingEmi, interestRate, tenureYears]);

  // Format amount e.g. "₹ 81.93 Lac" or "₹ 1.25 Cr" (matching screenshot: "₹ 81.93 Lac")
  const formatEligibleAmount = (val: number) => {
    if (val >= 10000000) {
      return `₹ ${(val / 10000000).toFixed(2)} Cr`;
    }
    const inLacs = (val / 100000).toFixed(2);
    return `₹ ${inLacs} Lac`;
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

    let balance = eligibility.maxLoanAmount;
    const r = interestRate / (12 * 100);
    const emi = eligibility.monthlyEmi;

    for (let year = 1; year <= tenureYears; year++) {
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
  }, [eligibility.maxLoanAmount, eligibility.monthlyEmi, interestRate, tenureYears]);

  return (
    <div className={`w-full rounded-3xl border shadow-2xl overflow-hidden flex flex-col transition-colors duration-300 ${
      isDark 
        ? 'dark bg-[#061e16] border-emerald-800/80 text-white shadow-emerald-950/60' 
        : 'bg-[#faf9f6] border-slate-200 text-slate-900 shadow-xl'
    }`}>
      
      {/* Top Header Row with Magicloans logo & Dark/Light switch */}
      <div className={`px-6 sm:px-8 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDark 
          ? 'bg-[#07241a] border-emerald-800/70' 
          : 'bg-white border-slate-200'
      }`}>
        <div>
          {/* UKG Loan Calculator Logo */}
          <div className="flex items-center gap-2.5 select-none">
            <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs sm:text-sm tracking-wider shadow-xs">
              UKG
            </span>
            <span className={`text-2xl sm:text-3xl font-black tracking-tight font-serif-luxury ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Loan Calculator
            </span>
          </div>

          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mt-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {isHindi ? 'होम लोन पात्रता कैलकुलेटर' : 'Home Loan Eligibility Calculator'}
          </h2>
          <p className={`text-xs sm:text-sm mt-0.5 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {isHindi 
              ? 'होम लोन पात्रता कैलकुलेटर भावी गृहस्वामियों के लिए एक उपयोगी साधन है, जो यह अनुमान लगाने में मदद करता है कि वे कितनी ऋण राशि के लिए पात्र हैं...'
              : 'Home Loan Eligibility Calculator is a valuable tool for potential homeowners, allowing them to estimate how much loan they qualify for based...'}
            <button 
              type="button" 
              onClick={() => setShowReadMore(!showReadMore)}
              className={`font-semibold ml-1 cursor-pointer underline ${isDark ? 'text-emerald-400' : 'text-slate-800'}`}
            >
              {showReadMore ? 'Show less' : 'Read more'}
            </button>
          </p>
          {showReadMore && (
            <p className={`text-xs mt-1.5 p-2 rounded-xl border animate-in fade-in ${
              isDark ? 'bg-[#04160f] border-emerald-900/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              {isHindi 
                ? 'यह गणना 50%-60% एफओआईआर (निश्चित दायित्व से आय अनुपात), मौजूदा मासिक किश्तों और बैंक की 30 वर्ष तक की अवधि के आधार पर तुरंत परिणाम प्रदान करती है।'
                : 'Eligibility is calculated based on banking FOIR standards (50%-60%), subtracting ongoing debt obligations from your net family disposable monthly income over terms up to 30 years.'}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className={`px-6 sm:px-8 pt-2.5 pb-0 border-b flex gap-3 sm:gap-6 overflow-x-auto text-xs font-bold ${
        isDark ? 'bg-[#04160f] border-emerald-900/60' : 'bg-slate-50 border-slate-200'
      }`}>
        <button
          type="button"
          onClick={() => setActiveTab('eligibility')}
          className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'eligibility'
              ? isDark ? 'border-emerald-400 text-emerald-300 font-black' : 'border-[#d8232a] text-[#d8232a] font-black'
              : isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{isHindi ? 'ऋण पात्रता (Eligibility)' : 'Eligibility Calculator'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('banks')}
          className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'banks'
              ? isDark ? 'border-emerald-400 text-emerald-300 font-black' : 'border-[#d8232a] text-[#d8232a] font-black'
              : isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>{isHindi ? 'बैंक ऑफर्स सूची' : 'Bank Loan Offers'}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            isDark ? 'bg-emerald-900 text-emerald-300' : 'bg-red-100 text-[#d8232a]'
          }`}>
            {TOP_BANKS.length}+
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('amortization')}
          className={`pb-2.5 px-1 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'amortization'
              ? isDark ? 'border-emerald-400 text-emerald-300 font-black' : 'border-[#d8232a] text-[#d8232a] font-black'
              : isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-900'
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
              ? isDark ? 'border-emerald-400 text-emerald-300 font-black' : 'border-[#d8232a] text-[#d8232a] font-black'
              : isDark ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>{isHindi ? 'उत्तराखंड सब्सिडी' : 'UK Tourism Subsidies'}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-8 space-y-6 overflow-y-auto max-h-[78vh]">

        {/* TAB 1: EXACT INSPIRATION LAYOUT (Left Form Card + Right Results Card) */}
        {activeTab === 'eligibility' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in">
            
            {/* LEFT PANEL: Exact Match to Screenshot Form Card */}
            <div className={`lg:col-span-6 p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 transition-colors ${
              isDark 
                ? 'bg-[#07241a] border-emerald-900/60 shadow-emerald-950/40' 
                : 'bg-white border-slate-200 shadow-md shadow-slate-200/50'
            }`}>
              
              {/* 1. Net Monthly Income (i) */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Net Monthly Income
                  </label>
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" title="Take-home salary after taxes & EPF" />
                </div>
                
                {/* Underline Style Input Matching Screenshot */}
                <div className={`flex items-baseline gap-1 pb-1.5 border-b ${
                  isDark ? 'border-emerald-800' : 'border-slate-300'
                }`}>
                  <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>₹</span>
                  <input
                    type="number"
                    min="15000"
                    max="1000000"
                    step="5000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Math.max(10000, Number(e.target.value) || 0))}
                    className={`w-full text-base sm:text-lg font-bold bg-transparent outline-none ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  />
                </div>

                {/* Range Slider for Monthly Income with Dynamic Filled Track */}
                <div className="pt-2 space-y-1">
                  <input
                    type="range"
                    min={15000}
                    max={1000000}
                    step={5000}
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    style={{ background: getSliderTrackBg(monthlyIncome, 15000, 1000000) }}
                    className="fintech-slider"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>₹15,000 / mo</span>
                    <span>₹10,00,000 / mo</span>
                  </div>
                </div>
              </div>

              {/* 2. Additional Income (If any) - Checkboxes from Screenshot */}
              <div className="space-y-2.5 pt-1">
                <label className={`text-xs font-semibold block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Additional Income (If any)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* Co-applicant Income */}
                  <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                    hasCoApplicant
                      ? isDark ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300' : 'bg-red-50/60 border-[#d8232a] text-[#d8232a]'
                      : isDark ? 'bg-[#04160f] border-emerald-900/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={hasCoApplicant}
                      onChange={(e) => setHasCoApplicant(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#d8232a] rounded cursor-pointer"
                    />
                    <span className="font-medium text-[11px] leading-tight">Co-applicant Income</span>
                  </label>

                  {/* Investment Income */}
                  <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                    hasInvestmentIncome
                      ? isDark ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300' : 'bg-red-50/60 border-[#d8232a] text-[#d8232a]'
                      : isDark ? 'bg-[#04160f] border-emerald-900/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={hasInvestmentIncome}
                      onChange={(e) => setHasInvestmentIncome(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#d8232a] rounded cursor-pointer"
                    />
                    <span className="font-medium text-[11px] leading-tight">Investment Income</span>
                  </label>

                  {/* Rental Income */}
                  <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                    hasRentalIncome
                      ? isDark ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300' : 'bg-red-50/60 border-[#d8232a] text-[#d8232a]'
                      : isDark ? 'bg-[#04160f] border-emerald-900/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <input
                      type="checkbox"
                      checked={hasRentalIncome}
                      onChange={(e) => setHasRentalIncome(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#d8232a] rounded cursor-pointer"
                    />
                    <span className="font-medium text-[11px] leading-tight">Rental Income</span>
                  </label>
                </div>

                {/* Dynamic Inputs when checkboxes are active */}
                {(hasCoApplicant || hasInvestmentIncome || hasRentalIncome) && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 animate-in fade-in">
                    {hasCoApplicant && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block">Co-applicant (₹)</span>
                        <input
                          type="number"
                          step="5000"
                          value={coApplicantIncome}
                          onChange={(e) => setCoApplicantIncome(Number(e.target.value) || 0)}
                          className={`w-full px-2 py-1 text-xs font-bold rounded-lg border ${
                            isDark ? 'bg-[#04160f] border-emerald-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    )}
                    {hasInvestmentIncome && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block">Investments (₹)</span>
                        <input
                          type="number"
                          step="2000"
                          value={investmentIncome}
                          onChange={(e) => setInvestmentIncome(Number(e.target.value) || 0)}
                          className={`w-full px-2 py-1 text-xs font-bold rounded-lg border ${
                            isDark ? 'bg-[#04160f] border-emerald-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    )}
                    {hasRentalIncome && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block">Rental (₹)</span>
                        <input
                          type="number"
                          step="2000"
                          value={rentalIncome}
                          onChange={(e) => setRentalIncome(Number(e.target.value) || 0)}
                          className={`w-full px-2 py-1 text-xs font-bold rounded-lg border ${
                            isDark ? 'bg-[#04160f] border-emerald-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Ongoing EMI's */}
              <div className="space-y-2">
                <label className={`text-xs font-semibold block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Ongoing EMI's
                </label>
                
                <div className={`flex items-baseline gap-1 pb-1.5 border-b ${
                  isDark ? 'border-emerald-800' : 'border-slate-300'
                }`}>
                  <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>₹</span>
                  <input
                    type="number"
                    min="0"
                    max="300000"
                    step="1000"
                    value={ongoingEmi}
                    onChange={(e) => setOngoingEmi(Math.max(0, Number(e.target.value) || 0))}
                    className={`w-full text-base sm:text-lg font-bold bg-transparent outline-none ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  />
                </div>

                <div className="pt-2 space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={300000}
                    step={1000}
                    value={ongoingEmi}
                    onChange={(e) => setOngoingEmi(Number(e.target.value))}
                    style={{ background: getSliderTrackBg(ongoingEmi, 0, 300000) }}
                    className="fintech-slider"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>₹0 (Zero)</span>
                    <span>₹3,00,000 / mo</span>
                  </div>
                </div>
              </div>

              {/* 4. Loan Tenure & Interest Rate % (p.a.) */}
              <div className="grid grid-cols-2 gap-6">
                
                {/* Loan Tenure */}
                <div className="space-y-2">
                  <label className={`text-xs font-semibold block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Loan Tenure
                  </label>
                  <div className={`flex items-center justify-between pb-1.5 border-b ${
                    isDark ? 'border-emerald-800' : 'border-slate-300'
                  }`}>
                    <select
                      value={tenureYears}
                      onChange={(e) => setTenureYears(Number(e.target.value))}
                      className={`w-full text-sm sm:text-base font-bold bg-transparent outline-none cursor-pointer ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {[5, 10, 15, 20, 25, 30].map((yr) => (
                        <option key={yr} value={yr} className={isDark ? 'bg-[#04160f] text-white' : 'bg-white text-slate-900'}>
                          {yr} yrs
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={1}
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    style={{ background: getSliderTrackBg(tenureYears, 1, 30) }}
                    className="fintech-slider"
                  />
                </div>

                {/* Interest Rate */}
                <div className="space-y-2">
                  <label className={`text-xs font-semibold block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Interest Rate % (p.a.)
                  </label>
                  <div className={`flex items-baseline gap-1 pb-1.5 border-b ${
                    isDark ? 'border-emerald-800' : 'border-slate-300'
                  }`}>
                    <input
                      type="number"
                      min="6.5"
                      max="15"
                      step="0.05"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Math.min(15, Math.max(6.5, Number(e.target.value) || 7.0)))}
                      className={`w-full text-sm sm:text-base font-bold bg-transparent outline-none ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>

                  <input
                    type="range"
                    min={6.5}
                    max={15}
                    step={0.05}
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    style={{ background: getSliderTrackBg(interestRate, 6.5, 15) }}
                    className="fintech-slider"
                  />
                </div>

              </div>

              {/* 5. Have you finalized your property? (Radio Yes/No) */}
              <div className="space-y-2 pt-1">
                <label className={`text-xs font-semibold block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Have you finalized your property?
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input
                      type="radio"
                      name="finalized"
                      checked={finalizedProperty === 'yes'}
                      onChange={() => setFinalizedProperty('yes')}
                      className="w-4 h-4 accent-[#d8232a] cursor-pointer"
                    />
                    <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>Yes</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                    <input
                      type="radio"
                      name="finalized"
                      checked={finalizedProperty === 'no'}
                      onChange={() => setFinalizedProperty('no')}
                      className="w-4 h-4 accent-[#d8232a] cursor-pointer"
                    />
                    <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>No</span>
                  </label>
                </div>
              </div>

              {/* Red Bottom Button */}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('results-panel');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-3.5 rounded-full bg-[#d8232a] hover:bg-[#b81d23] text-white font-extrabold text-sm sm:text-base tracking-wide shadow-lg shadow-red-600/30 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer text-center"
              >
                Check Eligibility
              </button>

            </div>

            {/* RIGHT PANEL: Exact Match to Screenshot Results Card */}
            <div id="results-panel" className={`lg:col-span-6 p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col justify-between gap-6 transition-colors ${
              isDark 
                ? 'bg-[#07241a] border-emerald-900/60 shadow-emerald-950/40' 
                : 'bg-white border-slate-200 shadow-md shadow-slate-200/50'
            }`}>
              
              {/* Top Hero: "You are Eligible for Amount" */}
              <div className="text-center space-y-1 pt-2">
                <span className={`text-sm sm:text-base font-semibold block ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  You are Eligible for Amount
                </span>
                
                {/* Large Bold Red Amount: "₹ 81.93 Lac" */}
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#d8232a] tracking-tight font-serif-luxury">
                  {formatEligibleAmount(eligibility.maxLoanAmount)}
                </div>

                <div className="pt-3">
                  <span className={`text-xs sm:text-sm font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Monthly EMI
                  </span>
                  <div className={`text-2xl sm:text-3xl font-extrabold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ₹ {eligibility.monthlyEmi.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Subtle Horizontal Divider Line */}
              <div className={`w-full border-t ${isDark ? 'border-emerald-900/60' : 'border-amber-100'}`} />

              {/* Top Banks home loan Offers Section */}
              <div className="space-y-3">
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Top Banks home loan Offers
                </h4>

                {/* Bank Cards Grid Matching Screenshot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Card 1: Bank of Baroda */}
                  <div 
                    onClick={() => setActiveTab('banks')}
                    className={`p-3.5 rounded-2xl border shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isDark 
                        ? 'bg-[#061e16] border-emerald-800/80 hover:border-emerald-500' 
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BankLogo code="BOB" size="md" />
                      <div>
                        <h5 className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Bank of Baroda
                        </h5>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          Rate 8.4% | Max Term 30yrs
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#d8232a] hover:underline shrink-0">
                      View
                    </span>
                  </div>

                  {/* Card 2: State Bank of India */}
                  <div 
                    onClick={() => setActiveTab('banks')}
                    className={`p-3.5 rounded-2xl border shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isDark 
                        ? 'bg-[#061e16] border-emerald-800/80 hover:border-emerald-500' 
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BankLogo code="SBI" size="md" />
                      <div>
                        <h5 className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          State Bank of India
                        </h5>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          Rate 8.5% | Max Term 30yrs
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#d8232a] hover:underline shrink-0">
                      View
                    </span>
                  </div>

                  {/* Card 3: ICICI Bank */}
                  <div 
                    onClick={() => setActiveTab('banks')}
                    className={`p-3.5 rounded-2xl border shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isDark 
                        ? 'bg-[#061e16] border-emerald-800/80 hover:border-emerald-500' 
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BankLogo code="ICICI" size="md" />
                      <div>
                        <h5 className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          ICICI Bank
                        </h5>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          Rate 8.75% | Max Term 30yrs
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#d8232a] hover:underline shrink-0">
                      View
                    </span>
                  </div>

                  {/* Card 4: HDFC Bank */}
                  <div 
                    onClick={() => setActiveTab('banks')}
                    className={`p-3.5 rounded-2xl border shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isDark 
                        ? 'bg-[#061e16] border-emerald-800/80 hover:border-emerald-500' 
                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <BankLogo code="HDFC" size="md" />
                      <div>
                        <h5 className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          HDFC Bank
                        </h5>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          Rate 8.7% | Max Term 30yrs
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#d8232a] hover:underline shrink-0">
                      View
                    </span>
                  </div>

                </div>
              </div>

              {/* Bottom Action Button: Check Bank Offers */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('banks')}
                  className="w-full py-3.5 px-6 rounded-full bg-[#d8232a] hover:bg-[#b81d23] text-white text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-center shadow-lg shadow-red-600/30 hover:scale-[1.01] active:scale-95"
                >
                  Explore 40+ Bank Offers & Deals →
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: BANK OFFERS LIST */}
        {activeTab === 'banks' && (
          <div className="space-y-4 animate-in fade-in">
            <div className={`p-4 sm:p-5 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md ${
              isDark ? 'bg-gradient-to-r from-emerald-800 via-teal-900 to-[#082b20]' : 'bg-gradient-to-r from-[#d8232a] via-[#b81d23] to-[#8f141a]'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-white" />
                  <h3 className="text-base sm:text-lg font-bold text-white font-serif-luxury">
                    Compare 40+ Bank Interest Rates & Deals
                  </h3>
                </div>
                <p className="text-xs text-white/80 mt-0.5">
                  Live estimates based on ₹{eligibility.maxLoanAmount.toLocaleString('en-IN')} eligible amount over {tenureYears} years.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('eligibility')}
                className="px-4 py-2 rounded-full bg-white text-slate-900 font-extrabold text-xs shadow-xs hover:bg-slate-100 cursor-pointer self-start sm:self-center"
              >
                ← Back to Eligibility
              </button>
            </div>

            <div className="space-y-3">
              {TOP_BANKS.map((bank) => {
                const r = bank.rate / (12 * 100);
                const n = tenureYears * 12;
                const bankEmi = Math.round((eligibility.maxLoanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

                return (
                  <div 
                    key={bank.name}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isDark 
                        ? 'bg-[#07241a] border-emerald-900/60 hover:border-emerald-400' 
                        : 'bg-white border-slate-200 hover:border-slate-400 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-[240px]">
                        <BankLogo code={bank.code} size="lg" />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-sm sm:text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {bank.name}
                            </h4>
                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-red-50 text-[#d8232a] border-red-200'
                            }`}>
                              {bank.tag}
                            </span>
                          </div>
                          <span className={`text-[11px] font-semibold block mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {bank.category} • Max LTV {bank.maxLtv}
                          </span>
                        </div>
                      </div>

                      <div className={`grid grid-cols-3 gap-3 text-center sm:text-left py-2 border-y lg:border-y-0 lg:border-x px-0 lg:px-6 ${
                        isDark ? 'border-emerald-900/60' : 'border-slate-200'
                      }`}>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Interest Rate</span>
                          <span className={`text-base sm:text-lg font-black ${isDark ? 'text-emerald-300' : 'text-[#d8232a]'}`}>
                            {bank.rate}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly EMI</span>
                          <span className={`text-base sm:text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            ₹{bankEmi.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Processing Fee</span>
                          <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {bank.processingFee}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            setInterestRate(bank.rate);
                            setActiveTab('eligibility');
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#d8232a] hover:bg-[#b81d23] text-white transition-all cursor-pointer shadow-xs"
                        >
                          Apply This Rate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: AMORTIZATION SCHEDULE */}
        {activeTab === 'amortization' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Yearly Loan Amortization Schedule
                </h4>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Breakdown based on eligible loan of {formatEligibleAmount(eligibility.maxLoanAmount)} @ {interestRate}% for {tenureYears} years
                </p>
              </div>
              <span className={`text-xs font-extrabold ${isDark ? 'text-emerald-300' : 'text-[#d8232a]'}`}>
                ₹{eligibility.monthlyEmi.toLocaleString('en-IN')}/mo
              </span>
            </div>

            <div className={`overflow-x-auto rounded-2xl border shadow-xs ${
              isDark ? 'border-emerald-900/60' : 'border-slate-200'
            }`}>
              <table className="w-full text-xs text-left">
                <thead className={`text-[11px] font-black uppercase border-b ${
                  isDark 
                    ? 'bg-[#07241a] text-emerald-300 border-emerald-900/60' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  <tr>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Opening Balance</th>
                    <th className="py-2.5 px-3 text-blue-600 dark:text-emerald-400">Principal Paid</th>
                    <th className="py-2.5 px-3 text-amber-600 dark:text-amber-400">Interest Paid</th>
                    <th className="py-2.5 px-3">Total Annual Outflow</th>
                    <th className="py-2.5 px-3 text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  isDark ? 'divide-emerald-950/60 bg-[#061e15]' : 'divide-slate-100 bg-white'
                }`}>
                  {amortizationSchedule.map((row) => (
                    <tr key={row.year} className={`transition-colors font-medium ${
                      isDark ? 'hover:bg-[#0a2f22]' : 'hover:bg-slate-50'
                    }`}>
                      <td className={`py-2.5 px-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Yr {row.year}</td>
                      <td className={`py-2.5 px-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>₹{row.openingBalance.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-emerald-400">₹{row.principalPaid.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-600 dark:text-amber-400">₹{row.interestPaid.toLocaleString('en-IN')}</td>
                      <td className={`py-2.5 px-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{row.totalPayment.toLocaleString('en-IN')}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>₹{row.closingBalance.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: UTTARAKHAND GOVERNMENT SUBSIDIES */}
        {activeTab === 'subsidies' && (
          <div className="space-y-4 animate-in fade-in">
            <div className={`p-5 rounded-3xl border space-y-2.5 ${
              isDark ? 'bg-[#07241a] border-amber-700/60' : 'bg-amber-50/70 border-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏔️</span>
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Deen Dayal Upadhyay Homestay Subsidy Scheme
                </h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Up to ₹15 Lakhs
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                For building or refurbishing homestays in hill districts, Uttarakhand Tourism offers up to 33% capital subsidy (max ₹15 Lakhs) and 50% interest subsidy on bank loans for the first 5 years.
              </p>
            </div>

            <div className={`p-5 rounded-3xl border space-y-2 ${
              isDark ? 'bg-[#07241a] border-emerald-900/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Women Co-Owner Stamp Duty Concession (25% Discount)
                </h4>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                In Uttarakhand, registering property in a woman's name offers a subsidized stamp duty rate of just 3.75% instead of standard 5.00%, saving ₹1.25 Lakhs per ₹1 Crore.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
