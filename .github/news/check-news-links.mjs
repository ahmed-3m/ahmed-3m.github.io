#!/usr/bin/env node
/**
 * Reachability check for every `url` in src/lib/news-items.json.
 *
 * Catches hallucinated / dead links before auto-merge.
 *
 * HARD failure (blocks merge): the link itself is wrong —
 *   - 404 Not Found
 *   - 410 Gone (permanent removal — closer to 404 than to a transient 5xx)
 *   - DNS does not resolve / domain is gone (ENOTFOUND, EAI_AGAIN)
 *   - non-https URL, loopback/private/link-local host or resolved DNS
 *   - too many redirects (>5)
 * These mean the agent wrote a bad URL and must never have committed it.
 *
 * WARNING (allowed, non-blocking): the link is probably fine but the upstream
 * is temporarily unhappy right now —
 *   - 5xx server errors (502/503/504): upstream outage, not a bad link.
 *   - 4xx client rejections (401/403/429): auth/anti-bot/rate-limit responses.
 *   - generic network errors (status 0): transient TCP/TLS issues.
 *
 * Self-test: `node check-news-links.mjs --self-test` pins HARD_FAIL classification
 * and SSRF predicates (no network for the predicate cases).
 */
import { readFile, writeFile } from 'node:fs/promises'
import dns from 'node:dns'
import { isIP, BlockList } from 'node:net'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const FILE = 'src/lib/news-items.json'
const TIMEOUT_MS = 12000
const MAX_REDIRECTS = 5
const PROBE_CONCURRENCY = 8
const UA =
  'Mozilla/5.0 (compatible; ahmed-3m-news-linkcheck/1.0; +https://ahmed-3m.github.io/news)'

const v4Block = new BlockList()
v4Block.addSubnet('127.0.0.0', 8, 'ipv4')
v4Block.addSubnet('10.0.0.0', 8, 'ipv4')
v4Block.addSubnet('172.16.0.0', 12, 'ipv4')
v4Block.addSubnet('192.168.0.0', 16, 'ipv4')
v4Block.addSubnet('169.254.0.0', 16, 'ipv4')

const v6Block = new BlockList()
v6Block.addAddress('::1', 'ipv6')
v6Block.addSubnet('fc00::', 7, 'ipv6')
v6Block.addSubnet('fe80::', 10, 'ipv6')

function stripBrackets(hostname) {
  return hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname
}

function unwrapIpv4Mapped(ip) {
  const dotted = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip)
  if (dotted) return dotted[1]
  const hex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(ip)
  if (!hex) return null
  const hi = Number.parseInt(hex[1], 16)
  const lo = Number.parseInt(hex[2], 16)
  return `${(hi >> 8) & 255}.${hi & 255}.${(lo >> 8) & 255}.${lo & 255}`
}

export function isBlockedHostname(hostname) {
  const host = stripBrackets(String(hostname)).toLowerCase().replace(/\.$/, '')
  return host === 'localhost' || host.endsWith('.localhost')
}

export function isBlockedIp(ip) {
  const addr = stripBrackets(String(ip)).toLowerCase()
  const mapped = unwrapIpv4Mapped(addr)
  if (mapped) return isBlockedIp(mapped)
  const version = isIP(addr)
  if (version === 4) return v4Block.check(addr, 'ipv4')
  if (version === 6) return v6Block.check(addr, 'ipv6')
  return false
}

function isBlockedTarget(urlString) {
  let parsed
  try {
    parsed = new URL(urlString)
  } catch {
    return true
  }
  if (parsed.protocol !== 'https:') return true
  const host = stripBrackets(parsed.hostname)
  return isBlockedHostname(host) || isBlockedIp(host)
}

async function probe(url, hops = 0) {
  if (isBlockedTarget(url)) {
    return { url, status: 0, error: 'SSRF_BLOCKED', blocked: true }
  }

  let host
  try {
    host = stripBrackets(new URL(url).hostname)
  } catch {
    return { url, status: 0, error: 'INVALID_URL', blocked: true }
  }

  try {
    const addrs = await dns.promises.lookup(host, { all: true })
    if (addrs.some((row) => isBlockedIp(row.address))) {
      return { url, status: 0, error: 'SSRF_BLOCKED', blocked: true }
    }
  } catch (err) {
    return { url, status: 0, error: err?.code || err?.name || String(err) }
  }

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: ctrl.signal,
      headers: { 'user-agent': UA },
    })
    await res.body?.cancel().catch(() => {})
    if (res.status >= 300 && res.status < 400) {
      if (hops >= MAX_REDIRECTS) {
        return { url, status: 0, error: 'TOO_MANY_REDIRECTS', blocked: true }
      }
      const loc = res.headers.get('location')
      if (!loc) return { url, status: res.status }
      return probe(new URL(loc, url).toString(), hops + 1)
    }
    return { url, status: res.status }
  } catch (err) {
    return { url, status: 0, error: err?.cause?.code || err?.name || String(err) }
  } finally {
    clearTimeout(timer)
  }
}

