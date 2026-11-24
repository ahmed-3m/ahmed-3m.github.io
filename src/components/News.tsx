'use client'
import Link from 'next/link'
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
} satisfies Record<string, TranslationMap>

export default function News() {
  const { lang, t } = useI18n()
  // Already the newest 3 — capped by tools/emit-homepage-news.mjs at build time.
  const items = getHomepageNews(lang)

  return (
    <section id="news" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <h2 className="cd-section-title" style={{ marginBottom: 8 }}>{t(copy.title)}</h2>
        <p style={{ color: 'var(--cd-fg2)', fontSize: 15, marginBottom: 40, maxWidth: 560 }}>
          {t(copy.intro)}
        </p>

        <div className="cd-writing-grid">
          {items.map((item) => (
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
              <div className="cd-wc-footer">
                <span className="cd-wc-time">{item.date}</span>
                <span className="cd-proj-link" style={{ fontSize: 12 }}>
                  {t(copy.read)} <span className="inline-block rtl:-scale-x-100" aria-hidden="true">&#8599;</span>
                </span>
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/news/" className="cd-btn-ghost" style={{ fontSize: 13 }}>
            {t(copy.all)} <span className="inline-block rtl:rotate-180" aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
