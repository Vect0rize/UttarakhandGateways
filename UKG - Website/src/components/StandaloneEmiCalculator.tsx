import React, { useState, useMemo } from 'react';
import { Calculator, IndianRupee, Percent, Clock, PieChart, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
    return `${cr} ${isHindi ? 'करोड़' : 'Cr'}`;
  }
  if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(2);
    return `${lk} ${isHindi ? 'लाख' : 'Lakh'}`;
  }
  return formatIndianCurrency(amount);
}

interface StandaloneEmiCalculatorProps {
  initialPrice?: number;
  className?: string;
}

export const StandaloneEmiCalculator: React.FC<StandaloneEmiCalculatorProps> = ({
  initialPrice = 3500000,
  className = '',
}) => {
  const { isHindi } = useLanguage();

  const [loanAmount, setLoanAmount] = useState<number>(() => Math.max(500000, initialPrice || 3500000));
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [tenureMode, setTenureMode] = useState<'years' | 'months'>('years');

  const { monthlyEmi, totalInterest, totalRepayment, principalPercent, interestPercent } = useMemo(() => {
    const P = Math.max(0, loanAmount);
    const annualRate = Math.max(0.1, interestRate);
    const N = tenureMode === 'years' ? tenureYears * 12 : tenureYears;
    
    if (P <= 0 || N <= 0) {
      return { monthlyEmi: 0, totalInterest: 0, totalRepayment: 0, principalPercent: 0, interestPercent: 0 };
    }

    const r = (annualRate / 12) / 100;
    const numerator = P * r * Math.pow(1 + r, N);
    const denominator = Math.pow(1 + r, N) - 1;
    const emi = denominator === 0 ? 0 : Math.round(numerator / denominator);
    const repayment = Math.round(emi * N);
    const interest = Math.max(0, repayment - P);

    const pPct = repayment > 0 ? Math.round((P / repayment) * 100) : 50;
    const iPct = repayment > 0 ? 100 - pPct : 50;

    return {
      monthlyEmi: emi,
      totalInterest: interest,
      totalRepayment: repayment,
      principalPercent: pPct,
      interestPercent: iPct,
    };
  }, [loanAmount, interestRate, tenureYears, tenureMode]);

  return (
    <section id="emi-calculator-section" className={`w-full py-12 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-200 dark:border-emerald-800">
            <Calculator className="w-3.5 h-3.5" />
            <span>{isHindi ? 'ऋण गणना साधन' : 'Home Loan Tool'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0a271c] dark:text-white font-serif-luxury tracking-tight">
            {isHindi ? 'होम लोन ईएमआई कैलकुलेटर' : 'Home Loan EMI Calculator'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            {isHindi 
              ? 'ऋण राशि, ब्याज दर और अवधि के आधार पर अपनी सटीक मासिक किस्त (EMI) और कुल ब्याज की गणना करें।' 
              : 'Calculate your monthly EMI, total interest payable, and repayment schedule in Indian standard formatting.'}
          </p>
        </div>

        {/* Main Calculator Panel */}
        <div className="bg-white dark:bg-[#071f17] rounded-3xl p-6 sm:p-8 lg:p-10 border border-emerald-200/80 dark:border-emerald-900/60 shadow-xl shadow-emerald-950/5 relative overflow-hidden transition-colors">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Sliders & Numeric Inputs */}
            <div className="lg:col-span-7 space-y-7">
              
              {/* 1. Loan Amount */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label htmlFor="emi-loan-amount-input" className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'ऋण राशि (Loan Amount)' : 'Loan Amount'}</span>
                  </label>
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs font-semibold text-slate-400">₹</span>
                    <input
                      id="emi-loan-amount-input"
                      type="number"
                      aria-label={isHindi ? 'ऋण राशि' : 'Loan Amount'}
                      min={100000}
                      max={50000000}
                      step={50000}
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                      className="w-28 sm:w-36 text-right font-black text-sm text-slate-900 dark:text-white bg-transparent outline-none"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  aria-label={isHindi ? 'ऋण राशि स्लाइडर' : 'Loan Amount Slider'}
                  min={500000}
                  max={25000000}
                  step={100000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-emerald-600 dark:accent-emerald-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span>₹5 Lakh</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">{formatInLakhsOrCrores(loanAmount, isHindi)}</span>
                  <span>₹2.5 Crore</span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[2000000, 3500000, 5000000, 7500000, 10000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setLoanAmount(amt)}
                      className={`text-[10px] sm:text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                        loanAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                      }`}
                    >
                      {formatInLakhsOrCrores(amt, isHindi)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Interest Rate */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label htmlFor="emi-interest-rate-input" className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'वार्षिक ब्याज दर (Annual Interest Rate)' : 'Interest Rate (% p.a.)'}</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <input
                      id="emi-interest-rate-input"
                      type="number"
                      aria-label={isHindi ? 'वार्षिक ब्याज दर' : 'Interest Rate'}
                      min={6}
                      max={18}
                      step={0.1}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Math.max(1, Number(e.target.value)))}
                      className="w-16 text-right font-black text-sm text-slate-900 dark:text-white bg-transparent outline-none"
                    />
                    <span className="text-xs font-semibold text-slate-400">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  aria-label={isHindi ? 'ब्याज दर स्लाइडर' : 'Interest Rate Slider'}
                  min={6.5}
                  max={15}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-emerald-600 dark:accent-emerald-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span>6.5%</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">{interestRate.toFixed(1)}% p.a.</span>
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

              {/* 3. Loan Tenure */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label htmlFor="emi-loan-tenure-input" className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{isHindi ? 'ऋण अवधि (Tenure)' : 'Loan Tenure'}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
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
                            ? 'bg-white dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 shadow-xs' 
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {isHindi ? 'वर्ष' : 'Years'}
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
                            ? 'bg-white dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 shadow-xs' 
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {isHindi ? 'महीने' : 'Months'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <input
                        id="emi-loan-tenure-input"
                        type="number"
                        aria-label={isHindi ? 'ऋण अवधि' : 'Loan Tenure'}
                        min={1}
                        max={tenureMode === 'years' ? 30 : 360}
                        value={tenureYears}
                        onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value)))}
                        className="w-14 text-right font-black text-sm text-slate-900 dark:text-white bg-transparent outline-none"
                      />
                      <span className="text-xs font-semibold text-slate-400">
                        {tenureMode === 'years' ? (isHindi ? 'वर्ष' : 'Yr') : (isHindi ? 'माह' : 'Mo')}
                      </span>
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  aria-label={isHindi ? 'ऋण अवधि स्लाइडर' : 'Loan Tenure Slider'}
                  min={1}
                  max={tenureMode === 'years' ? 30 : 360}
                  step={1}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full accent-emerald-600 dark:accent-emerald-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  <span>{tenureMode === 'years' ? '1 Year' : '12 Mo'}</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                    {tenureMode === 'years' ? `${tenureYears} Years` : `${tenureYears} Months`}
                  </span>
                  <span>{tenureMode === 'years' ? '30 Years' : '360 Mo'}</span>
                </div>
              </div>

            </div>

            {/* Right Column: Calculated Results & Repayment Breakdown Card */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full bg-emerald-50/70 dark:bg-slate-900/80 rounded-2xl p-6 border border-emerald-200/90 dark:border-emerald-800/80 space-y-6">
              
              <div>
                <span className="text-xs uppercase font-extrabold text-emerald-700 dark:text-emerald-400 tracking-wider block mb-1">
                  {isHindi ? 'मासिक ईएमआई (Monthly Installment)' : 'Calculated Monthly EMI'}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#0a271c] dark:text-white tracking-tight">
                  {formatIndianCurrency(monthlyEmi)}
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1.5 font-normal">
                    {isHindi ? '/ माह' : '/ month'}
                  </span>
                </div>
              </div>

              {/* Progress visual bar: Principal vs Interest */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                    {isHindi ? 'मूलधन (Principal)' : 'Principal'}: {principalPercent}%
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    {isHindi ? 'ब्याज (Interest)' : 'Total Interest'}: {interestPercent}%
                  </span>
                </div>
                
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${principalPercent}%` }}
                    title={`Principal: ${principalPercent}%`}
                  />
                  <div 
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${interestPercent}%` }}
                    title={`Interest: ${interestPercent}%`}
                  />
                </div>
              </div>

              {/* Detailed Breakdown List */}
              <div className="space-y-3 pt-3 border-t border-emerald-200/60 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>{isHindi ? 'मूल ऋण राशि' : 'Principal Loan Amount'}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatIndianCurrency(loanAmount)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>{isHindi ? 'कुल देय ब्याज' : 'Total Interest Payable'}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{formatIndianCurrency(totalInterest)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-900 dark:text-white font-extrabold text-sm pt-2 border-t border-dashed border-emerald-200 dark:border-slate-800">
                  <span>{isHindi ? 'कुल भुगतान (मूल + ब्याज)' : 'Total Payment (Principal + Interest)'}</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{formatIndianCurrency(totalRepayment)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/80 dark:bg-slate-950/60 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  {isHindi 
                    ? 'मानक रिड्यूसिंग बैलेंस विधि अनुसार गणना। बैंक शुल्क पृथक हो सकते हैं।' 
                    : 'Calculated using standard reducing-balance loan formula. Actual bank processing fees may apply.'}
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
