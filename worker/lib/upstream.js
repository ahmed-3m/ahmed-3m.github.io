// The upstream call (spec 007, contracts/worker-api.md "What the Worker sends upstream",
// research R8 and R10). A provider's error body is read and dropped; an error event inside a
// stream is replaced by one standard error event and the stream ends. The call has a
// first-byte and a total deadline.

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
export function errorEventTransform({ scope, requestId, onReplace = () => {} }) {
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
        onReplace()
        controller.terminate()
        return
      }
      controller.enqueue(encoder.encode(`${line}\n`))
    }
    if (last) {
      if (isErrorEvent(last)) {
        controller.enqueue(encoder.encode(errorEvent({ code: 'upstream_error', scope, requestId })))
        ended = true
        onReplace()
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
 * headers and the request ID. `onDone({ outcome, ttfbMs, totalMs })` is called exactly once,
 * when the response is complete: for a stream, when it ends, fails or the client cancels it.
 */
export async function callUpstream({
  fetchImpl,
  provider,
  lane,
  settings,
  apiKey,
  prompt,
  turns,
  stream,
  requestId,
  headers,
  now = () => Date.now(),
  onDone = () => {},
}) {
  const started = now()
  const controller = new AbortController()
  let timedOut = false
  let finished = false
  let ttfbMs = 0
  const firstByteTimer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, settings.firstByteMs)
  const totalTimer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, settings.totalMs)
  // Rejects when the call is aborted, so a stuck read or fetch still ends.
  const aborted = new Promise((_resolve, reject) => {
    controller.signal.addEventListener('abort', () => reject(new Error('aborted')))
  })
  aborted.catch(() => {})

  const finish = (outcome) => {
    if (finished) return
    finished = true
    clearTimeout(firstByteTimer)
    clearTimeout(totalTimer)
    onDone({ outcome, ttfbMs, totalMs: now() - started })
  }
  const failCode = () => (timedOut ? 'upstream_timeout' : 'upstream_error')
  const fail = (code) => {
    finish(code)
    return errorResponse({ code, scope: provider, requestId, headers })
  }

  let response
  try {
    response = await Promise.race([
      fetchImpl(UPSTREAM_URLS[provider], {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(upstreamBody({ provider, lane, settings, prompt, turns, stream })),
        signal: controller.signal,
      }),
      aborted,
    ])
  } catch {
    return fail(failCode())
  }
  clearTimeout(firstByteTimer)
  ttfbMs = now() - started

  if (!response.ok) {
    await response.body?.cancel().catch(() => {})
    return fail('upstream_error')
  }

  if (stream) {
    if (!response.body) return fail('upstream_error')
    let replaced = false
    let cancelled = false
    const reader = response.body
      .pipeThrough(errorEventTransform({ scope: provider, requestId, onReplace: () => (replaced = true) }))
      .getReader()
    const encoder = new TextEncoder()
    const body = new ReadableStream({
      async pull(out) {
        try {
          const { done, value } = await Promise.race([reader.read(), aborted])
          if (cancelled) return
          if (done) {
            finish(replaced ? 'upstream_error' : 'ok')
            out.close()
            return
          }
          out.enqueue(value)
        } catch {
          if (cancelled) return
          const code = failCode()
          reader.cancel().catch(() => {})
          finish(code)
          out.enqueue(encoder.encode(errorEvent({ code, scope: provider, requestId })))
          out.close()
        }
      },
      cancel() {
        cancelled = true
        finish('client_abort')
        controller.abort()
        return reader.cancel().catch(() => {})
      },
    })
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', ...headers },
    })
  }

  let text
  let data
  try {
    text = await Promise.race([response.text(), aborted])
    data = JSON.parse(text)
  } catch {
    return fail(failCode())
  }
  if (!data || typeof data !== 'object' || !Array.isArray(data.choices)) return fail('upstream_error')
  finish('ok')
  return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json', ...headers } })
}
