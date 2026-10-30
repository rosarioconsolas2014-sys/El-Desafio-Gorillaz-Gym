import React, { useState, useEffect } from 'react';
import { User, Dumbbell, Sparkles, X, ChevronRight, Hash, AlertTriangle, CheckCircle, Trophy } from 'lucide-react';
import { GorillaOfficialLogo } from './GorillaIllustrations';
import { sound } from '../utils/soundEffects';
import { Participant } from '../types';
import {
  validateDNI,
  getParticipantByDni,
  registerOrGetParticipant,
  calculateRemainingAttempts
} from '../services/participantService';
import { getGameSettings } from '../services/settingsService';

interface PlayerRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterAndStart: (participant: Participant) => void;
  lastPlayerName?: string;
  onViewLeaderboard?: () => void;
}

const NICKNAME_IDEAS = ['La Bestia', 'El Toro', 'Titán', 'Pitbull', 'Espartano', 'Iron Man', 'Vikingo'];

export const PlayerRegistration: React.FC<PlayerRegistrationProps> = ({
  isOpen,
  onClose,
  onRegisterAndStart,
  lastPlayerName = '',
  onViewLeaderboard,
}) => {
  const [fullName, setFullName] = useState<string>(lastPlayerName);
  const [dni, setDni] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isCheckingDni, setIsCheckingDni] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Existing participant state if found
  const [existingParticipant, setExistingParticipant] = useState<Participant | null>(null);
  const [attemptsStatus, setAttemptsStatus] = useState<{
    canPlay: boolean;
    remainingText: string;
    remainingCount: number;
  } | null>(null);

  if (!isOpen) return null;

  // Real-time DNI lookup when 7 or 8 digits are entered
  const handleDniChange = async (val: string) => {
    // Only accept numeric characters
    const clean = val.replace(/\D/g, '').slice(0, 8);
    setDni(clean);
    if (error) setError('');

    if (clean.length >= 7) {
      setIsCheckingDni(true);
      try {
        const [found, settings] = await Promise.all([
          getParticipantByDni(clean),
          getGameSettings()
        ]);

        if (found) {
          setExistingParticipant(found);
          if (!fullName.trim() && found.name) {
            setFullName(found.name);
          }
          if (!nickname.trim() && found.nickname) {
            setNickname(found.nickname);
          }
          const status = calculateRemainingAttempts(found, settings);
          setAttemptsStatus(status);
        } else {
          setExistingParticipant(null);
          // New participant
          const status = calculateRemainingAttempts(
            {
              id: '',
              name: '',
              dni: clean,
              attemptsUsed: 0,
              bestScore: 0,
              lastScore: 0,
              bestTimeSeconds: 0,
              createdAt: '',
              lastPlayedAt: '',
              active: true
            },
            settings
          );
          setAttemptsStatus(status);
        }
      } catch (err) {
        console.warn('DNI check error:', err);
      } finally {
        setIsCheckingDni(false);
      }
    } else {
      setExistingParticipant(null);
      setAttemptsStatus(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate DNI
    const valDni = validateDNI(dni);
    if (!valDni.isValid) {
      setError(valDni.error || 'DNI inválido.');
      sound.playWrong();
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 3) {
      setError('Por favor ingresa tu nombre y apellido completo (mínimo 3 letras).');
      sound.playWrong();
      return;
    }

    // Check game settings & competition enabled
    try {
      setIsSubmitting(true);
      const settings = await getGameSettings();

      if (!settings.competitionEnabled) {
        setError('El torneo se encuentra temporalmente en pausa por el gimnasio.');
        sound.playWrong();
        setIsSubmitting(false);
        return;
      }

      const { participant } = await registerOrGetParticipant(fullName, dni, nickname);

      const status = calculateRemainingAttempts(participant, settings);
      setAttemptsStatus(status);

      if (!status.canPlay) {
        setError(status.remainingText);
        sound.playWrong();
        setIsSubmitting(false);
        return;
      }

      setError('');
      sound.playBeastRoar();
      onRegisterAndStart(participant);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar participante.';
      setError(msg);
      sound.playWrong();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBlocked = attemptsStatus && !attemptsStatus.canPlay;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#171722] border-2 border-[#8B35FF] rounded-3xl shadow-[0_0_50px_rgba(176,38,255,0.4)] overflow-hidden">
        {/* Top glow border in Electric Violet to Neon Blue gradient */}
        <div className="h-2 w-full bg-gradient-to-r from-[#8B35FF] via-[#00CFFF] to-[#B026FF]" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-[#080810] hover:bg-[#20202e] rounded-xl transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-5">
            <GorillaOfficialLogo size={62} glow="violet" />
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#00CFFF]">
                Ficha del Atleta
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading text-white">
                REGISTRO DEL RETADOR
              </h2>
            </div>
          </div>

          <p className="text-sm text-zinc-300 mb-5">
            Identificate con tu DNI para vincular tus intentos y competir en la base central de <strong className="text-[#00CFFF]">GORILLAZ GYM</strong>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* DNI Field (Required, 7-8 numeric digits) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex justify-between">
                <span>DNI del Socio <span className="text-[#FFE600]">*</span></span>
                <span className="text-zinc-500 font-mono text-[11px]">7 u 8 dígitos numéricos</span>
              </label>
              <div className="relative">
                <Hash size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="Ej: 38452119"
                  maxLength={8}
                  value={dni}
                  onChange={(e) => handleDniChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#080810] border border-zinc-700 focus:border-[#00CFFF] focus:ring-1 focus:ring-[#00CFFF] rounded-xl text-white placeholder-zinc-500 text-sm font-mono tracking-wider transition"
                  autoFocus
                />
                {isCheckingDni && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-[#00CFFF] font-bold animate-pulse">
                    Verificando...
                  </span>
                )}
              </div>
            </div>

            {/* Attempts Status Banner if DNI entered */}
            {attemptsStatus && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  attemptsStatus.canPlay
                    ? 'bg-[#00CFFF]/10 border-[#00CFFF]/40 text-[#00CFFF]'
                    : 'bg-red-950/40 border-red-500/50 text-red-200'
                }`}
              >
                {attemptsStatus.canPlay ? (
                  <CheckCircle size={18} className="text-[#00CFFF] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-heading text-sm tracking-wide font-bold">
                    {attemptsStatus.remainingText}
                  </div>
                  {existingParticipant && existingParticipant.bestScore > 0 && (
                    <div className="text-xs text-[#FFE600] font-bold mt-0.5 flex items-center gap-1.5">
                      <Trophy size={13} />
                      <span>TU MEJOR PUNTAJE ES: {existingParticipant.bestScore} PTS</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Nombre y Apellido <span className="text-[#FFE600]">*</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Marcos Albornoz"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-[#080810] border border-zinc-700 focus:border-[#B026FF] focus:ring-1 focus:ring-[#B026FF] rounded-xl text-white placeholder-zinc-500 text-sm font-medium transition"
                />
              </div>
            </div>

            {/* Nickname (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex justify-between">
                <span>Apodo en el Gimnasio (Opcional)</span>
                <span className="text-zinc-500 font-normal lowercase text-[11px]">opcional</span>
              </label>
              <div className="relative">
                <Dumbbell size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Ej: El Toro / La Bestia"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#080810] border border-zinc-700 focus:border-[#B026FF] focus:ring-1 focus:ring-[#B026FF] rounded-xl text-white placeholder-zinc-500 text-sm font-medium transition"
                />
              </div>

              {/* Quick suggestions */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-zinc-400 flex items-center gap-1 mr-1">
                  <Sparkles size={11} className="text-[#00CFFF]" /> Ideas:
                </span>
                {NICKNAME_IDEAS.map((idea) => (
                  <button
                    type="button"
                    key={idea}
                    onClick={() => {
                      sound.playClick();
                      setNickname(idea);
                    }}
                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-[#080810] border border-violet-500/30 text-zinc-300 hover:text-[#00CFFF] hover:border-[#00CFFF] transition"
                  >
                    {idea}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="pt-2">
              {isBlocked ? (
                <div className="space-y-2">
                  <div className="w-full py-3.5 px-6 bg-red-950/60 border border-red-500/40 text-red-300 font-heading text-lg rounded-2xl text-center font-bold uppercase tracking-wider">
                    PARTIDAS AGOTADAS
                  </div>
                  {onViewLeaderboard && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewLeaderboard();
                      }}
                      className="w-full py-2.5 bg-[#080810] border border-[#00CFFF]/40 text-[#00CFFF] text-xs font-bold rounded-xl transition hover:bg-[#12121e]"
                    >
                      Ver Tabla de Clasificación General
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 btn-electric-violet font-heading text-xl sm:text-2xl rounded-2xl flex items-center justify-center gap-2 cursor-pointer font-black tracking-wider disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'VERIFICANDO...' : '¡ENTRAR AL DESAFÍO!'}</span>
                  <ChevronRight size={24} className="stroke-[3]" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
