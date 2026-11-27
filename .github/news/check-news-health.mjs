#!/usr/bin/env node
/**
 * Health checks for the automated daily news pipeline:
 *   1. `schedule`: verifies a completed `success` scheduled run within 36 hours,
 *      detects stalled active runs (> 45 min), and distinguishes GitHub cron
 *      delay from workflow failures.
 *   2. `live`: verifies `/news/` JSON-LD `CollectionPage.hasPart` URLs + newest
 *      date against `src/lib/news-items.json` (catching stale/partial deploys).
 *   3. `--self-test`: offline fixture suite covering all edge cases.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalNewsUrl } from '../../src/lib/news.ts'

const DEFAULT_LIVE_NEWS_URL = 'https://ahmed-3m.github.io/news/'
const DEFAULT_MAX_AGE_HOURS = 36
const DEFAULT_STALLED_MINUTES = 45
const CRON_MINUTE_UTC = 23
const CRON_HOUR_UTC = 6

/**
 * Computes minutes between the expected 06:23 UTC slot for a run's UTC calendar
 * day and when GitHub actually created the run (informational only).
 */
export function scheduledDelayMinutes(createdAtIso) {
  const created = new Date(createdAtIso)
  if (Number.isNaN(created.getTime())) return null
  const scheduled = Date.UTC(
    created.getUTCFullYear(),
    created.getUTCMonth(),
    created.getUTCDate(),
    CRON_HOUR_UTC,
    CRON_MINUTE_UTC,
    0,
  )
  return Math.round((created.getTime() - scheduled) / 60_000)
}

/**
 * Evaluates recent scheduled `news-update.yml` runs on `main`.
 */
export function classifySchedule(
  runs,
  now = new Date(),
  { maxAgeHours = DEFAULT_MAX_AGE_HOURS, stalledMinutes = DEFAULT_STALLED_MINUTES } = {},
) {
  if (!Array.isArray(runs) || runs.length === 0) {
    return {
      ok: false,
      status: 'no_runs',
      summary: 'No scheduled news-update.yml runs found on main.',
      stalledRuns: [],
      latestCompleted: null,
      lastSuccessAgeHours: null,
      startDelayMinutes: null,
    }
  }

  const nowMs = now.getTime()
  const sorted = [...runs].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  )

  const stalledRuns = []
  for (const run of sorted) {
    if (run.status === 'completed') continue
    const startedMs = Date.parse(run.run_started_at || run.created_at)
    if (!Number.isNaN(startedMs)) {
      const elapsedMinutes = (nowMs - startedMs) / 60_000
      if (elapsedMinutes > stalledMinutes) {
        stalledRuns.push({
          id: run.id,
          url: run.html_url,
          status: run.status,
          elapsedMinutes: Math.round(elapsedMinutes),
        })
      }
    }
  }

  const completed = sorted.filter((r) => r.status === 'completed')
  const latestCompleted = completed[0] ?? null
  const latestSuccess = completed.find((r) => r.conclusion === 'success') ?? null
  const lastSuccessAgeHours = latestSuccess
    ? Number(((nowMs - Date.parse(latestSuccess.updated_at || latestSuccess.created_at)) / 3_600_000).toFixed(1))
    : null
  const startDelayMinutes = sorted[0] ? scheduledDelayMinutes(sorted[0].created_at) : null

  if (stalledRuns.length > 0) {
    const first = stalledRuns[0]
    return {
      ok: false,
      status: 'stalled',
      summary: `Scheduled run ${first.id} has been ${first.status} for ${first.elapsedMinutes}m (> ${stalledMinutes}m): ${first.url}`,
      stalledRuns,
      latestCompleted,
      lastSuccessAgeHours,
      startDelayMinutes,
    }
  }

  if (latestCompleted && latestCompleted.conclusion !== 'success') {
    return {
      ok: false,
      status: 'latest_failed',
      summary: `Latest completed scheduled news-update run ended with "${latestCompleted.conclusion}": ${latestCompleted.html_url}`,
      stalledRuns,
      latestCompleted,
      lastSuccessAgeHours,
      startDelayMinutes,
    }
  }

  if (!latestSuccess || lastSuccessAgeHours === null || lastSuccessAgeHours > maxAgeHours) {
    return {
      ok: false,
      status: 'stale',
      summary: latestSuccess
        ? `Last successful scheduled news-update was ${lastSuccessAgeHours}h ago (> ${maxAgeHours}h): ${latestSuccess.html_url}`
        : 'No completed successful scheduled news-update run exists yet.',
      stalledRuns,
      latestCompleted,
      lastSuccessAgeHours,
      startDelayMinutes,
    }
  }

  return {
    ok: true,
    status: 'healthy',
    summary: `Last scheduled success ${lastSuccessAgeHours}h ago (start delay vs 06:23 UTC: ${startDelayMinutes ?? 'n/a'}m): ${latestSuccess.html_url}`,
    stalledRuns,
    latestCompleted,
    lastSuccessAgeHours,
    startDelayMinutes,
  }
}

