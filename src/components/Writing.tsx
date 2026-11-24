'use client'
import Link from 'next/link'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { getAllBlogPostsMeta } from '@/lib/blog-posts-meta'

const copy = {
  eyebrow: { en: '// Writing', de: '// Schreiben', fr: '// Écriture', es: '// Escritura', ar: '// الكتابة' },
  title: { en: 'Thinking out loud.', de: 'Gedanken laut gedacht.', fr: 'Réflexions ouvertes.', es: 'Pensando en voz alta.', ar: 'أفكار بصوت عالٍ.' },
  intro: {
    en: 'Deep-dives on research decisions, production lessons, and the gap between papers and products.',
    de: 'Deep-Dives zu Forschungsentscheidungen, Produktionslektionen und der Lücke zwischen Papers und Produkten.',
    fr: "Analyses sur les choix de recherche, les leçons de production et l'écart entre articles et produits.",
    es: 'Análisis sobre decisiones de investigación, lecciones de producción y la brecha entre papers y productos.',
    ar: 'مقالات عميقة عن قرارات البحث ودروس الإنتاج والفجوة بين الأوراق العلمية والمنتجات.',
  },
  read: { en: 'Read', de: 'Lesen', fr: 'Lire', es: 'Leer', ar: 'اقرأ' },
  all: { en: 'View all posts', de: 'Alle Beiträge ansehen', fr: 'Voir tous les articles', es: 'Ver todos los artículos', ar: 'عرض كل المقالات' },
} satisfies Record<string, TranslationMap>

export default function Writing() {
  const { lang, t } = useI18n()
  const posts = getAllBlogPostsMeta(lang).slice(0, 3)

  return (
    <section id="writing" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <h2 className="cd-section-title" style={{ marginBottom: 8 }}>{t(copy.title)}</h2>
        <p style={{ color: 'var(--cd-fg2)', fontSize: 15, marginBottom: 40, maxWidth: 560 }}>
          {t(copy.intro)}
        </p>

        <div className="cd-writing-grid">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}/`}
              className="cd-writing-card"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="cd-wc-tags">
                {post.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="cd-wc-tag">{tag}</span>
                ))}
              </div>
              <div className="cd-wc-title">{post.title}</div>
              <div className="cd-wc-excerpt">
                {post.excerpt.length > 140 ? `${post.excerpt.slice(0, 140)}...` : post.excerpt}
              </div>
              <div className="cd-wc-footer">
                <span className="cd-wc-time">{post.readingTime}</span>
                <span className="cd-proj-link" style={{ fontSize: 12 }}>
                  {t(copy.read)} <span className="inline-block rtl:rotate-180" aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/blog/" className="cd-btn-ghost" style={{ fontSize: 13 }}>
            {t(copy.all)} <span className="inline-block rtl:rotate-180" aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
