import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { DAY_MS, FIVE_HOUR_MS, checkBudget, consume, windowIds } from '../../worker/lib/budget.js'

// Spec 007 PR 3 (research R6): the budget counter, with an in-memory store in place of the
// Durable Object's storage.

const T0 = Date.UTC(2026, 10, 28, 12, 0, 0)

function store() {
  const map = new Map<string, unknown>()
  return {
    map,
    async get(key: string) {
      return structuredClone(map.get(key))
    },
    async put(key: string, value: unknown) {
      map.set(key, structuredClone(value))
    },
  }
}

describe('windowIds', () => {
  it('changes exactly at each window edge (fixed UTC windows)', () => {
    const fiveHourStart = Math.floor(T0 / FIVE_HOUR_MS) * FIVE_HOUR_MS
    const dayStart = Date.UTC(2026, 10, 28)
    assert.equal(windowIds(fiveHourStart - 1).fiveHour + 1, windowIds(fiveHourStart).fiveHour)
    assert.equal(windowIds(fiveHourStart).fiveHour, windowIds(fiveHourStart + FIVE_HOUR_MS - 1).fiveHour)
    assert.equal(windowIds(dayStart - 1).day + 1, windowIds(dayStart).day)
    assert.equal(windowIds(dayStart).day, windowIds(dayStart + DAY_MS - 1).day)
    assert.deepEqual(windowIds(0), { fiveHour: 0, day: 0 })
  })

  it('counts five-hour windows from the epoch, not from midnight', () => {
    assert.equal(FIVE_HOUR_MS, 18_000_000)
    assert.equal(DAY_MS, 86_400_000)
    assert.equal(windowIds(Date.UTC(1970, 0, 1, 5)).fiveHour, 1)
    assert.equal(windowIds(Date.UTC(1970, 0, 2, 1)).fiveHour, 5, 'the sixth window starts at 01:00 on day two')
  })
})

describe('consume', () => {
  const caps = { fiveHour: 3, day: 10 }

  it('allows N requests, refuses N+1 until the window ends, and does not count the refusal', async () => {
    const s = store()
    for (let i = 0; i < 3; i++) assert.deepEqual(await consume(s, { caps, now: T0 + i }), { ok: true })
    const windowEnd = (Math.floor(T0 / FIVE_HOUR_MS) + 1) * FIVE_HOUR_MS
    const refused = await consume(s, { caps, now: T0 + 10 })
    assert.deepEqual(refused, { ok: false, retryAfterSeconds: Math.ceil((windowEnd - T0 - 10) / 1000) })
    await consume(s, { caps, now: T0 + 20 })
    assert.deepEqual(s.map.get('fiveHour'), { id: windowIds(T0).fiveHour, count: 3 }, 'refusals are not counted')
    assert.deepEqual(s.map.get('day'), { id: windowIds(T0).day, count: 3 })
  })

  it('gives at least one second to retry, even at the last millisecond of a window', async () => {
    const s = store()
    const windowEnd = (Math.floor(T0 / FIVE_HOUR_MS) + 1) * FIVE_HOUR_MS
    await consume(s, { caps: { fiveHour: 1, day: 10 }, now: windowEnd - 2 })
    assert.deepEqual(await consume(s, { caps: { fiveHour: 1, day: 10 }, now: windowEnd - 1 }), { ok: false, retryAfterSeconds: 1 })
    assert.deepEqual(await consume(s, { caps: { fiveHour: 1, day: 10 }, now: windowEnd }), { ok: true })
  })

  it('resets the five-hour count in a new window and keeps the daily count', async () => {
    const s = store()
    for (let i = 0; i < 3; i++) await consume(s, { caps, now: T0 })
    const next = (Math.floor(T0 / FIVE_HOUR_MS) + 1) * FIVE_HOUR_MS
    assert.equal(windowIds(next).day, windowIds(T0).day, 'the test needs both times on one day')
    assert.deepEqual(await consume(s, { caps, now: next }), { ok: true })
    assert.deepEqual(s.map.get('fiveHour'), { id: windowIds(next).fiveHour, count: 1 })
    assert.deepEqual(s.map.get('day'), { id: windowIds(T0).day, count: 4 })
  })

  it('refuses when the daily count is full, even in a fresh five-hour window, until the day ends', async () => {
    const s = store()
    const daily = { fiveHour: 5, day: 2 }
    await consume(s, { caps: daily, now: T0 })
    await consume(s, { caps: daily, now: T0 })
    const later = T0 + FIVE_HOUR_MS
    const dayEnd = Date.UTC(2026, 10, 29)
    assert.deepEqual(await consume(s, { caps: daily, now: later }), { ok: false, retryAfterSeconds: Math.ceil((dayEnd - later) / 1000) })
    assert.deepEqual(await consume(s, { caps: daily, now: dayEnd }), { ok: true }, 'a new day')
  })

  it('when both counts are full, waits for the later of the two windows', async () => {
    const s = store()
    const both = { fiveHour: 1, day: 1 }
    await consume(s, { caps: both, now: T0 })
    const dayEnd = Date.UTC(2026, 10, 29)
    assert.deepEqual(await consume(s, { caps: both, now: T0 }), { ok: false, retryAfterSeconds: (dayEnd - T0) / 1000 })
  })

  it('treats a damaged stored count as zero', async () => {
    const s = store()
    s.map.set('fiveHour', { id: windowIds(T0).fiveHour, count: 'many' })
    s.map.set('day', null)
    assert.deepEqual(await consume(s, { caps, now: T0 }), { ok: true })
    assert.deepEqual(s.map.get('fiveHour'), { id: windowIds(T0).fiveHour, count: 1 })
  })
})

