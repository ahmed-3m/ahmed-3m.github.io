// Emits src/lib/news-homepage.json — the three newest news items for the homepage
// card grid, in exactly the shape `getAllNews(lang)` returns per item (full localized
// headline/take objects; the reader resolves the locale with the same en fallback).
//
// Why: the homepage only renders 3 cards, but importing `@/lib/news-items` bundled the
// whole ~611 KB catalog (src/lib/news-items.json) into the homepage bundle. The full
// catalog stays where it belongs: the /news page and server-side SEO date helpers.
//
// Runs as `prebuild` (npm runs it automatically before `npm run build`), so CI builds
// always bundle the current top-3. Plain node, no dependencies — same style as
// tools/emit-sitemap-alias.mjs. Regenerate by hand with:
//   node tools/emit-homepage-news.mjs

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const source = path.join(root, 'src', 'lib', 'news-items.json')
const target = path.join(root, 'src', 'lib', 'news-homepage.json')

const HOMEPAGE_ITEM_COUNT = 3

// Mirrors `newsCategoryLabels` in src/lib/news-items.ts — copied verbatim, never
// edit these here first (news-items.ts is the source of truth).
const CATEGORY_LABELS = {
  ai: { en: 'AI', de: 'KI', fr: 'IA', es: 'IA', ar: 'الذكاء الاصطناعي' },
  agentic: {
    en: 'Agentic AI',
    de: 'Agentische KI',
    fr: 'IA agentique',
    es: 'IA agéntica',
    ar: 'الذكاء الاصطناعي الوكيل',
  },
}

// Same locales `LocalizedText` supports in src/lib/news.ts.
const LOCALES = ['en', 'de', 'fr', 'es', 'ar']

function fail(message) {
  throw new Error(`${message} (source: src/lib/news-items.json)`)
}

function requireString(value, field, where) {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${where}: ${field} must be a non-empty string`)
  }
  return value
}

/**
 * Resolves one localized text field the way `parseLocalizedText` does: `en` is
 * required, every other locale is optional and only known locales survive.
 * A bare string is the English value (headline shorthand).
 */
function localized(value, field, where) {
  if (typeof value === 'string') {
    return { en: requireString(value, field, where) }
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(`${where}: ${field} must be a string or an object of locale strings`)
  }
  const result = { en: requireString(value.en, `${field}.en`, where) }
  for (const locale of LOCALES) {
    if (locale === 'en') continue
    if (!Object.prototype.hasOwnProperty.call(value, locale)) continue
    result[locale] = requireString(value[locale], `${field}.${locale}`, where)
  }
  return result
}

let catalog
try {
  catalog = JSON.parse(await readFile(source, 'utf8'))
} catch (cause) {
  throw new Error(
    `Expected to read the news catalog at ${source}. If it moved, update ` +
      `tools/emit-homepage-news.mjs — a missing homepage slice silently breaks ` +
      `the homepage news grid.`,
    { cause },
  )
}

if (!Array.isArray(catalog)) {
  fail('news catalog must be an array')
}

// Same read-time ordering as `getAllNews`: newest first, ties keep catalog order
// (Array.prototype.sort is stable).
const newest = [...catalog]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, HOMEPAGE_ITEM_COUNT)

const items = newest.map((item) => {
  if (typeof item !== 'object' || item === null) {
    fail('news item must be an object')
  }
  const where = `news item "${typeof item.id === 'string' ? item.id : '(unknown id)'}"`
  const category = item.category
  if (category !== 'ai' && category !== 'agentic') {
    fail(`${where}: category must be 'ai' or 'agentic'`)
  }
  const result = {
    id: requireString(item.id, 'id', where),
    date: requireString(item.date, 'date', where),
    category,
    headline: localized(item.headline, 'headline', where),
    source: requireString(item.source, 'source', where),
    url: requireString(item.url, 'url', where),
    take: localized(item.take, 'take', where),
  }
  if (Array.isArray(item.tags) && item.tags.length > 0) {
    result.tags = item.tags.map((tag, index) => requireString(tag, `tags[${index}]`, where))
  }
  return result
})

if (items.length === 0) {
  fail('news catalog is empty — refusing to emit a homepage slice with no items')
}

const payload = { labels: CATEGORY_LABELS, items }
const json = `${JSON.stringify(payload, null, 2)}\n`

await writeFile(target, json, 'utf8')
console.log(
  `homepage news: wrote ${path.basename(target)} (${items.length} of ${catalog.length} items, ` +
    `${json.length} bytes)`,
)
