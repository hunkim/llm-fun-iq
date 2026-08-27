import type { Metadata } from "next";
import { FAMILY_LABELS } from "@/lib/families";

export const metadata: Metadata = {
  title: "소개 — FunIQ",
};

const LABELS: { min: number | string; name: string }[] = [
  { min: 135, name: "패턴 천재" },
  { min: 125, name: "매트릭스 마스터" },
  { min: 110, name: "추론 스페셜리스트" },
  { min: 90, name: "규칙 해독자" },
  { min: 70, name: "패턴 탐색자" },
  { min: "그 외", name: "워밍업 중" },
];

export default function AboutPage() {
  return (
    <main className="about">
      <h1>FunIQ는 장난입니다. 진지한 장난.</h1>
      <p>
        FunIQ는 공개 행렬추론 form을 같은 규칙으로 풀게 하고, 첫 응답
        정확도를 재미용 AI IQ 숫자로 보여 주는 리더보드입니다.{" "}
        <strong>사람의 IQ가 아니고, Mensa가 아니고, 모델의 일반 지능도
        아닙니다.</strong>
      </p>

      <h2>무엇을 푸나</h2>
      <p>
        문항은{" "}
        <a href="https://github.com/epoko77-ai/ai-iq-test">
          epoko77-ai/ai-iq-test
        </a>
        의 공개 form <code>kmiq-v1-20260826</code> (MIT) 168문항입니다. 챌린지
        스위트는 7개 규칙군 × 4개 난도에서 각 1문항, 총 28문항입니다. 선택된
        문항 id는 <code>data/challenge-ids.json</code>에 고정되어 모든 모델이
        같은 문항을 봅니다.
      </p>
      <ul>
        {Object.entries(FAMILY_LABELS).map(([id, label]) => (
          <li key={id}>
            <code>{id}</code> — {label}
          </li>
        ))}
      </ul>

      <h2>채점</h2>
      <p>
        모델에게는 JSON <code>{`{"answer":"X"}`}</code> (X는 A–H)를 요청합니다.
        채점은 지능을 보려는 것이라 형식을 엄격히 요구하지 않습니다. JSON,
        <code>&lt;answer&gt;X&lt;/answer&gt;</code>, “정답은 B”, 보기 번호{" "}
        <code>B.</code>처럼 흔히 쓰는 답에서도 마지막 글자를 읽습니다. 글자를
        전혀 못 찾으면 형식 실패입니다.
      </p>
      <pre>{`AI IQ (fun) v1 = half_up(70 + 80 × (p − 0.125) / 0.875)
표시 범위 = 59 … 150
chance p=0.125 → 70
perfect p=1     → 150`}</pre>
      <table className="formula-table">
        <thead>
          <tr>
            <th>점수</th>
            <th>라벨</th>
          </tr>
        </thead>
        <tbody>
          {LABELS.map((row) => (
            <tr key={row.name}>
              <td>{typeof row.min === "number" ? `≥ ${row.min}` : row.min}</td>
              <td>{row.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>자동 평가</h2>
      <p>
        매일 05:00 KST (cron <code>0 20 * * *</code> UTC) GitHub Action이
        timelyrouter.ai 카탈로그의 아직 채점되지 않은 모델을 돌립니다.
        결과는 <code>data/leaderboard.json</code>에 커밋되어 Vercel이
        다시 빌드합니다.
      </p>
      <p>
        timelyrouter.ai에 모델을 등록하면 다음 날 아침 자동으로 리더보드에
        오릅니다.
      </p>

      <h2>이 사이트가 아닌 것</h2>
      <ul>
        <li>인간 지능 검사, Mensa 가입 시험, 정부·채용 평가가 아닙니다.</li>
        <li>
          시지각, 지식, 창의성, 에이전트 능력, 안전성을 측정하지 않습니다.
        </li>
        <li>
          TigerBench의 카피나 CSS를 가져오지 않았습니다. 리더보드 톤만
          참고했습니다.
        </li>
      </ul>
    </main>
  );
}