/**
 * Extracts `{ datePublished, canonicalUrl }` entries from `/news/` HTML's
 * `CollectionPage.hasPart` JSON-LD block.
 */
export function extractLiveNewsEntries(html) {
  const entries = []
  const scriptRe = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  for (const match of html.matchAll(scriptRe)) {
    let parsed
    try {
      parsed = JSON.parse(match[1].trim())
    } catch {
      continue
    }
    if (!parsed || parsed['@type'] !== 'CollectionPage' || !Array.isArray(parsed.hasPart)) {
      continue
    }
    for (const part of parsed.hasPart) {
      if (!part || typeof part.url !== 'string') continue
      let canon
      try {
        canon = canonicalNewsUrl(part.url)
      } catch {
        continue
      }
      entries.push({
        url: canon,
        datePublished: typeof part.datePublished === 'string' ? part.datePublished : '',
      })
    }
  }
  return entries
}

/**
 * Compares live `/news/` structured data against `src/lib/news-items.json`
 * (checked-out `main`). Verifies both newest date parity AND that the top
 * `minRecentOverlap` canonical URLs appear live.
 */
export function verifyLiveNewsCatalog(
  liveHtml,
  repoCatalog,
  { expectedUrls = null, todayYmd = new Date().toISOString().slice(0, 10), minRecentOverlap = 5 } = {},
) {
  const liveEntries = extractLiveNewsEntries(liveHtml)
  if (liveEntries.length === 0) {
    return {
      ok: false,
      reason: 'Missing or empty CollectionPage.hasPart JSON-LD on /news/.',
      liveNewestDate: null,
      repoNewestDate: null,
      ageDays: null,
    }
  }

  const repoSorted = [...repoCatalog].sort(
    (a, b) => b.date.localeCompare(a.date),
  )
  const repoNewestDate = repoSorted[0]?.date ?? ''
  const liveDates = liveEntries.map((e) => e.datePublished).filter(Boolean).sort()
  const liveNewestDate = liveDates.at(-1) ?? ''

  if (liveNewestDate > todayYmd) {
    return {
      ok: false,
      reason: `Live /news/ advertises future date ${liveNewestDate} (> ${todayYmd}).`,
      liveNewestDate,
      repoNewestDate,
      ageDays: null,
    }
  }

  if (liveNewestDate !== repoNewestDate) {
    return {
      ok: false,
      reason: `Live newest date (${liveNewestDate}) != repo newest date (${repoNewestDate}) — deploy may be stale.`,
      liveNewestDate,
      repoNewestDate,
      ageDays: null,
    }
  }

  const liveUrlSet = new Set(liveEntries.map((e) => e.url))

  if (Array.isArray(expectedUrls) && expectedUrls.length > 0) {
    const repoUrlSet = new Set(repoCatalog.map((i) => canonicalNewsUrl(i.url)))
    // If another scheduled run evicted an older story before deploy finished,
    // only check URLs still in current main's catalog.
    const stillInCatalog = expectedUrls.map(canonicalNewsUrl).filter((u) => repoUrlSet.has(u))
    const missing = stillInCatalog.filter((u) => !liveUrlSet.has(u))
    if (missing.length > 0) {
      return {
        ok: false,
        reason: `Submitted URL(s) not yet live on /news/: ${missing.join(', ')}`,
        liveNewestDate,
        repoNewestDate,
        ageDays: null,
      }
    }
  } else {
    const recentSlice = repoSorted.slice(0, Math.min(minRecentOverlap, repoSorted.length))
    const missing = recentSlice
      .map((item) => canonicalNewsUrl(item.url))
      .filter((u) => !liveUrlSet.has(u))
    if (missing.length > 0) {
      return {
        ok: false,
        reason: `Recent repo URL(s) missing from live /news/ JSON-LD: ${missing.join(', ')}`,
        liveNewestDate,
        repoNewestDate,
        ageDays: null,
      }
    }
  }

  const ageDays = Number(
    ((Date.parse(`${todayYmd}T00:00:00Z`) - Date.parse(`${liveNewestDate}T00:00:00Z`)) / 86_400_000).toFixed(1),
  )

  return {
    ok: true,
    reason: `Live /news/ matches repo (${liveNewestDate}, ${liveEntries.length} items, ${ageDays}d old).`,
    liveNewestDate,
    repoNewestDate,
    ageDays,
  }
}

