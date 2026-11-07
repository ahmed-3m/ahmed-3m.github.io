'use client'

import type { CSSProperties } from 'react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { CHAT_COPY } from './chatbot-dictionaries'

// The heavy chat internals (dictionaries ×5 locales, SYSTEM_PROMPT, streaming
// client, provider fallbacks, full panel UI) live in ChatBotPanel and are loaded
// lazily, so they never ship in the initial page bundle. This shell stays tiny:
// it keeps the launcher and the `#ahmed-chatbot-panel` wrapper in the
// server-rendered HTML (the daily canary greps for both).
//
// Only types are re-exported here. Value re-exports (`export { PROMPT_LIBRARY }
// from './ChatBotPanel'`) are deliberately absent: they re-introduce a static
// import edge in every route that renders the layout, which pulls a full copy of
// the panel (~40 KB) back into the eager bundle and defeats the split. Import
// those symbols from '@/components/ChatBotPanel' instead.
export type { ChatMessage, ChatRole, PromptId } from './ChatBotPanel'

const ChatBotPanel = dynamic(() => import('./ChatBotPanel'), {
  ssr: false,
  loading: () => <PanelSkeleton />,
})

/** Fallback delay when `requestIdleCallback` is unavailable. */
const IDLE_PRELOAD_MS = 1500
/** Upper bound for the idle callback, so slow pages still preload the panel. */
const IDLE_PRELOAD_TIMEOUT_MS = 3000

const panelStyle = {
  background:
    'linear-gradient(180deg, color-mix(in srgb, var(--cd-surf) 92%, var(--cd-bg) 8%) 0%, var(--cd-elev) 100%)',
  borderColor: 'var(--cd-b0)',
  boxShadow: '0 28px 80px rgba(0, 0, 0, 0.24)',
  fontFamily: 'var(--font-body)',
} satisfies CSSProperties

function GenieOrb({ size = 44 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="genie-orb relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 30% 28%, rgba(176, 245, 255, 0.98) 0%, rgba(95, 159, 255, 0.9) 20%, rgba(24, 38, 79, 0.98) 58%, rgba(10, 13, 24, 1) 100%)',
        boxShadow:
          '0 0 0 1px rgba(159, 228, 255, 0.18), inset 0 0 18px rgba(255, 255, 255, 0.18), 0 10px 24px rgba(26, 57, 163, 0.38)',
      }}
    >
      <span
        className="absolute inset-[8%] rounded-full"
        style={{
          background: 'radial-gradient(circle at 24% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 40%)',
          mixBlendMode: 'screen',
        }}
      />
      <span className="genie-orbit genie-orbit-a" />
      <span className="genie-orbit genie-orbit-b" />
      <span className="genie-orbit genie-orbit-c" />
      <span className="genie-core" />
    </span>
  )
}

/**
 * Shown inside the panel wrapper until the lazy chunk is ready. Mirrors the
 * panel's header and typing indicator so the open transition never jumps.
 */
function PanelSkeleton({ onClose }: { onClose?: () => void }) {
  const { t } = useI18n()

  return (
    <div className="flex h-full flex-col" aria-busy="true">
      <header
        className="flex items-center justify-between border-b px-4 py-4"
        style={{ borderColor: 'var(--cd-b0)' }}
      >
        <h2 className="text-sm font-semibold tracking-[0.02em]" style={{ color: 'var(--cd-fg1)' }}>
          {t(CHAT_COPY.title)}
        </h2>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
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
        ) : null}
      </header>

      <div className="flex flex-1 items-center justify-center" aria-hidden="true">
        <div
          className="inline-flex items-center gap-1 rounded-2xl border px-3 py-2"
          style={{
            background: 'color-mix(in srgb, var(--cd-elev) 78%, var(--cd-bg) 22%)',
            borderColor: 'var(--cd-b0)',
          }}
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
      </div>
    </div>
  )
}

export default function ChatBot() {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [isPanelRequested, setIsPanelRequested] = useState(false)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const wasOpenRef = useRef(false)

  // Preload the panel once the page is idle (or after a short delay where
  // requestIdleCallback is missing), so first open feels instant.
  useEffect(() => {
    if (isPanelRequested) return
    let cancelled = false
    const request = () => {
      if (!cancelled) setIsPanelRequested(true)
    }

    const supportsIdle = typeof window.requestIdleCallback === 'function'
    const idleHandle = supportsIdle
      ? window.requestIdleCallback(request, { timeout: IDLE_PRELOAD_TIMEOUT_MS })
      : undefined
    const timer = supportsIdle ? undefined : window.setTimeout(request, IDLE_PRELOAD_MS)

    return () => {
      cancelled = true
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle)
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [isPanelRequested])

  // Escape closes the dialog even while the lazy chunk is still loading, so the
  // panel only has to own the focus trap.
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Return focus to the launcher when the dialog closes — but not on first mount.
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true
      return
    }
    if (!wasOpenRef.current) return
    wasOpenRef.current = false
    launcherRef.current?.focus()
  }, [isOpen])

  const closePanel = useCallback(() => setIsOpen(false), [])

  const shouldRenderPanel = isOpen || isPanelRequested

  return (
    <>
      <div
        id="chatbot-dialog"
        className={`fixed bottom-20 right-4 z-[9998] w-[min(400px,calc(100vw-2rem))] transition-all duration-300 ease-out sm:bottom-24 sm:right-6 ${
          isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
        }`}
        aria-hidden={!isOpen}
        tabIndex={-1}
        inert={!isOpen}
      >
        <div
          id="ahmed-chatbot-panel"
          className="flex h-[min(560px,calc(100vh-7rem))] flex-col overflow-hidden rounded-[28px] border"
          style={panelStyle}
          role="dialog"
          aria-modal="true"
          aria-label={t(CHAT_COPY.dialogLabel)}
        >
          {shouldRenderPanel ? (
            <ChatBotPanel isOpen={isOpen} onClose={closePanel} />
          ) : (
            <PanelSkeleton onClose={closePanel} />
          )}
        </div>
      </div>

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="group fixed bottom-6 right-6 z-[9999] inline-flex h-14 items-center gap-2 overflow-hidden rounded-full border pl-1.5 pr-4 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:pr-5 focus-visible:pr-5"
        style={{
          background: 'linear-gradient(135deg, rgba(22, 26, 36, 0.96) 0%, rgba(49, 44, 40, 0.98) 100%)',
          borderColor: 'rgba(205, 189, 145, 0.28)',
          color: '#f3eee4',
          boxShadow: '0 18px 40px rgba(7, 11, 20, 0.38)',
        }}
        aria-expanded={isOpen}
        aria-controls="chatbot-dialog"
        aria-label={isOpen ? t(CHAT_COPY.close) : t(CHAT_COPY.open)}
      >
        <GenieOrb />
        <span
          className={`cd-chatbot-launcher-text whitespace-nowrap text-sm font-semibold tracking-[0.01em] transition-all duration-300 ${
            isOpen ? 'max-w-0 opacity-0' : 'max-w-0 opacity-0 group-hover:max-w-32 group-hover:opacity-100 group-focus-visible:max-w-32 group-focus-visible:opacity-100'
          }`}
        >
          {t(CHAT_COPY.open)}
        </span>
        {isOpen && (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-[#f3eee4]">
            <X size={20} />
          </span>
        )}
      </button>
    </>
  )
}
