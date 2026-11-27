// Claim checks for what Genie says, in all 5 site languages (see "claim integrity" in
// AGENTS.md):
// - every decimal number comes from src/lib/ood-explorer-data.ts (or is derived from it),
// - a mean is never shown without its spread, and keeps its qualifier (3-seed mean,
//   seed 42, 5-fold cross-validation),
// - every link is on the public allowlist.
// Covers the prepared replies, a small set of typed questions answered without a model,
// and the knowledge the model is given.

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { DERIVED, isBackedValue, QUALIFIERS } from '@/lib/claims'
import * as DATA from '@/lib/ood-explorer-data'
import { KNOWLEDGE_CHUNKS } from '@/lib/genie/knowledge'
import { formatLocaleNumber, resolveLinkProps } from '@/lib/genie/links'
import { parseInlineTokens, type InlineToken } from '@/lib/genie/markdown'
import { LOCAL_REPLIES, type ReplyId } from '@/lib/genie/prompts'
import { decideImmediateReply } from '@/lib/genie/reply'
import { buildSystemPrompt } from '@/lib/genie/retriever'
import type { Language } from '@/lib/i18n-config'

const LOCALES = ['en', 'de', 'fr', 'es', 'ar'] as const satisfies readonly Language[]

// ---------------------------------------------------------------------------------
// Numbers the data file backs: the claims registry (spec 008, FR-009) holds them, with
// the computed values (DERIVED) and the qualifier phrasings the site-wide check uses.

const cifarBaseline = DATA.CIFAR_LAMBDA_SWEEP.find((r) => r.lambda === '0.0')!
const cifarOptimal = DATA.CIFAR_LAMBDA_SWEEP.find((r) => r.isOptimal)!
const inkjetBaseline = DATA.INKJET_OVERALL_SWEEP['0.0']

const isBacked = isBackedValue

/** Decimal numbers in a text, read with the language's decimal mark. */
function decimals(text: string, lang: Language): { raw: string; value: number }[] {
  const decimalComma = lang === 'de' || lang === 'fr'
  return [...text.matchAll(/\d+(?:[.,]\d+)+/g)]
    .map((m) => m[0])
    .filter((raw) => decimalComma || !/^\d{1,3}(?:,\d{3})+$/.test(raw)) // 9,000 is a count
    .map((raw) => ({ raw, value: Number(decimalComma ? raw.replace(',', '.') : raw.replace(/,/g, '')) }))
}

// ---------------------------------------------------------------------------------
// Spreads and qualifiers

const pct = (n: number) => `${n.toFixed(2)}%`
/** Each headline mean, as written next to its spread. */
const MEANS = [
  { mean: pct(cifarOptimal.withinCifarMean), spread: pct(cifarOptimal.withinCifarStd!) },
  { mean: pct(cifarBaseline.withinCifarMean), spread: pct(cifarBaseline.withinCifarStd!) },
  { mean: inkjetBaseline.aurocMean.toFixed(4), spread: inkjetBaseline.aurocStd.toFixed(4) },
]

const THREE_SEEDS = QUALIFIERS.threeSeeds.accepts
const SEED_42 = QUALIFIERS.seed42.accepts
const FIVE_FOLD = QUALIFIERS.fiveFoldCv.accepts

/** Problems with the numbers, spreads and qualifiers in one text. `notResults` lists
 *  numbers that are not results (a table reference, say) and need no backing. */
function claimProblems(text: string, lang: Language, notResults: ReadonlySet<string> = new Set()): string[] {
  const problems: string[] = []
  for (const { raw } of decimals(text, lang).filter(({ raw, value }) => !isBacked(value) && !notResults.has(raw))) {
    problems.push(`${raw} is not in ood-explorer-data.ts`)
  }
  for (const { mean, spread } of MEANS) {
    const meanText = formatLocaleNumber(mean, lang)
    if (!text.includes(meanText)) continue
    const withSpread = formatLocaleNumber(`${mean} ± ${spread}`, lang)
    if (!text.includes(withSpread)) problems.push(`${meanText} without its spread (${withSpread})`)
  }
  const has = (n: string) => text.includes(formatLocaleNumber(n, lang))
  if (has(pct(cifarOptimal.withinCifarMean)) && !THREE_SEEDS[lang].test(text)) problems.push('3-seed mean without "3 seeds"')
  if (has(pct(DATA.BENCHMARK_DATASETS.within_cifar.auroc)) && !SEED_42[lang].test(text)) problems.push('seed-42 run without "seed 42"')
  if (has(inkjetBaseline.aurocMean.toFixed(4)) && !FIVE_FOLD[lang].test(text)) problems.push('inkjet AUROC without 5-fold CV')
  return problems
}

