
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', onClick }) => {
  const sizes = {
    sm: 'scale-75 origin-left',
    md: 'scale-100',
    lg: 'scale-125',
  };

  return (
    <div 
      onClick={onClick}
      className={`flex items-center space-x-4 select-none cursor-pointer group transition-all duration-500 ${sizes[size]}`}
    >
      {/* Updated 'C' logo icon with a clean, non-tilted top-right quarter accent */}
      <div className="relative h-11 w-11 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:shadow-amber-500/30 transition-all duration-700">
        <span className="text-black font-black text-2xl relative z-10 tracking-tighter">C</span>
        {/* Proper Quarter Accent: Top-right quadrant, no tilt */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#f59e0b]"></div>
        <div className="absolute bottom-[-2px] left-[-2px] w-6 h-6 bg-[#f59e0b]/20 rounded-full blur-md"></div>
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-black tracking-tighter text-white uppercase group-hover:text-[#f59e0b] transition-colors duration-500">
            Space.ONE
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-[1px] w-4 bg-[#f59e0b]/40"></div>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.4em] group-hover:text-white transition-colors duration-700">
            by Cygnet.ONE
          </span>
        </div>
      </div>
    </div>
  );
};

export default Logo;
