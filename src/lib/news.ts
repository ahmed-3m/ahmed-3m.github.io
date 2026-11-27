import type { Language } from '@/lib/i18n-config'

export type NewsCategory = 'ai' | 'agentic'

/** Shape shared by every localized text field (take, headline). */
type LocalizedText = { en: string } & Partial<Record<Exclude<Language, 'en'>, string>>
export type NewsTake = LocalizedText
export type NewsHeadline = LocalizedText

export type NewsItem = {
  id: string
  date: string
  category: NewsCategory
  headline: NewsHeadline
  source: string
  url: string
  take: NewsTake
  tags?: readonly string[]
}

export const NEWS_LIMITS = {
  maxCatalog: 200,
  maxDelta: 4,
  maxId: 80,
  maxHeadline: 300,
  maxSource: 80,
  maxUrl: 500,
  maxTake: 2000,
  maxTags: 6,
  maxTag: 40,
} as const

const ITEM_KEYS = new Set(['id', 'date', 'category', 'headline', 'source', 'url', 'take', 'tags'])
const LOCALIZED_KEYS = new Set(['en', 'de', 'fr', 'es', 'ar'])
const LOCALIZED_LOCALES = ['de', 'fr', 'es', 'ar'] as const
const ALL_LOCALES = ['en', 'de', 'fr', 'es', 'ar'] as const
const ID_RE = /^[a-z0-9-]+$/
const TAG_RE = /^[a-z0-9-]+$/
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export const TRACKING_QUERY_PARAMS = new Set([
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'igshid',
  'ref_src',
  '_hsenc',
  '_hsmi',
  'mkt_tok',
])

export const TAG_SYNONYMS: Record<string, string> = {
  'agent-governance': 'governance',
  'agentic-coding': 'coding-agents',
  'agent-memory': 'memory',
  'agent-reliability': 'reliability',
  'agent-eval': 'evaluation',
  'agent-evals': 'evaluation',
  safeguards: 'guardrails',
  harness: 'agent-harness',
  security: 'agent-security',
  safety: 'ai-safety',
}

export function stripTrackingParams(url: string): string {
  const parsed = new URL(url)
  for (const key of [...parsed.searchParams.keys()]) {
    const lower = key.toLowerCase()
    if (lower.startsWith('utm_') || TRACKING_QUERY_PARAMS.has(lower)) {
      parsed.searchParams.delete(key)
    }
  }
  return parsed.toString()
}

export function canonicalNewsUrl(url: string): string {
  const parsed = new URL(stripTrackingParams(url))
  parsed.hostname = parsed.hostname.toLowerCase()
  parsed.hash = ''
  if (
    (parsed.protocol === 'https:' && parsed.port === '443') ||
    (parsed.protocol === 'http:' && parsed.port === '80')
  ) {
    parsed.port = ''
  }
  parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/'
  return parsed.toString()
}

export function normalizeIncomingTags(tags: readonly string[]): readonly string[] {
  const normalized: string[] = []
  const seen = new Set<string>()
  for (const raw of tags) {
    const mapped = Object.hasOwn(TAG_SYNONYMS, raw) ? TAG_SYNONYMS[raw] : raw
    if (seen.has(mapped)) continue
    seen.add(mapped)
    normalized.push(mapped)
  }
  return normalized
}

export type DroppedNewsDeltaItem = {
  id?: string
  url?: string
  reason: string
  kind: 'duplicate' | 'invalid'
}

export type SanitizedNewsDeltaResult = {
  accepted: NewsItem[]
  dropped: DroppedNewsDeltaItem[]
  nextCatalog: readonly NewsItem[]
}

/**
 * Per-item intake filter for incoming automated news deltas:
 * - Enforces https:, stripped tracking params, normalized tags, and all 5 locales
 *   (`en`, `de`, `fr`, `es`, `ar`) on both `headline` and `take`.
 * - Drops duplicate/malformed items individually instead of discarding valid siblings.
 * - Treats `{ items: [] }` or an all-duplicate batch as a healthy no-op, while failing
 *   loudly if a non-empty delta contains only invalid (non-duplicate) entries.
 */
