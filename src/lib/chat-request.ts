export type ChatApiRole = 'system' | 'user' | 'assistant'

export interface ChatApiMessage {
  role: ChatApiRole
  content: string
}

export const MAX_TRANSCRIPT_MESSAGES = 16

export function buildChatMessages<T extends { role: 'user' | 'assistant'; content: string }>(
  systemPrompt: string,
  history: readonly T[]
): ChatApiMessage[] {
  return [
    { role: 'system', content: systemPrompt },
    ...history.slice(-MAX_TRANSCRIPT_MESSAGES).map(({ role, content }) => ({ role, content })),
  ]
}

export type TimeoutReason = 'first-byte' | 'idle' | 'total'

export interface CreateRequestTimersOptions {
  firstByteMs?: number
  idleMs?: number
  totalMs?: number
  onTimeout: (reason: TimeoutReason) => void
}

export interface RequestTimers {
  onFirstByte: () => void
  onChunk: () => void
  clear: () => void
}

export function createRequestTimers({
  firstByteMs = 20_000,
  idleMs = 15_000,
  totalMs = 60_000,
  onTimeout,
}: CreateRequestTimersOptions): RequestTimers {
  let firstByteTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
    onTimeout('first-byte')
  }, firstByteMs)

  let idleTimer: ReturnType<typeof setTimeout> | null = null

  let totalTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
    onTimeout('total')
  }, totalMs)

  function resetIdle() {
    if (idleTimer) {
      clearTimeout(idleTimer)
    }
    idleTimer = setTimeout(() => {
      onTimeout('idle')
    }, idleMs)
  }

  return {
    onFirstByte() {
      if (firstByteTimer) {
        clearTimeout(firstByteTimer)
        firstByteTimer = null
      }
      resetIdle()
    },
    onChunk() {
      resetIdle()
    },
    clear() {
      if (firstByteTimer) {
        clearTimeout(firstByteTimer)
        firstByteTimer = null
      }
      if (idleTimer) {
        clearTimeout(idleTimer)
        idleTimer = null
      }
      if (totalTimer) {
        clearTimeout(totalTimer)
        totalTimer = null
      }
    },
  }
}