function selfTest() {
  const now = new Date('2026-11-27T18:00:00Z')

  // 1. Late-by-10h scheduled run succeeds within 36h -> healthy
  const healthy = classifySchedule(
    [
      {
        id: 101,
        status: 'completed',
        conclusion: 'success',
        created_at: '2026-11-27T16:51:23Z',
        updated_at: '2026-11-27T17:04:00Z',
        html_url: 'https://github.com/ex/runs/101',
      },
    ],
    now,
  )
  if (!healthy.ok || healthy.status !== 'healthy') {
    throw new Error(`expected healthy, got ${JSON.stringify(healthy)}`)
  }

  // 2. Success > 36h ago -> stale
  const stale = classifySchedule(
    [
      {
        id: 100,
        status: 'completed',
        conclusion: 'success',
        created_at: '2026-11-25T17:00:00Z',
        updated_at: '2026-11-25T17:12:00Z',
        html_url: 'https://github.com/ex/runs/100',
      },
    ],
    now,
  )
  if (stale.ok || stale.status !== 'stale') {
    throw new Error(`expected stale, got ${JSON.stringify(stale)}`)
  }

  // 3. Stalled active run > 45m (even if yesterday's run passed!) -> stalled
  const stalled = classifySchedule(
    [
      {
        id: 102,
        status: 'in_progress',
        conclusion: null,
        created_at: '2026-11-27T16:50:00Z',
        run_started_at: '2026-11-27T16:50:00Z',
        html_url: 'https://github.com/ex/runs/102',
      },
      {
        id: 101,
        status: 'completed',
        conclusion: 'success',
        created_at: '2026-11-26T17:00:00Z',
        updated_at: '2026-11-26T17:12:00Z',
        html_url: 'https://github.com/ex/runs/101',
      },
    ],
    now,
  )
  if (stalled.ok || stalled.status !== 'stalled') {
    throw new Error(`expected stalled, got ${JSON.stringify(stalled)}`)
  }

  // 4. Latest completed failed while a new run is active (< 45m) -> latest_failed
  const failed = classifySchedule(
    [
      {
        id: 103,
        status: 'in_progress',
        conclusion: null,
        created_at: '2026-11-27T17:50:00Z',
        run_started_at: '2026-11-27T17:50:00Z',
        html_url: 'https://github.com/ex/runs/103',
      },
      {
        id: 102,
        status: 'completed',
        conclusion: 'failure',
        created_at: '2026-11-27T16:50:00Z',
        updated_at: '2026-11-27T16:58:00Z',
        html_url: 'https://github.com/ex/runs/102',
      },
    ],
    now,
  )
  if (failed.ok || failed.status !== 'latest_failed') {
    throw new Error(`expected latest_failed, got ${JSON.stringify(failed)}`)
  }

  // 5. Live HTML parity checks
  const makeHtml = (parts) =>
    `<html><head><script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      hasPart: parts,
    })}</script></head></html>`

  const repoSample = [
    { date: '2026-11-27', url: 'https://example.com/new/' },
    { date: '2026-11-26', url: 'https://example.com/old' },
  ]
  const liveOk = verifyLiveNewsCatalog(
    makeHtml([
      { datePublished: '2026-11-27', url: 'https://Example.COM/new' },
      { datePublished: '2026-11-26', url: 'https://example.com/old?utm_source=x' },
    ]),
    repoSample,
    { todayYmd: '2026-11-27' },
  )
  if (!liveOk.ok) throw new Error(`expected live parity ok, got ${JSON.stringify(liveOk)}`)

  const liveMissingUrl = verifyLiveNewsCatalog(
    makeHtml([{ datePublished: '2026-11-27', url: 'https://example.com/other' }]),
    repoSample,
    { todayYmd: '2026-11-27', expectedUrls: ['https://example.com/new/'] },
  )
  if (liveMissingUrl.ok) throw new Error('expected missing submitted URL to fail')

  console.log('self-test OK: check-news-health')
}

