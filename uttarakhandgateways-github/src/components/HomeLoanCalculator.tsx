import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  IndianRupee, 
  Percent, 
  Clock, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  Info, 
  Sparkles,
  Scale,
  Award,
  ChevronRight,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface HomeLoanCalculatorProps {
  initialPrice?: number;
  isModal?: boolean;
  onClose?: () => void;
}

interface BankRateInfo {
  id: string;
  name: string;
  shortName: string;
  rate: number;
  tag: string;
  processingFee: string;
  logoBg: string;
  logoColor: string;
  icon: 'sbi' | 'hdfc' | 'icici' | 'bob' | 'pnb' | 'axis' | 'ugb' | 'canara' | 'kotak';
}

const TOP_BANKS: BankRateInfo[] = [
  { 
    id: 'bob',
    name: 'Bank of Baroda', 
    shortName: 'Bank of Baroda',
    rate: 8.40, 
    tag: 'Lowest Rate', 
    processingFee: '0.25% (Max ₹8,500)',
    logoBg: '#fff3ea',
    logoColor: '#f26522',
    icon: 'bob'
  },
  { 
    id: 'sbi',
    name: 'State Bank of India', 
    shortName: 'SBI',
    rate: 8.50, 
    tag: 'Most Popular', 
    processingFee: '0.35% (Max ₹10,000)',
    logoBg: '#eef3fc',
    logoColor: '#22408c',
    icon: 'sbi'
  },
  { 
    id: 'hdfc',
    name: 'HDFC Bank', 
    shortName: 'HDFC Bank',
    rate: 8.70, 
    tag: 'Fast Sanction', 
    processingFee: '0.50% (Max ₹15,000)',
    logoBg: '#eaf2fd',
    logoColor: '#004c8f',
    icon: 'hdfc'
  },
  { 
    id: 'icici',
    name: 'ICICI Bank', 
    shortName: 'ICICI Bank',
    rate: 8.75, 
    tag: 'Flexible Terms', 
    processingFee: '0.50% (Max ₹15,000)',
    logoBg: '#fff1ec',
    logoColor: '#b02a30',
    icon: 'icici'
  },
  { 
    id: 'pnb',
    name: 'Punjab National Bank', 
    shortName: 'PNB',
    rate: 8.45, 
    tag: 'Govt. Backed', 
    processingFee: '0.35% (Max ₹10,000)',
    logoBg: '#fbebf0',
    logoColor: '#a20034',
    icon: 'pnb'
  },
  { 
    id: 'kotak',
    name: 'Kotak Mahindra Bank', 
    shortName: 'Kotak Bank',
    rate: 8.70, 
    tag: 'Digital Approval', 
    processingFee: '0.50% (Max ₹10,000)',
    logoBg: '#fef2f2',
    logoColor: '#ec1c24',
    icon: 'kotak'
  },
  { 
    id: 'axis',
    name: 'Axis Bank', 
    shortName: 'Axis Bank',
    rate: 8.75, 
    tag: 'Quick Disbursal', 
    processingFee: '0.50% (Max ₹15,000)',
    logoBg: '#faeef3',
    logoColor: '#97144d',
    icon: 'axis'
  },
  { 
    id: 'ugb',
    name: 'Uttarakhand Gramin Bank', 
    shortName: 'UGB',
    rate: 8.65, 
    tag: 'Hill Branches', 
    processingFee: '0.25% (Nominal)',
    logoBg: '#ecfdf5',
    logoColor: '#059669',
    icon: 'ugb'
  },
  { 
    id: 'canara',
    name: 'Canara Bank', 
    shortName: 'Canara Bank',
    rate: 8.55, 
    tag: 'Easy Sanction', 
    processingFee: '0.30% (Max ₹10,000)',
    logoBg: '#eef6fc',
    logoColor: '#005baa',
    icon: 'canara'
  },
];

const PRESET_PRICES = [
  { label: '₹25 L', value: 2500000 },
  { label: '₹50 L', value: 5000000 },
  { label: '₹75 L', value: 7500000 },
  { label: '₹1 Cr', value: 10000000 },
  { label: '₹2 Cr', value: 20000000 },
  { label: '₹5 Cr', value: 50000000 },
];

