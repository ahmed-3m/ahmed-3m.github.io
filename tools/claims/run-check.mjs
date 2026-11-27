// Runs the figure check (spec 008) over the source scan and, optionally, the static
// export, and compares the result with tools/claims/baseline.json.
// Needs the test hooks (`node --import ./tools/test-hooks.mjs`) to load the TS modules.

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { candidateGaps, checkUnit, compareWithBaseline, compileNonResults, formatFindings, lettersOf } from '@/lib/claims/check'
import { CARDS } from '../generate-og-images.mjs'
import { OG_DIR, OG_LOCK, staleOgImages } from './og-lock.mjs'
import { scanExport } from './scan-export.mjs'
import { OG_GENERATOR, ogCardLine, scanSources } from './scan-sources.mjs'

export const ROOT = path.resolve(import.meta.dirname, '..', '..')
const MAX_NON_RESULTS = 25
/** Third-party news (headlines and takes) bundled into the site; see thirdPartyRetired. */
const NEWS_DATA = 'src/lib/news-items.json'

const readJson = (rel) => JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8'))

/** `99,03 %` and `99.03%` are the same figure for export-versus-source deduplication. */
const normalisedFigure = (figure) => figure.replace(/,/g, '.').replace(/\s+/g, '')

const stringsOf = (value) =>
  typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(stringsOf) : []

/** News strings that hold a retired figure. They are third-party text, so the export scan
 *  blanks them from the raw HTML and JS units instead of failing the build on them. */
export function thirdPartyRetired(newsItems) {
  const none = compileNonResults([])
  return [...new Set(stringsOf(newsItems))].filter(
    (text) => checkUnit({ file: NEWS_DATA, lang: 'en', scope: 'export', rules: 'retired-only', text }, none).length > 0,
  )
}

const SNIPPET_MIN = 8

/**
 * Whether an export finding is the rendering of a source finding: the same figure and
 * rule, in a source unit that also holds the words just before or just after it. A finding
 * with no such source unit is reported in the export scope.
 */
export function renderedFromSource(finding, sourceTexts) {
  const texts = sourceTexts.get(`${normalisedFigure(finding.figure)}|${finding.rule}`)
  if (!texts || !finding.context) return false
  const snippets = [finding.context.before, finding.context.after].filter((s) => s.length >= SNIPPET_MIN)
  return snippets.length > 0 && texts.some((text) => snippets.some((s) => text.includes(s)))
}

/**
 * @param {{ scopes: Array<'source'|'export'>, outDir?: string, baseline?: object[] }} options
 */
export function runClaimsCheck({ scopes, outDir = path.join(ROOT, 'out'), baseline } = { scopes: ['source'] }) {
  const started = performance.now()
  const nonResultEntries = readJson('tools/claims/non-results.json')
  const nonResults = compileNonResults(nonResultEntries)
  const baselineEntries = baseline ?? readJson('tools/claims/baseline.json')

  const sourceUnits = scanSources(ROOT)
  const findings = []
  /** figure|rule -> the words of each source unit with that finding */
  const sourceTexts = new Map()
  for (const unit of sourceUnits) {
    const unitFindings = checkUnit(unit, nonResults)
    if (!unitFindings.length) continue
    findings.push(...unitFindings)
    const words = lettersOf(unit.text.replace(/<[^>]*>/g, ' '))
    for (const f of unitFindings) {
      const key = `${normalisedFigure(f.figure)}|${f.rule}`
      sourceTexts.set(key, [...(sourceTexts.get(key) ?? []), words])
    }
  }
  // An OG card whose text changed since the PNGs were rendered, or a committed PNG that
  // is not the one rendered (research R12). No lock file means every card is stale.
  const lock = existsSync(path.join(ROOT, OG_LOCK)) ? readJson(OG_LOCK) : {}
  const generatorSource = readFileSync(path.join(ROOT, OG_GENERATOR), 'utf8')
  const pngOf = (png) => {
    const abs = path.join(ROOT, OG_DIR, png)
    return existsSync(abs) ? readFileSync(abs) : undefined
  }
  findings.push(...staleOgImages(CARDS, lock, { file: OG_GENERATOR, lineOf: (png) => ogCardLine(generatorSource, png), pngOf }))
  const timings = { sourceMs: Math.round(performance.now() - started) }

  let exportUnits = []
  if (scopes.includes('export')) {
    const exportStarted = performance.now()
    exportUnits = scanExport(outDir, { thirdParty: thirdPartyRetired(readJson(NEWS_DATA)) })
    const blockFindings = []
    const rawFindings = []
    for (const unit of exportUnits) {
      for (const f of checkUnit(unit, nonResults)) (unit.rules === 'retired-only' ? rawFindings : blockFindings).push(f)
    }
    // A raw-file retired hit that a block already reported for the same file is one finding.
    const inBlocks = new Set(blockFindings.map((f) => `${f.file}|${normalisedFigure(f.figure)}|${f.rule}`))
    const exportFindings = [
      ...blockFindings,
      ...rawFindings.filter((f) => !inBlocks.has(`${f.file}|${normalisedFigure(f.figure)}|${f.rule}`)),
    ]
    // Reported once, at its source, when the source unit it was rendered from has it too.
    findings.push(...exportFindings.filter((f) => !renderedFromSource(f, sourceTexts)))
    timings.exportMs = Math.round(performance.now() - exportStarted)
  }

  const { newFindings, staleEntries } = compareWithBaseline(findings, baselineEntries, scopes)

  const problems = []
  if (nonResultEntries.length > MAX_NON_RESULTS) problems.push(`tools/claims/non-results.json has ${nonResultEntries.length} entries (at most ${MAX_NON_RESULTS})`)
  for (const entry of nonResultEntries) {
    if (!entry.id || !entry.pattern || !entry.reason || !entry.example) problems.push(`non-result "${entry.id ?? '?'}" needs an id, pattern, reason and example`)
    // A pattern for both scopes must excuse something in this run; a scoped one only when
    // its scope was scanned.
    const scanned = entry.scope ? scopes.includes(entry.scope) : true
    if (scanned && !nonResults.used.get(entry.id)) {
      problems.push(`unused non-result pattern "${entry.id}" — remove it from tools/claims/non-results.json`)
    }
  }

  const candidates = {}
  for (const unit of [...sourceUnits, ...exportUnits]) {
    for (const { claim, qualifier } of candidateGaps(unit)) {
      const key = `${claim} without ${qualifier} (${unit.scope})`
      candidates[key] = (candidates[key] ?? 0) + 1
    }
  }

  return {
    findings,
    newFindings,
    staleEntries,
    problems,
    candidates,
    units: { source: sourceUnits.length, export: exportUnits.length },
    timings: { ...timings, totalMs: Math.round(performance.now() - started) },
    ok: newFindings.length === 0 && staleEntries.length === 0 && problems.length === 0,
  }
}

/** One report for a failed run, in the contract's message format. */
export function report(result) {
  return [formatFindings(result.newFindings, result.staleEntries), ...result.problems].filter(Boolean).join('\n')
}
