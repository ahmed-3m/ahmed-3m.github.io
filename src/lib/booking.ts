// Public booking link, shared by the Schedule meeting buttons and Genie's replies.
// NEXT_PUBLIC_CALENDLY_URL is an optional build-time override (.github/workflows/deploy.yml).
const DEFAULT_CALENDLY_URL = 'https://calendly.com/ahmed-3m'

/**
 * Accepts only an absolute https URL with a host, so a malformed override can't break
 * link rendering. Returns the parsed, serialized form (so spellings such as
 * `https:calendly.com/x` become `https://calendly.com/x`) with parentheses
 * percent-encoded, because Genie embeds this URL in Markdown `[text](url)` links,
 * whose target ends at the first `)`.
 */
function resolveCalendlyUrl(raw: string | undefined): string {
  const value = raw?.trim()
  if (!value) return DEFAULT_CALENDLY_URL
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !url.hostname) return DEFAULT_CALENDLY_URL
    return url.href.replaceAll('(', '%28').replaceAll(')', '%29')
  } catch {
    return DEFAULT_CALENDLY_URL
  }
}

export const CALENDLY_URL = resolveCalendlyUrl(process.env.NEXT_PUBLIC_CALENDLY_URL)
