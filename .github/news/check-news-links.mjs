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
import { readFile } from 'node:fs/promises'
import dns from 'node:dns'
import { isIP, BlockList } from 'node:net'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const FILE = 'src/lib/news-items.json'
const TIMEOUT_MS = 12000
const MAX_REDIRECTS = 5
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

const defaultProbeAdapters = {
  lookup: (host, options) => dns.promises.lookup(host, options),
  fetch: (url, options) => fetch(url, options),
  setTimeout: (callback, delay) => setTimeout(callback, delay),
  clearTimeout: (timer) => clearTimeout(timer),
}

export async function probe(url, hops = 0, adapters = defaultProbeAdapters) {
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
    const addrs = await adapters.lookup(host, { all: true })
    if (addrs.some((row) => isBlockedIp(row.address))) {
      return { url, status: 0, error: 'SSRF_BLOCKED', blocked: true }
    }
  } catch (err) {
    return { url, status: 0, error: err?.code || err?.name || String(err) }
  }

  const ctrl = new AbortController()
  const timer = adapters.setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await adapters.fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: ctrl.signal,
      headers: { 'user-agent': UA },
    })
    if (res.status >= 300 && res.status < 400) {
      if (hops >= MAX_REDIRECTS) {
        return { url, status: 0, error: 'TOO_MANY_REDIRECTS', hardFailure: true }
      }
      const location = res.headers.get('location')
      if (!location) {
        return { url, status: 0, error: 'REDIRECT_MISSING_LOCATION', hardFailure: true }
      }
      let nextUrl
      try {
        nextUrl = new URL(location, url).toString()
      } catch {
        return { url, status: 0, error: 'REDIRECT_INVALID_LOCATION', hardFailure: true }
      }
      return probe(nextUrl, hops + 1, adapters)
    }
    return { url, status: res.status }
  } catch (err) {
    return { url, status: 0, error: err?.cause?.code || err?.name || String(err) }
  } finally {
    adapters.clearTimeout(timer)
  }
}

const HARD_FAIL_STATUSES = new Set([404, 410])

const isHardFail = (r) =>
  r.blocked === true ||
  r.hardFailure === true ||
  HARD_FAIL_STATUSES.has(r.status) ||
  (r.status === 0 && typeof r.error === 'string' && /ENOTFOUND|EAI_AGAIN|ENODATA/.test(r.error))

