'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { getHomepageNews, homepageCategoryLabels } from '@/lib/news-homepage'

const copy = {
  eyebrow: { en: '// News', de: '// News', fr: '// Actualités', es: '// Noticias', ar: '// الأخبار' },
  title: { en: 'Tracking the field.', de: 'Das Feld im Blick.', fr: 'Suivre le domaine.', es: 'Siguiendo el campo.', ar: 'متابعة المجال.' },
  intro: {
    en: 'Curated AI news with a short take on each — with a bias toward agentic AI, where I spend most of my attention.',
    de: 'Kuratierte KI-News mit kurzer Einordnung — mit Fokus auf agentische KI.',
    fr: "Actualités IA sélectionnées avec une courte analyse — avec un accent sur l'IA agentique.",
    es: 'Noticias de IA seleccionadas con un breve análisis — con énfasis en la IA agéntica.',
    ar: 'أخبار مختارة عن الذكاء الاصطناعي مع تعليق موجز — مع تركيز على الذكاء الاصطناعي الوكيل.',
  },
  read: { en: 'Read source', de: 'Quelle lesen', fr: 'Lire la source', es: 'Leer fuente', ar: 'اقرأ المصدر' },
  all: { en: 'View all news', de: 'Alle News ansehen', fr: 'Voir toutes les actualités', es: 'Ver todas las noticias', ar: 'عرض كل الأخبار' },
  prev: {
    en: 'Newer news items',
    de: 'Neuere News-Einträge',
    fr: 'Actualités plus récentes',
    es: 'Noticias más recientes',
    ar: 'الأخبار الأحدث',
  },
  next: {
    en: 'Older news items',
    de: 'Ältere News-Einträge',
    fr: 'Actualités plus anciennes',
    es: 'Noticias anteriores',
    ar: 'الأخبار الأقدم',
  },
  carouselAria: {
    en: 'Recent curated AI news',
    de: 'Aktuelle kuratierte KI-News',
    fr: 'Actualités IA sélectionnées récentes',
    es: 'Noticias recientes seleccionadas de IA',
    ar: 'أحدث أخبار الذكاء الاصطناعي المختارة',
  },
  paginationAria: {
    en: 'News pages',
    de: 'News-Seiten',
    fr: 'Pages d’actualités',
    es: 'Páginas de noticias',
    ar: 'صفحات الأخبار',
  },
  goToPage: {
    en: 'Show news page {page} of {total}',
    de: 'News-Seite {page} von {total} anzeigen',
    fr: 'Afficher la page {page} sur {total}',
    es: 'Mostrar página {page} de {total}',
    ar: 'عرض صفحة الأخبار {page} من {total}',
  },
} satisfies Record<string, TranslationMap>

