'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { translateValue } from '@/lib/i18n-config'
import { getCaseStudy } from '@/lib/case-studies'

const labels = {
  back: { en: 'Back to portfolio', de: 'Zuruck zum Portfolio', fr: 'Retour au portfolio', es: 'Volver al portfolio', ar: 'العودة إلى البورتفوليو' },
  problem: { en: 'Problem', de: 'Problem', fr: 'Probleme', es: 'Problema', ar: 'المشكلة' },
  role: { en: 'Role', de: 'Rolle', fr: 'Role', es: 'Rol', ar: 'الدور' },
  approach: { en: 'Approach', de: 'Ansatz', fr: 'Approche', es: 'Enfoque', ar: 'المنهج' },
  results: { en: 'Results', de: 'Ergebnisse', fr: 'Resultats', es: 'Resultados', ar: 'النتائج' },
  lessons: { en: 'Lessons', de: 'Erkenntnisse', fr: 'Lecons', es: 'Lecciones', ar: 'الدروس' },
  artifacts: { en: 'Artifacts', de: 'Artefakte', fr: 'Artefacts', es: 'Artefactos', ar: 'الروابط' },
  preview: { en: 'Product preview', de: 'Produktvorschau', fr: 'Apercu produit', es: 'Vista previa del producto', ar: 'معاينة المنتج' },
  comingSoon: {
    en: 'Screenshot placeholder until public product visuals are ready.',
    de: 'Screenshot-Platzhalter bis oeffentliche Produktvisuals bereit sind.',
    fr: 'Visuel temporaire en attendant des captures produit publiques.',
    es: 'Marcador temporal hasta que haya capturas publicas del producto.',
    ar: 'عنصر مؤقت إلى أن تصبح صور المنتج العامة جاهزة.',
  },
} as const

export default function CaseStudyPage({ slug }: { slug: string }) {
  const { lang, t } = useI18n()
  const study = getCaseStudy(slug)

  if (!study) return null

  return (
    <main className="min-h-screen pb-20 pt-24">
      <article className="mx-auto max-w-4xl px-5">
        <Link href="/#projects" className="mb-8 inline-flex items-center gap-2 text-[var(--cd-accent)]">
          <ArrowLeft size={18} />
          {t(labels.back)}
        </Link>

        <div className="glass-surface glass-subtle p-6 sm:p-8">
          <div className="cd-section-eyebrow" style={{ marginBottom: 10 }}>
            Case study
          </div>
          <h1 className="mb-3 text-4xl font-bold">{translateValue(lang, study.title)}</h1>
          <p className="max-w-3xl text-[var(--cd-fg2)]">{translateValue(lang, study.summary)}</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginTop: 24,
          }}
        >
          <section className="glass-surface glass-subtle p-5">
            <h2 className="mb-2 text-lg font-semibold">{t(labels.problem)}</h2>
            <p className="text-[var(--cd-fg2)]">{translateValue(lang, study.problem)}</p>
          </section>
          <section className="glass-surface glass-subtle p-5">
            <h2 className="mb-2 text-lg font-semibold">{t(labels.role)}</h2>
            <p className="text-[var(--cd-fg2)]">{translateValue(lang, study.role)}</p>
          </section>
        </div>

        {slug === 'faultrix' && (
          <section className="glass-surface glass-subtle mt-6 p-5">
            <h2 className="mb-4 text-lg font-semibold">{t(labels.preview)}</h2>
            <div
              style={{
                minHeight: 220,
                borderRadius: 10,
                border: '1px solid var(--cd-b0)',
                background: 'linear-gradient(135deg, var(--cd-elev), var(--cd-surf))',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--cd-fg2)',
                textAlign: 'center',
                padding: 24,
              }}
            >
              {t(labels.comingSoon)}
            </div>
          </section>
        )}

        {(['approach', 'results', 'lessons'] as const).map((key) => (
          <section key={key} className="glass-surface glass-subtle mt-6 p-5">
            <h2 className="mb-4 text-lg font-semibold">{t(labels[key])}</h2>
            <ul className="list-disc space-y-3 pl-5 text-[var(--cd-fg2)]">
              {study[key].map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}

        <section className="glass-surface glass-subtle mt-6 p-5">
          <h2 className="mb-4 text-lg font-semibold">{t(labels.artifacts)}</h2>
          <div className="flex flex-wrap gap-3">
            {study.artifacts.map((artifact) => (
              <a
                key={artifact.href}
                href={artifact.href}
                target={artifact.href.startsWith('http') ? '_blank' : undefined}
                rel={artifact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="cd-btn-ghost"
              >
                {artifact.label}
              </a>
            ))}
          </div>
        </section>
      </article>
    </main>
  )
}