// ---------------------------------------------------------------------------------
// Links

/** Markdown links and bare URLs, minus the trailing punctuation the renderer also drops. */
function linksIn(text: string): string[] {
  const markdown = [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1])
  const bare = [...text.replace(/\]\([^)\s]+\)/g, ']').matchAll(/(?:https?:\/\/|mailto:)[^\s)\]]+/g)].map((m) =>
    m[0].replace(/[),.;!?،؛؟]+$/u, '')
  )
  return [...markdown, ...bare]
}

const unlisted = (text: string) => linksIn(text).filter((href) => resolveLinkProps(href) === null)

/** How many links the chat panel's renderer turns the text into. */
function renderedLinkCount(text: string): number {
  const count = (tokens: InlineToken[]): number =>
    tokens.reduce((n, t) => n + (t.type === 'link' ? 1 : 'children' in t ? count(t.children) : 0), 0)
  return text.split('\n').reduce((n, line) => n + count(parseInlineTokens(line)), 0)
}

// ---------------------------------------------------------------------------------

describe('prepared replies', () => {
  for (const [id, map] of Object.entries(LOCAL_REPLIES) as [ReplyId, Record<Language, string>][]) {
    for (const lang of LOCALES) {
      it(`${id} (${lang}) states only backed numbers, with spreads, qualifiers and allowlisted links`, () => {
        assert.deepEqual(claimProblems(map[lang], lang), [])
        assert.deepEqual(unlisted(map[lang]), [])
        assert.ok(renderedLinkCount(map[lang]) >= linksIn(map[lang]).length, 'every link renders as a link')
      })
    }
  }

  it('states the separation gain computed from the data file', () => {
    const gain = DERIVED.separationGainPp.toFixed(1)
    for (const lang of LOCALES) {
      assert.ok(LOCAL_REPLIES.achievements[lang].includes(`+${formatLocaleNumber(gain, lang)}`), lang)
    }
  })

  it('would catch an invented number, a missing spread and an unlisted link', () => {
    assert.deepEqual(claimProblems('AUROC reached 99.30% across three seeds.', 'en'), ['99.30 is not in ood-explorer-data.ts'])
    assert.deepEqual(claimProblems('Die AUROC lag bei 99,03 % über drei Läufe.', 'de'), [
      '99,03 % without its spread (99,03 % ± 0,07 %)',
    ])
    assert.deepEqual(claimProblems('The baseline reached 0.8673 ± 0.0230 AUROC.', 'en'), ['inkjet AUROC without 5-fold CV'])
    assert.deepEqual(claimProblems('AUROC reached 12345.00% across three seeds.', 'en'), ['12345.00 is not in ood-explorer-data.ts'])
    assert.deepEqual(unlisted('[CV](https://ahmed-3m.github.io/cv.pdf) or https://example.com/x.'), ['https://example.com/x'])
  })
})

/** Typed questions answered without a model: which prepared reply each should get. */
const TYPED_QUESTIONS: { reply: ReplyId; questions: Record<Language, string> }[] = [
  {
    reply: 'thesis',
    questions: {
      en: 'What AUROC did the thesis reach?',
      de: 'Welche AUROC hat die Masterarbeit erreicht?',
      fr: 'Quelle AUROC le mémoire a-t-il obtenue ?',
      es: '¿Qué AUROC obtuvo la tesis?',
      ar: 'ما نتيجة AUROC في رسالة الماجستير؟',
    },
  },
  {
    reply: 'industrial',
    questions: {
      en: 'How well did the industrial inkjet model do?',
      de: 'Wie gut war das industrielle Inkjet-Modell?',
      fr: 'Quels résultats pour le projet industriel ?',
      es: '¿Qué resultados tuvo el proyecto industrial?',
      ar: 'ما نتائج المشروع الصناعي؟',
    },
  },
  {
    reply: 'contact',
    questions: {
      en: 'How can I contact Ahmed?',
      de: 'Kontakt',
      fr: 'Comment contacter Ahmed ?',
      es: '¿Cómo puedo contactar a Ahmed?',
      ar: 'كيف أتواصل مع أحمد؟',
    },
  },
  {
    reply: 'cv',
    questions: {
      en: 'Where can I download his CV?',
      de: 'Lebenslauf',
      fr: 'Où télécharger son CV ?',
      es: '¿Dónde puedo descargar su currículum?',
      ar: 'أين أجد سيرته الذاتية؟',
    },
  },
]

