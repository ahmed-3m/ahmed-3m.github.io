import assert from 'node:assert/strict'
import { afterEach, before, describe, it } from 'node:test'

import {
  MAX_REPLY_CHARS,
  isProxyRateLimitPayload,
  readChatResponse,
  shortenReply,
  throwProviderError,
  type ChatCompletionError,
  type ChatReply,
} from '@/lib/genie/providers'

const timers = { onFirstByte() {}, onChunk() {}, clear() {} }
const encoder = new TextEncoder()

/** A streamed response whose body arrives in exactly these byte pieces. */
function sseResponse(pieces: (string | Uint8Array)[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const piece of pieces) controller.enqueue(typeof piece === 'string' ? encoder.encode(piece) : piece)
      controller.close()
    },
  })
  return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } })
}

const delta = (content: string, finish_reason?: string) =>
  `data: ${JSON.stringify({ choices: [{ delta: { content }, ...(finish_reason ? { finish_reason } : {}) }] })}\n\n`

async function read(response: Response, onDelta?: (full: string) => void): Promise<ChatReply> {
  return readChatResponse({ response, provider: 'BigModel', streaming: true, timers, onDelta })
}

describe('readChatResponse', () => {
  it('reads a plain JSON reply', async () => {
    const response = Response.json({ choices: [{ message: { content: '  Hello  ' }, finish_reason: 'stop' }] })
    assert.deepEqual(await read(response), { content: 'Hello', incomplete: false })
  })

  it('marks a JSON reply cut off by the token limit as incomplete', async () => {
    const response = Response.json({ choices: [{ message: { content: 'Hel' }, finish_reason: 'length' }] })
    assert.deepEqual(await read(response), { content: 'Hel', incomplete: true })
  })

  it('rejects an empty JSON reply', async () => {
    await assert.rejects(read(Response.json({ choices: [{ message: { content: '  ' } }] })), /empty response/)
  })

  it('streams deltas until [DONE]', async () => {
    const seen: string[] = []
    const reply = await read(sseResponse([delta('Hel'), delta('lo'), 'data: [DONE]\n\n']), (full) => seen.push(full))
    assert.deepEqual(reply, { content: 'Hello', incomplete: false })
    assert.deepEqual(seen, ['Hel', 'Hello'])
  })

  it('treats finish_reason "length" as incomplete even with [DONE]', async () => {
    const reply = await read(sseResponse([delta('Hel'), delta('lo', 'length'), 'data: [DONE]\n\n']))
    assert.deepEqual(reply, { content: 'Hello', incomplete: true })
  })

  it('treats a stream that ends without [DONE] or finish_reason as incomplete', async () => {
    assert.deepEqual(await read(sseResponse([delta('Hel')])), { content: 'Hel', incomplete: true })
  })

  it('treats finish_reason "stop" without [DONE] as complete', async () => {
    assert.deepEqual(await read(sseResponse([delta('Hello', 'stop')])), { content: 'Hello', incomplete: false })
  })

  it('rejects an empty stream', async () => {
    await assert.rejects(read(sseResponse(['data: [DONE]\n\n'])), /empty response/)
  })

  it('rejects an error chunk that arrives before any text', async () => {
    const error = `data: ${JSON.stringify({ error: { message: 'upstream exploded' } })}\n\n`
    await assert.rejects(read(sseResponse([error])), /upstream exploded/)
  })

  it('keeps the text already received when an error chunk follows it', async () => {
    const error = `data: ${JSON.stringify({ error: 'upstream exploded' })}\n\n`
    assert.deepEqual(await read(sseResponse([delta('Partial'), error])), { content: 'Partial', incomplete: true })
  })

  it('joins an event line split across network chunks', async () => {
    const line = delta('Hello')
    const reply = await read(sseResponse([line.slice(0, 12), line.slice(12), 'data: [DONE]\n\n']))
    assert.deepEqual(reply, { content: 'Hello', incomplete: false })
  })

  it('joins an Arabic character split across network chunks', async () => {
    const bytes = encoder.encode(delta('مرحبا'))
    const cut = bytes.indexOf(0xd8) + 1 // inside the first two-byte letter
    const reply = await read(sseResponse([bytes.slice(0, cut), bytes.slice(cut), 'data: [DONE]\n\n']))
    assert.deepEqual(reply, { content: 'مرحبا', incomplete: false })
  })

  it('ignores comments, blank data lines and malformed JSON', async () => {
    const reply = await read(sseResponse([': ping\n\n', 'data:\n\n', 'data: {oops\n\n', delta('Hi'), 'data: [DONE]\n\n']))
    assert.deepEqual(reply, { content: 'Hi', incomplete: false })
  })
})

describe('isProxyRateLimitPayload', () => {
  it('tells the proxy limit apart from an upstream 429', () => {
    assert.equal(isProxyRateLimitPayload({ scope: 'proxy' }, 429), true)
    assert.equal(isProxyRateLimitPayload({ scope: 'upstream' }, 429), false)
    // Older proxies send no scope, only this message.
    assert.equal(isProxyRateLimitPayload({ error: 'Rate limit exceeded. Please try again later.' }, 429), true)
    assert.equal(isProxyRateLimitPayload({ error: 'Too many tokens' }, 429), false)
    assert.equal(isProxyRateLimitPayload({ scope: 'proxy' }, 500), false)
    assert.equal(isProxyRateLimitPayload(null, 429), false)
  })
})

