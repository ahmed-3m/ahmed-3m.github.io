#!/usr/bin/env node
/**
 * Reachability check for every `url:` in src/lib/news-items.ts.
 *
 * Catches hallucinated / dead links before auto-merge.
 *
 * HARD failure (blocks merge): the link itself is wrong —
 *   - 404 Not Found
 *   - DNS does not resolve / domain is gone (ENOTFOUND, EAI_AGAIN)
 * These mean the agent wrote a bad URL and must never have committed it.
 *
 * WARNING (allowed, non-blocking): the link is probably fine but the upstream
 * is temporarily unhappy right now —
 *   - 5xx server errors (502/503/504): upstream outage, not a bad link. A single
 *     persistently-down third-party site must not be able to block the pipeline
 *     indefinitely (this previously failed 4+ consecutive daily runs because
 *     ainews.cool served a chronic 502).
 *   - 4xx client rejections (401/403/429): auth/anti-bot/rate-limit responses.
 *   - generic network errors (status 0): transient TCP/TLS issues.
 */
import { readFile } from 'node:fs/promises'

const FILE = 'src/lib/news-items.ts'
const TIMEOUT_MS = 12000
const UA =
  'Mozilla/5.0 (compatible; ahmed-3m-news-linkcheck/1.0; +https://ahmed-3m.github.io/news)'

const src = await readFile(FILE, 'utf8')
const urls = [...src.matchAll(/url:\s*'([^']+)'/g)].map((m) => m[1])

if (urls.length === 0) {
  console.error(`No urls found in ${FILE} — refusing to pass silently.`)
  process.exit(1)
}

// Single attempt. Returns { url, status, error }. No retries: a transient 5xx
// or network blip is a warning, not a failure, so retrying would only slow the
// step down without changing the outcome.
async function probe(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    // Some servers reject HEAD; use GET but don't read the body.
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'user-agent': UA },
    })
    return { url, status: res.status }
  } catch (err) {
    return { url, status: 0, error: err?.cause?.code || err?.name || String(err) }
  } finally {
    clearTimeout(timer)
  }
}

const results = await Promise.all([...new Set(urls)].map(probe))

const isHardFail = (r) =>
  // 404 = the resource genuinely does not exist.
  r.status === 404 ||
  // DNS / domain gone: the hostname itself cannot be resolved, so the URL is
  // broken regardless of upstream health. Timeouts (status 0 with no DNS code)
  // are NOT here — those are transient and only warn.
  (r.status === 0 && typeof r.error === 'string' && /ENOTFOUND|EAI_AGAIN|ENODATA/.test(r.error))

const failures = results.filter(isHardFail)
const warnings = results.filter((r) => !isHardFail(r) && (r.status === 0 || r.status >= 400))

for (const w of warnings)
  console.warn(`⚠️  ${w.status || w.error} (allowed) ${w.url}`)
for (const f of failures) console.error(`❌  ${f.status || f.error} ${f.url}`)

console.log(
  `\nChecked ${results.length} unique links — ${failures.length} hard failures, ${warnings.length} warnings.`,
)
process.exit(failures.length > 0 ? 1 : 0)
