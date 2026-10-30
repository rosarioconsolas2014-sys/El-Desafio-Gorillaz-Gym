import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, RotateCcw } from 'lucide-react';
import { ChampionTrophyBadge, ProteinTub3D, GorillaOfficialLogo } from './GorillaIllustrations';
import { sound } from '../utils/soundEffects';

interface WinnerScreenProps {
  fullName: string;
  nickname?: string;
  level1Score: number;
  level2Score: number;
  level3Score: number;
  speedBonus: number;
  streakBonus: number;
  totalScore: number;
  totalTimeSeconds: number;
  rank: number;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  onGoHome: () => void;
}

export const WinnerScreen: React.FC<WinnerScreenProps> = ({
  fullName,
  nickname,
  level1Score,
  level2Score,
  level3Score,
  speedBonus,
  streakBonus,
  totalScore,
  totalTimeSeconds,
  rank,
  onPlayAgain,
  onViewLeaderboard,
  onGoHome,
}) => {
  // Fire confetti bursts in Gaming Neon Palette
  useEffect(() => {
    sound.playLevelUp();

    const end = Date.now() + 2.8 * 1000;
    // New Gaming Neon Palette for particles:
    const colors = ['#8B35FF', '#B026FF', '#00CFFF', '#FFE600', '#FFFFFF'];

    const interval: NodeJS.Timeout = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }

      confetti({
        startVelocity: 35,
        spread: 360,
        ticks: 70,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: colors,
      });
    }, 240);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const isLeader = rank === 1;

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#080810]">
      {/* Background Gaming Ambient Lights (Blue, Violet, Yellow) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#8B35FF]/20 via-[#00CFFF]/10 to-[#080810] pointer-events-none -z-10" />

      <div className="w-full max-w-2xl bg-[#171722] border-2 border-[#8B35FF] rounded-3xl p-6 sm:p-10 shadow-[0_0_60px_rgba(176,38,255,0.45)] relative overflow-hidden animate-scaleIn text-center">
        {/* Top official logo badge with golden champion glow */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <ChampionTrophyBadge size={140} className="animate-bounce" />
            {isLeader && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFE600] text-[#080810] font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-widest shadow-[0_0_15px_#FFE600] flex items-center gap-1">
                👑 #1 LÍDER DEL GYM
              </span>
            )}
          </div>
        </div>

        {/* Mandatory Header Messages */}
        <span className="text-[#00CFFF] font-extrabold tracking-[0.25em] text-xs sm:text-sm uppercase block mb-1 text-glow-cyan">
          THE CHAMPION CHALLENGE
        </span>

        <h1 className="text-3xl sm:text-5xl font-heading text-white tracking-wide uppercase mb-2">
          ¡FELICITACIONES, GORILLA!
        </h1>

        <p className="text-base sm:text-lg font-impact tracking-wider text-[#B026FF] text-glow-violet max-w-lg mx-auto mb-1">
          SUPERASTE LOS 3 NIVELES. AHORA ESTÁS EN EL RANKING DE GORILLAZ GYM.
        </p>

        <p className="text-xs sm:text-sm font-bold text-zinc-300 max-w-md mx-auto mb-6">
          EL QUE CONSIGA EL MAYOR PUNTAJE SE LLEVA UNA PROTEÍNA.
        </p>

        {/* Participant Identity & Rank Card */}
        <div className="p-4 bg-[#080810] rounded-2xl border border-violet-500/30 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Atleta Participante
            </span>
            <div className="flex items-baseline justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-heading text-white">
                {fullName}
              </h2>
              {nickname && (
                <span className="text-xs font-bold text-[#00CFFF]">
                  "{nickname}"
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#171722] border border-zinc-700 flex items-center gap-2">
              <Clock size={16} className="text-[#00CFFF]" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-bold">Tiempo Total</span>
                <span className="text-sm font-mono font-bold text-zinc-200">{formatTime(totalTimeSeconds)}</span>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-[#8B35FF]/20 border border-[#B026FF]/50 flex items-center gap-2">
              <Trophy size={16} className="text-[#FFE600]" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-[#00CFFF] block font-bold">Posición</span>
                <span className="text-base font-heading text-white font-black">#{rank}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Score Big Spotlight with Neon Yellow numbers */}
        <div className="p-6 bg-gradient-to-r from-[#080810] via-[#171722] to-[#080810] rounded-2xl border-2 border-[#FFE600]/40 mb-6 relative overflow-hidden shadow-[0_0_30px_rgba(255,230,0,0.2)]">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#00CFFF] block mb-1">
            PUNTAJE FINAL CONSOLIDADO
          </span>
          <div className="text-5xl sm:text-6xl font-heading text-[#FFE600] font-black tracking-wider text-glow-yellow">
            {totalScore} <span className="text-2xl font-sans text-white font-bold">PTS</span>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-zinc-800 text-left">
            <div className="p-2.5 bg-[#080810] border border-cyan-400/20 rounded-xl">
              <span className="text-[10px] text-[#00CFFF] block font-bold">Nivel 1 (Fácil)</span>
              <span className="text-sm font-heading text-white">{level1Score} pts</span>
            </div>
            <div className="p-2.5 bg-[#080810] border border-violet-500/20 rounded-xl">
              <span className="text-[10px] text-[#B026FF] block font-bold">Nivel 2 (Media)</span>
              <span className="text-sm font-heading text-white">{level2Score} pts</span>
            </div>
            <div className="p-2.5 bg-[#080810] border border-yellow-400/20 rounded-xl">
              <span className="text-[10px] text-[#FFE600] block font-bold">Nivel 3 (Bestia)</span>
              <span className="text-sm font-heading text-white">{level3Score} pts</span>
            </div>
            <div className="p-2.5 bg-[#080810] border border-violet-500/20 rounded-xl">
              <span className="text-[10px] text-zinc-400 block font-bold">Bonus Rapidez</span>
              <span className="text-sm font-heading text-[#FFE600]">+{speedBonus + streakBonus} pts</span>
            </div>
          </div>
        </div>

        {/* Prize Reminder Card */}
        <div className="p-4 bg-[#080810] rounded-2xl border border-violet-500/40 flex items-center justify-between gap-4 mb-8 text-left">
          <div className="flex items-center gap-3">
            <ProteinTub3D size={56} className="shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FFE600] tracking-wider">
                Premio en Juego
              </span>
              <h4 className="text-sm font-bold text-white">
                PROTEÍNA WHEY 100% GOLD PARA EL CAMPEÓN
              </h4>
              <p className="text-xs text-zinc-400">
                Mantenete en el puesto #1 hasta el cierre del torneo para consagrarte ganador.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onViewLeaderboard();
            }}
            className="w-full sm:w-auto px-7 py-3.5 btn-electric-violet font-heading text-lg rounded-xl flex items-center justify-center gap-2 cursor-pointer font-black tracking-wide"
          >
            <Trophy size={18} className="text-[#FFE600]" />
            <span>VER TABLA DE CLASIFICACIÓN</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#080810] hover:bg-[#20202e] text-white border border-violet-500/40 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={16} className="text-[#00CFFF]" />
            <span>JUGAR DE NUEVO</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onGoHome();
            }}
            className="w-full sm:w-auto px-4 py-3.5 text-xs text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Inicio
          </button>
        </div>
      </div>
    </div>
  );
};
