/**
 * Fetch-level self-test for the chat proxy Worker.
 * Calls `export default.fetch`.
 */
import handler, { MAX_BODY_BYTES } from './chat-proxy.js'

const SITE = 'https://ahmed-3m.github.io'
const EVIL = 'https://evil.example'
const SSE_CHUNK = 'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n'
const validBody = { messages: [{ role: 'user', content: 'hello' }] }

function env({ limitSuccess = true, hasLimiter = true, hasKey = true, groqKey = false } = {}) {
  return {
    ...(hasKey ? { ZAI_API_KEY: 'test-zai-key' } : {}),
    ...(groqKey ? { GROQ_API_KEY: 'test-groq-key' } : {}),
    CHAT_RATE_LIMITER: hasLimiter
      ? { limit: async () => ({ success: limitSuccess }) }
      : undefined,
  }
}

async function call(body, { origin, method = 'POST', env: e, upstream } = {}) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = upstream ?? (async () => new Response('{}', { status: 200 }))
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (origin) headers.Origin = origin

    return await handler.fetch(
      new Request('https://proxy.test/', {
        method,
        headers,
        body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
      }),
      e ?? env(),
      { waitUntil() {} },
    )
  } finally {
    globalThis.fetch = originalFetch
  }
}

function acao(res) {
  return res.headers.get('Access-Control-Allow-Origin')
}

function assert(cond, message) {
  if (!cond) throw new Error(message)
}

function assertNoStar(res) {
  assert(acao(res) !== '*', `Access-Control-Allow-Origin must not be *, got ${JSON.stringify(acao(res))}`)
}

let failed = 0

async function test(name, fn) {
  try {
    await fn()
    console.log(`ok  ${name}`)
  } catch (err) {
    failed += 1
    console.error(`not ok  ${name}`)
    console.error(`  ${err.stack || err.message}`)
  }
}

// 1. Allowed origin vs. rejected origin
await test('Origin https://ahmed-3m.github.io → 200, ACAO equals that origin', async () => {
  const res = await call(validBody, { origin: SITE })
  assert(res.status === 200, `status ${res.status}`)
  assert(acao(res) === SITE, `ACAO ${JSON.stringify(acao(res))}`)
})

await test('Origin https://evil.example → 403, error: Origin not allowed, no *', async () => {
  const res = await call(validBody, { origin: EVIL })
  assert(res.status === 403, `status ${res.status}`)
  assertNoStar(res)
  assert(acao(res) == null, `ACAO should be absent, got ${JSON.stringify(acao(res))}`)
  const data = await res.json()
  assert(data.error === 'Origin not allowed', `expected error "Origin not allowed", got ${data.error}`)
})

// 2. OPTIONS preflight
await test('OPTIONS allowed origin → 204, ACAO set', async () => {
  const res = await call(undefined, { origin: SITE, method: 'OPTIONS' })
  assert(res.status === 204, `status ${res.status}`)
  assert(acao(res) === SITE, `ACAO ${JSON.stringify(acao(res))}`)
})

await test('OPTIONS rejected origin → 403, no *', async () => {
  const res = await call(undefined, { origin: EVIL, method: 'OPTIONS' })
  assert(res.status === 403, `status ${res.status}`)
  assertNoStar(res)
})

// 3. Disallowed model
await test('Disallowed model (gpt-4o) → 400', async () => {
  const res = await call({ ...validBody, model: 'gpt-4o' }, { origin: SITE })
  assert(res.status === 400, `status ${res.status}`)
  const data = await res.json()
  assert(data.error.includes('Disallowed model'), `expected disallowed model error, got ${data.error}`)
})

// 4. Too many messages
await test('Too many messages (25) → 400', async () => {
  const messages = Array.from({ length: 25 }, () => ({ role: 'user', content: 'x' }))
  const res = await call({ messages }, { origin: SITE })
  assert(res.status === 400, `status ${res.status}`)
})

// 5. Unknown role
await test('Unknown role (tool) → 400', async () => {
  const res = await call(
    { messages: [{ role: 'tool', content: 'hi' }] },
    { origin: SITE },
  )
  assert(res.status === 400, `status ${res.status}`)
})

// 6. Oversized content (17,000 chars)
await test('Oversized content (17,000 chars) → 400', async () => {
  const res = await call(
    { messages: [{ role: 'user', content: 'a'.repeat(17_000) }] },
    { origin: SITE },
  )
  assert(res.status === 400, `status ${res.status}`)
})

// 7. Max body bytes (>64,000)
await test('Max body bytes (>64,000) → 413', async () => {
  const hugeBody = JSON.stringify({
    messages: [
      { role: 'user', content: 'x'.repeat(15_000) },
      { role: 'assistant', content: 'x'.repeat(15_000) },
      { role: 'user', content: 'x'.repeat(15_000) },
      { role: 'assistant', content: 'x'.repeat(15_000) },
      { role: 'user', content: 'x'.repeat(10_000) },
    ],
  })
  assert(hugeBody.length > 64_000, `hugeBody length is ${hugeBody.length}`)
  const res = await call(hugeBody, { origin: SITE })
  assert(res.status === 413, `status ${res.status}`)
})

