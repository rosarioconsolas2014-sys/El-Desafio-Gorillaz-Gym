import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle2, XCircle, ArrowRight, Flame } from 'lucide-react';
import { Question } from '../types';
import { sound } from '../utils/soundEffects';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  pointsPerCorrect: number;
  onAnswer: (isCorrect: boolean, timeSpentSeconds: number) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  pointsPerCorrect,
  onAnswer,
}) => {
  const isLevel3 = pointsPerCorrect === 30; // Level 1 is 10 pts, Level 3 is 30 pts
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoNextTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when question changes
  useEffect(() => {
    setTimeLeft(15);
    setSelectedOption(null);
    setHasAnswered(false);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          handleTimeout();
          return 0;
        }
        if (prev <= 4) {
          sound.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    };
  }, [question.id]);

  const handleTimeout = () => {
    if (hasAnswered) return;
    setHasAnswered(true);
    sound.playWrong();

    autoNextTimerRef.current = setTimeout(() => {
      onAnswer(false, 15);
    }, 2800);
  };

  const handleSelectOption = (index: number) => {
    if (hasAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(index);
    setHasAnswered(true);

    const isCorrect = index === question.correctIndex;
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }

    autoNextTimerRef.current = setTimeout(() => {
      onAnswer(isCorrect, timeSpent);
    }, 2500);
  };

  const handleManualNext = () => {
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    const isCorrect = selectedOption === question.correctIndex;
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    onAnswer(isCorrect, timeSpent);
  };

  const progressPercent = (timeLeft / 15) * 100;
  const isUrgent = timeLeft <= 5;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      {/* Top Timer & Progress Bar with Violet/Blue Gradient */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
          <span className="text-zinc-400">
            Pregunta {questionNumber} de {totalQuestions}
          </span>
          <div className="flex items-center gap-1.5 font-mono">
            <Clock size={15} className={isUrgent ? 'text-red-400 animate-spin' : isLevel3 ? 'text-[#FFE600]' : 'text-[#00CFFF]'} />
            <span className={isUrgent ? 'text-red-400 font-black text-sm' : 'text-zinc-200'}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Dynamic Timer Bar with Violet & Blue Gradient */}
        <div className="w-full h-3 bg-[#171722] rounded-full overflow-hidden p-0.5 border border-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              isUrgent
                ? 'bg-red-500 shadow-[0_0_12px_#ef4444]'
                : isLevel3
                ? 'bg-gradient-to-r from-[#B026FF] to-[#FFE600] shadow-[0_0_15px_rgba(255,230,0,0.5)]'
                : 'bg-gradient-to-r from-[#8B35FF] to-[#00CFFF] shadow-[0_0_15px_rgba(0,207,255,0.5)]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card in Gaming Dark Style */}
      <div className={`bg-[#171722] border-2 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ${
        isLevel3 ? 'border-yellow-400/40 shadow-[0_0_30px_rgba(255,230,0,0.15)]' : 'border-[#00CFFF]/40 shadow-[0_0_30px_rgba(0,207,255,0.15)]'
      }`}>
        {/* Floating points indicator in Neon Yellow */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#080810] border border-violet-500/40 text-[#FFE600] text-xs font-black uppercase tracking-wider shadow-[0_0_10px_rgba(255,230,0,0.3)]">
            <Flame size={14} className="text-[#FFE600]" /> +{pointsPerCorrect} PTS
          </span>
        </div>

        {/* Question text */}
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 pr-16 leading-relaxed">
          {question.question}
        </h3>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-1 gap-3.5 mb-6">
          {question.options.map((option, index) => {
            const letter = OPTION_LETTERS[index];
            const isSelected = selectedOption === index;
            const isCorrect = index === question.correctIndex;

            let buttonStyle = 'bg-[#080810]/80 hover:bg-[#20202e] border-zinc-800 text-zinc-200 hover:border-[#8B35FF]/60';
            let letterStyle = 'bg-[#171722] text-zinc-300';

            if (hasAnswered) {
              if (isCorrect) {
                buttonStyle = 'bg-[#8B35FF]/20 border-[#00CFFF] text-white shadow-[0_0_20px_rgba(0,207,255,0.5)] ring-2 ring-[#00CFFF]';
                letterStyle = 'bg-[#00CFFF] text-[#080810] font-black shadow-[0_0_8px_#00CFFF]';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)]';
                letterStyle = 'bg-red-500 text-white font-black';
              } else {
                buttonStyle = 'bg-[#080810]/40 border-zinc-900 text-zinc-500 opacity-50';
              }
            }

            return (
              <button
                key={index}
                disabled={hasAnswered}
                onClick={() => handleSelectOption(index)}
                className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between text-left group cursor-pointer ${buttonStyle}`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-8 h-8 rounded-lg font-heading text-sm flex items-center justify-center shrink-0 transition-colors ${letterStyle}`}>
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base font-semibold">
                    {option}
                  </span>
                </div>

                {hasAnswered && (
                  <div>
                    {isCorrect && (
                      <CheckCircle2 size={22} className="text-[#00CFFF] shrink-0 animate-scaleIn drop-shadow-[0_0_6px_#00CFFF]" />
                    )}
                    {isSelected && !isCorrect && (
                      <XCircle size={22} className="text-red-400 shrink-0 animate-scaleIn" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Explanation Card */}
        {hasAnswered && (
          <div className="mt-4 p-4 rounded-xl bg-[#080810] border border-violet-500/40 animate-fadeIn flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {selectedOption === question.correctIndex ? (
                <div className="p-2 rounded-lg bg-[#00CFFF]/20 text-[#00CFFF] shrink-0 shadow-[0_0_10px_rgba(0,207,255,0.4)]">
                  <CheckCircle2 size={20} />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-red-400/20 text-red-400 shrink-0">
                  <XCircle size={20} />
                </div>
              )}
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white">
                  {selectedOption === question.correctIndex ? (
                    <span className="text-[#00CFFF] text-glow-cyan">¡CORRECTO! +{pointsPerCorrect} PUNTOS</span>
                  ) : (
                    <span className="text-red-400">INCORRECTO O TIEMPO AGOTADO (0 PTS)</span>
                  )}
                </p>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </div>

            <button
              onClick={handleManualNext}
              className="px-5 py-2.5 bg-gradient-to-r from-[#8B35FF] to-[#B026FF] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer ml-auto shadow-[0_0_15px_rgba(176,38,255,0.4)]"
            >
              <span>Avanzar</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
