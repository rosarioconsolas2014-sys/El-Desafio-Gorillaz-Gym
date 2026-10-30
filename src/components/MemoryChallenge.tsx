import React, { useState, useEffect, useRef } from 'react';
import { Clock, Zap, CheckCircle2, XCircle, ArrowRight, Disc } from 'lucide-react';
import { Level2ChallengeItem } from '../data/gameData';
import { sound } from '../utils/soundEffects';

interface MemoryChallengeProps {
  challenge: Level2ChallengeItem;
  challengeNumber: number;
  totalChallenges: number;
  onComplete: (isCorrect: boolean, pointsEarned: number, timeSpentSeconds: number) => void;
}

interface MemoryCardState {
  id: number;
  key: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryChallenge: React.FC<MemoryChallengeProps> = ({
  challenge,
  challengeNumber,
  totalChallenges,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [hasFinished, setHasFinished] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; points: number; text: string } | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // State for Challenge 3 (Memory Flip Grid)
  const [memoryCards, setMemoryCards] = useState<MemoryCardState[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  // State for Challenge 4 (Speed Sequence Combo)
  const [comboStep, setComboStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Setup challenge on mount or change
  useEffect(() => {
    setTimeLeft(20);
    setHasFinished(false);
    setFeedback(null);
    setComboStep(1);
    setCompletedSteps([]);
    startTimeRef.current = Date.now();

    // If memory flip challenge
    if (challenge.type === 'memory_flip') {
      const pairs = (challenge.data as { pairs: { key: string; name: string }[] }).pairs;
      const cards: MemoryCardState[] = [];
      let idCounter = 1;
      pairs.forEach((p) => {
        // Two of each
        cards.push({ id: idCounter++, key: p.key, name: p.name, isFlipped: false, isMatched: false });
        cards.push({ id: idCounter++, key: p.key, name: p.name, isFlipped: false, isMatched: false });
      });
      // Shuffle
      cards.sort(() => Math.random() - 0.5);
      setMemoryCards(cards);
      setFlippedCards([]);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          handleTimeOut();
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
    };
  }, [challenge.id]);

  const handleTimeOut = () => {
    if (hasFinished) return;
    setHasFinished(true);
    sound.playWrong();
    setFeedback({
      isCorrect: false,
      points: 0,
      text: '¡Tiempo agotado! La velocidad es clave en el nivel Gorilla Power.',
    });
  };

  const finishChallenge = (isCorrect: boolean, basePoints: number = 20) => {
    if (hasFinished) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setHasFinished(true);

    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    // Speed bonus: up to 5 extra points if finished fast
    const speedBonus = isCorrect && timeLeft > 5 ? Math.min(5, Math.floor(timeLeft / 3)) : 0;
    const totalEarned = isCorrect ? basePoints + speedBonus : 0;

    if (isCorrect) {
      sound.playCorrect();
      setFeedback({
        isCorrect: true,
        points: totalEarned,
        text: `¡Excelente reflejo! Ganaste ${basePoints} pts base ${speedBonus > 0 ? `+ ${speedBonus} pts de bonificación por rapidez` : ''}.`,
      });
    } else {
      sound.playWrong();
      setFeedback({
        isCorrect: false,
        points: 0,
        text: 'Respuesta incorrecta. ¡Concéntrate en la técnica!',
      });
    }
  };

  const handleNext = () => {
    const isCorrect = feedback ? feedback.isCorrect : false;
    const points = feedback ? feedback.points : 0;
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    onComplete(isCorrect, points, timeSpent);
  };

  // Memory card click handler (Challenge 3)
  const handleCardClick = (cardIndex: number) => {
    if (hasFinished) return;
    if (flippedCards.length >= 2) return;
    const card = memoryCards[cardIndex];
    if (card.isFlipped || card.isMatched) return;

    sound.playClick();
    const newCards = [...memoryCards];
    newCards[cardIndex].isFlipped = true;
    setMemoryCards(newCards);

    const newFlipped = [...flippedCards, cardIndex];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const firstCard = newCards[newFlipped[0]];
      const secondCard = newCards[newFlipped[1]];

      if (firstCard.key === secondCard.key) {
        // Match!
        setTimeout(() => {
          sound.playCorrect();
          const matchedCards = newCards.map((c, i) =>
            i === newFlipped[0] || i === newFlipped[1] ? { ...c, isMatched: true } : c
          );
          setMemoryCards(matchedCards);
          setFlippedCards([]);

          // Check if all matched
          const allDone = matchedCards.every((c) => c.isMatched);
          if (allDone) {
            finishChallenge(true, 20);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          sound.playWrong();
          const resetCards = newCards.map((c, i) =>
            i === newFlipped[0] || i === newFlipped[1] ? { ...c, isFlipped: false } : c
          );
          setMemoryCards(resetCards);
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  // Speed Combo click handler (Challenge 4)
  const handleComboStepClick = (stepNumber: number) => {
    if (hasFinished) return;
    if (completedSteps.includes(stepNumber)) return;

    if (stepNumber === comboStep) {
      sound.playClick();
      const nextStep = comboStep + 1;
      setCompletedSteps([...completedSteps, stepNumber]);
      setComboStep(nextStep);

      if (nextStep > 4) {
        // Completed all 4 steps in order!
        finishChallenge(true, 20);
      }
    } else {
      // Wrong sequence
      sound.playWrong();
      finishChallenge(false, 0);
    }
  };

  const progressPercent = (timeLeft / 20) * 100;
  const isUrgent = timeLeft <= 5;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      {/* Top Timer & Gradient Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2">
          <span className="text-zinc-400">
            Desafío {challengeNumber} de {totalChallenges} • {challenge.badge}
          </span>
          <div className="flex items-center gap-1.5 font-mono">
            <Clock size={15} className={isUrgent ? 'text-red-400 animate-spin' : 'text-[#B026FF]'} />
            <span className={isUrgent ? 'text-red-400 font-black text-sm' : 'text-zinc-200'}>
              {timeLeft}s
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-[#171722] rounded-full overflow-hidden p-0.5 border border-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              isUrgent
                ? 'bg-red-500 shadow-[0_0_12px_#ef4444]'
                : 'bg-gradient-to-r from-[#8B35FF] to-[#00CFFF] shadow-[0_0_15px_rgba(176,38,255,0.6)]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Challenge Card in Violet Gaming Aesthetics */}
      <div className="bg-[#171722] border-2 border-[#B026FF]/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_35px_rgba(176,38,255,0.18)] relative overflow-hidden">
        {/* Floating badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#B026FF]/15 border border-[#B026FF]/40 text-[#B026FF] text-xs font-black uppercase tracking-wider text-glow-violet">
            <Zap size={14} /> {challenge.title}
          </span>
          <span className="text-xs font-bold text-[#FFE600] text-glow-yellow">
            20 PTS + BONUS VELOCIDAD
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-relaxed">
          {challenge.instruction}
        </h3>

        {/* 1. Muscle Match & Equipment & Antagonist Types */}
        {(challenge.type === 'muscle_match' || challenge.type === 'equipment_id' || challenge.type === 'antagonist_match') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
            {((challenge.data as { options: { label: string; correct: boolean; hint?: string }[] }).options).map((opt, idx) => (
              <button
                key={idx}
                disabled={hasFinished}
                onClick={() => finishChallenge(opt.correct, 20)}
                className={`p-4 rounded-xl border-2 transition text-left cursor-pointer flex flex-col justify-between min-h-[90px] ${
                  hasFinished
                    ? opt.correct
                      ? 'bg-[#8B35FF]/20 border-[#00CFFF] text-white shadow-[0_0_20px_rgba(0,207,255,0.4)]'
                      : 'bg-[#080810]/40 border-zinc-900 text-zinc-500 opacity-50'
                    : 'bg-[#080810]/80 hover:bg-[#20202e] border-zinc-800 text-zinc-200 hover:border-[#B026FF]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded bg-[#171722] text-[#00CFFF] font-bold text-xs flex items-center justify-center border border-zinc-700">
                    {idx + 1}
                  </span>
                  {hasFinished && opt.correct && <CheckCircle2 size={18} className="text-[#00CFFF]" />}
                </div>
                <div>
                  <span className="text-sm font-bold block mt-2">{opt.label}</span>
                  {opt.hint && <span className="text-[11px] text-zinc-400 block mt-0.5">{opt.hint}</span>}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 2. Memory Flip Challenge (6 cards / 3 pairs) */}
        {challenge.type === 'memory_flip' && (
          <div className="mb-6">
            <p className="text-xs text-zinc-400 mb-3">Toca 2 cartas para encontrar las parejas idénticas de equipamiento:</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {memoryCards.map((card, idx) => {
                const showFace = card.isFlipped || card.isMatched;
                return (
                  <button
                    key={card.id}
                    disabled={hasFinished || card.isMatched}
                    onClick={() => handleCardClick(idx)}
                    className={`h-28 rounded-xl border-2 transition-all flex flex-col items-center justify-center p-2 text-center cursor-pointer select-none ${
                      card.isMatched
                        ? 'bg-[#8B35FF]/25 border-[#00CFFF] shadow-[0_0_18px_rgba(0,207,255,0.5)]'
                        : showFace
                        ? 'bg-[#B026FF]/25 border-[#B026FF] text-white shadow-[0_0_15px_rgba(176,38,255,0.4)]'
                        : 'bg-[#080810] hover:bg-[#20202e] border-zinc-800 text-zinc-500 hover:border-violet-500/50'
                    }`}
                  >
                    {showFace ? (
                      <div className="animate-scaleIn flex flex-col items-center">
                        <Disc size={28} className={card.isMatched ? 'text-[#00CFFF]' : 'text-[#FFE600]'} />
                        <span className="text-[10px] font-bold mt-2 leading-tight text-white">
                          {card.name}
                        </span>
                        {card.isMatched && (
                          <span className="text-[9px] font-extrabold text-[#00CFFF] uppercase mt-0.5">
                            PAR
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl">⚡</span>
                        <span className="text-[10px] font-bold text-[#B026FF] uppercase tracking-wider mt-1">
                          TAP
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Speed Combo Challenge (tap in exact order) */}
        {challenge.type === 'combo_speed' && (
          <div className="mb-6">
            <div className="p-3 bg-[#080810] rounded-xl border border-zinc-800 mb-4 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Paso actual requerido:</span>
              <span className="font-heading text-lg text-[#FFE600] font-bold text-glow-yellow">
                PASO {comboStep} de 4
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {((challenge.data as { steps: { step: number; label: string }[] }).steps)
                .slice()
                .sort((a, b) => (a.step % 2) - (b.step % 2) || b.step - a.step)
                .map((item) => {
                  const isDone = completedSteps.includes(item.step);
                  return (
                    <button
                      key={item.step}
                      disabled={hasFinished || isDone}
                      onClick={() => handleComboStepClick(item.step)}
                      className={`p-4 rounded-xl border-2 transition text-left cursor-pointer flex items-center justify-between ${
                        isDone
                          ? 'bg-[#8B35FF]/20 border-[#00CFFF] text-white shadow-[0_0_15px_rgba(0,207,255,0.3)]'
                          : 'bg-[#080810]/80 hover:bg-[#20202e] border-zinc-800 text-zinc-200 hover:border-[#B026FF]'
                      }`}
                    >
                      <span className="text-sm font-bold">{item.label}</span>
                      {isDone ? (
                        <CheckCircle2 size={20} className="text-[#00CFFF] shrink-0" />
                      ) : (
                        <span className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center text-xs text-zinc-400">
                          {item.step}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        {feedback && (
          <div className="p-4 rounded-xl bg-[#080810] border border-violet-500/40 animate-fadeIn flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {feedback.isCorrect ? (
                <div className="p-2 rounded-lg bg-[#00CFFF]/20 text-[#00CFFF] shrink-0">
                  <CheckCircle2 size={20} />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-red-400/20 text-red-400 shrink-0">
                  <XCircle size={20} />
                </div>
              )}
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-white">
                  {feedback.isCorrect ? (
                    <span className="text-[#00CFFF] text-glow-cyan">¡DESAFÍO SUPERADO! +{feedback.points} PTS</span>
                  ) : (
                    <span className="text-red-400">DESAFÍO FALLIDO (0 PTS)</span>
                  )}
                </p>
                <p className="text-xs text-zinc-300 mt-1">{feedback.text}</p>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-gradient-to-r from-[#8B35FF] to-[#B026FF] hover:brightness-110 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shrink-0 flex items-center gap-1.5 cursor-pointer ml-auto shadow-[0_0_15px_rgba(176,38,255,0.4)]"
            >
              <span>Siguiente</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
