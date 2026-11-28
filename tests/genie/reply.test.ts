// Pins the reply flow that used to live inside ChatBotPanel's sendMessage: when Genie
// answers at once, how it falls back from BigModel to Groq to a prepared reply, and
// how the final message is built. Providers are injected fakes, so nothing is fetched.

import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'

import { CHAT_COPY } from '@/components/chatbot-dictionaries'
import { MAX_REPLY_CHARS, createChatError, type ChatContext, type ChatReply } from '@/lib/genie/providers'
import { LOCAL_REPLIES, PROMPT_LIBRARY, REPLY_FOR_PROMPT, pickFollowUpIds } from '@/lib/genie/prompts'
import {
  buildFinalMessage,
  chatErrorKind,
  chatErrorMessage,
  decideImmediateReply,
  requestModelReply,
  type ModelProviders,
} from '@/lib/genie/reply'

describe('decideImmediateReply', () => {
  const base = { lang: 'en' as const, section: 'hero' }

  it('answers a suggested question from its prepared reply, even with a live model', () => {
    const result = decideImmediateReply({ ...base, content: 'anything', promptId: 'cv', proxyConfigured: true })
    const expected = LOCAL_REPLIES[REPLY_FOR_PROMPT.cv].en
    assert.deepEqual(result, {
      kind: 'answer',
      message: { role: 'assistant', content: expected, followUps: pickFollowUpIds(expected, 'anything', 'hero') },
    })
  })

  it('answers a typed question that matches a prepared topic', () => {
    const result = decideImmediateReply({ ...base, lang: 'de', content: 'Lebenslauf', proxyConfigured: true })
    assert.equal(result.kind, 'answer')
    assert.equal(result.kind === 'answer' && result.message.content, LOCAL_REPLIES.cv.de)
  })

  it('answers a typed question in its own language', () => {
    const arabic = decideImmediateReply({ ...base, content: 'تواصل مع أحمد', proxyConfigured: true })
    assert.equal(arabic.kind === 'answer' && arabic.message.content, LOCAL_REPLIES.contact.ar)
    const english = decideImmediateReply({ ...base, lang: 'ar', content: 'How can I contact Ahmed?', proxyConfigured: true })
    assert.equal(english.kind === 'answer' && english.message.content, LOCAL_REPLIES.contact.en)
  })

  it('answers a suggested question in the site language', () => {
    const result = decideImmediateReply({ ...base, lang: 'ar', content: 'anything', promptId: 'contact', proxyConfigured: true })
    assert.equal(result.kind === 'answer' && result.message.content, LOCAL_REPLIES.contact.ar)
  })

  it('leaves an open question to the model when one is configured', () => {
    assert.deepEqual(decideImmediateReply({ ...base, content: 'Tell me about mergeproof', proxyConfigured: true }), {
      kind: 'ask-model',
    })
  })

  it('leaves earlier questions out of the suggested follow-ups', () => {
    const earlier = [PROMPT_LIBRARY.cv.en, PROMPT_LIBRARY.background.en]
    const result = decideImmediateReply({ ...base, content: 'x', promptId: 'contact', proxyConfigured: true, earlierQuestions: earlier })
    const followUps = result.kind === 'answer' ? result.message.followUps ?? [] : []
    assert.deepEqual(followUps, pickFollowUpIds(LOCAL_REPLIES.contact.en, 'x', 'hero', earlier))
    assert.ok(!followUps.includes('cv') && !followUps.includes('background'), followUps.join())
  })

  it('answers from keywords without a model, or reports that it cannot', () => {
    const offline = { ...base, proxyConfigured: false }
    const result = decideImmediateReply({ ...offline, content: 'Tell me about mergeproof' })
    assert.equal(result.kind === 'answer' && result.message.content, LOCAL_REPLIES.mergeproof.en)
    assert.deepEqual(decideImmediateReply({ ...offline, content: 'Tell me a joke' }), { kind: 'unavailable' })
  })

  it('marks a keyword guess as a fallback, but not a suggested or exactly matched question', () => {
    const offline = { ...base, proxyConfigured: false }
    const guess = decideImmediateReply({ ...offline, content: 'Tell me about mergeproof' })
    assert.equal(guess.kind === 'answer' && guess.message.fallback, true)
    for (const result of [
      decideImmediateReply({ ...offline, content: 'x', promptId: 'cv' }),
      decideImmediateReply({ ...offline, content: 'Lebenslauf', lang: 'de' }),
      decideImmediateReply({ ...base, content: 'Download his CV', proxyConfigured: true }),
    ]) {
      assert.equal(result.kind, 'answer')
      assert.ok(result.kind === 'answer' && !('fallback' in result.message))
    }
  })
})