// High-fidelity Official Bank Logo Vector SVG Component
const BankLogo: React.FC<{ type: string; className?: string }> = ({ type, className = "w-8 h-8" }) => {
  switch (type) {
    case 'sbi':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none">
          <circle cx="50" cy="50" r="48" fill="#00a4e4" />
          <circle cx="50" cy="50" r="15" fill="#ffffff" />
          <rect x="45.5" y="50" width="9" height="48" fill="#ffffff" />
        </svg>
      );
    case 'hdfc':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect width="48" height="48" rx="8" fill="#ed232a" />
          <rect x="6" y="6" width="36" height="36" rx="3" fill="#ffffff" />
          {/* 4 corner red squares */}
          <rect x="9" y="9" width="11" height="11" fill="#ed232a" />
          <rect x="28" y="9" width="11" height="11" fill="#ed232a" />
          <rect x="9" y="28" width="11" height="11" fill="#ed232a" />
          <rect x="28" y="28" width="11" height="11" fill="#ed232a" />
          {/* Official deep navy blue center square */}
          <rect x="18" y="18" width="12" height="12" fill="#004c8f" />
        </svg>
      );
    case 'icici':
      return (
        <svg viewBox="120 44 26 26" className={className} fill="none">
          <path
            d="m 126.52861,50.421605 c 3.74965,-3.722081 8.29855,-4.688086 10.11894,-2.151117 1.82039,2.536968 0.22049,7.664648 -3.52916,11.386729 -3.74964,3.749642 -8.29854,4.714269 -10.14649,2.14974 -1.79145,-2.563151 -0.19155,-7.664649 3.55671,-11.385352"
            fill="#f06321"
          />
          <path
            d="m 129.01046,48.435852 c -0.41341,0.303169 -0.82682,0.661459 -1.24023,1.048687 -3.28111,3.252171 -4.66053,7.718392 -3.03306,9.952192 1.6812,2.232422 5.70645,1.405599 9.07024,-1.87551 1.82039,-1.763889 3.03306,-3.804763 3.52916,-5.706456 0.1378,-1.405599 -0.0551,-2.647211 -0.68902,-3.584277 -1.43316,-1.984375 -4.52134,-1.820389 -7.63709,0.165364"
            fill="#ae282e"
          />
          <path
            d="m 133.75229,48.849264 v 0.08268 c -0.0275,0.468533 -0.30317,1.047309 -0.79926,1.543403 -0.74414,0.71658 -1.73633,0.992187 -2.15112,0.580154 -0.46853,-0.440972 -0.19154,-1.406977 0.55259,-2.178678 0.77171,-0.744141 1.76389,-0.992188 2.17731,-0.551216 0.1378,0.137804 0.22048,0.303169 0.22048,0.523655 m -2.86632,12.654524 c -1.76527,1.322917 -3.58428,1.985754 -5.34954,1.710146 0.74414,0.02756 1.35185,-0.80064 1.84794,-1.903071 0.4961,-1.129991 0.77171,-2.1773 1.01975,-3.170866 0.35829,-1.570963 0.38586,-2.673394 0.19293,-2.921441 -0.30317,-0.387228 -0.96463,-0.303168 -1.73771,0.137804 -0.38585,0.220486 -0.88194,0.08268 -0.30179,-0.633898 0.60634,-0.716579 2.94901,-2.426725 3.77583,-2.702332 0.93844,-0.248047 1.98575,0.110243 1.62746,1.129991 -0.24942,0.744141 -3.50159,9.235612 -1.07487,8.353667"
            fill="#ffffff"
          />
        </svg>
      );
    case 'bob':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none">
          <path
            d="M 9.6894531,0.0078125 0,35.136719 H 0.60742188 L 15.574219,2.3378906 h 0.888672 L 2.546875,35.390625 a 7.283,7.283 0 0 1 0.4179688,0.126953 L 26.923828,2.3925781 h 0.988281 L 4.4960938,36.21875 c 0.1639999,0.1 0.2620156,0.181016 0.4160156,0.291016 L 37.630859,6.8242188 38.019531,7.6347656 6.0820312,37.574219 c 0.2000001,0.21 0.1270626,0.109703 0.2890626,0.345703 L 33.822266,23.677734 34.09375,24.423828 7.234375,39.357422 c 0.1,0.237 0.1084531,0.164156 0.1894531,0.410156 l 25.6640629,-6.662109 -0.08008,0.910156 -25.1289058,7.462891 c 0.027,0.246 0.017578,0.192265 0.017578,0.447265 l 9.9160158,-0.492187 0.02734,-0.01953 c 2.947,-0.109999 5.81975,-0.271749 8.59375,-1.21875 5.694,-1.902 10.462922,-5.668421 11.794922,-10.482421 1.432,-5.16 -2.057813,-10.166516 -8.257813,-10.603516 l 0.02539,-0.119141 c 5.222,-1.428 9.700672,-4.767265 10.888672,-9.0722652 C 43.104766,1.8919687 36.343156,-0.4295 27.785156,0.0625 Z"
            fill="#f26522"
          />
        </svg>
      );
    case 'pnb':
      return (
        <svg viewBox="0 0 50 50" className={className} fill="none">
          <rect width="50" height="50" rx="10" fill="#a20e37" />
          <circle cx="25" cy="25" r="19" fill="#ffc72c" />
          <circle cx="25" cy="25" r="16" fill="#a20e37" />
          <path d="M19 16H31V21H27V34H23V21H19V16Z" fill="#ffc72c" />
          <path d="M23 21H31V30C31 32.5 29 34 26.5 34C24 34 23 32.5 23 30V21Z" fill="#ffc72c" />
          <circle cx="27" cy="27" r="2.2" fill="#a20e37" />
        </svg>
      );
    case 'axis':
      return (
        <svg viewBox="0 0 280 250" className={className} fill="none">
          <path
            d="M 142.27,10.47 C 156.13,34.28 170.11,58.02 183.82,81.92 C 161.66,121.01 139.82,160.29 116.91,198.95 C 108.12,213.79 99.57,228.77 90.88,243.66 C 62.7,243.83 34.52,243.82 6.34,243.78 C 7.2,241.85 8.05,239.91 9.09,238.07 C 53.46,162.19 98,86.41 142.27,10.47 z"
            fill="#97144d"
          />
          <path
            d="M 142.28,155.63 C 170.56,155.62 198.84,155.42 227.12,155.89 C 243.96,185.25 261.34,214.29 278.03,243.73 C 249.75,243.87 221.48,243.76 193.2,243.74 C 176.37,214.28 158.79,185.27 142.28,155.63 z"
            fill="#97144d"
          />
        </svg>
      );
    case 'kotak':
      return (
        <svg viewBox="2 1.7 30 25.6" className={className} fill="none">
          <path d="M2.28,14.5C2.28,7.43,8.94,1.7,17.16,1.7s14.88,5.73,14.88,12.8-6.66,12.8-14.88,12.8S2.28,21.57,2.28,14.5Z" fill="#003974"/>
          <polygon points="15.35 5.83 18.81 4.69 18.83 23.38 15.34 24.55 15.35 5.83" fill="#ec1c24"/>
          <path d="M17.4,17.47c-1.5,1.81-2.95,3.66-5.67,3.66-3.84,0-5.66-3.71-5.66-6.82s1.42-6.51,5.17-6.51c1.62,0,3.19.99,4.12,2.04v2.53c-.78-.52-2.52-1.04-3.66-1.06-2.37-.04-4.47.99-4.43,3.33.03,1.61,1.62,2.71,3.21,2.71,2.44,0,3.91-2.22,5.14-3.91.34-.44,1.31-1.74,1.47-1.95,1.37-1.91,2.95-3.66,5.67-3.66,3.2,0,5,2.58,5.51,5.24h-1.44c-.58-.86-1.7-1.39-2.8-1.39-2.52,0-4.02,2.32-5.28,4.02,0,0-.98,1.33-1.33,1.76ZM28.35,15.79c-.32,2.67-1.82,5.37-5.1,5.38-1.91,0-3.4-1.31-4.44-2.91v-1.85c1.29.64,2.5,1.33,3.97,1.35,1.81.03,3.44-.67,4.12-1.97h1.45Z" fill="#ffffff"/>
        </svg>
      );
    case 'ugb':
      return (
        <svg viewBox="0 0 50 50" className={className} fill="none">
          <rect width="50" height="50" rx="10" fill="#044d38" />
          <circle cx="36" cy="16" r="6" fill="#facc15" />
          <path d="M8 38L22 18L34 38H8Z" fill="#34d399" />
          <path d="M24 38L34 24L44 38H24Z" fill="#10b981" />
          <path d="M16 38L22 30L28 38H16Z" fill="#ffffff" opacity="0.95" />
        </svg>
      );
    case 'canara':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none">
          <rect width="48" height="48" rx="10" fill="#005baa" />
          <path d="M14 14L28 34H14V14Z" fill="#fdb813" />
          <path d="M34 34L20 14H34V34Z" fill="#ffffff" />
        </svg>
      );
    default:
      return <Building2 className={className} />;
  }
};

