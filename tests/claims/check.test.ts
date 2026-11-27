// The figure check (spec 008, contracts/figure-check.md "Fixtures", SC-001): one planted
// figure per language and surface type fails with exactly one finding, through the real
// scanners, and a listed non-result does not.

import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, describe, it } from 'node:test'

import {
  checkUnit,
  compareWithBaseline,
  compileNonResults,
  formatFindings,
  retiredFigures,
  type BaselineEntry,
  type Finding,
  type NonResultEntry,
  type Rule,
  type TextUnit,
} from '@/lib/claims/check'
import { isBackedValue, QUALIFIERS } from '@/lib/claims'
import type { Language } from '@/lib/i18n-config'
import { renderedFromSource, thirdPartyRetired } from '../../tools/claims/run-check.mjs'
import { scanExport } from '../../tools/claims/scan-export.mjs'
import { scanOgCards, scanSvgFile, scanTextFile, scanTsFile } from '../../tools/claims/scan-sources.mjs'

const LOCALES = ['en', 'de', 'fr', 'es', 'ar'] as const satisfies readonly Language[]
const NON_RESULTS: NonResultEntry[] = JSON.parse(readFileSync('tools/claims/non-results.json', 'utf8'))
const tmp = mkdtempSync(path.join(tmpdir(), 'claims-check-'))
after(() => rmSync(tmp, { recursive: true, force: true }))

const retired = retiredFigures().find((r) => r.id === 'retired.cifarBaseline')!.text

/** A wrong figure, and the one rule it must break. Each text is otherwise clean. */
const PLANTS: Record<string, { text: (lang: Language) => string; rule: Rule }> = {
  unregistered: {
    text: (lang) => (lang === 'de' || lang === 'fr' ? 'AUROC erreicht 99,30 %' : 'AUROC reached 99.30%'),
    rule: 'unregistered',
  },
  'mean-without-spread': { text: (lang) => `AUROC 99.03% (${QUALIFIERS.threeSeeds.text[lang]})`, rule: 'mean-without-spread' },
  'missing-qualifier': { text: () => 'The baseline reached 0.8673 ± 0.0230 AUROC.', rule: 'missing-qualifier' },
  retired: { text: () => `Earlier pages said ${retired} for the baseline.`, rule: 'retired' },
  // A table reference is not a listed non-result, so next to a metric word it fails.
  'table-value': { text: () => 'See Table 7.2 for the AUROC per class.', rule: 'unregistered' },
}

/** A listed non-result next to a metric word: no finding. */
const NON_RESULT = 'Calibrate @ TPR = 95% (Fig. 6.8)'
const CLEAN = 'A clean sentence with no figures.'

function write(rel: string, text: string): string {
  const abs = path.join(tmp, rel)
  mkdirSync(path.dirname(abs), { recursive: true })
  writeFileSync(abs, text)
  return abs
}

let n = 0
const js = (s: string) => JSON.stringify(s)

/** Each surface turns one planted text (in one language) into the scanner's units. */
const SURFACES: Record<string, { langs: readonly Language[]; units: (text: string, lang: Language) => TextUnit[] }> = {
  'source map': {
    langs: LOCALES,
    units: (text, lang) => {
      const rel = `src/fixture-${++n}.ts`
      const entries = LOCALES.map((l) => `    ${l}: ${js(l === lang ? text : CLEAN)},`).join('\n')
      return scanTsFile(write(rel, `export const copy = {\n  label: {\n${entries}\n  },\n}\n`), rel) as TextUnit[]
    },
  },
  'manifest paragraph': {
    langs: ['en'],
    units: (text) => {
      const rel = `public/llms-${++n}.txt`
      return scanTextFile(write(rel, `# Title\n\n${CLEAN}\n\n- ${text}\n- ${CLEAN}\n`), rel) as TextUnit[]
    },
  },
  svg: {
    langs: ['en'],
    units: (text) => {
      const rel = `.github/readme/hero-${++n}.svg`
      return scanSvgFile(write(rel, `<svg viewBox="0 0 10 10"><text x="1" y="2">${text}</text></svg>\n`), rel) as TextUnit[]
    },
  },
  'og card': {
    langs: ['en'],
    units: (text) => {
      const rel = `tools/og-${++n}.mjs`
      const src = `const CARDS = {\n  'og-x.png': { eyebrow: 'Thesis', title: ${js(text)}, sub: ${js(CLEAN)} },\n}\n`
      return scanOgCards(write(rel, src), rel)
    },
  },
  'html block': {
    langs: ['en'],
    units: (text) => {
      const out = path.join(tmp, `out-${++n}`)
      write(path.relative(tmp, path.join(out, 'index.html')), `<html><body><main><p>${text}</p><p>${CLEAN}</p></main></body></html>`)
      return scanExport(out).filter((u: TextUnit) => u.rules !== 'retired-only')
    },
  },
}

