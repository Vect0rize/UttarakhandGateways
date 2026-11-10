import React, { useState } from 'react';

export type BankCode = 
  | 'SBI' 
  | 'BoB' 
  | 'BOB'
  | 'BOI' 
  | 'HDFC' 
  | 'ICICI' 
  | 'PNB' 
  | 'BAJAJ' 
  | 'AXIS' 
  | 'UKGB' 
  | 'CANARA' 
  | 'UNION';

interface BankLogoProps {
  code: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const BANK_IMG_MAP: Record<string, string> = {
  BOB: '/bank-logos/bob.png',
  SBI: '/bank-logos/sbi.svg',
  HDFC: '/bank-logos/hdfc.svg',
  ICICI: '/bank-logos/icici.svg',
  PNB: '/bank-logos/pnb.svg',
  AXIS: '/bank-logos/axis.svg',
  BAJAJ: '/bank-logos/bajaj.svg',
  'BAJAJ HOUSING': '/bank-logos/bajaj.svg',
  'BAJAJ HOUS': '/bank-logos/bajaj.svg',
  CANARA: '/bank-logos/canara.svg',
  UNION: '/bank-logos/union.svg',
};

export const BankLogo: React.FC<BankLogoProps> = ({ 
  code, 
  size = 'md', 
  className = '',
  showText = false
}) => {
  const normCode = code.toUpperCase().trim();
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  }[size];

  const imgPath = BANK_IMG_MAP[normCode];

  // If real image exists and has not errored, render authentic real image from /bank-logos/
  if (imgPath && !imgError) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 rounded-xl bg-white p-1 shadow-xs border border-slate-200/80 overflow-hidden ${sizeClasses} ${className}`}>
        <img
          src={imgPath}
          alt={`${code} official logo`}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback high-fidelity SVG icons
  // 1. STATE BANK OF INDIA (SBI)
  if (normCode === 'SBI') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 rounded-full shadow-xs ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="50" fill="#0066B2" />
          <circle cx="50" cy="50" r="16" fill="#FFFFFF" />
          <rect x="44" y="50" width="12" height="34" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 2. BANK OF BARODA (BOB)
  if (normCode === 'BOB') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 rounded-lg shadow-xs overflow-hidden ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="18" fill="#F26522" />
          <path d="M 28 22 L 56 22 C 68 22 76 28 76 38 C 76 44 71 50 63 52 C 73 54 78 61 78 70 C 78 80 69 86 56 86 L 28 86 Z" fill="#FFFFFF" />
          <rect x="36" y="30" width="16" height="16" rx="4" fill="#F26522" />
          <rect x="36" y="60" width="16" height="18" rx="4" fill="#F26522" />
          <circle cx="68" cy="24" r="3" fill="#FFFFFF" />
          <circle cx="78" cy="34" r="3" fill="#FFFFFF" />
          <circle cx="82" cy="48" r="3" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 3. HDFC BANK
  if (normCode === 'HDFC') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 rounded-lg shadow-xs overflow-hidden ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="16" fill="#004C8F" />
          <rect x="18" y="18" width="22" height="22" rx="4" fill="#ED232A" />
          <rect x="60" y="18" width="22" height="22" rx="4" fill="#ED232A" />
          <rect x="18" y="60" width="22" height="22" rx="4" fill="#ED232A" />
          <rect x="60" y="60" width="22" height="22" rx="4" fill="#ED232A" />
          <rect x="44" y="32" width="12" height="36" fill="#FFFFFF" />
          <rect x="32" y="44" width="36" height="12" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 4. ICICI BANK
  if (normCode === 'ICICI') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 rounded-lg shadow-xs overflow-hidden ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="18" fill="#B3282D" />
          <circle cx="50" cy="28" r="9" fill="#F58220" />
          <path d="M 42 44 C 42 44 48 40 58 46 C 68 52 64 68 56 74 C 48 80 38 78 36 72 C 34 66 38 62 44 64 C 50 66 54 62 52 56 C 50 50 42 50 42 44 Z" fill="#F58220" />
          <path d="M 44 44 C 48 42 54 44 54 50 C 54 56 46 62 48 68 C 50 72 58 70 60 66" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // 5. PUNJAB NATIONAL BANK (PNB)
  if (normCode === 'PNB') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 rounded-lg shadow-xs overflow-hidden ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="18" fill="#A20034" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#FFCC00" strokeWidth="9" />
          <circle cx="50" cy="50" r="14" fill="#FFCC00" />
          <path d="M 50 18 L 50 50 L 72 50" stroke="#FFCC00" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 6. BANK OF INDIA (BOI)
  if (normCode === 'BOI') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 rounded-lg shadow-xs overflow-hidden ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="18" fill="#00509D" />
          <polygon points="50,16 58,38 82,38 62,52 70,74 50,60 30,74 38,52 18,38 42,38" fill="#F37023" />
          <circle cx="50" cy="46" r="8" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 7. BAJAJ HOUSING / BAJAJ FINSERV
  if (normCode === 'BAJAJ' || normCode === 'BAJAJ HOUS' || normCode === 'BAJAJ HOUSING') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 rounded-lg shadow-xs overflow-hidden ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="18" fill="#003366" />
          <path d="M 32 24 L 56 24 C 68 24 74 30 74 38 C 74 44 70 48 62 50 C 72 52 76 58 76 66 C 76 76 68 82 54 82 L 32 82 Z" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinejoin="round" />
          <path d="M 44 38 L 56 38" stroke="#0099FF" strokeWidth="6" strokeLinecap="round" />
          <path d="M 44 66 L 56 66" stroke="#0099FF" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 8. AXIS BANK
  if (normCode === 'AXIS') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 rounded-lg shadow-xs overflow-hidden ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="18" fill="#97144D" />
          <polygon points="50,22 78,78 60,78 50,56 40,78 22,78" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 9. UTTARAKHAND GRAMIN BANK (UKGB)
  if (normCode === 'UKGB' || normCode === 'UKG') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 rounded-lg shadow-xs overflow-hidden ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="18" fill="#0B4D2C" />
          <circle cx="50" cy="46" r="18" fill="#FFC72C" />
          <polygon points="18,74 40,46 58,64 74,42 86,74" fill="#FFFFFF" />
          <polygon points="18,74 40,48 58,66 74,44 86,74" fill="#0E6B3D" opacity="0.3" />
          <path d="M 30 80 Q 50 86 70 80" stroke="#FFC72C" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // 10. CANARA BANK
  if (normCode === 'CANARA') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 rounded-lg shadow-xs overflow-hidden ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="18" fill="#00539F" />
          <polygon points="34,26 68,26 51,56" fill="#FDB913" />
          <polygon points="51,44 68,74 34,74" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 11. UNION BANK OF INDIA
  if (normCode === 'UNION') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 rounded-lg shadow-xs overflow-hidden ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="18" fill="#FFFFFF" />
          <path d="M 30 28 L 30 54 C 30 68 40 76 50 76 C 60 76 70 68 70 54 L 70 28" stroke="#ED1C24" strokeWidth="10" strokeLinecap="round" fill="none" />
          <path d="M 40 28 L 40 50 C 40 58 44 62 50 62 C 56 62 60 58 60 50 L 60 28" stroke="#003874" strokeWidth="8" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // Fallback badge
  return (
    <div className={`flex items-center justify-center shrink-0 rounded-lg font-black text-xs bg-slate-200 text-slate-800 ${sizeClasses} ${className}`}>
      {normCode.slice(0, 3)}
    </div>
  );
};
