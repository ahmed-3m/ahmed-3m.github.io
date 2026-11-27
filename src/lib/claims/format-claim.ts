// formatClaim (spec 008, contracts/claims-api.md, research R3): the display form of a
// registered figure in one language. Pages, JSON-LD, the OG cards and Genie print figures
// only through this, so a changed data value moves every surface.

import type { Language } from '@/lib/i18n-config'
import { formatLocaleNumber } from './format'
import { QUALIFIERS } from './qualifiers'
import { CLAIMS, type Claim, type ClaimId } from './registry'

/**
 * - `value`: the number with its unit (`99.03%`, `+6.5 pp`, `0.8673`).
 * - `spread`: with its spread where it has one (`99.03% ± 0.07%`). The default.
 * - `metric`: the spread form and the metric (`99.03% ± 0.07% AUROC`).
 * - `full`: the metric form and its required qualifiers (`99.03% ± 0.07% AUROC (3-seed mean)`).
 * - `qualifier`: the required qualifiers alone (`3-seed mean`), or `''`.
 */
export type Variant = 'value' | 'spread' | 'metric' | 'full' | 'qualifier'

const LRI = '⁦'
const PDI = '⁩'
const NBSP = ' '

function claimOf(id: string): Claim {
  const claim = (CLAIMS as Record<string, Claim>)[id]
  if (!claim) throw new Error(`unknown claim ${id}`)
  return claim
}

/** The value, computed at call time for the gain so it always matches the two means. */
function valueOf(claim: Claim): number {
  if (claim.id !== 'thesis.gainPp') return claim.value
  return Number((CLAIMS['thesis.mean'].value - CLAIMS['thesis.baseline'].value).toFixed(claim.decimals))
}

const UNIT: Record<Claim['unit'], string> = { '%': '%', pp: ' pp', auroc01: '' }

/** The parts of a figure in one language, for layouts that style the number and unit
 *  separately (`99,03` + ` %`). No isolates: the caller places them. */
export function claimParts(id: ClaimId, lang: Language): { number: string; unit: string; spread?: string } {
  const claim = claimOf(id)
  const local = (n: number) => formatLocaleNumber(n.toFixed(claim.decimals), lang)
  const sign = claim.unit === 'pp' && valueOf(claim) > 0 ? '+' : ''
  const unit = claim.unit === '%' && (lang === 'de' || lang === 'fr') ? ' %' : UNIT[claim.unit]
  return { number: `${sign}${local(valueOf(claim))}`, unit, ...(claim.spread === undefined ? {} : { spread: local(claim.spread) }) }
}

/** Required qualifiers of a claim in one language, joined with a comma. */
function qualifierText(claim: Claim, lang: Language): string {
  return claim.qualifiers.map((q) => QUALIFIERS[q].text[lang]).join(', ')
}

/** Display form of a claim in one language. Throws for an unknown or retired id. */
export function formatClaim(id: ClaimId, lang: Language, variant: Variant = 'spread'): string {
  const claim = claimOf(id)
  if (variant === 'qualifier') return qualifierText(claim, lang)
  const { number, unit, spread } = claimParts(id, lang)
  const pm = lang === 'ar' ? `${NBSP}±${NBSP}` : ' ± '
  let text = `${number}${unit}`
  if (variant !== 'value' && spread !== undefined) text += `${pm}${spread}${unit}`
  if (variant === 'metric' || variant === 'full') text += ` ${claim.metric.replace(/ gain$/, '')}`
  if (lang === 'ar') text = `${LRI}${text}${PDI}`
  const qualifiers = qualifierText(claim, lang)
  if (variant === 'full' && qualifiers) text += ` (${qualifiers})`
  return text
}
