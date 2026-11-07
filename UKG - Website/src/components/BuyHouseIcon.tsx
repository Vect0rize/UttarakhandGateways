import React from 'react';

interface BuyHouseIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Custom House icon for "Buy" actions with architectural character:
 * Features a pitched roof, chimney stack, upper mullion window, and front door.
 * Distinctive and premium compared to the generic navigation Home icon.
 */
export const BuyHouseIcon: React.FC<BuyHouseIconProps> = ({
  className = 'w-4 h-4',
  size,
  strokeWidth = 2,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Chimney on roof */}
      <path d="M17 7V3.5h2.5V8.8" />
      {/* Slanted Eaves Roof */}
      <path d="M2.5 10.5 12 3l9.5 7.5" />
      {/* House Body */}
      <path d="M4.5 10v10a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-10" />
      {/* Upper Mullion Window */}
      <rect x="9.5" y="8" width="5" height="4" rx="0.5" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="9.5" y1="10" x2="14.5" y2="10" />
      {/* Front Entrance Door */}
      <path d="M10 21.5v-4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4.5" />
    </svg>
  );
};

export default BuyHouseIcon;
