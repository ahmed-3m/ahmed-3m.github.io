// The chat Worker's request handler (spec 007, contracts/worker-api.md). Checks run in the
// contract's order and the first failing one answers:
//   origin → per-client limit → body → validation → stop switch → key → budget → upstream.
// Requests that pass validation get one telemetry point (research R9).

import { checkBudget } from './budget.js'
import { clientKey } from './client-key.js'
import { composePrompt, selectEntries } from './compose-prompt.js'
import { errorResponse } from './errors.js'
import { createPromptSource } from './prompt-source.js'
import { parseRequest } from './request.js'
import { capsFor, isStopped, modelFor, readSettings } from './settings.js'
import { recordPoint } from './telemetry.js'
import { callUpstream } from './upstream.js'

export const PROD_ORIGIN = 'https://ahmed-3m.github.io'
export const LOCALHOST_ORIGIN = 'http://localhost:3000'
export const MAX_BODY_BYTES = 64_000
export const RATE_LIMIT_RETRY_AFTER = 60

export function isAllowedOrigin(origin, settings) {
  if (!origin) return false
  if (origin === PROD_ORIGIN) return true
  return settings.allowLocalhost && origin === LOCALHOST_ORIGIN
}

export function corsHeaders(origin, allowed) {
  return {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Expose-Headers': 'X-Request-Id, Retry-After',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
    ...(allowed ? { 'Access-Control-Allow-Origin': origin } : {}),
  }
}

/** The body as text, or null when it is over `limit` bytes. */
async function readBody(request, limit) {
  if (Number(request.headers.get('Content-Length')) > limit) return null
  if (!request.body) return ''
  const reader = request.body.getReader()
  const chunks = []
  let size = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > limit) {
        await reader.cancel().catch(() => {})
        return null
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(bytes)
}

/**
 * @param {{
 *   bundledPrompt: object,
 *   now?: () => number,
 *   fetchImpl?: typeof fetch,
 *   promptFetchTimeoutMs?: number,
 *   randomId?: () => string,
 * }} options
 */
export function createHandler({
  bundledPrompt,
  now = () => Date.now(),
  fetchImpl = (input, init) => fetch(input, init),
  promptFetchTimeoutMs,
  randomId = () => crypto.randomUUID(),
}) {
  const promptSource = createPromptSource({ bundled: bundledPrompt, fetchImpl, now, timeoutMs: promptFetchTimeoutMs })

  return {
    /**
     * @param {Request} request
     * @param {Record<string, unknown>} [env]
     * @param {{ waitUntil(promise: Promise<unknown>): void }} [ctx]
     */
    async fetch(request, env = {}, ctx) {
      const requestId = randomId()
      const settings = readSettings(env)
      const origin = request.headers.get('Origin') || ''
      const allowed = isAllowedOrigin(origin, settings)
      const headers = { ...corsHeaders(origin, allowed), 'X-Request-Id': requestId }
      const fail = (code, scope, extra = {}) => errorResponse({ code, scope, requestId, headers, ...extra })

      // 1. Origin, for every method.
      if (!allowed) return fail('origin_not_allowed', 'proxy')
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
      if (request.method !== 'POST') {
        return fail('invalid_request', 'proxy', { status: 405, headers: { ...headers, Allow: 'POST, OPTIONS' } })
      }

      // 2. Per-client limit. Without the binding the Worker fails closed.
      const limiter = env.CHAT_RATE_LIMITER
      if (!limiter || typeof limiter.limit !== 'function') return fail('unavailable', 'worker')
      let limited
      try {
        const { success } = await limiter.limit({ key: clientKey(request.headers.get('CF-Connecting-IP')) })
        limited = success === false
      } catch {
        return fail('unavailable', 'worker')
      }
      if (limited) return fail('rate_limited', 'proxy', { retryAfter: RATE_LIMIT_RETRY_AFTER })

      // 3. Body: at most 64,000 bytes of JSON.
      let raw
      try {
        raw = await readBody(request, MAX_BODY_BYTES)
      } catch {
        return fail('invalid_request', 'proxy')
      }
      if (raw === null) return fail('invalid_request', 'proxy', { status: 413 })
      let body
      try {
        body = JSON.parse(raw)
      } catch {
        return fail('invalid_request', 'proxy')
      }

      // 4. Validation, against the sections, paths, titles and languages the file lists.
      const { file, source: promptOrigin } = await promptSource.get({ url: settings.promptUrl, ctx })
      const parsed = parseRequest(body, file)
      if (!parsed.ok) return fail(parsed.code, 'proxy')
      const { request: chat, format } = parsed

      // From here on, each request gets one telemetry point.
      const started = now()
      const record = (outcome, { ttfbMs = 0, totalMs = now() - started } = {}) =>
        recordPoint(env, {
          lane: chat.lane,
          provider: chat.provider,
          model: modelFor(settings, chat.provider, chat.lane),
          outcome,
          format,
          promptSource: promptOrigin,
          ttfbMs,
          totalMs,
          entryCount: selectEntries(file, chat.entryIds, chat.section).length,
        })
      const refuse = (code, scope, extra) => {
        record(code)
        return fail(code, scope, extra)
      }

      // 5. The stop switch.
      if (isStopped(env)) return refuse('unavailable', 'worker')

      // 6. The provider's key.
      const apiKey = chat.provider === 'zai' ? env.ZAI_API_KEY : env.GROQ_API_KEY
      if (typeof apiKey !== 'string' || !apiKey) return refuse('unavailable', chat.provider)

      // 7. The provider's budget. Any failure of the budget store fails closed.
      let budget
      try {
        budget = await checkBudget({
          env,
          provider: chat.provider,
          caps: capsFor(settings, chat.provider),
          now: now(),
          timeoutMs: settings.budgetTimeoutMs,
        })
      } catch {
        return refuse('unavailable', 'worker')
      }
      if (!budget.ok) return refuse('budget_exhausted', chat.provider, { retryAfter: budget.retryAfterSeconds })

      // 8. The Worker's own prompt, and the upstream call with its deadlines.
      const prompt = composePrompt(file, chat)
      return callUpstream({
        fetchImpl,
        provider: chat.provider,
        lane: chat.lane,
        settings,
        apiKey,
        prompt,
        turns: chat.turns,
        stream: chat.stream,
        requestId,
        headers,
        now,
        onDone: ({ outcome, ttfbMs, totalMs }) => record(outcome, { ttfbMs, totalMs }),
      })
    },
  }
}
