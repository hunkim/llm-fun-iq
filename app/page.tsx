"use client";

import leaderboardJson from "@/data/leaderboard.json";
import { useI18n } from "@/lib/i18n";
import { familyLabelFor } from "@/lib/families";
import { funIqLabel } from "@/lib/iq";
import { competitionRanks, formatKst, formatLatency, formatTokens, rankResults } from "@/lib/rank";
import type { Leaderboard, LeaderboardResult } from "@/lib/types";

const board = leaderboardJson as Leaderboard;

function ModelCard({ result, rank }: { result: LeaderboardResult; rank: number }) {
  const { t, locale } = useI18n();
  const tokens = formatTokens(result.tokens);
  const families = Object.entries(result.family ?? {});
  const incomplete = result.ok === false;
  const accuracyPct = result.total ? (result.correct / result.total) * 100 : 0;
  const hasFlags =
    (result.refusals != null && result.refusals > 0) || result.format_failures > 0 || incomplete;

  return (
    <li className={`card ${rank <= 3 ? "top" : ""}`}>
      <details>
        <summary className="summary">
          <div className="rank-cell">
            <span className={`rank-badge ${rank <= 3 ? `r${rank}` : ""}`}>{rank}</span>
            <span className="sr-only">
              {t("rank")} {rank}
            </span>
          </div>
          <div className="identity">
            <h3 className="name">
              <span className="name-text">{result.name}</span>
              <span className="provider-badge">{result.provider}</span>
            </h3>
            {hasFlags && (
              <div className="flags">
                {result.refusals != null && result.refusals > 0 && (
                  <span className="flag">
                    {t("refusals")} {result.refusals}
                  </span>
                )}
                {result.format_failures > 0 && (
                  <span className="flag">
                    {t("formatFailures")} {result.format_failures}
                  </span>
                )}
                {incomplete && <span className="flag">{t("incomplete")}</span>}
              </div>
            )}
          </div>
          <div className="acc-cell">
            <div className="acc-num">
              <b>
                {result.correct}/{result.total}
              </b>
              <span className="pct">{accuracyPct.toFixed(1)}%</span>
            </div>
            <div className="acc-bar" aria-hidden="true">
              <span style={{ width: `${accuracyPct}%` }} />
            </div>
          </div>
          <div className="lat-cell">
            <span className="lat-label">{t("avgLatency")} </span>
            {formatLatency(result.avg_ms)}
          </div>
          <div className="score-block">
            <span className="iq">{result.ai_iq}</span>
            <span className="chev" aria-hidden="true" />
          </div>
        </summary>
        <div className="expand">
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
            {tokens && (
              <span>
                {t("tokens")} <b>{tokens}</b>
              </span>
            )}
            <span>
              {t("evaluatedAt")} <b>{formatKst(result.evaluated_at)}</b>
            </span>
            <span>
              {t("modelId")} <code>{result.id}</code>
            </span>
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
        <p className="eyebrow">{t("tagline")}</p>
        <h1>FunIQ</h1>
        <p className="lede">{t("heroSub")}</p>
        <div className="stat-band">
          <div className="stat">
            <b>{board.items}</b>
            <span>{t("items")}</span>
          </div>
          <div className="stat">
            <b>{ranked.length}</b>
            <span>{t("modelsLabel")}</span>
          </div>
          <div className="stat stat-small">
            <b>{board.scale}</b>
            <span>{t("scale")}</span>
          </div>
          <div className="stat stat-small">
            <b>{updated}</b>
            <span>{t("updated")}</span>
          </div>
        </div>
        <div className="cta">
          <p className="cta-inner">
            <span>{t("ctaPre")} </span>
            <a href="https://timelyrouter.ai" target="_blank" rel="noreferrer" className="cta-link">
              {t("ctaLink")}
            </a>
            <span> {t("ctaPost")}</span>
          </p>
          <span className="designed-by">Designed by Solar Pro 4</span>
        </div>
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
        <div className="board">
          <div className="board-cols" aria-hidden="true">
            <span>{t("rank")}</span>
            <span>{t("model")}</span>
            <span>{t("accuracy")}</span>
            <span className="col-lat">{t("avgLatency")}</span>
            <span className="col-score">{t("AI IQ")}</span>
          </div>
          <ol className="list">
            {ranked.map((result, i) => (
              <ModelCard key={result.id} result={result} rank={ranks[i]} />
            ))}
          </ol>
        </div>
      )}
    </main>
  );
}
