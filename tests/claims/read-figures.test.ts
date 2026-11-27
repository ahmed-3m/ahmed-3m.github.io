// readFigures (spec 008, research R4): decimal marks, counts, inline markup and noise.

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { cleanText, parseFigure, readFigures } from '@/lib/claims/read-figures'
import type { Language } from '@/lib/i18n-config'

const LOCALES = ['en', 'de', 'fr', 'es', 'ar'] as const satisfies readonly Language[]
const raws = (text: string, lang: Language) => readFigures(text, lang).map((f) => f.raw)
const values = (text: string, lang: Language) => readFigures(text, lang).map((f) => f.value)

describe('readFigures', () => {
  it('reads 9.000 and 6.408 as counts in de and es, and 6,408 in ar', () => {
    for (const lang of ['de', 'es'] as const) {
      assert.deepEqual(raws('9.000 OOD-Bilder und 6.408 Ausschnitte', lang), [], lang)
    }
    assert.deepEqual(raws('6,408 مقتطفًا', 'ar'), [])
    assert.deepEqual(raws('9,000 OOD images', 'en'), [])
  })

  it('reads 99,03 as 99.03 in every language', () => {
    for (const lang of LOCALES) assert.deepEqual(values('AUROC 99,03 %', lang), [99.03], lang)
  })

  it('reads a grouped-looking figure followed by % as a decimal', () => {
    assert.deepEqual(values('99.030%', 'de'), [99.03])
  })

  it('reads a figure split by inline markup as one figure', () => {
    const one = readFigures('99.03<span class="u">%</span> AUROC', 'en')
    assert.equal(one.length, 1)
    assert.equal(one[0].value, 99.03)
    assert.ok(one[0].resultLooking)
    const pp = readFigures('+6.5<tspan dx="2">pp</tspan>', 'en')
    assert.deepEqual(
      pp.map((f) => [f.value, f.resultLooking]),
      [[6.5, true]],
    )
  })

  it('reads through bidi marks and no-break spaces', () => {
    const text = '⁦AUROC 99,03 %⁩'
    assert.deepEqual(values(text, 'fr'), [99.03])
    assert.ok(readFigures(text, 'fr')[0].resultLooking)
  })

  it('reads +/- as ±', () => {
    assert.equal(cleanText('99.03% +/- 0.07%'), '99.03% ± 0.07%')
  })

  it('skips dates, versions and times', () => {
    assert.deepEqual(raws('Submitted 12.07.2026, version 1.2.3, at 10.30 Uhr', 'de').length, 1) // only 10.30
    assert.ok(Number.isNaN(parseFigure('12.07.2026')))
    assert.ok(Number.isNaN(parseFigure('1.2.3')))
    assert.deepEqual(raws('2026-07-12, 14:30', 'en'), [])
  })

  it('skips figures that are part of a name', () => {
    assert.deepEqual(raws('YOLOv8.1 and x2.5 zoom', 'en'), [])
  })

  it('marks figures with a unit or a nearby metric word as result-looking', () => {
    const [a, b, c] = readFigures('AUROC 98.98, lambda 0.02 elsewhere\nweight 3.5 kg', 'en')
    assert.equal(a.resultLooking, true)
    assert.equal(b.resultLooking, true) // within 50 characters of AUROC on the same line
    assert.equal(c.resultLooking, false)
  })
})
