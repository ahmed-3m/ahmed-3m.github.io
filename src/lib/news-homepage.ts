import { type Language } from '@/lib/i18n-config'
import type { NewsCategory } from '@/lib/news'
import raw from './news-homepage.json' with { type: 'json' }

/**
 * Homepage news accessors.
 *
 * `news-homepage.json` is generated at build time by `tools/emit-homepage-news.mjs`
 * (the npm `prebuild` step) and holds only the newest 3 items, so the homepage does
 * not bundle the full catalog in `@/lib/news-items`. Do not edit the JSON by hand —
 * run `node tools/emit-homepage-news.mjs`. The /news page keeps using the full
 * catalog via `@/lib/news-items`.
 */

/** Shape shared by the localized headline/take fields (same as `LocalizedText`). */
export type HomepageNewsText = { en: string } & Partial<Record<Exclude<Language, 'en'>, string>>

export type HomepageNewsItem = {
  id: string
  date: string
  category: NewsCategory
  headline: HomepageNewsText
  source: string
  url: string
  take: HomepageNewsText
  tags?: readonly string[]
}

export interface LocalizedHomepageNewsItem extends Omit<HomepageNewsItem, 'take' | 'headline'> {
  /** Take resolved for the requested language (falls back to English). */
  take: string
  /** Headline resolved for the requested language (falls back to English). */
  headline: string
}

/** Category labels for the homepage chips — mirrors `newsCategoryLabels`. */
export const homepageCategoryLabels: Record<
  NewsCategory,
  { en: string; de: string; fr: string; es: string; ar: string }
> = raw.labels

// The generator mirrors `newsItems` (which `parseNewsItems` validates) and narrows
// the category; this is the only runtime check the generated file needs.
const homepageNews: readonly HomepageNewsItem[] = raw.items.map((item) => {
  if (item.category !== 'ai' && item.category !== 'agentic') {
    throw new Error(
      `news-homepage.json: item "${item.id}" has category "${item.category}" — ` +
        'regenerate with `node tools/emit-homepage-news.mjs`.',
    )
  }
  return { ...item, category: item.category }
})

function localizeHomepageNewsItem(item: HomepageNewsItem, lang: Language): LocalizedHomepageNewsItem {
  const { take, headline, ...rest } = item
  return { ...rest, take: take[lang] ?? take.en, headline: headline[lang] ?? headline.en }
}

/** Homepage items, newest first (already capped at 3 at build time). */
export function getHomepageNews(lang: Language = 'en'): LocalizedHomepageNewsItem[] {
  return homepageNews.map((item) => localizeHomepageNewsItem(item, lang))
}