describe('requestModelReply', () => {
  type Call = { lane: string; proxyUrl: string; context: ChatContext; messages: unknown; signal?: AbortSignal }
  let log: string[]
  let consoleError: ReturnType<typeof mock.method>

  beforeEach(() => {
    log = []
    consoleError = mock.method(console, 'error', () => {})
  })
  afterEach(() => consoleError.mock.restore())

  const upstream500 = (provider: 'BigModel' | 'Groq') => createChatError(`${provider} down`, provider, 500)
  const proxy429 = () => createChatError('Rate limit exceeded.', 'BigModel', 429, undefined, true)
  const coded = (provider: 'BigModel' | 'Groq', status: number, code: string, scope: string) =>
    createChatError(code, provider, status, code, false, { scope })
  const context: ChatContext = { lang: 'en', section: 'hero', pathname: '/', entryIds: ['a'] }

  /** Fake providers: a reply, or an error to throw. Each call is logged. */
  function providers(bigModel: ChatReply | Error, groq: ChatReply | Error, onCall?: (name: string) => void) {
    const calls: Record<string, Call[]> = { bigModel: [], groq: [] }
    const make =
      (name: 'bigModel' | 'groq', result: ChatReply | Error): ModelProviders['bigModel'] =>
      async (options) => {
        log.push(name)
        calls[name].push(options)
        onCall?.(name)
        if (result instanceof Error) throw result
        return result
      }
    return { providers: { bigModel: make('bigModel', bigModel), groq: make('groq', groq) }, calls }
  }

  const request = (
    content: string,
    fakes: ReturnType<typeof providers>,
    isStopped: () => boolean = () => false
  ) =>
    requestModelReply({
      content,
      lang: 'en',
      transcript: [{ role: 'user', content }],
      context,
      proxyUrl: 'https://proxy.test',
      lane: 'deep',
      isStopped,
      onBeforeGroq: () => log.push('reset'),
      providers: fakes.providers,
    })

  it('returns the BigModel reply without trying Groq', async () => {
    const fakes = providers({ content: 'from BigModel' }, { content: 'from Groq' })
    assert.deepEqual(await request('Tell me a joke', fakes), { content: 'from BigModel' })
    assert.deepEqual(log, ['bigModel'])
    assert.equal(consoleError.mock.callCount(), 0)
  })

  it('passes the request through to the provider unchanged', async () => {
    const fakes = providers(upstream500('BigModel'), { content: 'ok' })
    await request('Tell me a joke', fakes)
    for (const call of [fakes.calls.bigModel[0], fakes.calls.groq[0]]) {
      assert.equal(call.lane, 'deep')
      assert.equal(call.proxyUrl, 'https://proxy.test')
      assert.deepEqual(call.context, context)
      assert.deepEqual(call.messages, [{ role: 'user', content: 'Tell me a joke' }])
    }
  })

  it('falls back to Groq after a BigModel failure, resetting the stream first', async () => {
    const fakes = providers(upstream500('BigModel'), { content: 'from Groq', incomplete: true })
    assert.deepEqual(await request('Tell me a joke', fakes), { content: 'from Groq', incomplete: true })
    assert.deepEqual(log, ['bigModel', 'reset', 'groq'])
    assert.equal(consoleError.mock.calls[0].arguments[0], 'Chat provider BigModel failed:')
  })

  it('falls back to a prepared reply when both lanes fail', async () => {
    const fakes = providers(upstream500('BigModel'), upstream500('Groq'))
    assert.deepEqual(await request('Tell me about mergeproof', fakes), { content: LOCAL_REPLIES.mergeproof.en, fallback: true })
    assert.deepEqual(
      consoleError.mock.calls.map((c) => c.arguments[0]),
      ['Chat provider BigModel failed:', 'Chat provider Groq failed:']
    )
  })

  it('throws the last provider error when there is no prepared reply either', async () => {
    const groqError = upstream500('Groq')
    await assert.rejects(request('Tell me a joke', providers(upstream500('BigModel'), groqError)), (e) => e === groqError)
  })

  it('skips Groq on a proxy rate limit and keeps the 429 for the error message', async () => {
    const limit = proxy429()
    await assert.rejects(request('Tell me a joke', providers(limit, { content: 'from Groq' })), (e) => e === limit)
    assert.deepEqual(log, ['bigModel'])
    assert.equal(chatErrorKind(limit), 'rate-limited')
  })

  it('shows the rate-limit message, not a prepared reply, on the visitor\'s own limit', async () => {
    const limit = createChatError('Slow down.', 'BigModel', 429, 'rate_limited', true, { scope: 'proxy', retryAfter: 30 })
    await assert.rejects(request('Tell me about mergeproof', providers(limit, { content: 'from Groq' })), (e) => e === limit)
    assert.deepEqual(log, ['bigModel'])
  })

  it('tries Groq when the Z.ai budget is spent or its key is missing', async () => {
    for (const error of [coded('BigModel', 503, 'budget_exhausted', 'zai'), coded('BigModel', 503, 'unavailable', 'zai')]) {
      log = []
      assert.deepEqual(await request('Tell me a joke', providers(error, { content: 'from Groq' })), { content: 'from Groq' })
      assert.deepEqual(log, ['bigModel', 'reset', 'groq'])
    }
  })

  it('goes straight to a prepared reply when the Worker itself is unavailable', async () => {
    const fakes = providers(coded('BigModel', 503, 'unavailable', 'worker'), { content: 'from Groq' })
    assert.deepEqual(await request('Tell me about mergeproof', fakes), { content: LOCAL_REPLIES.mergeproof.en, fallback: true })
    assert.deepEqual(log, ['bigModel'])
  })

  it('rethrows at once when the visitor stopped during BigModel', async () => {
    let stopped = false
    const abort = new Error('aborted')
    const fakes = providers(abort, { content: 'from Groq' }, () => (stopped = true))
    await assert.rejects(request('Tell me about mergeproof', fakes, () => stopped), (e) => e === abort)
    assert.deepEqual(log, ['bigModel'])
    assert.equal(consoleError.mock.callCount(), 0)
  })

  it('rethrows when the visitor stopped during Groq', async () => {
    let stopped = false
    const abort = new Error('aborted')
    const fakes = providers(upstream500('BigModel'), abort, (name) => {
      if (name === 'groq') stopped = true
    })
    await assert.rejects(request('Tell me about mergeproof', fakes, () => stopped), (e) => e === abort)
    assert.equal(consoleError.mock.callCount(), 1)
  })

  it('gives up quietly when the stop lands right after a BigModel failure', async () => {
    // isStopped is read live: false while handling the BigModel error, true just after.
    let reads = 0
    const fakes = providers(upstream500('BigModel'), { content: 'from Groq' })
    assert.equal(await request('Tell me about mergeproof', fakes, () => reads++ > 0), null)
    assert.deepEqual(log, ['bigModel'])
  })
})

