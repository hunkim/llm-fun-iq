"use client";

import leaderboardJson from "@/data/leaderboard.json";
import { useI18n } from "@/lib/i18n";
import { familyLabelFor } from "@/lib/families";
import { funIqLabel } from "@/lib/iq";
import { competitionRanks, formatKst, formatLatency, formatTokens, rankResults } from "@/lib/rank";
import type { Leaderboard, LeaderboardResult } from "@/lib/types";

const board = leaderboardJson as Leaderboard;

const MEDALS = ["🥇", "🥈", "🥉"] as const;

function ModelCard({ result, rank }: { result: LeaderboardResult; rank: number }) {
  const { t, locale } = useI18n();
  const medal = rank <= 3 ? MEDALS[rank - 1] : null;
  const tokens = formatTokens(result.tokens);
  const families = Object.entries(result.family ?? {});
  const incomplete = result.ok === false;

  return (
    <li className={`card ${rank <= 3 ? "top" : ""}`}>
      <details>
        <summary className="summary">
          <div className="rank">
            {medal ? (
              <span className="rank-emoji" aria-hidden="true">
                {medal}
              </span>
            ) : (
              <span className="rank-num">{rank}</span>
            )}
            <span className="sr-only">
              {t("rank")} {rank}
            </span>
          </div>
          <div className="identity">
            <h3 className="name">
              <span className="name-text">{result.name}</span>
              <span className="provider-badge">{result.provider}</span>
            </h3>
            <ul className="stats">
              <li>
                <span className="k">{t("correct")}</span>
                <b>
                  {result.correct}/{result.total}
                </b>
              </li>
              {result.refusals != null && result.refusals > 0 && (
                <li>
                  <span className="k">{t("refusals")}</span>
                  <b>{result.refusals}</b>
                </li>
              )}
              {result.format_failures > 0 && (
                <li className="warn">
                  <span className="k">{t("formatFailures")}</span>
                  <b>{result.format_failures}</b>
                </li>
              )}
              {incomplete && (
                <li className="warn">
                  <span className="k">{t("incomplete")}</span>
                </li>
              )}
              <li>
                <span className="k">{t("avgLatency")}</span>
                <b>{formatLatency(result.avg_ms)}</b>
              </li>
              {tokens && (
                <li>
                  <span className="k">{t("tokens")}</span>
                  <b>{tokens}</b>
                </li>
              )}
            </ul>
          </div>
          <div className="score-block">
            <div className="iq">{result.ai_iq}</div>
            <div className="iq-unit">{t("AI IQ")}</div>
          </div>
        </summary>
        <div className="expand">
          <div className="expand-inner">
            <div className="expand-head">
              <span className="chip">{funIqLabel(locale, result.ai_iq)}</span>
            </div>
            <h4 className="expand-title">{t("families")}</h4>
            <div className="families">
              {families.map(([fam, stats]) => {
                const pct = stats.total ? stats.correct / stats.total : 0;
                return (
                  <div className="fam" key={fam}>
                    <div className="fam-row">
                      <span>{familyLabelFor(locale, fam)}</span>
                      <b>
                        {stats.correct}/{stats.total}
                      </b>
                    </div>
                    <div className="bar" aria-hidden="true">
                      <span style={{ width: `${Math.round(pct * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="meta-bits">
              <span>
                {t("evaluatedAt")} <b>{formatKst(result.evaluated_at)}</b>
              </span>
              <span>
                {t("modelId")} <code>{result.id}</code>
              </span>
            </div>
          </div>
        </div>
      </details>
    </li>
  );
}

export default function HomePage() {
  const { t } = useI18n();
  const ranked = rankResults(board.results ?? []);
  const ranks = competitionRanks(ranked);
  const updated = formatKst(board.updated_at);

  return (
    <main>
      <section className="hero">
        <h1>FunIQ</h1>
        <p className="tagline">{t("tagline")}</p>
        <p className="lede">{t("heroSub")}</p>
        <div className="meta-row">
          <span className="pill">
            {board.items}
            {t("items")}
          </span>
          <span className="pill">
            {ranked.length}
            {t("modelsUnit")}
          </span>
          <span className="pill">
            {t("scale")} {board.scale}
          </span>
          <span className="pill">
            {t("updated")} {updated}
          </span>
        </div>
        <p className="cta">
          <span className="cta-inner">
            <span className="cta-label">{t("ctaPre")}</span>
            <a
              href="https://timelyrouter.ai"
              target="_blank"
              rel="noreferrer"
              className="cta-link"
            >
              {t("ctaLink")}
            </a>
            <span className="cta-label">{t("ctaPost")}</span>
          </span>
          <span className="designed-by">Designed by Solar Pro 4</span>
        </p>
      </section>

      <div className="section-head">
        <h2>{t("leaderboard")}</h2>
        <p>{t("sortHint")}</p>
      </div>

      {ranked.length === 0 ? (
        <div className="empty">
          <h2>{t("emptyTitle")}</h2>
          <p>{t("emptyBody")}</p>
        </div>
      ) : (
        <ol className="list">
          {ranked.map((result, i) => (
            <ModelCard key={result.id} result={result} rank={ranks[i]} />
          ))}
        </ol>
      )}
    </main>
  );
}