export function sanitizeIncomingDelta(
  existing: readonly NewsItem[],
  delta: unknown,
  now?: Date,
): SanitizedNewsDeltaResult {
  if (!isPlainObject(delta)) {
    throw new Error('news delta must be a plain object')
  }
  const keys = Object.keys(delta)
  if (keys.length !== 1 || keys[0] !== 'items') {
    throw new Error('news delta must have exactly one key: items')
  }
  const rawItems = delta.items
  if (!Array.isArray(rawItems)) {
    throw new Error('news delta items must be an array')
  }
  if (rawItems.length > NEWS_LIMITS.maxDelta) {
    throw new Error(`news delta exceeds maxDelta (${NEWS_LIMITS.maxDelta})`)
  }
  if (rawItems.length === 0) {
    return { accepted: [], dropped: [], nextCatalog: existing }
  }

  const today = utcYmd(now ?? new Date())
  const existingIds = new Set(existing.map((item) => item.id))
  const existingUrls = new Set(existing.map((item) => canonicalNewsUrl(item.url)))
  const accepted: NewsItem[] = []
  const dropped: DroppedNewsDeltaItem[] = []

  for (let i = 0; i < rawItems.length; i++) {
    const raw = rawItems[i]
    const hintId = isPlainObject(raw) && typeof raw.id === 'string' ? raw.id : undefined
    const hintUrl = isPlainObject(raw) && typeof raw.url === 'string' ? raw.url : undefined

    try {
      if (!isPlainObject(raw)) {
        throw new Error(`news item [${i}]: must be a plain object`)
      }
      if (typeof raw.headline === 'string') {
        throw new Error(`news item "${hintId ?? `(index ${i})`}": incoming headline must localize all 5 languages`)
      }

      const parsed = parseNewsItem(raw, today, i, false)
      const parsedUrl = new URL(parsed.url)
      if (parsedUrl.protocol !== 'https:') {
        throw new Error(`news item "${parsed.id}": incoming url must use https:`)
      }
      for (const locale of ALL_LOCALES) {
        if (!parsed.headline[locale]?.trim()) {
          throw new Error(`news item "${parsed.id}": missing headline.${locale}`)
        }
        if (!parsed.take[locale]?.trim()) {
          throw new Error(`news item "${parsed.id}": missing take.${locale}`)
        }
      }

      const cleanedUrl = stripTrackingParams(parsed.url)
      const canonUrl = canonicalNewsUrl(cleanedUrl)

      if (existingIds.has(parsed.id)) {
        dropped.push({
          id: parsed.id,
          url: cleanedUrl,
          kind: 'duplicate',
          reason: `id "${parsed.id}" already exists`,
        })
        continue
      }
      if (existingUrls.has(canonUrl)) {
        dropped.push({
          id: parsed.id,
          url: cleanedUrl,
          kind: 'duplicate',
          reason: `url "${cleanedUrl}" already exists`,
        })
        continue
      }

      const normalizedTags = parsed.tags ? normalizeIncomingTags(parsed.tags) : undefined
      const normalizedItem: NewsItem =
        normalizedTags && normalizedTags.length > 0
          ? { ...parsed, url: cleanedUrl, tags: normalizedTags }
          : {
              id: parsed.id,
              date: parsed.date,
              category: parsed.category,
              headline: parsed.headline,
              source: parsed.source,
              url: cleanedUrl,
              take: parsed.take,
            }

      existingIds.add(normalizedItem.id)
      existingUrls.add(canonUrl)
      accepted.push(normalizedItem)
    } catch (err) {
      dropped.push({
        id: hintId,
        url: hintUrl,
        kind: 'invalid',
        reason: err instanceof Error ? err.message : String(err),
      })
    }
  }

  if (accepted.length === 0) {
    const invalidDrops = dropped.filter((d) => d.kind === 'invalid')
    if (invalidDrops.length > 0) {
      throw new Error(
        `all ${rawItems.length} incoming delta item(s) failed intake checks: ${invalidDrops
          .map((d) => d.reason)
          .join('; ')}`,
      )
    }
    return { accepted: [], dropped, nextCatalog: existing }
  }

  const nextCatalog = parseNewsItems(evictOldest([...existing, ...accepted]), now)
  return { accepted, dropped, nextCatalog }
}

