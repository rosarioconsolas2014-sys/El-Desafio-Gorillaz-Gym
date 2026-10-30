import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { GameRecord, Participant } from '../types';
import { getGameSettings } from './settingsService';

const GAMES_COLLECTION = 'games';
const PARTICIPANTS_COLLECTION = 'participants';
const LOCAL_GAMES_KEY = 'gorillaz_firestore_games_local';

export interface GameCompletionInput {
  participantId: string;
  dni: string;
  name: string;
  nickname?: string;
  level1Score: number;
  level2Score: number;
  level3Score: number;
  speedBonus: number;
  streakBonus: number;
  duration: number; // in seconds
}

/**
 * Validates and records a fully completed 3-level game into Firestore
 */
export async function recordGameCompletion(
  input: GameCompletionInput,
  participant: Participant
): Promise<{ game: GameRecord; updatedParticipant: Participant }> {
  // 1. Validation checks
  if (!input.participantId || !input.dni) {
    throw new Error('Datos de participante incompletos.');
  }

  // Ensure game is valid
  const calculatedTotal =
    input.level1Score + input.level2Score + input.level3Score + input.speedBonus + input.streakBonus;

  if (calculatedTotal <= 0 && input.duration <= 0) {
    throw new Error('Partida inválida o no completada.');
  }

  // Check attempt limit
  const settings = await getGameSettings();
  if (!settings.unlimitedAttempts && participant.attemptsUsed >= settings.maxAttempts) {
    throw new Error('El participante ya agotó todos sus intentos permitidos.');
  }

  const attemptNumber = (participant.attemptsUsed || 0) + 1;
  const gameId = 'game_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const newGame: GameRecord = {
    id: gameId,
    participantId: participant.id,
    dni: input.dni,
    name: input.name,
    nickname: input.nickname || participant.nickname || '',
    level1Score: input.level1Score,
    level2Score: input.level2Score,
    level3Score: input.level3Score,
    speedBonus: input.speedBonus,
    streakBonus: input.streakBonus,
    totalScore: calculatedTotal,
    duration: input.duration,
    attemptNumber,
    completedAt: now,
    status: 'completado'
  };

  // 2. Save game to Firestore
  try {
    const gameDocRef = doc(db, GAMES_COLLECTION, gameId);
    await setDoc(gameDocRef, newGame);
  } catch (error) {
    console.warn('Error saving game to Firestore (saving locally):', error);
  }
  saveLocalGame(newGame);

  // 3. Update Participant record
  const isBetterScore = calculatedTotal > (participant.bestScore || 0);
  const isTiedWithBetterTime =
    calculatedTotal === (participant.bestScore || 0) &&
    (participant.bestTimeSeconds <= 0 || input.duration < participant.bestTimeSeconds);

  const updatedBestScore = isBetterScore ? calculatedTotal : participant.bestScore || calculatedTotal;
  const updatedBestTime =
    isBetterScore || isTiedWithBetterTime
      ? input.duration
      : participant.bestTimeSeconds || input.duration;

  const updatedParticipant: Participant = {
    ...participant,
    attemptsUsed: attemptNumber,
    lastScore: calculatedTotal,
    bestScore: updatedBestScore,
    bestTimeSeconds: updatedBestTime,
    lastPlayedAt: now
  };

  try {
    const participantDocRef = doc(db, PARTICIPANTS_COLLECTION, participant.id);
    await updateDoc(participantDocRef, {
      attemptsUsed: attemptNumber,
      lastScore: calculatedTotal,
      bestScore: updatedBestScore,
      bestTimeSeconds: updatedBestTime,
      lastPlayedAt: now
    });
  } catch (error) {
    console.warn('Error updating participant in Firestore:', error);
  }

  return { game: newGame, updatedParticipant };
}

export async function getAllGames(): Promise<GameRecord[]> {
  try {
    const snap = await getDocs(collection(db, GAMES_COLLECTION));
    const list: GameRecord[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as GameRecord);
    });
    if (list.length > 0) {
      localStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify(list));
      return list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }
  } catch (error) {
    console.warn('Error reading games from Firestore:', error);
  }
  return getLocalGames();
}

export async function getGamesByParticipant(participantId: string): Promise<GameRecord[]> {
  try {
    const q = query(
      collection(db, GAMES_COLLECTION),
      where('participantId', '==', participantId)
    );
    const snap = await getDocs(q);
    const list: GameRecord[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as GameRecord);
    });
    return list.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  } catch (error) {
    console.warn('Error reading participant games from Firestore:', error);
    return getLocalGames().filter((g) => g.participantId === participantId);
  }
}

export async function deleteGame(gameId: string): Promise<void> {
  try {
    const docRef = doc(db, GAMES_COLLECTION, gameId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Error deleting game from Firestore:', error);
  }
  const filtered = getLocalGames().filter((g) => g.id !== gameId);
  localStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify(filtered));
}

// Local storage fallback helpers
function getLocalGames(): GameRecord[] {
  try {
    const saved = localStorage.getItem(LOCAL_GAMES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalGame(game: GameRecord): void {
  const current = getLocalGames();
  current.unshift(game);
  localStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify(current));
}
