import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { blogPostsMeta } from '@/lib/blog-posts-meta'
import { KNOWLEDGE_CHUNKS } from '@/lib/genie/knowledge'
import { buildPromptFile, promptFileProblems, PROMPT_STATIC_ROUTES, type PromptFile } from '@/lib/genie/prompt-file'
import { fillPromptSlots } from '@/lib/genie/prompt-rules'
import { GENIE_VIEWPORT_SECTIONS, resolveSectionForPathname } from '@/lib/genie/prompts'
import { normalizePathname, retrieveKnowledgeChunks } from '@/lib/genie/retriever'

const file = buildPromptFile()

/** Fills each `{{slot}}` once, independently of the site's own helper. */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_m, name: string) => values[name])
}

function staticRoutesOnDisk(): string[] {
  const appDir = new URL('../../src/app/', import.meta.url)
  const routes: string[] = []
  for (const entry of readdirSync(appDir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || entry.name !== 'page.tsx') continue
    const dir = entry.parentPath.replace(/\\/g, '/').split('/src/app')[1] ?? ''
    if (dir.includes('[')) continue
    routes.push(dir === '' ? '/' : dir)
  }
  return routes.sort()
}

describe('Genie prompt file', () => {
  it('meets every contract rule', () => {
    assert.deepEqual(promptFileProblems(file), [])
  })

  it('flags a broken file', () => {
    const broken: PromptFile = structuredClone(file)
    broken.rules = broken.rules.replace('{{links}}', '{{other}}')
    broken.entries.push({ ...broken.entries[0] })
    broken.defaults.hero = ['no-such-entry']
    const problems = promptFileProblems(broken)
    assert.ok(problems.some((p) => p.includes('{{links}}')))
    assert.ok(problems.some((p) => p.includes('unknown slot {{other}}')))
    assert.ok(problems.some((p) => p.includes('IDs are not unique')))
    assert.ok(problems.some((p) => p.includes('unknown entry no-such-entry')))
  })

  it('publishes every knowledge entry without its retrieval keywords', () => {
    assert.deepEqual(
      file.entries.map((e) => e.id),
      KNOWLEDGE_CHUNKS.map((c) => c.id),
    )
    for (const entry of file.entries) {
      assert.deepEqual(Object.keys(entry).sort(), ['facts', 'id', 'links', 'sections', 'title'])
    }
  })

  it('lists every static route on disk, and each blog post', () => {
    assert.deepEqual([...PROMPT_STATIC_ROUTES].sort(), staticRoutesOnDisk())
    const expected = [...PROMPT_STATIC_ROUTES, ...blogPostsMeta.map((p) => `/blog/${p.slug}`)].map(
      (p) => normalizePathname(p) || '/',
    )
    assert.deepEqual([...file.paths].sort(), [...new Set(expected)].sort())
  })

  it('lists every section the chat panel can report', () => {
    for (const section of GENIE_VIEWPORT_SECTIONS) assert.ok(file.sections.includes(section), section)
    for (const path of file.paths) {
      const section = resolveSectionForPathname(path)
      if (section) assert.ok(file.sections.includes(section), `${path} -> ${section}`)
    }
  })

  it('gives each section the entries the site retrieves for an empty question', () => {
    for (const section of file.sections) {
      assert.deepEqual(
        file.defaults[section],
        retrieveKnowledgeChunks({ query: '', section, topK: 4 }).map((c) => c.id),
        section,
      )
    }
  })

  it('fills slots in one pass and never expands a value', () => {
    assert.equal(fillPromptSlots('a {{x}} b', { x: '{{y}}', y: 'no' }), 'a {{y}} b')
    assert.throws(() => fillPromptSlots('{{missing}}', {}), /missing/)
  })

  it('names the five site languages', () => {
    assert.deepEqual(file.languages, { en: 'English', de: 'German', fr: 'French', es: 'Spanish', ar: 'Arabic' })
  })

  it('rebuilds the recorded prompt text from the file', () => {
    const cases: { input: { lang: string; section: string; pathname: string }; entryIds: string[]; prompt: string }[] =
      JSON.parse(readFileSync(new URL('./fixtures/system-prompt-baseline.json', import.meta.url), 'utf8'))
    const byId = new Map(file.entries.map((e) => [e.id, e]))
    for (const { input, entryIds, prompt } of cases) {
      const entries = entryIds
        .map((id) => byId.get(id)!)
        .map((e) => fill(file.entryFormat, { title: e.title, facts: e.facts, links: e.links.join(', ') }))
        .join('\n')
      const composed = fill(file.rules, {
        language: file.languages[input.lang as keyof PromptFile['languages']],
        section: input.section,
        pathname: normalizePathname(input.pathname) || '/',
        entries,
        links: file.links,
      })
      const capped = composed.length <= file.maxChars ? composed : `${composed.slice(0, file.maxChars - 10)}…`
      assert.equal(capped, prompt, `${input.lang} ${input.section} ${input.pathname}`)
    }
  })
})
