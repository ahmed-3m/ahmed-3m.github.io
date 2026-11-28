import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import {
  MAX_REPLY_CHARS,
  buildChatRequest,
  fetchBigModel,
  fetchGroq,
  isProxyRateLimitPayload,
  readChatResponse,
  shortenReply,
  throwProviderError,
  type ChatCompletionError,
  type ChatContext,
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

  it("keeps the code and scope of the Worker's error event", async () => {
    const error = `data: ${JSON.stringify({ error: { code: 'upstream_timeout', message: 'Too slow.' }, scope: 'zai' })}\n\n`
    await assert.rejects(read(sseResponse([error])), (caught: ChatCompletionError) => {
      assert.equal(caught.code, 'upstream_timeout')
      assert.equal(caught.scope, 'zai')
      return true
    })
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

  it('keeps the code, scope and retry time of a v2 error body', async () => {
    const body = { error: { code: 'budget_exhausted', message: 'Spent.' }, scope: 'zai', retryAfter: 120, requestId: 'r' }
    const error = await caught(throwProviderError(Response.json(body, { status: 503 }), 'BigModel'))
    assert.equal(error.code, 'budget_exhausted')
    assert.equal(error.scope, 'zai')
    assert.equal(error.retryAfter, 120)
    assert.equal(error.status, 503)
    assert.equal(error.message, 'Spent.')
    assert.equal(error.isProxyRateLimit, false)
  })

  it('reads the retry time from the Retry-After header when the body has none', async () => {
    const response = Response.json(
      { error: { code: 'rate_limited', message: 'Slow down.' }, scope: 'proxy' },
      { status: 429, headers: { 'Retry-After': '42' } }
    )
    const error = await caught(throwProviderError(response, 'BigModel'))
    assert.equal(error.retryAfter, 42)
    assert.equal(error.isProxyRateLimit, true)
  })

  it("keeps the Worker's message for a 503 (no warm-up text)", async () => {
    const response = Response.json({ error: { code: 'unavailable', message: 'Not configured.' }, scope: 'groq' }, { status: 503 })
    const error = await caught(throwProviderError(response, 'Groq'))
    assert.equal(error.message, 'Not configured.')
    assert.equal(error.code, 'unavailable')
    assert.equal(error.scope, 'groq')
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

const context: ChatContext = {
  lang: 'de',
  section: 'research',
  pathname: '/research/',
  entryIds: ['thesis-ood', 'cifar-results', 'svhn-results', 'methods', 'extra-id'],
}

describe('buildChatRequest', () => {
  const turns = (count: number) =>
    Array.from({ length: count }, (_, index) => ({
      role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: `turn ${index}`,
    }))

  it('sends the v2 body and nothing of the old one', () => {
    const body = buildChatRequest({ messages: turns(3), context, lane: 'deep', provider: 'zai', stream: true })
    assert.deepEqual(Object.keys(body).sort(), [
      'entryIds',
      'lane',
      'lang',
      'pathname',
      'provider',
      'section',
      'stream',
      'turns',
      'version',
    ])
    assert.equal(body.version, 2)
    assert.equal(body.lane, 'deep')
    assert.equal(body.provider, 'zai')
    assert.equal(body.lang, 'de')
    assert.equal(body.section, 'research')
    assert.equal(body.stream, true)
    assert.ok(body.turns.every((turn) => turn.role === 'user' || turn.role === 'assistant'))
  })

  it('sends the pathname normalized, and "/" for an empty one', () => {
    const at = (pathname: string) =>
      buildChatRequest({ messages: turns(1), context: { ...context, pathname }, lane: 'fast', provider: 'groq', stream: false })
        .pathname
    assert.equal(at('/research/'), '/research')
    assert.equal(at('/'), '/')
    assert.equal(at(''), '/')
  })

  it('sends at most four entry IDs, in the order retrieved', () => {
    const body = buildChatRequest({ messages: turns(1), context, lane: 'fast', provider: 'zai', stream: false })
    assert.deepEqual(body.entryIds, context.entryIds.slice(0, 4))
  })

  it('keeps only the last 16 turns, with role and content only', () => {
    const messages = turns(17).map((turn) => ({ ...turn, followUps: ['x'], fallback: true }))
    const body = buildChatRequest({ messages, context, lane: 'fast', provider: 'zai', stream: false })
    assert.equal(body.turns.length, 16)
    assert.equal(body.turns[0].content, 'turn 1')
    assert.ok(body.turns.every((turn) => Object.keys(turn).join() === 'role,content'))
  })

  it("cuts a turn over the Worker's limit", () => {
    const messages = [
      { role: 'user' as const, content: 'u'.repeat(2_500) },
      { role: 'assistant' as const, content: 'a'.repeat(9_000) },
      { role: 'user' as const, content: 'last' },
    ]
    const body = buildChatRequest({ messages, context, lane: 'fast', provider: 'zai', stream: false })
    assert.deepEqual(
      body.turns.map((turn) => turn.content.length),
      [2_000, 8_000, 4]
    )
  })
})

describe('provider requests', () => {
  const realFetch = globalThis.fetch

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
  const base = { messages: [{ role: 'user' as const, content: 'hi' }], context, proxyUrl: 'https://proxy.test' }
  const OLD_FIELDS = ['model', 'messages', 'max_tokens', 'temperature', 'reasoning_effort']

  it('sends each provider and lane as v2, with no model, prompt or token settings', async () => {
    const bodies = captureFetch(ok)
    await fetchBigModel({ ...base, lane: 'fast' })
    await fetchGroq({ ...base, lane: 'deep' })
    assert.deepEqual(
      bodies.map((b) => [b.version, b.provider, b.lane, b.stream]),
      [
        [2, 'zai', 'fast', false],
        [2, 'groq', 'deep', false],
      ]
    )
    for (const body of bodies) {
      assert.deepEqual(OLD_FIELDS.filter((field) => field in body), [])
      assert.deepEqual(body.turns, [{ role: 'user', content: 'hi' }])
      assert.equal(body.pathname, '/research')
      assert.deepEqual(body.entryIds, context.entryIds.slice(0, 4))
    }
    assert.ok(!JSON.stringify(bodies).includes('"system"'))
  })

  it('streams when a delta callback is given', async () => {
    const bodies = captureFetch(() => sseResponse([delta('ok'), 'data: [DONE]\n\n']))
    assert.deepEqual(await fetchGroq({ ...base, lane: 'deep', onDelta() {} }), { content: 'ok', incomplete: false })
    assert.equal(bodies[0].stream, true)
  })

  it("keeps the Worker's 503 message and code, with no warm-up text", async () => {
    captureFetch(() =>
      Response.json({ error: { code: 'budget_exhausted', message: 'Spent.' }, scope: 'groq', retryAfter: 60 }, { status: 503 })
    )
    await assert.rejects(fetchGroq({ ...base, lane: 'fast' }), (error: ChatCompletionError) => {
      assert.equal(error.message, 'Spent.')
      assert.equal(error.code, 'budget_exhausted')
      assert.equal(error.scope, 'groq')
      assert.equal(error.status, 503)
      assert.equal(error.provider, 'Groq')
      return true
    })
  })
})
