"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function Header() {
  const { locale, setLocale, t } = useI18n();
  const path = usePathname();

  return (
    <header className="w-full border-b-2 border-ink bg-hanji/80">
      <div className="wrap flex items-center justify-between gap-4 py-2">
        <Link href="/" className="brand">
          <svg className="brand-mark" viewBox="0 0 34 34" aria-hidden>
            <rect width="34" height="34" rx="8" fill="#fffdf6" stroke="#2a1f14" strokeWidth="1.2" />
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
                    fill={r === 1 && c === 1 ? "#e0731d" : "none"}
                    stroke="#2a1f14"
                    strokeWidth="1.1"
                  />
                );
              }),
            )}
            <text x="27" y="28" textAnchor="middle" fontSize="8" fill="#2a1f14">
              ?
            </text>
          </svg>
          <span className="brand-name">
            FunIQ
            <span className="ml-2 text-persimmon text-sm font-semibold align-middle">
              {t("siteNameKo")}
            </span>
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
            className="hidden sm:inline"
          >
            timelyrouter.ai
          </a>
          <div className="flex border-2 border-ink rounded-full overflow-hidden text-xs font-bold">
            <button
              onClick={() => setLocale("ko")}
              className={`px-2.5 py-1 cursor-pointer ${locale === "ko" ? "bg-ink text-hanji" : "bg-transparent hover:bg-hanji-deep"}`}
              aria-pressed={locale === "ko"}
            >
              {t("ko")}
            </button>
            <button
              onClick={() => setLocale("en")}
              className={`px-2.5 py-1 cursor-pointer ${locale === "en" ? "bg-ink text-hanji" : "bg-transparent hover:bg-hanji-deep"}`}
              aria-pressed={locale === "en"}
            >
              {t("en")}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
