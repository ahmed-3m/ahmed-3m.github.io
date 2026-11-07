/**
 * Cloudflare Worker: ahmed-chat-proxy
 *
 * Proxies chat completions to api.z.ai (GLM Coding Plan) or Groq so the real
 * API keys never ship to the browser bundle. Rate limiting uses CHAT_RATE_LIMITER
 * (with fallback to CHAT_RATE_KV); CORS is restricted to an origin allowlist.
 */

const ZAI_CHAT_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions'
const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions'
const RATE_LIMIT_PER_HOUR = 60

export const DEFAULT_MODEL = 'glm-5.3'
export const MAX_BODY_BYTES = 64_000
export const MAX_MESSAGES = 24
export const MAX_CONTENT_CHARS = 16_000
export const MAX_TOKENS_CAP = 1_200

export const ALLOWED_ORIGINS = new Set([
  'https://ahmed-3m.github.io',
  'http://localhost:3000',
])

export const ALLOWED_ROLES = new Set(['system', 'user', 'assistant'])

export const ALLOWED_MODELS = {
  zai: new Set(['glm-5.3', 'glm-5-turbo', 'glm-5.3-flash']),
  groq: new Set(['openai/gpt-oss-20b']),
}

export const ALLOWED_REASONING_EFFORT = new Set(['low', 'medium', 'high'])

export function corsHeaders(origin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}

function jsonResponse(body, status, origin, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
      ...extraHeaders,
    },
  })
}

function forbiddenOrigin() {
  return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
    status: 403,
    headers: {
      'Content-Type': 'application/json',
      Vary: 'Origin',
    },
  })
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      if (origin && !ALLOWED_ORIGINS.has(origin)) {
        return forbiddenOrigin()
      }
      return new Response(null, { status: 204, headers: corsHeaders(origin) })
    }

    if (request.method !== 'POST') {
      return jsonResponse(
        { error: 'Method not allowed. Use POST.' },
        405,
        origin,
        { Allow: 'POST, OPTIONS' }
      )
    }

    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return forbiddenOrigin()
    }

    // Rate limiting: prefer env.CHAT_RATE_LIMITER (or CHAT_RATE_LIMIT), fallback to CHAT_RATE_KV
    const limiter = env?.CHAT_RATE_LIMITER || env?.CHAT_RATE_LIMIT
    if (limiter && typeof limiter.limit === 'function') {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
      const { success } = await limiter.limit({ key: ip })
      if (success === false) {
        return jsonResponse(
          { error: 'Rate limit exceeded. Please try again later.' },
          429,
          origin
        )
      }
    } else if (env?.CHAT_RATE_KV && typeof env.CHAT_RATE_KV.get === 'function') {
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

      ctx?.waitUntil?.(
        env.CHAT_RATE_KV.put(key, JSON.stringify(record), {
          expirationTtl: Math.max(ttl, 60),
        })
      )

      if (record.count > RATE_LIMIT_PER_HOUR) {
        return jsonResponse(
          { error: 'Rate limit exceeded. Please try again later.' },
          429,
          origin
        )
      }
    }

    // Read and enforce max body bytes
    let raw
    try {
      raw = await request.text()
    } catch {
      return jsonResponse({ error: 'Failed to read request body.' }, 400, origin)
    }

    if (raw.length > MAX_BODY_BYTES) {
      return jsonResponse({ error: 'Payload too large.' }, 413, origin)
    }

    let body
    try {
      body = JSON.parse(raw)
    } catch {
      return jsonResponse({ error: 'Invalid JSON body.' }, 400, origin)
    }

    if (!body || typeof body !== 'object') {
      return jsonResponse({ error: 'Request body must be a JSON object.' }, 400, origin)
    }

    if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > MAX_MESSAGES) {
      return jsonResponse(
        { error: `Request body must include a "messages" array of length 1–${MAX_MESSAGES}.` },
        400,
        origin
      )
    }

    for (const message of body.messages) {
      if (!message || typeof message !== 'object') {
        return jsonResponse({ error: 'Each message must be an object.' }, 400, origin)
      }
      if (!ALLOWED_ROLES.has(message.role)) {
        return jsonResponse(
          { error: 'Each message role must be system, user, or assistant.' },
          400,
          origin
        )
      }
      if (typeof message.content !== 'string') {
        return jsonResponse({ error: 'Each message content must be a string.' }, 400, origin)
      }
      if (message.content.length > MAX_CONTENT_CHARS) {
        return jsonResponse(
          { error: `Each message content must be at most ${MAX_CONTENT_CHARS} characters.` },
          400,
          origin
        )
      }
    }

    const requestedModel =
      typeof body.model === 'string' && body.model.trim() ? body.model.trim() : DEFAULT_MODEL
    const isZai = ALLOWED_MODELS.zai.has(requestedModel)
    const isGroq = ALLOWED_MODELS.groq.has(requestedModel)

    if (!isZai && !isGroq) {
      return jsonResponse({ error: `Disallowed model: ${requestedModel}` }, 400, origin)
    }

    const model = requestedModel

    if (isGroq) {
      if (!env || !env.GROQ_API_KEY) {
        return jsonResponse(
          { error: 'Server is not configured: missing GROQ_API_KEY secret.' },
          500,
          origin
        )
      }
    } else {
      if (!env || !env.ZAI_API_KEY) {
        return jsonResponse(
          { error: 'Server is not configured: missing ZAI_API_KEY secret.' },
          500,
          origin
        )
      }
    }

    const requestedTokens = Number(body.max_tokens)
    const maxTokens =
      Number.isFinite(requestedTokens) && requestedTokens > 0
        ? Math.min(Math.floor(requestedTokens), MAX_TOKENS_CAP)
        : MAX_TOKENS_CAP

    const temperature =
      typeof body.temperature === 'number' && Number.isFinite(body.temperature)
        ? Math.min(Math.max(body.temperature, 0), 2)
        : 0.5

    const upstreamPayload = {
      model,
      messages: body.messages,
      max_tokens: maxTokens,
      temperature,
      stream: body.stream === true,
      ...(isZai && ALLOWED_REASONING_EFFORT.has(body.reasoning_effort)
        ? { reasoning_effort: body.reasoning_effort }
        : {}),
    }

    const targetUrl = isGroq ? GROQ_CHAT_URL : ZAI_CHAT_URL
    const apiKey = isGroq ? env.GROQ_API_KEY : env.ZAI_API_KEY

    try {
      const upstream = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(upstreamPayload),
      })

      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          'Content-Type':
            upstream.headers.get('Content-Type') ||
            (upstreamPayload.stream ? 'text/event-stream' : 'application/json'),
          ...(upstreamPayload.stream ? { 'Cache-Control': 'no-cache' } : {}),
          ...corsHeaders(origin),
        },
      })
    } catch {
      return jsonResponse(
        { error: 'Failed to reach the model provider.' },
        502,
        origin
      )
    }
  },
}
