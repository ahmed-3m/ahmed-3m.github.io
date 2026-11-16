'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { translateValue } from '@/lib/i18n-config'
import { getCaseStudy } from '@/lib/case-studies'

const decisions = {
  'diffusion-ood': {
    en: 'Conditional reconstruction compares competing class explanations instead of relying on classifier confidence. Repeating the score across noise samples reduces randomness but increases inference cost; this benchmark is a binary airplane-vs-rest task, not a general accuracy guarantee.',
    de: 'Konditionale Rekonstruktion vergleicht konkurrierende Klassenerklärungen statt Klassifikator-Konfidenz. Wiederholte Scores reduzieren Zufälligkeit, erhöhen aber die Inferenzkosten. Der Benchmark ist eine binäre Flugzeug-vs-Rest-Aufgabe und keine allgemeine Genauigkeitsgarantie.',
    fr: 'La reconstruction conditionnelle compare des explications de classes au lieu de la confiance du classificateur. Répéter le score réduit le hasard mais augmente le coût. Ce benchmark est une tâche binaire avion contre reste, sans garantie générale de précision.',
    es: 'La reconstrucción condicional compara explicaciones de clases en lugar de la confianza del clasificador. Repetir la puntuación reduce la aleatoriedad pero aumenta el coste. El benchmark es una tarea binaria avión frente al resto, sin garantía general de precisión.',
    ar: 'تقارن إعادة البناء الشرطية تفسيرات الفئات بدلاً من الاعتماد على ثقة المصنف. تكرار الدرجة يقلل العشوائية ويزيد تكلفة الاستدلال. المعيار مهمة ثنائية للطائرة مقابل الباقي وليس ضماناً عاماً للدقة.',
  },
  'inkjet-ood': {
    en: 'The two-stage pipeline localizes print features before quality scoring. Five-fold evaluation exposes variation that one train/test split can hide. The CIFAR separation-loss gain did not transfer reliably to this industrial dataset; an industrial deployment also needs its own latency and operating-threshold validation.',
    de: 'Die zweistufige Pipeline lokalisiert Druckmerkmale vor der Qualitätsbewertung. Die fünffache Evaluation zeigt Streuung, die ein einzelner Split verbergen kann. Der CIFAR-Gewinn übertrug sich nicht zuverlässig; ein industrieller Einsatz benötigt eigene Latenz- und Schwellenwertprüfungen.',
    fr: 'Le pipeline localise les éléments imprimés avant de noter leur qualité. La validation en cinq plis révèle une variation masquée par un seul split. Le gain CIFAR ne se transfère pas de façon fiable ; un déploiement industriel exige de valider latence et seuil.',
    es: 'El pipeline localiza los elementos impresos antes de puntuar su calidad. La evaluación de cinco particiones revela variación que una sola división puede ocultar. La mejora CIFAR no se transfirió de forma fiable; un despliegue industrial requiere validar latencia y umbral.',
    ar: 'يحدد المسار مواضع عناصر الطباعة قبل تقييم الجودة. يكشف التحقق الخماسي تبايناً قد يخفيه تقسيم واحد. لم تنتقل مكاسب CIFAR بشكل موثوق؛ يتطلب النشر الصناعي تحققاً مستقلاً من زمن الاستدلال وعتبة التشغيل.',
  },
  sihem: {
    en: 'Deterministic scheduling controls when a check-in is sent; the language model composes the message. This makes trigger rules inspectable compared with asking an LLM to make every scheduling decision. Provider failover reduces dependence on one API but adds routing and cost-tracking complexity. This is an invitation-only beta, not a measured claim of improved user outcomes.',
    de: 'Deterministische Planung steuert Check-ins; das Sprachmodell formuliert die Nachricht. Regeln sind dadurch prüfbar, statt jede Entscheidung einem LLM zu überlassen. Anbieter-Failover reduziert API-Abhängigkeit, erhöht aber Routing- und Kostenkomplexität. Beta nur mit Einladung; keine gemessene Wirkung auf Nutzerergebnisse.',
    fr: 'La planification déterministe contrôle les suivis ; le modèle rédige le message. Les règles sont inspectables sans confier chaque décision au LLM. Le basculement réduit la dépendance à une API mais complexifie routage et coûts. Bêta sur invitation, sans mesure d’amélioration des résultats utilisateurs.',
    es: 'La planificación determinista controla los seguimientos; el modelo redacta el mensaje. Las reglas son inspeccionables sin delegar cada decisión al LLM. La conmutación reduce la dependencia de una API pero añade complejidad de rutas y costes. Beta por invitación, sin afirmar mejoras medidas para los usuarios.',
    ar: 'تحدد الجدولة الحتمية توقيت المتابعة ويصوغ النموذج الرسالة. يجعل ذلك القواعد قابلة للفحص بدلاً من إسناد كل قرار للنموذج. يقلل تبديل المزود الاعتماد على واجهة واحدة لكنه يزيد تعقيد التوجيه والتكلفة. النسخة تجريبية بدعوة ولا تدعي نتائج مستخدمين محسنة بقياس موثق.',
  },
} as const

const OodDemo = dynamic(() => import('./OodDemo'))

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

        <section className="glass-surface glass-subtle mt-6 p-5">
          <h2 className="mb-3 text-lg font-semibold">{t({ en: 'Design choices & limitations', de: 'Entscheidungen und Grenzen', fr: 'Choix et limites', es: 'Decisiones y límites', ar: 'القرارات والحدود' })}</h2>
          <p className="text-[var(--cd-fg2)]">{t(decisions[study.slug])}</p>
        </section>

        {(['approach', 'results', 'lessons'] as const).map((key) => (
          <Fragment key={key}>
            <section className="glass-surface glass-subtle mt-6 p-5">
              <h2 className="mb-4 text-lg font-semibold">{t(labels[key])}</h2>
              <ul className="list-disc space-y-3 ps-5 text-[var(--cd-fg2)]">
                {study[key].map((item, idx) => (
                  <li key={idx}>{translateValue(lang, item)}</li>
                ))}
              </ul>
            </section>
            {key === 'results' && study.slug === 'diffusion-ood' && <OodDemo />}
          </Fragment>
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

