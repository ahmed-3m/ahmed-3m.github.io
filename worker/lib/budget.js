// Per-provider budgets (spec 007, research R6). One Durable Object per provider counts the
// requests in a fixed 5-hour and a fixed daily UTC window. Check and count are one call, and
// a Durable Object runs one request at a time, so they cannot interleave. The object holds no
// visitor data. No `cloudflare:` import: the class loads in Node for the self-test.

export const FIVE_HOUR_MS = 5 * 60 * 60 * 1000
export const DAY_MS = 24 * 60 * 60 * 1000
const KINDS = /** @type {const} */ ([
  ['fiveHour', FIVE_HOUR_MS],
  ['day', DAY_MS],
])

/** The window IDs for a time. */
export function windowIds(nowMs) {
  return { fiveHour: Math.floor(nowMs / FIVE_HOUR_MS), day: Math.floor(nowMs / DAY_MS) }
}

/**
 * Counts one request when both windows have room. A counter whose window changed starts
 * again at 0. A refused request is not counted.
 *
 * @param {{ get(key: string): Promise<unknown>, put(key: string, value: unknown): Promise<void> | void }} store
 * @param {{ caps: { fiveHour: number, day: number }, now: number }} options
 * @returns {Promise<{ ok: boolean, retryAfterSeconds?: number }>}
 */
export async function consume(store, { caps, now }) {
  const ids = windowIds(now)
  const counts = {}
  let retryAfterMs = 0
  for (const [kind, length] of KINDS) {
    const saved = /** @type {{ id?: number, count?: number } | undefined} */ (await store.get(kind))
    const count = saved && saved.id === ids[kind] && Number.isInteger(saved.count) ? saved.count : 0
    counts[kind] = count
    if (count >= caps[kind]) retryAfterMs = Math.max(retryAfterMs, (ids[kind] + 1) * length - now)
  }
  if (retryAfterMs > 0) return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) }
  for (const [kind] of KINDS) await store.put(kind, { id: ids[kind], count: counts[kind] + 1 })
  return { ok: true }
}

function validCaps(caps) {
  return !!caps && KINDS.every(([kind]) => Number.isInteger(caps[kind]) && caps[kind] > 0)
}

/**
 * The budget Durable Object (SQLite-backed; its key-value methods are stored in SQLite). Its
 * `fetch` reads `{ caps, now }` and answers `{ ok, retryAfterSeconds }`.
 */
export class GenieBudget {
  constructor(state, env) {
    this.state = state
    this.env = env
  }

  async fetch(request) {
    let input
    try {
      input = await request.json()
    } catch {
      return Response.json({ error: 'bad request' }, { status: 400 })
    }
    if (!validCaps(input?.caps) || !Number.isFinite(input?.now)) {
      return Response.json({ error: 'bad request' }, { status: 400 })
    }
    return Response.json(await consume(this.state.storage, { caps: input.caps, now: input.now }))
  }
}

/**
 * Asks the provider's budget object for one request. Throws on any failure (no binding, an
 * error, a timeout, a bad answer), so the caller fails closed.
 *
 * @returns {Promise<{ ok: boolean, retryAfterSeconds?: number }>}
 */
export async function checkBudget({ env, provider, caps, now, timeoutMs }) {
  const namespace = env.GENIE_BUDGET
  if (!namespace || typeof namespace.idFromName !== 'function') throw new Error('budget binding missing')
  const stub = namespace.get(namespace.idFromName(provider))
  let timer
  const timeout = new Promise((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error('budget timeout')), timeoutMs)
  })
  try {
    const response = await Promise.race([
      stub.fetch('https://genie-budget/consume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caps, now }),
      }),
      timeout,
    ])
    if (!response.ok) throw new Error(`budget status ${response.status}`)
    const data = await Promise.race([response.json(), timeout])
    if (!data || typeof data.ok !== 'boolean') throw new Error('budget answer malformed')
    if (data.ok) return { ok: true }
    const retryAfterSeconds = Number.isFinite(data.retryAfterSeconds) && data.retryAfterSeconds > 0 ? data.retryAfterSeconds : 60
    return { ok: false, retryAfterSeconds }
  } finally {
    clearTimeout(timer)
  }
}
