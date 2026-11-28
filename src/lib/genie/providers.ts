// Network side of Genie: calls the chat proxy for the Z.ai (BigModel) and Groq lanes,
// parses JSON and server-sent-event replies, and turns failures into typed errors.
//
// Since spec 007 PR 4 the site sends the v2 request (contracts/worker-api.md): the turns,
// the lane, the provider, the page context and the IDs of the retrieved knowledge entries.
// It sends no prompt text and no model or token settings; the Worker composes the prompt
// from the published prompt file and chooses the model itself.

import { createRequestTimers } from '@/lib/chat-request'
import type { Language } from '@/lib/i18n-config'
import type { ChatLane } from './prompts'
import { normalizePathname } from './retriever'

/** The part of a chat message the providers send: who said it and what. */
export type ChatTurn = { role: 'user' | 'assistant'; content: string }

/** The page context the Worker composes the prompt from. No prompt text leaves the site. */
export type ChatContext = {
  lang: Language
  section: string
  pathname: string
  /** The IDs of the knowledge entries retrieved for this question, best first. */
  entryIds: readonly string[]
}

export type ApiErrorDetail = { message?: string; type?: string; code?: string }

export type ChatCompletionResponse = {
  choices?: Array<{
    finish_reason?: string | null
    message?: {
      content?: string
    }
  }>
  error?: string | ApiErrorDetail
  /** `proxy`, `worker`, or the provider (`zai`, `groq`) the error is about. */
  scope?: string
  /** Seconds to wait, on `rate_limited` and `budget_exhausted`. */
  retryAfter?: number
}

export type ChatCompletionError = Error & {
  status?: number
  code?: string
  provider?: 'Groq' | 'BigModel'
  isProxyRateLimit?: boolean
  scope?: string
  retryAfter?: number
}

export const CHAT_PROXY_URL = process.env.NEXT_PUBLIC_CHAT_PROXY_URL?.trim()
export const MAX_REPLY_CHARS = 1600
export const TTFB_TIMEOUT_MS = 20000

/** The Worker's v2 limits (contracts/worker-api.md, "Request (v2)"). */
export const MAX_TURNS = 16
export const MAX_USER_TURN_CHARS = 2_000
export const MAX_ASSISTANT_TURN_CHARS = 8_000
export const MAX_ENTRY_IDS = 4

export function shortenReply(reply: string): string {
  if (reply.length <= MAX_REPLY_CHARS) return reply

  const compact = reply.replace(/\n{3,}/g, '\n\n').trim()
  const boundary = Math.max(
    compact.lastIndexOf('\n', MAX_REPLY_CHARS),
    compact.lastIndexOf('.', MAX_REPLY_CHARS),
    compact.lastIndexOf('!', MAX_REPLY_CHARS),
    compact.lastIndexOf('?', MAX_REPLY_CHARS)
  )
  const end = boundary > 900 ? boundary + 1 : MAX_REPLY_CHARS
  return `${compact.slice(0, end).trim()}...`
}

export function createChatError(
  message: string,
  provider: 'Groq' | 'BigModel',
  status?: number,
  code?: string,
  isProxyRateLimit = false,
  { scope, retryAfter }: { scope?: string; retryAfter?: number } = {}
): ChatCompletionError {
  const error = new Error(message) as ChatCompletionError
  error.provider = provider
  error.status = status
  error.code = code
  error.isProxyRateLimit = isProxyRateLimit
  if (scope !== undefined) error.scope = scope
  if (retryAfter !== undefined) error.retryAfter = retryAfter
  return error
}

export function isProxyRateLimitPayload(
  data: ChatCompletionResponse | null,
  status: number
): boolean {
  if (status !== 429 || !data) return false
  if (data.scope !== undefined) return data.scope === 'proxy'
  return data.error === 'Rate limit exceeded. Please try again later.'
}

export type StreamDelta = (fullContent: string) => void

export type StreamChunk = ChatCompletionResponse & {
  choices?: Array<{
    finish_reason?: string | null
    delta?: { content?: string }
    message?: { content?: string }
  }>
}

export type ChatReply = { content: string; incomplete?: boolean }
export type ChatProvider = 'Groq' | 'BigModel'

/** Whole seconds to wait, from the body's `retryAfter` or else the `Retry-After` header. */
function retryAfterSeconds(data: ChatCompletionResponse | null, response: Response): number | undefined {
  const fromBody = data?.retryAfter
  if (typeof fromBody === 'number' && Number.isFinite(fromBody) && fromBody > 0) return Math.ceil(fromBody)
  const fromHeader = Number(response.headers.get('Retry-After'))
  return Number.isFinite(fromHeader) && fromHeader > 0 ? Math.ceil(fromHeader) : undefined
}

export async function throwProviderError(response: Response, provider: ChatProvider): Promise<never> {
  const data = (await response.json().catch(() => null)) as ChatCompletionResponse | null
  const detail = data?.error
  const errorDetail = typeof detail === 'string' ? undefined : detail
  const message =
    typeof detail === 'string'
      ? detail
      : errorDetail?.message ?? `${provider} could not respond right now.`
  throw createChatError(
    message,
    provider,
    response.status,
    errorDetail?.code,
    isProxyRateLimitPayload(data, response.status),
    { scope: typeof data?.scope === 'string' ? data.scope : undefined, retryAfter: retryAfterSeconds(data, response) }
  )
}

