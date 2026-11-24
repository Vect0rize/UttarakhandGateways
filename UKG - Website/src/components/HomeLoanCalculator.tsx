import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface HomeLoanCalculatorProps {
  initialPrice?: number;
  isModal?: boolean;
  onClose?: () => void;
  initialTab?: string;
}

export const TOP_BANKS: never[] = [];

export const EMI_DISCLAIMER_EN =
  'This calculator provides estimates for informational purposes only. Actual loan terms, interest rates, and repayment amounts may vary depending on the lender and individual circumstances. UKG does not provide loans or financial advice.';

export const EMI_DISCLAIMER_HI =
  'यह कैलकुलेटर केवल सामान्य सूचनात्मक उद्देश्यों के लिए अनुमान प्रदान करता है। वास्तविक ऋण शर्तें, ब्याज दरें और पुनर्भुगतान राशि ऋणदाता और व्यक्तिगत परिस्थितियों के अनुसार भिन्न हो सकती हैं। UKG कोई ऋण या वित्तीय सलाह प्रदान नहीं करता है।';

export const HomeLoanCalculator: React.FC<HomeLoanCalculatorProps> = ({
  initialPrice = 5000000,
  isModal = false,
  onClose,
}) => {
  const { isHindi } = useLanguage();

  const defaultAmount = initialPrice && initialPrice > 0 ? Math.round(initialPrice) : 5000000;
  const [loanAmountInput, setLoanAmountInput] = useState<string>(String(defaultAmount));
  const [interestRateInput, setInterestRateInput] = useState<string>('8.5');
  const [tenureYearsInput, setTenureYearsInput] = useState<string>('20');

  useEffect(() => {
    if (initialPrice && initialPrice > 0) {
      setLoanAmountInput(String(Math.round(initialPrice)));
    }
  }, [initialPrice]);

  const loanAmount = useMemo(() => {
    const num = parseFloat(loanAmountInput.replace(/,/g, ''));
    return isNaN(num) || num < 0 ? 0 : Math.min(num, 1000000000);
  }, [loanAmountInput]);

  const annualRate = useMemo(() => {
    const num = parseFloat(interestRateInput);
    return isNaN(num) || num < 0 ? 0 : Math.min(num, 50);
  }, [interestRateInput]);

  const tenureYears = useMemo(() => {
    const num = parseFloat(tenureYearsInput);
    return isNaN(num) || num < 0 ? 0 : Math.min(num, 40);
  }, [tenureYearsInput]);

  const { monthlyEmi, totalInterest, totalRepayment } = useMemo(() => {
    const months = Math.round(tenureYears * 12);
    if (loanAmount <= 0 || months <= 0) {
      return { monthlyEmi: 0, totalInterest: 0, totalRepayment: 0 };
    }
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) {
      const emiZero = loanAmount / months;
      return {
        monthlyEmi: Math.round(emiZero),
        totalInterest: 0,
        totalRepayment: Math.round(loanAmount),
      };
    }
    const factor = Math.pow(1 + monthlyRate, months);
    const exactEmi = (loanAmount * monthlyRate * factor) / (factor - 1);
    const exactTotal = exactEmi * months;
    const exactInterest = Math.max(0, exactTotal - loanAmount);
    return {
      monthlyEmi: Math.round(exactEmi),
      totalInterest: Math.round(exactInterest),
      totalRepayment: Math.round(exactTotal),
    };
  }, [loanAmount, annualRate, tenureYears]);

  const formatINR = (val: number) => `₹${Math.round(val).toLocaleString('en-IN')}`;

  return (
    <div
      id="emi-calculator-card"
      className="w-full rounded-3xl bg-[#FAF9F6] dark:bg-[#09241A] border border-[#D0D7D2] dark:border-[#32463D] shadow-xl overflow-hidden text-[#12231a] dark:text-[#F4F3EF] transition-colors"
    >
      {/* Header */}
      <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-[#D0D7D2] dark:border-[#32463D] bg-[#f1f3ef] dark:bg-[#061b13] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[#0E3A2B] dark:bg-[#164A37] text-[#F4F3EF] flex items-center justify-center shrink-0 shadow-xs">
            <Calculator className="w-5 h-5 text-[#C2A691]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold font-serif-luxury text-[#0E3A2B] dark:text-[#F4F3EF] truncate">
              {isHindi ? 'ईएमआई कैलकुलेटर (EMI Calculator)' : 'EMI Calculator'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-emerald-200/80 truncate">
              {isHindi ? 'मासिक किस्त, कुल ब्याज और कुल भुगतान का अनुमान' : 'Informational monthly repayment estimator'}
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white dark:bg-[#0c2d20] hover:bg-slate-100 dark:hover:bg-[#134231] border border-slate-200 dark:border-emerald-800 text-slate-600 dark:text-emerald-200 cursor-pointer shrink-0"
            aria-label="Close calculator"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Inputs (3 fields only: Loan Amount, Annual Interest Rate, Loan Tenure) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. Loan Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="emi-loan-amount" className="text-xs sm:text-sm font-bold text-slate-800 dark:text-emerald-100">
                  {isHindi ? 'ऋण राशि (Loan Amount)' : 'Loan Amount'}
                </label>
                <div className="relative w-40 sm:w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                  <input
                    id="emi-loan-amount"
                    type="text"
                    inputMode="numeric"
                    value={loanAmountInput}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => setLoanAmountInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter amount"
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#061811] text-right text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
              <input
                type="range"
                min={100000}
                max={50000000}
                step={50000}
                value={Math.min(Math.max(loanAmount, 100000), 50000000)}
                onChange={(e) => setLoanAmountInput(e.target.value)}
                aria-label="Loan Amount Slider"
                className="w-full accent-[#0E3A2B] dark:accent-[#C2A691] cursor-pointer"
              />
            </div>

            {/* 2. Annual Interest Rate */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="emi-interest-rate" className="text-xs sm:text-sm font-bold text-slate-800 dark:text-emerald-100">
                  {isHindi ? 'वार्षिक ब्याज दर (Annual Interest Rate)' : 'Annual Interest Rate'}
                </label>
                <div className="relative w-32 sm:w-36">
                  <input
                    id="emi-interest-rate"
                    type="text"
                    inputMode="decimal"
                    value={interestRateInput}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9.]/g, '');
                      const parts = cleaned.split('.');
                      setInterestRateInput(parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned);
                    }}
                    placeholder="8.5"
                    className="w-full pl-3 pr-7 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#061811] text-right text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">%</span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                step={0.1}
                value={Math.min(Math.max(annualRate, 1), 20)}
                onChange={(e) => setInterestRateInput(e.target.value)}
                aria-label="Annual Interest Rate Slider"
                className="w-full accent-[#0E3A2B] dark:accent-[#C2A691] cursor-pointer"
              />
            </div>

            {/* 3. Loan Tenure */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="emi-loan-tenure" className="text-xs sm:text-sm font-bold text-slate-800 dark:text-emerald-100">
                  {isHindi ? 'ऋण अवधि — वर्षों में (Loan Tenure)' : 'Loan Tenure (Years)'}
                </label>
                <div className="relative w-32 sm:w-36">
                  <input
                    id="emi-loan-tenure"
                    type="text"
                    inputMode="decimal"
                    value={tenureYearsInput}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9.]/g, '');
                      const parts = cleaned.split('.');
                      setTenureYearsInput(parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned);
                    }}
                    placeholder="20"
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 dark:border-emerald-800 bg-white dark:bg-[#061811] text-right text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500">
                    {isHindi ? 'वर्ष' : 'Yrs'}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={Math.min(Math.max(Math.round(tenureYears) || 1, 1), 30)}
                onChange={(e) => setTenureYearsInput(e.target.value)}
                aria-label="Loan Tenure Slider"
                className="w-full accent-[#0E3A2B] dark:accent-[#C2A691] cursor-pointer"
              />
            </div>
          </div>

          {/* Right Outputs (3 outputs only: Monthly EMI, Total Interest Payable, Total Repayment Amount) */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#061911] border border-emerald-200/80 dark:border-emerald-800/70 space-y-4 shadow-xs">
            <div className="pb-4 border-b border-slate-100 dark:border-emerald-900/60">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-300/80 block mb-1">
                {isHindi ? 'मासिक ईएमआई (Monthly EMI)' : 'Monthly EMI'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#0E3A2B] dark:text-[#F4F3EF] break-words">
                {formatINR(monthlyEmi)}
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {isHindi ? 'ऋण राशि (Loan Amount)' : 'Loan Amount'}
                </span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {formatINR(loanAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {isHindi ? 'कुल देय ब्याज (Total Interest Payable)' : 'Total Interest Payable'}
                </span>
                <span className="font-bold text-amber-700 dark:text-[#C2A691] font-mono">
                  {formatINR(totalInterest)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/60 flex items-center justify-between gap-3">
                <span className="text-slate-800 dark:text-emerald-100 font-bold">
                  {isHindi ? 'कुल पुनर्भुगतान राशि (Total Repayment Amount)' : 'Total Repayment Amount'}
                </span>
                <span className="font-black text-base text-[#0E3A2B] dark:text-emerald-300 font-mono">
                  {formatINR(totalRepayment)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Required Informational Disclaimer */}
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-3 border-t border-slate-200/70 dark:border-emerald-900/50">
          {EMI_DISCLAIMER_EN}
          {isHindi ? ` (${EMI_DISCLAIMER_HI})` : ''}
        </p>
      </div>
    </div>
  );
};
