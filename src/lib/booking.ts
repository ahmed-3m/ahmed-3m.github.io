// Public booking link, shared by the Schedule meeting buttons and Genie's replies.
// NEXT_PUBLIC_CALENDLY_URL is an optional build-time override (.github/workflows/deploy.yml).
const DEFAULT_CALENDLY_URL = 'https://calendly.com/ahmed-3m'

/** Accepts only an absolute https URL, so a malformed override can't break link rendering. */
function resolveCalendlyUrl(raw: string | undefined): string {
  const value = raw?.trim()
  if (!value) return DEFAULT_CALENDLY_URL
  try {
    return new URL(value).protocol === 'https:' ? value : DEFAULT_CALENDLY_URL
  } catch {
    return DEFAULT_CALENDLY_URL
  }
}

export const CALENDLY_URL = resolveCalendlyUrl(process.env.NEXT_PUBLIC_CALENDLY_URL)
