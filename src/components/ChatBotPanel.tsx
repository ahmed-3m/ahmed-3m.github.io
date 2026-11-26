'use client'

import type { CSSProperties, FormEvent, MouseEvent, ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, ChevronRight, RotateCcw, Square, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { translateValue, type Language } from '@/lib/i18n-config'
import { buildChatMessages, createRequestTimers } from '@/lib/chat-request'
import { parseInlineTokens, type BidiSegment, type InlineToken } from '@/lib/genie/markdown'
import {
  PROMPTS,
  PROMPT_LIBRARY,
  STARTER_PROMPT_IDS,
  LOCAL_REPLIES,
  REPLY_FOR_PROMPT,
  findCuratedTopic,
  getLocalReply,
  getStarterPrompts,
  pickFollowUpIds,
  resolveSectionForPathname,
  routeLocally,
  type ChatLane,
  type PromptId,
} from '@/lib/genie/prompts'
import { buildSystemPrompt } from '@/lib/genie/retriever'
import { CHAT_COPY } from './chatbot-dictionaries'

export type ChatRole = 'user' | 'assistant'
export type { PromptId }
export {
  PROMPT_LIBRARY,
  PROMPTS,
  STARTER_PROMPT_IDS,
  LOCAL_REPLIES,
  getLocalReply,
  getStarterPrompts,
  pickFollowUpIds,
}

export type ChatMessage = {
  role: ChatRole
  content: string
  followUps?: PromptId[]
  incomplete?: boolean
}

type ApiErrorDetail = { message?: string; type?: string; code?: string }

type ChatCompletionResponse = {
  choices?: Array<{
    finish_reason?: string | null
    message?: {
      content?: string
    }
  }>
  error?: string | ApiErrorDetail
  scope?: 'proxy' | 'upstream'
}

type ChatCompletionError = Error & {
  status?: number
  code?: string
  provider?: 'Groq' | 'BigModel'
  isProxyRateLimit?: boolean
}

const GROQ_MODEL = process.env.NEXT_PUBLIC_GROQ_MODEL || 'openai/gpt-oss-20b'
const ZAI_MODEL = process.env.NEXT_PUBLIC_BIGMODEL_MODEL || 'glm-5.3'
const ZAI_FAST_MODEL = process.env.NEXT_PUBLIC_ZAI_FAST_MODEL || 'glm-5-turbo'
const CHAT_PROXY_URL = process.env.NEXT_PUBLIC_CHAT_PROXY_URL?.trim()
const MAX_REPLY_CHARS = 1600
const TTFB_TIMEOUT_MS = 20000

function shortenReply(reply: string): string {
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

function createChatError(
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

function isProxyRateLimitPayload(
  data: ChatCompletionResponse | null,
  status: number
): boolean {
  if (status !== 429 || !data) return false
  if (data.scope !== undefined) return data.scope === 'proxy'
  return data.error === 'Rate limit exceeded. Please try again later.'
}

type StreamDelta = (fullContent: string) => void

type StreamChunk = ChatCompletionResponse & {
  choices?: Array<{
    finish_reason?: string | null
    delta?: { content?: string }
    message?: { content?: string }
  }>
}

type ChatReply = { content: string; incomplete?: boolean }
type ChatProvider = 'Groq' | 'BigModel'

async function throwProviderError(
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

async function readChatResponse({
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

function linkAbortSignals(externalSignal: AbortSignal | undefined, controller: AbortController): () => void {
  if (!externalSignal) return () => {}
  if (externalSignal.aborted) {
    controller.abort(externalSignal.reason)
    return () => {}
  }
  const onAbort = () => controller.abort(externalSignal.reason)
  externalSignal.addEventListener('abort', onAbort, { once: true })
  return () => externalSignal.removeEventListener('abort', onAbort)
}

async function fetchBigModel({
  messages,
  systemPrompt,
  proxyUrl,
  lane,
  signal,
  onDelta,
}: {
  messages: readonly ChatMessage[]
  systemPrompt: string
  proxyUrl: string
  lane: ChatLane
  signal?: AbortSignal
  onDelta?: StreamDelta
}): Promise<ChatReply> {
  const model = lane === 'fast' ? ZAI_FAST_MODEL : ZAI_MODEL
  const maxTokens = lane === 'fast' ? 380 : 1200
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
        ...(lane === 'deep' ? { reasoning_effort: 'low' } : {}),
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

async function fetchGroq({
  messages,
  systemPrompt,
  proxyUrl,
  lane,
  signal,
  onDelta,
}: {
  messages: readonly ChatMessage[]
  systemPrompt: string
  proxyUrl: string
  lane: ChatLane
  signal?: AbortSignal
  onDelta?: StreamDelta
}): Promise<ChatReply> {
  const maxTokens = lane === 'fast' ? 420 : 900
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

function renderBidiSegments(segments: BidiSegment[], keyPrefix: string): ReactNode[] {
  return segments.map((segment, index) =>
    segment.type === 'bidi' ? (
      <bdi key={`${keyPrefix}-bdi-${index}`} dir="ltr">
        {segment.text}
      </bdi>
    ) : (
      <span key={`${keyPrefix}-txt-${index}`}>{segment.text}</span>
    )
  )
}

function renderInlineTokens(
  tokens: InlineToken[],
  keyPrefix: string,
  onInternalLinkClick?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void
): ReactNode[] {
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`
    if (token.type === 'text') {
      return <span key={key}>{renderBidiSegments(token.segments, key)}</span>
    }
    if (token.type === 'code') {
      return (
        <code
          key={key}
          dir="ltr"
          style={{
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            fontSize: '0.9em',
            padding: '0.05em 0.3em',
            borderRadius: '4px',
            background: 'color-mix(in srgb, var(--cd-surf) 70%, transparent)',
          }}
        >
          {token.text}
        </code>
      )
    }
    if (token.type === 'bold') {
      return <strong key={key}>{renderInlineTokens(token.children, key, onInternalLinkClick)}</strong>
    }
    if (token.type === 'italic') {
      return <em key={key}>{renderInlineTokens(token.children, key, onInternalLinkClick)}</em>
    }
    return (
      <a
        key={key}
        href={token.href}
        target={token.external ? '_blank' : undefined}
        rel={token.external ? 'noopener noreferrer' : undefined}
        onClick={
          !token.external && onInternalLinkClick
            ? (event) => onInternalLinkClick(token.href, event)
            : undefined
        }
        style={{
          color: 'inherit',
          textDecoration: 'underline',
          textUnderlineOffset: '0.18em',
          textDecorationColor: 'color-mix(in srgb, currentColor 55%, transparent)',
        }}
      >
        {renderBidiSegments(token.labelSegments, `${key}-lbl`)}
      </a>
    )
  })
}

function renderMarkdown(
  text: string,
  onInternalLinkClick?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void
): ReactNode {
  const lines = text.split('\n')
  const result: ReactNode[] = []
  const pending: string[] = []
  let keyIndex = 0

  const flushList = () => {
    if (pending.length === 0) return
    const key = `ul-${keyIndex++}`
    result.push(
      <ul key={key} style={{ paddingInlineStart: '1.1em', margin: '0.25em 0', listStyleType: 'disc' }}>
        {pending.map((item, index) => (
          <li key={`${key}-${index}`} style={{ margin: '0.1em 0' }}>
            {renderInlineTokens(parseInlineTokens(item), `${key}-${index}`, onInternalLinkClick)}
          </li>
        ))}
      </ul>
    )
    pending.length = 0
  }

  for (const [index, line] of lines.entries()) {
    const heading = line.match(/^(#{1,3})\s+(.+)/)
    const bullet = line.match(/^[-*]\s+(.+)/)

    if (heading) {
      flushList()
      result.push(
        <span
          key={`h-${index}`}
          style={{ display: 'block', fontWeight: 600, marginTop: '0.5em', marginBottom: '0.1em' }}
        >
          {renderInlineTokens(parseInlineTokens(heading[2]), `h-${index}`, onInternalLinkClick)}
        </span>
      )
    } else if (bullet) {
      pending.push(bullet[1])
    } else {
      flushList()
      if (!line.trim()) {
        if (result.length > 0) result.push(<div key={`sp-${index}`} style={{ height: '0.4em' }} />)
      } else {
        result.push(
          <span key={`l-${index}`} style={{ display: 'block' }}>
            {renderInlineTokens(parseInlineTokens(line), `l-${index}`, onInternalLinkClick)}
          </span>
        )
      }
    }
  }

  flushList()
  return <>{result}</>
}

function trackChatEvent() {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // @ts-expect-error gtag is injected by analytics
    window.gtag('event', 'chat_message', {
      event_category: 'chatbot',
    })
  }
}

function useCurrentSection() {
  const pathname = usePathname()
  const routeSection = resolveSectionForPathname(pathname)
  const [section, setSection] = useState('hero')

  useEffect(() => {
    if (routeSection) return
    const sections = ['hero', 'about', 'projects', 'experience', 'research', 'evidence', 'ood-explorer', 'writing', 'contact']

    const pickFromViewport = () => {
      let best = 'hero'
      let bestDistance = Number.POSITIVE_INFINITY

      for (const id of sections) {
        const element = document.getElementById(id)
        if (!element) continue
        const rect = element.getBoundingClientRect()
        const distance = Math.abs(rect.top - 140)
        if (rect.bottom > 120 && distance < bestDistance) {
          best = id
          bestDistance = distance
        }
      }

      setSection(best)
    }

    pickFromViewport()
    window.addEventListener('hashchange', pickFromViewport)
    window.addEventListener('scroll', pickFromViewport, { passive: true })
    window.addEventListener('resize', pickFromViewport)

    return () => {
      window.removeEventListener('hashchange', pickFromViewport)
      window.removeEventListener('scroll', pickFromViewport)
      window.removeEventListener('resize', pickFromViewport)
    }
  }, [pathname, routeSection])

  return routeSection ?? section
}

const bubbleStyles = {
  assistant: {
    background: 'color-mix(in srgb, var(--cd-elev) 78%, var(--cd-bg) 22%)',
    borderColor: 'var(--cd-b0)',
    color: 'var(--cd-fg1)',
    boxShadow: '0 12px 32px color-mix(in srgb, var(--cd-bg) 32%, transparent)',
  },
  user: {
    background:
      'linear-gradient(135deg, var(--cd-accent) 0%, color-mix(in srgb, var(--cd-accent) 70%, var(--cd-success) 30%) 100%)',
    borderColor: 'var(--cd-b-accent)',
    color: 'var(--cd-bg)',
    boxShadow: '0 12px 32px color-mix(in srgb, var(--cd-bg) 32%, transparent)',
  },
} satisfies Record<ChatRole, CSSProperties>

function SuggestedQuestions({ label, prompts, labelForPrompt, onSelect }: {
  label: string
  prompts: PromptId[]
  labelForPrompt: (id: PromptId) => string
  onSelect: (id: PromptId) => void
}) {
  return (
    <div role="group" aria-label={label} className="space-y-2">
      <p aria-hidden="true" className="text-xs font-semibold text-[var(--cd-fg2)]">{label}</p>
      <ul className="grid list-none gap-2 p-0">
        {prompts.map((id) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-[var(--cd-b1)] bg-[var(--cd-surf)] px-3 py-2 text-start text-sm leading-5 text-[var(--cd-fg1)] hover:border-[var(--cd-accent)]"
            >
              <span className="min-w-0 break-words">{labelForPrompt(id)}</span>
              <ChevronRight aria-hidden="true" size={14} className="shrink-0 text-[var(--cd-fg2)] rtl:rotate-180" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function LoadingDots({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="inline-flex items-center gap-1 rounded-2xl border px-3 py-2"
      style={bubbleStyles.assistant}
      aria-label={label}
    >
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: 'var(--cd-accent)',
            animation: `pulse-dot 1s ease-in-out ${index * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

type ChatBotPanelProps = {
  /** Whether the shell's dialog wrapper is open. */
  isOpen: boolean
  /** Closes the panel in the shell (Escape, close button, overlay). */
  onClose: () => void
}

/**
 * Heavy chatbot internals — dictionaries, streaming client, provider fallbacks and
 * the full panel UI. Loaded lazily by ChatBot.tsx; stays mounted after the first
 * load so the conversation survives closing and reopening the panel.
 */
export default function ChatBotPanel({ isOpen, onClose }: ChatBotPanelProps) {
  const { lang, t } = useI18n()
  const pathname = usePathname()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentSection = useCurrentSection()
  const messagesRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const activeAbortRef = useRef<AbortController | null>(null)
  const stopRequestedRef = useRef(false)

  const starterPrompts = useMemo(() => getStarterPrompts(currentSection), [currentSection])

  useEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
    closeButtonRef.current?.focus({ preventScroll: true })

    function handleKeyDown(event: KeyboardEvent) {
      // Escape is handled by the shell (ChatBot.tsx) so it works before this
      // lazy chunk arrives; the panel only owns the focus trap.
      if (event.key !== 'Tab') return
      if (!panel) return
      const focusable = panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    const container = messagesRef.current
    if (!container) return
    container.scrollTo({
      top: container.scrollHeight,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }, [messages, isLoading])

  useEffect(() => {
    return () => {
      activeAbortRef.current?.abort()
    }
  }, [])

  function labelForPrompt(promptId: PromptId) {
    return translateValue(lang, PROMPTS[promptId])
  }

  function handleStop() {
    if (!isLoading) return
    stopRequestedRef.current = true
    activeAbortRef.current?.abort(new DOMException('Stopped by user', 'AbortError'))
  }

  function handleReset() {
    if (isLoading) return
    setMessages([])
    setInput('')
    setError(null)
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true })
    })
  }

  async function sendMessage(messageText: string, promptId?: PromptId, retry = false) {
    const content = messageText.trim()
    if (!content || isLoading) return

    const nextMessages: ChatMessage[] = retry
      ? messages.slice(0, -1)
      : [...messages, { role: 'user', content }]

    setMessages(nextMessages)
    setInput('')
    setError(null)
    trackChatEvent()

    // Suggested questions point to public facts and can answer immediately.
    const curatedTopic = promptId ? REPLY_FOR_PROMPT[promptId] : findCuratedTopic(content)
    const curatedReply = curatedTopic ? translateValue(lang, LOCAL_REPLIES[curatedTopic]) : null
    if (curatedReply || !CHAT_PROXY_URL) {
      const local = curatedReply ?? getLocalReply(content, lang)
      if (local) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: local,
            followUps: pickFollowUpIds(local, content, currentSection),
          },
        ])
        return
      }
      setError(t(CHAT_COPY.limitedAnswers))
      return
    }

    setIsLoading(true)
    setIsStreaming(false)
    stopRequestedRef.current = false
    const requestAbort = new AbortController()
    activeAbortRef.current = requestAbort
    const transcript = nextMessages.filter((message) => !message.incomplete)
    const lane = routeLocally(content)
    const systemPrompt = buildSystemPrompt({
      lang: lang as Language,
      query: content,
      history: transcript.slice(0, -1),
      section: currentSection,
      pathname,
    })

    let streamStarted = false

    try {
      const emitDelta = (fullContent: string) => {
        if (!streamStarted) {
          if (!fullContent.trim()) return
          streamStarted = true
          setIsStreaming(true)
          setMessages((prev) => [...prev, { role: 'assistant', content: fullContent }])
          return
        }
        setMessages((prev) =>
          prev.map((message, index) =>
            index === prev.length - 1 && message.role === 'assistant'
              ? { ...message, content: fullContent }
              : message
          )
        )
      }

      let rawReply: ChatReply | null = null
      let lastProviderError: unknown = null

      try {
        rawReply = await fetchBigModel({
          messages: transcript,
          systemPrompt,
          proxyUrl: CHAT_PROXY_URL,
          lane,
          signal: requestAbort.signal,
          onDelta: emitDelta,
        })
      } catch (providerError) {
        if (stopRequestedRef.current) {
          throw providerError
        }
        lastProviderError = providerError
        console.error('Chat provider BigModel failed:', providerError)
      }

      const proxyRateLimited = Boolean(
        (lastProviderError as ChatCompletionError | undefined)?.isProxyRateLimit
      )

      if (rawReply === null && !proxyRateLimited && !stopRequestedRef.current) {
        try {
          streamStarted = false
          rawReply = await fetchGroq({
            messages: transcript,
            systemPrompt,
            proxyUrl: CHAT_PROXY_URL,
            lane,
            signal: requestAbort.signal,
            onDelta: emitDelta,
          })
        } catch (providerError) {
          if (stopRequestedRef.current) {
            throw providerError
          }
          lastProviderError = providerError
          console.error('Chat provider Groq failed:', providerError)
        }
      }

      if (rawReply === null && !stopRequestedRef.current) {
        const local = getLocalReply(content, lang)
        if (local) {
          rawReply = { content: local }
        } else {
          throw lastProviderError ?? new Error('No chat provider succeeded.')
        }
      }

      if (rawReply) {
        const reply = streamStarted ? rawReply.content : shortenReply(rawReply.content)
        const finalMessage: ChatMessage = {
          role: 'assistant',
          content: reply,
          incomplete: stopRequestedRef.current || rawReply.incomplete,
          followUps:
            stopRequestedRef.current || rawReply.incomplete
              ? undefined
              : pickFollowUpIds(reply, content, currentSection),
        }
        setMessages((prev) => [...(streamStarted ? prev.slice(0, -1) : prev), finalMessage])
      }
    } catch (caughtError) {
      if (stopRequestedRef.current) {
        if (streamStarted) {
          setMessages((prev) =>
            prev.map((message, index) =>
              index === prev.length - 1 && message.role === 'assistant'
                ? { ...message, incomplete: true, followUps: undefined }
                : message
            )
          )
        } else {
          setMessages(messages)
          if (!retry) setInput((current) => current || content)
        }
        return
      }
      // Roll back to the pre-send transcript. On a fresh question, also put the
      // text back in the box (unless the visitor already typed something new),
      // so sending again does not mean retyping it.
      setMessages(messages)
      if (!retry) setInput((current) => current || content)
      console.error('Chat failed across all configured providers:', caughtError)
      const status = (caughtError as ChatCompletionError | undefined)?.status
      setError(t(status === 429 ? CHAT_COPY.rateLimited : CHAT_COPY.genericError))
    } finally {
      if (activeAbortRef.current === requestAbort) {
        activeAbortRef.current = null
      }
      stopRequestedRef.current = false
      setIsLoading(false)
      setIsStreaming(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void sendMessage(input)
  }

  function handlePrompt(promptId: PromptId) {
    void sendMessage(labelForPrompt(promptId), promptId)
    requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true })
    })
  }

  function handleInternalLinkClick(href: string, event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (!href.includes('#')) return
    const [linkPath, linkHash] = href.split('#')
    const normCurrent = pathname.replace(/\/$/, '') || '/'
    const normTarget = (linkPath || '/').replace(/\/$/, '') || '/'
    if (normCurrent !== normTarget) return
    event.preventDefault()
    onClose()
    if (linkHash) {
      document.getElementById(linkHash)?.scrollIntoView()
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}#${linkHash}`
      )
    }
  }

  return (
    <div ref={panelRef} className="flex h-full flex-col">
      <header
        className="flex items-center justify-between border-b px-4 py-4"
        style={{ borderColor: 'var(--cd-b0)' }}
      >
        <h2 className="text-sm font-semibold tracking-[0.02em]" style={{ color: 'var(--cd-fg1)' }}>
          {t(CHAT_COPY.title)}
        </h2>
        <div className="flex items-center gap-2">
          {messages.length > 0 && !isLoading && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
              style={{
                borderColor: 'var(--cd-b0)',
                background: 'color-mix(in srgb, var(--cd-surf) 74%, var(--cd-bg) 26%)',
                color: 'var(--cd-fg2)',
              }}
              aria-label={t(CHAT_COPY.newChat)}
              title={t(CHAT_COPY.newChat)}
            >
              <RotateCcw size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            ref={closeButtonRef}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
            style={{
              borderColor: 'var(--cd-b0)',
              background: 'color-mix(in srgb, var(--cd-surf) 74%, var(--cd-bg) 26%)',
              color: 'var(--cd-fg2)',
            }}
            aria-label={t(CHAT_COPY.close)}
          >
            <X size={17} />
          </button>
        </div>
      </header>

      <div
        ref={messagesRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div
              className="max-w-[92%] rounded-2xl border px-3 py-3 text-sm leading-6"
              style={bubbleStyles.assistant}
            >
              {t(CHAT_COPY.welcome)}
            </div>
            <SuggestedQuestions
              label={t(CHAT_COPY.suggestions)}
              prompts={starterPrompts}
              labelForPrompt={labelForPrompt}
              onSelect={handlePrompt}
            />
          </div>
        ) : (
          messages.map((message, index) => {
            const isLastAssistant =
              message.role === 'assistant' &&
              !messages.slice(index + 1).some((item) => item.role === 'assistant')

            return (
              <div key={`${message.role}-${index}`} className="space-y-2">
                <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] min-w-0 break-words rounded-2xl border px-3 py-2.5 text-sm leading-6${
                      message.role === 'user' ? ' whitespace-pre-wrap' : ''
                    }`}
                    style={bubbleStyles[message.role]}
                  >
                    {message.role === 'assistant'
                      ? renderMarkdown(message.content, handleInternalLinkClick)
                      : message.content}
                  </div>
                </div>

                {message.incomplete && (
                  <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--cd-warn)' }}>
                    <span>{t(CHAT_COPY.incompleteReply)}</span>
                    {index === messages.length - 1 && !isLoading && (
                      <button
                        type="button"
                        className="rounded-md px-2 py-1 underline"
                        onClick={() => void sendMessage(messages[index - 1].content, undefined, true)}
                      >
                        {t(CHAT_COPY.retryReply)}
                      </button>
                    )}
                  </div>
                )}

                {isLastAssistant && !isLoading && message.followUps && message.followUps.length > 0 && (
                  <SuggestedQuestions
                    label={t(CHAT_COPY.followUps)}
                    prompts={message.followUps}
                    labelForPrompt={labelForPrompt}
                    onSelect={handlePrompt}
                  />
                )}
              </div>
            )
          })
        )}

        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <LoadingDots label={t(CHAT_COPY.typing)} />
          </div>
        )}
      </div>

      <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: 'var(--cd-b0)' }}>
        {error && (
          <p role="alert" className="mb-3 text-xs leading-5" style={{ color: 'var(--cd-warn)' }}>
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t(CHAT_COPY.placeholder)}
            className="h-12 min-w-0 flex-1 rounded-2xl border px-4 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cd-accent)] md:text-sm"
            style={{
              borderColor: 'var(--cd-b0)',
              background: 'color-mix(in srgb, var(--cd-surf) 70%, var(--cd-bg) 30%)',
              color: 'var(--cd-fg1)',
            }}
            aria-label={t(CHAT_COPY.dialogLabel)}
          />
          {isLoading ? (
            <button
              type="button"
              onClick={handleStop}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors"
              style={{
                borderColor: 'var(--cd-b1)',
                background: 'var(--cd-surf)',
                color: 'var(--cd-fg1)',
              }}
              aria-label={t(CHAT_COPY.stopGenerating)}
              title={t(CHAT_COPY.stopGenerating)}
            >
              <Square size={15} fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-all disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: 'var(--cd-accent)',
                color: 'var(--cd-bg)',
                boxShadow: '0 12px 30px color-mix(in srgb, var(--cd-accent) 28%, transparent)',
              }}
              aria-label={t(CHAT_COPY.send)}
            >
              <ArrowUp size={17} />
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
