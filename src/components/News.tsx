'use client'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { getAllNews, newsCategoryLabels } from '@/lib/news-items'
import { useReveal } from '@/lib/useReveal'

const copy = {
  eyebrow: { en: '// 06 - News', de: '// 06 - News', fr: '// 06 - Actualites', es: '// 06 - Noticias', ar: '// 06 - الأخبار' },
  title: { en: 'Tracking the field.', de: 'Das Feld im Blick.', fr: 'Suivre le domaine.', es: 'Siguiendo el campo.', ar: 'متابعة المجال.' },
  intro: {
    en: 'Curated AI news with a short take on each — with a bias toward agentic AI, where I spend most of my attention.',
    de: 'Kuratierte KI-News mit kurzer Einordnung — mit Fokus auf agentische KI.',
    fr: 'Actualites IA selectionnees avec une courte analyse — avec un accent sur l IA agentique.',
    es: 'Noticias de IA seleccionadas con un breve analisis — con enfasis en la IA agentica.',
    ar: 'أخبار مختارة عن الذكاء الاصطناعي مع تعليق موجز — مع تركيز على الذكاء الاصطناعي الوكيل.',
  },
  read: { en: 'Read take', de: 'Einordnung', fr: 'Voir l analyse', es: 'Ver analisis', ar: 'اقرأ التعليق' },
  all: { en: 'View all news', de: 'Alle News ansehen', fr: 'Voir toutes les actualites', es: 'Ver todas las noticias', ar: 'عرض كل الأخبار' },
} satisfies Record<string, TranslationMap>

export default function News() {
  useReveal()
  const { lang, t } = useI18n()
  const items = getAllNews(lang).slice(0, 3)

  return (
    <section id="news" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <h2 className="cd-section-title" style={{ marginBottom: 8 }}>{t(copy.title)}</h2>
        <p style={{ color: 'var(--cd-fg2)', fontSize: 15, marginBottom: 40, maxWidth: 560 }}>
          {t(copy.intro)}
        </p>

        <div className="cd-writing-grid">
          {items.map((item, i) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cd-writing-card reveal"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="cd-wc-tags">
                <span className="cd-wc-tag">{t(newsCategoryLabels[item.category])}</span>
                <span className="cd-wc-tag">{item.source}</span>
              </div>
              <div className="cd-wc-title">{item.headline}</div>
              <div className="cd-wc-excerpt">
                {item.take.length > 140 ? `${item.take.slice(0, 140)}...` : item.take}
              </div>
              <div className="cd-wc-footer">
                <span className="cd-wc-time">{item.date}</span>
                <span className="cd-proj-link" style={{ fontSize: 12 }}>{t(copy.read)} &rarr;</span>
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a href="/news" className="cd-btn-ghost" style={{ fontSize: 13 }}>
            {t(copy.all)} &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
