'use client'

import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { languageLocale } from '@/lib/i18n-config'
import { getBlogPost } from '@/lib/blog-posts'

function formatContent(content: string | undefined) {
  if (!content) return ''

  return content
    .trim()
    .split('\n\n')
    .map((block) => {
      if (block.startsWith('## ')) {
        return `<h2 class="text-2xl font-bold mt-8 mb-4">${block.replace('## ', '')}</h2>`
      }
      if (block.startsWith('### ')) {
        return `<h3 class="text-xl font-semibold mt-6 mb-3">${block.replace('### ', '')}</h3>`
      }
      if (block.startsWith('```')) {
        const code = block.replace(/```[\w]*\n?/g, '').replace(/```/g, '')
        return `<pre class="mb-4 overflow-x-auto rounded-lg border border-[var(--cd-b0)] bg-[var(--cd-elev)] p-4"><code>${code}</code></pre>`
      }
      if (block.startsWith('- ')) {
        const items = block
          .split('\n')
          .map((item) => `<li>${item.replace(/^- /, '')}</li>`)
          .join('')
        return `<ul class="mb-4 list-disc space-y-2 pl-6 text-[var(--cd-fg2)]">${items}</ul>`
      }
      if (/^\d+\./.test(block)) {
        const items = block
          .split('\n')
          .map((item) => `<li>${item.replace(/^\d+\.\s*/, '')}</li>`)
          .join('')
        return `<ol class="mb-4 list-decimal space-y-2 pl-6 text-[var(--cd-fg2)]">${items}</ol>`
      }

      const paragraph = block.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return `<p class="mb-4 leading-relaxed text-[var(--cd-fg2)]">${paragraph}</p>`
    })
    .join('')
}

const copy = {
  backBlog: {
    en: 'Back to blog',
    de: 'Zuruck zum Blog',
    fr: 'Retour au blog',
    es: 'Volver al blog',
    ar: 'العودة إلى المدونة',
  },
  faq: {
    en: 'Frequently Asked Questions',
    de: 'Haufige Fragen',
    fr: 'Questions frequentes',
    es: 'Preguntas frecuentes',
    ar: 'الاسئلة الشائعة',
  },
  viewAll: {
    en: 'View all posts',
    de: 'Alle Beitrage ansehen',
    fr: 'Voir tous les articles',
    es: 'Ver todos los articulos',
    ar: 'عرض كل المقالات',
  },
  writtenBy: {
    en: 'Written by Ahmed Mohammed',
    de: 'Geschrieben von Ahmed Mohammed',
    fr: 'Ecrit par Ahmed Mohammed',
    es: 'Escrito por Ahmed Mohammed',
    ar: 'بقلم أحمد محمد',
  },
  home: { en: 'Home', de: 'Startseite', fr: 'Accueil', es: 'Inicio', ar: 'الرئيسية' },
  blog: { en: 'Blog', de: 'Blog', fr: 'Blog', es: 'Blog', ar: 'المدونة' },
} as const

export default function BlogPostClient({ slug }: { slug: string }) {
  const { lang, t } = useI18n()
  const locale = languageLocale[lang]
  const post = getBlogPost(slug, lang)

  if (!post) return null

  return (
    <main className="min-h-screen pb-20 pt-24">
      <article className="mx-auto max-w-3xl px-5">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--cd-fg3)]">
            <li>
              <Link href="/" className="text-[var(--cd-accent)]">
                {t(copy.home)}
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/blog" className="text-[var(--cd-accent)]">
                {t(copy.blog)}
              </Link>
            </li>
            <li>/</li>
            <li className="text-[var(--cd-fg2)]">{post.title}</li>
          </ol>
        </nav>

        <Link href="/blog" className="mb-8 inline-flex items-center gap-2 text-[var(--cd-accent)]">
          <ArrowLeft size={18} />
          {t(copy.backBlog)}
        </Link>

        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>
          <p className="mb-5 text-lg text-[var(--cd-fg2)]">{post.excerpt}</p>

          <div className="glass-surface glass-subtle glass-noise p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--cd-fg2)]">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {post.readingTime}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
                  style={{
                    background: 'var(--cd-accent-dim)',
                    borderColor: 'var(--cd-b-accent)',
                    color: 'var(--cd-fg1)',
                  }}
                >
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div
          className="prose max-w-none prose-slate dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
        />

        {post.faq.length > 0 && (
          <section className="mt-12 border-t border-[var(--cd-b0)] pt-8">
            <h2 className="mb-6 text-2xl font-bold">{t(copy.faq)}</h2>
            <div className="space-y-6">
              {post.faq.map((item, index) => (
                <div key={`${item.question}-${index}`}>
                  <h3 className="mb-2 text-lg font-semibold">{item.question}</h3>
                  <p className="leading-relaxed text-[var(--cd-fg2)]">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-12 flex items-center justify-between gap-4 border-t border-[var(--cd-b0)] pt-8 max-sm:flex-col max-sm:items-start">
          <Link href="/blog" className="font-medium text-[var(--cd-accent)]">
            {t(copy.viewAll)}
          </Link>
          <div className="text-sm text-[var(--cd-fg3)]">{t(copy.writtenBy)}</div>
        </footer>
      </article>
    </main>
  )
}
