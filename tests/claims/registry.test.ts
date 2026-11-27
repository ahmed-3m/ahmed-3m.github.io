// The claims registry (spec 008, data-model.md): values read from the data file, the
// qualifiers it names, and the data-backed values the figure check accepts.

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { CLAIMS, DERIVED, isBackedValue, QUALIFIERS, type Claim } from '@/lib/claims'
import { retiredFigures } from '@/lib/claims/retired'
import * as DATA from '@/lib/ood-explorer-data'

const LOCALES = ['en', 'de', 'fr', 'es', 'ar'] as const
const claims = Object.values(CLAIMS) as Claim[]

const cifarBaseline = DATA.CIFAR_LAMBDA_SWEEP.find((r) => r.lambda === '0.0')!
const cifarOptimal = DATA.CIFAR_LAMBDA_SWEEP.find((r) => r.isOptimal)!
const inkjetBaseline = DATA.INKJET_OVERALL_SWEEP['0.0']

describe('claims registry', () => {
  it('reads each claim from the data file', () => {
    assert.equal(CLAIMS['thesis.mean'].value, cifarOptimal.withinCifarMean)
    assert.equal(CLAIMS['thesis.mean'].spread, cifarOptimal.withinCifarStd)
    assert.equal(CLAIMS['thesis.baseline'].value, cifarBaseline.withinCifarMean)
    assert.equal(CLAIMS['thesis.baseline'].spread, cifarBaseline.withinCifarStd)
    assert.equal(CLAIMS['thesis.seed42'].value, DATA.BENCHMARK_DATASETS.within_cifar.auroc)
    assert.equal(CLAIMS['inkjet.baseline'].value, inkjetBaseline.aurocMean)
    assert.equal(CLAIMS['inkjet.baseline'].spread, inkjetBaseline.aurocStd)
  })

  it('computes the separation gain from the optimal and baseline means, to 1 decimal', () => {
    const gain = Number((cifarOptimal.withinCifarMean - cifarBaseline.withinCifarMean).toFixed(1))
    assert.equal(DERIVED.separationGainPp, gain)
    assert.equal(CLAIMS['thesis.gainPp'].value, gain)
  })

  it('has no 3-decimal value with a non-zero integer part (it would read as a count)', () => {
    for (const c of claims) {
      for (const n of [c.value, c.spread].filter((v): v is number => v !== undefined)) {
        const [int, frac = ''] = n.toFixed(c.decimals).split('.')
        assert.ok(!(frac.length === 3 && Number(int) !== 0), `${c.id}: ${n}`)
      }
    }
  })

  it('names only qualifiers that exist, with wording and phrasings in all 5 languages', () => {
    for (const c of claims) {
      for (const q of [...c.qualifiers, ...c.candidateQualifiers]) {
        const qualifier = QUALIFIERS[q]
        assert.ok(qualifier, `${c.id}: ${q}`)
        for (const lang of LOCALES) {
          assert.ok(qualifier.text[lang], `${q} text ${lang}`)
          assert.ok(qualifier.accepts[lang].test(qualifier.text[lang]), `${q} accepts its own ${lang} wording`)
        }
      }
    }
  })

  it('accepts registered and data-file values, and nothing else', () => {
    assert.ok(isBackedValue(99.03))
    assert.ok(isBackedValue(0.8673))
    assert.ok(isBackedValue(80.94), 'accMean 0.8094 written as a percentage')
    assert.ok(!isBackedValue(99.3))
    assert.ok(!isBackedValue(98.9), 'a rounded 98.87 is not registered')
  })

  it('backs no retired figure', () => {
    for (const r of retiredFigures()) {
      const value = Number(r.text.replace(/^\+/, '').match(/\d+(?:\.\d+)?/)![0])
      assert.ok(!isBackedValue(value), r.id)
    }
  })
})
