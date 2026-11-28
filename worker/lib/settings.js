// Worker settings with their defaults (spec 007, data-model.md "Worker settings").
// Every value comes from a `[vars]` entry or falls back to its default: a missing or
// invalid number uses the default, and a model outside the allowlist uses the default.

/** The models the Worker may call, per provider. */
export const MODEL_ALLOWLIST = {
  zai: new Set(['glm-5.4', 'glm-5.3', 'glm-5-turbo', 'glm-5.3-flash']),
  groq: new Set(['openai/gpt-oss-20b']),
}

const REASONING_EFFORTS = new Set(['low', 'medium', 'high'])

export const DEFAULT_SETTINGS = Object.freeze({
  promptUrl: 'https://ahmed-3m.github.io/genie/prompt.json',
  allowLocalhost: false,
  zaiFastModel: 'glm-5.3-flash',
  zaiDeepModel: 'glm-5.4',
  groqModel: 'openai/gpt-oss-20b',
  fastMaxTokens: 900,
  deepMaxTokens: 1600,
  temperature: 0.3,
  zaiReasoningEffort: 'low',
  // Budgets (research R6): requests per provider per fixed UTC window.
  zaiCap5h: 100,
  zaiCapDay: 300,
  groqCap5h: 200,
  groqCapDay: 600,
  // Upstream deadlines (research R10), inside the site's own 20 s and 60 s.
  firstByteMs: 18_000,
  totalMs: 58_000,
  // The budget call's timeout. Conservative until the latency is measured (T038, T042).
  budgetTimeoutMs: 2_000,
})

/** A positive whole number, or the fallback. `Number('')` is 0, so empty text is rejected first. */
function positiveInteger(value, fallback) {
  if (typeof value === 'number') return Number.isInteger(value) && value > 0 ? value : fallback
  if (typeof value !== 'string' || !value.trim()) return fallback
  const number = Number(value.trim())
  return Number.isInteger(number) && number > 0 ? number : fallback
}

function temperature(value, fallback) {
  const text = typeof value === 'number' ? String(value) : value
  if (typeof text !== 'string' || !text.trim()) return fallback
  const number = Number(text.trim())
  return Number.isFinite(number) && number >= 0 && number <= 2 ? number : fallback
}

function model(provider, value, fallback) {
  return typeof value === 'string' && MODEL_ALLOWLIST[provider].has(value.trim()) ? value.trim() : fallback
}

function httpsUrl(value, fallback) {
  if (typeof value !== 'string' || !value.trim()) return fallback
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' ? url.href : fallback
  } catch {
    return fallback
  }
}

/** Reads the settings from the Worker's `env`. */
export function readSettings(env = {}) {
  const d = DEFAULT_SETTINGS
  return {
    promptUrl: httpsUrl(env.PROMPT_URL, d.promptUrl),
    allowLocalhost: env.ALLOW_LOCALHOST === 'true',
    zaiFastModel: model('zai', env.ZAI_FAST_MODEL, d.zaiFastModel),
    zaiDeepModel: model('zai', env.ZAI_DEEP_MODEL, d.zaiDeepModel),
    groqModel: model('groq', env.GROQ_MODEL, d.groqModel),
    fastMaxTokens: positiveInteger(env.FAST_MAX_TOKENS, d.fastMaxTokens),
    deepMaxTokens: positiveInteger(env.DEEP_MAX_TOKENS, d.deepMaxTokens),
    temperature: temperature(env.TEMPERATURE, d.temperature),
    zaiReasoningEffort: REASONING_EFFORTS.has(env.ZAI_REASONING_EFFORT) ? env.ZAI_REASONING_EFFORT : d.zaiReasoningEffort,
    zaiCap5h: positiveInteger(env.ZAI_CAP_5H, d.zaiCap5h),
    zaiCapDay: positiveInteger(env.ZAI_CAP_DAY, d.zaiCapDay),
    groqCap5h: positiveInteger(env.GROQ_CAP_5H, d.groqCap5h),
    groqCapDay: positiveInteger(env.GROQ_CAP_DAY, d.groqCapDay),
    firstByteMs: positiveInteger(env.FIRST_BYTE_MS, d.firstByteMs),
    totalMs: positiveInteger(env.TOTAL_MS, d.totalMs),
    budgetTimeoutMs: positiveInteger(env.BUDGET_TIMEOUT_MS, d.budgetTimeoutMs),
  }
}

/** The caps for one provider, as the budget object reads them. */
export function capsFor(settings, provider) {
  return provider === 'groq'
    ? { fiveHour: settings.groqCap5h, day: settings.groqCapDay }
    : { fiveHour: settings.zaiCap5h, day: settings.zaiCapDay }
}

/** True when the stop switch is on (research R7). */
export function isStopped(env = {}) {
  return typeof env.GENIE_STOP === 'string' && env.GENIE_STOP.trim().toLowerCase() === 'on'
}

/** The model for a provider and lane. */
export function modelFor(settings, provider, lane) {
  if (provider === 'groq') return settings.groqModel
  return lane === 'deep' ? settings.zaiDeepModel : settings.zaiFastModel
}
