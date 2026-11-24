import React from 'react';
import { HomeLoanCalculator } from './HomeLoanCalculator';

export interface HomeLoanBannerProps {
  onOpenEligibility?: () => void;
  onOpenBankOffers?: () => void;
  isDark?: boolean;
  compact?: boolean;
}

/**
 * Simple informational Homepage EMI Calculator section.
 * Replaces previous promotional bank-offer banner per UKG specification #8.
 */
export const HomeLoanBanner: React.FC<HomeLoanBannerProps> = () => {
  return (
    <section id="home-emi-calculator-section" className="w-full my-6 sm:my-12">
      <HomeLoanCalculator initialPrice={5000000} />
    </section>
  );
};