async function runCli() {
  const args = process.argv.slice(2)
  if (args.includes('--self-test')) {
    selfTest()
    return
  }

  const mode = args[0]
  if (mode === 'schedule') {
    const repo = process.env.GITHUB_REPOSITORY || 'ahmed-3m/ahmed-3m.github.io'
    const raw = execFileSync(
      'gh',
      ['api', `repos/${repo}/actions/workflows/news-update.yml/runs?branch=main&event=schedule&per_page=10`],
      { encoding: 'utf8' },
    )
    const { workflow_runs: runs = [] } = JSON.parse(raw)
    const verdict = classifySchedule(runs, new Date())
    console.log(verdict.summary)
    if (!verdict.ok) {
      console.error(`::error::${verdict.summary}`)
      process.exit(1)
    }
    return
  }

  if (mode === 'live') {
    const deltaFlag = args.indexOf('--expected-delta')
    let expectedUrls = null
    if (deltaFlag !== -1 && args[deltaFlag + 1]) {
      const delta = JSON.parse(readFileSync(args[deltaFlag + 1], 'utf8'))
      expectedUrls = (delta.items || []).map((i) => i.url)
    }
    const repoCatalog = JSON.parse(readFileSync('src/lib/news-items.json', 'utf8'))
    const urlFlag = args.indexOf('--url')
    const targetUrl = urlFlag !== -1 && args[urlFlag + 1] ? args[urlFlag + 1] : DEFAULT_LIVE_NEWS_URL

    const maxWaitFlag = args.indexOf('--wait-seconds')
    const waitSeconds = maxWaitFlag !== -1 ? Number(args[maxWaitFlag + 1]) || 0 : 0
    const deadline = Date.now() + waitSeconds * 1000

    for (;;) {
      const res = await fetch(targetUrl, { headers: { 'cache-control': 'no-cache' } })
      if (!res.ok) {
        if (Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 15_000))
          continue
        }
        console.error(`::error::${targetUrl} returned HTTP ${res.status}`)
        process.exit(1)
      }
      const html = await res.text()
      const verdict = verifyLiveNewsCatalog(html, repoCatalog, { expectedUrls })
      if (verdict.ok) {
        if (verdict.ageDays !== null && verdict.ageDays > 7) {
          console.warn(`::warning::Newest item is ${verdict.ageDays} days old (quiet days are allowed)`)
        }
        console.log(verdict.reason)
        return
      }
      if (Date.now() < deadline) {
        console.log(`Waiting for CDN propagation (${verdict.reason})...`)
        await new Promise((r) => setTimeout(r, 15_000))
        continue
      }
      console.error(`::error::${verdict.reason}`)
      process.exit(1)
    }
  }

  console.error('usage: check-news-health.mjs <schedule|live|--self-test> [--expected-delta <file>] [--wait-seconds <n>]')
  process.exit(2)
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
  await runCli()
}
