import { type Language } from '@/lib/i18n-config'
import { parseNewsItems, type NewsItem, type NewsCategory } from '@/lib/news'
import raw from './news-items.json' with { type: 'json' }

export type { NewsItem, NewsCategory }

/**
 * News catalog accessors.
 *
 * Content lives in `src/lib/news-items.json`. `parseNewsItems` is the only way
 * to obtain `NewsItem[]` — do not validate-then-cast. Agents emit a JSON delta
 * on stdout; they do not edit this TypeScript module. See AGENTS.md.
 */

export interface LocalizedNewsItem extends Omit<NewsItem, 'take'> {
  /** Take resolved for the requested language (falls back to English). */
  take: string
}

const newsItems = parseNewsItems(raw)

export const newsCategoryLabels: Record<NewsCategory, { en: string; de: string; fr: string; es: string; ar: string }> = {
  ai: { en: 'AI', de: 'KI', fr: 'IA', es: 'IA', ar: 'الذكاء الاصطناعي' },
  agentic: { en: 'Agentic AI', de: 'Agentische KI', fr: 'IA agentique', es: 'IA agéntica', ar: 'الذكاء الاصطناعي الوكيل' },
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

/** Raw items (unsorted, untranslated) — the parsed catalog, for tooling/validation. */
export function getRawNews(): readonly NewsItem[] {
  return newsItems
}
