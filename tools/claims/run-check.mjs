// Runs the figure check (spec 008) over the source scan and, optionally, the static
// export, and compares the result with tools/claims/baseline.json.
// Needs the test hooks (`node --import ./tools/test-hooks.mjs`) to load the TS modules.

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { candidateGaps, checkUnit, compareWithBaseline, compileNonResults, formatFindings } from '@/lib/claims/check'
import { scanExport } from './scan-export.mjs'
import { scanSources } from './scan-sources.mjs'

export const ROOT = path.resolve(import.meta.dirname, '..', '..')
const MAX_NON_RESULTS = 25

const readJson = (rel) => JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8'))

/** `99,03 %` and `99.03%` are the same figure for export-versus-source deduplication. */
const normalisedFigure = (figure) => figure.replace(/,/g, '.').replace(/\s+/g, '')

/**
 * @param {{ scopes: Array<'source'|'export'>, outDir?: string, baseline?: object[] }} options
 */
export function runClaimsCheck({ scopes, outDir = path.join(ROOT, 'out'), baseline } = { scopes: ['source'] }) {
  const started = performance.now()
  const nonResultEntries = readJson('tools/claims/non-results.json')
  const nonResults = compileNonResults(nonResultEntries)
  const baselineEntries = baseline ?? readJson('tools/claims/baseline.json')

  const sourceUnits = scanSources(ROOT)
  const sourceFindings = sourceUnits.flatMap((u) => checkUnit(u, nonResults))
  const findings = [...sourceFindings]
  const timings = { sourceMs: Math.round(performance.now() - started) }

  let exportUnits = []
  if (scopes.includes('export')) {
    const exportStarted = performance.now()
    exportUnits = scanExport(outDir)
    const inSource = new Set(sourceFindings.map((f) => `${normalisedFigure(f.figure)}|${f.rule}`))
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
    // Reported once, at its source: the same figure and rule already found in source.
    findings.push(...exportFindings.filter((f) => !inSource.has(`${normalisedFigure(f.figure)}|${f.rule}`)))
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