async function selfTest() {
  let failed = false
  const expectEqual = (label, got, expected) => {
    const ok = JSON.stringify(got) === JSON.stringify(expected)
    console.log(`self-test: ${label} -> ${ok ? '✓' : `✗ got ${JSON.stringify(got)}`}`)
    if (!ok) failed = true
  }
  const expectTrue = (label, condition) => expectEqual(label, Boolean(condition), true)
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
  const expectProbe = async (label, url, adapters, expected) => {
    const result = await probe(url, 0, adapters)
    expectHard(`${label} classification`, result, expected.hard)
    if (Object.prototype.hasOwnProperty.call(expected, 'error')) {
      expectEqual(`${label} error`, result.error, expected.error)
    }
    if (Object.prototype.hasOwnProperty.call(expected, 'hardFailure')) {
      expectEqual(`${label} hardFailure`, result.hardFailure, expected.hardFailure)
    }
    return result
  }
  const publicAddresses = [{ address: '93.184.216.34', family: 4 }]
  const response = (status, location = null) => ({
    status,
    headers: { get: (name) => (name.toLowerCase() === 'location' ? location : null) },
  })
  const adaptersFor = (responses, lookup = async () => publicAddresses) => {
    let index = 0
    const lookups = []
    const fetches = []
    const activeTimers = new Set()
    return {
      lookups,
      fetches,
      activeTimers,
      lookup: async (host, options) => {
        lookups.push(host)
        return lookup(host, options)
      },
      fetch: async (url, options) => {
        fetches.push({ url, signal: options.signal })
        return responses[Math.min(index++, responses.length - 1)]
      },
      setTimeout: (callback, delay) => {
        const timer = setTimeout(callback, delay)
        activeTimers.add(timer)
        return timer
      },
      clearTimeout: (timer) => {
        activeTimers.delete(timer)
        clearTimeout(timer)
      },
    }
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

  const start = 'https://example.com/start'
  await expectProbe('redirect missing location', start, adaptersFor([response(302)]), {
    hard: true,
    error: 'REDIRECT_MISSING_LOCATION',
    hardFailure: true,
  })
  await expectProbe(
    'redirect invalid location',
    start,
    adaptersFor([response(302, 'https://[')]),
    { hard: true, error: 'REDIRECT_INVALID_LOCATION', hardFailure: true },
  )
  await expectProbe(
    'redirect to http',
    start,
    adaptersFor([response(302, 'http://example.com/story')]),
    { hard: true, error: 'SSRF_BLOCKED' },
  )
  await expectProbe(
    'redirect to private ip',
    start,
    adaptersFor([response(302, 'https://127.0.0.1/story')]),
    { hard: true, error: 'SSRF_BLOCKED' },
  )

  const privateDns = adaptersFor(
    [response(302, 'https://private.example/story'), response(200)],
    async (host) =>
      host === 'private.example' ? [{ address: '127.0.0.1', family: 4 }] : publicAddresses,
  )
  await expectProbe('redirect DNS resolves private', start, privateDns, {
    hard: true,
    error: 'SSRF_BLOCKED',
  })
  expectEqual('redirect DNS checks every hostname', privateDns.lookups, [
    'example.com',
    'private.example',
  ])
  expectEqual('redirect DNS blocks before second fetch', privateDns.fetches.length, 1)

  const fiveRedirects = adaptersFor([
    response(302, '/1'),
    response(302, '/2'),
    response(302, '/3'),
    response(302, '/4'),
    response(302, '/5'),
    response(200),
  ])
  await expectProbe('five redirects then success', start, fiveRedirects, { hard: false })
  expectEqual('five redirects fetch count', fiveRedirects.fetches.length, 6)
  expectEqual('five redirects lookup count', fiveRedirects.lookups.length, 6)
  expectTrue(
    'five redirects pass AbortSignal on every fetch',
    fiveRedirects.fetches.every(({ signal }) => signal instanceof AbortSignal),
  )
  expectEqual('five redirects clear every timer', fiveRedirects.activeTimers.size, 0)

  const sixRedirects = adaptersFor([
    response(302, '/1'),
    response(302, '/2'),
    response(302, '/3'),
    response(302, '/4'),
    response(302, '/5'),
    response(302, '/6'),
    response(200),
  ])
  await expectProbe('sixth redirect rejected', start, sixRedirects, {
    hard: true,
    error: 'TOO_MANY_REDIRECTS',
    hardFailure: true,
  })
  expectEqual('sixth redirect stops after six fetches', sixRedirects.fetches.length, 6)

  const loop = adaptersFor([response(302, start)])
  await expectProbe('redirect loop exceeds five hops', start, loop, {
    hard: true,
    error: 'TOO_MANY_REDIRECTS',
    hardFailure: true,
  })
  expectEqual('redirect loop stops after six fetches', loop.fetches.length, 6)

  let timeoutCallback
  let timeoutCleared = false
  let timeoutSignal
  const timeoutAdapters = {
    lookup: async () => publicAddresses,
    fetch: async (_url, options) => {
      timeoutSignal = options.signal
      return new Promise((_, reject) => {
        options.signal.addEventListener(
          'abort',
          () => {
            const error = new Error('timed out')
            error.name = 'AbortError'
            reject(error)
          },
          { once: true },
        )
      })
    },
    setTimeout: (callback) => {
      timeoutCallback = callback
      return 'fake-timer'
    },
    clearTimeout: (timer) => {
      if (timer === 'fake-timer') timeoutCleared = true
    },
  }
  const pendingTimeout = probe(start, 0, timeoutAdapters)
  await new Promise((resolve) => setImmediate(resolve))
  if (typeof timeoutCallback !== 'function') {
    throw new Error('self-test: timeout callback was not scheduled')
  }
  timeoutCallback()
  const timeoutResult = await pendingTimeout
  expectHard('timeout abort classification', timeoutResult, false)
  expectEqual('timeout abort error', timeoutResult.error, 'AbortError')
  expectTrue('timeout passes AbortSignal', timeoutSignal instanceof AbortSignal)
  expectTrue('timeout aborts signal', timeoutSignal?.aborted)
  expectTrue('timeout clears timer', timeoutCleared)

  if (failed) {
    console.error('self-test FAILED: link classification drifted from the documented policy.')
    process.exitCode = 1
    return
  }
  console.log('self-test OK: link classification matches the documented policy.')
}

async function checkCatalog() {
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

  const results = await Promise.all([...new Set(urls)].map((u) => probe(u)))

  const failures = results.filter(isHardFail)
  const warnings = results.filter((r) => !isHardFail(r) && (r.status === 0 || r.status >= 400))

  for (const w of warnings)
    console.warn(`⚠️  ${w.status || w.error} (allowed) ${w.url}`)
  for (const f of failures) console.error(`❌  ${f.status || f.error} ${f.url}`)

  console.log(
    `\nChecked ${results.length} unique links — ${failures.length} hard failures, ${warnings.length} warnings.`,
  )
  process.exit(failures.length > 0 ? 1 : 0)
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
  if (process.argv.includes('--self-test')) {
    await selfTest()
  } else {
    await checkCatalog()
  }
}
