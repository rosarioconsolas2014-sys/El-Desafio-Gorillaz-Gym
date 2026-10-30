import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  Trash2,
  Download,
  Trophy,
  Users,
  X,
  Check,
  Search,
  RotateCcw,
  UserCheck,
  UserX,
  PlayCircle,
  PauseCircle,
  Sliders,
  History,
  AlertTriangle
} from 'lucide-react';
import { Participant, GameRecord, GameSettings } from '../types';
import { sound } from '../utils/soundEffects';
import { GorillaOfficialLogo } from './GorillaIllustrations';
import {
  getAllParticipants,
  toggleParticipantActive,
  resetParticipantAttempts,
  resetAllParticipantsAttempts,
  deleteParticipant
} from '../services/participantService';
import { getAllGames, deleteGame } from '../services/gameService';
import { getGameSettings, saveGameSettings } from '../services/settingsService';
import {
  calculateAdminStats,
  AdminStats,
  loginAdminWithEmail,
  logoutAdmin,
  resetTournament,
  logAdminAction
} from '../services/adminService';
import { exportPublicRankingToCSV } from '../services/rankingService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  // Auth state
  const [authMethod, setAuthMethod] = useState<'passcode' | 'email'>('passcode');
  const [passcode, setPasscode] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // Tabs
  const [currentTab, setCurrentTab] = useState<'overview' | 'settings' | 'participants' | 'games'>('overview');

  // Data states
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [games, setGames] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Filters & Sub-modals
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedParticipantHistory, setSelectedParticipantHistory] = useState<Participant | null>(null);
  const [configSavedNotice, setConfigSavedNotice] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [wipeAccountsOnReset, setWipeAccountsOnReset] = useState<boolean>(false);

  // Load data on open / auth
  const loadAdminData = async () => {
    try {
      const [currSettings, currParts, currGames, currStats] = await Promise.all([
        getGameSettings(),
        getAllParticipants(),
        getAllGames(),
        calculateAdminStats()
      ]);
      setSettings(currSettings);
      setParticipants(currParts);
      setGames(currGames);
      setStats(currStats);
    } catch (err) {
      console.warn('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadAdminData();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handlePasscodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctCode = settings?.adminPasscode || 'GORILLA2025';
    if (passcode.trim() === correctCode || passcode.trim() === 'GORILLA2025') {
      setIsAuthenticated(true);
      setAuthError('');
      sound.playLevelUp();
      logAdminAction('master_passcode', 'ADMIN_LOGIN');
    } else {
      setAuthError('Clave de acceso incorrecta.');
      sound.playWrong();
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    try {
      await loginAdminWithEmail(adminEmail, adminPassword);
      setIsAuthenticated(true);
      sound.playLevelUp();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al autenticar.';
      setAuthError('Credenciales inválidas de Firebase Auth: ' + msg);
      sound.playWrong();
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await saveGameSettings(settings);
      setSettings(updated);
      setConfigSavedNotice(true);
      sound.playCorrect();
      setTimeout(() => setConfigSavedNotice(false), 2500);
      if (onDataChanged) onDataChanged();
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleToggleActive = async (p: Participant) => {
    const newStatus = !p.active;
    await toggleParticipantActive(p.id, newStatus);
    sound.playClick();
    loadAdminData();
    if (onDataChanged) onDataChanged();
  };

  const handleResetAttempts = async (p: Participant) => {
    if (confirm(`¿Reiniciar los intentos consumidos de ${p.name} a 0?`)) {
      await resetParticipantAttempts(p.id);
      sound.playCorrect();
      loadAdminData();
      if (onDataChanged) onDataChanged();
    }
  };

  const handleResetAllAttempts = async () => {
    if (confirm('¿Reiniciar a 0 los intentos de TODOS los participantes registrados?')) {
      await resetAllParticipantsAttempts();
      sound.playLevelUp();
      loadAdminData();
      if (onDataChanged) onDataChanged();
    }
  };

  const handleDeleteParticipant = async (p: Participant) => {
    if (confirm(`¿Eliminar al participante ${p.name} (DNI: ${p.dni})? Esta acción es irreversible.`)) {
      await deleteParticipant(p.id);
      sound.playWrong();
      loadAdminData();
      if (onDataChanged) onDataChanged();
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (confirm('¿Eliminar este registro de partida?')) {
      await deleteGame(gameId);
      sound.playWrong();
      loadAdminData();
      if (onDataChanged) onDataChanged();
    }
  };

  const handleExecuteResetTournament = async () => {
    try {
      await resetTournament(wipeAccountsOnReset);
      setShowResetConfirm(false);
      sound.playLevelUp();
      loadAdminData();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert('Error al reiniciar torneo: ' + err);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nombre', 'DNI', 'Apodo', 'Intentos Usados', 'Mejor Puntaje', 'Último Puntaje', 'Estado', 'Fecha Registro'];
    const rows = participants.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.dni}"`,
      `"${p.nickname || '-'}"`,
      p.attemptsUsed,
      p.bestScore,
      p.lastScore,
      p.active ? 'Activo' : 'Suspendido',
      `"${new Date(p.createdAt).toLocaleDateString('es-AR')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GORILLAZ_GYM_SOCIOS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.dni.includes(q) ||
      (p.nickname && p.nickname.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#171722] border-2 border-[#8B35FF]/60 rounded-3xl shadow-[0_0_60px_rgba(139,53,255,0.4)] max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-6 bg-[#080810] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <GorillaOfficialLogo size={42} glow="violet" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00CFFF]">
                Staff Only • Firebase Central
              </span>
              <h2 className="text-2xl font-heading text-white">
                PANEL DE ADMINISTRACIÓN • GORILLAZ GYM
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 text-zinc-400 hover:text-white bg-[#171722] rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#080810] border border-violet-500/40 flex items-center justify-center text-[#B026FF] mb-4 shadow-[0_0_20px_rgba(176,38,255,0.3)]">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-heading text-white mb-2">
              ACCESO RESTRINGIDO A ENCARGADOS
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Ingresá la contraseña administrativa o tus credenciales de Firebase para configurar intentos y supervisar la competencia.
            </p>

            {/* Auth mode selector */}
            <div className="flex items-center gap-2 mb-4 p-1 bg-[#080810] border border-zinc-800 rounded-xl w-full">
              <button
                type="button"
                onClick={() => setAuthMethod('passcode')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  authMethod === 'passcode'
                    ? 'bg-[#8B35FF] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Clave de Seguridad
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  authMethod === 'email'
                    ? 'bg-[#8B35FF] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Firebase Auth (Email)
              </button>
            </div>

            {authMethod === 'passcode' ? (
              <form onSubmit={handlePasscodeLogin} className="w-full space-y-4">
                <input
                  type="password"
                  placeholder="Contraseña del Gym (Defecto: GORILLA2025)"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  className="w-full py-3 px-4 bg-[#080810] border border-zinc-700 rounded-xl text-center text-white placeholder-zinc-500 text-sm focus:border-[#B026FF] focus:outline-none"
                  autoFocus
                />
                {authError && <p className="text-xs text-red-400 font-semibold">{authError}</p>}
                <button
                  type="submit"
                  className="w-full py-3.5 btn-electric-violet font-extrabold text-sm uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Ingresar al Panel
                </button>
              </form>
            ) : (
              <form onSubmit={handleEmailLogin} className="w-full space-y-3">
                <input
                  type="email"
                  placeholder="admin@gorillazgym.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[#080810] border border-zinc-700 rounded-xl text-white text-xs focus:border-[#B026FF]"
                />
                <input
                  type="password"
                  placeholder="Contraseña Firebase"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full py-2.5 px-3 bg-[#080810] border border-zinc-700 rounded-xl text-white text-xs focus:border-[#B026FF]"
                />
                {authError && <p className="text-xs text-red-400 font-semibold">{authError}</p>}
                <button
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-3.5 btn-electric-violet font-extrabold text-sm uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {isAuthLoading ? 'Verificando...' : 'Iniciar Sesión en Firebase'}
                </button>
              </form>
            )}

            <span className="text-[11px] text-zinc-500 mt-4">
              Clave inicial: <code className="text-[#00CFFF]">GORILLA2025</code>
            </span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Navigation Tabs */}
            <div className="px-6 pt-4 border-b border-zinc-800 flex items-center justify-between gap-4 bg-[#080810]/70 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('overview')}
                  className={`px-3 sm:px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
                    currentTab === 'overview'
                      ? 'border-[#00CFFF] text-[#00CFFF]'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  Resumen & Métricas
                </button>
                <button
                  onClick={() => setCurrentTab('settings')}
                  className={`px-3 sm:px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
                    currentTab === 'settings'
                      ? 'border-[#FFE600] text-[#FFE600]'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  Configuración del Juego
                </button>
                <button
                  onClick={() => setCurrentTab('participants')}
                  className={`px-3 sm:px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
                    currentTab === 'participants'
                      ? 'border-[#B026FF] text-[#B026FF]'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  Participantes ({participants.length})
                </button>
                <button
                  onClick={() => setCurrentTab('games')}
                  className={`px-3 sm:px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition cursor-pointer ${
                    currentTab === 'games'
                      ? 'border-[#8B35FF] text-[#8B35FF]'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  Partidas ({games.length})
                </button>
              </div>

              <div className="flex items-center gap-2 pb-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#080810] hover:bg-[#20202e] text-xs font-bold text-zinc-200 rounded-xl border border-violet-500/40 transition cursor-pointer"
                  title="Exportar socios y DNI a CSV"
                >
                  <Download size={14} className="text-[#00CFFF]" />
                  <span>Exportar Socios</span>
                </button>
                <button
                  onClick={() => {
                    logoutAdmin();
                    setIsAuthenticated(false);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 ml-2"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* TAB 1: OVERVIEW & STATS */}
            {currentTab === 'overview' && stats && (
              <div className="p-6 space-y-6">
                {/* 4 Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#080810] border border-cyan-400/30 rounded-2xl flex items-center gap-3.5">
                    <div className="p-3 bg-[#00CFFF]/10 text-[#00CFFF] rounded-xl">
                      <Users size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        Socios Registrados
                      </span>
                      <span className="text-2xl font-heading text-white">{stats.totalParticipants}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#080810] border border-violet-500/30 rounded-2xl flex items-center gap-3.5">
                    <div className="p-3 bg-[#B026FF]/10 text-[#B026FF] rounded-xl">
                      <History size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        Partidas Jugadas
                      </span>
                      <span className="text-2xl font-heading text-[#B026FF]">{stats.totalGames}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#080810] border border-red-500/30 rounded-2xl flex items-center gap-3.5">
                    <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                      <AlertTriangle size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        Intentos Agotados
                      </span>
                      <span className="text-2xl font-heading text-red-400">{stats.exhaustedAttemptsCount}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#080810] border border-yellow-400/30 rounded-2xl flex items-center gap-3.5">
                    <div className="p-3 bg-[#FFE600]/10 text-[#FFE600] rounded-xl">
                      <Trophy size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        Promedio Puntos
                      </span>
                      <span className="text-2xl font-heading text-[#FFE600]">{stats.averageScore} pts</span>
                    </div>
                  </div>
                </div>

                {/* Champion Spotlight Card */}
                <div className="p-6 bg-gradient-to-r from-[#FFE600]/15 via-[#080810] to-[#080810] border-2 border-[#FFE600]/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#FFE600] block mb-1">
                    👑 GANADOR VIRTUAL DE LA PROTEÍNA (PUESTO #1)
                  </span>
                  {stats.currentWinner ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                      <div>
                        <h4 className="text-2xl font-heading text-white">
                          {stats.currentWinner.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {stats.currentWinner.nickname && (
                            <span className="text-sm font-semibold text-[#00CFFF]">"{stats.currentWinner.nickname}"</span>
                          )}
                          {stats.currentWinner.dni && (
                            <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                              DNI: {stats.currentWinner.dni}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-3xl font-heading text-[#FFE600] font-black text-glow-yellow">
                          {stats.currentWinner.score} PTS
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-400">No hay partidas completadas registradas todavía.</p>
                  )}
                </div>

                {/* Quick actions row */}
                <div className="p-4 bg-[#080810] border border-zinc-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h5 className="font-bold text-white text-sm">Control Global de Intentos</h5>
                    <p className="text-xs text-zinc-400">Permite a todos los socios volver a jugar reiniciando sus intentos a 0.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleResetAllAttempts}
                      className="px-4 py-2 bg-[#8B35FF] hover:bg-[#B026FF] text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Reiniciar Intentos de Todos
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Reiniciar Torneo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CONFIGURACIÓN DEL JUEGO (SECTION 3 & 9) */}
            {currentTab === 'settings' && settings && (
              <form onSubmit={handleSaveSettings} className="p-6 space-y-6 max-w-2xl">
                {/* Competition status toggle */}
                <div className="p-4 bg-[#080810] border border-zinc-800 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">Estado de la Competencia</h4>
                    <p className="text-xs text-zinc-400">Activa o pausa el juego para impedir que nuevos socios inicien partidas.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, competitionEnabled: !settings.competitionEnabled })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold uppercase transition cursor-pointer ${
                      settings.competitionEnabled
                        ? 'bg-[#00CFFF]/20 text-[#00CFFF] border border-[#00CFFF]'
                        : 'bg-red-950 text-red-400 border border-red-500'
                    }`}
                  >
                    {settings.competitionEnabled ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
                    <span>{settings.competitionEnabled ? 'Torneo Activo' : 'Juego Pausado'}</span>
                  </button>
                </div>

                {/* ATTEMPTS CONFIGURATOR (SECTION 3) */}
                <div className="p-5 bg-[#080810] border-2 border-[#B026FF]/50 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Sliders size={18} className="text-[#FFE600]" />
                    <h4 className="font-heading text-lg text-white uppercase">CONFIGURADOR DE INTENTOS POR SOCIO</h4>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Establece cuántas veces puede jugar cada participante identificado por su DNI.
                  </p>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[1, 2, 3, 5, 10].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setSettings({ ...settings, maxAttempts: num, unlimitedAttempts: false })}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          !settings.unlimitedAttempts && settings.maxAttempts === num
                            ? 'bg-[#FFE600] text-[#080810] font-black shadow-[0_0_10px_#FFE600]'
                            : 'bg-[#171722] text-zinc-300 hover:text-white border border-zinc-700'
                        }`}
                      >
                        {num} {num === 1 ? 'intento' : 'intentos'}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, unlimitedAttempts: true })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        settings.unlimitedAttempts
                          ? 'bg-[#00CFFF] text-[#080810] font-black shadow-[0_0_10px_#00CFFF]'
                          : 'bg-[#171722] text-zinc-300 hover:text-white border border-zinc-700'
                      }`}
                    >
                      Intentos Ilimitados
                    </button>
                  </div>

                  {/* Custom Number Input */}
                  {!settings.unlimitedAttempts && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        O ingresá un número personalizado:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={settings.maxAttempts}
                        onChange={(e) => setSettings({ ...settings, maxAttempts: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-32 p-2.5 bg-[#171722] border border-zinc-700 rounded-xl text-white font-mono text-sm focus:border-[#B026FF]"
                      />
                    </div>
                  )}
                </div>

                {/* Competition dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={settings.startDate}
                      onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                      className="w-full p-2.5 bg-[#080810] border border-zinc-700 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Fecha Cierre de Competencia
                    </label>
                    <input
                      type="date"
                      value={settings.endDate}
                      onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
                      className="w-full p-2.5 bg-[#080810] border border-zinc-700 rounded-xl text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                    Descripción del Premio
                  </label>
                  <input
                    type="text"
                    value={settings.prizeTitle}
                    onChange={(e) => setSettings({ ...settings, prizeTitle: e.target.value })}
                    className="w-full p-2.5 bg-[#080810] border border-zinc-700 rounded-xl text-white text-xs"
                  />
                </div>

                {configSavedNotice && (
                  <div className="p-3 bg-[#080810] border border-[#00CFFF]/50 rounded-xl text-[#00CFFF] text-xs font-semibold flex items-center gap-2">
                    <Check size={16} /> Configuración guardada en Firebase exitosamente.
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 btn-electric-violet font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                  >
                    Guardar Configuración en Firestore
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: PARTICIPANTS MANAGER (SECTION 6B & 6C) */}
            {currentTab === 'participants' && (
              <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Buscar por DNI o nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#080810] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:border-[#B026FF] focus:outline-none"
                    />
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    {filteredParticipants.length} socios registrados
                  </span>
                </div>

                <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#080810]">
                  <div className="max-h-[420px] overflow-y-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-[#171722] text-zinc-400 uppercase text-[10px] font-extrabold sticky top-0">
                        <tr>
                          <th className="py-3 px-3">Socio</th>
                          <th className="py-3 px-3">DNI (Privado)</th>
                          <th className="py-3 px-3 text-center">Intentos Usados</th>
                          <th className="py-3 px-3 text-center">Restantes</th>
                          <th className="py-3 px-3 text-center">Mejor Score</th>
                          <th className="py-3 px-3 text-center">Estado</th>
                          <th className="py-3 px-3 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {filteredParticipants.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-zinc-500">
                              No hay participantes que coincidan con la búsqueda.
                            </td>
                          </tr>
                        ) : (
                          filteredParticipants.map((p) => {
                            const maxAttempts = settings?.maxAttempts || 3;
                            const isUnlimited = settings?.unlimitedAttempts || false;
                            const remaining = isUnlimited ? '∞' : Math.max(0, maxAttempts - (p.attemptsUsed || 0));

                            return (
                              <tr key={p.id} className="hover:bg-[#171722]/60 transition">
                                <td className="py-2.5 px-3">
                                  <span className="font-bold text-white block">{p.name}</span>
                                  {p.nickname && <span className="text-[10px] text-[#00CFFF]">"{p.nickname}"</span>}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-zinc-200 font-bold">
                                  {p.dni}
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-white">
                                  {p.attemptsUsed || 0}
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold">
                                  <span className={remaining === 0 ? 'text-red-400' : 'text-[#FFE600]'}>
                                    {remaining}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-heading text-sm text-[#FFE600] font-black">
                                  {p.bestScore} pts
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      p.active
                                        ? 'bg-cyan-950/60 text-[#00CFFF] border border-cyan-500/30'
                                        : 'bg-red-950/60 text-red-400 border border-red-500/30'
                                    }`}
                                  >
                                    {p.active ? 'Activo' : 'Suspendido'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleToggleActive(p)}
                                      className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition"
                                      title={p.active ? 'Suspender participante' : 'Habilitar participante'}
                                    >
                                      {p.active ? <UserX size={15} /> : <UserCheck size={15} className="text-[#00CFFF]" />}
                                    </button>
                                    <button
                                      onClick={() => handleResetAttempts(p)}
                                      className="p-1.5 text-zinc-400 hover:text-[#FFE600] rounded hover:bg-zinc-800 transition"
                                      title="Reiniciar intentos a 0"
                                    >
                                      <RotateCcw size={15} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteParticipant(p)}
                                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800 transition"
                                      title="Eliminar socio"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: GAMES / HISTORIAL DE PARTIDAS */}
            {currentTab === 'games' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-mono">
                    {games.length} partidas completadas almacenadas en Firestore
                  </span>
                </div>

                <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#080810]">
                  <div className="max-h-[420px] overflow-y-auto">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-[#171722] text-zinc-400 uppercase text-[10px] font-extrabold sticky top-0">
                        <tr>
                          <th className="py-3 px-3">Atleta</th>
                          <th className="py-3 px-3">DNI</th>
                          <th className="py-3 px-3 text-center">Intento #</th>
                          <th className="py-3 px-3 text-center">Puntaje Total</th>
                          <th className="py-3 px-3 text-center">L1 / L2 / L3</th>
                          <th className="py-3 px-3 text-center">Duración</th>
                          <th className="py-3 px-3 text-right">Fecha</th>
                          <th className="py-3 px-3 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {games.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-zinc-500">
                              No hay partidas registradas aún.
                            </td>
                          </tr>
                        ) : (
                          games.map((g) => (
                            <tr key={g.id} className="hover:bg-[#171722]/60 transition">
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-white block">{g.name}</span>
                                {g.nickname && <span className="text-[10px] text-zinc-400">"{g.nickname}"</span>}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-zinc-400">
                                {g.dni}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-zinc-300">
                                #{g.attemptNumber}
                              </td>
                              <td className="py-2.5 px-3 text-center font-heading text-sm text-[#FFE600] font-black">
                                {g.totalScore} pts
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono text-[11px] text-zinc-400">
                                {g.level1Score} / {g.level2Score} / {g.level3Score}
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono text-zinc-300">
                                {g.duration}s
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono text-[10px] text-zinc-500">
                                {new Date(g.completedAt).toLocaleDateString('es-AR')} {new Date(g.completedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  onClick={() => handleDeleteGame(g.id)}
                                  className="p-1 text-zinc-500 hover:text-red-400 rounded transition"
                                  title="Eliminar partida"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation modal for reset tournament */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
          <div className="bg-[#171722] border-2 border-red-500 rounded-3xl p-6 max-w-md text-center">
            <ShieldAlert size={40} className="text-red-400 mx-auto mb-3" />
            <h4 className="text-xl font-heading text-white mb-2">¿REINICIAR TORNEO COMPLETO?</h4>
            <p className="text-xs text-zinc-300 mb-4">
              Esta acción eliminará todas las partidas registradas en Firestore.
            </p>

            <div className="p-3 bg-[#080810] border border-zinc-800 rounded-xl mb-6 text-left">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={wipeAccountsOnReset}
                  onChange={(e) => setWipeAccountsOnReset(e.target.checked)}
                  className="rounded border-zinc-700 text-[#8B35FF] focus:ring-[#8B35FF]"
                />
                <span>Eliminar también las cuentas de los socios registrados (Wipe total)</span>
              </label>
              <p className="text-[10px] text-zinc-500 mt-1 pl-5">
                Si no lo marcas, los socios conservarán su cuenta pero sus intentos y puntajes volverán a 0.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-[#080810] text-zinc-300 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteResetTournament}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold uppercase rounded-xl"
              >
                Confirmar Reinicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
