import { languageName, type Language } from '@/lib/i18n-config'
import { KNOWLEDGE_CHUNKS, type KnowledgeChunk } from './knowledge'
import { ENTRY_FORMAT, PROMPT_RULES_TEMPLATE, capPrompt, fillPromptSlots, COMPACT_PUBLIC_LINKS } from './prompt-rules'

const ARABIC_DIACRITICS_RE = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/gu
const COMBINING_MARKS_RE = /[\u0300-\u036f]/gu
const NON_WORD_RE = /[^\p{L}\p{N}._-]+/gu

/**
 * Normalizes Latin (lowercase, accent-stripped) and Arabic (alif/ya/ta-marbuta
 * unification, diacritics/tatweel removed) text for cross-script matching.
 */
export function normalizeForSearch(input: string): string {
  return input
    .normalize('NFKD')
    .replace(COMBINING_MARKS_RE, '')
    .replace(ARABIC_DIACRITICS_RE, '')
    .replace(/[ßẞ]/gu, 'ss')
    .replace(/[أإآ]/gu, 'ا')
    .replace(/ى/gu, 'ي')
    .replace(/ة/gu, 'ه')
    .toLowerCase()
    .replace(NON_WORD_RE, ' ')
    .trim()
}

function tokenize(input: string): string[] {
  const normalized = normalizeForSearch(input)
  if (!normalized) return []
  const tokens = new Set<string>()
  for (const token of normalized.split(/\s+/)) {
    if (token.length < 2) continue
    tokens.add(token)
    if (token.length > 5 && token.endsWith('ies')) {
      tokens.add(`${token.slice(0, -3)}y`)
    } else if (token.length > 4 && token.endsWith('s') && !token.endsWith('ss')) {
      tokens.add(token.slice(0, -1))
    }
  }
  return Array.from(tokens)
}

const HIGH_SIGNAL_TERMS = [
  'svhn',
  'cifar',
  'cifar100',
  'places365',
  'fashionmnist',
  'textures',
  'fpr95',
  'k-ablation',
  'ablation',
  'lambda',
  'mergeproof',
  'sihem',
  'failover',
  'blog',
  'news',
  'rwr',
  'visa',
  'permit',
  'yolov8',
  'profactor',
  'fti_zer0p',
  'holm',
  'pgvector',
  'arbiter',
  'calendly',
] as const

const CORE_FALLBACK_IDS = [
  'profile-experience',
  'diffusion-headline',
  'sihem-overview',
  'contact-frontdesk-profiles',
] as const

export interface RetrieveOptions {
  query: string
  history?: readonly { role: string; content: string }[]
  section?: string
  pathname?: string
  topK?: number
}

export function normalizePathname(pathname?: string): string {
  if (!pathname) return ''
  const trimmed = pathname.trim().replace(/\/+$/, '')
  return trimmed || '/'
}

function matchesSectionAffinity(chunk: KnowledgeChunk, section: string, normPath: string): boolean {
  if (section && chunk.sections.includes(section)) return true
  if (normPath) {
    if (chunk.sections.includes(normPath)) return true
    if (normPath.startsWith('/blog/') && chunk.sections.includes('/blog')) return true
    if (normPath.startsWith('/case-studies/sihem') && chunk.sections.includes('/case-studies/sihem')) return true
    if (normPath.startsWith('/case-studies/diffusion-ood') && chunk.sections.includes('/case-studies/diffusion-ood')) return true
    if (normPath.startsWith('/case-studies/inkjet-ood') && chunk.sections.includes('/case-studies/inkjet-ood')) return true
  }
  return false
}

