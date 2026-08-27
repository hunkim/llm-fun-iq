"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "ko" | "en";

const STORAGE_KEY = "funiq-locale";

export const dict = {
  siteName: { ko: "FunIQ", en: "FunIQ" },
  siteNameKo: { ko: "재미 IQ", en: "Fun IQ" },
  tagline: {
    ko: "같은 문항. 같은 규칙. 재미로 환산한 AI IQ.",
    en: "Same questions. Same rules. AI IQ, measured for fun.",
  },
  heroSub: {
    ko: "공개 form 168문항 전부. 모든 모델이 같은 문항을 같은 규칙으로 풉니다.",
    en: "All 168 public form questions. Every model solves the same questions under the same rules.",
  },
  heroHow: {
    ko: "답은 JSON {answer: \"X\"} (A–H)로 받고, 태그·문장 속 글자도 채점합니다.",
    en: "Answers are accepted as JSON {answer: \"X\"} (A–H), and letters inside tags and sentences are scored too.",
  },
  benchMeta: {
    ko: "{n}문항 · {m}개 모델 · 척도 {scale} · 갱신 {date}",
    en: "{n} questions · {m} models · scale {scale} · updated {date}",
  },
  leaderboard: { ko: "리더보드", en: "Leaderboard" },
  about: { ko: "소개", en: "About" },
  rank: { ko: "순위", en: "Rank" },
  score: { ko: "점수", en: "Score" },
  "AI IQ": { ko: "AI IQ", en: "AI IQ" },
  correct: { ko: "정답", en: "Correct" },
  refusals: { ko: "거절", en: "Refusals" },
  formatFailures: { ko: "형식 실패", en: "Format failures" },
  avgLatency: { ko: "평균 지연", en: "Avg latency" },
  tokens: { ko: "토큰", en: "Tokens" },
  families: { ko: "규칙군", en: "Rule families" },
  evaluatedAt: { ko: "평가 시각", en: "Evaluated at" },
  modelId: { ko: "모델 id", en: "Model id" },
  scale: { ko: "척도", en: "Scale" },
  items: { ko: "문항", en: "Questions" },
  updated: { ko: "갱신", en: "Updated" },
  sortHint: {
    ko: "AI IQ ↓ · 정확도 ↓ · 형식 실패 ↑ · 평균 지연 ↑",
    en: "AI IQ ↓ · accuracy ↓ · format failures ↑ · avg latency ↑",
  },
  emptyTitle: {
    ko: "아직 올라온 모델이 없습니다",
    en: "No models have been submitted yet",
  },
  emptyBody: {
    ko: "일일 평가가 돌면 여기 순위가 채워집니다. 로컬에서는 node scripts/eval.mjs 로 챌린지를 실행하세요.",
    en: "The daily evaluation will fill this ranking. Locally, run the challenge with node scripts/eval.mjs.",
  },
  ctaPre: {
    ko: "모델을 FunIQ에 올리고 싶다면",
    en: "Want your model on FunIQ?",
  },
  ctaLink: {
    ko: "timelyrouter.ai에 등록",
    en: "register on timelyrouter.ai",
  },
  ctaPost: {
    ko: "하면 다음 날 아침 보드에 자동으로 오릅니다.",
    en: " — new router models are added to the board automatically the next morning.",
  },
  aboutIntroLong: {
    ko: "FunIQ는 공개 행렬추론 form을 같은 규칙으로 풀게 하고, 첫 응답 정확도를 재미용 AI IQ 숫자로 보여 주는 리더보드입니다. 사람의 IQ가 아니고, Mensa가 아니고, 모델의 일반 지능도 아닙니다.",
    en: "FunIQ is a leaderboard that runs public matrix-reasoning forms under the same rules and shows first-answer accuracy as a fun AI IQ number. It is not human IQ, not Mensa, and not a model's general intelligence.",
  },
  aboutWhatTitle: { ko: "무엇을 푸나", en: "What it solves" },
  aboutWhatBody: {
    ko: "문항은 epoko77-ai/ai-iq-test 의 공개 form kmiq-v1-20260826 (MIT) 168문항 전부를 씁니다. 문항 id는 data/challenge-ids.json에 고정되어 모든 모델이 같은 문항을 봅니다.",
    en: "The questions are all 168 items from the public form kmiq-v1-20260826 (MIT) by epoko77-ai/ai-iq-test. Question ids are fixed in data/challenge-ids.json so every model sees the same questions.",
  },
  aboutScoringTitle: { ko: "채점", en: "Scoring" },
  aboutScoringBody: {
    ko: "모델에게는 JSON {“answer”:“X”} (X는 A–H)를 요청합니다. 채점은 지능을 보려는 것이라 형식을 엄격히 요구하지 않습니다. JSON, <answer>X</answer>, “정답은 B”, 보기 번호 B.처럼 흔히 쓰는 답에서도 마지막 글자를 읽습니다. 글자를 전혀 못 찾으면 형식 실패입니다.",
    en: "Models are requested to answer in JSON {“answer”:“X”} (X is A–H). Scoring is about fun, so it does not demand strict formatting. It reads the last letter from JSON, <answer>X</answer>, “the answer is B”, or a choice number like B. — any common answer style. If no letter can be found at all, it is a format failure.",
  },
  aboutAutoTitle: { ko: "자동 평가", en: "Automated evaluation" },
  aboutAutoBody: {
    ko: "매일 05:00 KST (cron 0 20 * * * UTC) GitHub Action이 timelyrouter.ai 카탈로그의 아직 채점되지 않은 모델을 돌립니다. 결과는 data/leaderboard.json에 커밋되어 Vercel이 다시 빌드합니다.",
    en: "Every day at 05:00 KST (cron 0 20 * * * UTC) a GitHub Action runs models from the timelyrouter.ai catalog that have not been scored yet. Results are committed to data/leaderboard.json and Vercel rebuilds.",
  },
  aboutAutoNote: {
    ko: "timelyrouter.ai에 모델을 등록하면 다음 날 아침 자동으로 리더보드에 오릅니다.",
    en: "Register your model on timelyrouter.ai and it will appear on the leaderboard automatically the next morning.",
  },
  aboutNotTitle: { ko: "이 사이트가 아닌 것", en: "What this site is not" },
  aboutNotItems: {
    ko: [
      "인간 지능 검사, Mensa 가입 시험, 정부·채용 평가가 아닙니다.",
      "시지각, 지식, 창의성, 에이전트 능력, 안전성을 측정하지 않습니다.",
      "TigerBench의 카피나 CSS를 가져오지 않았습니다. 리더보드 톤만 참고했습니다.",
    ],
    en: [
      "It is not a human intelligence test, a Mensa entrance exam, or a government/hiring evaluation.",
      "It does not measure visual perception, knowledge, creativity, agent capability, or safety.",
      "It did not copy TigerBench's copy or CSS. Only the leaderboard tone was referenced.",
    ],
  },
  fineprint: {
    ko: "FunIQ의 AI IQ는 사람의 IQ, Mensa, LLM의 일반 지능과 무관합니다. 8지선다 첫 응답 정확도를 재미로 환산한 지수입니다.",
    en: "FunIQ's AI IQ is not related to human IQ, Mensa, or general LLM intelligence. It is an index that converts 8-choice first-answer accuracy into a fun score.",
  },
  sourceLine: {
    ko: "이 사이트는",
    en: "This site uses",
  },
  sourceLink: {
    ko: "epoko77-ai/ai-iq-test",
    en: "epoko77-ai/ai-iq-test",
  },
  sourceNote: {
    ko: "의 공개 문항을 이용했습니다. form",
    en: "'s public questions. form",
  },
  evalLine: {
    ko: "평가:",
    en: "Evaluation:",
  },
  layoutInspiration: {
    ko: "레이아웃 영감:",
    en: "Layout inspiration:",
  },
  aboutTitle: {
    ko: "FunIQ는 장난입니다. 진지한 장난.",
    en: "FunIQ is a joke. A serious joke.",
  },
  aboutIntro: {
    ko: "행렬을 푸는 재미 IQ. 공개 form 168문항, 8지선다(A–H). 사람 IQ·Mensa와 무관합니다.",
    en: "Fun IQ for solving matrices. 168 public form questions, 8-choice (A–H). Not related to human IQ or Mensa.",
  },
  aboutHowTitle: { ko: "어떻게 점수를 내나요?", en: "How is the score calculated?" },
  aboutHowBody: {
    ko: "우연 정답률 12.5%(8지선다)를 기준선 70점으로 두고, 정확도를 0.875 구간으로 올려 150점 만점으로 환산합니다. 59~150 사이로 보정합니다.",
    en: "With a 12.5% chance accuracy (8-choice) as the baseline of 70, accuracy is scaled up across the 0.875 interval to a 150 maximum. Clamped to 59–150.",
  },
  aboutLabelTitle: { ko: "점수 라벨", en: "Score labels" },
  aboutLabelNote: {
    ko: "라벨은 재미로 붙입니다. 능력을 보증하지 않습니다.",
    en: "Labels are for fun. They do not certify capability.",
  },
  aboutParseTitle: { ko: "답 파싱", en: "Answer parsing" },
  aboutParseBody: {
    ko: "JSON answer 필드, <answer> 태그, “정답은 X”류 표현, 단답 A–H를 모두 읽고 마지막 고신뢰 글자를 채택합니다. 3회 시도 후에도 A–H를 못 뽑으면 형식 실패로 기록합니다.",
    en: "We read the JSON answer field, <answer> tags, “the answer is X”-style phrases, and bare A–H answers, and take the last high-confidence letter. If we still cannot extract A–H after 3 attempts, it's recorded as a format failure.",
  },
  aboutDisclaimerTitle: { ko: "면책", en: "Disclaimer" },
  aboutDisclaimerBody: {
    ko: "이 점수는 재미를 위한 추정치입니다. 모델의 전반적인 성능, 안전성, 신뢰성을 평가하지 않습니다.",
    en: "This score is a fun estimate. It does not evaluate a model's overall performance, safety, or reliability.",
  },
  ko: { ko: "한국어", en: "Korean" },
  en: { ko: "English", en: "EN" },
} as const;

type Dict = typeof dict;
export type DictKey = keyof Dict;

const LocaleContext = createContext<{
  locale: Locale;
  setLocale: (l: Locale) => void;
}>({ locale: "ko", setLocale: () => {} });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ko");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved === "ko" || saved === "en") {
      setLocaleState(saved);
    } else {
      setLocaleState(
        navigator.language?.toLowerCase().startsWith("ko") ? "ko" : "en",
      );
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useI18n() {
  const { locale, setLocale } = useContext(LocaleContext);
  function t<K extends DictKey>(key: K): Dict[K]["ko"] {
    return dict[key][locale] as Dict[K]["ko"];
  }
  return { locale, setLocale, t };
}
