export type FamilyStats = {
  correct: number;
  total: number;
};

export type LeaderboardResult = {
  id: string;
  name: string;
  provider: string;
  ai_iq: number;
  label: string;
  correct: number;
  total: number;
  accuracy: number;
  format_failures: number;
  avg_ms: number;
  tokens?: number;
  family: Record<string, FamilyStats>;
  evaluated_at: string;
  ok: boolean;
};

export type Leaderboard = {
  scale: string;
  suite: string;
  form?: string;
  items: number;
  updated_at: string | null;
  results: LeaderboardResult[];
};

export type Problem = {
  id: string;
  family: string;
  difficulty: number;
  prompt: string;
  answer: string;
};

export type ChallengeFile = {
  form: string;
  source?: string;
  suite: string;
  items: number;
  strategy?: string;
  seed?: string;
  ids: string[];
};
