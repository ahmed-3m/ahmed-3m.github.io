'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { translateValue } from '@/lib/i18n-config'
import { getCaseStudy } from '@/lib/case-studies'

const labels = {
  eyebrow: { en: 'Case study', de: 'Fallstudie', fr: 'Étude de cas', es: 'Caso de estudio', ar: 'دراسة حالة' },
  back: { en: 'Back to portfolio', de: 'Zurück zum Portfolio', fr: 'Retour au portfolio', es: 'Volver al portfolio', ar: 'العودة إلى البورتفوليو' },
  problem: { en: 'Problem', de: 'Problem', fr: 'Problème', es: 'Problema', ar: 'المشكلة' },
  role: { en: 'Role', de: 'Rolle', fr: 'Rôle', es: 'Rol', ar: 'الدور' },
  architecture: {
    en: 'Architecture & Pipeline Summary',
    de: 'Architektur- & Pipeline-Übersicht',
    fr: 'Architecture système & pipeline',
    es: 'Resumen de arquitectura y pipeline',
    ar: 'ملخص المعمارية وخط المعالجة',
  },
  approach: { en: 'Approach', de: 'Ansatz', fr: 'Approche', es: 'Enfoque', ar: 'المنهج' },
  results: { en: 'Results', de: 'Ergebnisse', fr: 'Résultats', es: 'Resultados', ar: 'النتائج' },
  lessons: { en: 'Lessons', de: 'Erkenntnisse', fr: 'Leçons', es: 'Lecciones', ar: 'الدروس' },
  artifacts: { en: 'Artifacts', de: 'Artefakte', fr: 'Artefacts', es: 'Artefactos', ar: 'الروابط' },
} as const

export default function CaseStudyPage({ slug }: { slug: string }) {
  const { lang, t } = useI18n()
  const study = getCaseStudy(slug)

  if (!study) return null

  return (
    <main id="main" tabIndex={-1} className="min-h-screen pb-20 pt-24">
      <article className="mx-auto max-w-4xl px-5">
        <Link href="/#projects" className="mb-8 inline-flex items-center gap-2 text-[var(--cd-accent)]">
          <ArrowLeft size={18} />
          {t(labels.back)}
        </Link>

        <div className="glass-surface glass-subtle p-6 sm:p-8">
          <div className="cd-section-eyebrow" style={{ marginBottom: 10 }}>
            {t(labels.eyebrow)}
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

        {study.stack && study.pipelineStages && (
          <section className="glass-surface glass-subtle mt-6 p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{t(labels.architecture)}</h2>
              <div className="flex flex-wrap gap-1.5">
                {study.stack.map((item) => (
                  <span
                    key={item}
                    className="rounded px-2 py-0.5 font-mono text-xs text-[var(--cd-accent)]"
                    style={{ background: 'var(--cd-elev)', border: '1px solid var(--cd-b0)' }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {study.pipelineStages.map((stage, idx) => (
                <div
                  key={idx}
                  className="rounded-lg p-3.5"
                  style={{
                    background: 'var(--cd-surf)',
                    border: '1px solid var(--cd-b0)',
                  }}
                >
                  <div className="mb-1.5 font-semibold text-sm text-[var(--cd-fg1)]">
                    {translateValue(lang, stage.title)}
                  </div>
                  <div className="text-xs leading-relaxed text-[var(--cd-fg2)]">
                    {translateValue(lang, stage.desc)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(['approach', 'results', 'lessons'] as const).map((key) => (
          <section key={key} className="glass-surface glass-subtle mt-6 p-5">
            <h2 className="mb-4 text-lg font-semibold">{t(labels[key])}</h2>
            <ul className="list-disc space-y-3 pl-5 text-[var(--cd-fg2)]">
              {study[key].map((item, idx) => (
                <li key={idx}>{translateValue(lang, item)}</li>
              ))}
            </ul>
          </section>
        ))}

        <section className="glass-surface glass-subtle mt-6 p-5">
          <h2 className="mb-4 text-lg font-semibold">{t(labels.artifacts)}</h2>
          <div className="flex flex-wrap gap-3">
            {study.artifacts.map((artifact, idx) => (
              <a
                key={idx}
                href={artifact.href}
                target={artifact.external || artifact.href.startsWith('http') ? '_blank' : undefined}
                rel={artifact.external || artifact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="cd-btn-ghost"
              >
                {translateValue(lang, artifact.label)}
              </a>
            ))}
          </div>
        </section>
      </article>
    </main>
  )
}
