import React from 'react';

interface VVTLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const VVTLogo: React.FC<VVTLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = true,
  className = '',
  onClick
}) => {
  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-sm', sub: 'text-[8px]', slogan: 'text-[7px]' },
    sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[9px]', slogan: 'text-[8px]' },
    md: { icon: 'w-10 h-10', text: 'text-lg', sub: 'text-[9px]', slogan: 'text-[9px]' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-[11px]', slogan: 'text-[10px]' },
    xl: { icon: 'w-20 h-20', text: 'text-3xl', sub: 'text-xs', slogan: 'text-xs' }
  };

  const currentSize = sizeMap[size];

  return (
    <div 
      id="vvt-brand-logo-container"
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Diamond Logo Emblem */}
      <div className={`relative shrink-0 ${currentSize.icon} rounded-xl overflow-hidden shadow-lg border border-white/15 bg-[#121214] transition-all duration-300 ${onClick ? 'group-hover:scale-105 group-hover:border-amber-400/50' : ''}`}>
        <img
          src="/vvt-logo.png"
          alt="VPT - No Plan? No Problem. We've Got You"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Brand Typography & Slogan */}
      {showText && (
        <div className="flex flex-col justify-center leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-cinzel font-black tracking-[0.14em] text-white transition-colors ${onClick ? 'group-hover:text-amber-400' : ''} ${currentSize.text}`}>
              VPT
            </span>
            <span className={`font-mono text-[#D4D4D8] font-light tracking-[0.2em] uppercase ${currentSize.sub}`}>
              TRIP PLANNER
            </span>
          </div>
          {showTagline && (
            <span className={`font-mono tracking-[0.18em] text-amber-400/90 font-medium uppercase mt-0.5 truncate ${currentSize.slogan}`}>
              NO PLAN? NO PROBLEM. WE'VE GOT YOU
            </span>
          )}
        </div>
      )}
    </div>
  );
};