await test('UTF-8 byte limit rejects multibyte payload below character limit', async () => {
  const body = JSON.stringify({ messages: [{ role: 'user', content: '😀'.repeat(16_000) }] })
  assert(body.length < MAX_BODY_BYTES, 'fixture must fit character limit')
  const res = await call(body)
  assert(res.status === 413, `status ${res.status}`)
})

await test('Declared oversized body is rejected without reading', async () => {
  const res = await handler.fetch({
    method: 'POST',
    headers: new Headers({ 'Content-Length': String(MAX_BODY_BYTES + 1) }),
    get body() { throw new Error('must not read body') },
  }, env())
  assert(res.status === 413, `status ${res.status}`)
})

await test('Stream exceeding limit is canceled before remaining data is read', async () => {
  let canceled = false
  let pulls = 0
  const body = new ReadableStream({
    pull(controller) {
      pulls++
      controller.enqueue(new Uint8Array(MAX_BODY_BYTES / 2 + 1))
    },
    cancel() { canceled = true },
  }, { highWaterMark: 0 })
  const res = await handler.fetch({ method: 'POST', headers: new Headers(), body }, env())
  assert(res.status === 413, `status ${res.status}`)
  assert(canceled && pulls === 2, `canceled=${canceled}, pulls=${pulls}`)
})

await test('Body at exact byte limit is accepted', async () => {
  const raw = JSON.stringify(validBody)
  const res = await call(raw + ' '.repeat(MAX_BODY_BYTES - raw.length))
  assert(res.status === 200, `status ${res.status}`)
})

await test('Stream read failure retains 400 response', async () => {
  const body = new ReadableStream({ start(controller) { controller.error(new Error('read failed')) } })
  const res = await handler.fetch({ method: 'POST', headers: new Headers(), body }, env())
  assert(res.status === 400, `status ${res.status}`)
  assert((await res.json()).error === 'Failed to read request body.', 'wrong read error')
})

// 8. Rate limit exceeded (CHAT_RATE_LIMITER returning { success: false })
await test('Rate limit exceeded (CHAT_RATE_LIMITER returning { success: false }) → 429', async () => {
  const res = await call(validBody, { origin: SITE, env: env({ limitSuccess: false }) })
  assert(res.status === 429, `status ${res.status}`)
  const data = await res.json()
  assert(data.error.includes('Rate limit exceeded'), `expected rate limit error, got ${data.error}`)
})

// 9. Forwarding reasoning_effort: 'low' to Z.ai upstream
await test("Forwarding reasoning_effort: 'low' to Z.ai upstream", async () => {
  let payload
  let targetUrl
  const upstream = async (url, init) => {
    targetUrl = url
    payload = JSON.parse(init.body)
    return new Response('{}', { status: 200 })
  }
  const res = await call(
    { ...validBody, model: 'glm-5.3', reasoning_effort: 'low' },
    { origin: SITE, upstream }
  )
  assert(res.status === 200, `status ${res.status}`)
  assert(payload?.reasoning_effort === 'low', `expected reasoning_effort 'low', got ${payload?.reasoning_effort}`)
  assert(targetUrl.includes('api.z.ai'), `targetUrl should be Z.ai, got ${targetUrl}`)
})

// 10. Forwarding Groq model to Groq upstream
await test('Allowed Groq model (openai/gpt-oss-20b) routes to Groq upstream without reasoning_effort', async () => {
  let payload
  let targetUrl
  const upstream = async (url, init) => {
    targetUrl = url
    payload = JSON.parse(init.body)
    return new Response('{}', { status: 200 })
  }
  const res = await call(
    { ...validBody, model: 'openai/gpt-oss-20b', reasoning_effort: 'low' },
    { origin: SITE, env: env({ groqKey: true }), upstream }
  )
  assert(res.status === 200, `status ${res.status}`)
  assert(targetUrl.includes('api.groq.com'), `targetUrl should be Groq, got ${targetUrl}`)
  assert(!('reasoning_effort' in payload), 'Groq request must not include reasoning_effort')
})

// 11. Stream SSE pass-through
await test('Stream pass-through unbuffered SSE', async () => {
  let release
  const hang = new Promise((resolve) => {
    release = resolve
  })
  let payload
  const upstream = async (_url, init) => {
    payload = JSON.parse(init.body)
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(new TextEncoder().encode(SSE_CHUNK))
        await hang
        controller.close()
      },
    })
    return new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    })
  }

  const response = await Promise.race([
    call({ ...validBody, stream: true }, { origin: SITE, upstream }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Worker buffered the SSE stream')), 500),
    ),
  ])

  assert(payload?.stream === true, `upstream stream ${JSON.stringify(payload?.stream)}`)
  assert(response.body != null, 'response.body missing')

  const reader = response.body.getReader()
  const first = await reader.read()
  const text = new TextDecoder().decode(first.value)
  assert(text.includes('Hi'), `first chunk ${JSON.stringify(text)}`)
  release()
  await reader.cancel()
})

if (failed) {
  console.error(`\n${failed} test(s) failed`)
  process.exit(1)
}
console.log('\nAll tests passed successfully.')
