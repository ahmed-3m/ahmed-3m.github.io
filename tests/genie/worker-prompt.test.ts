import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import type { Language } from '@/lib/i18n-config'
import { buildPromptFile, type PromptFile } from '@/lib/genie/prompt-file'
import { normalizePathname } from '@/lib/genie/retriever'
import { composePrompt, selectEntries } from '../../worker/lib/compose-prompt.js'
import { validatePromptFile } from '../../worker/lib/prompt-source.js'
import bundle from '../../worker/prompt-bundle.js'

// Spec 007 T014: the Worker's composer and its bundled copy of the prompt file.

interface BaselineCase {
  input: {
    lang: Language
    query: string
    history?: { role: 'user' | 'assistant'; content: string }[]
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

/** A copy of the file whose first entry has the given facts. */
function withFacts(facts: string): PromptFile {
  const copy = structuredClone(file)
  copy.entries[0].facts = facts
  return copy
}

describe('Worker prompt bundle', () => {
  it('equals buildPromptFile()', () => {
    assert.deepEqual(
      bundle,
      file,
      'worker/prompt-bundle.js is out of date with the site. Run `npm run genie:worker-prompt` and commit the result.',
    )
  })

  it('passes the Worker shape check', () => {
    assert.deepEqual(validatePromptFile(bundle), [])
  })
})

describe('Worker composePrompt', () => {
  for (const [index, { input, entryIds, prompt }] of cases.entries()) {
    it(`composes the recorded prompt for case ${index}: ${input.lang} ${input.section} ${input.pathname}`, () => {
      const composed = composePrompt(file, {
        entryIds,
        lang: input.lang,
        section: input.section,
        pathname: normalizePathname(input.pathname) || '/',
      })
      assert.equal(composed, prompt)
    })
  }

  it('inserts slot-like text in an entry as written', () => {
    const facts = 'Planted {{entries}} and {{links}} and {{language}} and $& text.'
    const id = file.entries[0].id
    const composed = composePrompt(withFacts(facts), { entryIds: [id], section: 'hero', pathname: '/' })
    assert.ok(composed.includes(`[${file.entries[0].title}] ${facts} Links:`))
    assert.equal(composed.split('Allowlisted public links:').length, 2)
  })

  it('cuts a prompt over maxChars to maxChars - 10 characters and an ellipsis', () => {
    const long = withFacts('x'.repeat(9_000))
    const composed = composePrompt(long, { entryIds: [long.entries[0].id] })
    assert.equal(composed.length, file.maxChars - 9)
    assert.ok(composed.endsWith('…'))
    const uncut = composePrompt({ ...long, maxChars: 100_000 }, { entryIds: [long.entries[0].id] })
    assert.equal(composed, `${uncut.slice(0, file.maxChars - 10)}…`)
  })

  it('corrects an unknown language, section and path', () => {
    const composed = composePrompt(file, { lang: 'xx', section: 'nowhere', pathname: '/nowhere', entryIds: [] })
    assert.ok(composed.includes('(or English if unclear)'))
    assert.ok(composed.includes('Active page context: section="hero", pathname="/"'))
  })
})

describe('Worker selectEntries', () => {
  const ids = file.entries.map((entry) => entry.id)

  it('drops unknown and repeated IDs and keeps the order asked', () => {
    const chosen = selectEntries(file, ['nope', ids[2], ids[0], ids[2]], 'hero').map((entry: { id: string }) => entry.id)
    assert.deepEqual(chosen, [ids[2], ids[0]])
  })

  it('keeps at most four', () => {
    assert.equal(selectEntries(file, ids.slice(0, 6), 'hero').length, 4)
  })

  it('uses the section defaults when none remain', () => {
    for (const section of ['hero', 'research']) {
      const chosen = selectEntries(file, ['nope'], section).map((entry: { id: string }) => entry.id)
      assert.deepEqual(chosen, file.defaults[section])
    }
    assert.deepEqual(
      selectEntries(file, [], 'hero').map((entry: { id: string }) => entry.id),
      file.defaults.hero,
    )
  })
})
