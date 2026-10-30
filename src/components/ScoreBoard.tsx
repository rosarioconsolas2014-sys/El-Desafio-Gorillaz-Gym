import React from 'react';
import { Trophy } from 'lucide-react';
import { GorillaOfficialLogo } from './GorillaIllustrations';

interface ScoreBoardProps {
  levelNumber: 1 | 2 | 3;
  levelTitle: string;
  currentIndex: number;
  totalCount: number;
  totalScore: number;
  levelScore: number;
  playerName: string;
  playerNickname?: string;
  onQuit: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  levelNumber,
  levelTitle,
  currentIndex,
  totalCount,
  totalScore,
  levelScore,
  playerName,
  playerNickname,
  onQuit,
}) => {
  const getLevelBadgeStyle = () => {
    switch (levelNumber) {
      case 1:
        // Level 1: Neon Cyan
        return 'border-[#00CFFF] bg-[#00CFFF]/15 text-[#00CFFF] shadow-[0_0_12px_rgba(0,207,255,0.4)]';
      case 2:
        // Level 2: Violet
        return 'border-[#B026FF] bg-[#B026FF]/15 text-[#B026FF] shadow-[0_0_12px_rgba(176,38,255,0.4)]';
      case 3:
        // Level 3: Neon Yellow & Violet
        return 'border-[#FFE600] bg-[#FFE600]/15 text-[#FFE600] shadow-[0_0_12px_rgba(255,230,0,0.4)]';
    }
  };

  const getLogoGlow = () => {
    if (levelNumber === 1) return 'cyan' as const;
    if (levelNumber === 2) return 'violet' as const;
    return 'yellow' as const;
  };

  return (
    <div className="bg-[#080810]/95 border-b border-[#171722] py-3.5 px-4 sm:px-6 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Player & Level indicator */}
        <div className="flex items-center gap-3.5">
          <GorillaOfficialLogo size={42} glow={getLogoGlow()} />
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getLevelBadgeStyle()}`}>
                NIVEL {levelNumber} • {levelTitle}
              </span>
              <span className="text-xs font-bold text-zinc-400">
                Paso {currentIndex + 1} de {totalCount}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-heading text-xl text-white font-extrabold tracking-wide">
                {playerName}
              </span>
              {playerNickname && (
                <span className="text-xs font-bold text-[#00CFFF]">
                  "{playerNickname}"
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Scores & Quit */}
        <div className="flex items-center justify-between md:justify-end gap-5 border-t md:border-t-0 pt-2 md:pt-0 border-[#171722]">
          {/* Level Points */}
          <div className="flex flex-col items-center sm:items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Puntos del Nivel
            </span>
            <span className="font-heading text-2xl text-white">
              {levelScore} <span className="text-xs text-zinc-500 font-sans">pts</span>
            </span>
          </div>

          {/* Total Accumulated Score in Neon Yellow (#FFE600) */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#171722] border-2 border-violet-500/40 shadow-[0_0_20px_rgba(139,53,255,0.25)]">
            <Trophy size={20} className="text-[#FFE600] shrink-0 drop-shadow-[0_0_8px_#FFE600]" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#00CFFF]">
                Total Acumulado
              </span>
              <span className="font-heading text-3xl text-[#FFE600] font-black leading-none text-glow-yellow">
                {totalScore} <span className="text-xs text-[#FFE600] font-sans font-bold">PTS</span>
              </span>
            </div>
          </div>

          {/* Abort button */}
          <button
            onClick={onQuit}
            className="text-xs text-zinc-400 hover:text-red-400 transition underline underline-offset-4 cursor-pointer pl-2"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};
