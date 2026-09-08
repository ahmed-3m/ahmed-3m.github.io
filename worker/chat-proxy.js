/**
 * Cloudflare Worker: ahmed-chat-proxy
 *
 * Proxies chat completion requests from the portfolio's ChatBot to the Zhipu
 * BigModel API (GLM Coding Plan) so the real API key never ships to the browser
 * bundle. The browser POSTs a plain `{ messages, model, max_tokens, temperature }`
 * body; the Worker attaches `Authorization: Bearer ${env.ZAI_API_KEY}` and
 * forwards the request to BigModel.
 *
 * Env:
 *   ZAI_API_KEY  (secret)  The real Zhipu BigModel API key. Set via
 *                         `wrangler secret put ZAI_API_KEY`. (The binding name is
 *                         kept for backward compatibility with existing deployments;
 *                         the value it holds is a BigModel key, not a Z.ai one.)
 *   CHAT_RATE_KV (optional KV namespace binding) for simple IP-based rate limiting.
 *
 * See worker/README.md for deployment and usage.
 */

const ZAI_CHAT_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions'
// Keep in sync with ZAI_MODEL in src/components/ChatBot.tsx. GLM-5.3 always
// runs with thinking enabled and rejects `thinking: { type: 'disabled' }`
// (which GLM-4.5 accepted), so the Worker must not inject that parameter.
const DEFAULT_MODEL = 'glm-5.3'
// glm-5.3 thinks before answering and thinking tokens count against
// max_tokens, so deep-lane requests legitimately need a large ceiling.
const MAX_TOKENS = 2048
const RATE_LIMIT_PER_HOUR = 60

// Allow the portfolio origin (and localhost for dev). Use '*' as a fallback so
// the Worker works before the canonical origin is known.
const ALLOWED_ORIGINS = new Set([
  'https://ahmed-3m.github.io',
  'http://localhost:3000',
])

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || ''
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : '*'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

function jsonResponse(body, status, request, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request),
      ...extraHeaders,
    },
  })
}

/**
 * Simple per-IP rate limit using the optional CHAT_RATE_KV namespace.
 * Each IP gets a rolling hour window counter. If the KV binding is missing,
 * rate limiting is skipped (logged) so the Worker still works during dev.
 */
async function checkRateLimit(request, env, ctx) {
  if (!env || !env.CHAT_RATE_KV || typeof env.CHAT_RATE_KV.get !== 'function') {
    // KV not bound — skip rate limiting. To enable it, bind a KV namespace:
    //   [kv_namespaces]
    //   binding = "CHAT_RATE_KV"
    //   id = "..."
    return { ok: true }
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const key = `rl:${ip}`
  const now = Date.now()
  const windowMs = 60 * 60 * 1000

  let record
  try {
    record = JSON.parse((await env.CHAT_RATE_KV.get(key)) || 'null')
  } catch {
    record = null
  }

  if (!record || now - record.startedAt > windowMs) {
    record = { startedAt: now, count: 0 }
  }

  record.count += 1
  const ttl = Math.ceil((record.startedAt + windowMs - now) / 1000)

  ctx.waitUntil(env.CHAT_RATE_KV.put(key, JSON.stringify(record), { expirationTtl: Math.max(ttl, 60) }))

  if (record.count > RATE_LIMIT_PER_HOUR) {
    return {
      ok: false,
      status: 429,
      body: { error: 'Rate limit exceeded. Please try again later.' },
    }
  }

  return { ok: true }
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight.
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) })
    }

    // Only POST is supported.
    if (request.method !== 'POST') {
      return jsonResponse(
        { error: 'Method not allowed. Use POST.' },
        405,
        request,
        { Allow: 'POST, OPTIONS' }
      )
    }

    // Make sure the Worker has been configured with a secret.
    if (!env || !env.ZAI_API_KEY) {
      return jsonResponse(
        { error: 'Server is not configured: missing ZAI_API_KEY secret.' },
        500,
        request
      )
    }

    // Rate limit (no-op if KV is not bound).
    const limit = await checkRateLimit(request, env, ctx)
    if (!limit.ok) {
      return jsonResponse(limit.body, limit.status, request)
    }

    // Parse and validate the request body.
    let body
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON body.' }, 400, request)
    }

    if (!body || typeof body !== 'object') {
      return jsonResponse({ error: 'Request body must be a JSON object.' }, 400, request)
    }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return jsonResponse(
        { error: 'Request body must include a non-empty "messages" array.' },
        400,
        request
      )
    }

    // Cap tokens to prevent abuse; clients may request fewer but never more.
    const requestedTokens = Number(body.max_tokens)
    const maxTokens = Number.isFinite(requestedTokens) && requestedTokens > 0
      ? Math.min(Math.floor(requestedTokens), MAX_TOKENS)
      : MAX_TOKENS

    const temperature =
      typeof body.temperature === 'number' && Number.isFinite(body.temperature)
        ? Math.min(Math.max(body.temperature, 0), 2)
        : 0.5

    const model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : DEFAULT_MODEL

    const upstreamPayload = {
      model,
      messages: body.messages,
      max_tokens: maxTokens,
      temperature,
      stream: body.stream === true,
    }

    // Pass through optional thinking control only when the client sends it.
    // GLM-5.3 always thinks and rejects `thinking: { type: 'disabled' }`, so
    // this must stay a pass-through — never a hardcoded value.
    if (body.thinking && typeof body.thinking === 'object') {
      upstreamPayload.thinking = body.thinking
    }

    // Forward to BigModel with the server-side secret.
    try {
      const upstream = await fetch(ZAI_CHAT_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.ZAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(upstreamPayload),
      })

      // Pass the upstream body through unbuffered so streamed tokens reach the
      // browser as they are produced and non-streaming JSON is not needlessly
      // buffered by the Worker.
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          'Content-Type': upstream.headers.get('Content-Type') ||
            (upstreamPayload.stream ? 'text/event-stream' : 'application/json'),
          ...(upstreamPayload.stream ? { 'Cache-Control': 'no-cache' } : {}),
          ...corsHeaders(request),
        },
      })
    } catch (networkError) {
      return jsonResponse(
        { error: 'Failed to reach the model provider.' },
        502,
        request
      )
    }
  },
}
