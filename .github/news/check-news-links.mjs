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

const isHardFail = (r) =>
  r.blocked === true ||
  HARD_FAIL_STATUSES.has(r.status) ||
  (r.status === 0 && typeof r.error === 'string' && /ENOTFOUND|EAI_AGAIN|ENODATA/.test(r.error))

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

  if (failed) {
    console.error('self-test FAILED: link classification drifted from the documented policy.')
    process.exit(1)
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
