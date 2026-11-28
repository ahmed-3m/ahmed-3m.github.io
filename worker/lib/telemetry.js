// Content-free telemetry (spec 007, research R9): one Analytics Engine data point for each
// request that passes validation. No message text, IP address, user agent, request ID or
// country. `writeDataPoint` returns nothing, so no `waitUntil` is needed.

export const OUTCOMES = new Set([
  'ok',
  'client_abort',
  'unavailable',
  'budget_exhausted',
  'upstream_error',
  'upstream_timeout',
])

/**
 * @param {{ GENIE_EVENTS?: { writeDataPoint(point: object): void } }} env
 * @param {{ lane: string, provider: string, model: string, outcome: string, format: string,
 *   promptSource: string, ttfbMs: number, totalMs: number, entryCount: number }} point
 */
export function recordPoint(env, point) {
  const dataset = env?.GENIE_EVENTS
  if (!dataset || typeof dataset.writeDataPoint !== 'function') return
  const number = (value) => (Number.isFinite(value) && value >= 0 ? Math.round(value) : 0)
  try {
    dataset.writeDataPoint({
      indexes: [point.provider],
      blobs: [point.lane, point.provider, point.model, point.outcome, point.format, point.promptSource],
      doubles: [number(point.ttfbMs), number(point.totalMs), number(point.entryCount)],
    })
  } catch {
    // Telemetry never changes an answer.
  }
}
