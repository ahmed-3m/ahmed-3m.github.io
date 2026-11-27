#!/usr/bin/env node
/**
 * Pins the news parser and JSON-LD serializer. Run from the repo root:
 *   node .github/news/news-selftest.mjs
 *
 * Logs `self-test: <label> ✓` per assertion and exits 1 on the first failure.
 */
import { register } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'
import {
  parseNewsItems,
  canonicalNewsUrl,
  applyNewsDelta,
  sanitizeIncomingDelta,
  stripTrackingParams,
  normalizeIncomingTags,
  NEWS_LIMITS,
} from '../../src/lib/news.ts'
import { serializeJsonLd } from '../../src/lib/serialize-json-ld.ts'
import { isBlockedHostname, isBlockedIp } from './check-news-links.mjs'

const valid = {
  id: 'valid',
  date: '2026-01-15',
  category: 'ai',
  headline: 'A valid headline',
  source: 'Example',
  url: 'https://example.com/a',
  take: { en: 'A valid take.' },
}

function pass(label) {
  console.log(`self-test: ${label} ✓`)
}

function fail(label, detail) {
  console.error(`self-test: ${label} ✗${detail ? ` — ${detail}` : ''}`)
  process.exit(1)
}

function assert(label, condition, detail) {
  if (!condition) fail(label, detail)
  pass(label)
}

function assertThrows(label, fn) {
  try {
    fn()
  } catch {
    pass(label)
    return
  }
  fail(label, 'expected throw')
}

assert(
  'canonical trailing-slash query',
  canonicalNewsUrl('https://Example.COM/story/?x=1') ===
    canonicalNewsUrl('https://example.com/story?x=1'),
)

assert(
  'canonical query is significant',
  canonicalNewsUrl('https://example.com/story/') !==
    canonicalNewsUrl('https://example.com/story/?x=1'),
)

assertThrows('invalid calendar date', () => {
  parseNewsItems([{ ...valid, date: '2026-02-31' }])
})

assertThrows('future date', () => {
  parseNewsItems([{ ...valid, date: '2026-09-07' }], new Date('2026-09-06T00:00:00Z'))
})

assertThrows('future date rejected when allowFutureDates is false', () => {
  parseNewsItems(
    [{ ...valid, date: '2026-09-07' }],
    new Date('2026-09-06T00:00:00Z'),
    { allowFutureDates: false },
  )
})

{
  const [item] = parseNewsItems(
    [{ ...valid, date: '2026-09-07' }],
    new Date('2026-09-06T00:00:00Z'),
    { allowFutureDates: true },
  )
  assert('future date allowed when allowFutureDates is true', item.date === '2026-09-07')
}

assertThrows('unknown field', () => {
  parseNewsItems([{ ...valid, extra: 1 }])
})

assertThrows('unknown take locale', () => {
  parseNewsItems([{ ...valid, take: { en: 'x', xx: 'y' } }])
})

assertThrows('unknown headline locale', () => {
  parseNewsItems([{ ...valid, headline: { en: 'x', xx: 'y' } }])
})

assertThrows('headline object missing en', () => {
  parseNewsItems([{ ...valid, headline: { de: 'Nur Deutsch' } }])
})

{
  const [item] = parseNewsItems([
    { ...valid, headline: { en: 'A valid headline', de: 'Ein gültiger Titel' } },
  ])
  assert('localized headline parses', item.headline.en === 'A valid headline' && item.headline.de === 'Ein gültiger Titel')
}

{
  const [item] = parseNewsItems([valid])
  assert('string headline shorthand', item.headline.en === 'A valid headline' && item.headline.de === undefined)
}

assertThrows('tag case', () => {
  parseNewsItems([{ ...valid, tags: ['OK'] }])
})

assertThrows('duplicate canonical url', () => {
  parseNewsItems([valid, { ...valid, id: 'other', url: 'https://example.com/a/' }])
})

assertThrows('delta duplicate id', () => {
  applyNewsDelta([valid], { items: [valid] })
})

assertThrows('delta maxDelta', () => {
  applyNewsDelta(
    [valid],
    {
      items: [1, 2, 3, 4, 5].map((n) => ({
        ...valid,
        id: `item-${n}`,
        url: `https://example.com/${n}`,
      })),
    },
  )
})

assertThrows('delta unknown field', () => {
  applyNewsDelta([valid], { items: [], leftover: true })
})

{
  // Rolling window: a full catalog evicts its oldest-dated items (earliest-
  // appended first on ties) instead of rejecting the delta.
  const full = Array.from({ length: NEWS_LIMITS.maxCatalog }, (_, i) => ({
    ...valid,
    id: `item-${i + 1}`,
    url: `https://example.com/item-${i + 1}`,
  }))
  full[150] = { ...full[150], date: '2026-01-01' }
  const next = applyNewsDelta(parseNewsItems(full), {
    items: [1, 2].map((n) => ({
      ...valid,
      id: `new-${n}`,
      url: `https://example.com/new-${n}`,
    })),
  })
  const ids = next.map((item) => item.id)
  assert(
    'delta rolling window evicts oldest-dated first',
    next.length === NEWS_LIMITS.maxCatalog &&
      !ids.includes('item-151') &&
      !ids.includes('item-1') &&
      ids[0] === 'item-2' &&
      ids.at(-1) === 'new-2',
    `${ids.slice(0, 2).join(',')} … ${ids.slice(-2).join(',')} (${ids.length})`,
  )
}

assert(
  'delta below maxCatalog evicts nothing',
  applyNewsDelta([valid], { items: [{ ...valid, id: 'other', url: 'https://example.com/b' }] })
    .length === 2,
)

