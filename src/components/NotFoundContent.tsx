'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useHomeHref } from '@/lib/portfolio-view'

const copy = {
  eyebrow: {
    en: 'Error 404',
    de: 'Fehler 404',
    fr: 'Erreur 404',
    es: 'Error 404',
    ar: 'خطأ 404',
  },
  heading: {
    en: 'Page Not Found',
    de: 'Seite nicht gefunden',
    fr: 'Page introuvable',
    es: 'Página no encontrada',
    ar: 'الصفحة غير موجودة',
  },
  body: {
    en: "The page you're looking for doesn't exist or has been moved. Let's get you back on track.",
    de: 'Die gesuchte Seite existiert nicht oder wurde verschoben. Hier geht es zurück.',
    fr: "La page que vous cherchez n'existe pas ou a été déplacée. Retournons sur le bon chemin.",
    es: 'La página que buscas no existe o fue movida. Volvamos al camino correcto.',
    ar: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها. لنعد إلى المسار الصحيح.',
  },
  backHome: {
    en: 'Back Home',
    de: 'Zur Startseite',
    fr: 'Retour à l’accueil',
    es: 'Volver al inicio',
    ar: 'العودة إلى الرئيسية',
  },
  readBlog: {
    en: 'Read the Blog',
    de: 'Blog lesen',
    fr: 'Lire le blog',
    es: 'Leer el blog',
    ar: 'اقرأ المدونة',
  },
} satisfies Record<string, TranslationMap>

export default function NotFoundContent() {
  const { t } = useI18n()
  const homeHref = useHomeHref()

  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ background: 'var(--cd-bg)', color: 'var(--cd-fg1)' }}
    >
      <div className="cd-ambient" aria-hidden="true" />
      <Header />
      <main
        id="main"
        tabIndex={-1}
        className="relative z-[1] flex flex-1 items-center justify-center px-5 pt-24 pb-16"
      >
        <div
          className="w-full max-w-lg rounded-2xl border px-6 py-10 text-center sm:px-10"
          style={{
            background: 'var(--cd-surf)',
            borderColor: 'var(--cd-b0)',
            boxShadow: 'var(--elevation)',
          }}
        >
          <p
            className="mb-2 text-xs font-medium tracking-[0.1em] uppercase"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--cd-accent)' }}
          >
            {t(copy.eyebrow)}
          </p>

          <h1
            className="mb-4 text-[clamp(4.5rem,14vw,7rem)] leading-none font-black tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--cd-accent)',
            }}
          >
            <bdi dir="ltr">404</bdi>
          </h1>

          <h2
            className="mb-3 text-2xl font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--cd-fg1)' }}
          >
            {t(copy.heading)}
          </h2>

          <p className="mb-8 leading-relaxed" style={{ color: 'var(--cd-fg2)' }}>
            {t(copy.body)}
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={homeHref}
              className="cd-btn-primary min-h-11 justify-center motion-reduce:transition-none"
            >
              <ArrowLeft size={16} className="rtl:rotate-180" aria-hidden="true" />
              <span>{t(copy.backHome)}</span>
            </Link>
            <Link
              href="/blog/"
              className="cd-btn-ghost min-h-11 justify-center motion-reduce:transition-none"
            >
              <span>{t(copy.readBlog)}</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
