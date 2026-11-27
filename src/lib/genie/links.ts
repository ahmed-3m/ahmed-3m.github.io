import type { Language } from '@/lib/i18n-config'
import { CALENDLY_URL } from '@/lib/booking'
import { diffusionExplorerHref } from '@/lib/portfolio-copy'
import { isHomePathname, type PortfolioView } from '@/lib/portfolio-view-logic'

export const PORTFOLIO = 'https://ahmed-3m.github.io'
export const CV_URL = `${PORTFOLIO}/cv.pdf`
export const CONTACT_URL = `${PORTFOLIO}/#contact`
export const BACKGROUND_URL = `${PORTFOLIO}/about/`
export const RESEARCH_URL = `${PORTFOLIO}/research/`
export const METHOD_URL = `${RESEARCH_URL}#separation-loss`
export const BLOG_URL = `${PORTFOLIO}/blog/`
export const GUARDRAILS_POST_URL = `${PORTFOLIO}/blog/deterministic-guardrails-for-llm-and-agent-systems/`
export const THESIS_POST_URL = `${PORTFOLIO}/blog/ood-diffusion-thesis/`
export const INDUSTRIAL_POST_URL = `${PORTFOLIO}/blog/diffusion-models-anomaly-detection/`
export const YOLO_POST_URL = `${PORTFOLIO}/blog/computer-vision-yolo-mastery/`
export const NEWS_URL = `${PORTFOLIO}/news/`
export const INDUSTRIAL_URL = `${PORTFOLIO}/case-studies/inkjet-ood/`
export const DIFFUSION_URL = `${PORTFOLIO}/case-studies/diffusion-ood/`
export const SIHEM_URL = `${PORTFOLIO}/case-studies/sihem/`
export const MERGEPROOF_PLAYGROUND_URL = `${PORTFOLIO}/?view=full#mergeproof-playground`
export const THESIS_URL = `${PORTFOLIO}/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf`
export const EXPLORER_URL = `${PORTFOLIO}${diffusionExplorerHref}`
export const GITHUB_URL = 'https://github.com/ahmed-3m'
export const MERGEPROOF_URL = `${GITHUB_URL}/mergeproof`
export const LINKEDIN_URL = 'https://www.linkedin.com/in/ahmed-3m/'
export const HF_URL = 'https://huggingface.co/ahmed-3m'
export const WANDB_URL = 'https://wandb.ai/ahmed-mu-0593'
export const JKU_THESIS_RECORD_URL = 'https://epub.jku.at/obvulihs/content/titleinfo/14374221'
export const ORCID_URL = 'https://orcid.org/0009-0004-8934-1270'
export const SIHEM_TELEGRAM_URL = 'https://t.me/sihem_ai_bot'
export const SIHEM_APP_URL = 'https://sihem-pwa.pages.dev/'
export const EMAIL_URL = 'mailto:ahmed.mo.0595@gmail.com'
export { CALENDLY_URL }

/**
 * Allowlist key that ignores a trailing slash on the path, so `/about` and
 * `/about/`, or `calendly.com/x` and `calendly.com/x/`, resolve to the same link.
 */
export function linkKey(url: URL): string {
  if (url.protocol === 'mailto:') return url.href.toLowerCase()
  const path = url.pathname.replace(/\/+$/, '')
  return `${url.origin}${path}${url.search}${url.hash}`
}