describe('throwProviderError', () => {
  async function caught(promise: Promise<never>): Promise<ChatCompletionError> {
    try {
      await promise
    } catch (error) {
      return error as ChatCompletionError
    }
    assert.fail('expected a rejection')
  }

  it('keeps status, code and provider from the error body', async () => {
    const error = await caught(
      throwProviderError(Response.json({ error: { message: 'bad key', code: 'auth' } }, { status: 401 }), 'BigModel')
    )
    assert.equal(error.message, 'bad key')
    assert.equal(error.status, 401)
    assert.equal(error.code, 'auth')
    assert.equal(error.provider, 'BigModel')
    assert.equal(error.isProxyRateLimit, false)
  })

  it('flags the proxy rate limit', async () => {
    const error = await caught(throwProviderError(Response.json({ scope: 'proxy' }, { status: 429 }), 'BigModel'))
    assert.equal(error.status, 429)
    assert.equal(error.isProxyRateLimit, true)
  })

  it('falls back to a generic message for a body that is not JSON', async () => {
    const error = await caught(throwProviderError(new Response('oops', { status: 502 }), 'Groq'))
    assert.equal(error.message, 'Groq could not respond right now.')
    assert.equal(error.status, 502)
  })

  it('uses the warm-up message for a 503 when one is given', async () => {
    const response = () => Response.json({ error: 'cold start' }, { status: 503 })
    assert.equal((await caught(throwProviderError(response(), 'Groq', 'Warming up'))).message, 'Warming up')
    assert.equal((await caught(throwProviderError(response(), 'Groq'))).message, 'cold start')
  })
})

describe('shortenReply', () => {
  it('leaves replies within the limit alone', () => {
    const reply = 'a'.repeat(MAX_REPLY_CHARS)
    assert.equal(shortenReply(reply), reply)
  })

  it('cuts a long reply at the last sentence end before the limit', () => {
    const sentence = 'This is one sentence of the reply. '
    const reply = sentence.repeat(60)
    const short = shortenReply(reply)
    assert.ok(short.length <= MAX_REPLY_CHARS + 3, String(short.length))
    assert.ok(short.endsWith('reply....'), short.slice(-20))
  })

  it('cuts hard at the limit when there is no sentence end late enough', () => {
    const short = shortenReply('x'.repeat(MAX_REPLY_CHARS + 50))
    assert.equal(short, `${'x'.repeat(MAX_REPLY_CHARS)}...`)
  })
})

describe('provider requests', () => {
  const realFetch = globalThis.fetch
  const MODEL_ENV = ['NEXT_PUBLIC_BIGMODEL_MODEL', 'NEXT_PUBLIC_ZAI_FAST_MODEL', 'NEXT_PUBLIC_GROQ_MODEL']
  let fetchBigModel: typeof import('@/lib/genie/providers').fetchBigModel
  let fetchGroq: typeof import('@/lib/genie/providers').fetchGroq

  // The models are read from the environment when the module loads. Load a fresh copy
  // with the overrides cleared, so these tests check the built-in defaults whatever
  // the shell running them has set.
  before(async () => {
    const saved = MODEL_ENV.map((name) => [name, process.env[name]] as const)
    for (const name of MODEL_ENV) delete process.env[name]
    try {
      const fresh: typeof import('@/lib/genie/providers') = await import(
        new URL('../../src/lib/genie/providers.ts?defaults', import.meta.url).href
      )
      ;({ fetchBigModel, fetchGroq } = fresh)
    } finally {
      for (const [name, value] of saved) if (value !== undefined) process.env[name] = value
    }
  })

  afterEach(() => {
    globalThis.fetch = realFetch
  })

  function captureFetch(response: () => Response) {
    const bodies: Record<string, unknown>[] = []
    globalThis.fetch = (async (_url: string, init: RequestInit) => {
      bodies.push(JSON.parse(String(init.body)))
      return response()
    }) as typeof fetch
    return bodies
  }

  const ok = () => Response.json({ choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }] })
  const base = { messages: [{ role: 'user' as const, content: 'hi' }], systemPrompt: 'sys', proxyUrl: 'https://proxy.test' }

  it('sends BigModel the lane-specific model and token budget, with low reasoning effort', async () => {
    const bodies = captureFetch(ok)
    await fetchBigModel({ ...base, lane: 'fast' })
    await fetchBigModel({ ...base, lane: 'deep' })
    assert.deepEqual(
      bodies.map((b) => [b.model, b.max_tokens, b.reasoning_effort, b.stream]),
      [
        ['glm-5.3-flash', 900, 'low', false],
        ['glm-5.4', 1200, 'low', false],
      ]
    )
    assert.deepEqual(bodies[0].messages, [
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'hi' },
    ])
  })

  it('streams when a delta callback is given', async () => {
    const bodies = captureFetch(() => sseResponse([delta('ok'), 'data: [DONE]\n\n']))
    assert.deepEqual(await fetchGroq({ ...base, lane: 'deep', onDelta() {} }), { content: 'ok', incomplete: false })
    assert.equal(bodies[0].stream, true)
    assert.equal(bodies[0].model, 'openai/gpt-oss-20b')
    assert.equal(bodies[0].max_tokens, 1200)
  })

  it('reports a Groq 503 as warming up', async () => {
    captureFetch(() => Response.json({ error: 'cold' }, { status: 503 }))
    await assert.rejects(fetchGroq({ ...base, lane: 'fast' }), (error: ChatCompletionError) => {
      assert.equal(error.message, 'Model is warming up, try again in a moment.')
      assert.equal(error.status, 503)
      assert.equal(error.provider, 'Groq')
      return true
    })
  })
})
