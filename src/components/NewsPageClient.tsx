'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Calendar, Search, X } from 'lucide-react'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { languageLocale } from '@/lib/i18n-config'
import {
  canonicalizeNewsFilterSearch,
  parseNewsFilterSearch,
  serializeNewsFilterSearch,
  type NewsFilterCategory,
} from '@/lib/news-filter-url'
import { getAllNews, newsCategoryLabels } from '@/lib/news-items'
import { useHomeHref } from '@/lib/portfolio-view'
import { serializeJsonLd } from '@/lib/serialize-json-ld'

type Filter = NewsFilterCategory

const PAGE_SIZE = 24
const COLLAPSED_TAG_COUNT = 14

const copy = {
  title: { en: 'News', de: 'News', fr: 'Actualités', es: 'Noticias', ar: 'الأخبار' },
  subtitle: {
    en: 'Curated AI news, each with a short take. Filter by category, topic tag, source, or keyword.',
    de: 'Kuratierte KI-News mit kurzer Einordnung. Nach Kategorie, Thema-Tag, Quelle oder Stichwort filtern.',
    fr: 'Actualités IA sélectionnées, chacune avec une analyse courte. Filtrez par catégorie, tag, source ou mot-clé.',
    es: 'Noticias de IA seleccionadas, cada una con un breve análisis. Filtra por categoría, etiqueta, fuente o palabra clave.',
    ar: 'أخبار مختارة عن الذكاء الاصطناعي مع تعليق موجز. صفِّ حسب الفئة أو الوسم أو المصدر أو الكلمة المفتاحية.',
  },
  backHome: { en: 'Back to home', de: 'Zur Startseite', fr: "Retour à l'accueil", es: 'Volver al inicio', ar: 'العودة إلى الرئيسية' },
  all: { en: 'All', de: 'Alle', fr: 'Tout', es: 'Todo', ar: 'الكل' },
  filterAria: {
    en: 'Filter news by category',
    de: 'Nachrichten nach Kategorie filtern',
    fr: 'Filtrer les actualités par catégorie',
    es: 'Filtrar noticias por categoría',
    ar: 'تصفية الأخبار حسب الفئة',
  },
  searchPlaceholder: {
    en: 'Search headlines, takes, or tags…',
    de: 'Schlagzeilen, Einordnungen oder Tags durchsuchen…',
    fr: 'Rechercher titres, analyses ou tags…',
    es: 'Buscar titulares, análisis o etiquetas…',
    ar: 'ابحث في العناوين أو التعليقات أو الوسوم…',
  },
  searchAria: {
    en: 'Search news items',
    de: 'Nachrichten durchsuchen',
    fr: 'Rechercher dans les actualités',
    es: 'Buscar en noticias',
    ar: 'البحث في الأخبار',
  },
  clearSearch: {
    en: 'Clear search',
    de: 'Suche löschen',
    fr: 'Effacer la recherche',
    es: 'Borrar búsqueda',
    ar: 'مسح البحث',
  },
  sourceAria: {
    en: 'Filter news by source',
    de: 'Nach Quelle filtern',
    fr: 'Filtrer par source',
    es: 'Filtrar por fuente',
    ar: 'تصفية حسب المصدر',
  },
  allSources: {
    en: 'All sources',
    de: 'Alle Quellen',
    fr: 'Toutes les sources',
    es: 'Todas las fuentes',
    ar: 'كل المصادر',
  },
  topicsLabel: {
    en: 'Topics',
    de: 'Themen-Tags',
    fr: 'Thèmes',
    es: 'Etiquetas',
    ar: 'الوسوم',
  },
  topicsAria: {
    en: 'Filter news by topic tag',
    de: 'Nach Thema-Tag filtern',
    fr: 'Filtrer par tag thématique',
    es: 'Filtrar por etiqueta temática',
    ar: 'تصفية الأخبار حسب الوسم',
  },
  showAllTags: {
    en: 'Show all {count} tags',
    de: 'Alle {count} Tags anzeigen',
    fr: 'Voir les {count} tags',
    es: 'Ver las {count} etiquetas',
    ar: 'عرض كل الوسوم ({count})',
  },
  showFewerTags: {
    en: 'Show top tags',
    de: 'Weniger Tags',
    fr: 'Réduire les tags',
    es: 'Ver menos etiquetas',
    ar: 'عرض أهم الوسوم',
  },
  showingCount: {
    en: 'Showing {shown} of {total} items',
    de: '{shown} von {total} Einträgen',
    fr: '{shown} sur {total} actualités',
    es: 'Mostrando {shown} de {total} noticias',
    ar: 'عرض {shown} من أصل {total} خبرًا',
  },
  clearFilters: {
    en: 'Clear filters',
    de: 'Filter zurücksetzen',
    fr: 'Réinitialiser les filtres',
    es: 'Limpiar filtros',
    ar: 'إعادة ضبط التصفية',
  },
  readSource: { en: 'Read source', de: 'Quelle lesen', fr: 'Lire la source', es: 'Leer la fuente', ar: 'اقرأ المصدر' },
  showMore: {
    en: 'Show more ({count} remaining)',
    de: 'Mehr anzeigen ({count} weitere)',
    fr: 'Afficher plus ({count} restants)',
    es: 'Mostrar más ({count} restantes)',
    ar: 'عرض المزيد (المتبقي: {count})',
  },
  empty: {
    en: 'No news items match the active filters.',
    de: 'Keine Einträge entsprechen den aktiven Filtern.',
    fr: 'Aucune actualité ne correspond aux filtres actifs.',
    es: 'Ninguna noticia coincide con los filtros activos.',
    ar: 'لا توجد أخبار تطابق عوامل التصفية الحالية.',
  },
} satisfies Record<string, TranslationMap>

