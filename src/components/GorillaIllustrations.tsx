import React from 'react';

export const OFFICIAL_LOGO_SRC = '/assets/aistudio/image_f68a06ba.png';

export const GorillaOfficialLogo: React.FC<{
  className?: string;
  size?: number;
  alt?: string;
  glow?: 'violet' | 'cyan' | 'yellow' | 'none';
}> = ({ className = '', size = 56, alt = 'GORILLAZ GYM Logo Oficial', glow = 'violet' }) => {
  const glowClass =
    glow === 'violet'
      ? 'shadow-[0_0_25px_rgba(176,38,255,0.6)] border-violet-500/50'
      : glow === 'cyan'
      ? 'shadow-[0_0_25px_rgba(0,207,255,0.6)] border-cyan-400/50'
      : glow === 'yellow'
      ? 'shadow-[0_0_25px_rgba(255,230,0,0.6)] border-yellow-400/50'
      : 'border-transparent';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden border ${glowClass} ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={OFFICIAL_LOGO_SRC}
        alt={alt}
        className="w-full h-full object-contain rounded-full select-none"
        loading="eager"
      />
    </div>
  );
};

// Backwards compatibility alias: ensures any component calling GorillaBadge uses the official logo
export const GorillaBadge = GorillaOfficialLogo;

export const ChampionTrophyBadge: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 130,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8B35FF] via-[#00CFFF] to-[#FFE600] opacity-40 blur-xl animate-pulse" />

      {/* Official Logo as center medallion */}
      <div className="relative p-2 rounded-full bg-[#171722] border-2 border-[#FFE600] shadow-[0_0_35px_rgba(255,230,0,0.5)]">
        <img
          src={OFFICIAL_LOGO_SRC}
          alt="Gorillaz Gym Champion"
          className="rounded-full object-contain"
          style={{ width: size * 0.72, height: size * 0.72 }}
        />
        {/* Golden Crown on top of the logo */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <span className="text-2xl drop-shadow-[0_0_10px_#FFE600]">👑</span>
        </div>
      </div>
    </div>
  );
};

export const ChampionGorillaGold = ChampionTrophyBadge;

export const ProteinTub3D: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 100 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size * 1.15 }}>
      <svg
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_10px_25px_rgba(176,38,255,0.45)]"
      >
        <defs>
          <linearGradient id="tubBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#171722" />
            <stop offset="35%" stopColor="#252535" />
            <stop offset="70%" stopColor="#171722" />
            <stop offset="100%" stopColor="#080810" />
          </linearGradient>
          <linearGradient id="lidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B35FF" />
            <stop offset="50%" stopColor="#B026FF" />
            <stop offset="100%" stopColor="#691ec9" />
          </linearGradient>
          <linearGradient id="labelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#080810" />
            <stop offset="50%" stopColor="#171722" />
            <stop offset="100%" stopColor="#080810" />
          </linearGradient>
        </defs>

        {/* Tub Lid with Ridges in Electric Violet */}
        <ellipse cx="60" cy="22" rx="36" ry="9" fill="url(#lidGrad)" />
        <rect x="24" y="22" width="72" height="12" fill="#8B35FF" rx="3" />
        <ellipse cx="60" cy="34" rx="36" ry="8" fill="#B026FF" />
        
        {/* Lid Grooves */}
        <line x1="34" y1="23" x2="34" y2="33" stroke="#4c1491" strokeWidth="2" />
        <line x1="44" y1="24" x2="44" y2="34" stroke="#4c1491" strokeWidth="2" />
        <line x1="54" y1="25" x2="54" y2="35" stroke="#4c1491" strokeWidth="2" />
        <line x1="66" y1="25" x2="66" y2="35" stroke="#4c1491" strokeWidth="2" />
        <line x1="76" y1="24" x2="76" y2="34" stroke="#4c1491" strokeWidth="2" />
        <line x1="86" y1="23" x2="86" y2="33" stroke="#4c1491" strokeWidth="2" />

        {/* Tub Neck */}
        <path d="M28 34 L22 45 L98 45 L92 34 Z" fill="#252535" />

        {/* Main Tub Body */}
        <path
          d="M20 45 L22 118 C22 128 38 135 60 135 C82 135 98 128 98 118 L100 45 Z"
          fill="url(#tubBody)"
          stroke="#8B35FF"
          strokeWidth="1.5"
        />

        {/* Gloss Reflection */}
        <path
          d="M26 48 L28 116 C30 120 34 122 36 122 L33 48 Z"
          fill="#00CFFF"
          opacity="0.15"
        />

        {/* Front Label with Electric Violet Border */}
        <rect x="25" y="52" width="70" height="64" rx="4" fill="url(#labelGrad)" stroke="#B026FF" strokeWidth="1.5" />
        
        {/* Diagonal Neon Blue Accent Stripe */}
        <polygon points="25,58 95,72 95,78 25,64" fill="#00CFFF" opacity="0.9" />

        {/* Brand Text on Tub */}
        <text x="60" y="66" textAnchor="middle" fill="#080810" fontSize="7.5" fontWeight="900" fontFamily="Anton, sans-serif" letterSpacing="0.05em">
          GORILLAZ
        </text>
        <text x="60" y="86" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="Anton, sans-serif" letterSpacing="0.08em">
          100% WHEY
        </text>
        <text x="60" y="96" textAnchor="middle" fill="#00CFFF" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
          ISOLATE & HYDRO
        </text>
        <rect x="34" y="101" width="52" height="10" rx="2" fill="#FFE600" />
        <text x="60" y="108.5" textAnchor="middle" fill="#080810" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">
          25G PROTEIN • 2 LBS
        </text>

        {/* Champion Stamp in Neon Yellow */}
        <circle cx="85" cy="56" r="7" fill="#FFE600" stroke="#ffffff" strokeWidth="1" />
        <text x="85" y="59" textAnchor="middle" fill="#080810" fontSize="7" fontWeight="bold">★</text>
      </svg>
    </div>
  );
};