const HARD_FAIL_STATUSES = new Set([404, 410])

export const isHardFail = (r) =>
  r.blocked === true ||
  HARD_FAIL_STATUSES.has(r.status) ||
  (r.status === 0 && typeof r.error === 'string' && /ENOTFOUND|EAI_AGAIN|ENODATA/.test(r.error))

/**
 * Filter a delta's items against probe results. Drops any item whose URL is a
 * hard failure so a single bad link never forfeits valid siblings, while failing
 * when a non-empty delta ends up with zero reachable items.
 */
export function filterDeltaByProbeResults(items, resultsByUrl) {
  const kept = []
  const dropped = []
  for (const item of items) {
    const res = resultsByUrl.get(item.url)
    if (res && isHardFail(res)) {
      dropped.push({ item, result: res })
    } else {
      kept.push(item)
    }
  }
  return { kept, dropped }
}

async function selfTest() {
  let failed = false
  const expectHard = (label, r, expected) => {
    const got = isHardFail(r)
    const ok = got === expected
    console.log(
      `self-test: ${label} -> status ${r.status}, isHardFail=${got} (expected ${expected}) ${ok ? '✓' : '✗'}`,
    )
    if (!ok) failed = true
  }
  const expectBlocked = (label, url, expected) => {
    const got = isBlockedTarget(url)
    const ok = got === expected
    console.log(
      `self-test: ${label} -> blocked=${got} (expected ${expected}) ${ok ? '✓' : '✗'}`,
    )
    if (!ok) failed = true
  }

  const url = 'https://github.com/ahmed-3m/nonexistent-self-test-xyz'
  const live = await probe(url)
  if (live.status === 404 || live.status === 410) {
    expectHard(`live ${url}`, live, true)
  } else {
    console.log(
      `self-test: live ${url} -> status ${live.status || live.error} (skipped; expected 404, upstream not cooperative)`,
    )
  }

  expectHard('synthetic 404', { status: 404 }, true)
  expectHard('synthetic 410', { status: 410 }, true)
  expectHard('synthetic 502', { status: 502 }, false)
  expectHard('synthetic 503', { status: 503 }, false)
  expectHard('synthetic 429', { status: 429 }, false)
  expectHard('synthetic 403', { status: 403 }, false)
  expectHard('synthetic DNS gone', { status: 0, error: 'ENOTFOUND' }, true)
  expectHard('synthetic timeout', { status: 0, error: 'HeadersTimeoutError' }, false)
  expectHard('synthetic ssrf', { status: 0, error: 'SSRF_BLOCKED', blocked: true }, true)

  expectBlocked('http://example.com/x', 'http://example.com/x', true)
  expectBlocked('https://127.0.0.1/', 'https://127.0.0.1/', true)
  expectBlocked('https://localhost/news', 'https://localhost/news', true)
  expectBlocked('https://192.168.1.9/', 'https://192.168.1.9/', true)
  expectBlocked('https://[::1]/', 'https://[::1]/', true)
  expectBlocked('https://example.com/', 'https://example.com/', false)

  {
    const deltaItems = [
      { id: 'ok', url: 'https://example.com/ok' },
      { id: 'bad', url: 'https://example.com/missing' },
      { id: 'warn', url: 'https://example.com/ratelimit' },
    ]
    const resultsMap = new Map([
      ['https://example.com/ok', { url: 'https://example.com/ok', status: 200 }],
      ['https://example.com/missing', { url: 'https://example.com/missing', status: 404 }],
      ['https://example.com/ratelimit', { url: 'https://example.com/ratelimit', status: 429 }],
    ])
    const { kept, dropped } = filterDeltaByProbeResults(deltaItems, resultsMap)
    const ok = kept.length === 2 && dropped.length === 1 && dropped[0].item.id === 'bad'
    console.log(`self-test: delta per-item filter (keeps 200/429, drops 404) ${ok ? '✓' : '✗'}`)
    if (!ok) failed = true

    // Simulated redirect where probeFn returns the final destination URL rather than input URL:
    const redirectRes = await probeDeltaItems(
      [
        { id: 'redir-404', url: 'https://example.com/start' },
        { id: 'redir-ok', url: 'https://example.com/short' },
      ],
      async (u) =>
        u === 'https://example.com/start'
          ? { url: 'https://example.com/missing', status: 404 }
          : { url: 'https://example.com/dest', status: 200 },
    )
    const redirOk =
      redirectRes.kept.length === 1 &&
      redirectRes.kept[0].id === 'redir-ok' &&
      redirectRes.dropped.length === 1 &&
      redirectRes.dropped[0].item.id === 'redir-404'
    console.log(`self-test: delta probe keys redirected results by original URL ${redirOk ? '✓' : '✗'}`)
    if (!redirOk) failed = true
  }

  if (failed) {
    console.error('self-test FAILED: link classification drifted from the documented policy.')
    process.exit(1)
  }
  console.log('self-test OK: link classification matches the documented policy.')
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length)
  let nextIndex = 0
  const workerCount = Math.min(limit, items.length)

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex
        nextIndex += 1
        results[currentIndex] = await worker(items[currentIndex], currentIndex)
      }
    }),
  )

  return results
}