export function parseNewsItems(
  value: unknown,
  now?: Date,
  options?: { allowFutureDates?: boolean },
): readonly NewsItem[] {
  if (!Array.isArray(value)) {
    throw new Error('news catalog must be an array')
  }
  if (value.length > NEWS_LIMITS.maxCatalog) {
    throw new Error(`news catalog exceeds maxCatalog (${NEWS_LIMITS.maxCatalog})`)
  }

  const allowFutureDates = options?.allowFutureDates === true
  const today = utcYmd(now ?? new Date())
  const items: NewsItem[] = []
  const ids = new Set<string>()
  const urls = new Set<string>()

  for (let i = 0; i < value.length; i++) {
    const item = parseNewsItem(value[i], today, i, allowFutureDates)
    if (ids.has(item.id)) {
      throw new Error(`news item "${item.id}": duplicate id`)
    }
    const canon = canonicalNewsUrl(item.url)
    if (urls.has(canon)) {
      throw new Error(`news item "${item.id}": duplicate url after canonicalization`)
    }
    ids.add(item.id)
    urls.add(canon)
    items.push(item)
  }

  return items
}

export function applyNewsDelta(
  existing: readonly NewsItem[],
  delta: unknown,
  now?: Date,
): readonly NewsItem[] {
  if (!isPlainObject(delta)) {
    throw new Error('news delta must be a plain object')
  }
  const keys = Object.keys(delta)
  if (keys.length !== 1 || keys[0] !== 'items') {
    throw new Error('news delta must have exactly one key: items')
  }
  const items = delta.items
  if (!Array.isArray(items)) {
    throw new Error('news delta items must be an array')
  }
  if (items.length > NEWS_LIMITS.maxDelta) {
    throw new Error(`news delta exceeds maxDelta (${NEWS_LIMITS.maxDelta})`)
  }

  const parsedDelta = parseNewsItems(items, now)
  const existingIds = new Set(existing.map((item) => item.id))
  const existingUrls = new Set(existing.map((item) => canonicalNewsUrl(item.url)))

  for (const item of parsedDelta) {
    if (existingIds.has(item.id)) {
      throw new Error(`news item "${item.id}": id already exists`)
    }
    const canon = canonicalNewsUrl(item.url)
    if (existingUrls.has(canon)) {
      throw new Error(`news item "${item.id}": url already exists`)
    }
  }

  return parseNewsItems(evictOldest([...existing, ...parsedDelta]), now)
}

/**
 * Rolling window: once the catalog is full, drop the oldest-dated items
 * (earliest-appended first on ties) so new deltas keep landing instead of
 * failing every run. Append order of the kept items is preserved — sorting
 * by date is a read-time concern.
 */
function evictOldest(items: readonly NewsItem[]): readonly NewsItem[] {
  const overflow = items.length - NEWS_LIMITS.maxCatalog
  if (overflow <= 0) return items
  const evicted = new Set(
    items
      .map((item, index) => ({ date: item.date, index }))
      .sort((a, b) => a.date.localeCompare(b.date) || a.index - b.index)
      .slice(0, overflow)
      .map(({ index }) => index),
  )
  return items.filter((_, index) => !evicted.has(index))
}

