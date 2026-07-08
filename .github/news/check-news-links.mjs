#!/usr/bin/env node
/**
 * Reachability check for every `url:` in src/lib/news-items.ts.
 *
 * Catches hallucinated / dead links before auto-merge. To avoid false failures
 * from sites that block bots, only HARD failures (DNS error, 404, or 5xx) fail
 * the build; auth/anti-bot responses (401/403/429) are warnings.
 *
 * Run: node .github/news/check-news-links.mjs
 */
import { readFile } from 'node:fs/promises'

const FILE = 'src/lib/news-items.ts'
const TIMEOUT_MS = 12000
// Transient failures (5xx that often blips: 502/503/504, plus network errors
// surfaced as status 0) are retried with a short backoff before counting as a
// hard failure. Stops a single flaky upstream — like ainews.cool serving a
// momentary 502 — from nuking an entire week's update.
const MAX_ATTEMPTS = 3
const RETRY_STATUSES = new Set([0, 502, 503, 504])
const UA =
  'Mozilla/5.0 (compatible; ahmed-3m-news-linkcheck/1.0; +https://ahmed-3m.github.io/news)'

const src = await readFile(FILE, 'utf8')
const urls = [...src.matchAll(/url:\s*'([^']+)'/g)].map((m) => m[1])

if (urls.length === 0) {
  console.error(`No urls found in ${FILE} — refusing to pass silently.`)
  process.exit(1)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Single attempt. Returns { url, status, error }.
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

async function check(url) {
  let result
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    result = await probe(url)
    if (!RETRY_STATUSES.has(result.status)) return result
    if (attempt < MAX_ATTEMPTS) {
      const backoff = 2000 * attempt
      console.log(
        `↻ ${result.status || result.error} ${url} — retrying in ${backoff}ms (attempt ${attempt}/${MAX_ATTEMPTS})`,
      )
      await sleep(backoff)
    }
  }
  return result
}

const results = await Promise.all([...new Set(urls)].map(check))

const hardFail = (r) => r.status === 0 || r.status === 404 || r.status >= 500
const failures = results.filter(hardFail)
const warnings = results.filter((r) => !hardFail(r) && r.status >= 400)

for (const w of warnings) console.warn(`⚠️  ${w.status} (allowed) ${w.url}`)
for (const f of failures) console.error(`❌  ${f.status || f.error} ${f.url}`)

console.log(`\nChecked ${results.length} unique links — ${failures.length} hard failures, ${warnings.length} warnings.`)
process.exit(failures.length > 0 ? 1 : 0)