const check = (units: TextUnit[]): Finding[] => {
  const nonResults = compileNonResults(NON_RESULTS)
  return units.flatMap((u) => checkUnit(u, nonResults))
}

describe('figure check: planted figures', () => {
  it('uses plants that no data backs', () => {
    assert.ok(!isBackedValue(99.3))
    assert.ok(!isBackedValue(7.2))
  })

  for (const [surface, { langs, units }] of Object.entries(SURFACES)) {
    for (const [name, plant] of Object.entries(PLANTS)) {
      for (const lang of langs) {
        it(`${surface}: ${name} (${lang}) gives exactly one ${plant.rule} finding`, () => {
          const scanned = units(plant.text(lang), lang)
          const findings = check(scanned)
          assert.equal(findings.length, 1, formatFindings(findings))
          assert.equal(findings[0].rule, plant.rule)
          assert.equal(findings[0].lang, lang)
          assert.equal(findings[0].file, scanned[0].file)
        })
      }
    }
    it(`${surface}: a listed non-result gives no finding`, () => {
      assert.deepEqual(check(units(NON_RESULT, 'en')), [])
    })
  }

  it('finds a retired figure in any decimal mark and spacing, in raw files too', () => {
    const variants = [retired, retired.replace('.', ','), retired.replace('%', ' %')]
    for (const text of variants) {
      const unit: TextUnit = { file: 'out/_next/static/x.js', lang: 'en', scope: 'export', rules: 'retired-only', text: `a="${text}"` }
      assert.deepEqual(
        check([unit]).map((f) => f.rule),
        ['retired'],
        text,
      )
    }
  })

  it('reports an unused non-result pattern only through the run, never as a finding', () => {
    const nonResults = compileNonResults([{ id: 'x', pattern: 'never-matches-\\d+\\.\\d+', reason: 'r', example: 'e' }])
    checkUnit({ file: 'a.ts', lang: 'en', scope: 'source', text: CLEAN }, nonResults)
    assert.equal(nonResults.used.get('x'), 0)
  })

  it('keeps a scoped non-result to its scope', () => {
    const nonResults = compileNonResults([{ id: 'live', scope: 'export', pattern: 'TPR\\s*=\\s*\\d+[.,]\\d+%', reason: 'r', example: 'e' }])
    const text = 'TPR = 93.1%'
    assert.equal(checkUnit({ file: 'a.ts', lang: 'en', scope: 'source', text }, nonResults).length, 1)
    assert.equal(checkUnit({ file: 'out/a.html', lang: 'en', scope: 'export', text }, nonResults).length, 0)
  })
})

