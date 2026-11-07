import React from 'react';
import { HomeLoanCalculator } from './HomeLoanCalculator';

interface EmiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrice?: number;
  initialTab?: 'emi' | 'amortization' | 'banks' | 'subsidies';
}

export const EmiCalculatorModal: React.FC<EmiCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialPrice = 5000000,
  initialTab = 'emi',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[94vh] sm:max-h-[90vh] sm:my-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        <HomeLoanCalculator
          initialPrice={initialPrice}
          isModal={true}
          onClose={onClose}
          initialTab={initialTab}
        />
      </div>
    </div>
  );
};
