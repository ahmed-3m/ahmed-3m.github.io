// The figure check (spec 008, FR-006/FR-007): pure rules over text units. The scanners
// in tools/claims/ build the units; `npm test` and `npm run verify:export` run it.
// Not imported by components (ESLint blocks src/components and src/app): it reads the
// retired figures, which must stay out of the client bundle.

import type { Language } from '@/lib/i18n-config'
import { formatLocaleNumber } from './format'
import { QUALIFIERS, type QualifierId } from './qualifiers'
import { cleanText, readFigures, type Figure } from './read-figures'
import { CLAIMS, isBackedValue, type Claim } from './registry'
import { retiredFigures } from './retired'

export { retiredFigures } from './retired'

export type Rule =
  | 'unregistered'
  | 'retired'
  | 'mean-without-spread'
  | 'missing-qualifier'
  | 'stale-og-image'
  | 'stale-baseline'

export type Scope = 'source' | 'export'

export interface TextUnit {
  /** Repository-relative path with forward slashes, or `out/…` for the export. */
  file: string
  lang: Language
  scope: Scope
  /** `retired-only` units (raw HTML and JS bundles) are checked for retired figures only. */
  rules?: 'all' | 'retired-only'
  text: string
  /** First source line of the unit. */
  line?: number
  /** Source line of each line of `text`, when the scanner knows it. */
  lineMap?: number[]
}

export interface Finding {
  scope: Scope
  file: string
  lang: Language
  figure: string
  rule: Rule
  detail: string
  fix: string
  line?: number
}

export interface NonResultEntry {
  id: string
  pattern: string
  reason: string
  example: string
  /** Where the pattern applies; both scopes when absent. */
  scope?: Scope
}

export interface BaselineEntry {
  scope: Scope
  file: string
  lang: Language
  figure: string
  rule: Rule
  note?: string
}

// ---------------------------------------------------------------------------------

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** A retired figure in any decimal mark, with or without a space before its unit. */
function retiredPattern(text: string): RegExp {
  const body = escape(text)
    .replace(/(\d)\\\.(\d)/g, '$1[.,]$2')
    .replace(/(\d) /g, '$1\\s?')
    .replace(/(\d)(%|pp)/g, '$1\\s?$2')
  return new RegExp(`(?<![\\d.,])${body}`, 'gi')
}

const RETIRED = retiredFigures().map((r) => ({ ...r, pattern: retiredPattern(r.text) }))

/** The figure as written, with its unit when one follows (`99,03 %`, `+6.5pp`). */
function asWritten(clean: string, figure: Figure): string {
  const sign = clean[figure.index - 1] === '+' ? '+' : ''
  const unit = clean.slice(figure.index + figure.raw.length).match(/^\s?(?:%|pp\b)/)?.[0] ?? ''
  return `${sign}${figure.raw}${unit}`
}

const UNIT_SUFFIX: Record<Claim['unit'], string> = { '%': '%', pp: ' pp', auroc01: '' }

function spreadForm(claim: Claim, lang: Language): string {
  const suffix = UNIT_SUFFIX[claim.unit]
  const mean = `${claim.value.toFixed(claim.decimals)}${suffix}`
  return formatLocaleNumber(claim.spread === undefined ? mean : `${mean} ± ${claim.spread.toFixed(claim.decimals)}${suffix}`, lang)
}

const same = (a: number, b: number) => Math.abs(a - b) < 1e-9
const NAMED = Object.entries(CLAIMS) as [string, Claim][]

/** Compiled non-result patterns, with a counter of how often each one excused a figure. */
export interface NonResults {
  entries: { entry: NonResultEntry; regex: RegExp }[]
  used: Map<string, number>
}

export function compileNonResults(entries: NonResultEntry[]): NonResults {
  return {
    entries: entries.map((entry) => ({ entry, regex: new RegExp(entry.pattern, 'giu') })),
    used: new Map(entries.map((e) => [e.id, 0])),
  }
}

function excusedBy(clean: string, figure: Figure, scope: Scope, nonResults: NonResults): string | null {
  const start = figure.index
  const end = figure.index + figure.raw.length
  for (const { entry, regex } of nonResults.entries) {
    if (entry.scope && entry.scope !== scope) continue
    for (const m of clean.matchAll(regex)) {
      if (m.index <= start && m.index + m[0].length >= end) return entry.id
    }
  }
  return null
}

