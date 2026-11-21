'use client'

import { useCallback, useEffect, useLayoutEffect, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'

export type PortfolioView = 'concise' | 'full'

let currentView: PortfolioView = 'concise'
const listeners = new Set<() => void>()

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

function emit() {
  for (const listener of listeners) listener()
}

function readViewFromUrl(): PortfolioView {
  if (typeof window === 'undefined') return 'concise'
  const params = new URLSearchParams(window.location.search)
  return params.get('view') === 'full' ? 'full' : 'concise'
}

function syncFromUrl() {
  const next = readViewFromUrl()
  if (currentView !== next) {
    currentView = next
    emit()
  }
}

export function setPortfolioView(next: PortfolioView, updateUrl = true) {
  if (currentView !== next) {
    currentView = next
    emit()
  }
  if (updateUrl && typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    const prevSearch = url.search
    if (next === 'full') {
      url.searchParams.set('view', 'full')
    } else {
      url.searchParams.delete('view')
    }
    if (url.search !== prevSearch) {
      window.history.pushState(null, '', `${url.pathname}${url.search}`)
    }
  }
}

function subscribe(listener: () => void) {
  if (listeners.size === 0 && typeof window !== 'undefined') {
    window.addEventListener('popstate', syncFromUrl)
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('popstate', syncFromUrl)
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
    syncFromUrl()
  }, [pathname])

  const setView = useCallback((next: PortfolioView) => {
    setPortfolioView(next, true)
  }, [])

  const toggleView = useCallback(() => {
    setPortfolioView(currentView === 'full' ? 'concise' : 'full', true)
  }, [])

  return { view, setView, toggleView }
}
