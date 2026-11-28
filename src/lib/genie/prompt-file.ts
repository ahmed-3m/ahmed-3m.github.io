import { blogPostsMeta } from '@/lib/blog-posts-meta'
import { languageName, languageOptions, type Language } from '@/lib/i18n-config'
import { KNOWLEDGE_CHUNKS } from './knowledge'
import {
  COMPACT_PUBLIC_LINKS,
  ENTRY_FORMAT,
  ENTRY_SLOTS,
  PROMPT_MAX_CHARS,
  PROMPT_RULES_TEMPLATE,
  PROMPT_SLOTS,
} from './prompt-rules'
import { GENIE_VIEWPORT_SECTIONS, resolveSectionForPathname } from './prompts'
import { normalizePathname, retrieveKnowledgeChunks } from './retriever'

/**
 * The published Genie prompt file (`/genie/prompt.json`, spec 007 FR-001). In later spec
 * 007 PRs the chat Worker composes the system prompt from it, so a client can pick
 * published entries, a language and a listed page context, but cannot send prompt text.
 * Contract: specs/007-worker-hardening/contracts/prompt-file.md.
 */

export interface PromptFileEntry {
  id: string
  title: string
  facts: string
  links: string[]
  sections: string[]
}

export interface PromptFile {
  version: 1
  maxChars: number
  rules: string
  entryFormat: string
  links: string
  languages: Record<Language, string>
  entries: PromptFileEntry[]
  sections: string[]
  paths: string[]
  defaults: Record<string, string[]>
}

/** Static routes under `src/app`. A test keeps this list equal to the pages on disk. */
export const PROMPT_STATIC_ROUTES = [
  '/',
  '/about',
  '/blog',
  '/case-studies/diffusion-ood',
  '/case-studies/inkjet-ood',
  '/case-studies/sihem',
  '/impressum',
  '/news',
  '/privacy',
  '/research',
] as const

/** Default entries per section: what the site retrieves for an empty question. */
const DEFAULT_TOP_K = 4

export function promptFilePaths(): string[] {
  const paths = [...PROMPT_STATIC_ROUTES, ...blogPostsMeta.map((post) => `/blog/${post.slug}`)]
  return unique(paths.map((path) => normalizePathname(path) || '/'))
}

export function promptFileSections(paths: readonly string[] = promptFilePaths()): string[] {
  const routeSections = paths.map((path) => resolveSectionForPathname(path)).filter((s): s is string => !!s)
  return unique([...GENIE_VIEWPORT_SECTIONS, ...routeSections])
}

export function buildPromptFile(): PromptFile {
  const paths = promptFilePaths()
  const sections = promptFileSections(paths)
  const defaults = Object.fromEntries(
    sections.map((section) => [
      section,
      retrieveKnowledgeChunks({ query: '', section, topK: DEFAULT_TOP_K }).map((chunk) => chunk.id),
    ]),
  )
  const languages = Object.fromEntries(
    languageOptions.map(({ code }) => [code, languageName[code]]),
  ) as Record<Language, string>

  const file: PromptFile = {
    version: 1,
    maxChars: PROMPT_MAX_CHARS,
    rules: PROMPT_RULES_TEMPLATE,
    entryFormat: ENTRY_FORMAT,
    links: COMPACT_PUBLIC_LINKS,
    languages,
    entries: KNOWLEDGE_CHUNKS.map(({ id, title, facts, links, sections: entrySections }) => ({
      id,
      title,
      facts,
      links: [...links],
      sections: [...entrySections],
    })),
    sections,
    paths,
    defaults,
  }

  const problems = promptFileProblems(file)
  if (problems.length) throw new Error(`Invalid Genie prompt file:\n- ${problems.join('\n- ')}`)
  return file
}

/** Contract rules 1–7. Returns one message per broken rule; empty when the file is valid. */
export function promptFileProblems(file: PromptFile): string[] {
  const problems: string[] = []
  if (file.version !== 1) problems.push('version is not 1')

  const slotCounts = (text: string) => {
    const counts = new Map<string, number>()
    for (const match of text.matchAll(/\{\{(\w+)\}\}/g)) counts.set(match[1], (counts.get(match[1]) ?? 0) + 1)
    return counts
  }
  const checkSlots = (label: string, text: string, expected: readonly string[]) => {
    const counts = slotCounts(text)
    for (const slot of expected) {
      if (counts.get(slot) !== 1) problems.push(`${label} must contain {{${slot}}} exactly once`)
    }
    for (const slot of counts.keys()) {
      if (!expected.includes(slot)) problems.push(`${label} has an unknown slot {{${slot}}}`)
    }
  }
  checkSlots('rules', file.rules, PROMPT_SLOTS)
  checkSlots('entryFormat', file.entryFormat, ENTRY_SLOTS)

  const ids = file.entries.map((entry) => entry.id)
  const titles = file.entries.map((entry) => entry.title)
  if (new Set(ids).size !== ids.length) problems.push('entry IDs are not unique')
  if (new Set(titles).size !== titles.length) problems.push('entry titles are not unique')

  if (!file.sections.includes('hero')) problems.push('sections must include hero')
  if (!file.paths.includes('/')) problems.push('paths must include /')

  const idSet = new Set(ids)
  for (const key of Object.keys(file.defaults)) {
    if (!file.sections.includes(key)) problems.push(`defaults has a key that is not a section: ${key}`)
  }
  for (const section of file.sections) {
    const list = file.defaults[section]
    if (!list) {
      problems.push(`section ${section} has no defaults`)
      continue
    }
    if (list.length > DEFAULT_TOP_K) problems.push(`defaults for ${section} list more than ${DEFAULT_TOP_K} IDs`)
    for (const id of list) if (!idSet.has(id)) problems.push(`defaults for ${section} name an unknown entry ${id}`)
  }

  const expectedLanguages = languageOptions.map(({ code }) => code)
  const languageKeys = Object.keys(file.languages)
  for (const code of expectedLanguages) {
    if (!file.languages[code]) problems.push(`languages is missing ${code}`)
  }
  for (const key of languageKeys) {
    if (!expectedLanguages.includes(key as Language)) problems.push(`languages has an unknown key ${key}`)
  }
  return problems
}

function unique(values: readonly string[]): string[] {
  return Array.from(new Set(values))
}
