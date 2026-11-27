// The claims registry (spec 008, data-model.md): values read from the data file, the
// qualifiers it names, and the data-backed values the figure check accepts.

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { claimParts, CLAIMS, DERIVED, formatClaim, isBackedValue, QUALIFIERS, type Claim, type ClaimId } from '@/lib/claims'
import { checkUnit, compileNonResults, formatFindings } from '@/lib/claims/check'
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

describe('formatClaim (contracts/claims-api.md)', () => {
  const variants = ['value', 'spread', 'metric', 'full', 'qualifier'] as const

  it('renders the contract examples', () => {
    assert.equal(formatClaim('thesis.mean', 'en'), '99.03% ± 0.07%')
    assert.equal(formatClaim('thesis.mean', 'de'), '99,03 % ± 0,07 %')
    assert.equal(formatClaim('thesis.mean', 'fr'), '99,03 % ± 0,07 %')
    assert.equal(formatClaim('thesis.mean', 'es'), '99.03% ± 0.07%')
    assert.equal(formatClaim('thesis.mean', 'en', 'full'), '99.03% ± 0.07% AUROC (3-seed mean)')
    assert.equal(formatClaim('thesis.mean', 'en', 'metric'), '99.03% ± 0.07% AUROC')
    assert.equal(formatClaim('thesis.mean', 'en', 'value'), '99.03%')
    assert.equal(formatClaim('thesis.mean', 'en', 'qualifier'), '3-seed mean')
    assert.equal(formatClaim('thesis.gainPp', 'fr', 'value'), '+6,5 pp')
    assert.equal(formatClaim('thesis.gainPp', 'en'), '+6.5 pp')
    assert.equal(formatClaim('inkjet.baseline', 'ar', 'spread'), '\u20660.8673\u00A0±\u00A00.0230\u2069')
    assert.equal(formatClaim('inkjet.baseline', 'en', 'full'), '0.8673 ± 0.0230 AUROC (5-fold CV)')
    assert.equal(formatClaim('thesis.seed42', 'de', 'full'), '98,98 % AUROC (Seed 42)')
  })

  it('wraps every Arabic number form in one isolate and leaves the qualifier outside it', () => {
    assert.equal(formatClaim('thesis.mean', 'ar', 'full'), '\u206699.03%\u00A0±\u00A00.07% AUROC\u2069 (متوسط 3 بذور)')
    for (const c of claims) {
      for (const v of variants.filter((x) => x !== 'qualifier')) {
        const text = formatClaim(c.id, 'ar', v)
        assert.ok(text.startsWith('\u2066'), `${c.id} ${v}`)
        assert.equal(text.match(/\u2066/g)!.length, 1, `${c.id} ${v}`)
      }
    }
  })

  it('never rounds: prints exactly the registered decimals', () => {
    for (const c of claims) {
      assert.ok(formatClaim(c.id, 'en', 'value').includes(Math.abs(c.value).toFixed(c.decimals)), c.id)
    }
  })

  it('computes the gain from the two means', () => {
    const gain = (CLAIMS['thesis.mean'].value - CLAIMS['thesis.baseline'].value).toFixed(1)
    assert.equal(formatClaim('thesis.gainPp', 'en', 'value'), `+${gain} pp`)
  })

  it('throws for an unknown or retired id', () => {
    assert.throws(() => formatClaim('thesis.nope' as ClaimId, 'en'), /unknown claim thesis\.nope/)
    // @ts-expect-error a retired id is not a ClaimId
    assert.throws(() => formatClaim('thesis.production', 'en'), /unknown claim/)
  })

  it('gives the number and unit parts for split layouts', () => {
    assert.deepEqual(claimParts('thesis.mean', 'en'), { number: '99.03', unit: '%', spread: '0.07' })
    assert.deepEqual(claimParts('thesis.mean', 'fr'), { number: '99,03', unit: ' %', spread: '0,07' })
    assert.deepEqual(claimParts('inkjet.baseline', 'de'), { number: '0,8673', unit: '', spread: '0,0230' })
  })

  it('passes the figure check in its full form, for every claim and language', () => {
    const none = compileNonResults([])
    for (const c of claims) {
      for (const lang of LOCALES) {
        const text = formatClaim(c.id, lang, 'full')
        const findings = checkUnit({ file: 'x.ts', lang, scope: 'source', text }, none)
        assert.deepEqual(findings, [], `${c.id} ${lang}: ${text}\n${formatFindings(findings)}`)
      }
    }
  })
})
