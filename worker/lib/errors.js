// The Worker's one error structure (spec 007, contracts/worker-api.md "Errors").
// Messages are fixed text: never provider text, a setting or secret name, or a model name.

export const PROVIDER_UNAVAILABLE_MESSAGE = 'This model is unavailable right now.'
export const WORKER_UNAVAILABLE_MESSAGE = 'Models are unavailable right now.'

/** Code → default status and fixed message. */
export const ERROR_CODES = {
  invalid_request: { status: 400, message: 'Invalid request.' },
  origin_not_allowed: { status: 403, message: 'Origin not allowed.' },
  rate_limited: { status: 429, message: 'Rate limit exceeded. Please try again later.' },
  budget_exhausted: { status: 503, message: PROVIDER_UNAVAILABLE_MESSAGE },
  unavailable: { status: 503, message: PROVIDER_UNAVAILABLE_MESSAGE },
  upstream_error: { status: 502, message: 'The model could not answer.' },
  upstream_timeout: { status: 504, message: 'The model took too long to answer.' },
}

export const SCOPES = new Set(['proxy', 'worker', 'zai', 'groq'])

/** The error object, as the body of a response and inside a stream's error event. */
export function errorBody({ code, scope, retryAfter, requestId }) {
  const entry = ERROR_CODES[code]
  if (!entry) throw new Error(`Unknown error code ${code}`)
  if (!SCOPES.has(scope)) throw new Error(`Unknown error scope ${scope}`)
  const message = code === 'unavailable' && scope === 'worker' ? WORKER_UNAVAILABLE_MESSAGE : entry.message
  const body = { error: { code, message }, scope }
  if (Number.isFinite(retryAfter) && retryAfter > 0) body.retryAfter = Math.ceil(retryAfter)
  body.requestId = requestId
  return body
}

/**
 * A JSON error response. `status` overrides the code's default (405 and 413 for
 * `invalid_request`); `headers` carries the CORS headers and the request ID.
 */
export function errorResponse({ code, scope, retryAfter, requestId, status, headers = {} }) {
  const body = errorBody({ code, scope, retryAfter, requestId })
  const extra = body.retryAfter ? { 'Retry-After': String(body.retryAfter) } : {}
  return new Response(JSON.stringify(body), {
    status: status ?? ERROR_CODES[code].status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers, ...extra },
  })
}

/** The standard error event inside a stream: `data: <error object>` and a blank line. */
export function errorEvent({ code, scope, retryAfter, requestId }) {
  return `data: ${JSON.stringify(errorBody({ code, scope, retryAfter, requestId }))}\n\n`
}
