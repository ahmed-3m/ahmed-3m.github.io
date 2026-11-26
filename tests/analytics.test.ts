import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { goatCounterEndpoint } from '@/lib/analytics'

describe('goatCounterEndpoint', () => {
  it('builds the count endpoint from a site code', () => {
    assert.equal(goatCounterEndpoint('ci-smoke'), 'https://ci-smoke.goatcounter.com/count')
    assert.equal(goatCounterEndpoint('  MySite '), 'https://mysite.goatcounter.com/count')
  })

  it('turns analytics off for a missing or malformed code', () => {
    for (const code of [undefined, '', '   ', '-site', 'site-', 'my.site', 'evil.example/x', 'a'.repeat(51)]) {
      assert.equal(goatCounterEndpoint(code), null, String(code))
    }
  })
})
