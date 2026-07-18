/**
 * Build-time GitHub activity fetcher.
 *
 * Calls the public Events API for ahmed-3m, filters noise, ranks by signal,
 * enforces per-repo diversity, and writes src/lib/github-activity.json.
 *
 * Auth: optional process.env.GITHUB_TOKEN (higher rate limit in Actions).
 * Failure mode: ANY error (network, rate-limit, bad response) logs a warning
 * and exits 0, leaving the existing committed JSON untouched so local/PR
 * builds never break.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const USERNAME = 'ahmed-3m'
const MAX_ITEMS = 6
/** Soft cap so the strip does not read as "only edits own website". */
const MAX_PER_REPO = 3
const API_BASE = 'https://api.github.com'

// Drop pure noise. Keep forks only when the user is forking their own work
// or the fork is of their own org (rare); otherwise low-value social forks go.
const DROP_TYPES = new Set(['WatchEvent', 'MemberEvent', 'GollumEvent'])

/**
 * Signal tiers for ranking before truncation (lower = higher signal).
 * Recency breaks ties within a tier.
 */
const TIER = {
  ReleaseEvent: 0,
  CreateRepo: 0,
  PullRequestMerged: 1,
  PullRequestEvent: 2,
  PushEvent: 3,
  Default: 4,
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..', '..')
const OUT_PATH = join(REPO_ROOT, 'src', 'lib', 'github-activity.json')

function warn(msg) {
  console.warn(`[fetch-activity] ${msg}`)
}

function headers() {
  const h = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ahmed-3m-portfolio-activity',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return h
}

/**
 * @param {string} path
 * @returns {Promise<unknown>}
 */
async function ghGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: headers() })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`GitHub ${res.status} ${path}: ${body.slice(0, 200)}`)
  }
  return res.json()
}

/**
 * Build a human message + canonical public URL for a public event.
 * @param {Record<string, unknown>} event
 * @returns {{ message: string, url: string, type: string, tier: number } | null}
 */
