import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  darkText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showTagline = false,
  darkText = false,
}) => {
  const iconDimensions = {
    sm: { width: 48, height: 42 },
    md: { width: 62, height: 54 },
    lg: { width: 78, height: 68 },
    xl: { width: 96, height: 84 },
  };

  const titleSizes = {
    sm: 'text-lg font-bold',
    md: 'text-xl sm:text-2xl font-black tracking-tight',
    lg: 'text-2xl sm:text-3xl font-black tracking-tight',
    xl: 'text-3xl sm:text-4xl font-black tracking-tight',
  };

  const gatewaySizes = {
    sm: 'text-[10px] tracking-[0.22em] font-extrabold',
    md: 'text-[11px] sm:text-xs tracking-[0.26em] font-extrabold',
    lg: 'text-xs sm:text-sm tracking-[0.3em] font-black',
    xl: 'text-sm sm:text-base tracking-[0.32em] font-black',
  };

  const { width, height } = iconDimensions[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3.5 select-none ${className}`}>
      {/* Cloud & Himalayan Peaks Logo */}
      <div 
        className="flex-shrink-0 transition-transform duration-300 hover:scale-105"
        style={{ width, height }}
        title="Uttarakhand Gateways"
      >
        <svg 
          viewBox="0 0 200 175" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Sky gradient inside the cloud */}
            <linearGradient id="ukSkyGrad" x1="100" y1="20" x2="100" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#9cc2d9" />
              <stop offset="50%" stopColor="#7baac8" />
              <stop offset="100%" stopColor="#558aaF" />
            </linearGradient>

            {/* Cloud mask to clip the mountain landscape within the cloud silhouette */}
            <clipPath id="ukCloudClip">
              <path d="M 65 35 C 75 18 105 18 120 32 C 135 20 160 30 165 52 C 180 58 190 75 186 94 C 196 108 192 128 178 136 C 170 142 155 142 145 138 C 135 146 115 148 95 145 C 80 148 60 144 50 136 C 35 140 18 130 14 115 C 10 100 16 85 28 78 C 22 62 34 42 50 40 C 54 36 60 34 65 35 Z" />
            </clipPath>

            {/* Cloud shadows */}
            <linearGradient id="cloudShadow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d3e4f0" />
            </linearGradient>

            {/* Primary Peak Snow highlight */}
            <linearGradient id="snowGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2edf5" />
            </linearGradient>
          </defs>

          {/* Cloud Shaped Container */}
          <g clipPath="url(#ukCloudClip)">
            {/* Sky Background */}
            <rect width="200" height="175" fill="url(#ukSkyGrad)" />

            {/* Distant soft sky clouds / wind trail */}
            <path 
              d="M 40 50 Q 80 35 125 45 Q 160 55 180 65 L 180 80 Q 150 70 115 60 Q 70 50 40 60 Z" 
              fill="#ffffff" 
              opacity="0.35" 
            />

            {/* High Wind Plume from Summit */}
            <path 
              d="M 124 55 Q 115 48 95 52 Q 85 55 78 60 Q 92 53 110 52 Q 120 52 125 56 Z" 
              fill="#ffffff" 
              opacity="0.9" 
            />

            {/* --- REAR HIGH PEAK (Right) --- */}
            <polygon points="124,55 148,82 178,135 118,135 124,55" fill="#1b3f62" />
            <polygon points="124,55 138,72 165,135 148,82" fill="#29567e" />
            <polygon points="124,55 118,65 138,72 124,55" fill="url(#snowGlow)" />
            <polygon points="138,72 142,95 152,118 148,82" fill="#d9e8f5" />
            <polygon points="124,55 133,65 142,68 124,55" fill="#ffffff" />

            {/* --- FRONT MAIN MOUNTAIN RIDGE (Center & Left) --- */}
            <polygon points="90,68 25,145 92,145 90,68" fill="#0d2844" />
            <polygon points="90,68 62,98 80,145 25,145" fill="#13385c" />
            <polygon points="90,68 102,95 90,145 62,98" fill="#1c4873" />
            <polygon points="90,68 105,82 120,110 102,95" fill="#2e6492" />
            <polygon points="105,82 128,115 125,145 102,145 90,68" fill="#3c7dae" />
            <polygon points="120,110 155,145 125,145 128,115" fill="#255178" />

            {/* Central snow spine */}
            <polygon points="90,68 88,85 92,105 95,128 92,145 96,126 95,102 91,85 90,68" fill="#ffffff" />
            <polygon points="90,68 95,78 90,88 88,85" fill="#ffffff" />
            <polygon points="90,68 102,78 95,85 90,68" fill="#eaf3fa" />

            {/* Secondary snow patches */}
            <polygon points="62,98 68,108 60,118 56,108" fill="#cde0f0" />
            <polygon points="105,82 112,92 108,98 102,92" fill="#ffffff" />
            <polygon points="120,110 128,118 122,126 116,118" fill="#d9e9f7" />

            {/* Base clouds */}
            <path 
              d="M 10 135 C 10 115 28 105 45 115 C 55 102 75 105 82 118 C 92 112 108 120 105 135 C 105 145 95 152 85 152 L 15 152 C 8 148 10 140 10 135 Z" 
              fill="url(#cloudShadow)" 
            />
            <path 
              d="M 18 128 C 22 116 38 110 48 118 C 58 108 72 110 78 120 C 72 115 56 112 45 120 C 35 116 22 120 18 128 Z" 
              fill="#ffffff" 
            />
            <path 
              d="M 115 138 C 118 120 138 115 150 125 C 160 115 180 118 188 132 C 196 138 194 150 185 155 L 120 155 C 114 150 114 142 115 138 Z" 
              fill="url(#cloudShadow)" 
            />
            <path 
              d="M 125 132 C 132 122 146 118 155 126 C 165 118 178 122 182 132 C 175 125 162 122 152 128 C 142 122 130 125 125 132 Z" 
              fill="#ffffff" 
            />
          </g>

          {/* Delicate Cloud Border Outline */}
          <path 
            d="M 65 35 C 75 18 105 18 120 32 C 135 20 160 30 165 52 C 180 58 190 75 186 94 C 196 108 192 128 178 136 C 170 142 155 142 145 138 C 135 146 115 148 95 145 C 80 148 60 144 50 136 C 35 140 18 130 14 115 C 10 100 16 85 28 78 C 22 62 34 42 50 40 C 54 36 60 34 65 35 Z" 
            stroke="#38bdf8" 
            strokeWidth="1.75" 
            strokeOpacity="0.6"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-tight">
        <span className={`font-semibold tracking-tight ${titleSizes[size]} font-sans ${darkText ? 'text-slate-900' : 'text-white'}`}>
          Uttarakhand
        </span>
        <span className={`font-bold font-sans uppercase ${gatewaySizes[size]} ${darkText ? 'text-sky-600' : 'text-amber-400'}`}>
          GATEWAYS
        </span>
        {showTagline && (
          <span className={`text-[10px] font-light mt-0.5 ${darkText ? 'text-slate-500' : 'text-slate-400'}`}>
            Dev Bhoomi Real Estate & Properties
          </span>
        )}
      </div>
    </div>
  );
};
