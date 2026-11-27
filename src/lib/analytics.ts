// Privacy-friendly visit counting with GoatCounter (https://www.goatcounter.com).
//
// Configured at build time by NEXT_PUBLIC_GOATCOUNTER_CODE, the site code from
// <code>.goatcounter.com. Without a valid code the site loads no analytics script and
// the privacy notice says so (src/components/LegalContent.tsx reads the same flag).

const SITE_CODE_PATTERN = /^[a-z0-9][a-z0-9-]{0,48}[a-z0-9]$/

/** The GoatCounter count endpoint for a site code, or null when the code is missing or malformed. */
export function goatCounterEndpoint(code: string | undefined): string | null {
  const trimmed = code?.trim().toLowerCase()
  return trimmed && SITE_CODE_PATTERN.test(trimmed) ? `https://${trimmed}.goatcounter.com/count` : null
}

// Referenced literally so Next.js inlines the value into the client bundle.
export const GOATCOUNTER_ENDPOINT = goatCounterEndpoint(process.env.NEXT_PUBLIC_GOATCOUNTER_CODE)

export const ANALYTICS_ENABLED = GOATCOUNTER_ENDPOINT !== null

export const GOATCOUNTER_SCRIPT_SRC = 'https://gc.zgo.at/count.js'

type GoatCounterCount = (vars: { path: string; title?: string; event?: boolean }) => void

/**
 * Counts a named event, such as `genie-open`. Does nothing when GoatCounter is not
 * configured or its script has not loaded yet, and never throws.
 *
 * Event names are fixed strings (and prompt ids): never pass text a visitor typed.
 * GoatCounter counts an event once per visitor session (8 hours), like a page visit.
 */
export function trackEvent(name: string): void {
  if (!ANALYTICS_ENABLED || typeof window === 'undefined') return
  try {
    const count = (window as Window & { goatcounter?: { count?: GoatCounterCount } }).goatcounter?.count
    if (typeof count === 'function') count({ path: name, event: true })
  } catch {
    // Analytics must never break the page.
  }
}

const OUTBOUND_HOSTS: [RegExp, string][] = [
  [/(^|\.)calendly\.com$/, 'click-calendly'],
  [/(^|\.)github\.com$/, 'click-github'],
  [/(^|\.)linkedin\.com$/, 'click-linkedin'],
  [/(^|\.)huggingface\.co$/, 'click-huggingface'],
]

/**
 * The event name for a link worth counting (the CV, the thesis PDF, or a profile and
 * booking link), or null. Takes a resolved href, as `anchor.href` gives it.
 */
export function outboundEventName(href: string): string | null {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const path = url.pathname.toLowerCase()
  if (path.endsWith('/cv.pdf')) return 'click-cv'
  if (path.endsWith('.pdf') && path.includes('thesis')) return 'click-thesis'
  const host = url.hostname.toLowerCase()
  return OUTBOUND_HOSTS.find(([pattern]) => pattern.test(host))?.[1] ?? null
}
