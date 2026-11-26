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
