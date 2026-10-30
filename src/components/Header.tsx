import React, { useState } from 'react';
import { Volume2, VolumeX, Trophy, Shield, HelpCircle, Lock } from 'lucide-react';
import { GorillaOfficialLogo } from './GorillaIllustrations';
import { sound } from '../utils/soundEffects';

interface HeaderProps {
  onOpenRanking: () => void;
  onOpenRules: () => void;
  onOpenAdmin: () => void;
  onGoHome: () => void;
  isPlaying?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRanking,
  onOpenRules,
  onOpenAdmin,
  onGoHome,
}) => {
  const [soundActive, setSoundActive] = useState<boolean>(sound.getSoundEnabled());

  const handleToggleSound = () => {
    const newState = sound.toggleSound();
    setSoundActive(newState);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#080810]/95 backdrop-blur-md border-b border-[#171722]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-3.5 group text-left transition transform hover:scale-[1.02] cursor-pointer"
        >
          <div className="relative">
            <GorillaOfficialLogo size={50} glow="violet" />
            <div className="absolute -bottom-1 -right-1 bg-[#FFE600] text-[#080810] font-black text-[9px] px-1 py-0.2 rounded uppercase tracking-wider shadow-[0_0_8px_rgba(255,230,0,0.6)]">
              PRO
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-heading text-2xl sm:text-3xl text-white tracking-wider font-extrabold group-hover:text-[#B026FF] transition-colors">
                GORILLAZ
              </span>
              <span className="font-heading text-2xl sm:text-3xl text-[#00CFFF] tracking-wider font-extrabold text-glow-cyan">
                GYM
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] text-zinc-400 uppercase">
              The Champion Challenge
            </span>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Rules button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenRules();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-zinc-300 hover:text-white bg-[#171722] hover:bg-[#20202e] border border-violet-500/30 rounded-xl transition cursor-pointer"
            title="Ver Reglamento del Juego"
          >
            <HelpCircle size={16} className="text-[#00CFFF]" />
            <span className="hidden sm:inline">Reglas</span>
          </button>

          {/* Leaderboard button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenRanking();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#8B35FF] to-[#B026FF] hover:brightness-110 rounded-xl transition shadow-[0_0_15px_rgba(176,38,255,0.45)] cursor-pointer"
            title="Tabla de Clasificación"
          >
            <Trophy size={16} className="text-[#FFE600]" />
            <span className="font-extrabold tracking-wide">Ranking</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            aria-label={soundActive ? 'Desactivar sonido' : 'Activar sonido'}
            className="p-2 text-zinc-400 hover:text-[#00CFFF] bg-[#171722] hover:bg-[#20202e] border border-zinc-800 rounded-xl transition cursor-pointer"
            title={soundActive ? 'Sonido Activado' : 'Sonido Desactivado'}
          >
            {soundActive ? <Volume2 size={18} className="text-[#00CFFF]" /> : <VolumeX size={18} className="text-zinc-600" />}
          </button>

          {/* Admin Lock Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAdmin();
            }}
            className="p-2 text-zinc-400 hover:text-[#B026FF] bg-[#171722] hover:bg-[#20202e] border border-zinc-800 rounded-xl transition cursor-pointer"
            title="Panel de Administración"
          >
            <Lock size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