describe('checkBudget', () => {
  const namespace = (fetch: (url: string, init: RequestInit) => Promise<Response>) => ({
    idFromName: (name: string) => ({ name }),
    get: () => ({ fetch }),
  })
  const call = (fetch: (url: string, init: RequestInit) => Promise<Response>, timeoutMs = 50) =>
    checkBudget({ env: { GENIE_BUDGET: namespace(fetch) }, provider: 'zai', caps: { fiveHour: 1, day: 1 }, now: T0, timeoutMs })

  it('passes the answer through', async () => {
    assert.deepEqual(await call(async () => Response.json({ ok: true })), { ok: true })
    assert.deepEqual(await call(async () => Response.json({ ok: false, retryAfterSeconds: 42 })), { ok: false, retryAfterSeconds: 42 })
  })

  it('sends the caps and the time to the provider’s own object', async () => {
    let seen: { name?: string; body?: unknown } = {}
    const env = {
      GENIE_BUDGET: {
        idFromName: (name: string) => ({ name }),
        get: (id: { name: string }) => ({
          fetch: async (_url: string, init: RequestInit) => {
            seen = { name: id.name, body: JSON.parse(String(init.body)) }
            return Response.json({ ok: true })
          },
        }),
      },
    }
    await checkBudget({ env, provider: 'groq', caps: { fiveHour: 2, day: 3 }, now: T0, timeoutMs: 50 })
    assert.deepEqual(seen, { name: 'groq', body: { caps: { fiveHour: 2, day: 3 }, now: T0 } })
  })

  it('throws on a missing binding, an error, a timeout, a non-OK status or a bad answer', async () => {
    await assert.rejects(checkBudget({ env: {}, provider: 'zai', caps: { fiveHour: 1, day: 1 }, now: T0, timeoutMs: 50 }))
    await assert.rejects(call(async () => { throw new Error('down') }))
    await assert.rejects(call(() => new Promise<Response>(() => {}), 20))
    await assert.rejects(call(async () => new Response('no', { status: 500 })))
    await assert.rejects(call(async () => Response.json({ allowed: true })))
    await assert.rejects(call(async () => new Response('not json')))
  })
})
