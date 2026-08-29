"use client";

import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>
          {t("sourceLine")}{" "}
          <a href="https://github.com/epoko77-ai/ai-iq-test" target="_blank" rel="noreferrer">
            {t("sourceLink")}
          </a>{" "}
          {t("sourceNote")} <code>{`kmiq-v1-20260826`}</code> · MIT.
        </p>
        <p>
          {t("evalLine")}{" "}
          <a href="https://timelyrouter.ai" target="_blank" rel="noreferrer">
            timelyrouter.ai
          </a>
          {" · "}
          {t("layoutInspiration")}{" "}
          <a href="https://tigerbench.vercel.app/" target="_blank" rel="noreferrer">
            TigerBench
          </a>
        </p>
        <p className="fineprint">{t("fineprint")}</p>
      </div>
    </footer>
  );
}
