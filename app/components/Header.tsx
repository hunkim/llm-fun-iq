"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function Header() {
  const { locale, setLocale, t } = useI18n();
  const path = usePathname();

  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        <Link href="/" className="brand">
          <svg className="brand-mark" viewBox="0 0 34 34" aria-hidden>
            <rect width="34" height="34" rx="8" fill="#1c1b18" />
            {[0, 1, 2].flatMap((r) =>
              [0, 1, 2].map((c) => {
                const missing = r === 2 && c === 2;
                return missing ? null : (
                  <rect
                    key={`${r}-${c}`}
                    x={6.5 + c * 7.5}
                    y={6.5 + r * 7.5}
                    width="5.5"
                    height="5.5"
                    rx="1.4"
                    fill={r === 1 && c === 1 ? "#d9480f" : "rgba(255,255,255,0.85)"}
                  />
                );
              }),
            )}
            <text
              x="24.4"
              y="26.6"
              textAnchor="middle"
              fontSize="7.5"
              fontWeight="700"
              fill="#d9480f"
            >
              ?
            </text>
          </svg>
          <span className="brand-name">
            FunIQ
            <span className="brand-sub">{t("siteNameKo")}</span>
          </span>
        </Link>
        <nav className="nav">
          <Link href="/" aria-current={path === "/" ? "page" : undefined}>
            {t("leaderboard")}
          </Link>
          <Link href="/about" aria-current={path === "/about" ? "page" : undefined}>
            {t("about")}
          </Link>
          <a
            href="https://timelyrouter.ai"
            target="_blank"
            rel="noreferrer"
            className="nav-ext"
          >
            timelyrouter.ai
          </a>
          <div className="lang-switch">
            <button onClick={() => setLocale("ko")} aria-pressed={locale === "ko"}>
              KO
            </button>
            <button onClick={() => setLocale("en")} aria-pressed={locale === "en"}>
              EN
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
