import leaderboardJson from "@/data/leaderboard.json";
import { familyLabel } from "@/lib/families";
import { formatKst, formatLatency, formatTokens, rankResults } from "@/lib/rank";
import type { Leaderboard, LeaderboardResult } from "@/lib/types";

const board = leaderboardJson as Leaderboard;

const MEDALS = ["🥇", "🥈", "🥉"] as const;

function ModelCard({
  result,
  rank,
}: {
  result: LeaderboardResult;
  rank: number;
}) {
  const medal = rank <= 3 ? MEDALS[rank - 1] : null;
  const tokens = formatTokens(result.tokens);
  const families = Object.entries(result.family ?? {});

  return (
    <details className={`card ${rank <= 3 ? "top" : ""}`}>
      <summary className="summary">
        <div className={`rank ${medal ? "medal" : ""}`} aria-label={`${rank}위`}>
          {medal ?? rank}
        </div>
        <div className="identity">
          <div className="name">{result.name}</div>
          <div className="provider">{result.provider}</div>
        </div>
        <div className="score-block">
          <div className="iq">{result.ai_iq}</div>
          <span className="iq-unit">AI IQ</span>
          <span className="chip">{result.label}</span>
        </div>
        <div className="stats">
          <span>
            정답 <b>
              {result.correct}/{result.total}
            </b>
          </span>
          <span>
            형식 실패 <b>{result.format_failures}</b>
          </span>
          <span>
            평균 <b>{formatLatency(result.avg_ms)}</b>
          </span>
          {tokens ? (
            <span>
              토큰 <b>{tokens}</b>
            </span>
          ) : null}
          {!result.ok ? <span>상태 <b>부분 실패</b></span> : null}
        </div>
        <div className="toggle">
          <span className="toggle-closed">▾ 규칙군 · 실행 시각</span>
          <span className="toggle-open">▴ 접기</span>
        </div>
      </summary>
      <div className="expand">
        <div className="expand-inner">
          <h3>규칙군</h3>
          <div className="families">
            {families.map(([fam, stats]) => {
              const pct = stats.total ? stats.correct / stats.total : 0;
              return (
                <div className="fam" key={fam}>
                  <div>
                    {familyLabel(fam)}{" "}
                    <b>
                      {stats.correct}/{stats.total}
                    </b>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${Math.round(pct * 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="meta-bits">
            <span>
              평가 시각 <b>{formatKst(result.evaluated_at)}</b>
            </span>
            <span>
              모델 id <code>{result.id}</code>
            </span>
          </div>
        </div>
      </div>
    </details>
  );
}

export default function HomePage() {
  const ranked = rankResults(board.results ?? []);
  const updated = formatKst(board.updated_at);

  return (
    <main>
      <section className="hero">
        <h1>
          FunIQ
          <span>행렬을 푸는 재미 IQ.</span>
        </h1>
        <p className="tagline">같은 문항. 같은 규칙. 재미로 환산한 AI IQ.</p>
        <p className="lede">
          공개 form 168문항에서 층화한 챌린지 28문항. 모든 모델이 같은 문항을
          같은 규칙으로 풉니다. 답은 정확히 하나의{" "}
          <code>&lt;answer&gt;X&lt;/answer&gt;</code> (A–H)여야 합니다.
        </p>
        <div className="meta-row">
          <span className="pill">{board.items}문항 챌린지</span>
          <span className="pill">{ranked.length}개 모델</span>
          <span className="pill">척도 {board.scale}</span>
          <span className="pill">갱신 {updated}</span>
        </div>
        <p className="cta">
          모델을 FunIQ에 올리고 싶다면{" "}
          <a href="https://timelyrouter.ai" target="_blank" rel="noreferrer">
            timelyrouter.ai
          </a>
          에 등록하세요. 다음 날 아침 보드에 자동으로 오릅니다.
        </p>
      </section>

      <aside className="disclaimer-card">
        <h2>이 숫자는 IQ가 아닙니다</h2>
        <ul>
          <li>사람의 IQ, Mensa, LLM의 일반 지능과 무관합니다.</li>
          <li>
            8지선다 첫 응답 정확도를 공식으로 환산한 재미용 지수입니다.
          </li>
          <li>
            공식:{" "}
            <code>half_up(70 + 80 * (accuracy - 0.125) / 0.875)</code>, clamp
            59..150
          </li>
          <li>무작위(chance)=70 · 만점(perfect)=150</li>
        </ul>
      </aside>

      <div className="section-head">
        <h2>리더보드</h2>
        <p>AI IQ ↓ · 정확도 ↓ · 형식 실패 ↑ · 평균 지연 ↑</p>
      </div>

      {ranked.length === 0 ? (
        <div className="empty">
          <h2>아직 올라온 모델이 없습니다</h2>
          <p>
            일일 평가가 돌면 여기 순위가 채워집니다. 로컬에서는{" "}
            <code>node scripts/eval.mjs</code> 로 챌린지를 실행하세요.
          </p>
        </div>
      ) : (
        <div className="list">
          {ranked.map((result, i) => (
            <ModelCard key={result.id} result={result} rank={i + 1} />
          ))}
        </div>
      )}
    </main>
  );
}
