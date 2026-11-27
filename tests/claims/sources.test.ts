// The figure check over the real site copy (spec 008, FR-006): every finding in the
// source scan is in tools/claims/baseline.json (now empty), every baseline entry still
// occurs, and every OG card matches tools/claims/og-cards.lock.json.
// The built pages are checked by `npm run verify:export`.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { formatClaim, QUALIFIERS } from '@/lib/claims'
import type { NonResultEntry } from '@/lib/claims/check'
import { CARDS } from '../../tools/generate-og-images.mjs'
import { report, runClaimsCheck } from '../../tools/claims/run-check.mjs'
import { OG_GENERATOR, scanSources } from '../../tools/claims/scan-sources.mjs'

describe('figure check: site copy', () => {
  it('has no figure outside the baseline and no stale baseline entry', () => {
    const result = runClaimsCheck({ scopes: ['source'] })
    assert.ok(result.ok, `\n${report(result)}`)
  })

  it('has an empty baseline: every figure on the site passes the check (SC-002)', () => {
    assert.deepEqual(JSON.parse(readFileSync('tools/claims/baseline.json', 'utf8')), [])
  })

  it('scans the OG cards as rendered, with the registry figures in their stat lines', () => {
    const og = scanSources('.').filter((u: { file: string }) => u.file === OG_GENERATOR)
    assert.equal(og.length, Object.keys(CARDS).length)
    const thesis = og.find((u: { text: string }) => u.text.includes('Conditional Diffusion for OOD'))
    const stat = `${formatClaim('thesis.mean', 'en', 'metric')} · ${QUALIFIERS.threeSeeds.text.en} (${formatClaim('thesis.gainPp', 'en', 'value')})`
    assert.ok(thesis?.text.includes(stat), thesis?.text)
  })

  it('keeps the non-result list short, with a reason and an example for each entry', () => {
    const entries: NonResultEntry[] = JSON.parse(readFileSync('tools/claims/non-results.json', 'utf8'))
    assert.ok(entries.length <= 25, `${entries.length} entries`)
    for (const e of entries) {
      assert.ok(e.id && e.pattern && e.reason && e.example, e.id)
      assert.ok(new RegExp(e.pattern, 'u').test(e.example), `${e.id}: the example matches the pattern`)
    }
  })
})
