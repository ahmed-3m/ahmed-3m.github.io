export type PortfolioView = 'concise' | 'full'

export const PORTFOLIO_VIEW_STORAGE_KEY = 'portfolio-view'

export function isHomePathname(pathname?: string | null): boolean {
  if (pathname == null) return false
  const normalized = pathname.replace(/\/+$/, '')
  return normalized === ''
}

/**
 * Pure resolver used by `syncFromLocation` and unit tests:
 * 1. Explicit `?view=full` or `?view=concise` always wins.
 * 2. On subpages (`/news/`, `/blog/`, `/about/`, etc.), preserve the active/stored
 *    session view instead of resetting `currentView` to `'concise'` when `?view` is absent.
 * 3. On `/` without `?view=...`, honor an explicit history-entry `portfolioView` if
 *    present, otherwise fall back to `sessionStorage['portfolio-view']`, else `'concise'`.
 */
export function resolvePortfolioView({
  pathname,
  search,
  historyView,
  storedView,
  fallbackView = 'concise',
}: {
  pathname: string
  search: string
  historyView?: unknown
  storedView?: PortfolioView | null
  fallbackView?: PortfolioView
}): PortfolioView {
  const params = new URLSearchParams(search)
  const explicit = params.get('view')
  if (explicit === 'full') return 'full'
  if (explicit === 'concise') return 'concise'

  if (!isHomePathname(pathname)) {
    return storedView ?? fallbackView
  }

  if (historyView === 'full' || historyView === 'concise') {
    return historyView
  }

  return storedView ?? 'concise'
}

export function buildHomeHref(view: PortfolioView, hash = ''): string {
  const normalizedHash = hash ? (hash.startsWith('#') ? hash : `#${hash}`) : ''
  return view === 'full' ? `/?view=full${normalizedHash}` : `/${normalizedHash}`
}
