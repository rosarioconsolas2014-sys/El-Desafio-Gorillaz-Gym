import React from 'react';
import { Play, Trophy, Shield, Flame, ChevronRight, Calendar } from 'lucide-react';
import { GorillaOfficialLogo, ChampionTrophyBadge, ProteinTub3D } from './GorillaIllustrations';
import { sound } from '../utils/soundEffects';
import { AdminConfig } from '../types';
import { PublicRankItem } from '../services/rankingService';

interface HomeProps {
  onStartGame: () => void;
  onOpenRules: () => void;
  onOpenRanking: () => void;
  topParticipants: PublicRankItem[];
  adminConfig: AdminConfig;
}

export const Home: React.FC<HomeProps> = ({
  onStartGame,
  onOpenRules,
  onOpenRanking,
  topParticipants,
  adminConfig,
}) => {
  const top1 = topParticipants.find((p) => p.rank === 1);
  const top2 = topParticipants.find((p) => p.rank === 2);
  const top3 = topParticipants.find((p) => p.rank === 3);

  return (
    <div className="relative min-h-[calc(100vh-5rem)] pb-16 overflow-hidden bg-[#080810]">
      {/* Background Gaming Ambient Lights (Blue, Violet, Yellow) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#8B35FF]/20 via-[#00CFFF]/10 to-transparent pointer-events-none -z-10" />

      {/* Subtle gaming cyber grid */}
      <div className="absolute inset-0 cyber-grid [mask-image:radial-gradient(ellipse_65%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Active Tournament Status Banner */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171722] border border-[#B026FF]/50 text-[#00CFFF] text-xs font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(176,38,255,0.25)]">
            <span className="w-2 h-2 rounded-full bg-[#00CFFF] animate-ping" />
            <span>Torneo Oficial Activo</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#FFE600] font-extrabold">Premio: {adminConfig.prizeTitle}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#171722] border border-zinc-800 text-zinc-400 text-xs font-semibold">
            <Calendar size={13} className="text-[#8B35FF]" />
            <span>Hasta: {adminConfig.endDate}</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Official GORILLAZ GYM Mascot Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#B026FF] via-[#00CFFF] to-[#FFE600] rounded-full blur-md opacity-50 group-hover:opacity-80 transition duration-500 animate-pulse" />
              <div className="relative p-2 rounded-full bg-[#080810] border-2 border-[#8B35FF]">
                <GorillaOfficialLogo size={130} glow="violet" />
              </div>
            </div>
          </div>

          <span className="text-[#00CFFF] font-extrabold tracking-[0.3em] text-xs sm:text-sm uppercase block mb-2 text-glow-cyan">
            GORILLAZ GYM PRESENTA
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading text-white tracking-wider leading-none mb-4 uppercase drop-shadow-[0_5px_20px_rgba(0,0,0,0.9)]">
            THE CHAMPION{' '}
            <span className="text-[#B026FF] text-glow-violet underline decoration-[#00CFFF] decoration-wavy decoration-2">
              CHALLENGE
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-impact tracking-wider text-zinc-300 mb-9 max-w-xl mx-auto">
            ¿TENÉS LO NECESARIO PARA SER EL CAMPEÓN?
          </p>

          {/* Primary CTA Button: Electric Violet with white text and outer glow */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-14">
            <button
              onClick={() => {
                sound.playClick();
                onStartGame();
              }}
              className="w-full sm:w-auto px-12 py-5 btn-electric-violet font-heading text-2xl sm:text-3xl rounded-2xl flex items-center justify-center gap-3 cursor-pointer group font-black tracking-wider"
            >
              <Play size={28} className="fill-white group-hover:scale-110 transition-transform" />
              <span>JUGAR AHORA</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenRules();
              }}
              className="w-full sm:w-auto px-7 py-4.5 bg-[#171722] hover:bg-[#20202e] text-zinc-200 border border-violet-500/40 hover:border-[#00CFFF] rounded-2xl font-bold text-sm sm:text-base transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <Shield size={18} className="text-[#00CFFF]" />
              <span>Reglamento & Puntos</span>
            </button>
          </div>
        </div>

        {/* Prize Feature Card in Gaming Violet / Cyan Styling */}
        <div className="mb-14 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#8B35FF] via-[#00CFFF] to-[#FFE600] rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
          <div className="relative bg-[#171722] border-2 border-violet-500/50 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative">
                <ProteinTub3D size={110} />
                <span className="absolute -top-2 -right-2 bg-[#FFE600] text-[#080810] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_0_10px_#FFE600]">
                  1° PUESTO
                </span>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B026FF]/20 text-[#00CFFF] text-xs font-black uppercase tracking-wider mb-2 border border-[#B026FF]/40">
                  <Flame size={14} className="text-[#FFE600]" /> PREMIO OFICIAL
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading text-white uppercase tracking-wide">
                  UNA PROTEÍNA PARA EL CAMPEÓN
                </h2>
                <p className="text-sm text-zinc-300 max-w-lg mt-1">
                  Superá los 3 niveles con el puntaje más alto del mes. Si quedás en la cima del ranking general al finalizar el torneo, ¡te llevás un pote de proteína Whey 100% Gold de premio!
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-zinc-300">
                  <span className="px-2.5 py-1 bg-[#080810] border border-violet-500/30 rounded-lg">✓ 3 Niveles Exclusivos</span>
                  <span className="px-2.5 py-1 bg-[#080810] border border-cyan-400/30 rounded-lg">✓ 300+ Pts Posibles</span>
                  <span className="px-2.5 py-1 bg-[#080810] border border-yellow-400/30 rounded-lg text-[#FFE600]">✓ Ranking en Tiempo Real</span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  onStartGame();
                }}
                className="px-6 py-3.5 bg-[#080810] hover:bg-[#12121e] text-[#00CFFF] border border-[#00CFFF]/50 hover:border-[#00CFFF] rounded-xl font-heading text-lg transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,207,255,0.25)]"
              >
                <span>COMPETIR POR EL PREMIO</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Game Levels Preview Cards (Cyan for Level 1, Violet for Level 2, Yellow/Violet for Level 3) */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#B026FF]">
                La Ruta a la Gloria
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading text-white">
                3 NIVELES DE PURA FUERZA
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Level 1: Cyan Neon */}
            <div className="p-6 bg-[#171722] border-2 border-[#00CFFF]/40 hover:border-[#00CFFF] rounded-2xl transition relative group shadow-[0_0_20px_rgba(0,207,255,0.15)]">
              <div className="w-10 h-10 rounded-xl bg-[#00CFFF]/10 border border-[#00CFFF]/40 text-[#00CFFF] font-heading text-2xl flex items-center justify-center mb-4 text-glow-cyan">
                1
              </div>
              <span className="text-[11px] font-extrabold text-[#00CFFF] uppercase tracking-widest">
                Dificultad: Fácil
              </span>
              <h4 className="text-xl font-heading text-white mt-1 mb-2">
                FITNESS KNOWLEDGE
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                5 preguntas sobre músculos, ejercicios y nutrición. 10 pts cada una con 15s de límite por respuesta.
              </p>
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-300">
                <span>Puntaje Máximo:</span>
                <span className="text-[#FFE600] font-heading text-lg font-black">50 PTS</span>
              </div>
            </div>

            {/* Level 2: Violet Details */}
            <div className="p-6 bg-[#171722] border-2 border-[#B026FF]/40 hover:border-[#B026FF] rounded-2xl transition relative group shadow-[0_0_20px_rgba(176,38,255,0.15)]">
              <div className="w-10 h-10 rounded-xl bg-[#B026FF]/10 border border-[#B026FF]/40 text-[#B026FF] font-heading text-2xl flex items-center justify-center mb-4 text-glow-violet">
                2
              </div>
              <span className="text-[11px] font-extrabold text-[#B026FF] uppercase tracking-widest">
                Dificultad: Media
              </span>
              <h4 className="text-xl font-heading text-white mt-1 mb-2">
                GORILLA POWER
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                5 desafíos interactivos: memoria de hierros, matching de músculos, equipamiento y secuencias rápidas.
              </p>
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-300">
                <span>Puntaje Máximo:</span>
                <span className="text-[#FFE600] font-heading text-lg font-black">100 PTS + BONUS</span>
              </div>
            </div>

            {/* Level 3: Yellow & Violet Details */}
            <div className="p-6 bg-[#171722] border-2 border-[#FFE600]/40 hover:border-[#FFE600] rounded-2xl transition relative group shadow-[0_0_20px_rgba(255,230,0,0.15)]">
              <div className="w-10 h-10 rounded-xl bg-[#FFE600]/10 border border-[#FFE600]/40 text-[#FFE600] font-heading text-2xl flex items-center justify-center mb-4 text-glow-yellow">
                3
              </div>
              <span className="text-[11px] font-extrabold text-[#FFE600] uppercase tracking-widest">
                Dificultad: Difícil
              </span>
              <h4 className="text-xl font-heading text-white mt-1 mb-2">
                THE BEAST MODE
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                5 desafíos avanzados de biomecánica, síntesis muscular y técnicas de intensidad (Drop sets, RIR).
              </p>
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-300">
                <span>Puntaje Máximo:</span>
                <span className="text-[#FFE600] font-heading text-lg font-black">150 PTS + BONUS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Leaderboard Podium Preview: 1st Yellow (#FFE600), 2nd Cyan (#00CFFF), 3rd Violet (#8B35FF) */}
        <div className="p-6 sm:p-8 bg-[#171722] border border-violet-500/30 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#00CFFF] flex items-center gap-1.5">
                <Trophy size={14} className="text-[#FFE600]" /> Líderes de la Cima
              </span>
              <h3 className="text-2xl sm:text-3xl font-heading text-white mt-0.5">
                PODIO ACTUAL GORILLAZ GYM
              </h3>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onOpenRanking();
              }}
              className="text-xs font-bold text-[#00CFFF] hover:text-white flex items-center gap-1 bg-[#080810] hover:bg-[#20202e] px-4 py-2.5 rounded-xl border border-cyan-400/40 transition w-fit cursor-pointer"
            >
              <span>Ver Tabla Completa</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top 1 Champion Card: Yellow (#FFE600) */}
            <div className="p-5 bg-gradient-to-b from-[#FFE600]/15 via-[#171722] to-[#080810] border-2 border-[#FFE600] rounded-xl relative overflow-hidden flex flex-col justify-between shadow-[0_0_25px_rgba(255,230,0,0.3)]">
              <div className="absolute top-2 right-2 opacity-30">
                <ChampionTrophyBadge size={75} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">👑</span>
                  <span className="text-xs font-black uppercase tracking-wider text-[#080810] bg-[#FFE600] px-2.5 py-0.5 rounded shadow">
                    1° PUESTO - LÍDER
                  </span>
                </div>
                <h4 className="text-xl font-heading text-white">
                  {top1 ? top1.name : 'Sin récord aún'}
                </h4>
                {top1?.nickname && (
                  <p className="text-xs font-bold text-[#FFE600]">"{top1.nickname}"</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Puntaje:</span>
                <span className="font-heading text-2xl text-[#FFE600] font-black text-glow-yellow">
                  {top1 ? `${top1.bestScore} PTS` : '-'}
                </span>
              </div>
            </div>

            {/* Top 2 Card: Blue (#00CFFF) */}
            <div className="p-5 bg-gradient-to-b from-[#00CFFF]/10 via-[#171722] to-[#080810] border-2 border-[#00CFFF]/60 rounded-xl flex flex-col justify-between shadow-[0_0_20px_rgba(0,207,255,0.2)]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#080810] bg-[#00CFFF] px-2 py-0.5 rounded">
                    2° PUESTO
                  </span>
                </div>
                <h4 className="text-lg font-heading text-white">
                  {top2 ? top2.name : 'Vacante'}
                </h4>
                {top2?.nickname && (
                  <p className="text-xs font-semibold text-[#00CFFF]">"{top2.nickname}"</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Puntaje:</span>
                <span className="font-heading text-xl text-[#00CFFF] font-black text-glow-cyan">
                  {top2 ? `${top2.bestScore} PTS` : '-'}
                </span>
              </div>
            </div>

            {/* Top 3 Card: Violet (#8B35FF) */}
            <div className="p-5 bg-gradient-to-b from-[#8B35FF]/10 via-[#171722] to-[#080810] border-2 border-[#8B35FF]/60 rounded-xl flex flex-col justify-between shadow-[0_0_20px_rgba(139,53,255,0.2)]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-white bg-[#8B35FF] px-2 py-0.5 rounded">
                    3° PUESTO
                  </span>
                </div>
                <h4 className="text-lg font-heading text-white">
                  {top3 ? top3.name : 'Vacante'}
                </h4>
                {top3?.nickname && (
                  <p className="text-xs font-semibold text-[#B026FF]">"{top3.nickname}"</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Puntaje:</span>
                <span className="font-heading text-xl text-[#B026FF] font-black text-glow-violet">
                  {top3 ? `${top3.bestScore} PTS` : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
