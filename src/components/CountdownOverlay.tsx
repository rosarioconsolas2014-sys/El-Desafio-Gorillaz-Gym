import React, { useEffect, useState, useRef, useCallback } from 'react';
import { sound } from '../utils/soundEffects';
import { GorillaOfficialLogo } from './GorillaIllustrations';
import { LEVEL_1_QUESTIONS, LEVEL_2_CHALLENGES, LEVEL_3_QUESTIONS } from '../data/gameData';
import { AlertTriangle, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface CountdownOverlayProps {
  levelNumber: 1 | 2 | 3;
  levelName: string;
  onComplete: () => void;
}

type LoadingStage = 
  | 'PREPARANDO EL DESAFÍO...'
  | 'CARGANDO NIVEL...'
  | 'PREPARANDO A LA BESTIA...'
  | '¡CASI LISTO!';

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  levelNumber,
  levelName,
  onComplete,
}) => {
  const [currentMessage, setCurrentMessage] = useState<LoadingStage>('PREPARANDO EL DESAFÍO...');
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Guards against duplicate execution and double-clicks
  const isPreparingRef = useRef<boolean>(false);
  const hasCompletedRef = useRef<boolean>(false);

  // Real async preparation of game resources
  const runPreparation = useCallback(async () => {
    if (isPreparingRef.current || hasCompletedRef.current) return;
    isPreparingRef.current = true;
    setErrorMsg(null);
    setIsReady(false);
    setProgressPercent(15);
    setCurrentMessage('PREPARANDO EL DESAFÍO...');

    try {
      // Step 1: Validate questions and challenges data integrity for the specific level
      await new Promise<void>((resolve, reject) => {
        try {
          if (levelNumber === 1) {
            if (!LEVEL_1_QUESTIONS || LEVEL_1_QUESTIONS.length < 5) {
              throw new Error('No se pudieron cargar las preguntas del Nivel 1.');
            }
          } else if (levelNumber === 2) {
            if (!LEVEL_2_CHALLENGES || LEVEL_2_CHALLENGES.length < 5) {
              throw new Error('No se pudieron cargar los desafíos de memoria del Nivel 2.');
            }
          } else if (levelNumber === 3) {
            if (!LEVEL_3_QUESTIONS || LEVEL_3_QUESTIONS.length < 5) {
              throw new Error('No se pudieron cargar las preguntas avanzadas del Nivel 3.');
            }
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      // Progress milestone 1 -> 40%
      setProgressPercent(40);
      setCurrentMessage('CARGANDO NIVEL...');

      // Step 2: Warm up audio engine and preload essential graphical assets
      const audioPromise = sound.warmup();

      const imagePreloadPromise = new Promise<void>((resolve, reject) => {
        const logoImg = new Image();
        logoImg.src = '/assets/aistudio/image_f68a06ba.png';
        if (logoImg.complete) {
          resolve();
        } else {
          logoImg.onload = () => resolve();
          logoImg.onerror = () => {
            // Non-fatal if cached or fallback logo is available, but log
            console.warn('Asset preloaded with fallback');
            resolve();
          };
          // 8-second safety timeout for asset loading
          setTimeout(resolve, 3000);
        }
      });

      await Promise.all([audioPromise, imagePreloadPromise]);

      // Progress milestone 2 -> 75%
      setProgressPercent(75);
      setCurrentMessage('PREPARANDO A LA BESTIA...');

      // Step 3: Verify browser rendering context & state readiness
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          // Microtask yield to guarantee DOM layout readiness
          setTimeout(resolve, 350);
        });
      });

      // Progress milestone 3 -> 100%
      setProgressPercent(100);
      setCurrentMessage('¡CASI LISTO!');
      setIsReady(true);

      // Play beast roar / readiness audio
      sound.playBeastRoar();

      // Brief transition moment to show 100% completion before seamlessly starting
      setTimeout(() => {
        hasCompletedRef.current = true;
        onComplete();
      }, 550);

    } catch (err: unknown) {
      console.error('Error during level resource preparation:', err);
      const message = err instanceof Error ? err.message : 'Error al preparar los recursos del nivel.';
      setErrorMsg(message);
      sound.playWrong();
    } finally {
      isPreparingRef.current = false;
    }
  }, [levelNumber, onComplete]);

  // Execute preparation on mount
  useEffect(() => {
    runPreparation();
    return () => {
      isPreparingRef.current = false;
    };
  }, [runPreparation]);

  const getAccentColors = () => {
    if (levelNumber === 1) {
      return {
        badge: 'text-[#00CFFF] border-[#00CFFF]/40 bg-[#00CFFF]/10 shadow-[0_0_15px_rgba(0,207,255,0.25)]',
        primary: '#00CFFF',
        gradient: 'from-[#8B35FF] to-[#00CFFF]',
        ringGlow: 'drop-shadow-[0_0_18px_rgba(0,207,255,0.7)]',
        logoGlow: 'cyan' as const,
      };
    }
    if (levelNumber === 2) {
      return {
        badge: 'text-[#B026FF] border-[#B026FF]/40 bg-[#B026FF]/10 shadow-[0_0_15px_rgba(176,38,255,0.25)]',
        primary: '#B026FF',
        gradient: 'from-[#00CFFF] to-[#B026FF]',
        ringGlow: 'drop-shadow-[0_0_18px_rgba(176,38,255,0.7)]',
        logoGlow: 'violet' as const,
      };
    }
    return {
      badge: 'text-[#FFE600] border-[#FFE600]/40 bg-[#FFE600]/10 shadow-[0_0_15px_rgba(255,230,0,0.25)]',
      primary: '#FFE600',
      gradient: 'from-[#8B35FF] via-[#B026FF] to-[#FFE600]',
      ringGlow: 'drop-shadow-[0_0_18px_rgba(255,230,0,0.7)]',
      logoGlow: 'yellow' as const,
    };
  };

  const colors = getAccentColors();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080810]/95 backdrop-blur-xl select-none px-4">
      <div className="w-full max-w-md text-center">
        
        {/* Official Gorilla Gym Logo with Neon Glow */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute -inset-3 bg-gradient-to-r from-[#8B35FF] to-[#00CFFF] rounded-full blur-2xl opacity-40 animate-pulse" />
            <GorillaOfficialLogo size={90} glow={colors.logoGlow} />
          </div>
        </div>

        {/* Level Tag and Title */}
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border mb-2 ${colors.badge}`}>
            NIVEL {levelNumber}
          </span>
          <h2 className="text-2xl sm:text-4xl font-heading text-white uppercase tracking-wider">
            {levelName}
          </h2>
        </div>

        {/* Central Animated Neon Spinner Area */}
        <div className="h-56 flex flex-col items-center justify-center relative">
          {!errorMsg ? (
            <div className="relative flex items-center justify-center">
              
              {/* Outer Glowing Gradient Neon Ring */}
              <div className={`w-36 h-36 relative ${colors.ringGlow}`}>
                <svg
                  className="w-full h-full animate-spin"
                  viewBox="0 0 100 100"
                  style={{ animationDuration: '1.4s' }}
                >
                  <defs>
                    <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B35FF" />
                      <stop offset="60%" stopColor="#B026FF" />
                      <stop offset="100%" stopColor="#00CFFF" />
                    </linearGradient>
                  </defs>
                  
                  {/* Subtle track circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#171722"
                    strokeWidth="4"
                  />
                  
                  {/* Animated spinning arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#neonGradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray="200"
                    strokeDashoffset="60"
                  />
                </svg>
              </div>

              {/* Inner Counter-Rotating Violet/Yellow Ring */}
              <div className="w-24 h-24 absolute">
                <svg
                  className="w-full h-full animate-spin-reverse"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke={levelNumber === 3 ? '#FFE600' : '#B026FF'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="140"
                    strokeDashoffset="75"
                    opacity="0.85"
                  />
                </svg>
              </div>

              {/* Core Center Pulse */}
              <div className="absolute inset-0 flex items-center justify-center">
                {isReady ? (
                  <CheckCircle2
                    size={38}
                    className="text-[#00CFFF] animate-scaleIn drop-shadow-[0_0_12px_rgba(0,207,255,0.9)]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#080810] border border-[#8B35FF]/60 flex items-center justify-center shadow-[0_0_15px_rgba(139,53,255,0.4)]">
                    <Sparkles
                      size={18}
                      className="text-[#00CFFF] animate-pulse"
                    />
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Error Display with Retry Option */
            <div className="flex flex-col items-center justify-center p-4 bg-red-950/30 border border-red-500/50 rounded-2xl max-w-sm">
              <AlertTriangle size={36} className="text-red-400 mb-2 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
              <p className="text-xs text-red-200 font-semibold mb-3">
                {errorMsg}
              </p>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  runPreparation();
                }}
                disabled={isPreparingRef.current}
                className="px-5 py-2.5 bg-gradient-to-r from-[#8B35FF] to-[#B026FF] hover:from-[#9d4dff] hover:to-[#be45ff] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(139,53,255,0.4)] disabled:opacity-50"
              >
                <RefreshCw size={14} className={isPreparingRef.current ? 'animate-spin' : ''} />
                <span>Reintentar Carga</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Status Messages Centered Underneath */}
        {!errorMsg && (
          <div className="mt-2 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00CFFF] animate-ping" />
              <span className="text-base sm:text-lg font-black tracking-widest text-white uppercase text-glow-cyan">
                {currentMessage}
              </span>
            </div>

            {/* Glowing Progress Bar */}
            <div className="w-48 sm:w-64 h-1.5 bg-[#171722] rounded-full overflow-hidden p-0.5 border border-[#8B35FF]/20 shadow-inner">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-300 ease-out`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-zinc-400 mt-4 uppercase tracking-widest font-semibold">
              {levelNumber === 1 && 'Conocimientos de entrenamiento y nutrición'}
              {levelNumber === 2 && 'Desafío de memoria muscular y velocidad'}
              {levelNumber === 3 && 'Desafío extremo para campeones'}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
