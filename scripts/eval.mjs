#!/usr/bin/env node
/**
 * FunIQ challenge eval. Node built-in fetch only — no extra deps.
 * Never prints TIMELYROUTER_API_KEY.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.timelyrouter.ai";
const TIMEOUT_MS = 90_000;
const CONCURRENCY = 3;
const RETRIES = 2;
const MAX_COMPLETION_TOKENS = 2048;
const PREFERRED = [
  "solar-mini",
  "gpt-5.4-nano",
  "claude-haiku-4-5",
  "gemini-3.5-flash-lite",
];

const FORMAT_SYSTEM = [
  "You are taking a multiple-choice test.",
  "Reply with exactly one XML tag and no other text: <answer>X</answer>",
  "where X is a single letter A, B, C, D, E, F, G, or H.",
  "Do not copy the option body. Do not explain.",
].join(" ");

const FORMAT_SUFFIX = [
  "",
  "최종 출력은 아래 한 줄만. 보기 내용을 복사하지 마라.",
  "<answer>X</answer>",
  "X는 A,B,C,D,E,F,G,H 중 정답 한 글자.",
].join("\n");

function funIqScore(accuracy) {
  if (!(accuracy >= 0 && accuracy <= 1)) {
    throw new Error("accuracy must be between 0 and 1");
  }
  const raw = 70 + (80 * (accuracy - 0.125)) / 0.875;
  return Math.max(59, Math.min(150, Math.floor(raw + 0.5)));
}

function funIqLabel(score) {
  if (score >= 135) return "패턴 천재";
  if (score >= 125) return "매트릭스 마스터";
  if (score >= 110) return "추론 스페셜리스트";
  if (score >= 90) return "규칙 해독자";
  if (score >= 70) return "패턴 탐색자";
  return "워밍업 중";
}

function parseAnswer(content) {
  if (typeof content !== "string" || !content) return null;
  const matches = [...content.matchAll(/<answer>\s*([A-H])\s*<\/answer>/gi)];
  return matches.length === 1 ? matches[0][1].toUpperCase() : null;
}

function parseProviderName(rawName, fallbackId) {
  const trimmed = String(rawName || fallbackId).trim();
  const colon = trimmed.indexOf(":");
  if (colon > 0) {
    return {
      provider: trimmed.slice(0, colon).trim(),
      name: trimmed.slice(colon + 1).trim() || fallbackId,
    };
  }
  return { name: trimmed, provider: "Unknown" };
}

function loadApiKey() {
  if (process.env.TIMELYROUTER_API_KEY) {
    return process.env.TIMELYROUTER_API_KEY.trim();
  }
  for (const file of ["/home/box/.env", path.join(ROOT, ".env"), path.join(ROOT, ".env.local")]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^TIMELYROUTER_API_KEY\s*=\s*(.*)$/);
      if (!m) continue;
      let v = m[1].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (v) return v;
    }
  }
  return "";
}

function parseArgs(argv) {
  const models = [];
  let limit = null;
  let force = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") force = true;
    else if (a.startsWith("--model=")) models.push(a.slice(8));
    else if (a === "--model") models.push(argv[++i]);
    else if (a.startsWith("--limit=")) limit = Number(a.slice(8));
    else if (a === "--limit") limit = Number(argv[++i]);
  }
  if (limit != null && (!Number.isFinite(limit) || limit < 0)) {
    throw new Error("--limit must be a non-negative number");
  }
  return { models, limit, force };
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, obj) {
  fs.writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`);
}

function isServable(health, model) {
  if (model && typeof model.servable === "boolean") return model.servable === true;
  const id = typeof model === "string" ? model : model && model.id;
  if (health && typeof health === "object") {
    if (id && typeof health[id] === "boolean") return health[id];
    const models = health.models || health.data;
    if (Array.isArray(models)) {
      const hit = models.find((x) => x && x.id === id);
      if (hit && typeof hit.servable === "boolean") return hit.servable;
    }
  }
  return true;
}

function extractContent(data) {
  const msg = data?.choices?.[0]?.message ?? {};
  let c = msg.content;
  if (Array.isArray(c)) {
    c = c.map((p) => (typeof p === "string" ? p : p?.text ?? p?.content ?? "")).join("");
  }
  if (!c) c = msg.reasoning_content || "";
  return String(c || "");
}

function tokenCount(usage) {
  if (!usage || typeof usage !== "object") return 0;
  if (typeof usage.total_tokens === "number") return usage.total_tokens;
  const p = usage.prompt_tokens ?? usage.input_tokens ?? 0;
  const o = usage.completion_tokens ?? usage.output_tokens ?? 0;
  return (Number(p) || 0) + (Number(o) || 0);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url, { key, method = "GET", body, timeout = TIMEOUT_MS } = {}) {
  const headers = { Accept: "application/json" };
  if (key) headers.Authorization = `Bearer ${key}`;
  if (body) headers["Content-Type"] = "application/json";
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeout),
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { res, text, json };
}

function shouldRetry(err) {
  const s = err?.status;
  return s === 429 || (s >= 500 && s <= 599);
}

async function chatOnce(key, model, prompt) {
  const start = Date.now();
  try {
    const { res, text, json } = await fetchJson(`${API}/v1/chat/completions`, {
      key,
      method: "POST",
      body: {
        model,
        messages: [
          { role: "system", content: FORMAT_SYSTEM },
          { role: "user", content: `${prompt}${FORMAT_SUFFIX}` },
        ],
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        temperature: 0,
      },
    });
    const ms = Date.now() - start;
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      err.ms = ms;
      throw err;
    }
    const finish = json?.choices?.[0]?.finish_reason;
    if (finish === "refusal") {
      const err = new Error("refusal");
      err.status = 0;
      err.ms = ms;
      throw err;
    }
    return { content: extractContent(json), tokens: tokenCount(json?.usage), ms };
  } catch (e) {
    if (e.name === "TimeoutError" || e.name === "AbortError") {
      const err = new Error(`timeout ${TIMEOUT_MS / 1000}s`);
      err.status = 0;
      err.ms = Date.now() - start;
      throw err;
    }
    if (e.ms == null) e.ms = Date.now() - start;
    throw e;
  }
}

async function chatWithRetry(key, model, prompt) {
  let last;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try {
      return await chatOnce(key, model, prompt);
    } catch (e) {
      last = e;
      if (attempt < RETRIES && shouldRetry(e)) {
        const wait = 1500 * 2 ** attempt;
        console.log(`  retry ${attempt + 1} after HTTP ${e.status} (${wait}ms)`);
        await sleep(wait);
        continue;
      }
      throw e;
    }
  }
  throw last;
}

async function pool(items, worker, concurrency) {
  const results = new Array(items.length);
  let i = 0;
  async function drain() {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      results[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, drain));
  return results;
}

async function listModels(key) {
  const { res, json, text } = await fetchJson(`${API}/v1/models`, { key });
  if (!res.ok) {
    throw new Error(`models HTTP ${res.status}`);
  }
  const data = Array.isArray(json) ? json : json?.data;
  if (!Array.isArray(data)) throw new Error("models: unexpected response shape");
  return data;
}

async function loadHealth() {
  try {
    const { res, json } = await fetchJson(`${API}/health`, { timeout: 20_000 });
    const n = json && typeof json === "object" ? Object.keys(json).length : 0;
    console.log(`health ${res.status} flags=${n}`);
    return res.ok && json && typeof json === "object" ? json : {};
  } catch (e) {
    console.log(`health error: ${e.message}`);
    return {};
  }
}

function upsertResult(board, result) {
  const i = board.results.findIndex((r) => r.id === result.id);
  if (i >= 0) board.results[i] = result;
  else board.results.push(result);
  board.results.sort((a, b) => {
    if (b.ai_iq !== a.ai_iq) return b.ai_iq - a.ai_iq;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return String(a.id).localeCompare(String(b.id));
  });
  board.updated_at = new Date().toISOString();
  board.items = 28;
  board.suite = "challenge";
  if (!board.scale) board.scale = "AI-IQ-FUN-v1";
}

async function evalModel(key, model, problems) {
  const id = model.id;
  const { name, provider } = parseProviderName(model.name || model.id, model.id);
  console.log(`\n> ${id} (${provider}: ${name})  ${problems.length} items`);
  const rows = await pool(
    problems,
    async (p, idx) => {
      const tag = String(idx + 1).padStart(2, "0");
      try {
        const out = await chatWithRetry(key, id, p.prompt);
        const parsed = parseAnswer(out.content);
        const correct = parsed === String(p.answer).toUpperCase();
        const formatFail = parsed == null;
        console.log(
          `  [${tag}/${problems.length}] ${p.family} ${formatFail ? "FMT" : parsed}${correct ? " +" : " -"} ${out.ms}ms`,
        );
        return {
          family: p.family,
          correct,
          formatFail,
          ms: out.ms,
          tokens: out.tokens,
          ok: true,
        };
      } catch (e) {
        console.log(`  [${tag}/${problems.length}] ${p.family} ERR ${e.message}`);
        return {
          family: p.family,
          correct: false,
          formatFail: false,
          ms: e.ms || 0,
          tokens: 0,
          ok: false,
        };
      }
    },
    CONCURRENCY,
  );

  const total = rows.length;
  const correct = rows.filter((r) => r.correct).length;
  const format_failures = rows.filter((r) => r.formatFail).length;
  const accuracy = total ? correct / total : 0;
  const avg_ms = total ? Math.round(rows.reduce((s, r) => s + (r.ms || 0), 0) / total) : 0;
  const tokens = rows.reduce((s, r) => s + (r.tokens || 0), 0);
  const family = {};
  for (const r of rows) {
    if (!family[r.family]) family[r.family] = { correct: 0, total: 0 };
    family[r.family].total += 1;
    if (r.correct) family[r.family].correct += 1;
  }
  const ai_iq = funIqScore(accuracy);
  const result = {
    id,
    name,
    provider,
    ai_iq,
    label: funIqLabel(ai_iq),
    correct,
    total,
    accuracy: Math.round(accuracy * 10000) / 10000,
    format_failures,
    avg_ms,
    tokens,
    family,
    evaluated_at: new Date().toISOString(),
    ok: rows.every((r) => r.ok),
  };
  console.log(
    `  -> AI IQ ${result.ai_iq} ${result.label}  ${correct}/${total}  fmt=${format_failures}  ok=${result.ok}`,
  );
  return result;
}

function preferSort(models) {
  return [...models].sort((a, b) => {
    const ia = PREFERRED.indexOf(a.id);
    const ib = PREFERRED.indexOf(b.id);
    const ra = ia === -1 ? 1000 : ia;
    const rb = ib === -1 ? 1000 : ib;
    if (ra !== rb) return ra - rb;
    return String(a.id).localeCompare(String(b.id));
  });
}

async function main() {
  const { models: only, limit, force } = parseArgs(process.argv.slice(2));
  const key = loadApiKey();
  if (!key) {
    console.log("TIMELYROUTER_API_KEY missing; skip eval");
    return;
  }
  const problemsFile = readJson(path.join(ROOT, "data/problems.json"));
  const challenge = readJson(path.join(ROOT, "data/challenge-ids.json"));
  const boardPath = path.join(ROOT, "data/leaderboard.json");
  const board = readJson(boardPath);
  if (!Array.isArray(board.results)) board.results = [];

  const allProblems = problemsFile.problems || problemsFile;
  const byId = new Map(allProblems.map((p) => [p.id, p]));
  const ordered = challenge.ids.map((id) => byId.get(id)).filter(Boolean);
  if (ordered.length !== challenge.ids.length) {
    console.log(`warn: loaded ${ordered.length} problems, expected ${challenge.ids.length}`);
  }

  const health = await loadHealth();
  const catalog = await listModels(key);
  console.log(`catalog ${catalog.length} models`);

  let targets;
  if (only.length) {
    targets = [];
    for (const id of only) {
      const found = catalog.find((m) => m.id === id);
      if (!found) {
        console.log(`model not in catalog: ${id} — evaluating anyway`);
        targets.push({ id, name: id });
      } else {
        targets.push(found);
      }
    }
  } else {
    const have = new Set(board.results.map((r) => r.id));
    const missing = catalog.filter((m) => m.id && isServable(health, m) && (force || !have.has(m.id)));
    for (const m of catalog) {
      if (m.id && !isServable(health, m)) console.log(`skip ${m.id} (not servable)`);
    }
    targets = preferSort(missing);
    if (limit != null) targets = targets.slice(0, limit);
  }

  if (targets.length === 0) {
    console.log("nothing to evaluate");
    return;
  }
  console.log(`evaluating ${targets.length}: ${targets.map((m) => m.id).join(", ")}`);

  const errors = [];
  for (const m of targets) {
    try {
      const result = await evalModel(key, m, ordered);
      upsertResult(board, result);
      writeJson(boardPath, board);
    } catch (e) {
      console.log(`model ${m.id} failed: ${e.message}`);
      errors.push(m.id);
    }
  }
  writeJson(boardPath, board);
  console.log(`\ndone. results=${board.results.length} updated_at=${board.updated_at}`);
  if (errors.length) {
    console.log(`errors: ${errors.join(", ")}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
