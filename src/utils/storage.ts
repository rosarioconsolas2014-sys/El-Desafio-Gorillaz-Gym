import { GameRecord, Participant, GameSettings } from '../types';
import { INITIAL_LEADERBOARD, DEFAULT_ADMIN_CONFIG } from '../data/gameData';

const ATTEMPTS_KEY = 'gorillaz_attempts_v1';
const CONFIG_KEY = 'gorillaz_admin_config_v1';

export function getStoredAttempts(): GameRecord[] {
  const data = localStorage.getItem(ATTEMPTS_KEY);
  if (!data) {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(INITIAL_LEADERBOARD));
    return INITIAL_LEADERBOARD;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_LEADERBOARD;
  }
}

export function saveGameAttempt(attempt: Omit<GameRecord, 'id' | 'completedAt'>): GameRecord {
  const attempts = getStoredAttempts();
  const newAttempt: GameRecord = {
    ...attempt,
    id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    completedAt: new Date().toISOString()
  };

  const updated = [newAttempt, ...attempts];
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(updated));
  return newAttempt;
}

export function getLeaderboard(): (GameRecord & { rank: number })[] {
  const attempts = getStoredAttempts();
  const mapByName = new Map<string, GameRecord>();

  for (const att of attempts) {
    const key = (att.name || '').trim().toLowerCase();
    const existing = mapByName.get(key);

    if (!existing) {
      mapByName.set(key, att);
    } else {
      if (att.totalScore > existing.totalScore) {
        mapByName.set(key, att);
      } else if (att.totalScore === existing.totalScore && att.duration < existing.duration) {
        mapByName.set(key, att);
      }
    }
  }

  const bestAttempts = Array.from(mapByName.values());

  bestAttempts.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.duration - b.duration;
  });

  return bestAttempts.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}

export function getAllParticipantsSummary(): Participant[] {
  const attempts = getStoredAttempts();
  const map = new Map<string, Participant>();

  for (const att of attempts) {
    const key = (att.name || '').trim().toLowerCase();
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        id: att.participantId,
        name: att.name,
        dni: att.dni || '',
        nickname: att.nickname,
        bestScore: att.totalScore,
        lastScore: att.totalScore,
        bestTimeSeconds: att.duration,
        attemptsUsed: 1,
        createdAt: att.completedAt,
        lastPlayedAt: att.completedAt,
        active: true
      });
    } else {
      existing.attemptsUsed += 1;
      if (att.totalScore > existing.bestScore || (att.totalScore === existing.bestScore && att.duration < existing.bestTimeSeconds)) {
        existing.bestScore = att.totalScore;
        existing.bestTimeSeconds = att.duration;
      }
      if (new Date(att.completedAt) > new Date(existing.lastPlayedAt)) {
        existing.lastPlayedAt = att.completedAt;
        if (att.nickname) existing.nickname = att.nickname;
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.bestScore - a.bestScore);
}

export function deleteAttempt(id: string): boolean {
  const attempts = getStoredAttempts();
  const filtered = attempts.filter((a) => a.id !== id);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(filtered));
  return true;
}

export function resetRanking(): void {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify([]));
}

export function restoreDefaultSeedData(): void {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(INITIAL_LEADERBOARD));
}

export function getAdminConfig(): GameSettings {
  const data = localStorage.getItem(CONFIG_KEY);
  if (!data) return DEFAULT_ADMIN_CONFIG;
  try {
    return { ...DEFAULT_ADMIN_CONFIG, ...JSON.parse(data) };
  } catch {
    return DEFAULT_ADMIN_CONFIG;
  }
}

export function saveAdminConfig(config: GameSettings): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function exportRankingToCSV(): void {
  const leaderboard = getLeaderboard();
  const headers = ['Posición', 'Nombre y Apellido', 'Apodo', 'Puntaje Total', 'Nivel 1', 'Nivel 2', 'Nivel 3', 'Bonificaciones', 'Tiempo Total (seg)', 'Fecha'];
  
  const rows = leaderboard.map((row) => [
    row.rank,
    `"${row.name.replace(/"/g, '""')}"`,
    `"${(row.nickname || '-').replace(/"/g, '""')}"`,
    row.totalScore,
    row.level1Score,
    row.level2Score,
    row.level3Score,
    row.speedBonus + row.streakBonus,
    row.duration,
    `"${new Date(row.completedAt).toLocaleDateString('es-AR')} ${new Date(row.completedAt).toLocaleTimeString('es-AR')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `GORILLAZ_GYM_RANKING_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
