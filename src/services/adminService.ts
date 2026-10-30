import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  collection,
  doc,
  addDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { Participant, GameRecord, GameSettings, AdminLog } from '../types';
import { getAllParticipants } from './participantService';
import { getAllGames } from './gameService';
import { getGameSettings } from './settingsService';

const ADMIN_LOGS_COLLECTION = 'adminLogs';

export interface AdminStats {
  totalParticipants: number;
  totalGames: number;
  exhaustedAttemptsCount: number;
  averageScore: number;
  bestOverallScore: number;
  currentWinner: { name: string; nickname?: string; score: number; dni?: string } | null;
}

export async function loginAdminWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  await logAdminAction(cred.user.email || cred.user.uid, 'LOGIN_SUCCESS');
  return cred.user;
}

export async function logoutAdmin(): Promise<void> {
  const currentUser = auth.currentUser;
  if (currentUser) {
    await logAdminAction(currentUser.email || currentUser.uid, 'LOGOUT');
  }
  await signOut(auth);
}

export function subscribeToAdminAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function logAdminAction(
  adminId: string,
  action: string,
  participantId?: string
): Promise<void> {
  try {
    await addDoc(collection(db, ADMIN_LOGS_COLLECTION), {
      adminId,
      action,
      participantId: participantId || '',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Could not record admin log to Firestore:', err);
  }
}

export async function getAdminLogs(): Promise<AdminLog[]> {
  try {
    const snap = await getDocs(collection(db, ADMIN_LOGS_COLLECTION));
    const list: AdminLog[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as AdminLog);
    });
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch {
    return [];
  }
}

export async function calculateAdminStats(): Promise<AdminStats> {
  const [participants, games, settings] = await Promise.all([
    getAllParticipants(),
    getAllGames(),
    getGameSettings()
  ]);

  const totalParticipants = participants.length;
  const totalGames = games.length;

  let exhaustedAttemptsCount = 0;
  if (!settings.unlimitedAttempts) {
    exhaustedAttemptsCount = participants.filter(
      (p) => (p.attemptsUsed || 0) >= settings.maxAttempts
    ).length;
  }

  let totalPointsSum = 0;
  let bestOverallScore = 0;
  let winner: AdminStats['currentWinner'] = null;

  for (const p of participants) {
    if (p.bestScore > bestOverallScore) {
      bestOverallScore = p.bestScore;
      winner = {
        name: p.name,
        nickname: p.nickname,
        score: p.bestScore,
        dni: p.dni
      };
    }
  }

  if (games.length > 0) {
    totalPointsSum = games.reduce((acc, g) => acc + g.totalScore, 0);
  }
  const averageScore = games.length > 0 ? Math.round(totalPointsSum / games.length) : 0;

  return {
    totalParticipants,
    totalGames,
    exhaustedAttemptsCount,
    averageScore,
    bestOverallScore,
    currentWinner: winner
  };
}

/**
 * Resets the tournament with the option to keep or wipe participants
 */
export async function resetTournament(wipeParticipants: boolean): Promise<void> {
  try {
    // 1. Wipe all games
    const gamesSnap = await getDocs(collection(db, 'games'));
    const batch1 = writeBatch(db);
    gamesSnap.forEach((d) => batch1.delete(d.ref));
    await batch1.commit();

    // 2. Participants
    const partSnap = await getDocs(collection(db, 'participants'));
    const batch2 = writeBatch(db);
    partSnap.forEach((d) => {
      if (wipeParticipants) {
        batch2.delete(d.ref);
      } else {
        // Keep participant accounts, but reset scores & attempts
        batch2.update(d.ref, {
          attemptsUsed: 0,
          bestScore: 0,
          lastScore: 0,
          bestTimeSeconds: 0,
          lastPlayedAt: new Date().toISOString()
        });
      }
    });
    await batch2.commit();

    localStorage.removeItem('gorillaz_firestore_games_local');
    if (wipeParticipants) {
      localStorage.removeItem('gorillaz_firestore_participants_local');
    }

    await logAdminAction(auth.currentUser?.email || 'admin', 'RESET_TOURNAMENT');
  } catch (error) {
    console.error('Error resetting tournament in Firestore:', error);
    throw error;
  }
}
