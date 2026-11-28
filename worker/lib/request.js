// Request formats (spec 007, data-model.md "Chat request"). v2 is validated strictly; the
// v1 body today's site sends is turned into a v2 request (research R11, FR-018 as amended).
// Only selection happens: no client text from a v1 system message reaches the prompt.

import { MODEL_ALLOWLIST } from './settings.js'

export const MAX_TURNS = 16
export const MAX_USER_CHARS = 2_000
export const MAX_ASSISTANT_CHARS = 8_000
export const MAX_ENTRY_IDS = 4
/** v1 bodies with `max_tokens` at or over this are the deep lane (the site sends 900 or 1,600). */
export const V1_DEEP_MIN_TOKENS = 1_200

const LANES = new Set(['fast', 'deep'])
const PROVIDERS = new Set(['zai', 'groq'])
const ROLES = new Set(['user', 'assistant'])
const CAPS = { user: MAX_USER_CHARS, assistant: MAX_ASSISTANT_CHARS }

const INVALID = Object.freeze({ ok: false, code: 'invalid_request' })
const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value)

/** Language, section, path and entry IDs, corrected against the file rather than rejected. */
function correctedContext(file, { lang, section, pathname, entryIds }) {
  const known = new Set(file.entries.map((entry) => entry.id))
  const ids = []
  for (const id of entryIds) if (known.has(id) && !ids.includes(id)) ids.push(id)
  return {
    lang: typeof lang === 'string' && Object.hasOwn(file.languages, lang) ? lang : 'en',
    section: typeof section === 'string' && file.sections.includes(section) ? section : 'hero',
    pathname: typeof pathname === 'string' && file.paths.includes(pathname) ? pathname : '/',
    entryIds: ids.slice(0, MAX_ENTRY_IDS),
  }
}

function parseV2(body, file) {
  if (body.version !== 2 || !LANES.has(body.lane) || !PROVIDERS.has(body.provider)) return INVALID
  const { turns } = body
  if (!Array.isArray(turns) || turns.length < 1 || turns.length > MAX_TURNS) return INVALID
  for (const turn of turns) {
    if (!isObject(turn) || !ROLES.has(turn.role) || typeof turn.content !== 'string') return INVALID
    if (turn.content.length > CAPS[turn.role]) return INVALID
  }
  if (turns[turns.length - 1].role !== 'user') return INVALID
  const entryIds = body.entryIds ?? []
  if (!Array.isArray(entryIds) || entryIds.length > MAX_ENTRY_IDS || !entryIds.every((id) => typeof id === 'string')) {
    return INVALID
  }
  if (body.stream !== undefined && typeof body.stream !== 'boolean') return INVALID
  return {
    ok: true,
    format: 'v2',
    request: {
      version: 2,
      turns: turns.map(({ role, content }) => ({ role, content })),
      lane: body.lane,
      provider: body.provider,
      ...correctedContext(file, { lang: body.lang, section: body.section, pathname: body.pathname, entryIds }),
      stream: body.stream ?? true,
    },
  }
}

const PAGE_CONTEXT_LINE = /^Active page context: section="([^"\n]*)", pathname="([^"\n]*)"\r?$/m
const LANGUAGE_PHRASE = /\(or ([^()\n]{1,40}) if unclear\)/
const KNOWLEDGE_HEADER = 'Retrieved portfolio knowledge:'

/** Section, path, language and entry IDs read from a v1 system message; only listed values count. */
function readV1SystemMessage(text, file) {
  const context = PAGE_CONTEXT_LINE.exec(text)
  const languageName = LANGUAGE_PHRASE.exec(text)?.[1]
  const lang = Object.keys(file.languages).find((code) => file.languages[code] === languageName)

  const entryIds = []
  const lines = text.split('\n')
  const start = lines.findIndex((line) => line.trim() === KNOWLEDGE_HEADER)
  if (start >= 0) {
    for (const line of lines.slice(start + 1)) {
      const entry = file.entries.find((candidate) => line.startsWith(`[${candidate.title}] `))
      if (entry && !entryIds.includes(entry.id)) entryIds.push(entry.id)
      if (entryIds.length === MAX_ENTRY_IDS) break
    }
  }
  return { section: context?.[1], pathname: context?.[2], lang, entryIds }
}

function providerForModel(model) {
  if (typeof model !== 'string') return null
  const name = model.trim()
  if (MODEL_ALLOWLIST.zai.has(name)) return 'zai'
  if (MODEL_ALLOWLIST.groq.has(name)) return 'groq'
  return null
}

function parseV1(body, file) {
  const provider = providerForModel(body.model)
  if (!provider) return INVALID
  const { messages } = body
  if (!Array.isArray(messages) || messages.length < 1) return INVALID
  let systemText = null
  const turns = []
  for (const message of messages) {
    if (!isObject(message) || typeof message.content !== 'string') return INVALID
    if (message.role === 'system') {
      systemText ??= message.content
      continue
    }
    if (!ROLES.has(message.role)) return INVALID
    turns.push({ role: message.role, content: message.content })
  }
  if (turns.length < 1 || turns.length > MAX_TURNS) return INVALID
  const last = turns[turns.length - 1]
  if (last.role !== 'user' || last.content.length > MAX_USER_CHARS) return INVALID
  // Earlier turns over a cap are cut to the cap (FR-018, as amended): today's input has no limit.
  for (const turn of turns.slice(0, -1)) {
    if (turn.content.length > CAPS[turn.role]) turn.content = turn.content.slice(0, CAPS[turn.role])
  }
  const tokens = Number(body.max_tokens)
  return {
    ok: true,
    format: 'v1',
    request: {
      version: 2,
      turns,
      lane: Number.isFinite(tokens) && tokens >= V1_DEEP_MIN_TOKENS ? 'deep' : 'fast',
      provider,
      ...correctedContext(file, systemText === null ? { entryIds: [] } : readV1SystemMessage(systemText, file)),
      stream: body.stream === true,
    },
  }
}

/**
 * A parsed JSON body → `{ ok: true, request, format: 'v1' | 'v2' }` or
 * `{ ok: false, code: 'invalid_request' }`. A body with `version` is v2; one with
 * `messages` and no `version` is v1.
 */
export function parseRequest(body, file) {
  if (!isObject(body)) return INVALID
  if (body.version !== undefined) return parseV2(body, file)
  if (Array.isArray(body.messages)) return parseV1(body, file)
  return INVALID
}
