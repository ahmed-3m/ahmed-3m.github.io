// The system prompt the Worker composes for a question asked on the site (spec 007 PR 4).
// The site retrieves the entry IDs; the Worker composes the prompt from the published
// prompt file. This joins the two for tests, where `buildSystemPrompt` used to.

import { buildPromptFile } from '@/lib/genie/prompt-file'
import { normalizePathname, retrieveKnowledgeChunks } from '@/lib/genie/retriever'
import type { Language } from '@/lib/i18n-config'
import { composePrompt } from '../../worker/lib/compose-prompt.js'

export interface SitePromptInput {
  lang: Language
  query: string
  history?: readonly { role: string; content: string }[]
  section?: string
  pathname?: string
}

const file = buildPromptFile()

/** The IDs the chat panel sends for this question, best first. */
export function siteEntryIds({ query, history = [], section = 'hero', pathname = '/' }: SitePromptInput): string[] {
  return retrieveKnowledgeChunks({ query, history, section, pathname, topK: 4 }).map((chunk) => chunk.id)
}

/** The prompt the Worker composes from the IDs and context the site sends. */
export function sitePrompt(input: SitePromptInput): string {
  const { lang, section = 'hero', pathname = '/' } = input
  return composePrompt(file, {
    entryIds: siteEntryIds(input),
    lang,
    section,
    pathname: normalizePathname(pathname) || '/',
  })
}