export function retrieveKnowledgeChunks({
  query,
  history = [],
  section = 'hero',
  pathname = '/',
  topK = 4,
}: RetrieveOptions): KnowledgeChunk[] {
  const normQuery = normalizeForSearch(query)
  const queryTokens = tokenize(query)
  // Recent conversation context preserves active topic on follow-ups (e.g. "How does it store memories?")
  // while keeping the latest question dominant and strictly selecting static verified chunks.
  const recentHistoryText = history
    .slice(-4)
    .map((entry) => entry.content)
    .join(' ')
  const normHistory = normalizeForSearch(recentHistoryText)
  const historyTokens = tokenize(recentHistoryText)
  const normPath = normalizePathname(pathname)

  const scored = KNOWLEDGE_CHUNKS.map((chunk, index) => {
    let lexicalScore = 0
    const normTitle = normalizeForSearch(chunk.title)
    const normFacts = normalizeForSearch(chunk.facts)
    const titleTokens = new Set(tokenize(chunk.title))
    const factTokens = new Set(tokenize(chunk.facts))

    for (const kw of chunk.keywords) {
      const normKw = normalizeForSearch(kw)
      if (!normKw) continue
      if (normKw.includes(' ')) {
        if (normQuery.includes(normKw)) lexicalScore += 5
        else if (normHistory.includes(normKw)) lexicalScore += 2
      } else if (queryTokens.includes(normKw)) {
        lexicalScore += HIGH_SIGNAL_TERMS.includes(normKw as (typeof HIGH_SIGNAL_TERMS)[number]) ? 6 : 4
      } else if (normKw.length >= 4 && normQuery.includes(normKw)) {
        lexicalScore += 3
      } else if (historyTokens.includes(normKw)) {
        lexicalScore += HIGH_SIGNAL_TERMS.includes(normKw as (typeof HIGH_SIGNAL_TERMS)[number]) ? 3 : 1.5
      }
    }

    for (const token of queryTokens) {
      if (titleTokens.has(token)) {
        lexicalScore += 3
      } else if (normTitle.includes(token) && token.length >= 4) {
        lexicalScore += 1.5
      }
      if (factTokens.has(token)) {
        lexicalScore += 1.5
      } else if (normFacts.includes(token) && token.length >= 5) {
        lexicalScore += 0.75
      }
    }

    for (const token of historyTokens) {
      if (titleTokens.has(token)) {
        lexicalScore += 1
      } else if (factTokens.has(token) && HIGH_SIGNAL_TERMS.includes(token as (typeof HIGH_SIGNAL_TERMS)[number])) {
        lexicalScore += 1
      }
    }

    const affinityBoost = matchesSectionAffinity(chunk, section, normPath) ? 3 : 0
    return {
      chunk,
      index,
      lexicalScore,
      totalScore: lexicalScore + affinityBoost,
    }
  })

  const maxLexical = Math.max(...scored.map((item) => item.lexicalScore))
  scored.sort((a, b) => b.totalScore - a.totalScore || a.index - b.index)

  if (maxLexical <= 0) {
    const selected: KnowledgeChunk[] = []
    const seen = new Set<string>()

    for (const item of scored) {
      if (item.totalScore > 0 && selected.length < topK) {
        selected.push(item.chunk)
        seen.add(item.chunk.id)
      }
    }

    for (const fallbackId of CORE_FALLBACK_IDS) {
      if (selected.length >= topK) break
      if (seen.has(fallbackId)) continue
      const found = KNOWLEDGE_CHUNKS.find((chunk) => chunk.id === fallbackId)
      if (found) {
        selected.push(found)
        seen.add(found.id)
      }
    }

    return selected.slice(0, topK)
  }

  return scored.slice(0, topK).map((item) => item.chunk)
}

export interface BuildSystemPromptOptions {
  lang: Language
  query: string
  history?: readonly { role: string; content: string }[]
  section?: string
  pathname?: string
}

export function buildSystemPrompt({
  lang,
  query,
  history = [],
  section = 'hero',
  pathname = '/',
}: BuildSystemPromptOptions): string {
  const chunks = retrieveKnowledgeChunks({ query, history, section, pathname, topK: 4 })
  const entries = chunks
    .map((chunk) =>
      fillPromptSlots(ENTRY_FORMAT, { title: chunk.title, facts: chunk.facts, links: chunk.links.join(', ') }),
    )
    .join('\n')

  return capPrompt(
    fillPromptSlots(PROMPT_RULES_TEMPLATE, {
      language: languageName[lang],
      section,
      pathname: normalizePathname(pathname) || '/',
      entries,
      links: COMPACT_PUBLIC_LINKS,
    }),
  )
}
