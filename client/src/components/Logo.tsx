import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 36, showText = true }) => {
  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* Custom SVG Civic Shield + Location Pin + AI Spark motif */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform hover:scale-105"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F172A" />
            <stop offset="1" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="tealGrad" x1="16" y1="12" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#14B8A6" />
            <stop offset="1" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="sparkGrad" x1="30" y1="6" x2="42" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="1" stopColor="#EF4444" />
          </linearGradient>
        </defs>

        {/* Civic Shield Outer */}
        <path
          d="M24 4L7 11V22C7 32.5 14.2 42.2 24 44.5C33.8 42.2 41 32.5 41 22V11L24 4Z"
          fill="url(#shieldGrad)"
          stroke="#0D9488"
          strokeWidth="1.5"
        />

        {/* Inner Location Pin Motif */}
        <path
          d="M24 13C20.686 13 18 15.686 18 19C18 23.5 24 31 24 31C24 31 30 23.5 30 19C30 15.686 27.314 13 24 13Z"
          fill="url(#tealGrad)"
        />
        <circle cx="24" cy="19" r="2.5" fill="#FFFFFF" />

        {/* AI Spark 4-Point Star Motif in Top Right */}
        <path
          d="M37 6L38.2 9.8L42 11L38.2 12.2L37 16L35.8 12.2L32 11L35.8 9.8L37 6Z"
          fill="url(#sparkGrad)"
        />
        {/* Secondary micro spark */}
        <circle cx="11" cy="16" r="1.5" fill="#38BDF8" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center">
            Civic<span className="text-civic-teal">Resolve</span>
          </span>
          <span className="text-[10px] font-medium tracking-wider uppercase text-slate-500">
            AI Civic Triage
          </span>
        </div>
      )}
    </div>
  );
};
