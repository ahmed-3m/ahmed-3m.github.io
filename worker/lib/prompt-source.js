// Where the Worker gets the prompt file (spec 007, research R3). The parsed file is kept in
// the handler's closure (module scope in production) with the time it was loaded:
// - no fetched copy yet: wait for one fetch, up to 2 s; on any failure use the bundled
//   copy and do not try again for 60 s;
// - a fetched copy: use it at once; past 10 minutes, refresh it in the background.
// Each request does its own fetch and only the parsed object is shared, because a Worker
// may not await I/O that another request started.

export const LANGUAGE_CODES = ['en', 'de', 'fr', 'es', 'ar']
export const PROMPT_SLOTS = ['language', 'section', 'pathname', 'entries', 'links']
export const ENTRY_SLOTS = ['title', 'facts', 'links']
export const MAX_DEFAULTS = 4
export const MAX_PROMPT_FILE_BYTES = 256 * 1024
export const FETCH_TIMEOUT_MS = 2_000
export const RETRY_PAUSE_MS = 60_000
export const REFRESH_AFTER_MS = 10 * 60_000
export const PROMPT_FETCH_CF = Object.freeze({ cacheTtl: 600, cacheEverything: true })

const isString = (value) => typeof value === 'string'
const isStringArray = (value) => Array.isArray(value) && value.every(isString)
const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value)

function slotProblems(label, text, expected) {
  const counts = new Map()
  for (const match of text.matchAll(/\{\{(\w+)\}\}/g)) counts.set(match[1], (counts.get(match[1]) ?? 0) + 1)
  const problems = []
  for (const slot of expected) if (counts.get(slot) !== 1) problems.push(`${label} must contain {{${slot}}} exactly once`)
  for (const slot of counts.keys()) if (!expected.includes(slot)) problems.push(`${label} has an unknown slot {{${slot}}}`)
  return problems
}

/**
 * Rules 1 to 7 of contracts/prompt-file.md, plus the field types the composer relies on.
 * Returns one message per broken rule; empty when the file can be used.
 */
export function validatePromptFile(file) {
  if (!isObject(file)) return ['the file is not an object']
  const problems = []
  if (file.version !== 1) problems.push('version is not 1')
  if (!Number.isInteger(file.maxChars) || file.maxChars < 100) problems.push('maxChars is not a whole number of at least 100')
  if (!isString(file.links)) problems.push('links is not text')
  if (!isString(file.rules)) problems.push('rules is not text')
  else problems.push(...slotProblems('rules', file.rules, PROMPT_SLOTS))
  if (!isString(file.entryFormat)) problems.push('entryFormat is not text')
  else problems.push(...slotProblems('entryFormat', file.entryFormat, ENTRY_SLOTS))

  const entriesOk =
    Array.isArray(file.entries) &&
    file.entries.length > 0 &&
    file.entries.every(
      (entry) =>
        isObject(entry) &&
        isString(entry.id) &&
        entry.id &&
        isString(entry.title) &&
        entry.title &&
        isString(entry.facts) &&
        isStringArray(entry.links) &&
        isStringArray(entry.sections),
    )
  if (!entriesOk) problems.push('entries is not a list of { id, title, facts, links, sections }')
  const ids = entriesOk ? file.entries.map((entry) => entry.id) : []
  const titles = entriesOk ? file.entries.map((entry) => entry.title) : []
  if (new Set(ids).size !== ids.length) problems.push('entry IDs are not unique')
  if (new Set(titles).size !== titles.length) problems.push('entry titles are not unique')

  const sectionsOk = isStringArray(file.sections)
  if (!sectionsOk || !file.sections.includes('hero')) problems.push('sections must be a list that includes hero')
  if (!isStringArray(file.paths) || !file.paths.includes('/')) problems.push('paths must be a list that includes /')

  if (!isObject(file.defaults)) problems.push('defaults is not an object')
  else if (sectionsOk) {
    const idSet = new Set(ids)
    for (const key of Object.keys(file.defaults)) {
      if (!file.sections.includes(key)) problems.push(`defaults has a key that is not a section: ${key}`)
    }
    for (const section of file.sections) {
      const list = Object.hasOwn(file.defaults, section) ? file.defaults[section] : undefined
      if (!isStringArray(list)) {
        problems.push(`section ${section} has no defaults`)
        continue
      }
      if (list.length > MAX_DEFAULTS) problems.push(`defaults for ${section} list more than ${MAX_DEFAULTS} IDs`)
      for (const id of list) if (!idSet.has(id)) problems.push(`defaults for ${section} name an unknown entry ${id}`)
    }
  }

  if (!isObject(file.languages)) problems.push('languages is not an object')
  else {
    for (const code of LANGUAGE_CODES) if (!isString(file.languages[code]) || !file.languages[code]) problems.push(`languages is missing ${code}`)
    for (const key of Object.keys(file.languages)) if (!LANGUAGE_CODES.includes(key)) problems.push(`languages has an unknown key ${key}`)
  }
  return problems
}

/** Reads a response body as text, failing past `limit` bytes. */
async function readLimited(response, limit) {
  if (Number(response.headers.get('Content-Length')) > limit) throw new Error('prompt file too large')
  if (!response.body) return ''
  const reader = response.body.getReader()
  const chunks = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > limit) {
      await reader.cancel().catch(() => {})
      throw new Error('prompt file too large')
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(bytes)
}

/**
 * @param {{ bundled: object, fetchImpl: typeof fetch, now?: () => number, timeoutMs?: number }} options
 * @returns {{ get(args: { url: string, ctx?: { waitUntil?(p: Promise<unknown>): void } }): Promise<{ file: object, source: 'fetched' | 'cached' | 'bundled' }> }}
 */
export function createPromptSource({ bundled, fetchImpl, now = Date.now, timeoutMs = FETCH_TIMEOUT_MS }) {
  const bundledProblems = validatePromptFile(bundled)
  if (bundledProblems.length) throw new Error(`The bundled prompt file is invalid: ${bundledProblems.join('; ')}`)

  let current = null // { file, loadedAt }
  let pausedUntil = 0
  let nextRefreshAt = 0

  async function fetchFile(url) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetchImpl(url, { cf: { ...PROMPT_FETCH_CF }, signal: controller.signal })
      if (response.status !== 200) {
        await response.body?.cancel().catch(() => {})
        throw new Error(`prompt file status ${response.status}`)
      }
      const file = JSON.parse(await readLimited(response, MAX_PROMPT_FILE_BYTES))
      if (validatePromptFile(file).length) throw new Error('prompt file failed the shape check')
      return file
    } finally {
      clearTimeout(timer)
    }
  }

  async function refresh(url) {
    try {
      current = { file: await fetchFile(url), loadedAt: now() }
      return true
    } catch {
      pausedUntil = now() + RETRY_PAUSE_MS
      return false
    }
  }

  return {
    async get({ url, ctx } = {}) {
      if (current) {
        const time = now()
        if (time - current.loadedAt >= REFRESH_AFTER_MS && time >= nextRefreshAt && time >= pausedUntil) {
          // At most one background refresh a minute, even if one never settles.
          nextRefreshAt = time + RETRY_PAUSE_MS
          const pending = refresh(url)
          if (typeof ctx?.waitUntil === 'function') ctx.waitUntil(pending)
        }
        return { file: current.file, source: 'cached' }
      }
      if (now() < pausedUntil) return { file: bundled, source: 'bundled' }
      return (await refresh(url)) ? { file: current.file, source: 'fetched' } : { file: bundled, source: 'bundled' }
    },
  }
}
