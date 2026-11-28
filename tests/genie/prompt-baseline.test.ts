import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import type { Language } from '@/lib/i18n-config'
import { buildSystemPrompt } from '@/lib/genie/retriever'

// The fixture is today's prompt text, recorded before spec 007 moved the rules into a
// template (tasks T001). Moving the rules must not change a single character.
interface BaselineCase {
  input: {
    lang: Language
    query: string
    history?: { role: string; content: string }[]
    section: string
    pathname: string
  }
  entryIds: string[]
  prompt: string
}

const cases: BaselineCase[] = JSON.parse(
  readFileSync(new URL('./fixtures/system-prompt-baseline.json', import.meta.url), 'utf8'),
)

describe('Genie system prompt baseline', () => {
  it('has cases', () => {
    assert.ok(cases.length >= 9)
  })

  for (const [index, { input, prompt }] of cases.entries()) {
    it(`case ${index}: ${input.lang} ${input.section} ${input.pathname}`, () => {
      assert.equal(buildSystemPrompt(input), prompt)
    })
  }
})
