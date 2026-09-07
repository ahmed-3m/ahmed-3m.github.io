export type NewsCategory = 'ai' | 'agentic'

export type NewsTake = { en: string } & Partial<Record<'de' | 'fr' | 'es' | 'ar', string>>

export type NewsItem = {
  id: string
  date: string
  category: NewsCategory
  headline: string
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
const TAKE_KEYS = new Set(['en', 'de', 'fr', 'es', 'ar'])
const TAKE_LOCALES = ['de', 'fr', 'es', 'ar'] as const
const ID_RE = /^[a-z0-9-]+$/
const TAG_RE = /^[a-z0-9-]+$/
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function canonicalNewsUrl(url: string): string {
  const parsed = new URL(url)
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

export function parseNewsItems(value: unknown, now?: Date): readonly NewsItem[] {
  if (!Array.isArray(value)) {
    throw new Error('news catalog must be an array')
  }
  if (value.length > NEWS_LIMITS.maxCatalog) {
    throw new Error(`news catalog exceeds maxCatalog (${NEWS_LIMITS.maxCatalog})`)
  }

  const today = utcYmd(now ?? new Date())
  const items: NewsItem[] = []
  const ids = new Set<string>()
  const urls = new Set<string>()

  for (let i = 0; i < value.length; i++) {
    const item = parseNewsItem(value[i], today, i)
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

  return parseNewsItems([...existing, ...parsedDelta], now)
}

function parseNewsItem(value: unknown, today: string, index: number): NewsItem {
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
  if (date > today) {
    throw new Error(`${where}: date ${date} is in the future (today UTC is ${today})`)
  }

  const category = parseCategory(value.category, where)
  const headline = requiredString(value.headline, 'headline', NEWS_LIMITS.maxHeadline, where)
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

function parseTake(value: unknown, where: string): NewsTake {
  if (!isPlainObject(value)) {
    throw new Error(`${where}: take must be a plain object`)
  }
  for (const key of Object.keys(value)) {
    if (!TAKE_KEYS.has(key)) {
      throw new Error(`${where}: unknown take field "${key}"`)
    }
  }
  const en = requiredString(value.en, 'take.en', NEWS_LIMITS.maxTake, where)
  const take: NewsTake = { en }
  for (const locale of TAKE_LOCALES) {
    if (!Object.prototype.hasOwnProperty.call(value, locale)) continue
    take[locale] = requiredString(value[locale], `take.${locale}`, NEWS_LIMITS.maxTake, where)
  }
  return take
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
