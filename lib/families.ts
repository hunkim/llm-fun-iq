export const FAMILY_LABELS: Record<string, string> = {
  axis_binding: "축별 속성 결합",
  latin_cycle: "Latin 순환",
  modular_addition: "모듈러 합",
  xor_overlay: "XOR 중첩",
  affine_steps: "Affine 진행",
  commuting_transform: "가환 변환",
  union_overlay: "합집합 중첩",
};

export function familyLabel(id: string): string {
  return FAMILY_LABELS[id] ?? id;
}