describe('figure check: scanners', () => {
  const exportDir = (html: string) => {
    const out = path.join(tmp, `out-${++n}`)
    write(path.relative(tmp, path.join(out, 'index.html')), html)
    return out
  }

  it('lets third-party news hold a retired figure, but not owner copy', () => {
    const headline = `Lab model reaches ${retired} on a new benchmark`
    const news = [{ headline: { en: headline, de: 'Ohne Zahl' }, take: { en: 'No figure here.' } }]
    const thirdParty = thirdPartyRetired(news)
    assert.deepEqual(thirdParty, [headline])
    const page = `<html><body><section id="news"><h3>${headline.replace("'", '&#x27;')}</h3></section>` +
      `<script>self.__next_f.push([1,${JSON.stringify(JSON.stringify({ t: headline }))}])</script></body></html>`
    const raw = (html: string, opts = { thirdParty }) =>
      scanExport(exportDir(html), opts).filter((u: TextUnit) => u.rules === 'retired-only')
    assert.deepEqual(check(raw(page)), [])
    // Without the news list, the same page fails (the encoded forms were really there).
    assert.equal(check(raw(page, { thirdParty: [] })).length, 2)
    const owned = page.replace('</body>', `<p>${retired} accuracy</p></body>`)
    assert.deepEqual(
      check(raw(owned)).map((f) => f.rule),
      ['retired'],
    )
  })

  it('skips only the element whose own id is "news"', () => {
    const html = `<html><body><div data-id="news"><p>AUROC reached 99.30%</p></div></body></html>`
    const units = scanExport(exportDir(html)).filter((u: TextUnit) => u.rules !== 'retired-only')
    assert.deepEqual(
      check(units).map((f) => f.figure),
      ['99.30%'],
    )
  })

  it('matches an export finding to its source unit by the words around it', () => {
    const exported = check([{ file: 'out/x.html', lang: 'en', scope: 'export', text: 'Headline result: AUROC 99.03% on CIFAR-10 airplane classes' }])
    const spread = exported.find((f) => f.rule === 'mean-without-spread')!
    const source = (words: string) => new Map([['99.03%|mean-without-spread', [words]]])
    assert.ok(renderedFromSource(spread, source('headlineresultaurocairplaneclasses')))
    assert.ok(!renderedFromSource(spread, source('anunrelatedcardaboutsomethingelse')))
    assert.ok(!renderedFromSource(spread, new Map()))
  })

  it('names the right line after a tag that spans lines', () => {
    const rel = `public/llms-${++n}.txt`
    const text = `<p align="center"\n   class="x">intro\n<img\n src="a.png">\nAUROC reached 99.30%</p>\n`
    const findings = check(scanTextFile(write(rel, text), rel) as TextUnit[])
    assert.deepEqual(
      findings.map((f) => f.line),
      [5],
    )
  })

  it('reads copy under no language key in the language its object declares', () => {
    const rel = `src/fixture-${++n}.ts`
    const src = `export const posts = [{ lang: 'de', body: 'Die Kurve erreicht 99,03 % ± 0,07 % AUROC (drei Seeds).' }]\n`
    const units = scanTsFile(write(rel, src), rel) as TextUnit[]
    assert.deepEqual(
      units.map((u) => u.lang),
      ['de'],
    )
    assert.deepEqual(check(units), [])
  })

  it('backs a percentage only for 0-1 metric fields, not for other fractions', () => {
    assert.ok(isBackedValue(80.94)) // accMean 0.8094
    assert.ok(!isBackedValue(96.98)) // alphaBar 0.9698, a noise schedule
    assert.ok(!isBackedValue(37.1)) // rawPValue 0.371
  })
})

describe('figure check: baseline', () => {
  const finding = (figure: string): Finding => ({
    scope: 'source',
    file: 'a.ts',
    lang: 'de',
    figure,
    rule: 'unregistered',
    detail: '',
    fix: '',
  })
  const entry = (figure: string, scope: 'source' | 'export' = 'source'): BaselineEntry => ({
    scope,
    file: 'a.ts',
    lang: 'de',
    figure,
    rule: 'unregistered',
  })

  it('matches findings by key and count', () => {
    const r = compareWithBaseline([finding('1,5%'), finding('1,5%')], [entry('1,5%')], ['source'])
    assert.equal(r.newFindings.length, 1)
    assert.deepEqual(r.staleEntries, [])
  })

  it('reports entries that no longer occur, only for the scanned scopes', () => {
    const r = compareWithBaseline([], [entry('1,5%'), entry('2,5%', 'export')], ['source'])
    assert.deepEqual(
      r.staleEntries.map((e) => e.figure),
      ['1,5%'],
    )
  })
})
