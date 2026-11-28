import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { afterEach, describe, it } from 'node:test'

import {
  fetchBigModel,
  fetchGroq,
  readChatResponse,
  throwProviderError,
  type ChatCompletionError,
  type ChatContext,
} from '@/lib/genie/providers'
import { requestModelReply } from '@/lib/genie/reply'
import type { Language } from '@/lib/i18n-config'
import { GenieBudget } from '../../worker/lib/budget.js'
import { createHandler } from '../../worker/lib/handler.js'
import bundle from '../../worker/prompt-bundle.js'
import { siteEntryIds, sitePrompt } from './site-prompt'

// Spec 007 PR 4: the site's v2 requests against the Worker. The site's own fetchBigModel
// and fetchGroq send their requests to the Worker's handler, and the Worker calls stub
// providers. Nothing leaves the process.

const PROXY_URL = 'https://proxy.test/'
const SITE = 'https://ahmed-3m.github.io'
const FAKE_SECRET = 'FAKE-COMPAT-SECRET-0000'
const SSE =
  'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: {"choices":[{"delta":{"content":" there"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n'
const timers = { onFirstByte() {}, onChunk() {}, clear() {} }
const encoder = new TextEncoder()

type UpstreamCall = { url: string; body: { model: string; messages: { role: string; content: string }[]; max_tokens: number } }
type Upstream = (call: UpstreamCall) => Response

function sse(chunks: string[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
  return new Response(body, { headers: { 'Content-Type': 'text/event-stream' } })
}

const defaultUpstream: Upstream = ({ body }) =>
  (body as { stream?: boolean }).stream
    ? sse([SSE])
    : Response.json({ choices: [{ message: { content: 'Hello there' }, finish_reason: 'stop' }] })

function limiter(max = Infinity) {
  let count = 0
  return { limit: async () => ({ success: ++count <= max }) }
}

/** The real GenieBudget class, one per provider, on in-memory storage. */
function budgets() {
  const objects = new Map<string, GenieBudget>()
  const storage = () => {
    const map = new Map<string, unknown>()
    return { get: async (key: string) => structuredClone(map.get(key)), put: async (key: string, value: unknown) => void map.set(key, structuredClone(value)) }
  }
  return {
    idFromName: (name: string) => name,
    get: (name: string) => {
      if (!objects.has(name)) objects.set(name, new GenieBudget({ storage: storage() }, {}))
      const object = objects.get(name)!
      return { fetch: (url: string, init: RequestInit) => object.fetch(new Request(url, init)) }
    },
  }
}

const realFetch = globalThis.fetch

/** Routes the site's fetch to the Worker. Returns the upstream calls the Worker made. */
function connect({ upstream = defaultUpstream, env = {} }: { upstream?: Upstream; env?: Record<string, unknown> } = {}) {
  const calls: UpstreamCall[] = []
  const handler = createHandler({
    bundledPrompt: bundle,
    fetchImpl: async (url: RequestInfo | URL, init: RequestInit = {}) => {
      if (!String(url).startsWith('https://api.')) return Response.json(bundle) // the prompt file
      const call = { url: String(url), body: JSON.parse(String(init.body)) }
      calls.push(call)
      return upstream(call)
    },
  })
  const workerEnv = { ZAI_API_KEY: FAKE_SECRET, GROQ_API_KEY: FAKE_SECRET, CHAT_RATE_LIMITER: limiter(), GENIE_BUDGET: budgets(), ...env }
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    assert.equal(String(input), PROXY_URL)
    const headers = new Headers(init?.headers)
    headers.set('Origin', SITE)
    headers.set('CF-Connecting-IP', '203.0.113.9')
    const request = new Request(PROXY_URL, { ...init, headers })
    return handler.fetch(request, workerEnv, { waitUntil() {} })
  }) as typeof fetch
  return calls
}

afterEach(() => {
  globalThis.fetch = realFetch
})

const question = 'What did the thesis find about out-of-distribution detection?'
/** The context the chat panel sends for `question` (the entries it retrieves on this page). */
const contextFor = (section = 'research', pathname = '/research/'): ChatContext => ({
  lang: 'de',
  section,
  pathname,
  entryIds: siteEntryIds({ lang: 'de', query: question, section, pathname }),
})
const prompt = (section = 'research', pathname = '/research/') => sitePrompt({ lang: 'de', query: question, section, pathname })
const context = contextFor()
const messages = [{ role: 'user' as const, content: question }]

async function rejection(promise: Promise<unknown>): Promise<ChatCompletionError> {
  try {
    await promise
  } catch (error) {
    return error as ChatCompletionError
  }
  assert.fail('expected the request to fail')
}

