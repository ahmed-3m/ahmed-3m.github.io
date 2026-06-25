'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Calendar } from 'lucide-react'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { languageLocale } from '@/lib/i18n-config'
import { getAllNews, newsCategoryLabels, type NewsCategory } from '@/lib/news-items'

type Filter = 'all' | NewsCategory

const copy = {
  title: { en: 'News', de: 'News', fr: 'Actualites', es: 'Noticias', ar: 'الأخبار' },
  subtitle: {
    en: 'Curated AI news, each with a short take. Filter for agentic AI — the corner I follow most closely.',
    de: 'Kuratierte KI-News mit kurzer Einordnung. Nach agentischer KI filtern — meinem Schwerpunkt.',
    fr: 'Actualites IA selectionnees, chacune avec une analyse courte. Filtrez sur l IA agentique, mon principal axe.',
    es: 'Noticias de IA seleccionadas, cada una con un breve analisis. Filtra por IA agentica, mi enfoque principal.',
    ar: 'أخبار مختارة عن الذكاء الاصطناعي مع تعليق موجز. يمكنك التصفية حسب الذكاء الاصطناعي الوكيل، وهو محور اهتمامي.',
  },
  backHome: { en: 'Back to home', de: 'Zur Startseite', fr: 'Retour a l accueil', es: 'Volver al inicio', ar: 'العودة إلى الرئيسية' },
  all: { en: 'All', de: 'Alle', fr: 'Tout', es: 'Todo', ar: 'الكل' },
  readSource: { en: 'Read source', de: 'Quelle lesen', fr: 'Lire la source', es: 'Leer la fuente', ar: 'اقرأ المصدر' },
  empty: { en: 'No items in this category yet.', de: 'Noch keine Eintrage in dieser Kategorie.', fr: 'Aucun element dans cette categorie pour l instant.', es: 'Aun no hay elementos en esta categoria.', ar: 'لا توجد عناصر في هذه الفئة بعد.' },
} satisfies Record<string, TranslationMap>

export default function NewsPageClient() {
  const { lang, t } = useI18n()
  const [filter, setFilter] = useState<Filter>('all')
  const locale = languageLocale[lang]

  const all = getAllNews(lang)
  const items = filter === 'all' ? all : all.filter((item) => item.category === filter)

  const filters: Array<{ key: Filter; label: TranslationMap; count: number }> = [
    { key: 'all', label: copy.all, count: all.length },
    { key: 'ai', label: newsCategoryLabels.ai, count: all.filter((i) => i.category === 'ai').length },
    { key: 'agentic', label: newsCategoryLabels.agentic, count: all.filter((i) => i.category === 'agentic').length },
  ]

  return (
    <main className="min-h-screen pb-20 pt-24">
      <div className="mx-auto max-w-4xl px-5">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-[var(--cd-accent)]">
          <ArrowLeft size={18} />
          {t(copy.backHome)}
        </Link>

        <h1 className="mb-2 text-4xl font-bold">{t(copy.title)}</h1>
        <p className="mb-6 text-[var(--cd-fg2)]">{t(copy.subtitle)}</p>

        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="News filter">
          {filters.map(({ key, label, count }) => {
            const active = filter === key
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(key)}
                className="rounded-full border px-4 py-1.5 text-sm transition-colors"
                style={{
                  borderColor: active ? 'var(--cd-accent)' : 'var(--cd-b0)',
                  background: active ? 'var(--cd-accent)' : 'transparent',
                  color: active ? 'var(--cd-bg)' : 'var(--cd-fg2)',
                }}
              >
                {t(label)} <span style={{ opacity: 0.7 }}>({count})</span>
              </button>
            )
          })}
        </div>

        {items.length === 0 ? (
          <p className="text-[var(--cd-fg3)]">{t(copy.empty)}</p>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <article
                key={item.id}
                className="card-3d rounded-xl border border-[var(--cd-b0)] bg-[var(--cd-surf)] p-6 transition-shadow"
              >
                <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-[var(--cd-fg3)]">
                  <time dateTime={item.date} className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(item.date).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}
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
                    {(item.tags ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded px-2 py-1 text-xs"
                        style={{ background: 'var(--cd-elev)', color: 'var(--cd-fg2)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-[var(--cd-accent)]"
                  >
                    {t(copy.readSource)}
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
