import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { buildPromptFile } from '@/lib/genie/prompt-file'
import { normalizePathname } from '@/lib/genie/retriever'
import type { Language } from '@/lib/i18n-config'
import { composePrompt } from '../../worker/lib/compose-prompt.js'
import { siteEntryIds, sitePrompt } from './site-prompt'

// The fixture is the prompt text recorded before spec 007 moved the rules into a
// template (tasks T001). Since PR 4 the Worker composes the prompt from the published
// file, and the site sends only the retrieved entry IDs. Neither may change a character.
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

const file = buildPromptFile()

describe('Genie system prompt baseline', () => {
  it('has cases', () => {
    assert.ok(cases.length >= 9)
  })

  for (const [index, { input, entryIds, prompt }] of cases.entries()) {
    describe(`case ${index}: ${input.lang} ${input.section} ${input.pathname}`, () => {
      it('composes the recorded prompt from the recorded entry IDs', () => {
        const composed = composePrompt(file, {
          entryIds,
          lang: input.lang,
          section: input.section,
          pathname: normalizePathname(input.pathname) || '/',
        })
        assert.equal(composed, prompt)
      })

      it('retrieves the recorded entry IDs on the site', () => {
        assert.deepEqual(siteEntryIds(input), entryIds)
      })

      it('gives the recorded prompt end to end', () => {
        assert.equal(sitePrompt(input), prompt)
      })
    })
  }
})
