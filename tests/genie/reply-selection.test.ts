// Characterization tests: they pin how Genie picks a prepared reply and its follow-ups
// today, so moving code around (PR 4) cannot change behaviour unnoticed. Some pinned
// results are known quirks; change them only together with the behaviour.

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  LOCAL_REPLIES,
  PROMPT_LIBRARY,
  REPLY_FOR_PROMPT,
  findCuratedTopic,
  getLocalReply,
  inferReplyId,
  pickFollowUpIds,
  type PromptId,
} from '@/lib/genie/prompts'

describe('findCuratedTopic', () => {
  it('maps every suggested-question label, in every language, to its reply', () => {
    for (const [id, labels] of Object.entries(PROMPT_LIBRARY)) {
      for (const label of Object.values(labels)) {
        assert.equal(findCuratedTopic(label), REPLY_FOR_PROMPT[id as PromptId], `${id}: ${label}`)
      }
    }
  })

  it('answers short CV, contact and case-study requests directly', () => {
    for (const q of ['Download his CV', 'cv', 'Lebenslauf', '¿Currículum?']) assert.equal(findCuratedTopic(q), 'cv', q)
    for (const q of ['How can I contact Ahmed?', 'Kontakt']) assert.equal(findCuratedTopic(q), 'contact', q)
    assert.equal(findCuratedTopic('case studies'), 'projects')
  })

  it('leaves open questions to the model', () => {
    for (const q of ['Is he available Tuesday?', 'Tell me about mergeproof', 'What AUROC on CIFAR-10?', 'Tell me a joke']) {
      assert.equal(findCuratedTopic(q), undefined, q)
    }
  })
})

describe('getLocalReply (offline and fallback answers)', () => {
  const cases: [string, keyof typeof LOCAL_REPLIES | null][] = [
    ['Tell me about mergeproof', 'mergeproof'],
    ['What is Sihem?', 'sihem_intro'],
    ['Why use diffusion for OOD?', 'thesis_diffusion'],
    ['What is the separation loss innovation?', 'thesis_method'],
    ['What AUROC on CIFAR-10?', 'thesis'],
    ['Was ist sein Tech-Stack?', 'tech_stack'],
    ['what roles fit him', 'role_fit'],
    ['His background?', 'background'],
    ['industrial inkjet results', 'industrial'],
    // Known quirk: keyword matching answers a scheduling question with the
    // open-to-work reply. PR 6 labels such fallback answers.
    ['Is he available Tuesday?', 'open_to_work'],
    ['Tell me a joke', null],
  ]
  for (const [question, replyId] of cases) {
    it(`"${question}" -> ${replyId ?? 'no prepared reply'}`, () => {
      const expected = replyId ? LOCAL_REPLIES[replyId] : null
      for (const lang of ['en', 'de', 'ar'] as const) {
        assert.equal(getLocalReply(question, lang), expected ? expected[lang] : null, lang)
      }
    })
  }

  it('infers no topic for small talk', () => {
    assert.equal(inferReplyId('Tell me a joke'), undefined)
  })
})

describe('pickFollowUpIds', () => {
  const cases: [string, PromptId[]][] = [
    ['Download his CV', ['background', 'open_to_work', 'contact']],
    ['How can I contact Ahmed?', ['cv', 'projects_best', 'open_to_work']],
    ['Tell me about mergeproof', ['guardrails_post', 'projects_best', 'tech_stack']],
    ['What is the separation loss innovation?', ['thesis_results', 'thesis_datasets', 'industrial_result']],
    ['Is he available Tuesday?', ['hire_fit', 'cv', 'contact']],
    // No topic in the question or reply: fall back to the section's starter prompts.
    ['Tell me a joke', ['projects_best', 'thesis_results', 'sihem_overview']],
    ['Kontakt', ['projects_best', 'thesis_results', 'sihem_overview']],
  ]
  for (const [question, expected] of cases) {
    it(`after "${question}"`, () => {
      assert.deepEqual(pickFollowUpIds('', question, 'hero'), expected)
    })
  }

  it('never suggests the question that was just asked, and offers at most three', () => {
    for (const id of Object.keys(PROMPT_LIBRARY) as PromptId[]) {
      const followUps = pickFollowUpIds('', PROMPT_LIBRARY[id].en, 'hero')
      assert.ok(followUps.length <= 3, id)
      assert.ok(!followUps.includes(id), id)
      assert.ok(followUps.every((f) => REPLY_FOR_PROMPT[f] !== REPLY_FOR_PROMPT[id]), id)
    }
  })

  it('uses the reply text when the question has no topic', () => {
    assert.deepEqual(pickFollowUpIds('mergeproof blocks risky merges', 'Tell me more', 'hero'), [
      'guardrails_post',
      'projects_best',
      'tech_stack',
    ])
  })
})
