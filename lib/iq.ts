/** AI-IQ-FUN-v1 entertainment score. Not a human IQ estimate. */

export const SCALE_ID = "AI-IQ-FUN-v1";
export const CHANCE_ACCURACY = 0.125;
export const CHANCE_SCORE = 70;
export const PERFECT_SCORE = 150;
export const MIN_SCORE = 59;
export const MAX_SCORE = 150;

const ANSWER_TAG = /<answer>\s*([A-H])\s*<\/answer>/gi;

/** half_up(70 + 80 * (accuracy - 0.125) / 0.875), clamp 59..150 */
export function funIqScore(accuracy: number): number {
  if (!(accuracy >= 0 && accuracy <= 1)) {
    throw new Error("accuracy must be between 0 and 1");
  }
  const raw = CHANCE_SCORE + (80 * (accuracy - CHANCE_ACCURACY)) / 0.875;
  const halfUp = Math.floor(raw + 0.5);
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, halfUp));
}

export function funIqLabel(score: number): string {
  if (score >= 135) return "패턴 천재";
  if (score >= 125) return "매트릭스 마스터";
  if (score >= 110) return "추론 스페셜리스트";
  if (score >= 90) return "규칙 해독자";
  if (score >= 70) return "패턴 탐색자";
  return "워밍업 중";
}

/**
 * Exactly one <answer>X</answer> with X in A–H.
 * Anything else is a format failure (not correct).
 */
export function parseAnswer(content: string): string | null {
  if (typeof content !== "string" || !content) return null;
  const matches = [...content.matchAll(new RegExp(ANSWER_TAG))];
  return matches.length === 1 ? matches[0][1].toUpperCase() : null;
}

export function parseProviderName(
  rawName: string,
  fallbackId: string,
): { name: string; provider: string } {
  const trimmed = (rawName || fallbackId).trim();
  const colon = trimmed.indexOf(":");
  if (colon > 0) {
    return {
      provider: trimmed.slice(0, colon).trim(),
      name: trimmed.slice(colon + 1).trim() || fallbackId,
    };
  }
  return { name: trimmed, provider: "Unknown" };
}