export async function readChatResponse({
  response,
  provider,
  streaming,
  timers,
  onDelta,
}: {
  response: Response
  provider: ChatProvider
  streaming: boolean
  timers: ReturnType<typeof createRequestTimers>
  onDelta?: StreamDelta
}): Promise<ChatReply> {
  if (!streaming || !response.body || response.headers.get('Content-Type')?.includes('application/json')) {
    timers.onFirstByte()
    const data = (await response.json()) as ChatCompletionResponse
    const reply = data.choices?.[0]?.message?.content?.trim()
    if (!reply) throw createChatError(`${provider} returned an empty response.`, provider)
    const finishReason = data.choices?.[0]?.finish_reason
    return { content: reply, incomplete: Boolean(finishReason && finishReason !== 'stop') }
  }

  timers.onFirstByte()

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let content = ''
  let doneEvent = false
  let finishReason: string | undefined

  const consumeLine = (line: string) => {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) return
    const payload = trimmed.slice(5).trim()
    if (payload === '[DONE]') {
      doneEvent = true
      return
    }
    if (!payload) return
    let chunk: StreamChunk
    try {
      chunk = JSON.parse(payload) as StreamChunk
    } catch {
      return
    }
    if (chunk.error) {
      const detail = typeof chunk.error === 'string' ? undefined : chunk.error
      const message = typeof chunk.error === 'string' ? chunk.error : detail?.message ?? `${provider} stream failed.`
      // The Worker's standard error event carries the same code and scope as an error body.
      throw createChatError(message, provider, undefined, detail?.code, false, {
        scope: typeof chunk.scope === 'string' ? chunk.scope : undefined,
      })
    }
    const choice = chunk.choices?.[0]
    if (choice?.finish_reason) finishReason = choice.finish_reason
    const delta = choice?.delta?.content
    if (delta) {
      content += delta
      onDelta?.(content)
    }
  }

  try {
    while (!doneEvent) {
      const { done, value } = await reader.read()
      if (done) break
      timers.onChunk()
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) consumeLine(line)
    }
    if (!doneEvent) consumeLine(buffer + decoder.decode())
  } catch (streamError) {
    if (!content.trim()) throw streamError
    return { content: content.trim(), incomplete: true }
  } finally {
    void reader.cancel().catch(() => {})
    reader.releaseLock()
  }

  if (!content.trim()) {
    throw createChatError(`${provider} returned an empty response.`, provider)
  }
  return { content: content.trim(), incomplete: finishReason ? finishReason !== 'stop' : !doneEvent }
}

export function linkAbortSignals(externalSignal: AbortSignal | undefined, controller: AbortController): () => void {
  if (!externalSignal) return () => {}
  if (externalSignal.aborted) {
    controller.abort(externalSignal.reason)
    return () => {}
  }
  const onAbort = () => controller.abort(externalSignal.reason)
  externalSignal.addEventListener('abort', onAbort, { once: true })
  return () => externalSignal.removeEventListener('abort', onAbort)
}

/**
 * The v2 request body. Keeps the last 16 turns and cuts any turn over the Worker's
 * limit (the input already stops at 2,000 characters), so a long conversation is never
 * refused as invalid. The pathname is sent normalized, as the prompt file lists paths.
 */
export function buildChatRequest({
  messages,
  context,
  lane,
  provider,
  stream,
}: {
  messages: readonly ChatTurn[]
  context: ChatContext
  lane: ChatLane
  provider: 'zai' | 'groq'
  stream: boolean
}) {
  return {
    version: 2 as const,
    turns: messages.slice(-MAX_TURNS).map(({ role, content }) => ({
      role,
      content: content.slice(0, role === 'user' ? MAX_USER_TURN_CHARS : MAX_ASSISTANT_TURN_CHARS),
    })),
    lane,
    provider,
    lang: context.lang,
    section: context.section,
    pathname: normalizePathname(context.pathname) || '/',
    entryIds: context.entryIds.slice(0, MAX_ENTRY_IDS),
    stream,
  }
}

type ProviderOptions = {
  messages: readonly ChatTurn[]
  context: ChatContext
  proxyUrl: string
  lane: ChatLane
  signal?: AbortSignal
  onDelta?: StreamDelta
}

async function fetchProvider(
  provider: ChatProvider,
  { messages, context, proxyUrl, lane, signal, onDelta }: ProviderOptions
): Promise<ChatReply> {
  const controller = new AbortController()
  const unlinkSignal = linkAbortSignals(signal, controller)
  const timers = createRequestTimers({
    firstByteMs: TTFB_TIMEOUT_MS,
    idleMs: 15_000,
    totalMs: 60_000,
    onTimeout: (reason) => {
      controller.abort(createChatError(`${provider} timed out (${reason})`, provider))
    },
  })

  try {
    const streaming = Boolean(onDelta)
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        buildChatRequest({ messages, context, lane, provider: provider === 'BigModel' ? 'zai' : 'groq', stream: streaming })
      ),
      signal: controller.signal,
    })

    if (!response.ok) {
      await throwProviderError(response, provider)
    }

    return await readChatResponse({ response, provider, streaming, timers, onDelta })
  } finally {
    unlinkSignal()
    timers.clear()
  }
}

/** Asks the Worker for a Z.ai answer. */
export function fetchBigModel(options: ProviderOptions): Promise<ChatReply> {
  return fetchProvider('BigModel', options)
}

/** Asks the Worker for a Groq answer. */
export function fetchGroq(options: ProviderOptions): Promise<ChatReply> {
  return fetchProvider('Groq', options)
}
