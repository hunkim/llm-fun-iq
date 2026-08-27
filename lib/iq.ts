/** AI-IQ-FUN-v1 entertainment score. Not a human IQ estimate. */

export const SCALE_ID = "AI-IQ-FUN-v1";
export const CHANCE_ACCURACY = 0.125;
export const CHANCE_SCORE = 70;
export const PERFECT_SCORE = 150;
export const MIN_SCORE = 59;
export const MAX_SCORE = 150;

/** half_up(70 + 80 * (accuracy - 0.125) / 0.875), clamp 59..150 */
export function funIqScore(accuracy: number): number {
  if (!(accuracy >= 0 && accuracy <= 1)) {
    throw new Error("accuracy must be between 0 and 1");
  }
  const raw = CHANCE_SCORE + (80 * (accuracy - CHANCE_ACCURACY)) / 0.875;
  const halfUp = Math.floor(raw + 0.5);
  return Math.max(MIN_SCORE, Math.min(MAX_SCORE, halfUp));
}

export const FUN_IQ_LABELS: Record<string, { ko: string; en: string }> = {
  genius: { ko: "패턴 천재", en: "Pattern genius" },
  master: { ko: "매트릭스 마스터", en: "Matrix master" },
  specialist: { ko: "추론 스페셜리스트", en: "Reasoning specialist" },
  decoder: { ko: "규칙 해독자", en: "Rule decoder" },
  explorer: { ko: "패턴 탐색자", en: "Pattern explorer" },
  warming: { ko: "워밍업 중", en: "Warming up" },
};

export function funIqLabel(locale: "ko" | "en", score: number): string {
  if (score >= 135) return FUN_IQ_LABELS.genius[locale];
  if (score >= 125) return FUN_IQ_LABELS.master[locale];
  if (score >= 110) return FUN_IQ_LABELS.specialist[locale];
  if (score >= 90) return FUN_IQ_LABELS.decoder[locale];
  if (score >= 70) return FUN_IQ_LABELS.explorer[locale];
  return FUN_IQ_LABELS.warming[locale];
}

/** legacy single-result form kept for data builds that call it directly */
export function funIqLabelLegacy(score: number): string {
  return funIqLabel("ko", score);
}

/** Extract A–H from JSON, XML tags, or common LLM answer phrasings.
 * Uses the last high-confidence letter (final answer after thinking).
 */
export function parseAnswer(content: string): string | null {
  if (typeof content !== "string" || !content.trim()) return null;
  const text = content.trim();
  const found: string[] = [];
  const add = (ch: string | undefined) => {
    if (!ch) return;
    const up = ch.toUpperCase();
    if (/^[A-H]$/.test(up)) found.push(up);
  };
  for (const m of text.matchAll(/["']answer["']?:\s*["']?([A-Ha-h])["']?/g)) add(m[1]);
  for (const m of text.matchAll(/<answer>\s*([A-Ha-h])\s*<\/answer>/gi)) add(m[1]);
  for (const m of text.matchAll(/\b(?:final\s+)?answer\s*(?:is|=|:)\s*([A-Ha-h])\b/gi)) add(m[1]);
  for (const m of text.matchAll(/정답\s*(?:은|는|:)?\s*([A-Ha-h])\b/g)) add(m[1]);
  for (const m of text.matchAll(/(?:^|\n)\s*\(?([A-Ha-h])\)?\s*[.:\)](?:\s|$)/g)) add(m[1]);
  if (found.length) return found[found.length - 1];
  const only = text.match(/^\s*\(?([A-Ha-h])\)?\s*[.\s]*$/);
  return only ? only[1].toUpperCase() : null;
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
