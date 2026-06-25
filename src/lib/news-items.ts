import { type Language } from '@/lib/i18n-config'

/**
 * News data.
 *
 * This file is intentionally a plain, strongly-typed data module so it can be
 * updated safely by an automated agent. See AGENTS.md -> "News update protocol"
 * for the rules an agent MUST follow when adding items.
 *
 * Quick contract:
 *  - Append new objects to the `newsItems` array. Do not reorder (sorting is done
 *    at read time by date, newest first).
 *  - `id` must be unique and stable (kebab-case). Never reuse an id.
 *  - `category` is exactly 'ai' or 'agentic'. Use 'agentic' for autonomous agents,
 *    tool-use, multi-agent systems, agent frameworks/protocols; 'ai' for everything else.
 *  - `take.en` is required (Ahmed's 1-2 sentence editorial take). Other languages
 *    are optional and fall back to English automatically.
 *  - `url` must be the canonical source link. `date` is ISO 'YYYY-MM-DD'.
 */

export type NewsCategory = 'ai' | 'agentic'

export interface NewsItem {
  /** Unique, stable, kebab-case identifier. Never reuse. */
  id: string
  /** Publication date, ISO 'YYYY-MM-DD'. */
  date: string
  /** 'agentic' for agent/tool-use/multi-agent topics; 'ai' otherwise. */
  category: NewsCategory
  /** The news headline (kept in the source language, usually English). */
  headline: string
  /** Outlet / publisher name, e.g. 'Anthropic', 'arXiv', 'The Verge'. */
  source: string
  /** Canonical link to the source. */
  url: string
  /** Editorial take. `en` required; other languages optional (fall back to en). */
  take: Partial<Record<Language, string>> & { en: string }
  /** Optional free-form tags shown as chips. */
  tags?: string[]
}

export interface LocalizedNewsItem extends Omit<NewsItem, 'take'> {
  /** Take resolved for the requested language (falls back to English). */
  take: string
}

/**
 * Seed examples — real, pre-existing developments that demonstrate the format.
 * An automated agent should keep this list current; these can be replaced once
 * fresher items exist.
 */
const newsItems: NewsItem[] = [
  {
    id: 'mcp-open-standard',
    date: '2024-11-25',
    category: 'agentic',
    headline: 'Anthropic open-sources the Model Context Protocol (MCP)',
    source: 'Anthropic',
    url: 'https://modelcontextprotocol.io',
    take: {
      en: 'A shared protocol for connecting models to tools and data is exactly the missing plumbing agentic systems needed. Standardising the integration layer is what turns one-off demos into composable agents.',
    },
    tags: ['MCP', 'Tool use', 'Standards'],
  },
  {
    id: 'computer-use-capability',
    date: '2024-10-22',
    category: 'agentic',
    headline: 'Claude gains computer-use: controlling a screen like a person',
    source: 'Anthropic',
    url: 'https://www.anthropic.com/news/3-5-models-and-computer-use',
    take: {
      en: 'Letting a model click, type and read the screen collapses the gap between "answer" and "action". The interesting frontier now is reliability and verification, not whether agents can act at all.',
    },
    tags: ['Computer use', 'Agents'],
  },
  {
    id: 'agent-reliability-bottleneck',
    date: '2025-01-15',
    category: 'agentic',
    headline: 'The bottleneck for agentic AI is reliability, not capability',
    source: 'Editorial',
    url: 'https://www.anthropic.com/research',
    take: {
      en: 'From building production CV and OOD systems, my read is the same for agents: the hard part is knowing when the system is wrong. Out-of-distribution detection and verification matter more for autonomous agents than another point of benchmark accuracy.',
    },
    tags: ['Reliability', 'Evaluation', 'OOD'],
  },
]

/**
 * Build-time guard. Runs once when the module is first imported (during
 * `next build` / static generation), so a malformed agent edit fails the build
 * instead of shipping. Keep these rules in sync with AGENTS.md.
 */
function validateNewsItems(items: NewsItem[]): void {
  const seen = new Set<string>()
  const isoDate = /^\d{4}-\d{2}-\d{2}$/
  for (const item of items) {
    const where = `news item "${item.id || '(missing id)'}"`
    if (!item.id || !/^[a-z0-9-]+$/.test(item.id)) throw new Error(`${where}: id must be non-empty kebab-case`)
    if (seen.has(item.id)) throw new Error(`${where}: duplicate id`)
    seen.add(item.id)
    if (item.category !== 'ai' && item.category !== 'agentic') throw new Error(`${where}: category must be 'ai' or 'agentic'`)
    if (!isoDate.test(item.date) || Number.isNaN(new Date(item.date).getTime())) throw new Error(`${where}: date must be a valid 'YYYY-MM-DD'`)
    if (!item.headline?.trim()) throw new Error(`${where}: headline is required`)
    if (!item.source?.trim()) throw new Error(`${where}: source is required`)
    if (!/^https?:\/\//.test(item.url)) throw new Error(`${where}: url must be an absolute http(s) link`)
    if (!item.take?.en?.trim()) throw new Error(`${where}: take.en is required`)
  }
}

validateNewsItems(newsItems)

export const newsCategoryLabels: Record<NewsCategory, { en: string; de: string; fr: string; es: string; ar: string }> = {
  ai: { en: 'AI', de: 'KI', fr: 'IA', es: 'IA', ar: 'الذكاء الاصطناعي' },
  agentic: { en: 'Agentic AI', de: 'Agentische KI', fr: 'IA agentique', es: 'IA agentica', ar: 'الذكاء الاصطناعي الوكيل' },
}

function localizeNewsItem(item: NewsItem, lang: Language): LocalizedNewsItem {
  const { take, ...rest } = item
  return { ...rest, take: take[lang] ?? take.en }
}

/** All items, newest first. */
export function getAllNews(lang: Language = 'en'): LocalizedNewsItem[] {
  return [...newsItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((item) => localizeNewsItem(item, lang))
}

/** Items in a single category, newest first. */
export function getNewsByCategory(category: NewsCategory, lang: Language = 'en'): LocalizedNewsItem[] {
  return getAllNews(lang).filter((item) => item.category === category)
}

/** Raw items (unsorted, untranslated) — for tooling/validation. */
export function getRawNews(): NewsItem[] {
  return newsItems
}
