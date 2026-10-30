import {
  collection,
  onSnapshot,
  query,
  getDocs,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Participant, GameRecord } from '../types';

export interface PublicRankItem {
  rank: number;
  id: string;
  name: string;
  nickname?: string;
  bestScore: number;
  bestTimeSeconds: number;
  lastPlayedAt: string;
  attemptsUsed: number;
}

const PARTICIPANTS_COLLECTION = 'participants';

/**
 * Sorts participants according to official rules:
 * 1. Highest score (bestScore)
 * 2. Lowest elapsed duration (bestTimeSeconds)
 * 3. Earliest date (lastPlayedAt)
 */
export function sortRankings(participants: Participant[]): PublicRankItem[] {
  // Only include active participants with a completed game (score > 0)
  const eligible = participants.filter((p) => p.active !== false && p.bestScore > 0);

  eligible.sort((a, b) => {
    // 1. Highest score
    if (b.bestScore !== a.bestScore) {
      return b.bestScore - a.bestScore;
    }
    // 2. Lowest duration (tie-breaker)
    if (a.bestTimeSeconds > 0 && b.bestTimeSeconds > 0 && a.bestTimeSeconds !== b.bestTimeSeconds) {
      return a.bestTimeSeconds - b.bestTimeSeconds;
    }
    // 3. Earliest date
    return new Date(a.lastPlayedAt).getTime() - new Date(b.lastPlayedAt).getTime();
  });

  // Assign ranks and strictly omit DNI from public item!
  return eligible.map((item, index) => ({
    rank: index + 1,
    id: item.id,
    name: item.name,
    nickname: item.nickname,
    bestScore: item.bestScore,
    bestTimeSeconds: item.bestTimeSeconds,
    lastPlayedAt: item.lastPlayedAt,
    attemptsUsed: item.attemptsUsed
  }));
}

/**
 * Subscribe to real-time ranking changes from Firestore
 */
export function subscribeToLiveRanking(
  onUpdate: (ranking: PublicRankItem[]) => void
): () => void {
  try {
    const q = query(collection(db, PARTICIPANTS_COLLECTION));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const participants: Participant[] = [];
        snapshot.forEach((doc) => {
          participants.push({ id: doc.id, ...doc.data() } as Participant);
        });
        const ranked = sortRankings(participants);
        onUpdate(ranked);
      },
      (error) => {
        console.warn('Real-time ranking subscription error, falling back to one-time query:', error);
        fetchRankingOnce().then(onUpdate);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn('Error setting up snapshot listener:', error);
    fetchRankingOnce().then(onUpdate);
    return () => {};
  }
}

/**
 * One-time fetch of current ranking
 */
export async function fetchRankingOnce(): Promise<PublicRankItem[]> {
  try {
    const snap = await getDocs(collection(db, PARTICIPANTS_COLLECTION));
    const list: Participant[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as Participant);
    });
    return sortRankings(list);
  } catch (error) {
    console.warn('Failed to fetch from Firestore, using localStorage:', error);
    try {
      const local = localStorage.getItem('gorillaz_firestore_participants_local');
      if (local) {
        return sortRankings(JSON.parse(local));
      }
    } catch {
      // ignore
    }
    return [];
  }
}

/**
 * Export public ranking to CSV (DNI is NOT exported in public view to protect privacy)
 */
export function exportPublicRankingToCSV(items: PublicRankItem[]): void {
  const headers = ['Posición', 'Atleta', 'Apodo', 'Mejor Puntaje', 'Tiempo (seg)', 'Fecha'];
  const rows = items.map((r) => [
    r.rank,
    `"${r.name.replace(/"/g, '""')}"`,
    `"${(r.nickname || '-').replace(/"/g, '""')}"`,
    r.bestScore,
    r.bestTimeSeconds,
    `"${new Date(r.lastPlayedAt).toLocaleDateString('es-AR')} ${new Date(r.lastPlayedAt).toLocaleTimeString('es-AR')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `GORILLAZ_GYM_RANKING_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
