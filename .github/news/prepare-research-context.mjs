#!/usr/bin/env node
/**
 * Builds a lightweight dedup index from `src/lib/news-items.json` so the
 * research agent only needs to Read ~26 KB instead of the full ~700 KB
 * multilingual catalog.
 *
 *   node .github/news/prepare-research-context.mjs <out-file>
 *   node .github/news/prepare-research-context.mjs --self-test
 */
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_CATALOG = 'src/lib/news-items.json'

function isoYmdUtc(date) {
  return date.toISOString().slice(0, 10)
}

function shiftUtcDays(date, days) {
  return isoYmdUtc(new Date(date.getTime() + days * 86_400_000))
}

export function buildDedupIndex(catalog, now = new Date()) {
  if (!Array.isArray(catalog)) {
    throw new Error('news catalog must be an array')
  }

  const tagCounts = new Map()
  const items = catalog.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`news item [${idx}] must be an object`)
    }
    const headlineEn =
      typeof item.headline === 'string'
        ? item.headline
        : item.headline && typeof item.headline.en === 'string'
          ? item.headline.en
          : ''
    for (const tag of item.tags ?? []) {
      if (typeof tag === 'string' && tag) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      }
    }
    return {
      id: item.id,
      date: item.date,
      source: item.source,
      url: item.url,
      headline: headlineEn,
    }
  })

  const canonicalTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 35)
    .map(([tag]) => tag)

  return {
    todayUtc: isoYmdUtc(now),
    lookback3DaysUtc: shiftUtcDays(now, -3),
    lookback7DaysUtc: shiftUtcDays(now, -7),
    catalogCount: items.length,
    canonicalTags,
    items,
  }
}

function selfTest() {
  const now = new Date('2026-11-27T17:00:00Z')
  const index = buildDedupIndex(
    [
      {
        id: 'sample-1',
        date: '2026-11-25',
        source: 'Anthropic',
        url: 'https://anthropic.com/news/a',
        headline: { en: 'Sample One', de: 'Beispiel Eins' },
        tags: ['evaluation', 'mcp'],
      },
      {
        id: 'sample-2',
        date: '2026-11-24',
        source: 'OpenAI',
        url: 'https://openai.com/news/b',
        headline: 'Sample Two',
        tags: ['evaluation'],
      },
    ],
    now,
  )

  if (index.todayUtc !== '2026-11-27' || index.lookback3DaysUtc !== '2026-11-24') {
    throw new Error(`unexpected date window: ${JSON.stringify(index)}`)
  }
  if (index.catalogCount !== 2 || index.canonicalTags[0] !== 'evaluation') {
    throw new Error(`unexpected tags/count: ${JSON.stringify(index)}`)
  }
  if (index.items[0].headline !== 'Sample One' || index.items[1].headline !== 'Sample Two') {
    throw new Error(`unexpected item projection: ${JSON.stringify(index.items)}`)
  }
  console.log('self-test OK: prepare-research-context')
}

function isDirectRun() {
  const entry = process.argv[1]
  if (!entry) return false
  try {
    return fileURLToPath(import.meta.url).toLowerCase() === resolve(entry).toLowerCase()
  } catch {
    return false
  }
}

if (isDirectRun()) {
  const arg = process.argv[2]
  if (arg === '--self-test') {
    selfTest()
  } else if (!arg) {
    console.error('usage: prepare-research-context.mjs <out-file> | --self-test')
    process.exit(2)
  } else {
    const raw = JSON.parse(await readFile(DEFAULT_CATALOG, 'utf8'))
    const payload = buildDedupIndex(raw, new Date())
    await writeFile(arg, JSON.stringify(payload) + '\n', 'utf8')
    console.log(
      `Prepared dedup index (${payload.catalogCount} items, today=${payload.todayUtc}) at ${arg}`,
    )
  }
}
