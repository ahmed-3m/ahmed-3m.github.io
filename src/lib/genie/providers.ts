// Network side of Genie: calls the chat proxy for the BigModel (Z.ai) and Groq lanes,
// parses JSON and server-sent-event replies, and turns failures into typed errors.
// Moved unchanged from src/components/ChatBotPanel.tsx so it can be unit-tested.

import { buildChatMessages, createRequestTimers } from '@/lib/chat-request'
import type { ChatLane } from './prompts'

/** The part of a chat message the providers send: who said it and what. */
export type ChatTurn = { role: 'user' | 'assistant'; content: string }

export type ApiErrorDetail = { message?: string; type?: string; code?: string }

export type ChatCompletionResponse = {
  choices?: Array<{
    finish_reason?: string | null
    message?: {
      content?: string
    }
  }>
  error?: string | ApiErrorDetail
  scope?: 'proxy' | 'upstream'
}

export type ChatCompletionError = Error & {
  status?: number
  code?: string
  provider?: 'Groq' | 'BigModel'
  isProxyRateLimit?: boolean
}

const GROQ_MODEL = process.env.NEXT_PUBLIC_GROQ_MODEL || 'openai/gpt-oss-20b'
// Both are GLM Coding Plan models, which is what the chat proxy's Z.ai key is for.
// If glm-5.4 is refused, Genie falls back to Groq and then to prepared answers.
const ZAI_MODEL = process.env.NEXT_PUBLIC_BIGMODEL_MODEL || 'glm-5.4'
const ZAI_FAST_MODEL = process.env.NEXT_PUBLIC_ZAI_FAST_MODEL || 'glm-5.3-flash'
export const CHAT_PROXY_URL = process.env.NEXT_PUBLIC_CHAT_PROXY_URL?.trim()
export const MAX_REPLY_CHARS = 1600
export const TTFB_TIMEOUT_MS = 20000

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
  isProxyRateLimit = false
): ChatCompletionError {
  const error = new Error(message) as ChatCompletionError
  error.provider = provider
  error.status = status
  error.code = code
  error.isProxyRateLimit = isProxyRateLimit
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

export async function throwProviderError(
  response: Response,
  provider: ChatProvider,
  status503Message?: string
): Promise<never> {
  const data = (await response.json().catch(() => null)) as ChatCompletionResponse | null
  const detail = data?.error
  const errorDetail = typeof detail === 'string' ? undefined : detail
  const message =
    typeof detail === 'string'
      ? detail
      : errorDetail?.message ?? `${provider} could not respond right now.`
  const isProxyRateLimit = isProxyRateLimitPayload(data, response.status)
  if (status503Message && response.status === 503) {
    throw createChatError(status503Message, provider, response.status, errorDetail?.code, isProxyRateLimit)
  }
  throw createChatError(message, provider, response.status, errorDetail?.code, isProxyRateLimit)
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
      const message =
        typeof chunk.error === 'string'
          ? chunk.error
          : chunk.error.message ?? `${provider} stream failed.`
      throw createChatError(message, provider)
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

export async function fetchBigModel({
  messages,
  systemPrompt,
  proxyUrl,
  lane,
  signal,
  onDelta,
}: {
  messages: readonly ChatTurn[]
  systemPrompt: string
  proxyUrl: string
  lane: ChatLane
  signal?: AbortSignal
  onDelta?: StreamDelta
}): Promise<ChatReply> {
  const model = lane === 'fast' ? ZAI_FAST_MODEL : ZAI_MODEL
  // GLM-5 models allocate part of max_tokens to internal reasoning before
  // emitting visible delta.content; keep fast headroom generous and cap
  // reasoning_effort to 'low' on both lanes to avoid empty/truncated replies.
  const maxTokens = lane === 'fast' ? 900 : 1200
  const payloadMessages = buildChatMessages(systemPrompt, messages)

  const controller = new AbortController()
  const unlinkSignal = linkAbortSignals(signal, controller)
  const timers = createRequestTimers({
    firstByteMs: TTFB_TIMEOUT_MS,
    idleMs: 15_000,
    totalMs: 60_000,
    onTimeout: (reason) => {
      controller.abort(createChatError(`BigModel timed out (${reason})`, 'BigModel'))
    },
  })

  try {
    const streaming = Boolean(onDelta)
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: payloadMessages,
        max_tokens: maxTokens,
        temperature: 0.3,
        stream: streaming,
        reasoning_effort: 'low',
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      await throwProviderError(response, 'BigModel')
    }

    return await readChatResponse({
      response,
      provider: 'BigModel',
      streaming,
      timers,
      onDelta,
    })
  } finally {
    unlinkSignal()
    timers.clear()
  }
}

export async function fetchGroq({
  messages,
  systemPrompt,
  proxyUrl,
  lane,
  signal,
  onDelta,
}: {
  messages: readonly ChatTurn[]
  systemPrompt: string
  proxyUrl: string
  lane: ChatLane
  signal?: AbortSignal
  onDelta?: StreamDelta
}): Promise<ChatReply> {
  // gpt-oss-20b also consumes reasoning tokens out of max_tokens; give both
  // lanes enough headroom (within worker MAX_TOKENS_CAP = 1200) to finish cleanly.
  const maxTokens = lane === 'fast' ? 900 : 1200
  const payloadMessages = buildChatMessages(systemPrompt, messages)

  const controller = new AbortController()
  const unlinkSignal = linkAbortSignals(signal, controller)
  const timers = createRequestTimers({
    firstByteMs: TTFB_TIMEOUT_MS,
    idleMs: 15_000,
    totalMs: 60_000,
    onTimeout: (reason) => {
      controller.abort(createChatError(`Groq timed out (${reason})`, 'Groq'))
    },
  })

  try {
    const streaming = Boolean(onDelta)
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: payloadMessages,
        max_tokens: maxTokens,
        temperature: 0.3,
        stream: streaming,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      await throwProviderError(
        response,
        'Groq',
        'Model is warming up, try again in a moment.'
      )
    }

    return await readChatResponse({
      response,
      provider: 'Groq',
      streaming,
      timers,
      onDelta,
    })
  } finally {
    unlinkSignal()
    timers.clear()
  }
}