async function checkCatalog({ warnOnly = false } = {}) {
  const src = await readFile(FILE, 'utf8')
  let catalog
  try {
    catalog = JSON.parse(src)
  } catch {
    console.error(`Failed to parse ${FILE} — refusing to pass silently.`)
    process.exit(1)
  }
  if (!Array.isArray(catalog)) {
    console.error(`${FILE} is not a JSON array — refusing to pass silently.`)
    process.exit(1)
  }
  const urls = []
  for (let i = 0; i < catalog.length; i++) {
    const item = catalog[i]
    if (!item || typeof item.url !== 'string' || item.url.trim() === '') {
      console.error(`${FILE}[${i}] is missing a url — refusing to pass silently.`)
      process.exit(1)
    }
    urls.push(item.url)
  }

  if (urls.length === 0) {
    console.error(`No urls found in ${FILE} — refusing to pass silently.`)
    process.exit(1)
  }

  const uniqueUrls = [...new Set(urls)]
  const results = await mapWithConcurrency(uniqueUrls, PROBE_CONCURRENCY, (u) => probe(u))

  const failures = results.filter(isHardFail)
  const warnings = results.filter((r) => !isHardFail(r) && (r.status === 0 || r.status >= 400))

  for (const w of warnings)
    console.warn(`⚠️  ${w.status || w.error} (allowed) ${w.url}`)
  for (const f of failures) {
    if (warnOnly) {
      console.warn(`::warning::Catalog link rot detected (${f.status || f.error}): ${f.url}`)
    } else {
      console.error(`❌  ${f.status || f.error} ${f.url}`)
    }
  }

  console.log(
    `\nChecked ${results.length} unique links — ${failures.length} hard failures, ${warnings.length} warnings.`,
  )
  process.exit(!warnOnly && failures.length > 0 ? 1 : 0)
}

export async function probeDeltaItems(items, probeFn = probe) {
  const urls = items.map((item) => item?.url).filter((u) => typeof u === 'string' && u.trim())
  const uniqueUrls = [...new Set(urls)]
  const entries = await mapWithConcurrency(uniqueUrls, PROBE_CONCURRENCY, async (u) => [
    u,
    await probeFn(u),
  ])
  const byUrl = new Map(entries)
  const { kept, dropped } = filterDeltaByProbeResults(items, byUrl)
  return { uniqueUrls, results: entries.map(([, r]) => r), kept, dropped }
}

async function checkDelta(deltaPath, { dropFailed = false } = {}) {
  const raw = JSON.parse(await readFile(deltaPath, 'utf8'))
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.items)) {
    console.error(`Invalid delta JSON at ${deltaPath} — expected { items: [...] }.`)
    process.exit(1)
  }
  if (raw.items.length === 0) {
    console.log('Delta contains 0 items — skipping link probe.')
    process.exit(0)
  }

  const { uniqueUrls, results, kept, dropped } = await probeDeltaItems(raw.items)

  for (const r of results) {
    if (!isHardFail(r) && (r.status === 0 || r.status >= 400)) {
      console.warn(`⚠️  ${r.status || r.error} (allowed) ${r.url}`)
    } else if (!isHardFail(r)) {
      console.log(`✓  ${r.status} ${r.url}`)
    }
  }

  for (const { item, result } of dropped) {
    const code = result.status || result.error
    if (dropFailed) {
      console.warn(`::warning::Dropped delta item "${item.id}" due to dead URL (${code}): ${item.url}`)
    } else {
      console.error(`❌  ${code} ${item.url}`)
    }
  }

  if (dropFailed && dropped.length > 0) {
    await writeFile(deltaPath, `${JSON.stringify({ items: kept })}\n`, 'utf8')
  }

  console.log(
    `Checked ${uniqueUrls.length} delta link(s) — ${kept.length} kept, ${dropped.length} dropped.`,
  )

  if (dropFailed) {
    if (kept.length === 0) {
      console.error('All non-empty delta items failed link reachability checks.')
      process.exit(1)
    }
    process.exit(0)
  }

  process.exit(dropped.length > 0 ? 1 : 0)
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
  const args = process.argv.slice(2)
  const deltaIdx = args.indexOf('--delta')
  if (args.includes('--self-test')) {
    await selfTest()
  } else if (deltaIdx !== -1) {
    const deltaPath = args[deltaIdx + 1]
    if (!deltaPath) {
      console.error('usage: check-news-links.mjs --delta <path> [--drop-failed]')
      process.exit(2)
    }
    await checkDelta(deltaPath, { dropFailed: args.includes('--drop-failed') })
  } else {
    await checkCatalog({ warnOnly: args.includes('--warn-only') })
  }
}
