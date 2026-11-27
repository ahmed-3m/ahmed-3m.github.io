// Locale number formatting for registered figures (spec 008). Dependency-free: the Genie
// client bundle reaches it through `@/lib/genie/links`.

import type { Language } from '@/lib/i18n-config'

/**
 * Formats numeric strings for German and French decimal comma and percentage spacing
 * (`99.03% ± 0.07%` -> `99,03 % ± 0,07 %`) while preserving other locales.
 */
export function formatLocaleNumber(raw: string, lang: Language): string {
  if (lang !== 'de' && lang !== 'fr') return raw
  return raw.replace(/(\d)\.(\d)/g, '$1,$2').replace(/[ \u00A0]*%/g, ' %')
}