export const HomeLoanCalculator: React.FC<HomeLoanCalculatorProps> = ({
  initialPrice = 5000000,
  isModal = false,
  onClose
}) => {
  const { isHindi } = useLanguage();

  // Primary calculator state
  const [propertyPrice, setPropertyPrice] = useState<number>(initialPrice || 5000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.50);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [selectedBankId, setSelectedBankId] = useState<string>('sbi');

  // Secondary tabs inside calculator
  const [activeTab, setActiveTab] = useState<'main' | 'amortization' | 'banks' | 'eligibility' | 'subsidies'>('main');
  const [showAllAmortization, setShowAllAmortization] = useState(false);

  // Eligibility sub-calculator state
  const [monthlyIncome, setMonthlyIncome] = useState<number>(100000);
  const [existingEmi, setExistingEmi] = useState<number>(10000);

  // Computed Loan Principal
  const downPaymentAmount = Math.round((propertyPrice * downPaymentPercent) / 100);
  const loanPrincipal = Math.max(0, propertyPrice - downPaymentAmount);

  // Monthly EMI Calculation Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const calculationResult = useMemo(() => {
    if (loanPrincipal <= 0) {
      return { monthlyEmi: 0, totalPayment: 0, totalInterest: 0, principalPercent: 100, interestPercent: 0 };
    }
    const r = interestRate / (12 * 100);
    const n = tenureYears * 12;

    const emi = Math.round((loanPrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    const totalPay = emi * n;
    const interest = Math.max(0, totalPay - loanPrincipal);
    const intPct = Math.round((interest / totalPay) * 100) || 0;
    const princPct = 100 - intPct;

    return {
      monthlyEmi: isNaN(emi) ? 0 : emi,
      totalPayment: isNaN(totalPay) ? 0 : totalPay,
      totalInterest: isNaN(interest) ? 0 : interest,
      principalPercent: princPct,
      interestPercent: intPct,
    };
  }, [loanPrincipal, interestRate, tenureYears]);

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

    let balance = loanPrincipal;
    const r = interestRate / (12 * 100);
    const emi = calculationResult.monthlyEmi;

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
  }, [loanPrincipal, interestRate, tenureYears, calculationResult.monthlyEmi]);

  // Loan Eligibility Calculator (50% FOIR)
  const eligibilityResult = useMemo(() => {
    const maxDisposableForEmi = Math.max(0, monthlyIncome * 0.5 - existingEmi);
    const r = interestRate / (12 * 100);
    const n = tenureYears * 12;

    const maxLoan = Math.round(
      (maxDisposableForEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n))
    );

    return {
      maxMonthlyEmi: Math.round(maxDisposableForEmi),
      maxLoanAmount: Math.max(0, isNaN(maxLoan) ? 0 : maxLoan),
      recommendedPropertyBudget: Math.round(maxLoan / 0.8),
    };
  }, [monthlyIncome, existingEmi, interestRate, tenureYears]);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lakh`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleSelectBank = (bank: BankRateInfo) => {
    setSelectedBankId(bank.id);
    setInterestRate(bank.rate);
  };

  return (
    <div className="w-full bg-white dark:bg-[#061d15] rounded-3xl border border-emerald-100 dark:border-emerald-900/60 shadow-xl overflow-hidden flex flex-col transition-all">
      
      {/* 1. Sleek Modern Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-[#07241a] via-[#0a3325] to-[#07241a] text-white flex items-center justify-between border-b border-emerald-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-serif-luxury">
                {isHindi ? 'गृह ऋण एवं ईएमआई कैलकुलेटर' : 'Home Loan & EMI Calculator'}
              </h2>
              <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
                Live Rates 2026
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-200/70">
              {isHindi 
                ? 'उत्तराखंड संपत्तियों हेतु त्वरित ईएमआई व बैंक तुलना' 
                : 'Instant EMI calculations & verified bank interest rates'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. HTML MOVING ANIMATION FOR BANKS WITH THEIR LOGOS (Infinite Marquee Ticker) */}
      <div className="relative py-2.5 bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/70 dark:from-[#04160f] dark:via-[#072118] dark:to-[#04160f] border-b border-emerald-100 dark:border-emerald-900/40 overflow-hidden select-none">
        
        {/* Soft edge blur overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white dark:from-[#04160f] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white dark:from-[#04160f] to-transparent z-10 pointer-events-none" />

        {/* Moving Marquee Track */}
        <div className="animate-bank-marquee flex items-center gap-3">
          {/* Double array for seamless loop */}
          {[...TOP_BANKS, ...TOP_BANKS].map((bank, idx) => {
            const isSelected = interestRate === bank.rate;
            return (
              <button
                key={`${bank.id}-${idx}`}
                type="button"
                onClick={() => handleSelectBank(bank)}
                className={`flex items-center gap-3 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border transition-all cursor-pointer whitespace-nowrap shrink-0 group ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md scale-[1.02]'
                    : 'bg-white dark:bg-[#061f17] border-emerald-100 dark:border-emerald-900/60 hover:border-emerald-400 text-slate-800 dark:text-emerald-100 shadow-xs'
                }`}
                title={`Select ${bank.name} (${bank.rate}% p.a.)`}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-1 bg-slate-50 dark:bg-[#051c14] border border-slate-100 dark:border-emerald-900/60 shadow-xs group-hover:scale-105 transition-transform">
                  <BankLogo type={bank.icon} className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs sm:text-sm font-extrabold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {bank.shortName}
                    </span>
                    <span className={`text-xs font-black px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {bank.rate}%
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold ${
                    isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {bank.tag}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Clean View Mode Switcher */}
      <div className="px-6 pt-3 pb-2 flex items-center justify-between border-b border-slate-100 dark:border-emerald-950/80 bg-slate-50/50 dark:bg-[#051811]">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('main')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'main'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{isHindi ? 'कैलकुलेटर' : 'Calculator'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('banks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'banks'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{isHindi ? 'बैंक दरें' : 'Bank Rates'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('amortization')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'amortization'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isHindi ? 'वार्षिक तालिका' : 'Amortization'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('eligibility')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'eligibility'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isHindi ? 'पात्रता' : 'Eligibility'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subsidies')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'subsidies'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-amber-700 dark:text-amber-400 hover:text-amber-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{isHindi ? 'सब्सिडी योजनाएं' : 'Subsidies'}</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>MDDA & Section 143 Approved</span>
        </div>
      </div>

      {/* 4. MAIN CONTENT AREA */}
      <div className="p-5 sm:p-7 overflow-y-auto">

        {/* PRIMARY VIEW: 2-COLUMN SPACIOUS & AIRY FINTECH GUI */}
        {activeTab === 'main' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* LEFT COLUMN: Clean Sliders & Inputs (7 Columns) */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* 1. Property Price Slider */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-[#07241a] border border-slate-200/80 dark:border-emerald-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-emerald-200 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {isHindi ? 'प्रॉपर्टी की कुल कीमत' : 'Total Property Price'}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(propertyPrice)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={1000000}
                    max={50000000}
                    step={500000}
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />

                  {/* Clean Quick Pill Selectors */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {PRESET_PRICES.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setPropertyPrice(preset.value)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          propertyPrice === preset.value
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white dark:bg-[#061f17] border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Down Payment Slider */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-[#07241a] border border-slate-200/80 dark:border-emerald-900/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                      {isHindi ? 'डाउन पेमेंट' : 'Down Payment'}
                    </span>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mr-1.5">
                        {downPaymentPercent}%
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                        ({formatCurrency(downPaymentAmount)})
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={5}
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />

                  <div className="flex items-center gap-1.5">
                    {[10, 20, 30, 40, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDownPaymentPercent(pct)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          downPaymentPercent === pct
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-white dark:bg-[#061f17] border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Interest Rate & Tenure (Side-by-Side Sub Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Interest Rate */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#07241a] border border-slate-200/80 dark:border-emerald-900/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-emerald-200 flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {isHindi ? 'ब्याज दर' : 'Interest Rate'}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                        {interestRate}% p.a.
                      </span>
                    </div>

                    <input
                      type="range"
                      min={6.5}
                      max={12}
                      step={0.05}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />

                    <div className="flex items-center gap-1 flex-wrap">
                      {TOP_BANKS.slice(0, 4).map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleSelectBank(b)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            interestRate === b.rate
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-[#061f17] border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                          }`}
                        >
                          {b.shortName} ({b.rate}%)
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Loan Tenure */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-[#07241a] border border-slate-200/80 dark:border-emerald-900/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-emerald-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {isHindi ? 'ऋण अवधि' : 'Tenure'}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                        {tenureYears} {isHindi ? 'वर्ष' : 'Years'}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={1}
                      value={tenureYears}
                      onChange={(e) => setTenureYears(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />

                    <div className="flex items-center gap-1 flex-wrap">
                      {[10, 15, 20, 25, 30].map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setTenureYears(yr)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            tenureYears === yr
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-[#061f17] border border-slate-200 dark:border-emerald-900 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                          }`}
                        >
                          {yr}Y
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* RIGHT COLUMN: Elegant Floating EMI Summary Card (5 Columns) */}
              <div className="lg:col-span-5 space-y-4">
                
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0a3828] via-[#0d4533] to-[#07291d] text-white shadow-xl shadow-emerald-950/20 border border-emerald-700/40 relative overflow-hidden">
                  
                  {/* Subtle ambient lighting */}
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300 block">
                    {isHindi ? 'अनुमानित मासिक ईएमआई' : 'Monthly Loan EMI'}
                  </span>

                  <div className="mt-2 flex items-baseline gap-1.5 font-serif-luxury">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      ₹{calculationResult.monthlyEmi.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs sm:text-sm font-sans font-medium text-emerald-200/80">
                      / {isHindi ? 'माह' : 'month'}
                    </span>
                  </div>

                  {/* Clean Visual Progress Bar */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-100">
                      <span>{isHindi ? 'मूलधन' : 'Principal'}: {calculationResult.principalPercent}%</span>
                      <span>{isHindi ? 'ब्याज' : 'Interest'}: {calculationResult.interestPercent}%</span>
                    </div>

                    <div className="h-3 rounded-full bg-emerald-950/80 p-0.5 flex overflow-hidden">
                      <div 
                        style={{ width: `${calculationResult.principalPercent}%` }} 
                        className="bg-emerald-400 rounded-full transition-all duration-300" 
                        title={`Principal: ${calculationResult.principalPercent}%`}
                      />
                      <div 
                        style={{ width: `${calculationResult.interestPercent}%` }} 
                        className="bg-amber-400 rounded-full transition-all duration-300" 
                        title={`Interest: ${calculationResult.interestPercent}%`}
                      />
                    </div>
                  </div>

                  {/* Breakdown Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-emerald-800/60 text-xs">
                    <div>
                      <span className="text-emerald-300/80 block text-[11px]">
                        {isHindi ? 'ऋण मूलधन' : 'Loan Amount'}
                      </span>
                      <span className="font-extrabold text-sm sm:text-base text-white mt-0.5 block">
                        {formatCurrency(loanPrincipal)}
                      </span>
                    </div>

                    <div>
                      <span className="text-emerald-300/80 block text-[11px]">
                        {isHindi ? 'कुल ब्याज' : 'Total Interest'}
                      </span>
                      <span className="font-extrabold text-sm sm:text-base text-amber-300 mt-0.5 block">
                        {formatCurrency(calculationResult.totalInterest)}
                      </span>
                    </div>

                    <div>
                      <span className="text-emerald-300/80 block text-[11px]">
                        {isHindi ? 'डाउन पेमेंट' : 'Down Payment'}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-slate-200 mt-0.5 block">
                        {formatCurrency(downPaymentAmount)}
                      </span>
                    </div>

                    <div>
                      <span className="text-emerald-300/80 block text-[11px]">
                        {isHindi ? 'कुल देय राशि' : 'Total Payable'}
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-white mt-0.5 block">
                        {formatCurrency(calculationResult.totalPayment)}
                      </span>
                    </div>
                  </div>

                  {/* Deep Insight Navigation Pills */}
                  <div className="mt-5 pt-4 border-t border-emerald-800/60 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('amortization')}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>{isHindi ? 'वार्षिक तालिका' : 'Schedule'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('eligibility')}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>{isHindi ? 'ऋण पात्रता' : 'Eligibility'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* Subsidies Teaser Banner */}
                <div 
                  onClick={() => setActiveTab('subsidies')}
                  className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300/80 dark:border-amber-700/60 flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🏔️</span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {isHindi ? 'उत्तराखंड होमस्टे 33% सब्सिडी' : 'Uttarakhand Homestay 33% Subsidy'}
                      </span>
                      <span className="text-[10px] text-amber-800 dark:text-amber-300">
                        {isHindi ? 'पर्वतीय जिलों में ₹15 लाख तक पूंजीगत अनुदान' : 'Up to ₹15 Lakhs capital grant & 25% stamp duty waiver'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: TOP BANKS DETAILED COMPARISON */}
        {activeTab === 'banks' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'प्रमुख बैंकों की होम लोन ब्याज दरें' : 'Partner Banks & Live Interest Rates'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isHindi ? 'अपनी पसंद के बैंक का चयन कर सीधे दर लागू करें' : 'Click any bank to apply their rate directly to your loan calculation'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('main')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                ← {isHindi ? 'कैलकुलेटर पर वापस जाएं' : 'Back to Calculator'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TOP_BANKS.map((bank) => {
                const r = bank.rate / (12 * 100);
                const n = tenureYears * 12;
                const emi = Math.round((loanPrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
                const isSelected = interestRate === bank.rate;

                return (
                  <div
                    key={bank.id}
                    onClick={() => {
                      handleSelectBank(bank);
                      setActiveTab('main');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-[#093022] border-emerald-500 shadow-sm'
                        : 'bg-white dark:bg-[#07241a] border-slate-200 dark:border-emerald-900/60 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center p-1 bg-slate-50 dark:bg-[#051c14] border border-slate-200/80 dark:border-emerald-800 shadow-xs">
                        <BankLogo type={bank.icon} className="w-9 h-9" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {bank.name}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          Fee: {bank.processingFee}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 block">
                        {bank.rate}%
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        ₹{emi.toLocaleString('en-IN')}/mo
                      </span>
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
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'वार्षिक पुनर्भुगतान विवरण' : 'Year-by-Year Amortization Schedule'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatCurrency(loanPrincipal)} Loan at {interestRate}% for {tenureYears} Years
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('main')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                ← {isHindi ? 'कैलकुलेटर' : 'Calculator'}
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-emerald-900/60 shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-[#07241a] text-[11px] font-black uppercase text-slate-600 dark:text-emerald-300 border-b border-slate-200 dark:border-emerald-900/60">
                  <tr>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Opening</th>
                    <th className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400">Principal</th>
                    <th className="py-2.5 px-3 text-amber-700 dark:text-amber-400">Interest</th>
                    <th className="py-2.5 px-3">Total Payment</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/60 bg-white dark:bg-[#061e15]">
                  {(showAllAmortization ? amortizationSchedule : amortizationSchedule.slice(0, 10)).map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50 dark:hover:bg-[#0a2f22] transition-colors font-medium">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">Yr {row.year}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">₹{row.openingBalance.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-700 dark:text-emerald-400">₹{row.principalPaid.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 font-bold text-amber-700 dark:text-amber-400">₹{row.interestPaid.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">₹{row.totalPayment.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-700 dark:text-slate-300">₹{row.closingBalance.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {amortizationSchedule.length > 10 && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllAmortization(!showAllAmortization)}
                  className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 text-emerald-900 dark:text-emerald-200 text-xs font-bold transition-all cursor-pointer"
                >
                  {showAllAmortization 
                    ? (isHindi ? 'कम वर्ष दिखाएं' : 'Show First 10 Years') 
                    : (isHindi ? `सभी ${amortizationSchedule.length} वर्ष देखें` : `Show All ${amortizationSchedule.length} Years`)}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LOAN ELIGIBILITY */}
        {activeTab === 'eligibility' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'ऋण पात्रता कैलकुलेटर' : 'Home Loan Eligibility Calculator'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isHindi ? 'अपनी मासिक आय के आधार पर अधिकतम स्वीकृत ऋण राशि जानें' : 'Estimate maximum sanctionable loan based on 50% FOIR'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('main')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                ← {isHindi ? 'कैलकुलेटर' : 'Calculator'}
              </button>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-700 to-emerald-800 text-white shadow-lg">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-200 block">
                {isHindi ? 'आपकी अधिकतम ऋण क्षमता' : 'Maximum Loan Eligibility'}
              </span>
              <div className="text-3xl sm:text-4xl font-black mt-1 font-serif-luxury tracking-tight">
                {formatCurrency(eligibilityResult.maxLoanAmount)}
              </div>
              <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
                {isHindi 
                  ? `आप ₹${eligibilityResult.maxMonthlyEmi.toLocaleString('en-IN')}/माह तक की सुरक्षित ईएमआई वहन कर सकते हैं।` 
                  : `Qualifies for an EMI of up to ₹${eligibilityResult.maxMonthlyEmi.toLocaleString('en-IN')} / month.`}
              </p>
              <div className="mt-4 pt-3 border-t border-white/20 text-xs flex items-center justify-between">
                <span>{isHindi ? 'अनुशंसित कुल बजट (20% डाउन पेमेंट सहित):' : 'Recommended Total Property Budget:'}</span>
                <span className="font-extrabold text-amber-300 text-sm">{formatCurrency(eligibilityResult.recommendedPropertyBudget)}</span>
              </div>
            </div>

            {/* Income Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-emerald-200 block">
                  {isHindi ? 'मासिक शुद्ध आय' : 'Net Monthly Income (₹)'}
                </label>
                <input
                  type="number"
                  min="15000"
                  step="5000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(Math.max(10000, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#07241a] text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-emerald-200 block">
                  {isHindi ? 'मौजूदा अन्य ईएमआई' : 'Existing Monthly EMIs (₹)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={existingEmi}
                  onChange={(e) => setExistingEmi(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#07241a] text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: UTTARAKHAND GOVERNMENT SUBSIDIES */}
        {activeTab === 'subsidies' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isHindi ? 'उत्तराखंड सरकारी सब्सिडी व लाभ' : 'Uttarakhand Subsidies & Benefits'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isHindi ? 'पर्वतीय जिलों में होमस्टे एवं महिला खरीदारों हेतु विशेष छूट' : 'Special state concessions for hill homestays and women homebuyers'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('main')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                ← {isHindi ? 'कैलकुलेटर' : 'Calculator'}
              </button>
            </div>

            {/* Scheme 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🏔️</span>
                  <span>{isHindi ? 'दीन दयाल उपाध्याय होमस्टे विकास योजना' : 'Deen Dayal Upadhyay Homestay Subsidy Scheme'}</span>
                </h5>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Up to ₹15L
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isHindi 
                  ? 'पर्वतीय जिलों में होमस्टे निर्माण/नवीनीकरण पर बैंक ऋण पर 33% तक पूंजीगत उपादान (अधिकतम ₹15 लाख) व प्रथम 5 वर्षों तक 50% ब्याज उपादान देय है।' 
                  : 'For building or refurbishing homestays in hill districts, Uttarakhand Tourism offers up to 33% capital subsidy (max ₹15 Lakhs) and 50% interest subsidy on bank loans for 5 years.'}
              </p>
            </div>

            {/* Scheme 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#07241a] border border-emerald-200/80 dark:border-emerald-900/60 space-y-2">
              <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{isHindi ? 'महिला सह-स्वामित्व स्टाम्प शुल्क छूट (25% Concession)' : 'Women Co-Owner Stamp Duty Concession (25% Discount)'}</span>
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isHindi 
                  ? 'उत्तराखंड में महिला के नाम पर संपत्ति पंजीकरण कराने पर स्टाम्प ड्यूटी 5% के बजाय केवल 3.75% लगती है।' 
                  : 'Registering property in a woman\'s name offers a subsidized stamp duty rate of just 3.75% instead of standard 5.00%, saving ₹1.25 Lakhs per ₹1 Crore.'}
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