describe('typed questions without a model', () => {
  for (const { reply, questions } of TYPED_QUESTIONS) {
    for (const lang of LOCALES) {
      it(`answers "${questions[lang]}" with the ${reply} reply (${lang})`, () => {
        const result = decideImmediateReply({ content: questions[lang], lang, proxyConfigured: false, section: 'hero' })
        assert.equal(result.kind, 'answer')
        const text = result.kind === 'answer' ? result.message.content : ''
        assert.equal(text, LOCAL_REPLIES[reply][lang])
        assert.ok(linksIn(text).length > 0, 'points to a page')
        assert.deepEqual(claimProblems(text, lang), [])
        assert.deepEqual(unlisted(text), [])
      })
    }
  }
})

describe('what the model is given', () => {
  // Numbers in the knowledge base that are not results, so the data file has no copy.
  const NOT_RESULTS = new Set([
    '6.1', // "Table 6.1", a thesis table reference
    '25.86', // YOLOv8m parameter count (millions)
  ])

  for (const chunk of KNOWLEDGE_CHUNKS) {
    it(`knowledge "${chunk.id}" uses backed numbers with spreads and qualifiers, and allowlisted links`, () => {
      assert.deepEqual(claimProblems(chunk.facts, 'en', NOT_RESULTS), [])
      assert.deepEqual(chunk.links.filter((href) => resolveLinkProps(href) === null), [])
      assert.deepEqual(unlisted(chunk.facts), [])
    })
  }

  for (const lang of LOCALES) {
    it(`gives the headline result with its spread for a results question (${lang})`, () => {
      const prompt = buildSystemPrompt({ lang, query: TYPED_QUESTIONS[0].questions[lang] })
      assert.ok(prompt.includes(`${pct(cifarOptimal.withinCifarMean)} ± ${pct(cifarOptimal.withinCifarStd!)}`))
      assert.deepEqual(unlisted(prompt), [])
    })
  }

  const word = (pattern: string) => new RegExp(`(?:^|[^\\p{L}])(?:${pattern})(?!\\p{L})`, 'iu')
  const RWR_ELIGIBLE: Record<Language, RegExp> = {
    en: word('eligible'),
    de: word('berechtigt'),
    fr: word('éligible'),
    es: word('elegible'),
    ar: /مؤهل/,
  }
  const RWR_POSSESSION_OVERCLAIM: Record<Language, RegExp> = {
    en: word('already (?:holds|has)|holder of'),
    de: word('besitzt|hat bereits|bereits im Besitz|Inhaber'),
    fr: word('détient|possède déjà|titulaire'),
    es: word('ya tiene|posee|titular'),
    ar: /(?:يحمل بالفعل|يمتلك بالفعل|حاصل على بطاقة)/,
  }
  const RWR_QUESTIONS: Record<Language, string> = {
    en: 'Does Ahmed have a work permit in Austria?',
    de: 'Darf Ahmed in Österreich arbeiten? Hat er die Rot-Weiß-Rot-Karte?',
    fr: 'Ahmed a-t-il un permis de travail en Autriche ?',
    es: '¿Tiene Ahmed permiso de trabajo en Austria?',
    ar: 'هل لدى أحمد تصريح عمل في النمسا؟',
  }

  for (const lang of LOCALES) {
    it(`frames RWR strictly as eligibility, never possession, in prepared replies and system prompt (${lang})`, () => {
      for (const id of ['open_to_work', 'role_fit'] as const) {
        const text = LOCAL_REPLIES[id][lang]
        assert.match(text, RWR_ELIGIBLE[lang])
        assert.doesNotMatch(text, RWR_POSSESSION_OVERCLAIM[lang])
      }
      const prompt = buildSystemPrompt({ lang, query: RWR_QUESTIONS[lang] })
      assert.ok(prompt.includes('[Austrian Work Authorization & Role Fit]'))
      assert.ok(prompt.includes('never claim he already holds or has been issued the card'))
      assert.ok(prompt.includes('rather than an already-issued card'))
      assert.deepEqual(unlisted(prompt), [])
    })
  }

  it('normalizes uppercase German ẞ (ROT-WEIẞ-ROT KARTE) when retrieving RWR guidance', () => {
    const prompt = buildSystemPrompt({ lang: 'de', query: 'Hat Ahmed die ROT-WEIẞ-ROT KARTE?' })
    assert.ok(prompt.includes('[Austrian Work Authorization & Role Fit]'))
    assert.ok(prompt.includes('never claim he already holds or has been issued the card'))
  })
})
