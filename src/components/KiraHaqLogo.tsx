import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../types';

interface KiraHaqLogoProps {
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'stacked';
  showSubtitle?: boolean;
  lightMode?: boolean; // if true, text adapt for dark backgrounds
  customLogoUrl?: string;
  siteSettings?: SiteSettings;
  className?: string;
}

export const KiraHaqLogo: React.FC<KiraHaqLogoProps> = ({
  size = 'md',
  layout = 'horizontal',
  showSubtitle = true,
  lightMode = false,
  customLogoUrl,
  siteSettings,
  className = ''
}) => {
  const effectiveLogoUrl = customLogoUrl !== undefined ? customLogoUrl : (siteSettings?.logoUrl || '');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [effectiveLogoUrl]);

  // Dimensions map with responsive scaling
  const circleSizes = {
    sm: 'w-6 h-6 sm:w-8 sm:h-8',
    md: 'w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11',
    lg: 'w-10 h-10 sm:w-13 sm:h-13 lg:w-16 lg:h-16'
  };

  const textSizes = {
    sm: 'text-xs sm:text-base',
    md: 'text-sm sm:text-lg lg:text-2xl',
    lg: 'text-lg sm:text-2xl lg:text-3xl'
  };

  const subtitleSizes = {
    sm: 'text-[6.5px] sm:text-[8px]',
    md: 'text-[7px] sm:text-[9px] lg:text-[11px]',
    lg: 'text-[8px] sm:text-[10px] lg:text-xs'
  };

  const showCustomImg = !!effectiveLogoUrl && !imgError;

  const containerLayoutClass = layout === 'stacked' 
    ? 'flex flex-col items-center text-center' 
    : 'flex flex-row flex-nowrap items-center gap-1.5 sm:gap-2.5 shrink-0';

  return (
    <div className={`${containerLayoutClass} ${className}`}>
      {/* Logo Badge or Custom Image */}
      {showCustomImg ? (
        <div className={`${circleSizes[size]} relative rounded-xl sm:rounded-2xl border border-amber-300/40 shadow-xs overflow-hidden bg-white/90 p-0.5 shrink-0 flex items-center justify-center`}>
          <img 
            src={effectiveLogoUrl} 
            alt="Kira Haq Store Logo" 
            className="w-full h-full object-contain rounded-lg sm:rounded-xl"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        /* Red Circle Badge with Elegant Script KH */
        <div className={`${circleSizes[size]} relative rounded-full bg-gradient-to-b from-[#ff2a2a] via-[#e51d1d] to-[#c70f0f] flex items-center justify-center shadow-xs shrink-0 border border-red-400/30 overflow-hidden`}>
          {/* Subtle radial gloss overlay */}
          <div className="absolute inset-0 bg-radial from-white/30 to-transparent opacity-80 pointer-events-none" />
          
          {/* White Script "KH" SVG Calligraphy matching the logo */}
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 text-white fill-current filter drop-shadow-xs">
            <path d="M28 22 C22 35, 18 52, 24 68 C27 75, 33 78, 38 72 C43 65, 45 50, 48 38 C51 26, 56 22, 53 30 C50 38, 41 58, 38 67 C36 72, 38 76, 42 76 C48 76, 56 64, 62 52 C57 52, 50 56, 46 62 C43 67, 43 72, 47 72 C52 72, 60 62, 67 48 C72 37, 75 28, 71 28 C67 28, 60 38, 55 48 C61 40, 68 31, 74 31 C78 31, 79 35, 76 42 C72 52, 66 65, 68 71 C69 74, 72 75, 75 72 C77 70, 78 66, 76 66" fill="none" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
            <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" fontFamily="'Brush Script MT', 'Dancing Script', 'Caveat', cursive, sans-serif" fontSize="46" fontWeight="bold" fill="white" letterSpacing="-2">
              KH
            </text>
          </svg>
        </div>
      )}

      {/* Brand Text Block - KIRA HAQ */}
      <div className={`flex flex-col justify-center shrink-0 ${layout === 'stacked' ? 'mt-1.5' : ''}`}>
        <div className="flex items-center flex-nowrap">
          <span className={`${textSizes[size]} font-black tracking-tight uppercase font-sans leading-none bg-gradient-to-b from-[#FFA800] via-[#FF5500] to-[#D62800] bg-clip-text text-transparent drop-shadow-xs whitespace-nowrap`}>
            KIRA HAQ
          </span>
        </div>
        
        {showSubtitle && (
          <span className={`${subtitleSizes[size]} font-bold tracking-tight block mt-0.5 whitespace-nowrap ${lightMode ? 'text-amber-300' : 'text-[#b45309]'}`}>
            Pure by Nature, Guided by Sunnah
          </span>
        )}
      </div>
    </div>
  );
};

