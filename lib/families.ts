export const FAMILY_LABELS: Record<string, { ko: string; en: string }> = {
  axis_binding: { ko: "축별 속성 결합", en: "Axis binding" },
  latin_cycle: { ko: "Latin 순환", en: "Latin cycle" },
  modular_addition: { ko: "모듈러 합", en: "Modular addition" },
  xor_overlay: { ko: "XOR 중첩", en: "XOR overlay" },
  affine_steps: { ko: "Affine 진행", en: "Affine steps" },
  commuting_transform: { ko: "가환 변환", en: "Commuting transform" },
  union_overlay: { ko: "합집합 중첩", en: "Union overlay" },
};

export function familyLabel(id: string): string {
  return FAMILY_LABELS[id]?.ko ?? id;
}

export function familyLabelFor(locale: "ko" | "en", id: string): string {
  return FAMILY_LABELS[id]?.[locale] ?? id;
}
