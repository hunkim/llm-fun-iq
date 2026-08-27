import type { Metadata } from "next";
import Link from "next/link";
import ogMeta from "@/data/og-meta.json";
import "./globals.css";

const SITE_URL = "https://llm-fun-iq.vercel.app";
const SITE_TITLE = "FunIQ — 재미로 환산한 AI IQ";
const SITE_DESC =
  ogMeta.description ||
  "같은 문항. 같은 규칙. 재미로 환산한 AI IQ. 행렬추론 챌린지 리더보드. 사람의 IQ·Mensa·일반 지능과 무관합니다.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s · FunIQ" },
  description: SITE_DESC,
  applicationName: "FunIQ",
  keywords: ["FunIQ", "AI IQ", "LLM", "leaderboard", "matrix reasoning"],
  authors: [{ name: "FunIQ" }],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "FunIQ",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "FunIQ — 행렬을 푸는 재미 IQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: ["/og.png"],
  },
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
              이 사이트는{" "}
              <a href="https://github.com/epoko77-ai/ai-iq-test">
                epoko77-ai/ai-iq-test
              </a>
              의 공개 문항을 이용했습니다. form{" "}
              <code>kmiq-v1-20260826</code> · MIT.
            </p>
            <p>
              평가:{" "}
              <a href="https://timelyrouter.ai">timelyrouter.ai</a> · 레이아웃
              영감:{" "}
              <a href="https://tigerbench.vercel.app/">TigerBench</a>
            </p>
            <p className="fineprint">
              FunIQ의 AI IQ는 사람의 IQ, Mensa, LLM의 일반 지능과 무관합니다.
              8지선다 첫 응답 정확도를 재미로 환산한 지수입니다.
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