describe('the site against the Worker (v2)', () => {
  for (const lane of ['fast', 'deep'] as const) {
    it(`fetchBigModel ${lane} streams, and the Worker composes the site's prompt`, async () => {
      const calls = connect()
      let seen = ''
      const reply = await fetchBigModel({ messages, context, proxyUrl: PROXY_URL, lane, onDelta: (full) => (seen = full) })
      assert.deepEqual(reply, { content: 'Hello there', incomplete: false })
      assert.equal(seen, 'Hello there')
      assert.equal(calls.length, 1)
      assert.equal(calls[0].body.messages[0].content, prompt())
      assert.equal(calls[0].body.max_tokens, lane === 'fast' ? 900 : 1600)
    })

    it(`fetchGroq ${lane} gets a reply without streaming`, async () => {
      const calls = connect()
      const reply = await fetchGroq({ messages, context: contextFor('hero', '/'), proxyUrl: PROXY_URL, lane })
      assert.deepEqual(reply, { content: 'Hello there', incomplete: false })
      assert.equal(calls[0].body.messages[0].content, prompt('hero', '/'))
      assert.equal(calls[0].body.model, 'openai/gpt-oss-20b')
    })
  }

  it('the Worker composes every recorded prompt from what the site sends', async () => {
    const cases: {
      input: { lang: Language; query: string; history?: { role: string; content: string }[]; section: string; pathname: string }
      entryIds: string[]
      prompt: string
    }[] = JSON.parse(readFileSync(new URL('./fixtures/system-prompt-baseline.json', import.meta.url), 'utf8'))
    assert.equal(cases.length, 9)
    for (const [index, { input, entryIds, prompt: recorded }] of cases.entries()) {
      const label = `case ${index}: ${input.lang} ${input.section} ${input.pathname}`
      const retrieved = siteEntryIds(input)
      assert.deepEqual(retrieved, entryIds, label)
      const calls = connect()
      const caseContext = { lang: input.lang, section: input.section, pathname: input.pathname, entryIds: retrieved }
      await fetchBigModel({ messages: [{ role: 'user', content: input.query }], context: caseContext, proxyUrl: PROXY_URL, lane: 'fast' })
      assert.equal(calls[0].body.messages[0].content, recorded, label)
    }
  })

  it('a conversation longer than 16 turns is cut on the site, not refused by the Worker', async () => {
    const calls = connect()
    const long = Array.from({ length: 17 }, (_, index) => ({
      role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: index === 16 ? question : `turn ${index}`,
    }))
    const reply = await fetchBigModel({ messages: long, context, proxyUrl: PROXY_URL, lane: 'fast' })
    assert.equal(reply.content, 'Hello there')
    const turns = calls[0].body.messages.slice(1)
    assert.equal(turns.length, 16)
    assert.equal(turns.at(-1)?.content, question)
  })

  it('an over-long earlier answer is cut on the site, not refused by the Worker', async () => {
    const calls = connect()
    const turns = [
      { role: 'user' as const, content: 'first' },
      { role: 'assistant' as const, content: 'a'.repeat(9_000) },
      { role: 'user' as const, content: question },
    ]
    await fetchBigModel({ messages: turns, context, proxyUrl: PROXY_URL, lane: 'fast' })
    assert.equal(calls[0].body.messages[2].content.length, 8_000)
  })

  it('the per-client limit is read as a proxy limit with its retry time, so the site does not try Groq', async () => {
    const calls = connect({ env: { CHAT_RATE_LIMITER: limiter(0) } })
    const error = await rejection(fetchBigModel({ messages, context, proxyUrl: PROXY_URL, lane: 'fast' }))
    assert.equal(error.status, 429)
    assert.equal(error.isProxyRateLimit, true)
    assert.equal(error.code, 'rate_limited')
    assert.ok(Number(error.retryAfter) > 0, String(error.retryAfter))
    const thrown = await rejection(
      requestModelReply({
        content: 'Tell me about mergeproof',
        lang: 'en',
        transcript: messages,
        context,
        proxyUrl: PROXY_URL,
        lane: 'fast',
        isStopped: () => false,
      }),
    )
    assert.equal(thrown.code, 'rate_limited')
    assert.equal(calls.length, 0)
  })

  it('a missing Z.ai key is a 503 for Z.ai only, so the site can still try Groq', async () => {
    connect({ env: { ZAI_API_KEY: undefined } })
    const error = await rejection(fetchBigModel({ messages, context, proxyUrl: PROXY_URL, lane: 'fast' }))
    assert.deepEqual([error.status, error.code, error.isProxyRateLimit], [503, 'unavailable', false])
    assert.equal(error.message, 'This model is unavailable right now.')
    const reply = await fetchGroq({ messages, context, proxyUrl: PROXY_URL, lane: 'fast' })
    assert.equal(reply.content, 'Hello there')
  })

  it('a spent Z.ai budget is a 503 for Z.ai only, so the site can still try Groq', async () => {
    connect({ env: { ZAI_CAP_5H: '1' } })
    await fetchBigModel({ messages, context, proxyUrl: PROXY_URL, lane: 'fast' })
    const error = await rejection(fetchBigModel({ messages, context, proxyUrl: PROXY_URL, lane: 'fast' }))
    assert.deepEqual([error.status, error.code, error.isProxyRateLimit], [503, 'budget_exhausted', false])
    const reply = await fetchGroq({ messages, context, proxyUrl: PROXY_URL, lane: 'fast' })
    assert.equal(reply.content, 'Hello there')
  })

  it('the stop switch is a 503 the site does not read as a proxy rate limit', async () => {
    connect({ env: { GENIE_STOP: 'on' } })
    const error = await rejection(fetchBigModel({ messages, context, proxyUrl: PROXY_URL, lane: 'fast' }))
    assert.deepEqual([error.status, error.code, error.isProxyRateLimit], [503, 'unavailable', false])
    assert.equal(error.message, 'Models are unavailable right now.')
  })

  it('a missing Groq key keeps the Worker message, with a Groq scope', async () => {
    connect({ env: { GROQ_API_KEY: undefined } })
    const error = await rejection(fetchGroq({ messages, context, proxyUrl: PROXY_URL, lane: 'fast' }))
    assert.deepEqual([error.status, error.code, error.scope, error.isProxyRateLimit], [503, 'unavailable', 'groq', false])
    assert.equal(error.message, 'This model is unavailable right now.')
  })

  it('the stop switch sends the site straight to a prepared answer, without trying Groq', async () => {
    const calls = connect({ env: { GENIE_STOP: 'on' } })
    const reply = await requestModelReply({
      content: 'Tell me about mergeproof',
      lang: 'en',
      transcript: messages,
      context,
      proxyUrl: PROXY_URL,
      lane: 'fast',
      isStopped: () => false,
      onBeforeGroq: () => assert.fail('Groq must not be tried'),
    })
    assert.equal(reply?.fallback, true)
    assert.equal(calls.length, 0)
  })

  it('a missing limiter fails closed and the message names no setting', async () => {
    connect({ env: { CHAT_RATE_LIMITER: undefined } })
    const error = await rejection(fetchBigModel({ messages, context, proxyUrl: PROXY_URL, lane: 'fast' }))
    assert.deepEqual([error.status, error.code, error.isProxyRateLimit], [503, 'unavailable', false])
    assert.equal(error.message, 'Models are unavailable right now.')
  })

  it('a provider failure reaches the site as a 502 without the provider text', async () => {
    connect({ upstream: () => new Response(`${FAKE_SECRET} glm-5.4 quota`, { status: 500 }) })
    const error = await rejection(fetchBigModel({ messages, context, proxyUrl: PROXY_URL, lane: 'deep' }))
    assert.deepEqual([error.status, error.code, error.isProxyRateLimit], [502, 'upstream_error', false])
    assert.equal(error.message, 'The model could not answer.')
  })

  it('an error event before any text fails the stream with the Worker message', async () => {
    connect({ upstream: () => sse([`data: {"error":{"message":"${FAKE_SECRET}"}}\n\n`]) })
    const error = await rejection(
      fetchBigModel({ messages, context, proxyUrl: PROXY_URL, lane: 'fast', onDelta: () => {} }),
    )
    assert.equal(error.message, 'The model could not answer.')
  })

  it('an error event after some text keeps that text as an incomplete reply', async () => {
    connect({
      upstream: () => sse(['data: {"choices":[{"delta":{"content":"Partial"}}]}\n\n', 'data: {"error":"boom"}\n\n']),
    })
    const reply = await fetchBigModel({ messages, context, proxyUrl: PROXY_URL, lane: 'fast', onDelta: () => {} })
    assert.deepEqual(reply, { content: 'Partial', incomplete: true })
  })
})

describe('Worker error bodies read by the site helpers', () => {
  it('throwProviderError and readChatResponse accept every error shape', async () => {
    const body = (code: string, message: string, scope: string) => ({ error: { code, message }, scope, requestId: 'r' })
    const error = await rejection(
      throwProviderError(Response.json(body('invalid_request', 'Invalid request.', 'proxy'), { status: 400 }), 'BigModel'),
    )
    assert.deepEqual([error.status, error.code, error.message], [400, 'invalid_request', 'Invalid request.'])
    const streamError = await rejection(
      readChatResponse({
        response: sse([`data: ${JSON.stringify(body('upstream_error', 'The model could not answer.', 'groq'))}\n\n`]),
        provider: 'Groq',
        streaming: true,
        timers,
      }),
    )
    assert.equal(streamError.message, 'The model could not answer.')
  })
})
