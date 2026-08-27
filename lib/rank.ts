import type { LeaderboardResult } from "./types";

export function rankResults(results: LeaderboardResult[]): LeaderboardResult[] {
  return [...results].sort((a, b) => {
    if (b.ai_iq !== a.ai_iq) return b.ai_iq - a.ai_iq;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    if (a.format_failures !== b.format_failures) {
      return a.format_failures - b.format_failures;
    }
    return a.avg_ms - b.avg_ms;
  });
}

/** Same AI IQ shares a place: 7, 7, then 9. */
export function competitionRanks(sorted: LeaderboardResult[]): number[] {
  const ranks: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].ai_iq === sorted[i - 1].ai_iq) ranks.push(ranks[i - 1]);
    else ranks.push(i + 1);
  }
  return ranks;
}

export function formatLatency(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const sec = ms / 1000;
  if (sec < 10) return `${sec.toFixed(1)}초`;
  return `${Math.round(sec)}초`;
}

export function formatTokens(n: number | undefined): string | null {
  if (n == null || !Number.isFinite(n)) return null;
  if (n >= 10000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return n.toLocaleString("ko-KR");
}

export function formatKst(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
