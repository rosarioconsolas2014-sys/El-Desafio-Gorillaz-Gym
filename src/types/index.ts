export interface Participant {
  id: string;
  name: string;
  dni: string; // 7-8 digits numeric, private in public rankings
  nickname?: string;
  attemptsUsed: number;
  bestScore: number;
  lastScore: number;
  bestTimeSeconds: number;
  createdAt: string;
  lastPlayedAt: string;
  active: boolean;
}

export interface GameRecord {
  id: string;
  participantId: string;
  dni: string;
  name: string;
  nickname?: string;
  totalScore: number;
  level1Score: number;
  level2Score: number;
  level3Score: number;
  speedBonus: number;
  streakBonus: number;
  duration: number; // totalTimeSeconds
  attemptNumber: number;
  completedAt: string;
  status: 'completado';
}

// Backwards compatibility alias
export type GameAttempt = GameRecord;

export interface GameSettings {
  maxAttempts: number;
  unlimitedAttempts: boolean;
  competitionEnabled: boolean;
  startDate: string;
  endDate: string;
  competitionTitle: string;
  prizeTitle: string;
  prizeSubtitle?: string;
  gymLocation?: string;
  adminPasscode: string;
}

// Backwards compatibility alias
export type AdminConfig = GameSettings;

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  participantId?: string;
  timestamp: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'anatomy' | 'exercises' | 'nutrition' | 'equipment' | 'technique';
}

export interface MemoryCard {
  id: string;
  uniqueKey: string;
  name: string;
  iconName: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MatchPairChallenge {
  id: string;
  title: string;
  instruction: string;
  leftItem: { id: string; label: string; icon: string; subtitle?: string };
  options: { id: string; label: string; correct: boolean; hint?: string }[];
}
