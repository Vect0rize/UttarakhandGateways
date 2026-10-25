import React from 'react';
import { HomeLoanCalculator } from './HomeLoanCalculator';

interface EmiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrice?: number;
}

export const EmiCalculatorModal: React.FC<EmiCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialPrice = 5000000,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl my-auto animate-in zoom-in-95 duration-200">
        <HomeLoanCalculator
          initialPrice={initialPrice}
          isModal={true}
          onClose={onClose}
        />
      </div>
    </div>
  );
};
