"use client";

import { useI18n } from "@/lib/i18n";
import { familyLabelFor } from "@/lib/families";
import { funIqLabel } from "@/lib/iq";
import { FUN_IQ_LABELS } from "@/lib/iq";

const LABELS = [
  { min: 135, key: "genius" as const },
  { min: 125, key: "master" as const },
  { min: 110, key: "specialist" as const },
  { min: 90, key: "decoder" as const },
  { min: 70, key: "explorer" as const },
  { min: "other" as const, key: "warming" as const },
];

export function AboutContent() {
  const { t, locale } = useI18n();
  const labelRows = LABELS.filter((r) => r.min !== "other");

  return (
    <main className="about">
      <h1>{t("aboutTitle")}</h1>
      <p>{t("aboutIntroLong")}</p>

      <h2>{t("aboutWhatTitle")}</h2>
      <p>
        {t("aboutWhatBody")}
      </p>
      <ul>
        {(["axis_binding", "latin_cycle", "modular_addition", "xor_overlay", "affine_steps", "commuting_transform", "union_overlay"] as const).map((id) => (
          <li key={id}>
            <code>{id}</code> — {familyLabelFor(locale, id)}
          </li>
        ))}
      </ul>

      <h2>{t("aboutScoringTitle")}</h2>
      <p>{t("aboutScoringBody")}</p>
      <pre>
        {locale === "ko"
          ? `AI IQ (fun) v1 = half_up(70 + 80 × (p − 0.125) / 0.875)
표시 범위 = 59 … 150
chance p=0.125 → 70
perfect p=1     → 150`
          : `AI IQ (fun) v1 = half_up(70 + 80 × (p − 0.125) / 0.875)
Display range = 59 … 150
chance p=0.125 → 70
perfect p=1     → 150`}
      </pre>
      <table className="formula-table">
        <thead>
          <tr>
            <th>{t("scoreBand")}</th>
            <th>{t("scoreLabel")}</th>
          </tr>
        </thead>
        <tbody>
          {labelRows.map((row) => (
            <tr key={row.key}>
              <td>{typeof row.min === "number" ? `≥ ${row.min}` : (locale === "ko" ? "그 외" : "other")}</td>
              <td>{funIqLabel(locale, row.min)}</td>
            </tr>
          ))}
          <tr key="warming">
            <td>{locale === "ko" ? "그 외" : "other"}</td>
            <td>{funIqLabel(locale, 0)}</td>
          </tr>
        </tbody>
      </table>

      <h2>{t("aboutAutoTitle")}</h2>
      <p>{t("aboutAutoBody")}</p>
      <p>{t("aboutAutoNote")}</p>

      <h2>{t("aboutNotTitle")}</h2>
      <ul>
        {Array.from(t("aboutNotItems") as readonly string[]).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </main>
  );
}