function normalizeEvent(event) {
  const type = String(event.type || '')
  if (DROP_TYPES.has(type)) return null

  const repo = /** @type {{ name?: string; url?: string } | undefined} */ (event.repo)
  const repoName = repo?.name
  if (!repoName) return null

  const repoUrl = `https://github.com/${repoName}`
  const payload = /** @type {Record<string, unknown>} */ (event.payload || {})

  // Low-value forks of other people's repos (social "I forked this") — skip.
  if (type === 'ForkEvent') {
    const forkee = /** @type {{ full_name?: string } | undefined} */ (payload.forkee)
    // Keep only if it's somehow under the user's namespace (their fork of their own).
    if (!forkee?.full_name?.startsWith(`${USERNAME}/`)) return null
    return {
      type: 'ForkEvent',
      message: `Forked ${repoName}`,
      url: forkee.full_name ? `https://github.com/${forkee.full_name}` : repoUrl,
      tier: TIER.Default,
    }
  }

  if (type === 'PushEvent') {
    const commits = Array.isArray(payload.commits) ? payload.commits : []
    const size = typeof payload.size === 'number' ? payload.size : commits.length
    const ref = typeof payload.ref === 'string' ? payload.ref.replace(/^refs\/heads\//, '') : 'main'
    const first = /** @type {{ message?: string; sha?: string; url?: string } | undefined} */ (commits[0])
    const head = typeof payload.head === 'string' ? payload.head : first?.sha
    const subject = first?.message?.split('\n')[0]?.trim()
    // Prefer the first commit subject; only fall back when no subject is available.
    const message = subject
      ? subject
      : size > 1
        ? `Pushed ${size} commits to ${ref}`
        : `Pushed to ${ref}`
    const url = head ? `${repoUrl}/commit/${head}` : `${repoUrl}/commits/${ref}`
    return { type, message, url, tier: TIER.PushEvent }
  }

  if (type === 'CreateEvent') {
    const refType = String(payload.ref_type || 'repository')
    const ref = payload.ref ? String(payload.ref) : null
    // Branch creates are noise (WIP names, short-lived feature branches).
    if (refType === 'branch') return null
    if (refType === 'repository') {
      return {
        type,
        message: `Created repository ${repoName}`,
        url: repoUrl,
        tier: TIER.CreateRepo,
      }
    }
    if (refType === 'tag' && ref) {
      return {
        type,
        message: `Created tag ${ref}`,
        url: `${repoUrl}/releases/tag/${encodeURIComponent(ref)}`,
        tier: TIER.Default,
      }
    }
    return {
      type,
      message: `Created ${refType}${ref ? ` ${ref}` : ''}`,
      url: repoUrl,
      tier: TIER.Default,
    }
  }

  if (type === 'DeleteEvent') {
    // Rarely interesting on a portfolio strip.
    return null
  }

  if (type === 'ReleaseEvent') {
    const release = /** @type {{ tag_name?: string; name?: string; html_url?: string } | undefined} */ (
      payload.release
    )
    const tag = release?.tag_name || 'release'
    const name = release?.name || tag
    return {
      type,
      message: `Released ${name}`,
      url: release?.html_url || `${repoUrl}/releases`,
      tier: TIER.ReleaseEvent,
    }
  }

  if (type === 'PublicEvent') {
    return { type, message: `Made ${repoName} public`, url: repoUrl, tier: TIER.Default }
  }

  if (type === 'IssuesEvent') {
    const action = String(payload.action || 'updated')
    const issue = /** @type {{ title?: string; html_url?: string; number?: number } | undefined} */ (
      payload.issue
    )
    if (!issue?.html_url) return null
    return {
      type,
      message: `${capitalize(action)} issue #${issue.number ?? ''}: ${issue.title || ''}`.trim(),
      url: issue.html_url,
      tier: TIER.Default,
    }
  }

  if (type === 'IssueCommentEvent') {
    const comment = /** @type {{ html_url?: string } | undefined} */ (payload.comment)
    const issue = /** @type {{ title?: string; number?: number } | undefined} */ (payload.issue)
    if (!comment?.html_url) return null
    return {
      type,
      message: `Commented on issue #${issue?.number ?? ''}: ${issue?.title || ''}`.trim(),
      url: comment.html_url,
      tier: TIER.Default,
    }
  }

  if (type === 'PullRequestEvent') {
    // Public Events API returns a reduced payload: often no html_url/title/merged,
    // action may be "merged" (not just opened/closed), number may be on payload.
    const action = String(payload.action || 'updated')
    const pr = /** @type {{ title?: string; html_url?: string; number?: number; merged?: boolean } | undefined} */ (
      payload.pull_request
    )
    const number = pr?.number ?? (typeof payload.number === 'number' ? payload.number : null)
    if (number == null) return null
    const merged = action === 'merged' || Boolean(pr?.merged && action === 'closed')
    const verb = merged ? 'Merged' : capitalize(action === 'merged' ? 'merged' : action)
    const title = pr?.title?.trim()
    const message = title ? `${verb} PR #${number}: ${title}` : `${verb} PR #${number}`
    const url = pr?.html_url || `${repoUrl}/pull/${number}`
    return {
      type,
      message,
      url,
      tier: merged ? TIER.PullRequestMerged : TIER.PullRequestEvent,
    }
  }

  if (type === 'PullRequestReviewEvent') {
    // Reduced Events payload: reconstruct PR URL when html_url is absent.
    const review = /** @type {{ html_url?: string } | undefined} */ (payload.review)
    const pr = /** @type {{ title?: string; number?: number; html_url?: string } | undefined} */ (
      payload.pull_request
    )
    const number = pr?.number ?? (typeof payload.number === 'number' ? payload.number : null)
    const url = review?.html_url || pr?.html_url || (number != null ? `${repoUrl}/pull/${number}` : null)
    if (!url) return null
    const title = pr?.title?.trim()
    const message =
      number != null
        ? title
          ? `Reviewed PR #${number}: ${title}`
          : `Reviewed PR #${number}`
        : `Reviewed a pull request in ${repoName}`
    return {
      type,
      message,
      url,
      tier: TIER.Default,
    }
  }

  if (type === 'CommitCommentEvent') {
    const comment = /** @type {{ html_url?: string } | undefined} */ (payload.comment)
    if (!comment?.html_url) return null
    return {
      type,
      message: `Commented on a commit in ${repoName}`,
      url: comment.html_url,
      tier: TIER.Default,
    }
  }

  // Fallback: still show something honest for other public event types.
  return {
    type,
    message: `${type.replace(/Event$/, '')} on ${repoName}`,
    url: repoUrl,
    tier: TIER.Default,
  }
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/**
 * @param {{ tier: number, createdAt: string }} a
 * @param {{ tier: number, createdAt: string }} b
 */
function byTierThenRecency(a, b) {
  if (a.tier !== b.tier) return a.tier - b.tier
  // Newer first within the same tier.
  return b.createdAt.localeCompare(a.createdAt)
}

/**
 * Rank candidates, then take top MAX_ITEMS with at most MAX_PER_REPO per repo.
 * @param {Array<{ id: string, type: string, repo: string, message: string, url: string, createdAt: string, tier: number }>} candidates
 */
function selectItems(candidates) {
  const ranked = [...candidates].sort(byTierThenRecency)
  /** @type {typeof candidates} */
  const selected = []
  /** @type {Map<string, number>} */
  const perRepo = new Map()

  for (const item of ranked) {
    if (selected.length >= MAX_ITEMS) break
    const count = perRepo.get(item.repo) || 0
    if (count >= MAX_PER_REPO) continue
    perRepo.set(item.repo, count + 1)
    selected.push(item)
  }

  // Present newest-first in the final JSON so dates read sensibly.
  selected.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return selected
}

/**
 * Optionally pull recently-pushed public repos as soft signal when slots remain
 * after ranking + per-repo cap. Uses /users/{user}/repos?sort=pushed.
 * @returns {Promise<Array<{ id: string, type: string, repo: string, message: string, url: string, createdAt: string, tier: number }>>}
 */
async function recentRepos() {
  const repos = /** @type {Array<Record<string, unknown>>} */ (
    await ghGet(`/users/${USERNAME}/repos?sort=pushed&direction=desc&per_page=12&type=owner`)
  )
  return repos
    .filter((r) => !r.fork && !r.private)
    .map((r) => {
      const full = String(r.full_name || r.name || '')
      const pushed = String(r.pushed_at || r.updated_at || new Date().toISOString())
      const desc = typeof r.description === 'string' && r.description.trim() ? r.description.trim() : null
      return {
        id: `repo-${r.id}`,
        type: 'Repository',
        repo: full,
        message: desc ? `Updated ${full} — ${desc}` : `Updated ${full}`,
        url: String(r.html_url || `https://github.com/${full}`),
        createdAt: pushed,
        // Backfill should not outrank real high-signal events when mixed in ranking.
        tier: TIER.Default,
      }
    })
}

/**
 * Strip internal ranking field before writing JSON.
 * @param {{ id: string, type: string, repo: string, message: string, url: string, createdAt: string, tier?: number }} item
 */
function toPublicItem(item) {
  return {
    id: item.id,
    type: item.type,
    repo: item.repo,
    message: item.message,
    url: item.url,
    createdAt: item.createdAt,
  }
}

/**
 * Truncate a PR title to ~maxLen on a word boundary, appending an ellipsis.
 * @param {string} title
 * @param {number} [maxLen=80]
 */
function truncateTitle(title, maxLen = 80) {
  const t = title.trim()
  if (t.length <= maxLen) return t
  const slice = t.slice(0, maxLen)
  const lastSpace = slice.lastIndexOf(' ')
  // Prefer a word boundary when it still leaves a meaningful prefix.
  const cut = lastSpace >= Math.floor(maxLen * 0.5) ? lastSpace : maxLen
  return `${slice.slice(0, cut).trimEnd()}…`
}

/**
 * Enrich PullRequestEvent messages with real titles via GET /repos/{repo}/pulls/{n}.
 * Public Events API omits `title` in the reduced payload, so one cheap call per
 * final item is needed. Only the post-truncation ≤MAX_ITEMS list is enriched.
 *
 * Unauthenticated local runs may hit the 60/hr GitHub rate limit and simply fall
 * back to bare "Merged PR #<n>" messages — each call is isolated in try/catch so
 * a failed enrichment never throws, never aborts the run, and never changes exit 0.
 *
 * @param {Array<{ id: string, type: string, repo: string, message: string, url: string, createdAt: string, tier: number }>} items
 */
async function enrichPullRequestTitles(items) {
  for (const item of items) {
    if (item.type !== 'PullRequestEvent') continue

    // Extract PR number from message ("Merged PR #34") or URL (.../pull/34).
    const fromMsg = item.message.match(/PR #(\d+)/i)
    const fromUrl = item.url.match(/\/pull\/(\d+)/)
    const number = fromMsg?.[1] ?? fromUrl?.[1]
    if (!number || !item.repo) continue

    // Already has a title (e.g. full payload in some environments) — leave alone.
    if (/PR #\d+:\s+\S/.test(item.message)) continue

    try {
      const pr = /** @type {{ title?: string } | null} */ (
        await ghGet(`/repos/${item.repo}/pulls/${number}`)
      )
      const title = typeof pr?.title === 'string' ? pr.title.trim() : ''
      if (!title) continue

      // Preserve the existing verb prefix ("Merged PR #34" → "Merged PR #34: …").
      const base = item.message.match(/^(Merged|Opened|Closed|Reopened|Updated) PR #\d+/i)?.[0]
      if (!base) continue
      item.message = `${base}: ${truncateTitle(title)}`
    } catch {
      // Rate-limit, network, non-200, or any other error: keep bare message.
    }
  }
}

async function main() {
  try {
    // Pull a full page so ranking + per-repo cap have enough pool to work with.
    const events = /** @type {Array<Record<string, unknown>>} */ (
      await ghGet(`/users/${USERNAME}/events/public?per_page=100`)
    )

    if (!Array.isArray(events)) {
      warn('Unexpected response shape for public events — keeping previous snapshot.')
      return
    }

    /** @type {Array<{ id: string, type: string, repo: string, message: string, url: string, createdAt: string, tier: number }>} */
    const candidates = []
    const seen = new Set()

    for (const event of events) {
      const normalized = normalizeEvent(event)
      if (!normalized) continue

      const repo = /** @type {{ name?: string } | undefined} */ (event.repo)
      const createdAt = String(event.created_at || '')
      if (!createdAt) continue

      // Dedupe on event id (preferred) or url — distinct events must survive.
      const dedupeKey = String(event.id || normalized.url)
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)

      candidates.push({
        id: String(event.id || `${createdAt}-${candidates.length}`),
        type: normalized.type,
        repo: String(repo?.name || ''),
        message: normalized.message,
        url: normalized.url,
        createdAt,
        tier: normalized.tier,
      })
    }

    let items = selectItems(candidates)

    // Backfill whenever slots remain after ranking + per-repo cap (not only when
    // the raw event pool was thin). Surfaces real project repos for diversity.
    if (items.length < MAX_ITEMS) {
      try {
        const repos = await recentRepos()
        const alreadyRepos = new Set(items.map((i) => i.repo))
        /** @type {Map<string, number>} */
        const perRepo = new Map()
        for (const i of items) {
          perRepo.set(i.repo, (perRepo.get(i.repo) || 0) + 1)
        }

        for (const r of repos) {
          if (items.length >= MAX_ITEMS) break
          // Prefer repos we have not already shown via events.
          if (alreadyRepos.has(r.repo)) continue
          const count = perRepo.get(r.repo) || 0
          if (count >= MAX_PER_REPO) continue
          if (seen.has(r.id) || seen.has(r.url)) continue
          seen.add(r.id)
          perRepo.set(r.repo, count + 1)
          alreadyRepos.add(r.repo)
          items.push(r)
        }

        // Re-sort newest-first after backfill.
        items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        items = items.slice(0, MAX_ITEMS)
      } catch (err) {
        warn(`Pinned/recent repos fallback failed (non-fatal): ${err instanceof Error ? err.message : err}`)
      }
    }

    if (items.length === 0) {
      warn('No meaningful public events found — keeping previous snapshot.')
      return
    }

    // Enrich only the final ≤MAX_ITEMS PR rows (not the pre-truncation pool).
    await enrichPullRequestTitles(items)

    const snapshot = {
      updatedAt: new Date().toISOString(),
      source: `https://github.com/${USERNAME}`,
      items: items.map(toPublicItem),
    }

    mkdirSync(dirname(OUT_PATH), { recursive: true })
    writeFileSync(OUT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
    console.log(`[fetch-activity] Wrote ${snapshot.items.length} items → ${relative(REPO_ROOT, OUT_PATH)}`)
  } catch (err) {
    warn(`Fetch failed — keeping previous snapshot. ${err instanceof Error ? err.message : err}`)
  }
}

// Never throw out of the process: failures must leave the committed JSON intact
// and exit 0 so deploy builds are not blocked by a rate limit or outage.
main().catch((err) => {
  warn(`Unexpected failure — keeping previous snapshot. ${err instanceof Error ? err.message : err}`)
})