export default function News() {
  const { lang, t } = useI18n()
  const items = getHomepageNews(lang)
  const [perPage, setPerPage] = useState(3)
  const [startIndex, setStartIndex] = useState(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(max-width: 768px)')
    const sync = () => {
      const nextPerPage = mq.matches ? 1 : 3
      setPerPage(nextPerPage)
      setStartIndex((prev) => Math.floor(prev / nextPerPage) * nextPerPage)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / perPage))
  const currentPage = Math.min(pageCount - 1, Math.floor(startIndex / perPage))
  const safeStart = currentPage * perPage
  const visibleItems = items.slice(safeStart, safeStart + perPage)
  const rangeStart = total === 0 ? 0 : safeStart + 1
  const rangeEnd = Math.min(total, safeStart + visibleItems.length)

  const hasPrev = currentPage > 0
  const hasNext = currentPage < pageCount - 1

  const goToPage = (pageIndex: number) => {
    const clamped = Math.max(0, Math.min(pageCount - 1, pageIndex))
    setStartIndex(clamped * perPage)
  }

  const goPrev = () => {
    if (hasPrev) goToPage(currentPage - 1)
  }

  const goNext = () => {
    if (hasNext) goToPage(currentPage + 1)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (pageCount <= 1) return
    const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      if (isRtl) goPrev()
      else goNext()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      if (isRtl) goNext()
      else goPrev()
    } else if (event.key === 'Home') {
      event.preventDefault()
      goToPage(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      goToPage(pageCount - 1)
    }
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0]
    if (!touch) return
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    const touch = event.changedTouches[0]
    if (!start || !touch) return
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.4) return
    const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
    if (dx < 0) {
      if (isRtl) goPrev()
      else goNext()
    } else {
      if (isRtl) goNext()
      else goPrev()
    }
  }

  return (
    <section id="news" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <h2 className="cd-section-title" style={{ marginBottom: 8 }}>{t(copy.title)}</h2>
        <p style={{ color: 'var(--cd-fg2)', fontSize: 15, marginBottom: 40, maxWidth: 560 }}>
          {t(copy.intro)}
        </p>

        <div
          className="cd-news-stage"
          role="region"
          aria-roledescription="carousel"
          aria-label={t(copy.carouselAria)}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {pageCount > 1 && (
            <button
              type="button"
              className="cd-news-arrow cd-news-arrow--prev"
              onClick={goPrev}
              disabled={!hasPrev}
              aria-label={t(copy.prev)}
              title={t(copy.prev)}
            >
              <ChevronLeft size={20} strokeWidth={2.1} className="rtl:rotate-180" aria-hidden="true" />
            </button>
          )}

          <div
            key={`page-${currentPage}-${perPage}`}
            className="cd-writing-grid cd-news-grid-page"
          >
            {visibleItems.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cd-writing-card"
              >
                <div className="cd-wc-tags">
                  <span className="cd-wc-tag">{t(homepageCategoryLabels[item.category])}</span>
                  <span className="cd-wc-tag">{item.source}</span>
                </div>
                <div className="cd-wc-title">{item.headline}</div>
                <div className="cd-wc-excerpt">
                  {item.take}
                </div>
                {(item.tags?.length ?? 0) > 0 && (
                  <div className="cd-wc-topics">
                    {item.tags!.slice(0, 3).map((tag) => (
                      <span key={tag} className="cd-wc-topic" dir="ltr">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="cd-wc-footer">
                  <span className="cd-wc-time"><bdi dir="ltr">{item.date}</bdi></span>
                  <span className="cd-proj-link" style={{ fontSize: 12 }}>
                    {t(copy.read)} <span className="inline-block rtl:-scale-x-100" aria-hidden="true">&#8599;</span>
                  </span>
                </div>
              </a>
            ))}
          </div>

          {pageCount > 1 && (
            <button
              type="button"
              className="cd-news-arrow cd-news-arrow--next"
              onClick={goNext}
              disabled={!hasNext}
              aria-label={t(copy.next)}
              title={t(copy.next)}
            >
              <ChevronRight size={20} strokeWidth={2.1} className="rtl:rotate-180" aria-hidden="true" />
            </button>
          )}
        </div>

        {pageCount > 1 && (
          <div className="cd-news-controls">
            <button
              type="button"
              className="cd-news-mobile-arrow"
              onClick={goPrev}
              disabled={!hasPrev}
              aria-label={t(copy.prev)}
            >
              <ChevronLeft size={18} strokeWidth={2.1} className="rtl:rotate-180" aria-hidden="true" />
            </button>

            <div className="cd-news-dots" role="group" aria-label={t(copy.paginationAria)}>
              {Array.from({ length: pageCount }, (_, idx) => {
                const active = idx === currentPage
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`cd-news-dot${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                    aria-label={t(copy.goToPage)
                      .replace('{page}', String(idx + 1))
                      .replace('{total}', String(pageCount))}
                    onClick={() => goToPage(idx)}
                  />
                )
              })}
            </div>

            <span className="cd-news-counter" aria-live="polite">
              <bdi dir="ltr">
                {rangeStart === rangeEnd ? `${rangeStart} / ${total}` : `${rangeStart}–${rangeEnd} / ${total}`}
              </bdi>
            </span>

            <button
              type="button"
              className="cd-news-mobile-arrow"
              onClick={goNext}
              disabled={!hasNext}
              aria-label={t(copy.next)}
            >
              <ChevronRight size={18} strokeWidth={2.1} className="rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link href="/news/" className="cd-btn-ghost" style={{ fontSize: 13 }}>
            {t(copy.all)} <span className="inline-block rtl:rotate-180" aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
