/**
 * Cloudflare Worker: ahmed-chat-proxy
 *
 * Proxies chat completion requests from the portfolio's ChatBot to the Z.ai API
 * so the real API key never ships to the browser bundle. The browser POSTs a
 * plain `{ messages, model, max_tokens, temperature }` body; the Worker attaches
 * `Authorization: Bearer ${env.ZAI_API_KEY}` and forwards the request to Z.ai.
 *
 * Env:
 *   ZAI_API_KEY  (secret)  The real Z.ai API key. Set via `wrangler secret put ZAI_API_KEY`.
 *   CHAT_RATE_KV (optional KV namespace binding) for simple IP-based rate limiting.
 *
 * See worker/README.md for deployment and usage.
 */

const ZAI_CHAT_URL = 'https://api.z.ai/api/paas/v4/chat/completions'
const DEFAULT_MODEL = 'glm-4.5-airx'
const MAX_TOKENS = 500
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
      stream: false,
      thinking: { type: 'disabled' },
    }

    // Forward to Z.ai with the server-side secret.
    try {
      const upstream = await fetch(ZAI_CHAT_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.ZAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(upstreamPayload),
      })

      const upstreamText = await upstream.text()
      const contentType = upstream.headers.get('Content-Type') || 'application/json'

      // Pass the upstream status and body straight through, with our CORS headers.
      return new Response(upstreamText, {
        status: upstream.status,
        headers: {
          'Content-Type': contentType,
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
