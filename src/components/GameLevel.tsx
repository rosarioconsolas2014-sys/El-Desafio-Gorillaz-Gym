import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ScoreBoard } from './ScoreBoard';
import { QuestionCard } from './QuestionCard';
import { MemoryChallenge } from './MemoryChallenge';
import { CountdownOverlay } from './CountdownOverlay';
import { LEVEL_1_QUESTIONS, LEVEL_2_CHALLENGES, LEVEL_3_QUESTIONS } from '../data/gameData';
import { Question } from '../types';
import { sound } from '../utils/soundEffects';

interface GameLevelProps {
  playerName: string;
  playerNickname?: string;
  onQuit: () => void;
  onGameComplete: (result: {
    level1Score: number;
    level2Score: number;
    level3Score: number;
    speedBonus: number;
    streakBonus: number;
    totalScore: number;
    totalTimeSeconds: number;
  }) => void;
}

export const GameLevel: React.FC<GameLevelProps> = ({
  playerName,
  playerNickname,
  onQuit,
  onGameComplete,
}) => {
  // Current Level: 1 | 2 | 3
  const [levelNumber, setLevelNumber] = useState<1 | 2 | 3>(1);
  const [showCountdown, setShowCountdown] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Scores
  const [level1Score, setLevel1Score] = useState<number>(0);
  const [level2Score, setLevel2Score] = useState<number>(0);
  const [level3Score, setLevel3Score] = useState<number>(0);
  const [speedBonus, setSpeedBonus] = useState<number>(0);
  const [streakBonus, setStreakBonus] = useState<number>(0);
  
  // Track consecutive correct in Level 3 for flawless streak bonus (+30 pts)
  const [level3Streak, setLevel3Streak] = useState<number>(0);

  // Global game timer in seconds
  const [totalTimeSeconds, setTotalTimeSeconds] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pick randomized questions
  const l1Questions = useMemo<Question[]>(() => {
    return [...LEVEL_1_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
  }, []);

  const l2Challenges = useMemo(() => {
    return LEVEL_2_CHALLENGES.slice(0, 5);
  }, []);

  const l3Questions = useMemo<Question[]>(() => {
    return [...LEVEL_3_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
  }, []);

  // Total elapsed stopwatch
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTotalTimeSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentTotalScore = level1Score + level2Score + level3Score + speedBonus + streakBonus;

  // Level 1 Answer Handler (5 questions, 10 pts each)
  const handleL1Answer = (isCorrect: boolean, timeSpent: number) => {
    if (isCorrect) {
      setLevel1Score((prev) => prev + 10);
    }

    if (currentIndex + 1 < l1Questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed Level 1! Advance to Level 2
      sound.playLevelUp();
      setLevelNumber(2);
      setCurrentIndex(0);
      setShowCountdown(true);
    }
  };

  // Level 2 Challenge Handler (5 challenges, 20 pts each + speed bonus)
  const handleL2ChallengeComplete = (isCorrect: boolean, pointsEarned: number, timeSpent: number) => {
    if (isCorrect) {
      const basePoints = 20;
      const extraSpeed = Math.max(0, pointsEarned - basePoints);
      setLevel2Score((prev) => prev + basePoints);
      if (extraSpeed > 0) {
        setSpeedBonus((prev) => prev + extraSpeed);
      }
    }

    if (currentIndex + 1 < l2Challenges.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed Level 2! Advance to Level 3 (THE BEAST MODE)
      sound.playLevelUp();
      setLevelNumber(3);
      setCurrentIndex(0);
      setShowCountdown(true);
    }
  };

  // Level 3 Answer Handler (5 questions, 30 pts each + perfect streak bonus)
  const handleL3Answer = (isCorrect: boolean, timeSpent: number) => {
    let nextStreak = level3Streak;
    if (isCorrect) {
      setLevel3Score((prev) => prev + 30);
      nextStreak = level3Streak + 1;
      setLevel3Streak(nextStreak);
    } else {
      setLevel3Streak(0);
      nextStreak = 0;
    }

    if (currentIndex + 1 < l3Questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Check for perfect streak bonus: all 5 correct = +30 bonus points
      let finalStreakBonus = 0;
      if (nextStreak === 5) {
        finalStreakBonus = 30;
        setStreakBonus(30);
      }

      // Completed the entire championship!
      if (timerRef.current) clearInterval(timerRef.current);
      sound.playLevelUp();

      const finalL3Score = level3Score + (isCorrect ? 30 : 0);
      const finalTotal = level1Score + level2Score + finalL3Score + speedBonus + finalStreakBonus;

      onGameComplete({
        level1Score,
        level2Score,
        level3Score: finalL3Score,
        speedBonus,
        streakBonus: finalStreakBonus,
        totalScore: finalTotal,
        totalTimeSeconds,
      });
    }
  };

  const getLevelTitle = () => {
    if (levelNumber === 1) return 'FITNESS KNOWLEDGE';
    if (levelNumber === 2) return 'GORILLA POWER';
    return 'THE BEAST MODE';
  };

  const getCurrentLevelScore = () => {
    if (levelNumber === 1) return level1Score;
    if (levelNumber === 2) return level2Score + speedBonus;
    return level3Score + streakBonus;
  };

  return (
    <div className="min-h-screen bg-[#080810] flex flex-col">
      {/* 3-2-1 Countdown before each level starts */}
      {showCountdown && (
        <CountdownOverlay
          levelNumber={levelNumber}
          levelName={getLevelTitle()}
          onComplete={() => setShowCountdown(false)}
        />
      )}

      {/* Top HUD */}
      <ScoreBoard
        levelNumber={levelNumber}
        levelTitle={getLevelTitle()}
        currentIndex={currentIndex}
        totalCount={5}
        totalScore={currentTotalScore}
        levelScore={getCurrentLevelScore()}
        playerName={playerName}
        playerNickname={playerNickname}
        onQuit={onQuit}
      />

      {/* Active Level Content */}
      <div className="flex-1 flex items-center justify-center py-6">
        {/* Level 1: Fitness Knowledge */}
        {levelNumber === 1 && !showCountdown && (
          <QuestionCard
            key={l1Questions[currentIndex].id}
            question={l1Questions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={5}
            pointsPerCorrect={10}
            onAnswer={handleL1Answer}
          />
        )}

        {/* Level 2: Gorilla Power */}
        {levelNumber === 2 && !showCountdown && (
          <MemoryChallenge
            key={l2Challenges[currentIndex].id}
            challenge={l2Challenges[currentIndex]}
            challengeNumber={currentIndex + 1}
            totalChallenges={5}
            onComplete={handleL2ChallengeComplete}
          />
        )}

        {/* Level 3: The Beast Mode */}
        {levelNumber === 3 && !showCountdown && (
          <QuestionCard
            key={l3Questions[currentIndex].id}
            question={l3Questions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={5}
            pointsPerCorrect={30}
            onAnswer={handleL3Answer}
          />
        )}
      </div>
    </div>
  );
};
