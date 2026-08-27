import type { Metadata } from "next";
import { Noto_Serif_KR, Noto_Sans_KR } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ogMeta from "@/data/og-meta.json";
import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  weight: ["600", "900"],
  subsets: ["latin"],
  variable: "--font-noto-serif-kr",
});

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
});

const SITE_URL = "https://llm-fun-iq.vercel.app";
const SITE_TITLE = "FunIQ — 재미로 환산한 AI IQ";
const SITE_DESC = ogMeta.description || "같은 문항. 같은 규칙. 재미로 환산한 AI IQ. 행렬추론 챌린지 리더보드.";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoSerifKr.variable} ${notoSansKr.variable}`}>
      <body>
        <LocaleProvider>
          <Header />
          <div className="wrap">{children}</div>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
