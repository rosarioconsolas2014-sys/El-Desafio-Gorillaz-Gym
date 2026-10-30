import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { PlayerRegistration } from './components/PlayerRegistration';
import { GameLevel } from './components/GameLevel';
import { WinnerScreen } from './components/WinnerScreen';
import { Ranking } from './components/Ranking';
import { AdminPanel } from './components/AdminPanel';
import { RulesModal } from './components/RulesModal';
import { Participant, GameRecord, GameSettings } from './types';
import { subscribeToLiveRanking, PublicRankItem } from './services/rankingService';
import { getGameSettings, DEFAULT_SETTINGS } from './services/settingsService';
import { recordGameCompletion, getAllGames } from './services/gameService';

type Screen = 'home' | 'game' | 'winner' | 'ranking';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [leaderboard, setLeaderboard] = useState<PublicRankItem[]>([]);
  const [allGames, setAllGames] = useState<GameRecord[]>([]);
  const [adminConfig, setAdminConfig] = useState<GameSettings>(DEFAULT_SETTINGS);

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Active authenticated player session
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);

  // Recent game completion result
  const [lastGameResult, setLastGameResult] = useState<{
    game: GameRecord;
    rank: number;
  } | null>(null);

  // Load and subscribe to real-time rankings & settings from Firestore
  useEffect(() => {
    // 1. Fetch initial settings
    getGameSettings().then(setAdminConfig).catch(console.warn);

    // 2. Fetch all games for history tab
    getAllGames().then(setAllGames).catch(console.warn);

    // 3. Real-time ranking subscription
    const unsubscribe = subscribeToLiveRanking((updatedRanking) => {
      setLeaderboard(updatedRanking);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleRefreshData = () => {
    getGameSettings().then(setAdminConfig).catch(console.warn);
    getAllGames().then(setAllGames).catch(console.warn);
  };

  // Start game flow: open registration modal
  const handleInitiatePlay = () => {
    setIsRegisterOpen(true);
  };

  // Callback once registered with DNI and validated
  const handleRegisterAndStart = (participant: Participant) => {
    setCurrentParticipant(participant);
    setIsRegisterOpen(false);
    setCurrentScreen('game');
  };

  // Finished all 3 levels
  const handleGameComplete = async (result: {
    level1Score: number;
    level2Score: number;
    level3Score: number;
    speedBonus: number;
    streakBonus: number;
    totalScore: number;
    totalTimeSeconds: number;
  }) => {
    if (!currentParticipant) return;

    try {
      // Record completed match into Firestore games collection & update participant
      const { game, updatedParticipant } = await recordGameCompletion(
        {
          participantId: currentParticipant.id,
          dni: currentParticipant.dni,
          name: currentParticipant.name,
          nickname: currentParticipant.nickname,
          level1Score: result.level1Score,
          level2Score: result.level2Score,
          level3Score: result.level3Score,
          speedBonus: result.speedBonus,
          streakBonus: result.streakBonus,
          duration: result.totalTimeSeconds,
        },
        currentParticipant
      );

      setCurrentParticipant(updatedParticipant);

      // Find user rank
      const userRankItem = leaderboard.find(
        (item) => item.id === currentParticipant.id || item.name.toLowerCase() === currentParticipant.name.toLowerCase()
      );
      const calculatedRank = userRankItem ? userRankItem.rank : 1;

      setLastGameResult({
        game,
        rank: calculatedRank,
      });

      // Refresh games list
      getAllGames().then(setAllGames).catch(console.warn);

      setCurrentScreen('winner');
    } catch (error) {
      console.error('Error recording game result in Firestore:', error);
      // Fallback display
      setLastGameResult({
        game: {
          id: 'temp-' + Date.now(),
          participantId: currentParticipant.id,
          dni: currentParticipant.dni,
          name: currentParticipant.name,
          nickname: currentParticipant.nickname,
          totalScore: result.totalScore,
          level1Score: result.level1Score,
          level2Score: result.level2Score,
          level3Score: result.level3Score,
          speedBonus: result.speedBonus,
          streakBonus: result.streakBonus,
          duration: result.totalTimeSeconds,
          attemptNumber: (currentParticipant.attemptsUsed || 0) + 1,
          completedAt: new Date().toISOString(),
          status: 'completado'
        },
        rank: 1
      });
      setCurrentScreen('winner');
    }
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white flex flex-col font-sans selection:bg-[#B026FF] selection:text-white">
      {/* Universal Header */}
      {currentScreen !== 'game' && (
        <Header
          onOpenRanking={() => setCurrentScreen('ranking')}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onGoHome={() => setCurrentScreen('home')}
        />
      )}

      {/* Screen 1: Home Screen */}
      {currentScreen === 'home' && (
        <main className="flex-1">
          <Home
            onStartGame={handleInitiatePlay}
            onOpenRules={() => setIsRulesOpen(true)}
            onOpenRanking={() => setCurrentScreen('ranking')}
            topParticipants={leaderboard}
            adminConfig={adminConfig}
          />
        </main>
      )}

      {/* Screen 2: Game in Action (3 Levels) */}
      {currentScreen === 'game' && currentParticipant && (
        <GameLevel
          playerName={currentParticipant.name}
          playerNickname={currentParticipant.nickname}
          onQuit={() => setCurrentScreen('home')}
          onGameComplete={handleGameComplete}
        />
      )}

      {/* Screen 3: Winner Screen (Completion of all 3 levels) */}
      {currentScreen === 'winner' && lastGameResult && (
        <WinnerScreen
          fullName={lastGameResult.game.name}
          nickname={lastGameResult.game.nickname}
          level1Score={lastGameResult.game.level1Score}
          level2Score={lastGameResult.game.level2Score}
          level3Score={lastGameResult.game.level3Score}
          speedBonus={lastGameResult.game.speedBonus}
          streakBonus={lastGameResult.game.streakBonus}
          totalScore={lastGameResult.game.totalScore}
          totalTimeSeconds={lastGameResult.game.duration}
          rank={lastGameResult.rank}
          onPlayAgain={() => {
            setIsRegisterOpen(true);
            setCurrentScreen('home');
          }}
          onViewLeaderboard={() => {
            setCurrentScreen('ranking');
          }}
          onGoHome={() => {
            setCurrentScreen('home');
          }}
        />
      )}

      {/* Screen 4: Leaderboard & Competition Table */}
      {currentScreen === 'ranking' && (
        <main className="flex-1">
          <Ranking
            leaderboard={leaderboard}
            allGames={allGames}
            onStartGame={handleInitiatePlay}
            onBackToHome={() => setCurrentScreen('home')}
          />
        </main>
      )}

      {/* Global Modals */}
      <PlayerRegistration
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterAndStart={handleRegisterAndStart}
        lastPlayerName={currentParticipant?.name || ''}
        onViewLeaderboard={() => {
          setIsRegisterOpen(false);
          setCurrentScreen('ranking');
        }}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        onStartGame={handleInitiatePlay}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onDataChanged={handleRefreshData}
      />

      {/* Footer with Developer Credits */}
      {currentScreen !== 'game' && (
        <footer className="bg-[#080810] border-t border-[#171722] py-6 px-4 text-xs text-zinc-500">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="font-heading text-sm text-zinc-300">GORILLAZ GYM</span>
              <span>•</span>
              <span>The Champion Challenge © {new Date().getFullYear()}</span>
            </div>

            {/* Developer Credits - CARVISOFT */}
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg bg-[#0e0e1a] border border-[#8B35FF]/30 shadow-[0_0_12px_rgba(139,53,255,0.15)]">
              <span className="text-zinc-300 text-[11px] font-medium tracking-wide">
                Desarrollado por <strong className="text-[#00CFFF] font-bold drop-shadow-[0_0_8px_rgba(0,207,255,0.4)]">CARVISOFT</strong>
              </span>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <span className="text-[11px] text-zinc-400">
                Contacto: <a href="tel:3412570106" className="text-[#B026FF] hover:text-[#00CFFF] font-semibold transition-colors">341-2570106</a>
              </span>
            </div>

            <div className="flex items-center gap-4 text-zinc-400">
              <button
                onClick={() => setIsRulesOpen(true)}
                className="hover:text-[#00CFFF] transition cursor-pointer"
              >
                Reglamento
              </button>
              <button
                onClick={() => setCurrentScreen('ranking')}
                className="hover:text-[#B026FF] transition cursor-pointer"
              >
                Tabla de Posiciones
              </button>
              <button
                onClick={() => setIsAdminOpen(true)}
                className="hover:text-[#FFE600] transition cursor-pointer"
              >
                Acceso Gym Staff
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
