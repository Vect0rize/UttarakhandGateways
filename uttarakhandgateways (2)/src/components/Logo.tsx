import React, { useState } from 'react';
import logoImg from '../assets/logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  darkText?: boolean;
  withCircle?: boolean;
}

// Dedicated UKG Logo Emblem matching the user's official Pinterest image
export const UKGLogoEmblem: React.FC<{ className?: string; title?: string }> = ({ 
  className = 'w-10 h-10',
  title = 'UKG Real Estate' 
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  // Render the official uploaded 500x500 PNG logo directly
  if (!imgFailed) {
    return (
      <img
        src={logoImg}
        alt={title}
        loading="eager"
        decoding="async"
        onError={() => setImgFailed(true)}
        className={`object-contain select-none ${className}`}
      />
    );
  }

  return (
    <svg 
      viewBox="0 0 500 440" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <title>{title}</title>
      <defs>
        {/* Mountain Sunlit Lime Gradient */}
        <linearGradient id="ukgLimeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d9f99d" />
          <stop offset="40%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* Mountain Shaded Emerald Gradient */}
        <linearGradient id="ukgForestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="45%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#052e16" />
        </linearGradient>

        {/* UKG Letter Sheen Gradient */}
        <linearGradient id="ukgLetterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ecfccb" />
          <stop offset="25%" stopColor="#a3e635" />
          <stop offset="60%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>

        {/* Roof Gradient */}
        <linearGradient id="ukgRoofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bef264" />
          <stop offset="50%" stopColor="#65a30d" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>

        {/* Buildings Gradient */}
        <linearGradient id="ukgBuildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#0f5132" />
        </linearGradient>

        {/* Horizon Swoosh Underline */}
        <linearGradient id="ukgSwooshGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#15803d" stopOpacity="0.2" />
          <stop offset="15%" stopColor="#16a34a" />
          <stop offset="50%" stopColor="#a3e635" />
          <stop offset="85%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#15803d" stopOpacity="0.2" />
        </linearGradient>

        {/* Real Estate Text Gradient */}
        <linearGradient id="ukgTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#65a30d" />
          <stop offset="30%" stopColor="#84cc16" />
          <stop offset="50%" stopColor="#bef264" />
          <stop offset="70%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#65a30d" />
        </linearGradient>
      </defs>

      <g>
        {/* ========================================================= */}
        {/* 1. HIMALAYAN MOUNTAIN PEAKS (TOP)                         */}
        {/* ========================================================= */}

        {/* Far-left foothills */}
        <polygon points="70,170 115,145 145,170 70,170" fill="url(#ukgForestGrad)" />
        <polygon points="115,145 130,132 145,170 115,145" fill="url(#ukgLimeGrad)" />
        
        {/* Left mountain peak */}
        <polygon points="115,170 175,115 210,170 115,170" fill="url(#ukgForestGrad)" />
        <polygon points="175,115 150,138 185,170 175,115" fill="url(#ukgLimeGrad)" />
        {/* Left peak snow highlight */}
        <polygon points="175,115 168,125 178,135 182,126 175,115" fill="#ffffff" />
        <polygon points="168,125 160,135 166,138 172,132 168,125" fill="#ffffff" />

        {/* Central highest summit (Peak at 255, 75) */}
        {/* Left face */}
        <polygon points="200,170 255,75 255,170 200,170" fill="url(#ukgLimeGrad)" />
        {/* Right shaded face */}
        <polygon points="255,75 320,170 255,170 255,75" fill="url(#ukgForestGrad)" />
        {/* Mountain facets & ridges */}
        <polygon points="255,75 235,110 248,130 255,75" fill="#ffffff" />
        <polygon points="235,110 215,135 230,145 248,130" fill="#ffffff" />
        <polygon points="255,75 268,105 260,125 255,75" fill="#042f1a" opacity="0.6" />
        <polygon points="268,105 285,130 275,145 260,125" fill="#042f1a" opacity="0.7" />
        <polygon points="248,130 255,75 262,95 248,130" fill="#ecfccb" />
        <polygon points="275,145 295,160 305,170 285,130" fill="#042f1a" opacity="0.5" />

        {/* Right mountain peak (Peak at 345, 120) */}
        <polygon points="310,170 345,120 395,170 310,170" fill="url(#ukgForestGrad)" />
        <polygon points="345,120 330,140 355,165 345,120" fill="url(#ukgLimeGrad)" />
        {/* Right peak snow highlight */}
        <polygon points="345,120 340,128 350,135 352,126 345,120" fill="#ffffff" />
        <polygon points="350,135 362,145 358,150 350,142 350,135" fill="#ffffff" />

        {/* Far-right foothills */}
        <polygon points="390,170 415,150 435,170 390,170" fill="url(#ukgForestGrad)" />
        <polygon points="415,150 405,160 425,170 415,150" fill="url(#ukgLimeGrad)" />

        {/* Sharp mountain crest outlines */}
        <polyline 
          points="70,170 115,145 130,132 175,115 200,140 255,75 310,135 345,120 390,160 415,150 435,170" 
          stroke="#14532d" 
          strokeWidth="2.5" 
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* ========================================================= */}
        {/* 2. THE MONOGRAM LETTERS: UKG                              */}
        {/* ========================================================= */}

        {/* LETTER 'U' */}
        {/* Outer path of U */}
        <path 
          d="M 40 172
             C 50 172, 70 170, 85 170
             C 80 190, 82 245, 85 270
             C 90 295, 110 320, 140 320
             C 170 320, 192 295, 195 265
             C 198 240, 198 200, 198 172
             L 165 172
             C 165 205, 166 245, 160 265
             C 155 282, 145 292, 138 292
             C 128 292, 118 280, 115 260
             C 112 235, 114 195, 114 172
             L 40 172 Z"
          fill="url(#ukgLetterGrad)"
        />
        {/* Left top serif flair of U */}
        <path d="M 40 172 C 35 172, 38 185, 48 185 L 85 185 C 80 175, 70 172, 40 172 Z" fill="#ecfccb" />
        {/* Inner highlight sheen on U */}
        <path 
          d="M 85 185 C 85 230, 88 270, 96 288 C 92 280, 88 250, 88 200 Z" 
          fill="#ffffff" 
          opacity="0.45" 
        />

        {/* LETTER 'K' WITH HOUSE GABLE & 4-PANE WINDOW */}
        {/* Roof over K: Peak at (255, 175), left eave at (140, 255), right eave at (355, 255) */}
        {/* Main roof structure */}
        <path 
          d="M 255 175
             L 355 255
             L 340 262
             L 255 195
             L 155 262
             L 140 255
             Z"
          fill="url(#ukgRoofGrad)"
          stroke="#14532d"
          strokeWidth="1.5"
        />
        {/* Roof top trim / ridge highlight */}
        <path 
          d="M 255 175 L 355 255 L 350 250 L 255 178 L 145 250 L 140 255 Z" 
          fill="#bef264" 
        />
        {/* Right dormer / extra roof flair */}
        <path d="M 288 200 L 305 212 L 305 200 Z" fill="#65a30d" />

        {/* 4-PANE WINDOW UNDER ROOF GABLE */}
        {/* Window frame backdrop */}
        <rect x="231" y="210" width="32" height="32" rx="2" fill="#14532d" />
        {/* 4 Glowing Panes */}
        <rect x="233" y="212" width="13" height="13" rx="1" fill="#d9f99d" />
        <rect x="248" y="212" width="13" height="13" rx="1" fill="#d9f99d" />
        <rect x="233" y="227" width="13" height="13" rx="1" fill="#bef264" />
        <rect x="248" y="227" width="13" height="13" rx="1" fill="#bef264" />
        {/* Window mullions (cross) */}
        <line x1="247" y1="211" x2="247" y2="241" stroke="#14532d" strokeWidth="2" />
        <line x1="232" y1="226" x2="262" y2="226" stroke="#14532d" strokeWidth="2" />

        {/* Lower diagonal leg of 'K' */}
        <path 
          d="M 215 248
             L 295 305
             L 265 315
             L 200 265
             Z"
          fill="url(#ukgRoofGrad)"
          stroke="#14532d"
          strokeWidth="1.5"
        />
        {/* Highlight on K leg */}
        <polygon points="215,248 295,305 285,303 212,252" fill="#d9f99d" />

        {/* LETTER 'G' ENCLOSING SKYSCRAPER BUILDINGS */}
        {/* Outer curve of G */}
        <path 
          d="M 425 175
             C 385 168, 335 185, 315 225
             C 295 265, 310 315, 360 325
             C 415 332, 458 300, 465 245
             L 415 245
             C 412 275, 388 298, 362 295
             C 335 292, 325 262, 338 235
             C 348 212, 380 198, 412 202
             C 425 204, 438 210, 445 218
             L 468 190
             C 458 180, 442 175, 425 175 Z"
          fill="url(#ukgLetterGrad)"
        />
        {/* Right spur & downward arm of G */}
        <path 
          d="M 465 245
             L 465 310
             C 455 315, 440 318, 430 318
             L 430 270
             L 415 270
             L 415 245
             Z"
          fill="url(#ukgLetterGrad)"
        />

        {/* 3 MODERN SKYSCRAPERS INSIDE 'G' */}
        {/* Left tower */}
        <path d="M 355 260 L 372 260 L 372 318 L 355 318 Z" fill="url(#ukgBuildingGrad)" stroke="#052e16" strokeWidth="1" />
        <line x1="363" y1="264" x2="363" y2="314" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />

        {/* Center tallest tower (with peaked roof) */}
        <path 
          d="M 377 215 
             L 388 200 
             L 399 215 
             L 399 318 
             L 377 318 Z" 
          fill="url(#ukgBuildingGrad)" 
          stroke="#052e16" 
          strokeWidth="1" 
        />
        <line x1="384" y1="220" x2="384" y2="314" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.9" />
        <line x1="392" y1="220" x2="392" y2="314" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.9" />

        {/* Right stepped tower */}
        <path 
          d="M 404 235
             L 412 235
             L 412 245
             L 420 245
             L 420 318
             L 404 318 Z" 
          fill="url(#ukgBuildingGrad)" 
          stroke="#052e16" 
          strokeWidth="1" 
        />
        <line x1="412" y1="250" x2="412" y2="314" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />

        {/* ========================================================= */}
        {/* 3. ARROW/HORIZON CURVED UNDERLINE                         */}
        {/* ========================================================= */}
        <path 
          d="M 28 348
             Q 255 308 472 348
             Q 255 322 28 348 Z" 
          fill="url(#ukgSwooshGrad)" 
        />

        {/* ========================================================= */}
        {/* 4. REAL ESTATE TYPOGRAPHY                                 */}
        {/* ========================================================= */}
        {/* Left accent rule */}
        <line x1="25" y1="382" x2="72" y2="382" stroke="url(#ukgTextGrad)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Right accent rule */}
        <line x1="428" y1="382" x2="475" y2="382" stroke="url(#ukgTextGrad)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Centered 'REAL ESTATE' in luxury serif styling */}
        <text 
          x="250" 
          y="390" 
          textAnchor="middle" 
          fill="url(#ukgTextGrad)"
          fontFamily="serif, 'Times New Roman', Georgia"
          fontSize="30" 
          fontWeight="900" 
          letterSpacing="0.30em"
        >
          REAL ESTATE
        </text>
      </g>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showTagline = false,
  darkText = false,
  withCircle = true,
}) => {
  const iconDimensions = {
    sm: { width: 38, height: 38, p: 'p-1' },
    md: { width: 48, height: 48, p: 'p-1' },
    lg: { width: 62, height: 62, p: 'p-1.5' },
    xl: { width: 80, height: 80, p: 'p-2' },
  };

  const titleSizes = {
    sm: 'text-base font-bold',
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

  const { width, height, p } = iconDimensions[size];

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3.5 select-none outline-none ring-0 border-0 [-webkit-tap-highlight-color:transparent] ${className}`}>
      {/* Official UKG Mountain & House Emblem with Solid Circle Theme */}
      <div 
        className="flex-shrink-0 transition-transform duration-300 hover:scale-105 select-none outline-none ring-0 border-0"
        title="Uttarakhand Gateways (UKG Real Estate)"
      >
        {withCircle ? (
          <div 
            className={`rounded-full bg-[#062c21] border-2 border-emerald-500/70 shadow-md ring-2 ring-emerald-500/20 flex items-center justify-center overflow-hidden select-none outline-none ${p}`}
            style={{ width, height }}
          >
            <UKGLogoEmblem className="w-full h-full object-contain pointer-events-none select-none" />
          </div>
        ) : (
          <div style={{ width, height }} className="select-none outline-none">
            <UKGLogoEmblem className="w-full h-full object-contain drop-shadow-sm pointer-events-none select-none" />
          </div>
        )}
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col justify-center leading-tight select-none outline-none">
        <span className={`font-semibold tracking-tight ${titleSizes[size]} font-sans ${darkText ? 'text-slate-900' : 'text-white'}`}>
          Uttarakhand
        </span>
        <span className={`font-bold font-sans uppercase ${gatewaySizes[size]} ${darkText ? 'text-emerald-700' : 'text-emerald-400'}`}>
          GATEWAYS
        </span>
        {showTagline && (
          <span className={`text-[10px] font-light mt-0.5 ${darkText ? 'text-slate-500' : 'text-slate-400'}`}>
            UKG Real Estate
          </span>
        )}
      </div>
    </div>
  );
};