describe('buildFinalMessage', () => {
  const long = 'This is one sentence of the reply. '.repeat(60)
  const base = { stopped: false, question: 'Tell me about mergeproof', section: 'hero' }

  it('keeps a streamed reply as shown and shortens any other', () => {
    assert.equal(buildFinalMessage({ ...base, reply: { content: long }, streamed: true }).content, long)
    const shortened = buildFinalMessage({ ...base, reply: { content: long }, streamed: false }).content
    assert.ok(shortened.length <= MAX_REPLY_CHARS + 3)
  })

  it('leaves earlier questions out of the follow-ups', () => {
    const earlier = [PROMPT_LIBRARY.guardrails_post.en]
    const message = buildFinalMessage({ ...base, reply: { content: 'Done.' }, streamed: true, earlierQuestions: earlier })
    assert.deepEqual(message.followUps, pickFollowUpIds('Done.', base.question, 'hero', earlier))
    assert.ok(!message.followUps?.includes('guardrails_post'))
  })

  it('suggests follow-ups for a complete reply', () => {
    assert.deepEqual(buildFinalMessage({ ...base, reply: { content: 'Done.' }, streamed: true }), {
      role: 'assistant',
      content: 'Done.',
      incomplete: undefined,
      followUps: pickFollowUpIds('Done.', base.question, 'hero'),
    })
  })

  it('keeps the fallback mark of a prepared reply, and adds none to a model reply', () => {
    const fallback = buildFinalMessage({ ...base, reply: { content: 'Done.', fallback: true }, streamed: false })
    assert.equal(fallback.fallback, true)
    assert.ok(fallback.followUps)
    assert.ok(!('fallback' in buildFinalMessage({ ...base, reply: { content: 'Done.' }, streamed: true })))
  })

  it('marks a stopped or cut-off reply incomplete, without follow-ups', () => {
    for (const message of [
      buildFinalMessage({ ...base, reply: { content: 'Hal' }, streamed: true, stopped: true }),
      buildFinalMessage({ ...base, reply: { content: 'Hal', incomplete: true }, streamed: true }),
    ]) {
      assert.equal(message.incomplete, true)
      assert.equal(message.followUps, undefined)
    }
  })
})