/** Allowlist key → canonical URL that the rendered link points to. */
export const publicLinks = new Map<string, URL>(
  [
    `${PORTFOLIO}/`,
    CV_URL,
    CONTACT_URL,
    BACKGROUND_URL,
    RESEARCH_URL,
    METHOD_URL,
    BLOG_URL,
    GUARDRAILS_POST_URL,
    THESIS_POST_URL,
    INDUSTRIAL_POST_URL,
    YOLO_POST_URL,
    NEWS_URL,
    INDUSTRIAL_URL,
    DIFFUSION_URL,
    SIHEM_URL,
    MERGEPROOF_PLAYGROUND_URL,
    THESIS_URL,
    EXPLORER_URL,
    GITHUB_URL,
    MERGEPROOF_URL,
    LINKEDIN_URL,
    HF_URL,
    WANDB_URL,
    JKU_THESIS_RECORD_URL,
    ORCID_URL,
    SIHEM_TELEGRAM_URL,
    SIHEM_APP_URL,
    EMAIL_URL,
    CALENDLY_URL,
  ].map((href) => {
    const url = new URL(href)
    return [linkKey(url), url] as const
  }),
)

/**
 * Normalizes same-site portfolio links to relative paths and marks only external
 * URLs and PDF downloads to open in a new tab.
 */
export function resolveLinkProps(rawHref: string): { href: string; external: boolean } | null {
  try {
    const parsed = publicLinks.get(linkKey(new URL(rawHref, PORTFOLIO)))
    if (!parsed) return null
    if (parsed.protocol === 'mailto:') return { href: parsed.href, external: false }
    if (parsed.origin === PORTFOLIO) {
      const isPdf = parsed.pathname.toLowerCase().endsWith('.pdf')
      return {
        href: `${parsed.pathname}${parsed.search}${parsed.hash}`,
        external: isPdf,
      }
    }
    return { href: parsed.href, external: true }
  } catch {
    return null
  }
}

/** What the chat does when a visitor clicks a same-site link in an answer. */
export type ChatLinkAction =
  /** Leave the click to the browser (mailto:, absolute URLs, anything unexpected). */
  | { kind: 'default' }
  /** Same page: close the chat and scroll to `hash` (empty: just close). */
  | { kind: 'scroll'; hash: string }
  /** Same home page in the other portfolio view: switch view, then scroll to `hash`. */
  | { kind: 'view'; view: PortfolioView; hash: string }
  /** Another page: navigate with the client router, so the conversation survives. */
  | { kind: 'route'; href: string }

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/'
}

/**
 * Decides how a same-site chat link is followed. `current` is the page the visitor
 * is on (`location.pathname` and `location.search`).
 */
export function chatLinkAction(href: string, current: { pathname: string; search: string }): ChatLinkAction {
  if (!href.startsWith('/') || href.startsWith('//')) return { kind: 'default' }
  let target: URL
  try {
    target = new URL(href, PORTFOLIO)
  } catch {
    return { kind: 'default' }
  }
  if (target.origin !== PORTFOLIO) return { kind: 'default' }

  const hash = decodeURIComponent(target.hash.slice(1))
  if (normalizePath(target.pathname) !== normalizePath(current.pathname)) {
    return { kind: 'route', href }
  }

  const currentParams = new URLSearchParams(current.search)
  if (target.searchParams.toString() === currentParams.toString()) return { kind: 'scroll', hash }

  // The home page keeps its concise/full view in `?view=`, which the page only
  // re-reads on a pathname change, so a view switch is applied directly.
  const view = target.searchParams.get('view') ?? 'concise'
  const withoutView = (params: URLSearchParams) => {
    const copy = new URLSearchParams(params)
    copy.delete('view')
    return copy.toString()
  }
  if (
    isHomePathname(target.pathname) &&
    (view === 'full' || view === 'concise') &&
    withoutView(target.searchParams) === withoutView(currentParams)
  ) {
    return { kind: 'view', view, hash }
  }
  return { kind: 'route', href }
}

/**
 * Formats numeric strings for German and French decimal comma and percentage spacing
 * (`99.03% ± 0.07%` -> `99,03 % ± 0,07 %`) while preserving other locales.
 */
export function formatLocaleNumber(raw: string, lang: Language): string {
  if (lang !== 'de' && lang !== 'fr') return raw
  return raw.replace(/(\d)\.(\d)/g, '$1,$2').replace(/[ \u00A0]*%/g, ' %')
}
