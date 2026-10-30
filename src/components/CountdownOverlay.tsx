import React, { useEffect, useState } from 'react';
import { sound } from '../utils/soundEffects';
import { GorillaOfficialLogo } from './GorillaIllustrations';

interface CountdownOverlayProps {
  levelNumber: 1 | 2 | 3;
  levelName: string;
  onComplete: () => void;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  levelNumber,
  levelName,
  onComplete,
}) => {
  const [count, setCount] = useState<number>(3);
  const [roared, setRoared] = useState<boolean>(false);

  useEffect(() => {
    sound.playTick();
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          if (!roared) {
            sound.playBeastRoar();
            setRoared(true);
          }
          setTimeout(() => {
            onComplete();
          }, 850);
          return 0; // "¡A ENTRENAR!"
        }
        sound.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete, roared]);

  const getAccentColor = () => {
    if (levelNumber === 1) return 'text-[#00CFFF] text-glow-cyan';
    if (levelNumber === 2) return 'text-[#B026FF] text-glow-violet';
    return 'text-[#FFE600] text-glow-yellow';
  };

  const getLogoGlow = () => {
    if (levelNumber === 1) return 'cyan' as const;
    if (levelNumber === 2) return 'violet' as const;
    return 'yellow' as const;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080810]/95 backdrop-blur-xl select-none">
      <div className="text-center px-4 max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#B026FF] to-[#00CFFF] rounded-full blur-xl opacity-60 animate-pulse" />
            <GorillaOfficialLogo size={100} glow={getLogoGlow()} />
          </div>
        </div>

        <span className={`font-extrabold tracking-[0.3em] text-sm uppercase block mb-1 ${getAccentColor()}`}>
          PREPARATE PARA EL NIVEL {levelNumber}
        </span>
        <h2 className="text-3xl sm:text-5xl font-heading text-white uppercase tracking-wider mb-6">
          {levelName}
        </h2>

        {/* Number Countdown in Neon Yellow */}
        <div className="h-36 flex items-center justify-center">
          {count > 0 ? (
            <div
              key={count}
              className="text-8xl sm:text-9xl font-heading text-[#FFE600] font-black text-glow-yellow animate-scaleIn drop-shadow-[0_0_35px_rgba(255,230,0,0.85)]"
            >
              {count}
            </div>
          ) : (
            <div className="text-5xl sm:text-6xl font-heading text-white font-black tracking-wider animate-bounce drop-shadow-[0_0_40px_rgba(176,38,255,0.9)]">
              ¡DALE GORILLA!
            </div>
          )}
        </div>

        <p className="text-xs text-zinc-400 mt-6 uppercase tracking-widest font-semibold">
          {levelNumber === 1 && 'Demostrá tus conocimientos básicos del gym'}
          {levelNumber === 2 && 'Velocidad, memoria y reflejos musculares'}
          {levelNumber === 3 && 'Desafío máximo para los verdaderos monstruos'}
        </p>
      </div>
    </div>
  );
};