function NewsSearchParamsObserver({ onSearchChange }: { onSearchChange: (search: string) => void }) {
  const searchParams = useSearchParams()
  const serialized = searchParams.toString()

  useEffect(() => {
    const nextSearch = serialized ? `?${serialized}` : ''
    queueMicrotask(() => onSearchChange(nextSearch))
  }, [serialized, onSearchChange])

  return null
}

export default function NewsPageClient() {
  const { lang, t } = useI18n()
  const homeHref = useHomeHref()
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedSource, setSelectedSource] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAllTags, setShowAllTags] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [hydratedUrl, setHydratedUrl] = useState(false)
  const hydratedRef = useRef(false)
  const lastWrittenSearchRef = useRef<string | null>(null)
  const locale = languageLocale[lang]

  const all = useMemo(() => getAllNews(lang), [lang])

  const syncFiltersFromSearch = useCallback((rawSearch: string) => {
    const incomingCanonical = canonicalizeNewsFilterSearch(rawSearch)
    if (hydratedRef.current && lastWrittenSearchRef.current === incomingCanonical) {
      lastWrittenSearchRef.current = null
      return
    }
    lastWrittenSearchRef.current = null
    const parsed = parseNewsFilterSearch(rawSearch)
    setFilter(parsed.filter)
    setSelectedTags(parsed.selectedTags)
    setSelectedSource(parsed.selectedSource)
    setSearchQuery(parsed.searchQuery)
    setVisibleCount(PAGE_SIZE)
    hydratedRef.current = true
    setHydratedUrl(true)
  }, [])

  // Sync filter state on browser Back/Forward in addition to client-side Link query navigations.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handlePopState = () => {
      syncFiltersFromSearch(window.location.search)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [syncFiltersFromSearch])

  // Keep URL query params in sync via replaceState so Back always returns home in one click.
  useEffect(() => {
    if (!hydratedUrl || typeof window === 'undefined') return
    const nextSearch = serializeNewsFilterSearch({
      filter,
      selectedTags,
      selectedSource,
      searchQuery,
    })
    const nextHref = `${window.location.pathname}${nextSearch}${window.location.hash}`
    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (nextHref !== currentHref) {
      lastWrittenSearchRef.current = nextSearch
      // When Next.js's `replaceState` wrapper is active, pass `null` rather than
      // `window.history.state` (which carries `__NA: true`) so the wrapper copies
      // its internal tree automatically AND updates `useSearchParams()`.
      const isPatchedByNext =
        typeof History !== 'undefined' && window.history.replaceState !== History.prototype.replaceState
      window.history.replaceState(isPatchedByNext ? null : window.history.state, '', nextHref)
    }
  }, [hydratedUrl, filter, selectedTags, selectedSource, searchQuery])

  const normalizedQuery = searchQuery.trim().toLowerCase()

  // Items matching Category + Source + Search (used to compute live tag counts).
  const preTagFiltered = useMemo(() => {
    return all.filter((item) => {
      if (filter !== 'all' && item.category !== filter) return false
      if (selectedSource !== 'all' && item.source !== selectedSource) return false
      if (normalizedQuery) {
        const inHeadline = item.headline.toLowerCase().includes(normalizedQuery)
        const inTake = item.take.toLowerCase().includes(normalizedQuery)
        const inSource = item.source.toLowerCase().includes(normalizedQuery)
        const inTags = (item.tags ?? []).some((tag) => tag.includes(normalizedQuery))
        if (!inHeadline && !inTake && !inSource && !inTags) return false
      }
      return true
    })
  }, [all, filter, selectedSource, normalizedQuery])

  const filteredItems = useMemo(() => {
    if (selectedTags.length === 0) return preTagFiltered
    return preTagFiltered.filter((item) => {
      const itemTags = item.tags ?? []
      return selectedTags.every((tag) => itemTags.includes(tag))
    })
  }, [preTagFiltered, selectedTags])

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount],
  )
  const remainingCount = Math.max(0, filteredItems.length - visibleItems.length)

  const filters = useMemo<Array<{ key: Filter; label: TranslationMap; count: number }>>(() => {
    let aiCount = 0
    let agenticCount = 0
    for (const item of all) {
      if (item.category === 'ai') aiCount += 1
      else if (item.category === 'agentic') agenticCount += 1
    }
    return [
      { key: 'all', label: copy.all, count: all.length },
      { key: 'agentic', label: newsCategoryLabels.agentic, count: agenticCount },
      { key: 'ai', label: newsCategoryLabels.ai, count: aiCount },
    ]
  }, [all])

  const sources = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of all) {
      if (filter !== 'all' && item.category !== filter) continue
      counts.set(item.source, (counts.get(item.source) ?? 0) + 1)
    }
    if (selectedSource !== 'all' && !counts.has(selectedSource)) {
      counts.set(selectedSource, 0)
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }, [all, filter, selectedSource])

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of preTagFiltered) {
      for (const tag of item.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    for (const activeTag of selectedTags) {
      if (!counts.has(activeTag)) counts.set(activeTag, 0)
    }
    return Array.from(counts.entries()).sort((a, b) => {
      const aSelected = selectedTags.includes(a[0]) ? 1 : 0
      const bSelected = selectedTags.includes(b[0]) ? 1 : 0
      if (aSelected !== bSelected) return bSelected - aSelected
      return b[1] - a[1] || a[0].localeCompare(b[0])
    })
  }, [preTagFiltered, selectedTags])

  const displayedTags = useMemo(
    () => (showAllTags ? tagCounts : tagCounts.slice(0, COLLAPSED_TAG_COUNT)),
    [showAllTags, tagCounts],
  )

  const hasActiveFilters =
    filter !== 'all' ||
    selectedTags.length > 0 ||
    selectedSource !== 'all' ||
    normalizedQuery.length > 0

  const handleFilterChange = (nextFilter: Filter) => {
    setFilter(nextFilter)
    setVisibleCount(PAGE_SIZE)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
    setVisibleCount(PAGE_SIZE)
  }

  const resetAllFilters = () => {
    setFilter('all')
    setSelectedTags([])
    setSelectedSource('all')
    setSearchQuery('')
    setVisibleCount(PAGE_SIZE)
  }

  // JSON-LD is built client-side (the news data already ships in this chunk)
  // so the schema is not duplicated into the RSC flight payload. English is
  // the canonical crawl language.
  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'AI & Agentic AI News',
      description: 'Curated AI and agentic AI news with editorial commentary.',
      url: 'https://ahmed-3m.github.io/news/',
      hasPart: getAllNews('en').map((item) => ({
        '@type': 'NewsArticle',
        headline: item.headline,
        datePublished: item.date,
        url: item.url,
        abstract: item.take,
      })),
    }),
    [],
  )

  return (
    <main id="main" tabIndex={-1} className="min-h-screen pb-20 pt-24">
      <Suspense fallback={null}>
        <NewsSearchParamsObserver onSearchChange={syncFiltersFromSearch} />
      </Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-5">
        <Link href={homeHref} className="mb-8 inline-flex items-center gap-2 text-[var(--cd-accent)]">
          <ArrowLeft size={18} className="rtl:rotate-180" />
          {t(copy.backHome)}
        </Link>

        <h1 className="mb-2 text-4xl font-bold">{t(copy.title)}</h1>
        <p className="mb-6 text-[var(--cd-fg2)]">{t(copy.subtitle)}</p>

        <div className="news-filter-panel">
          <div className="news-filter-top">
            <div className="news-cat-group" role="group" aria-label={t(copy.filterAria)}>
              {filters.map(({ key, label, count }) => {
                const active = filter === key
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleFilterChange(key)}
                    className={`news-cat-pill${active ? ' is-active' : ''}`}
                  >
                    <span>{t(label)}</span>
                    <span className="news-cat-count">
                      <bdi dir="ltr">({count})</bdi>
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="news-search-row">
              <div className="news-search-box">
                <Search size={15} className="news-search-icon" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value)
                    setVisibleCount(PAGE_SIZE)
                  }}
                  placeholder={t(copy.searchPlaceholder)}
                  aria-label={t(copy.searchAria)}
                  className="news-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setVisibleCount(PAGE_SIZE)
                    }}
                    aria-label={t(copy.clearSearch)}
                    className="news-search-clear"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </div>

              <select
                value={selectedSource}
                onChange={(event) => {
                  setSelectedSource(event.target.value)
                  setVisibleCount(PAGE_SIZE)
                }}
                aria-label={t(copy.sourceAria)}
                className="news-source-select"
              >
                <option value="all">{t(copy.allSources)}</option>
                {sources.map(([sourceName, count]) => (
                  <option key={sourceName} value={sourceName}>
                    {sourceName} ({count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {tagCounts.length > 0 && (
            <div className="news-tags-section">
              <div className="news-tags-header">
                <span className="news-tags-label">{t(copy.topicsLabel)}</span>
                {tagCounts.length > COLLAPSED_TAG_COUNT && (
                  <button
                    type="button"
                    className="news-tags-expand"
                    aria-expanded={showAllTags}
                    onClick={() => setShowAllTags((prev) => !prev)}
                  >
                    {showAllTags
                      ? t(copy.showFewerTags)
                      : t(copy.showAllTags).replace('{count}', String(tagCounts.length))}
                  </button>
                )}
              </div>

              <div className="news-tags-cloud" role="group" aria-label={t(copy.topicsAria)}>
                {displayedTags.map(([tag, count]) => {
                  const active = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      dir="ltr"
                      aria-pressed={active}
                      onClick={() => toggleTag(tag)}
                      className={`news-tag-chip${active ? ' is-active' : ''}`}
                    >
                      <span>#{tag}</span>
                      <span className="news-tag-count">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="news-status-bar">
          <span aria-live="polite">
            {t(copy.showingCount)
              .replace('{shown}', String(filteredItems.length))
              .replace('{total}', String(all.length))}
          </span>

          {hasActiveFilters && (
            <button type="button" onClick={resetAllFilters} className="news-reset-btn">
              <X size={13} aria-hidden="true" />
              <span>{t(copy.clearFilters)}</span>
            </button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="portfolio-feed-card text-center">
            <p className="mb-4 text-[var(--cd-fg2)]">{t(copy.empty)}</p>
            <button type="button" onClick={resetAllFilters} className="cd-btn-ghost text-sm">
              {t(copy.clearFilters)}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {visibleItems.map((item) => (
                <article
                  key={item.id}
                  className="portfolio-feed-card"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-[var(--cd-fg3)]">
                    <time dateTime={item.date} className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(item.date).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'UTC',
                      })}
                    </time>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: 'var(--cd-elev)', color: 'var(--cd-accent)' }}
                    >
                      {t(newsCategoryLabels[item.category])}
                    </span>
                    <span>{item.source}</span>
                  </div>

                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="group">
                    <h2 className="mb-3 inline-flex items-start gap-1 text-xl font-semibold transition-colors group-hover:text-[var(--cd-accent)]">
                      {item.headline}
                      <ArrowUpRight size={18} className="mt-1 shrink-0 opacity-60" />
                    </h2>
                  </a>

                  <p className="mb-4 text-[var(--cd-fg2)]">{item.take}</p>

                  <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
                    <div className="flex flex-wrap gap-2">
                      {(item.tags ?? []).map((tag) => {
                        const active = selectedTags.includes(tag)
                        return (
                          <button
                            key={tag}
                            type="button"
                            dir="ltr"
                            aria-pressed={active}
                            onClick={() => toggleTag(tag)}
                            className={`news-tag-chip${active ? ' is-active' : ''}`}
                          >
                            #{tag}
                          </button>
                        )
                      })}
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[var(--cd-accent)] shrink-0"
                    >
                      {t(copy.readSource)}
                      <ArrowUpRight size={16} />
                    </a>
                  </div>
                </article>
              ))}
            </div>

            {remainingCount > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="rounded-full border border-[var(--cd-b1)] bg-[var(--cd-surf)] px-6 py-2.5 text-sm font-medium text-[var(--cd-fg1)] transition-colors hover:border-[var(--cd-accent)] hover:text-[var(--cd-accent)]"
                >
                  {t(copy.showMore).replace('{count}', String(remainingCount))}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
