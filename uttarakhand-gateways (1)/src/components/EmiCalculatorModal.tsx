import React, { useState } from 'react';
import { X, Calculator, IndianRupee, Percent, Clock, ShieldCheck } from 'lucide-react';

interface EmiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrice?: number;
}

export const EmiCalculatorModal: React.FC<EmiCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialPrice = 8500000,
}) => {
  const [propertyCost, setPropertyCost] = useState<number>(initialPrice || 8500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);

  if (!isOpen) return null;

  const downPaymentAmount = Math.round((propertyCost * downPaymentPercent) / 100);
  const principal = propertyCost - downPaymentAmount;
  const monthlyRate = interestRate / (12 * 100);
  const totalMonths = tenureYears * 12;

  const monthlyEmi = Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );

  const totalPayment = monthlyEmi * totalMonths;
  const totalInterest = totalPayment - principal;
  const interestPercent = Math.round((totalInterest / totalPayment) * 100) || 0;
  const principalPercent = 100 - interestPercent;

  const formatLakhsCr = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(2)} Lakhs`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-sky-100 dark:border-slate-800 bg-sky-50/80 dark:bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Uttarakhand Home Loan & EMI Calculator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SBI, HDFC & ICICI Bank Home Loan Estimates
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

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Quick Summary Big Card */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-sky-500/20">
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-100">
              Estimated Monthly EMI
            </div>
            <div className="text-3xl sm:text-4xl font-black mt-1 font-serif-luxury">
              ₹{monthlyEmi.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-sans font-normal opacity-85">/ month</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/20 text-xs">
              <div>
                <span className="opacity-80 block text-[11px]">Loan Amount (Principal):</span>
                <span className="font-bold text-sm">₹{principal.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="opacity-80 block text-[11px]">Total Interest:</span>
                <span className="font-bold text-sm">₹{totalInterest.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Interactive Sliders & Inputs */}
          <div className="space-y-4 text-xs">
            
            {/* Property Cost */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Property Price</span>
                </span>
                <span className="text-sky-700 dark:text-sky-400 font-bold">{formatLakhsCr(propertyCost)}</span>
              </div>
              <input
                type="range"
                min={2000000}
                max={50000000}
                step={500000}
                value={propertyCost}
                onChange={(e) => setPropertyCost(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Down Payment */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700 dark:text-slate-300">
                  Down Payment ({downPaymentPercent}%)
                </span>
                <span className="text-sky-700 dark:text-sky-400 font-bold">{formatLakhsCr(downPaymentAmount)}</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Interest Rate & Tenure Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Interest Rate</span>
                  </span>
                  <span className="text-sky-700 dark:text-sky-400 font-bold">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min={7.5}
                  max={12}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Tenure</span>
                  </span>
                  <span className="text-sky-700 dark:text-sky-400 font-bold">{tenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

            </div>

          </div>

          {/* Ratio Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Principal: {principalPercent}%</span>
              <span>Interest: {interestPercent}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-sky-100 dark:bg-slate-800 flex">
              <div style={{ width: `${principalPercent}%` }} className="bg-sky-500" />
              <div style={{ width: `${interestPercent}%` }} className="bg-blue-600" />
            </div>
          </div>

          {/* Bank Approval Assurance */}
          <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-slate-900 dark:text-white">Bank Loan Eligibility:</strong> All properties featured on Uttarakhand Gateways are verified for bank mortgage approvals with SBI, HDFC, ICICI, and Axis Bank.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
