'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'

export type PortfolioView = 'concise' | 'full'

let currentView: PortfolioView = 'concise'
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function setPortfolioView(next: PortfolioView, updateUrl = true) {
  if (currentView !== next) {
    currentView = next
    emit()
  }
  if (updateUrl && typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    if (next === 'full') {
      url.searchParams.set('view', 'full')
    } else {
      url.searchParams.delete('view')
    }
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): PortfolioView {
  return currentView
}

function getServerSnapshot(): PortfolioView {
  return 'concise'
}

export function usePortfolioView() {
  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const next: PortfolioView = params.get('view') === 'full' ? 'full' : 'concise'
      if (currentView !== next) {
        currentView = next
        emit()
      }
    }
    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  const setView = useCallback((next: PortfolioView) => {
    setPortfolioView(next, true)
  }, [])

  const toggleView = useCallback(() => {
    setPortfolioView(currentView === 'full' ? 'concise' : 'full', true)
  }, [])

  return { view, setView, toggleView }
}
