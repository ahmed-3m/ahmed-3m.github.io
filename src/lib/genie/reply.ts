// How Genie decides what to answer, without any React state: answer at once from a
// prepared reply, or ask the model lanes (BigModel, then Groq) and fall back to a
// prepared reply when both fail. ChatBotPanel owns the UI state around these calls.

import { CHAT_COPY } from '@/components/chatbot-dictionaries'
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
  type ChatContext,
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
  context: ChatContext
  proxyUrl: string
  lane: ChatLane
  signal?: AbortSignal
  onDelta?: StreamDelta
}) => Promise<ChatReply>

export type ModelProviders = { bigModel: ProviderCall; groq: ProviderCall }

const DEFAULT_PROVIDERS: ModelProviders = { bigModel: fetchBigModel, groq: fetchGroq }

/** The visitor's own per-client limit: no provider is tried and no prepared reply stands in. */
function isClientRateLimit(error: unknown): boolean {
  const chatError = error as ChatCompletionError | undefined
  return Boolean(chatError?.isProxyRateLimit || chatError?.code === 'rate_limited')
}

/** The Worker itself refuses (stop switch, budget store down): the other provider would too. */
function isWorkerUnavailable(error: unknown): boolean {
  const chatError = error as ChatCompletionError | undefined
  return chatError?.code === 'unavailable' && chatError.scope === 'worker'
}

/**
 * Asks BigModel (Z.ai), then Groq, then falls back to a prepared reply (marked `fallback`).
 *
 * - `isStopped` is read live: after the visitor presses stop, a provider error is
 *   rethrown and no further lane or fallback is tried (the result is then null).
 * - The visitor's own rate limit (`rate_limited`) is thrown at once: Groq shares that
 *   limit, and the panel shows the wait time instead of a prepared reply.
 * - A refusal by the Worker itself (`unavailable` with scope `worker`) skips Groq and
 *   goes straight to a prepared reply. A provider's spent budget, missing key or
 *   failed call tries the other provider first.
 * - `onBeforeGroq` runs right before the Groq attempt (the panel resets its
 *   streaming state there).
 * - When nothing answers and no prepared reply fits, the last provider error is thrown
 *   unchanged, so its `code` still picks the message (see `chatErrorKind`).
 */
export async function requestModelReply({
  content,
  lang,
  transcript,
  context,
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
  context: ChatContext
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
      context,
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

  if (rawReply === null && isClientRateLimit(lastProviderError)) {
    throw lastProviderError
  }

  if (rawReply === null && !isWorkerUnavailable(lastProviderError) && !isStopped()) {
    try {
      onBeforeGroq?.()
      rawReply = await providers.groq({
        messages: transcript,
        context,
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

  if (rawReply === null && isClientRateLimit(lastProviderError)) {
    throw lastProviderError
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

export type ChatErrorKind = 'rate-limited' | 'models-unavailable' | 'generic'

/** Codes that mean no model can answer right now (contracts/worker-api.md, "Errors"). */
const MODELS_UNAVAILABLE_CODES = new Set(['unavailable', 'budget_exhausted', 'upstream_error', 'upstream_timeout'])

/** Which error text to show when every lane failed. */
export function chatErrorKind(error: unknown): ChatErrorKind {
  const chatError = error as ChatCompletionError | undefined
  if (isClientRateLimit(chatError) || chatError?.status === 429) return 'rate-limited'
  if (chatError?.code && MODELS_UNAVAILABLE_CODES.has(chatError.code)) return 'models-unavailable'
  return 'generic'
}

/**
 * The message shown when no answer came: the wait time for the visitor's own limit,
 * the prepared-topics hint when no model can answer, otherwise the generic error.
 */
export function chatErrorMessage(error: unknown, lang: Language): string {
  const kind = chatErrorKind(error)
  if (kind === 'rate-limited') {
    const seconds = (error as ChatCompletionError | undefined)?.retryAfter
    if (seconds && seconds > 0) {
      return translateValue(lang, CHAT_COPY.rateLimitedRetry).replace('{seconds}', String(seconds))
    }
    return translateValue(lang, CHAT_COPY.rateLimited)
  }
  return translateValue(lang, kind === 'models-unavailable' ? CHAT_COPY.limitedAnswers : CHAT_COPY.genericError)
}
