/**
 * Cloudflare Worker: ahmed-chat-proxy
 *
 * Proxies chat completions to api.z.ai (GLM Coding Plan) so the real API key
 * never ships in the static bundle. Quota rests on the CHAT_RATE_LIMIT binding
 * (20/min); CORS is an origin allowlist, not authentication.
 */

const ZAI_CHAT_URL = 'https://api.z.ai/api/coding/paas/v4/chat/completions'
// glm-5.3 thinking tokens count against max_tokens, so the deep lane needs room.
const MAX_TOKENS = 2048
const ALLOWED_ROLES = new Set(['system', 'user', 'assistant'])
const ALLOWED_REASONING_EFFORT = new Set(['low', 'medium', 'high'])

export const DEFAULT_MODEL = 'glm-5.3'
export const ALLOWED_MODELS = new Set(['glm-5.3', 'glm-5-turbo', 'glm-5.3-flash'])
export const ALLOWED_ORIGINS = new Set([
  'https://ahmed-3m.github.io',
  'http://localhost:3000',
])
export const MAX_MESSAGES = 24
export const MAX_CONTENT_CHARS = 4000

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || ''
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
  if (ALLOWED_ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
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

function forbiddenOrigin() {
  return new Response(JSON.stringify({ error: 'Forbidden origin.' }), {
    status: 403,
    headers: {
      'Content-Type': 'application/json',
      Vary: 'Origin',
    },
  })
}

function unknownOrigin(request) {
  const origin = request.headers.get('Origin')
  return Boolean(origin) && !ALLOWED_ORIGINS.has(origin)
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > MAX_MESSAGES) {
    return 'Request body must include a "messages" array of length 1–24.'
  }
  for (const message of messages) {
    if (!message || typeof message !== 'object') {
      return 'Each message must be an object.'
    }
    if (!ALLOWED_ROLES.has(message.role)) {
      return 'Each message role must be system, user, or assistant.'
    }
    if (typeof message.content !== 'string') {
      return 'Each message content must be a string.'
    }
    if (message.content.length > MAX_CONTENT_CHARS) {
      return 'Each message content must be at most 4000 characters.'
    }
  }
  return null
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      if (unknownOrigin(request)) return forbiddenOrigin()
      return new Response(null, { status: 204, headers: corsHeaders(request) })
    }

    if (request.method !== 'POST') {
      return jsonResponse(
        { error: 'Method not allowed. Use POST.' },
        405,
        request,
        { Allow: 'POST, OPTIONS' },
      )
    }

    if (unknownOrigin(request)) return forbiddenOrigin()

    if (!env || !env.ZAI_API_KEY) {
      return jsonResponse(
        { error: 'Server is not configured: missing ZAI_API_KEY secret.' },
        500,
        request,
      )
    }

    if (!env.CHAT_RATE_LIMIT || typeof env.CHAT_RATE_LIMIT.limit !== 'function') {
      return jsonResponse(
        { error: 'Rate limiter is not configured.' },
        503,
        request,
      )
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const { success } = await env.CHAT_RATE_LIMIT.limit({ key: ip })
    if (success === false) {
      return jsonResponse(
        { error: 'Rate limit exceeded. Please try again later.' },
        429,
        request,
      )
    }

    let body
    try {
      body = await request.json()
    } catch {
      return jsonResponse({ error: 'Invalid JSON body.' }, 400, request)
    }

    if (!body || typeof body !== 'object') {
      return jsonResponse({ error: 'Request body must be a JSON object.' }, 400, request)
    }

    const messagesError = validateMessages(body.messages)
    if (messagesError) {
      return jsonResponse({ error: messagesError }, 400, request)
    }

    const requestedTokens = Number(body.max_tokens)
    const maxTokens = Number.isFinite(requestedTokens) && requestedTokens > 0
      ? Math.min(Math.floor(requestedTokens), MAX_TOKENS)
      : MAX_TOKENS

    const temperature =
      typeof body.temperature === 'number' && Number.isFinite(body.temperature)
        ? Math.min(Math.max(body.temperature, 0), 2)
        : 0.5

    const requestedModel = typeof body.model === 'string' ? body.model.trim() : ''
    const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : DEFAULT_MODEL

    const upstreamPayload = {
      model,
      messages: body.messages,
      max_tokens: maxTokens,
      temperature,
      stream: body.stream === true,
    }

    if (ALLOWED_REASONING_EFFORT.has(body.reasoning_effort)) {
      upstreamPayload.reasoning_effort = body.reasoning_effort
    }

    try {
      const upstream = await fetch(ZAI_CHAT_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.ZAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(upstreamPayload),
      })

      if (upstreamPayload.stream && upstream.body) {
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            'Content-Type': upstream.headers.get('Content-Type') || 'text/event-stream',
            'Cache-Control': 'no-cache',
            ...corsHeaders(request),
          },
        })
      }

      const upstreamText = await upstream.text()
      const contentType = upstream.headers.get('Content-Type') || 'application/json'

      return new Response(upstreamText, {
        status: upstream.status,
        headers: {
          'Content-Type': contentType,
          ...corsHeaders(request),
        },
      })
    } catch {
      return jsonResponse(
        { error: 'Failed to reach the model provider.' },
        502,
        request,
      )
    }
  },
}