/** Findings for one text unit. Applies the non-result patterns; does not apply the baseline. */
export function checkUnit(unit: TextUnit, nonResults: NonResults): Finding[] {
  const findings: Finding[] = []
  const retiredOnly = unit.rules === 'retired-only'
  const clean = retiredOnly ? unit.text.replace(/\r\n?/g, '\n') : cleanText(unit.text)

  /** Source line of a position in `clean`, through the scanner's line map when it has one. */
  const lineAt = (index: number): number | undefined => {
    if (!unit.lineMap) return unit.line
    const k = clean.slice(0, index).split('\n').length - 1
    return unit.lineMap[Math.min(k, unit.lineMap.length - 1)] ?? unit.line
  }
  const add = (figure: string, rule: Rule, detail: string, fix: string, index: number) =>
    findings.push({ scope: unit.scope, file: unit.file, lang: unit.lang, figure, rule, detail, fix, line: lineAt(index) })

  // Retired figures, in any form.
  const retiredSpans: [number, number][] = []
  for (const r of RETIRED) {
    for (const m of clean.matchAll(r.pattern)) {
      retiredSpans.push([m.index, m.index + m[0].length])
      add(m[0], 'retired', `retired figure (${r.reason})`, 'remove it; retired figures must not appear on any surface', m.index)
    }
  }
  if (retiredOnly) return findings

  const figures = readFigures(unit.text, unit.lang)
  const inRetired = (f: Figure) => retiredSpans.some(([s, e]) => f.index >= s && f.index < e)

  // Result-looking figures that no data backs.
  for (const figure of figures) {
    if (!figure.resultLooking || inRetired(figure) || isBackedValue(figure.value)) continue
    const excuse = excusedBy(clean, figure, unit.scope, nonResults)
    if (excuse) {
      nonResults.used.set(excuse, (nonResults.used.get(excuse) ?? 0) + 1)
      continue
    }
    add(
      asWritten(clean, figure),
      'unregistered',
      'not a registered value',
      'correct it, register it in src/lib/claims/registry.ts, or add a non-result pattern with a reason to tools/claims/non-results.json',
      figure.index,
    )
  }

  // Named claims: spread and qualifiers in the same unit.
  for (const [id, claim] of NAMED) {
    const occurrence = figures.find((f) => same(f.value, claim.value))
    if (!occurrence) continue
    const written = asWritten(clean, occurrence)
    if (claim.spread !== undefined && !figures.some((f) => same(f.value, claim.spread!))) {
      add(
        written,
        'mean-without-spread',
        `mean without its spread (${spreadForm(claim, unit.lang)})`,
        `state the spread in the same unit, e.g. formatClaim('${id}', '${unit.lang}')`,
        occurrence.index,
      )
    }
    for (const q of claim.qualifiers) {
      if (QUALIFIERS[q].accepts[unit.lang].test(clean)) continue
      add(
        written,
        'missing-qualifier',
        `missing qualifier: ${QUALIFIERS[q].text[unit.lang]}`,
        `add "${QUALIFIERS[q].text[unit.lang]}" in the same sentence, list item, row or card`,
        occurrence.index,
      )
    }
  }
  return findings
}

/** Candidate qualifier gaps (research R7): measured for the PR record, never enforced. */
export function candidateGaps(unit: TextUnit): { claim: string; qualifier: QualifierId }[] {
  if (unit.rules === 'retired-only') return []
  const clean = cleanText(unit.text)
  const figures = readFigures(unit.text, unit.lang)
  const gaps: { claim: string; qualifier: QualifierId }[] = []
  for (const [id, claim] of NAMED) {
    if (!figures.some((f) => same(f.value, claim.value))) continue
    for (const q of claim.candidateQualifiers) {
      if (!QUALIFIERS[q].accepts[unit.lang].test(clean)) gaps.push({ claim: id, qualifier: q })
    }
  }
  return gaps
}

// ---------------------------------------------------------------------------------

const keyOf = (e: { scope: Scope; file: string; lang: Language; figure: string; rule: Rule }) =>
  `${e.scope}|${e.file}|${e.lang}|${e.figure}|${e.rule}`

/** Splits findings against the baseline, for the scopes this runner scanned. Either list
 *  being non-empty is a failure. */
export function compareWithBaseline(
  findings: Finding[],
  baseline: BaselineEntry[],
  scopes: Scope[],
): { newFindings: Finding[]; staleEntries: BaselineEntry[] } {
  const remaining = new Map<string, BaselineEntry[]>()
  for (const entry of baseline) {
    if (!scopes.includes(entry.scope)) continue
    const list = remaining.get(keyOf(entry)) ?? []
    list.push(entry)
    remaining.set(keyOf(entry), list)
  }
  const newFindings: Finding[] = []
  for (const finding of findings) {
    const list = remaining.get(keyOf(finding))
    if (list?.length) list.pop()
    else newFindings.push(finding)
  }
  return { newFindings, staleEntries: [...remaining.values()].flat() }
}

/** The message format from contracts/figure-check.md. */
export function formatFindings(findings: Finding[], staleEntries: BaselineEntry[] = []): string {
  const lines = findings.map(
    (f) => `${f.file}${f.line ? `:${f.line}` : ''} (${f.lang}) "${f.figure}" — ${f.rule}: ${f.detail}\n  fix: ${f.fix}`,
  )
  for (const e of staleEntries) {
    lines.push(`${e.file} (${e.lang}) "${e.figure}" — stale-baseline: ${e.rule} no longer occurs\n  fix: remove this entry from tools/claims/baseline.json`)
  }
  return lines.join('\n')
}

export const baselineEntryOf = (f: Finding): BaselineEntry => ({
  scope: f.scope,
  file: f.file,
  lang: f.lang,
  figure: f.figure,
  rule: f.rule,
})
