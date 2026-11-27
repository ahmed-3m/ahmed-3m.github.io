// How Genie decides what to answer, without any React state: answer at once from a
// prepared reply, or ask the model lanes (BigModel, then Groq) and fall back to a
// prepared reply when both fail. ChatBotPanel owns the UI state around these calls.

import { translateValue, type Language } from '@/lib/i18n-config'
import {
  LOCAL_REPLIES,
  REPLY_FOR_PROMPT,
  findCuratedTopic,
  getLocalReply,
  pickFollowUpIds,
  questionLanguage,
  type ChatLane,
  type PromptId,
} from './prompts'
import {
  fetchBigModel,
  fetchGroq,
  shortenReply,
  type ChatCompletionError,
  type ChatReply,
  type ChatTurn,
  type StreamDelta,
} from './providers'

export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  content: string
  followUps?: PromptId[]
  incomplete?: boolean
  /**
   * The answer is a prepared reply picked by keyword because no model answered.
   * It may not fit the question, so the panel says so under it.
   */
  fallback?: boolean
}

/** A model reply, or a prepared reply standing in for one (`fallback`). */
export type ModelReply = ChatReply & { fallback?: true }

export type ImmediateReply =
  | { kind: 'answer'; message: ChatMessage }
  | { kind: 'unavailable' }
  | { kind: 'ask-model' }

/**
 * Suggested questions, and questions that match a prepared topic, are answered at
 * once from public facts. Without a chat proxy every question is answered that way,
 * or not at all ('unavailable'); an answer guessed from keywords is marked `fallback`.
 */
export function decideImmediateReply({
  content,
  promptId,
  lang,
  proxyConfigured,
  section,
  earlierQuestions = [],
}: {
  content: string
  promptId?: PromptId
  lang: Language
  proxyConfigured: boolean
  section: string
  /** The visitor's earlier questions in this conversation, oldest first. */
  earlierQuestions?: readonly string[]
}): ImmediateReply {
  const curatedTopic = promptId ? REPLY_FOR_PROMPT[promptId] : findCuratedTopic(content)
  // A prepared answer follows the question's language (a suggested question is in the site language).
  const replyLang = promptId ? lang : questionLanguage(content, lang)
  const curatedReply = curatedTopic ? translateValue(replyLang, LOCAL_REPLIES[curatedTopic]) : null
  if (!curatedReply && proxyConfigured) return { kind: 'ask-model' }

  const local = curatedReply ?? getLocalReply(content, replyLang)
  if (!local) return { kind: 'unavailable' }
  return {
    kind: 'answer',
    message: {
      role: 'assistant',
      content: local,
      followUps: pickFollowUpIds(local, content, section, earlierQuestions),
      ...(!curatedReply && { fallback: true }),
    },
  }
}

type ProviderCall = (options: {
  messages: readonly ChatTurn[]
  systemPrompt: string
  proxyUrl: string
  lane: ChatLane
  signal?: AbortSignal
  onDelta?: StreamDelta
}) => Promise<ChatReply>

export type ModelProviders = { bigModel: ProviderCall; groq: ProviderCall }

const DEFAULT_PROVIDERS: ModelProviders = { bigModel: fetchBigModel, groq: fetchGroq }

/**
 * Asks BigModel, then Groq, then falls back to a prepared reply (marked `fallback`).
 *
 * - `isStopped` is read live: after the visitor presses stop, a provider error is
 *   rethrown and no further lane or fallback is tried (the result is then null).
 * - A rate limit from the proxy itself skips Groq, which shares that limit.
 * - `onBeforeGroq` runs right before the Groq attempt (the panel resets its
 *   streaming state there).
 * - When nothing answers, the last provider error is thrown unchanged, so its
 *   `status` still tells a rate limit apart from other failures.
 */
export async function requestModelReply({
  content,
  lang,
  transcript,
  systemPrompt,
  proxyUrl,
  lane,
  signal,
  onDelta,
  isStopped,
  onBeforeGroq,
  providers = DEFAULT_PROVIDERS,
}: {
  content: string
  lang: Language
  transcript: readonly ChatTurn[]
  systemPrompt: string
  proxyUrl: string
  lane: ChatLane
  signal?: AbortSignal
  onDelta?: StreamDelta
  isStopped: () => boolean
  onBeforeGroq?: () => void
  providers?: ModelProviders
}): Promise<ModelReply | null> {
  let rawReply: ModelReply | null = null
  let lastProviderError: unknown = null

  try {
    rawReply = await providers.bigModel({
      messages: transcript,
      systemPrompt,
      proxyUrl,
      lane,
      signal,
      onDelta,
    })
  } catch (providerError) {
    if (isStopped()) {
      throw providerError
    }
    lastProviderError = providerError
    console.error('Chat provider BigModel failed:', providerError)
  }

  const proxyRateLimited = Boolean(
    (lastProviderError as ChatCompletionError | undefined)?.isProxyRateLimit
  )

  if (rawReply === null && !proxyRateLimited && !isStopped()) {
    try {
      onBeforeGroq?.()
      rawReply = await providers.groq({
        messages: transcript,
        systemPrompt,
        proxyUrl,
        lane,
        signal,
        onDelta,
      })
    } catch (providerError) {
      if (isStopped()) {
        throw providerError
      }
      lastProviderError = providerError
      console.error('Chat provider Groq failed:', providerError)
    }
  }

  if (rawReply === null && !isStopped()) {
    const local = getLocalReply(content, questionLanguage(content, lang))
    if (local) {
      rawReply = { content: local, fallback: true }
    } else {
      throw lastProviderError ?? new Error('No chat provider succeeded.')
    }
  }

  return rawReply
}

/**
 * The assistant message shown once a model reply is complete. A streamed reply is
 * kept as shown; any other reply is shortened. A stopped or cut-off reply is marked
 * incomplete and gets no follow-up suggestions. A prepared fallback reply keeps its mark.
 */
export function buildFinalMessage({
  reply,
  streamed,
  stopped,
  question,
  section,
  earlierQuestions = [],
}: {
  reply: ModelReply
  streamed: boolean
  stopped: boolean
  question: string
  section: string
  /** The visitor's earlier questions in this conversation, oldest first. */
  earlierQuestions?: readonly string[]
}): ChatMessage {
  const content = streamed ? reply.content : shortenReply(reply.content)
  const incomplete = stopped || reply.incomplete
  return {
    role: 'assistant',
    content,
    incomplete,
    followUps: incomplete ? undefined : pickFollowUpIds(content, question, section, earlierQuestions),
    ...(reply.fallback && { fallback: true }),
  }
}

/** Which error text to show when every lane failed. */
export function chatErrorKind(error: unknown): 'rate-limited' | 'generic' {
  return (error as ChatCompletionError | undefined)?.status === 429 ? 'rate-limited' : 'generic'
}