{
  const cleaned = stripTrackingParams('https://example.com/story?utm_source=exa&id=42&fbclid=abc')
  assert(
    'tracking params stripped, significant params kept',
    cleaned === 'https://example.com/story?id=42' &&
      canonicalNewsUrl('https://Example.COM/story/?id=42&utm_medium=social') ===
        canonicalNewsUrl('https://example.com/story?id=42'),
    cleaned,
  )
}

assert(
  'normalizeIncomingTags maps synonyms and dedupes',
  JSON.stringify(normalizeIncomingTags(['agent-governance', 'governance', 'agentic-coding'])) ===
    JSON.stringify(['governance', 'coding-agents']),
)

{
  const full5 = (n, extra = {}) => ({
    id: `item-${n}`,
    date: '2026-01-15',
    category: 'agentic',
    headline: { en: `H${n}`, de: `D${n}`, fr: `F${n}`, es: `E${n}`, ar: `A${n}` },
    source: 'Anthropic',
    url: `https://example.com/post-${n}?utm_source=test`,
    take: { en: `T${n}`, de: `TD${n}`, fr: `TF${n}`, es: `TE${n}`, ar: `TA${n}` },
    tags: ['agent-governance', 'governance'],
    ...extra,
  })
  const res = sanitizeIncomingDelta([valid], {
    items: [
      full5(1),
      full5(2, { take: { en: 'Only EN' } }), // missing 4 locales -> dropped invalid
      full5(3, { url: 'https://example.com/a/?utm_campaign=dupe' }), // duplicate URL -> dropped dupe
    ],
  })
  assert(
    'sanitizeIncomingDelta keeps valid subset and drops bad/dupe siblings',
    res.accepted.length === 1 &&
      res.accepted[0].id === 'item-1' &&
      res.accepted[0].url === 'https://example.com/post-1' &&
      JSON.stringify(res.accepted[0].tags) === JSON.stringify(['governance']) &&
      res.dropped.length === 2,
    JSON.stringify(res),
  )

  const allDupes = sanitizeIncomingDelta([valid], {
    items: [full5(4, { url: 'https://example.com/a' })],
  })
  assert('sanitizeIncomingDelta treats all-duplicate delta as quiet no-op', allDupes.accepted.length === 0)

  assertThrows('sanitizeIncomingDelta fails when non-empty delta has only invalid items', () => {
    sanitizeIncomingDelta([valid], { items: [full5(5, { url: 'http://example.com/insecure' })] })
  })
}

function ssrfUrlBlocked(url) {
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:') return true
  const host = parsed.hostname.replace(/^\[|\]$/g, '')
  return isBlockedHostname(host) || isBlockedIp(host)
}

assert('ssrf hostname localhost', isBlockedHostname('localhost') && isBlockedHostname('foo.localhost') && !isBlockedHostname('example.com'))
assert('ssrf ip loopback v4', isBlockedIp('127.0.0.1') && !isBlockedIp('93.184.216.34'))
assert('ssrf ip private + link-local', isBlockedIp('10.1.2.3') && isBlockedIp('172.16.0.1') && isBlockedIp('192.168.1.9') && isBlockedIp('169.254.1.1'))
assert('ssrf ip v6 loopback ula link-local', isBlockedIp('::1') && isBlockedIp('fc00::1') && isBlockedIp('fe80::1'))
assert('ssrf ip v4-mapped private', isBlockedIp('::ffff:192.168.1.9') && isBlockedIp('::ffff:127.0.0.1'))
assert('ssrf http blocked', ssrfUrlBlocked('http://example.com/x'))
assert('ssrf 127.0.0.1 blocked', ssrfUrlBlocked('https://127.0.0.1/'))
assert('ssrf localhost blocked', ssrfUrlBlocked('https://localhost/news'))
assert('ssrf 192.168.1.9 blocked', ssrfUrlBlocked('https://192.168.1.9/'))
assert('ssrf [::1] blocked', ssrfUrlBlocked('https://[::1]/'))
assert('ssrf example.com allowed', ssrfUrlBlocked('https://example.com/') === false)

{
  const serialized = serializeJsonLd({ headline: '</script><script>alert(1)' })
  assert(
    'json-ld script escape',
    serialized.includes('\\u003c/script\\u003e') && !serialized.includes('</script>'),
    serialized,
  )
}

{
  const graph = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: '</script><script>alert(1)</script>',
  }
  const serialized = serializeJsonLd(graph)
  assert(
    'json-ld NewsArticle xss',
    serialized.includes('\\u003c/script\\u003e\\u003cscript\\u003ealert(1)\\u003c/script\\u003e') &&
      !serialized.includes('</script>'),
    serialized,
  )
}

const repoRoot = fileURLToPath(new URL('../..', import.meta.url))
const loader = `
  import { join } from 'node:path'
  import { pathToFileURL } from 'node:url'
  const root = ${JSON.stringify(repoRoot)}
  export async function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const abs = pathToFileURL(join(root, 'src', specifier.slice(2) + '.ts')).href
      return nextResolve(abs, context)
    }
    try {
      return await nextResolve(specifier, context)
    } catch (err) {
      if (typeof specifier === 'string' && !specifier.endsWith('.ts') && specifier.startsWith('.')) {
        return nextResolve(specifier + '.ts', context)
      }
      throw err
    }
  }
`
register(`data:text/javascript,${encodeURIComponent(loader)}`, pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'news-selftest.mjs')))

const { getRawNews } = await import('../../src/lib/news-items.ts')
const catalog = parseNewsItems(getRawNews())
assert('catalog parses', Array.isArray(catalog) && catalog.length === getRawNews().length && catalog.length > 0)

console.log(`self-test OK: ${catalog.length} news items parsed`)
