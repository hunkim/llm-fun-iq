"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="footer">
      <p>
        {t("sourceLine")}{" "}
        <a
          href="https://github.com/epoko77-ai/ai-iq-test"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-tiger hover:text-tiger-deep"
        >
          {t("sourceLink")}
        </a>{" "}
        {t("sourceNote")}{" "}
        <code>{`kmiq-v1-20260826`}</code> · MIT.
      </p>
      <p className="flex flex-col sm:flex-row gap-x-6 gap-y-2">
        <span className="not-italic">
          {t("evalLine")}{" "}
          <a
            href="https://timelyrouter.ai"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-tiger hover:text-tiger-deep"
          >
            timelyrouter.ai
          </a>
        </span>
        <span className="not-italic">
          {t("layoutInspiration")}{" "}
          <a
            href="https://tigerbench.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-tiger hover:text-tiger-deep"
          >
            TigerBench
          </a>
        </span>
      </p>
      <p className="fineprint">{t("fineprint")}</p>
    </footer>
  );
}
