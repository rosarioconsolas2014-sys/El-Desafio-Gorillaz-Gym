import React, { useState } from 'react';
import { Trophy, Clock, Search, Calendar, Download, Play, ArrowLeft } from 'lucide-react';
import { ChampionTrophyBadge, GorillaOfficialLogo } from './GorillaIllustrations';
import { PublicRankItem, exportPublicRankingToCSV } from '../services/rankingService';
import { GameRecord } from '../types';
import { sound } from '../utils/soundEffects';

interface RankingProps {
  leaderboard: PublicRankItem[];
  allGames?: GameRecord[];
  onStartGame: () => void;
  onBackToHome: () => void;
}

export const Ranking: React.FC<RankingProps> = ({
  leaderboard,
  allGames = [],
  onStartGame,
  onBackToHome,
}) => {
  const [activeTab, setActiveTab] = useState<'best' | 'history'>('best');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const formatTime = (seconds: number) => {
    if (!seconds || seconds <= 0) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return `${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Filter list
  const filteredBest = leaderboard.filter((p) => {
    const term = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(term) || (p.nickname && p.nickname.toLowerCase().includes(term));
  });

  const filteredHistory = allGames.filter((p) => {
    const term = searchTerm.toLowerCase();
    return p.name.toLowerCase().includes(term) || (p.nickname && p.nickname.toLowerCase().includes(term));
  });

  const top1 = leaderboard[0];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto bg-[#080810]">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <button
          onClick={() => {
            sound.playClick();
            onBackToHome();
          }}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-[#171722] hover:bg-[#20202e] px-4 py-2.5 rounded-xl border border-zinc-800 transition cursor-pointer"
        >
          <ArrowLeft size={16} className="text-[#00CFFF]" />
          <span>Volver al Inicio</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              sound.playClick();
              exportPublicRankingToCSV(leaderboard);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#171722] hover:bg-[#20202e] text-zinc-200 border border-violet-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            title="Descargar ranking en formato Excel CSV"
          >
            <Download size={15} className="text-[#00CFFF]" />
            <span>Descargar CSV</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 btn-electric-violet font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            <Play size={15} className="fill-white" />
            <span>Jugar Ahora</span>
          </button>
        </div>
      </div>

      {/* Title Header with Official Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <GorillaOfficialLogo size={65} glow="violet" />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#B026FF]/15 border border-[#B026FF]/30 text-[#00CFFF] text-xs font-extrabold uppercase tracking-widest mb-2">
          <Trophy size={14} className="text-[#FFE600]" /> Clasificación Oficial en Vivo
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading text-white uppercase tracking-wider">
          RANKING DE GORILLAZ GYM
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto mt-1">
          El participante con mayor puntaje acumulado al cierre del torneo se lleva el pote de proteína Whey.
        </p>
      </div>

      {/* #1 Leader Banner: Yellow (#FFE600) */}
      {top1 && (
        <div className="mb-8 p-6 sm:p-8 bg-gradient-to-r from-[#FFE600]/20 via-[#171722] to-[#080810] border-2 border-[#FFE600] rounded-3xl shadow-[0_0_35px_rgba(255,230,0,0.3)] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative">
              <ChampionTrophyBadge size={105} />
              <div className="absolute -top-2 -right-2 bg-[#FFE600] text-[#080810] font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                LÍDER #1
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE600]/20 border border-[#FFE600]/40 text-[#FFE600] text-xs font-black uppercase tracking-wider mb-2">
                👑 ACTUAL CAMPEÓN VIRTUAL
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading text-white">
                {top1.name}
              </h2>
              {top1.nickname && (
                <p className="text-sm font-bold text-[#FFE600] mt-0.5">
                  "{top1.nickname}"
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-[#00CFFF]" /> Tiempo: <strong className="text-zinc-200">{formatTime(top1.bestTimeSeconds)}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-[#B026FF]" /> {formatDate(top1.lastPlayedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#080810] rounded-2xl border border-[#FFE600]/40 text-center shrink-0 min-w-[160px] shadow-[0_0_20px_rgba(255,230,0,0.2)]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Puntaje Récord
            </span>
            <span className="text-4xl font-heading text-[#FFE600] font-black text-glow-yellow">
              {top1.bestScore} <span className="text-base text-zinc-400 font-sans">PTS</span>
            </span>
            <span className="text-[10px] font-semibold text-[#00CFFF] block mt-1">
              Intentos Utilizados: {top1.attemptsUsed}
            </span>
          </div>
        </div>
      )}

      {/* Tabs & Search controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        {/* Tabs */}
        <div className="flex items-center p-1 bg-[#171722] border border-zinc-800 rounded-xl">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('best');
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeTab === 'best'
                ? 'bg-gradient-to-r from-[#8B35FF] to-[#B026FF] text-white shadow-[0_0_12px_rgba(176,38,255,0.5)] font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mejor Récord por Socio ({leaderboard.length})
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('history');
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-[#8B35FF] to-[#B026FF] text-white shadow-[0_0_12px_rgba(176,38,255,0.5)] font-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Historial de Partidas ({allGames.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o apodo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#171722] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-[#B026FF] focus:outline-none transition"
          />
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-[#171722] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-[#080810] text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-4 px-4 sm:px-6 w-16 text-center">Puesto</th>
                <th className="py-4 px-4">Participante</th>
                <th className="py-4 px-4 text-center">Puntaje Total</th>
                <th className="py-4 px-4 text-center">Tiempo</th>
                <th className="py-4 px-4 text-right hidden sm:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-medium">
              {activeTab === 'best' ? (
                filteredBest.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500 text-sm">
                      No se encontraron participantes registrados aún.
                    </td>
                  </tr>
                ) : (
                  filteredBest.map((item) => {
                    const isRank1 = item.rank === 1;
                    const isRank2 = item.rank === 2;
                    const isRank3 = item.rank === 3;

                    return (
                      <tr
                        key={item.id}
                        className={`transition ${
                          isRank1
                            ? 'bg-[#FFE600]/10 hover:bg-[#FFE600]/15'
                            : isRank2
                            ? 'bg-[#00CFFF]/10 hover:bg-[#00CFFF]/15'
                            : isRank3
                            ? 'bg-[#8B35FF]/10 hover:bg-[#8B35FF]/15'
                            : 'hover:bg-[#20202e]'
                        }`}
                      >
                        {/* Rank Position */}
                        <td className="py-4 px-4 text-center">
                          {isRank1 && (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFE600] text-[#080810] font-heading font-black text-lg shadow-[0_0_12px_#FFE600]">
                              👑 1
                            </span>
                          )}
                          {isRank2 && (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#00CFFF] text-[#080810] font-heading font-black text-sm shadow-[0_0_12px_#00CFFF]">
                              2
                            </span>
                          )}
                          {isRank3 && (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#8B35FF] text-white font-heading font-black text-sm shadow-[0_0_12px_#8B35FF]">
                              3
                            </span>
                          )}
                          {!isRank1 && !isRank2 && !isRank3 && (
                            <span className="text-zinc-400 font-heading text-base font-bold">
                              #{item.rank}
                            </span>
                          )}
                        </td>

                        {/* Name & Nickname */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-lg sm:text-xl text-white">
                              {item.name}
                            </span>
                            {item.nickname && (
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                  isRank1
                                    ? 'text-[#FFE600] border-[#FFE600]/30 bg-[#FFE600]/10'
                                    : isRank2
                                    ? 'text-[#00CFFF] border-[#00CFFF]/30 bg-[#00CFFF]/10'
                                    : isRank3
                                    ? 'text-[#B026FF] border-[#B026FF]/30 bg-[#B026FF]/10'
                                    : 'text-zinc-400 border-zinc-700 bg-zinc-800'
                                }`}
                              >
                                "{item.nickname}"
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Score */}
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`font-heading text-xl sm:text-2xl font-black ${
                              isRank1 ? 'text-[#FFE600] text-glow-yellow' : isRank2 ? 'text-[#00CFFF] text-glow-cyan' : isRank3 ? 'text-[#B026FF] text-glow-violet' : 'text-[#FFE600]'
                            }`}
                          >
                            {item.bestScore}{' '}
                            <span className="text-xs font-sans text-zinc-400">pts</span>
                          </span>
                        </td>

                        {/* Time */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1 font-mono text-xs text-zinc-300">
                            <Clock size={13} className="text-zinc-500" />
                            <span>{formatTime(item.bestTimeSeconds)}</span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-right hidden sm:table-cell text-xs text-zinc-400 font-mono">
                          {formatDate(item.lastPlayedAt)}
                        </td>
                      </tr>
                    );
                  })
                )
              ) : (
                filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500 text-sm">
                      No hay partidas registradas aún.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-[#20202e] transition">
                      <td className="py-4 px-4 text-center text-zinc-500 text-xs">
                        #{idx + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-lg text-white">
                            {item.name}
                          </span>
                          {item.nickname && (
                            <span className="text-xs text-zinc-400">
                              "{item.nickname}"
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-heading text-xl text-[#FFE600] font-bold">
                          {item.totalScore} <span className="text-xs font-sans text-zinc-500">pts</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-xs text-zinc-400">
                        {formatTime(item.duration)}
                      </td>
                      <td className="py-4 px-4 text-right hidden sm:table-cell text-xs text-zinc-400 font-mono">
                        {formatDate(item.completedAt)}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
