import React from 'react';
import { X, CheckCircle, Award } from 'lucide-react';
import { ProteinTub3D, GorillaOfficialLogo } from './GorillaIllustrations';
import { sound } from '../utils/soundEffects';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame?: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, onStartGame }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#171722] border-2 border-[#8B35FF]/60 rounded-3xl shadow-[0_0_50px_rgba(139,53,255,0.35)] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#080810] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <GorillaOfficialLogo size={42} glow="violet" />
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#00CFFF]">
                Reglamento Oficial
              </span>
              <h2 className="text-2xl font-heading text-white">
                THE CHAMPION CHALLENGE
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

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-300">
          {/* Prize Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gradient-to-r from-[#8B35FF]/20 via-[#171722] to-[#171722] border border-violet-500/50 rounded-2xl shadow-[0_0_20px_rgba(139,53,255,0.2)]">
            <ProteinTub3D size={64} className="shrink-0" />
            <div className="text-center sm:text-left">
              <span className="text-xs uppercase font-extrabold text-[#FFE600] tracking-wider">
                Premio Mayor
              </span>
              <h3 className="text-lg font-bold text-white">
                UNA PROTEÍNA WHEY 100% PARA EL CAMPEÓN
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                El participante que lidere el puesto #1 al cierre del torneo se consagrará campeón y retirará su suplemento en la recepción.
              </p>
            </div>
          </div>

          {/* Level Rules */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
              Estructura de la Competencia (3 Niveles Obligatorios)
            </h4>

            {/* Level 1: Cyan */}
            <div className="p-4 bg-[#080810] border border-[#00CFFF]/40 rounded-2xl flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-xl bg-[#00CFFF]/20 text-[#00CFFF] font-black flex items-center justify-center shrink-0 text-sm border border-[#00CFFF]/40">
                1
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h5 className="font-bold text-white">NIVEL 1: FITNESS KNOWLEDGE (Fácil)</h5>
                  <span className="text-xs font-extrabold text-[#FFE600] bg-[#171722] px-2.5 py-0.5 rounded-full border border-yellow-400/30">
                    50 PUNTOS MÁX
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  5 preguntas sobre anatomía básica, ejercicios y nutrición. 10 puntos por acierto con 15 segundos por pregunta.
                </p>
              </div>
            </div>

            {/* Level 2: Violet */}
            <div className="p-4 bg-[#080810] border border-[#B026FF]/40 rounded-2xl flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-xl bg-[#B026FF]/20 text-[#B026FF] font-black flex items-center justify-center shrink-0 text-sm border border-[#B026FF]/40">
                2
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h5 className="font-bold text-white">NIVEL 2: GORILLA POWER (Media)</h5>
                  <span className="text-xs font-extrabold text-[#FFE600] bg-[#171722] px-2.5 py-0.5 rounded-full border border-yellow-400/30">
                    100 PUNTOS + BONUS
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  5 desafíos de memoria rápida, reconocimiento de fierros y secuencias de fuerza. 20 puntos por desafío más bonificación por velocidad de respuesta.
                </p>
              </div>
            </div>

            {/* Level 3: Yellow & Violet */}
            <div className="p-4 bg-[#080810] border border-[#FFE600]/40 rounded-2xl flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-xl bg-[#FFE600]/20 text-[#FFE600] font-black flex items-center justify-center shrink-0 text-sm border border-[#FFE600]/40">
                3
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <h5 className="font-bold text-white">NIVEL 3: THE BEAST MODE (Difícil)</h5>
                  <span className="text-xs font-extrabold text-[#FFE600] bg-[#171722] px-2.5 py-0.5 rounded-full border border-yellow-400/30">
                    150 PUNTOS + BONUS
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Preguntas avanzadas de biomecánica, síntesis muscular y técnicas de intensidad (Drop sets, RIR, sobrecarga). 30 puntos por acierto más bonificación especial de racha sin fallos.
                </p>
              </div>
            </div>
          </div>

          {/* Key Guidelines */}
          <div className="p-4 bg-[#080810] border border-zinc-800 rounded-2xl space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <CheckCircle size={15} className="text-[#00CFFF]" />
              Criterio de Victoria y Desempate
            </h4>
            <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
              <li>El puntaje es acumulativo a lo largo de los tres niveles consecutivos.</li>
              <li>En caso de empate en puntos, se posiciona arriba el participante con menor tiempo total registrado.</li>
              <li>Podes jugar tantas veces como quieras para superar tu récord personal. En la tabla principal quedará grabado tu mejor intento.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#080810] border-t border-zinc-800 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-[#171722] rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
          {onStartGame && (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
                onStartGame();
              }}
              className="px-6 py-2.5 btn-electric-violet font-extrabold text-sm uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              ¡Jugar Ahora!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
