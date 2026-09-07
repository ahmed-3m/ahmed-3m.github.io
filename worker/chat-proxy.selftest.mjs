/**
 * Fetch-level self-test for the chat proxy Worker.
 * Calls `export default.fetch` — does not copy origin/model predicates.
 */
import handler from './chat-proxy.js'

const SITE = 'https://ahmed-3m.github.io'
const EVIL = 'https://evil.example'
const SSE_CHUNK = 'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n'
const validBody = { messages: [{ role: 'user', content: 'hello' }] }

function env({ limitSuccess = true, hasLimiter = true, fetchImpl } = {}) {
  return {
    ZAI_API_KEY: 'test-key',
    CHAT_RATE_LIMIT: hasLimiter
      ? { limit: async () => ({ success: limitSuccess }) }
      : undefined,
  }
}

async function call(body, { origin, method = 'POST', env: e, upstream } = {}) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = upstream ?? (async () => new Response('{}', { status: 200 }))
  try {
    return await handler.fetch(
      new Request('https://proxy.test/', {
        method,
        headers: origin ? { Origin: origin, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
        body: method === 'POST' ? JSON.stringify(body) : undefined,
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

await test('Origin https://ahmed-3m.github.io → 200, ACAO equals that origin', async () => {
  const res = await call(validBody, { origin: SITE })
  assert(res.status === 200, `status ${res.status}`)
  assert(acao(res) === SITE, `ACAO ${JSON.stringify(acao(res))}`)
})

await test('Origin https://evil.example → 403, no *', async () => {
  const res = await call(validBody, { origin: EVIL })
  assert(res.status === 403, `status ${res.status}`)
  assertNoStar(res)
  assert(acao(res) == null, `ACAO should be absent, got ${JSON.stringify(acao(res))}`)
})

await test('Missing Origin → not 403 (rate-limited path); no *', async () => {
  let limited = false
  const e = env()
  const originalLimit = e.CHAT_RATE_LIMIT.limit
  e.CHAT_RATE_LIMIT.limit = async (arg) => {
    limited = true
    return originalLimit(arg)
  }
  const res = await call(validBody, { env: e })
  assert(res.status !== 403, `status ${res.status} (must not be 403)`)
  assert(limited, 'missing Origin must still hit the rate limiter')
  assertNoStar(res)
})

await test('OPTIONS allowed → 204, ACAO set', async () => {
  const res = await call(undefined, { origin: SITE, method: 'OPTIONS' })
  assert(res.status === 204, `status ${res.status}`)
  assert(acao(res) === SITE, `ACAO ${JSON.stringify(acao(res))}`)
})

await test('OPTIONS denied → 403, no *', async () => {
  const res = await call(undefined, { origin: EVIL, method: 'OPTIONS' })
  assert(res.status === 403, `status ${res.status}`)
  assertNoStar(res)
  assert(acao(res) == null, `ACAO should be absent, got ${JSON.stringify(acao(res))}`)
})

await test('hasLimiter: false → 503', async () => {
  const res = await call(validBody, { origin: SITE, env: env({ hasLimiter: false }) })
  assert(res.status === 503, `status ${res.status}`)
})

await test('limitSuccess: false → 429', async () => {
  const res = await call(validBody, { origin: SITE, env: env({ limitSuccess: false }) })
  assert(res.status === 429, `status ${res.status}`)
})

await test('25 messages → 400', async () => {
  const messages = Array.from({ length: 25 }, () => ({ role: 'user', content: 'x' }))
  const res = await call({ messages }, { origin: SITE })
  assert(res.status === 400, `status ${res.status}`)
})

await test('content length 4001 → 400', async () => {
  const res = await call(
    { messages: [{ role: 'user', content: 'x'.repeat(4001) }] },
    { origin: SITE },
  )
  assert(res.status === 400, `status ${res.status}`)
})

await test('role tool → 400', async () => {
  const res = await call(
    { messages: [{ role: 'tool', content: 'hi' }] },
    { origin: SITE },
  )
  assert(res.status === 400, `status ${res.status}`)
})

await test('model evil-model → upstream body uses glm-5.3', async () => {
  let payload
  const upstream = async (_url, init) => {
    payload = JSON.parse(init.body)
    return new Response('{}', { status: 200 })
  }
  const res = await call({ ...validBody, model: 'evil-model' }, { origin: SITE, upstream })
  assert(res.status === 200, `status ${res.status}`)
  assert(payload?.model === 'glm-5.3', `upstream model ${JSON.stringify(payload?.model)}`)
})

await test("reasoning_effort: 'low' → forwarded", async () => {
  let payload
  const upstream = async (_url, init) => {
    payload = JSON.parse(init.body)
    return new Response('{}', { status: 200 })
  }
  const res = await call({ ...validBody, reasoning_effort: 'low' }, { origin: SITE, upstream })
  assert(res.status === 200, `status ${res.status}`)
  assert(payload?.reasoning_effort === 'low', `upstream reasoning_effort ${JSON.stringify(payload?.reasoning_effort)}`)
})

await test("reasoning_effort: 'nope' → omitted", async () => {
  let payload
  const upstream = async (_url, init) => {
    payload = JSON.parse(init.body)
    return new Response('{}', { status: 200 })
  }
  const res = await call({ ...validBody, reasoning_effort: 'nope' }, { origin: SITE, upstream })
  assert(res.status === 200, `status ${res.status}`)
  assert(!Object.hasOwn(payload, 'reasoning_effort'), `upstream still has reasoning_effort=${JSON.stringify(payload?.reasoning_effort)}`)
})

await test('stream: true → unbuffered SSE; first chunk readable before mock closes', async () => {
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
      setTimeout(() => reject(new Error('Worker buffered the SSE stream (did not return before mock close)')), 500),
    ),
  ])

  assert(payload?.stream === true, `upstream stream ${JSON.stringify(payload?.stream)}`)
  assert(response.body != null, 'response.body missing')

  const reader = response.body.getReader()
  const first = await Promise.race([
    reader.read(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('first chunk not readable before the mock stream closes')), 500),
    ),
  ])
  const text = new TextDecoder().decode(first.value)
  assert(text.includes('Hi'), `first chunk ${JSON.stringify(text)}`)
  release()
  await reader.cancel()
})

await test('Upstream 502 → 502 propagated', async () => {
  const upstream = async () => new Response('upstream-down', { status: 502 })
  const res = await call(validBody, { origin: SITE, upstream })
  assert(res.status === 502, `status ${res.status}`)
  assert((await res.text()) === 'upstream-down', 'upstream body not propagated')
})

if (failed) {
  console.error(`\n${failed} failed`)
  process.exit(1)
}
console.log('\nall tests passed')
