import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "FunIQ — 재미로 환산한 AI IQ",
  description:
    "같은 문항. 같은 규칙. 재미로 환산한 AI IQ. 행렬추론 챌린지 리더보드. 사람의 IQ·Mensa·일반 지능과 무관합니다.",
};

function Logo() {
  return (
    <svg className="brand-mark" viewBox="0 0 34 34" aria-hidden>
      <rect width="34" height="34" rx="8" fill="#161922" stroke="#e4c36a" strokeWidth="1.2" />
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2].map((c) => {
          const missing = r === 2 && c === 2;
          return missing ? null : (
            <rect
              key={`${r}-${c}`}
              x={6 + c * 8}
              y={6 + r * 8}
              width="6"
              height="6"
              rx="1.2"
              fill={r === 1 && c === 1 ? "#e4c36a" : "none"}
              stroke="#e4c36a"
              strokeWidth="1.1"
            />
          );
        }),
      )}
      <text x="27" y="28" textAnchor="middle" fontSize="8" fill="#f3ead2">
        ?
      </text>
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <div className="banner">
          <div className="wrap banner-inner">
            <span className="banner-mark">면책</span>
            <div>
              FunIQ의 AI IQ는 <strong>사람의 IQ / Mensa / LLM의 일반 지능과 무관</strong>
              합니다. 8지선다 첫 응답 정확도를{" "}
              <strong>
                half_up(70 + 80 × (accuracy − 0.125) / 0.875)
              </strong>
              로 환산한 재미용 지수입니다. 무작위(chance) 70 · 만점 150 · 표시 59–150.
            </div>
          </div>
        </div>
        <div className="wrap">
          <header className="site-header">
            <Link className="brand" href="/">
              <Logo />
              <span className="brand-name">FunIQ</span>
            </Link>
            <nav className="nav">
              <Link href="/">리더보드</Link>
              <Link href="/about">소개</Link>
              <a href="https://timelyrouter.ai" target="_blank" rel="noreferrer">
                timelyrouter.ai
              </a>
            </nav>
          </header>
          {children}
          <footer className="footer">
            <p>
              문항:{" "}
              <a href="https://github.com/epoko77-ai/ai-iq-test">
                epoko77-ai/ai-iq-test
              </a>{" "}
              · form <code>kmiq-v1-20260826</code> · MIT
            </p>
            <p>
              평가:{" "}
              <a href="https://timelyrouter.ai">timelyrouter.ai</a> Chat
              Completions · 레이아웃 영감:{" "}
              <a href="https://tigerbench.vercel.app/">TigerBench</a> (카피/CSS
              복제 아님)
            </p>
            <p>FunIQ 자체도 MIT. 재미용 벤치마크이며 공식 지능 검사가 아닙니다.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
