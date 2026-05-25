'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { languageLocale } from '@/lib/i18n-config'
import { getAllBlogPosts } from '@/lib/blog-posts'

const copy = {
  title: { en: 'Blog', de: 'Blog', fr: 'Blog', es: 'Blog', ar: 'المدونة' },
  subtitle: {
    en: 'Research notes, product lessons, and field-tested AI writing.',
    de: 'Forschungsnotizen, Produktlektionen und AI-Erfahrungen aus der Praxis.',
    fr: 'Notes de recherche, lecons produit et retour d experience IA.',
    es: 'Notas de investigacion, lecciones de producto y experiencia real con IA.',
    ar: 'ملاحظات بحثية ودروس منتج وكتابة عملية عن الذكاء الاصطناعي.',
  },
  backHome: {
    en: 'Back to home',
    de: 'Zur Startseite',
    fr: 'Retour a l accueil',
    es: 'Volver al inicio',
    ar: 'العودة إلى الرئيسية',
  },
  readMore: {
    en: 'Read more',
    de: 'Weiterlesen',
    fr: 'Lire la suite',
    es: 'Leer mas',
    ar: 'اقرأ المزيد',
  },
} as const

export default function BlogPageClient() {
  const { lang, t } = useI18n()
  const posts = getAllBlogPosts(lang)
  const locale = languageLocale[lang]

  return (
    <main className="min-h-screen pb-20 pt-24">
      <div className="mx-auto max-w-4xl px-5">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-[var(--cd-accent)]">
          <ArrowLeft size={18} />
          {t(copy.backHome)}
        </Link>

        <h1 className="mb-2 text-4xl font-bold">{t(copy.title)}</h1>
        <p className="mb-8 text-[var(--cd-fg2)]">{t(copy.subtitle)}</p>

        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="card-3d rounded-xl border border-[var(--cd-b0)] bg-[var(--cd-surf)] p-6 transition-shadow"
            >
              <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-[var(--cd-fg3)]">
                <time dateTime={post.date} className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(post.date).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {post.readingTime}
                </span>
              </div>

              <Link href={`/blog/${post.slug}`} className="group">
                <h2 className="mb-3 text-xl font-semibold transition-colors group-hover:text-[var(--cd-accent)]">
                  {post.title}
                </h2>
              </Link>

              <p className="mb-4 text-[var(--cd-fg2)]">{post.excerpt}</p>

              <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded px-2 py-1 text-xs"
                      style={{ background: 'var(--cd-elev)', color: 'var(--cd-fg2)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-medium text-[var(--cd-accent)]"
                >
                  {t(copy.readMore)}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
