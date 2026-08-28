"use client";

import { useState } from "react";
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
  const [open, setOpen] = useState(rank === 1);
  const medal = rank <= 3 ? MEDALS[rank - 1] : null;
  const tokens = formatTokens(result.tokens);
  const families = Object.entries(result.family ?? {});

  return (
    <div className={`card ${rank <= 3 ? "top" : ""}`}>
      <details open={open} onToggle={() => setOpen(!open)}>
        <summary className="summary">
          <div className="rank">
            {medal ? (
              <span className="text-2xl sm:text-3xl">{medal}</span>
            ) : (
              <span className="rank-medal font-black text-lg sm:text-xl text-ink-soft tabular-nums">
                {rank}
              </span>
            )}
          </div>
          <div className="identity">
            <div className="name">
              <span className="font-display font-bold text-base sm:text-lg truncate block">
                {result.name}
              </span>
              <span className="text-[10px] font-bold text-white rounded-full px-2 py-0.5 bg-ink-soft inline-block mt-1 align-middle">
                {result.provider}
              </span>
            </div>
            <div className="provider">
              <div className="text-xs text-ink-soft flex gap-3 flex-wrap tabular-nums">
                <span>{t("correct")} <b>{result.correct}/{result.total}</b></span>
                {result.refusals && result.refusals > 0 && (
                  <span>{t("refusals")} <b>{result.refusals}</b></span>
                )}
                {result.format_failures > 0 && (
                  <span className="text-persimmon font-semibold">
                    {t("formatFailures")} <b>{result.format_failures}</b>
                  </span>
                )}
                <span>{t("avgLatency")} <b>{formatLatency(result.avg_ms)}</b></span>
                {tokens && <span>{t("tokens")} <b>{tokens}</b></span>}
              </div>
            </div>
          </div>
          <div className="score-block">
            <div className="iq">{result.ai_iq}</div>
            <div className="iq-unit">{t("AI IQ")}</div>
          </div>
        </summary>
        <div className="expand">
          <div className="expand-inner">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="chip">{funIqLabel(locale, result.ai_iq)}</span>
              <span className="text-xs text-ink-soft">{t("AI IQ")} · {result.ai_iq}</span>
            </div>
            <h3 className="mb-2">{t("families")}</h3>
            <div className="families">
              {families.map(([fam, stats]) => {
                const pct = stats.total ? stats.correct / stats.total : 0;
                return (
                  <div className="fam" key={fam}>
                    <div>
                      {familyLabelFor(locale, fam)}
                      <b>{stats.correct}/{stats.total}</b>
                    </div>
                    <div className="bar">
                      <i style={{ width: `${Math.round(pct * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="meta-bits">
              <span>{t("evaluatedAt")} <b>{formatKst(result.evaluated_at)}</b></span>
              <span>{t("modelId")} <code>{result.id}</code></span>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}

export default function HomePage() {
  const { t, locale } = useI18n();
  const ranked = rankResults(board.results ?? []);
  const ranks = competitionRanks(ranked);
  const updated = formatKst(board.updated_at);

  return (
    <main>
      <section className="hero">
        <h1>
          FunIQ
          <span>{t("siteNameKo")}</span>
        </h1>
        <p className="tagline">{t("tagline")}</p>
        <p className="lede">{t("heroSub")}</p>
        <div className="meta-row">
          <span className="pill">{board.items}{t("items")}</span>
          <span className="pill">{ranked.length}개 모델</span>
          <span className="pill">{t("scale")} {board.scale}</span>
          <span className="pill">{t("updated")} {updated}</span>
        </div>
        <p className="cta">
          {t("ctaPre")}{" "}
          <a
            href="https://timelyrouter.ai"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-tiger-deep underline decoration-tiger hover:text-persimmon"
          >
            {t("ctaLink")}
          </a>
          {t("ctaPost")}
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
        <div className="list">
          {ranked.map((result, i) => (
            <ModelCard key={result.id} result={result} rank={ranks[i]} />
          ))}
        </div>
      )}
    </main>
  );
}
