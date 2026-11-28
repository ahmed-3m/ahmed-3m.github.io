// The upstream call (spec 007, contracts/worker-api.md "What the Worker sends upstream",
// research R8). A provider's error body is read and dropped; an error event inside a
// stream is replaced by one standard error event and the stream ends.

import { errorEvent, errorResponse } from './errors.js'
import { modelFor } from './settings.js'

export const UPSTREAM_URLS = {
  zai: 'https://api.z.ai/api/coding/paas/v4/chat/completions',
  groq: 'https://api.groq.com/openai/v1/chat/completions',
}

/** The body sent to a provider. Model, tokens, temperature and effort come from the settings. */
export function upstreamBody({ provider, lane, settings, prompt, turns, stream }) {
  return {
    model: modelFor(settings, provider, lane),
    messages: [{ role: 'system', content: prompt }, ...turns.map(({ role, content }) => ({ role, content }))],
    max_tokens: lane === 'deep' ? settings.deepMaxTokens : settings.fastMaxTokens,
    temperature: settings.temperature,
    stream,
    ...(provider === 'zai' ? { reasoning_effort: settings.zaiReasoningEffort } : {}),
  }
}

const NEWLINE = 0x0a
const ERROR_MARK = '"error"'

function concat(a, b) {
  if (!a.byteLength) return b
  const out = new Uint8Array(a.byteLength + b.byteLength)
  out.set(a, 0)
  out.set(b, a.byteLength)
  return out
}

/** True for a `data:` line whose JSON payload has a truthy top-level `error`. */
function isErrorEvent(line) {
  const text = line.endsWith('\r') ? line.slice(0, -1) : line
  if (!text.startsWith('data:') || !text.includes(ERROR_MARK)) return false
  try {
    const payload = JSON.parse(text.slice(5).trim())
    return !!payload && typeof payload === 'object' && !!payload.error
  } catch {
    return false
  }
}

/**
 * Passes a provider's event stream through byte for byte. It works on whole lines, and
 * only decodes and parses a line that contains `"error"`. Such a line, when its payload
 * has an `error`, is replaced by the standard error event, and the stream ends.
 */
export function errorEventTransform({ scope, requestId }) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let pending = new Uint8Array(0)
  let ended = false

  const process = (bytes, controller) => {
    // Complete lines only: a multi-byte character never contains a newline byte.
    const text = decoder.decode(bytes)
    if (!text.includes(ERROR_MARK)) {
      controller.enqueue(bytes)
      return
    }
    const lines = text.split('\n')
    const last = lines.pop() // '' when the bytes end with a newline
    for (const line of lines) {
      if (isErrorEvent(line)) {
        controller.enqueue(encoder.encode(errorEvent({ code: 'upstream_error', scope, requestId })))
        ended = true
        controller.terminate()
        return
      }
      controller.enqueue(encoder.encode(`${line}\n`))
    }
    if (last) {
      if (isErrorEvent(last)) {
        controller.enqueue(encoder.encode(errorEvent({ code: 'upstream_error', scope, requestId })))
        ended = true
        controller.terminate()
        return
      }
      controller.enqueue(encoder.encode(last))
    }
  }

  return new TransformStream({
    transform(chunk, controller) {
      if (ended) return
      const bytes = concat(pending, chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk))
      const cut = bytes.lastIndexOf(NEWLINE)
      if (cut < 0) {
        pending = bytes
        return
      }
      pending = bytes.slice(cut + 1)
      process(bytes.subarray(0, cut + 1), controller)
    },
    flush(controller) {
      if (ended || !pending.byteLength) return
      process(pending, controller)
    },
  })
}

/**
 * Calls the provider and returns the response for the client. `headers` carries the CORS
 * headers and the request ID.
 */
export async function callUpstream({ fetchImpl, provider, lane, settings, apiKey, prompt, turns, stream, requestId, headers }) {
  const fail = () => errorResponse({ code: 'upstream_error', scope: provider, requestId, headers })
  let response
  try {
    response = await fetchImpl(UPSTREAM_URLS[provider], {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(upstreamBody({ provider, lane, settings, prompt, turns, stream })),
    })
  } catch {
    return fail()
  }

  if (!response.ok) {
    await response.body?.cancel().catch(() => {})
    return fail()
  }

  if (stream) {
    if (!response.body) return fail()
    return new Response(response.body.pipeThrough(errorEventTransform({ scope: provider, requestId })), {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', ...headers },
    })
  }

  let text
  let data
  try {
    text = await response.text()
    data = JSON.parse(text)
  } catch {
    return fail()
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.choices)) return fail()
  return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json', ...headers } })
}
