'use client'

import { useCallback, useEffect, useLayoutEffect, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import {
  PORTFOLIO_VIEW_STORAGE_KEY,
  buildHomeHref,
  isHomePathname,
  resolvePortfolioView,
  type PortfolioView,
} from './portfolio-view-logic'

export {
  PORTFOLIO_VIEW_STORAGE_KEY,
  buildHomeHref,
  isHomePathname,
  resolvePortfolioView,
  type PortfolioView,
}

let currentView: PortfolioView = 'concise'
const listeners = new Set<() => void>()

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function emit() {
  for (const listener of listeners) listener()
}

function buildCustomHistoryState(
  source: Record<string, unknown> | null | undefined,
  portfolioView: PortfolioView,
): Record<string, unknown> {
  const isPatchedByNext =
    typeof window !== 'undefined' &&
    typeof History !== 'undefined' &&
    window.history.replaceState !== History.prototype.replaceState

  // During initial `useLayoutEffect` (before Next.js `AppRouter`'s `useEffect`
  // patches `history.replaceState`), preserve `__NA` and `__PRIVATE_NEXTJS_INTERNALS_TREE`
  // verbatim so client-side Back navigation never falls back to a full reload.
  if (!isPatchedByNext) {
    return { ...(source ?? {}), portfolioView }
  }

  // Once Next.js's `pushState`/`replaceState` wrapper is active, omit `__NA` / `_N`
  // so the wrapper copies its latest internal tree AND updates `canonicalUrl`.
  const next: Record<string, unknown> = {}
  if (source) {
    for (const [key, value] of Object.entries(source)) {
      if (key === '__NA' || key === '_N' || key === '__N' || key === '__PRIVATE_NEXTJS_INTERNALS_TREE') continue
      next[key] = value
    }
  }
  next.portfolioView = portfolioView
  return next
}

function readStoredView(storage?: Pick<Storage, 'getItem'> | null): PortfolioView | null {
  try {
    const target = storage ?? (typeof window !== 'undefined' ? window.sessionStorage : null)
    const raw = target?.getItem(PORTFOLIO_VIEW_STORAGE_KEY)
    return raw === 'full' || raw === 'concise' ? raw : null
  } catch {
    return null
  }
}

function writeStoredView(next: PortfolioView, storage?: Pick<Storage, 'setItem' | 'removeItem'> | null) {
  try {
    const target = storage ?? (typeof window !== 'undefined' ? window.sessionStorage : null)
    if (!target) return
    if (next === 'full') {
      target.setItem(PORTFOLIO_VIEW_STORAGE_KEY, 'full')
    } else {
      target.removeItem(PORTFOLIO_VIEW_STORAGE_KEY)
    }
  } catch {
    // Ignore restricted sessionStorage environments.
  }
}

function syncFromLocation() {
  if (typeof window === 'undefined') return
  const pathname = window.location.pathname
  const search = window.location.search
  const params = new URLSearchParams(search)
  const explicit = params.get('view')
  const storedView = readStoredView()
  const historyState =
    window.history.state && typeof window.history.state === 'object'
      ? (window.history.state as Record<string, unknown>)
      : null

  const next = resolvePortfolioView({
    pathname,
    search,
    historyView: historyState?.portfolioView,
    storedView,
    fallbackView: currentView,
  })

  const onHome = isHomePathname(pathname)
  if (onHome || explicit === 'full' || explicit === 'concise') {
    writeStoredView(next)
  }

  if (onHome) {
    const url = new URL(window.location.href)
    if (explicit === null && next === 'full') {
      url.searchParams.set('view', 'full')
    } else if (explicit === 'concise') {
      url.searchParams.delete('view')
    }
    const nextHref = `${url.pathname}${url.search}${url.hash}`
    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (nextHref !== currentHref || historyState?.portfolioView !== next) {
      const nextState = buildCustomHistoryState(historyState, next)
      window.history.replaceState(nextState, '', nextHref)
    }
  }

  if (currentView !== next) {
    currentView = next
    emit()
  }
}

/** `hash` (without `#`), when given, replaces the URL fragment in the same history step. */
export function setPortfolioView(next: PortfolioView, updateUrl = true, hash?: string) {
  const previousView = currentView
  writeStoredView(next)
  if (currentView !== next) {
    currentView = next
    emit()
  }
  if (updateUrl && typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    const prevSearch = url.search
    const prevHash = url.hash
    if (hash !== undefined) url.hash = hash
    if (next === 'full') {
      url.searchParams.set('view', 'full')
    } else {
      url.searchParams.delete('view')
    }
    const baseState =
      window.history.state && typeof window.history.state === 'object'
        ? (window.history.state as Record<string, unknown>)
        : null
    const nextState = buildCustomHistoryState(baseState, next)
    if (url.search !== prevSearch) {
      if (isHomePathname(url.pathname) && baseState?.portfolioView !== previousView) {
        window.history.replaceState(
          buildCustomHistoryState(baseState, previousView),
          '',
          `${url.pathname}${prevSearch}${prevHash}`,
        )
      }
      window.history.pushState(nextState, '', `${url.pathname}${url.search}${url.hash}`)
    } else {
      window.history.replaceState(nextState, '', `${url.pathname}${url.search}${url.hash}`)
    }
  }
}

function subscribe(listener: () => void) {
  if (listeners.size === 0 && typeof window !== 'undefined') {
    window.addEventListener('popstate', syncFromLocation)
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('popstate', syncFromLocation)
    }
  }
}

function getSnapshot(): PortfolioView {
  return currentView
}

function getServerSnapshot(): PortfolioView {
  return 'concise'
}

export function usePortfolioView() {
  const pathname = usePathname()
  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useIsomorphicLayoutEffect(() => {
    syncFromLocation()
  }, [pathname])

  const setView = useCallback((next: PortfolioView) => {
    setPortfolioView(next, true)
  }, [])

  const toggleView = useCallback(() => {
    setPortfolioView(currentView === 'full' ? 'concise' : 'full', true)
  }, [])

  return { view, setView, toggleView }
}

/**
 * Returns the homepage href (`/` vs `/?view=full`, with optional `#section`) matching
 * the visitor's active portfolio mode. Renders `/` during static SSR export so
 * crawlable HTML stays canonical.
 */
export function useHomeHref(hash = ''): string {
  const { view } = usePortfolioView()
  return buildHomeHref(view, hash)
}
