// The figure check over the real site copy (spec 008, FR-006): every finding in the
// source scan is in tools/claims/baseline.json, and every baseline entry still occurs.
// The built pages are checked by `npm run verify:export`.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import type { NonResultEntry } from '@/lib/claims/check'
import { report, runClaimsCheck } from '../../tools/claims/run-check.mjs'

describe('figure check: site copy', () => {
  it('has no figure outside the baseline and no stale baseline entry', () => {
    const result = runClaimsCheck({ scopes: ['source'] })
    assert.ok(result.ok, `\n${report(result)}`)
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
