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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0d1722] border border-amber-400/30 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Uttarakhand Home Loan & EMI Calculator
              </h2>
              <p className="text-xs text-slate-400">
                SBI, HDFC & ICICI Bank Home Loan Estimates
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

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Top Big Result Box */}
          <div className="glass-panel p-5 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-slate-950/70 to-teal-500/10 text-center">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              Estimated Monthly EMI
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 my-1">
              ₹{monthlyEmi.toLocaleString('en-IN')}
              <span className="text-xs text-slate-400 font-normal"> / month</span>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-slate-300 mt-2">
              <span>Loan Amount: <strong>{formatLakhsCr(principal)}</strong></span>
              <span>•</span>
              <span>Down Payment: <strong>{formatLakhsCr(downPaymentAmount)} ({downPaymentPercent}%)</strong></span>
            </div>
          </div>

          {/* Sliders Grid */}
          <div className="space-y-4">
            
            {/* Property Cost */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span className="text-slate-300 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                  <span>Property Price</span>
                </span>
                <span className="text-amber-400 font-mono text-sm font-bold">
                  {formatLakhsCr(propertyCost)}
                </span>
              </div>
              <input
                type="range"
                min={2000000}
                max={50000000}
                step={500000}
                value={propertyCost}
                onChange={(e) => setPropertyCost(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>₹20 Lakhs</span>
                <span>₹2.5 Cr</span>
                <span>₹5 Cr</span>
              </div>
            </div>

            {/* Down Payment Percentage */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                <span className="text-slate-300 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  <span>Down Payment ({downPaymentPercent}%)</span>
                </span>
                <span className="text-amber-400 font-mono text-sm font-bold">
                  {formatLakhsCr(downPaymentAmount)}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>10% (Min)</span>
                <span>20% (Standard)</span>
                <span>50%</span>
              </div>
            </div>

            {/* Interest Rate & Tenure 2 Cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Interest Rate */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Interest Rate (% p.a.)</span>
                  <span className="text-amber-400 font-mono font-bold">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min={7.5}
                  max={12}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Current SBI/HDFC avg: ~8.5%</span>
              </div>

              {/* Loan Tenure */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tenure (Years)</span>
                  </span>
                  <span className="text-amber-400 font-mono font-bold">{tenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-1">Total {totalMonths} EMIs</span>
              </div>

            </div>

          </div>

          {/* Breakdown Visualization Bar */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/10 space-y-2">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Principal: {formatLakhsCr(principal)} ({principalPercent}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                Interest: {formatLakhsCr(totalInterest)} ({interestPercent}%)
              </span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div style={{ width: `${principalPercent}%` }} className="bg-amber-400 h-full transition-all" />
              <div style={{ width: `${interestPercent}%` }} className="bg-teal-400 h-full transition-all" />
            </div>
            <div className="text-center text-[11px] text-slate-400 pt-1">
              Total Repayment: <strong className="text-white">{formatLakhsCr(totalPayment)}</strong>
            </div>
          </div>

          {/* Bank Approval Note */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              All properties on <strong>Uttarakhand Gateways</strong> have passed legal title search and are pre-qualified for fast-track loan sanctions by major banks.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            *Indicative estimates. Stamp duty & registry extra.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors"
          >
            Close Calculator
          </button>
        </div>

      </div>
    </div>
  );
};
