/**
 * GitHub activity snapshot.
 *
 * Data is written at build time by `.github/activity/fetch-activity.mjs`
 * (run from the deploy workflow) into `github-activity.json`. The site
 * imports that JSON at build time — zero runtime GitHub fetches.
 *
 * On fetch failure the script exits 0 and leaves this committed snapshot
 * untouched so local/PR builds always have something to render.
 */

import raw from '@/lib/github-activity.json'

/** Meaningful public event types kept by the fetch script. */
export type GitHubActivityType =
  | 'PushEvent'
  | 'CreateEvent'
  | 'ReleaseEvent'
  | 'PublicEvent'
  | 'IssuesEvent'
  | 'IssueCommentEvent'
  | 'PullRequestEvent'
  | 'PullRequestReviewEvent'
  | 'CommitCommentEvent'
  | 'ForkEvent'
  | 'Repository'

export interface GitHubActivityItem {
  /** Stable event id from GitHub (or a synthetic id for repo backfill). */
  id: string
  /** GitHub event type, e.g. 'PushEvent'. */
  type: GitHubActivityType
  /** full_name, e.g. 'ahmed-3m/ahmed-3m.github.io'. */
  repo: string
  /** Human-readable one-line summary. */
  message: string
  /** Absolute public GitHub URL for the event/commit/PR. */
  url: string
  /** ISO-8601 timestamp from GitHub. */
  createdAt: string
}

export interface GitHubActivitySnapshot {
  /** When the snapshot was last successfully refreshed. */
  updatedAt: string
  /** Profile URL the data came from. */
  source: string
  items: GitHubActivityItem[]
}

const EMPTY_SNAPSHOT: GitHubActivitySnapshot = {
  updatedAt: '1970-01-01T00:00:00.000Z',
  source: 'https://github.com/ahmed-3m',
  items: [],
}

function isItem(value: unknown): value is GitHubActivityItem {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.type === 'string' &&
    typeof v.repo === 'string' &&
    typeof v.message === 'string' &&
    typeof v.url === 'string' &&
    typeof v.createdAt === 'string' &&
    /^https?:\/\//.test(v.url)
  )
}

/**
 * Validate a snapshot. On failure, warn and return an empty snapshot so a
 * malformed committed JSON never breaks `npm run build`.
 */
function validateSnapshot(data: unknown): GitHubActivitySnapshot {
  try {
    if (!data || typeof data !== 'object') {
      throw new Error('github-activity.json: root must be an object')
    }
    const d = data as Record<string, unknown>
    if (typeof d.updatedAt !== 'string' || Number.isNaN(new Date(d.updatedAt).getTime())) {
      throw new Error('github-activity.json: updatedAt must be a valid ISO timestamp')
    }
    if (typeof d.source !== 'string' || !/^https?:\/\//.test(d.source)) {
      throw new Error('github-activity.json: source must be an absolute http(s) URL')
    }
    if (!Array.isArray(d.items)) {
      throw new Error('github-activity.json: items must be an array')
    }
    for (const item of d.items) {
      if (!isItem(item)) {
        throw new Error('github-activity.json: malformed activity item')
      }
    }
    return d as unknown as GitHubActivitySnapshot
  } catch (err) {
    console.warn(
      `[github-activity] Invalid snapshot — rendering empty state. ${err instanceof Error ? err.message : err}`,
    )
    return EMPTY_SNAPSHOT
  }
}

const snapshot = validateSnapshot(raw)

/** Full committed snapshot (build-time import). */
export function getGitHubActivity(): GitHubActivitySnapshot {
  return snapshot
}

/** Items only, newest first (API already returns newest-first). */
export function getGitHubActivityItems(): GitHubActivityItem[] {
  return snapshot.items
}