describe('chatErrorKind', () => {
  it('picks the message kind from the status and code', () => {
    assert.equal(chatErrorKind(createChatError('x', 'Groq', 429)), 'rate-limited')
    assert.equal(chatErrorKind(createChatError('x', 'Groq', 429, 'rate_limited')), 'rate-limited')
    for (const code of ['unavailable', 'budget_exhausted', 'upstream_error', 'upstream_timeout']) {
      assert.equal(chatErrorKind(createChatError('x', 'Groq', 503, code)), 'models-unavailable', code)
    }
    assert.equal(chatErrorKind(createChatError('x', 'Groq', 500)), 'generic')
    assert.equal(chatErrorKind(new Error('x')), 'generic')
    assert.equal(chatErrorKind(null), 'generic')
  })
})

describe('chatErrorMessage', () => {
  const LANGS = ['en', 'de', 'fr', 'es', 'ar'] as const

  it('has every per-code message in all five languages', () => {
    for (const key of ['rateLimited', 'rateLimitedRetry', 'limitedAnswers', 'genericError'] as const) {
      for (const lang of LANGS) assert.ok(CHAT_COPY[key][lang]?.trim(), `${key}.${lang}`)
    }
    for (const lang of LANGS) assert.ok(CHAT_COPY.rateLimitedRetry[lang].includes('{seconds}'), lang)
  })

  it('shows the wait time for the visitor\'s own limit', () => {
    const limit = createChatError('x', 'BigModel', 429, 'rate_limited', true, { retryAfter: 37 })
    for (const lang of LANGS) {
      const text = chatErrorMessage(limit, lang)
      assert.ok(text.includes('37') && !text.includes('{seconds}'), `${lang}: ${text}`)
    }
    assert.equal(chatErrorMessage(createChatError('x', 'BigModel', 429), 'en'), CHAT_COPY.rateLimited.en)
  })

  it('shows the prepared-topics hint when no model can answer, never a warm-up text', () => {
    for (const lang of LANGS) {
      const text = chatErrorMessage(createChatError('x', 'Groq', 503, 'unavailable', false, { scope: 'worker' }), lang)
      assert.equal(text, CHAT_COPY.limitedAnswers[lang])
      assert.ok(!/warming up/i.test(text))
    }
    assert.equal(chatErrorMessage(new Error('x'), 'de'), CHAT_COPY.genericError.de)
  })
})
