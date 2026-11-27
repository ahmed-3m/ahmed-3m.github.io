import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { goatCounterEndpoint, outboundEventName, trackEvent } from '@/lib/analytics'

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

describe('outboundEventName', () => {
  it('names clicks on the CV, the thesis and profile or booking links', () => {
    const cases: [string, string][] = [
      ['https://ahmed-3m.github.io/cv.pdf', 'click-cv'],
      ['http://localhost:3000/cv.pdf', 'click-cv'],
      ['https://ahmed-3m.github.io/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf', 'click-thesis'],
      ['https://calendly.com/ahmed/30min', 'click-calendly'],
      ['https://github.com/ahmed-3m/mergeproof', 'click-github'],
      ['https://www.linkedin.com/in/ahmed-3m/', 'click-linkedin'],
      ['https://huggingface.co/ahmed-3m', 'click-huggingface'],
    ]
    for (const [href, name] of cases) assert.equal(outboundEventName(href), name, href)
  })

  it('ignores every other link', () => {
    for (const href of [
      'https://ahmed-3m.github.io/about/',
      'https://ahmed-3m.github.io/research-poster.pdf',
      'https://notgithub.com/x',
      'https://github.com.evil.example/x',
      'mailto:ahmed.mo.0595@gmail.com',
      'not a url',
    ]) {
      assert.equal(outboundEventName(href), null, href)
    }
  })
})

describe('trackEvent', () => {
  it('does nothing without a configured site code or a browser', () => {
    assert.doesNotThrow(() => trackEvent('genie-open'))
  })
})
