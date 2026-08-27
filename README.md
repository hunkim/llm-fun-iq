# FunIQ

같은 문항. 같은 규칙. 재미로 환산한 AI IQ.

공개 행렬추론 form을 같은 규칙으로 풀리고, 첫 응답 정확도를 재미용 AI IQ로 보여 줍니다.

면책: 사람의 IQ / Mensa / LLM 일반 지능과 무관. 8지선다 첫 응답 정확도를
half_up(70 + 80 * (accuracy - 0.125) / 0.875) 로 환산 (무작위 70, 만점 150, 표시 59-150).

timelyrouter.ai에 모델을 등록하면 다음 날 아침 자동으로 리더보드에 오릅니다.

## 한눈에
- 문항: epoko77-ai/ai-iq-test form kmiq-v1-20260826 (MIT, 168문항)
- 스위트: 챌린지 28문항, data/challenge-ids.json 고정
- 채점: 정확히 하나의 answer 태그 (A-H). 그 외는 형식 실패
- 평가: timelyrouter.ai  /  스케일: AI-IQ-FUN-v1

정적보내기(output export)라서 사이트는 커밋된 data/leaderboard.json만 읽습니다.
일일 평가가 보드를 커밋하면 재배포됩니다.

## 문항 출처

문항과 AI-IQ-FUN-v1 공식은 epoko77-ai/ai-iq-test
(https://github.com/epoko77-ai/ai-iq-test , MIT, form kmiq-v1-20260826).
고지는 NOTICE.

FunIQ 코드도 MIT. 재미용 벤치마크이며 공식 지능 검사가 아닙니다.

## 사이트

패키지 설치 후 next dev 또는 next build.
out/ 생성. 서버 시크릿 불필요. 리더보드는 data/leaderboard.json 을 빌드 타임 import.

## 평가

.env.example 을 복사해 키를 넣고 scripts/eval.mjs 실행.
--force 로 전부 다시, --model=id 로 한 모델만.
동시성 3, 타임아웃 90초, 5xx/429 재시도 2회. 키는 로그에 안 찍힘.

## 매일 아침

.github/workflows/daily-eval.yml — UTC 0 20 * * * (KST 05:00).
시크릿이 없으면 건너뜀.

레이아웃 영감: tigerbench.vercel.app (카피/CSS 복제 아님)
평가 라우팅: timelyrouter.ai
