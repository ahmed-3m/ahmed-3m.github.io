import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { CHAT_COPY } from '@/components/chatbot-dictionaries'
import {
  FOLLOWUP_PROMPTS,
  LOCAL_REPLIES,
  PROMPT_LIBRARY,
  ROUTE_SECTIONS,
  STARTER_PROMPT_IDS,
  getStarterPrompts,
  routeLocally,
  showsHandoff,
} from '@/lib/genie/prompts'
import { languageOptions } from '@/lib/i18n-config'

const LOCALES = ['en', 'de', 'fr', 'es', 'ar'] as const
const withoutUrls = (text: string) => text.replace(/https?:\/\/\S+/g, '')

describe('copy parity', () => {
  const tables = { PROMPT_LIBRARY, LOCAL_REPLIES, CHAT_COPY } as Record<string, Record<string, Record<string, string>>>

  it('covers the site languages', () => {
    assert.deepEqual(languageOptions.map((o) => o.code).sort(), [...LOCALES].sort())
  })

  for (const [table, entries] of Object.entries(tables)) {
    it(`${table} has non-empty text in all 5 languages`, () => {
      for (const [id, map] of Object.entries(entries)) {
        for (const locale of LOCALES) {
          assert.ok(typeof map[locale] === 'string' && map[locale].trim().length > 0, `${table}.${id}.${locale}`)
        }
      }
    })
  }

  it('local replies never contain the retired email address', () => {
    for (const [id, map] of Object.entries(LOCAL_REPLIES)) {
      for (const locale of LOCALES) {
        assert.ok(!map[locale].includes('ahmed.mu.0905'), `LOCAL_REPLIES.${id}.${locale}`)
      }
    }
  })

  it('German and French replies use decimal commas and a spaced percent sign', () => {
    for (const [id, map] of Object.entries(LOCAL_REPLIES)) {
      for (const locale of ['de', 'fr'] as const) {
        const text = withoutUrls(map[locale])
        assert.ok(!/\d\.\d/.test(text) && !/\d%/.test(text), `LOCAL_REPLIES.${id}.${locale}: ${map[locale]}`)
      }
    }
  })
})

describe('starter and follow-up prompts', () => {
  it('has four valid starter prompts', () => {
    assert.equal(STARTER_PROMPT_IDS.length, 4)
    for (const id of STARTER_PROMPT_IDS) assert.ok(id in PROMPT_LIBRARY, id)
  })

  it('maps every route to a section', () => {
    for (const [route, section] of Object.entries(ROUTE_SECTIONS)) {
      assert.ok(typeof section === 'string' && section.length > 0, route)
    }
  })

  it('picks starter prompts for the page being read', () => {
    assert.deepEqual(getStarterPrompts('/blog/ood-diffusion-thesis'), [
      'guardrails_post',
      'thesis_loss',
      'industrial_pipeline',
      'mergeproof_overview',
    ])
    assert.deepEqual(getStarterPrompts('/news'), ['mergeproof_overview', 'sihem_overview', 'tech_stack', 'open_to_work'])
    assert.deepEqual(getStarterPrompts('/case-studies/sihem'), ['sihem_overview', 'sihem_tech', 'guardrails_post', 'contact'])
    assert.deepEqual(getStarterPrompts('about'), ['background', 'tech_stack', 'open_to_work', 'cv'])
    assert.deepEqual(getStarterPrompts('projects'), [
      'projects_best',
      'mergeproof_overview',
      'sihem_overview',
      'industrial_pipeline',
    ])
  })

  it('only offers follow-ups that exist', () => {
    for (const [replyId, followUps] of Object.entries(FOLLOWUP_PROMPTS)) {
      assert.ok(replyId in LOCAL_REPLIES, replyId)
      for (const promptId of followUps ?? []) assert.ok(promptId in PROMPT_LIBRARY, `${replyId} -> ${promptId}`)
    }
  })
})

describe('routeLocally', () => {
  const cases: [string, 'fast' | 'deep'][] = [
    ['Explain how separation loss works', 'deep'],
    ['Warum funktioniert Separation Loss?', 'deep'],
    ['Comment fonctionne Sihem ?', 'deep'],
    ['¿Por qué usar difusión?', 'deep'],
    ['كيف يعمل محرك Sihem؟', 'deep'],
    ['Where is his CV?', 'fast'],
    ['Wo ist sein Lebenslauf?', 'fast'],
    ['Où est son CV ?', 'fast'],
    ['¿Cuál es su stack?', 'fast'],
    ['ما أفضل نتيجة AUROC؟', 'fast'],
  ]
  for (const [query, lane] of cases) {
    it(`sends "${query}" to the ${lane} lane`, () => {
      assert.equal(routeLocally(query), lane)
    })
  }
})

describe('showsHandoff', () => {
  it('offers the hand-off row after contact, CV and hiring questions', () => {
    for (const question of [
      String(PROMPT_LIBRARY.contact.en),
      String(PROMPT_LIBRARY.cv.de),
      String(PROMPT_LIBRARY.open_to_work.fr),
      String(PROMPT_LIBRARY.hire_fit.ar),
      String(PROMPT_LIBRARY.frontdesk_demo.es),
      'How can I reach him?',
      'Where can I download his resume?',
    ]) {
      assert.equal(showsHandoff(question), true, question)
    }
  })

  it('does not offer it after research or project questions', () => {
    for (const question of [String(PROMPT_LIBRARY.thesis_summary.en), String(PROMPT_LIBRARY.projects_best.en), 'What is CIFAR-10?', '']) {
      assert.equal(showsHandoff(question), false, question)
    }
  })
})