function parseNewsItem(
  value: unknown,
  today: string,
  index: number,
  allowFutureDates: boolean,
): NewsItem {
  if (!isPlainObject(value)) {
    throw new Error(`news item [${index}]: must be a plain object`)
  }

  const where = `news item "${typeof value.id === 'string' ? value.id : `(index ${index})`}"`
  for (const key of Object.keys(value)) {
    if (!ITEM_KEYS.has(key)) {
      throw new Error(`${where}: unknown field "${key}"`)
    }
  }

  const id = requiredString(value.id, 'id', NEWS_LIMITS.maxId, where)
  if (!ID_RE.test(id)) {
    throw new Error(`${where}: id must be non-empty kebab-case`)
  }

  const date = requiredString(value.date, 'date', 10, where)
  if (!isRealCalendarDate(date)) {
    throw new Error(`${where}: date must be a real calendar ISO YYYY-MM-DD`)
  }
  if (!allowFutureDates && date > today) {
    throw new Error(`${where}: date ${date} is in the future (today UTC is ${today})`)
  }

  const category = parseCategory(value.category, where)
  const headline = parseHeadline(value.headline, where)
  const source = requiredString(value.source, 'source', NEWS_LIMITS.maxSource, where)
  const url = parseHttpUrl(value.url, where)
  const take = parseTake(value.take, where)

  if (!Object.prototype.hasOwnProperty.call(value, 'tags')) {
    return { id, date, category, headline, source, url, take }
  }
  return { id, date, category, headline, source, url, take, tags: parseTags(value.tags, where) }
}

function parseCategory(value: unknown, where: string): NewsCategory {
  if (value === 'ai' || value === 'agentic') return value
  throw new Error(`${where}: category must be 'ai' or 'agentic'`)
}

function parseHttpUrl(value: unknown, where: string): string {
  const url = requiredString(value, 'url', NEWS_LIMITS.maxUrl, where)
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error(`${where}: url is not a valid absolute URL`)
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`${where}: url must be http: or https:`)
  }
  return url
}

function parseHeadline(value: unknown, where: string): NewsHeadline {
  // A bare string is accepted as the English headline — the daily delta must send the
  // localized object, but a string must not fail the pipeline.
  if (typeof value === 'string') {
    return { en: requiredString(value, 'headline', NEWS_LIMITS.maxHeadline, where) }
  }
  return parseLocalizedText(value, 'headline', NEWS_LIMITS.maxHeadline, where)
}

function parseTake(value: unknown, where: string): NewsTake {
  return parseLocalizedText(value, 'take', NEWS_LIMITS.maxTake, where)
}

function parseLocalizedText(value: unknown, field: string, max: number, where: string): LocalizedText {
  if (!isPlainObject(value)) {
    throw new Error(`${where}: ${field} must be a plain object`)
  }
  for (const key of Object.keys(value)) {
    if (!LOCALIZED_KEYS.has(key)) {
      throw new Error(`${where}: unknown ${field} locale "${key}"`)
    }
  }
  const result: LocalizedText = {
    en: requiredString(value.en, `${field}.en`, max, where),
  }
  for (const locale of LOCALIZED_LOCALES) {
    if (!Object.prototype.hasOwnProperty.call(value, locale)) continue
    result[locale] = requiredString(value[locale], `${field}.${locale}`, max, where)
  }
  return result
}

function parseTags(value: unknown, where: string): readonly string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${where}: tags must be an array`)
  }
  if (value.length < 1 || value.length > NEWS_LIMITS.maxTags) {
    throw new Error(`${where}: tags must have 1..${NEWS_LIMITS.maxTags} entries`)
  }
  const tags: string[] = []
  for (const tag of value) {
    if (typeof tag !== 'string') {
      throw new Error(`${where}: each tag must be a string`)
    }
    if (tag.length < 1 || tag.length > NEWS_LIMITS.maxTag || !TAG_RE.test(tag)) {
      throw new Error(`${where}: tag "${tag}" must match /^[a-z0-9-]+$/ and be 1..${NEWS_LIMITS.maxTag} chars`)
    }
    tags.push(tag)
  }
  return tags
}

function requiredString(value: unknown, field: string, max: number, where: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${where}: ${field} must be a string`)
  }
  if (value.trim() === '') {
    throw new Error(`${where}: ${field} is required`)
  }
  if (value.length > max) {
    throw new Error(`${where}: ${field} exceeds max length ${max}`)
  }
  return value
}

function isRealCalendarDate(value: string): boolean {
  const match = ISO_DATE_RE.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const utc = new Date(Date.UTC(year, month - 1, day))
  return utc.getUTCFullYear() === year && utc.getUTCMonth() === month - 1 && utc.getUTCDate() === day
}

function utcYmd(now: Date): string {
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}
