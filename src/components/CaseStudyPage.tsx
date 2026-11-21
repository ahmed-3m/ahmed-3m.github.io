'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useI18n } from '@/lib/i18n'
import { getCaseStudy } from '@/lib/case-studies'
import { caseStudyOverview } from '@/lib/case-study-overview'
import { portfolioCopy, selectedWork } from '@/lib/portfolio-copy'
import { CIFAR_LAMBDA_SWEEP, INKJET_OVERALL_SWEEP } from '@/lib/ood-explorer-data'
import ResearchCharts from '@/components/ResearchCharts'

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

const sihemExample = {
  title: { en: 'Example: A change of plans', de: 'Beispiel: Eine Planänderung', fr: 'Exemple : un changement de programme', es: 'Ejemplo: un cambio de planes', ar: 'مثال: تغيير في الخطة' },
  context: {
    en: 'Imagine a study session moves on your calendar. Sihem checks the updated schedule and your routines before deciding whether to send a Telegram check-in. If the rules trigger one, the language model writes the message.',
    de: 'Angenommen, eine Lerneinheit wird in deinem Kalender verschoben. Sihem prüft den neuen Zeitplan und deine Routinen. Wenn die Regeln eine Nachfrage auslösen, schreibt das Sprachmodell die Nachricht für Telegram.',
    fr: 'Imaginez qu’une séance d’étude soit déplacée dans votre calendrier. Sihem vérifie le nouvel horaire et vos habitudes. Si ses règles déclenchent un suivi, le modèle de langage rédige le message pour Telegram.',
    es: 'Imagina que una sesión de estudio cambia de hora en tu calendario. Sihem comprueba el nuevo horario y tus rutinas. Si sus reglas activan un seguimiento, el modelo de lenguaje redacta el mensaje para Telegram.',
    ar: 'تخيّل أن موعد جلسة مذاكرة تغيّر في تقويمك. يراجع Sihem الموعد الجديد وروتينك قبل أن يقرر إرسال رسالة متابعة على تيليجرام. إذا أشارت القواعد إلى الحاجة للمتابعة، يصوغ نموذج اللغة الرسالة.',
  },
} as const

const OodDemo = dynamic(() => import('./OodDemo'))

const labels = {
  back: { en: 'Back to portfolio', de: 'Zurück zum Portfolio', fr: 'Retour au portfolio', es: 'Volver al portfolio', ar: 'العودة إلى البورتفوليو' },
  problem: { en: 'Problem', de: 'Problem', fr: 'Problème', es: 'Problema', ar: 'المشكلة' },
  contribution: { en: 'My contribution', de: 'Mein Beitrag', fr: 'Ma contribution', es: 'Mi contribución', ar: 'مساهمتي' },
  outcome: { en: 'Outcome', de: 'Ergebnis', fr: 'Résultat', es: 'Resultado', ar: 'النتيجة' },
  evaluation: { en: 'Evaluation', de: 'Evaluation', fr: 'Évaluation', es: 'Evaluación', ar: 'التقييم' },
  limitations: { en: 'Design choices and limitations', de: 'Entscheidungen und Grenzen', fr: 'Choix et limites', es: 'Decisiones y límites', ar: 'القرارات والحدود' },
  cifarSetup: {
    en: 'Mean ± standard deviation across three seeds on CIFAR-10 (airplanes versus the other nine classes), with λ = 0.02 and K = 50 scoring samples per image.',
    de: 'Mittelwert ± Standardabweichung über drei Seeds auf CIFAR-10 (Flugzeuge gegen die übrigen neun Klassen), mit λ = 0.02 und K = 50 Stichproben pro Bild.',
    fr: 'Moyenne ± écart type sur trois graines sur CIFAR-10 (avions contre les neuf autres classes), avec λ = 0.02 et K = 50 échantillons par image.',
    es: 'Media ± desviación estándar de tres semillas en CIFAR-10 (aviones frente a las otras nueve clases), con λ = 0.02 y K = 50 muestras por imagen.',
    ar: 'المتوسط ± الانحراف المعياري عبر ثلاث بذور على CIFAR-10 (الطائرات مقابل الفئات التسع الأخرى)، عند λ = 0.02 وK = 50 عينة لحساب درجة كل صورة.',
  },
  inkjetSetup: {
    en: 'Mean ± standard deviation for the FTI_Zer0P print dataset across five stratified folds split by source image, with λ = 0 (baseline) and K = 100 scoring samples per crop.',
    de: 'Mittelwert ± Standardabweichung für die FTI_Zer0P-Druckdaten über fünf stratifizierte Folds, getrennt nach Quellbild, mit λ = 0 (Baseline) und K = 100 Stichproben pro Ausschnitt.',
    fr: 'Moyenne ± écart type pour FTI_Zer0P sur cinq partitions stratifiées par image source, avec λ = 0 (référence) et K = 100 échantillons par zone.',
    es: 'Media ± desviación estándar para FTI_Zer0P en cinco particiones estratificadas por imagen de origen, con λ = 0 (referencia) y K = 100 muestras por recorte.',
    ar: 'المتوسط ± الانحراف المعياري لمجموعة طباعة FTI_Zer0P عبر خمس طيات طبقية مقسّمة حسب الصورة الأصلية، عند λ = 0 (خط الأساس) وK = 100 عينة لكل جزء مقتطع.',
  },
  auroc: {
    en: 'AUROC measures how well the scores rank unfamiliar examples above familiar ones across decision thresholds.',
    de: 'AUROC misst, wie gut die Scores unbekannte Beispiele über vertraute einordnen, über verschiedene Schwellenwerte hinweg.',
    fr: 'L’AUROC mesure dans quelle mesure les scores classent les exemples inhabituels au-dessus des exemples familiers, tous seuils confondus.',
    es: 'El AUROC mide qué tan bien las puntuaciones colocan los ejemplos desconocidos por encima de los conocidos a lo largo de distintos umbrales.',
    ar: 'يقيس AUROC مدى نجاح الدرجات في ترتيب الأمثلة غير المألوفة فوق الأمثلة المألوفة عبر عتبات قرار مختلفة.',
  },
  approach: { en: 'Approach', de: 'Ansatz', fr: 'Approche', es: 'Enfoque', ar: 'المنهج' },
  artifacts: { en: 'Artifacts', de: 'Artefakte', fr: 'Artefacts', es: 'Artefactos', ar: 'الروابط' },
} as const

export default function CaseStudyPage({ slug }: { slug: keyof typeof caseStudyOverview }) {
  const { t } = useI18n()
  const study = getCaseStudy(slug)
  const project = selectedWork.find((work) => work.slug === slug)

  if (!study || !project) return null

  const overview = caseStudyOverview[slug]
  const track = slug === 'diffusion-ood' ? 'cifar' : slug === 'inkjet-ood' ? 'industrial' : null
  const cifar = CIFAR_LAMBDA_SWEEP[3] // Table 6.6, λ = 0.02
  const inkjet = INKJET_OVERALL_SWEEP['0.0']

  return (
    <main id="main" tabIndex={-1} className="portfolio-case">
      <article className="portfolio-shell">
        <Link href="/#projects" className="portfolio-text-link">{t(labels.back)}</Link>
        <header>
          <p className="portfolio-project-context">{t(project.context)}</p>
          <h1>{t(project.title)}</h1>
        </header>

        <div className="portfolio-case-overview">
          {(['problem', 'contribution', 'outcome'] as const).map((key) => (
            <section key={key}>
              <h2>{t(labels[key])}</h2>
              <p>{t(overview[key])}</p>
            </section>
          ))}
        </div>

        <div className="portfolio-case-links">
          <Link href="#evaluation" className="portfolio-text-link">{t(labels.evaluation)}</Link>
          {track === 'cifar' && <Link href="#ood-explorer" className="portfolio-text-link">{t(portfolioCopy.explorer)}</Link>}
          <Link href="#artifacts" className="portfolio-text-link">{t(labels.artifacts)}</Link>
        </div>

        <section className="portfolio-case-section">
          <h2>{t(labels.approach)}</h2>
          <ul className="list-disc space-y-2 ps-5">
            {study.approach.map((item) => <li key={item.en}>{t(item)}</li>)}
          </ul>
          {study.pipelineStages && (
            <ol className="grid gap-4 pt-5 sm:grid-cols-3">
              {study.pipelineStages.map((stage) => (
                <li key={stage.title.en} className="min-w-0 border-s border-[var(--cd-b1)] ps-3">
                  <h3 className="font-semibold text-[var(--cd-fg1)]">{t(stage.title)}</h3>
                  <p className="mt-1">{t(stage.desc)}</p>
                </li>
              ))}
            </ol>
          )}
          {study.stack && <p className="mt-4 text-sm"><bdi>{study.stack.join(' · ')}</bdi></p>}
        </section>

        {slug === 'sihem' && (
          <section className="portfolio-case-section">
            <h2>{t(sihemExample.title)}</h2>
            <p>{t(sihemExample.context)}</p>
          </section>
        )}

        <section className="portfolio-case-section" id="evaluation" aria-labelledby="evaluation-title">
          <h2 id="evaluation-title">{t(labels.evaluation)}</h2>
          {track && (
            <div className="portfolio-case-highlight">
              <p>
                <strong>
                  <bdi>{track === 'cifar'
                    ? `${cifar.withinCifarMean.toFixed(2)}% ± ${cifar.withinCifarStd?.toFixed(2)}% AUROC`
                    : `${inkjet.aurocMean.toFixed(4)} ± ${inkjet.aurocStd.toFixed(4)} AUROC`}</bdi>
                </strong>
                {' · '}{t(track === 'cifar' ? labels.cifarSetup : labels.inkjetSetup)}
              </p>
              <p className="mt-2">{t(labels.auroc)}</p>
            </div>
          )}
          <ul className="list-disc space-y-2 ps-5">
            {study.results.map((item) => <li key={item.en}>{t(item)}</li>)}
          </ul>
          {track && <ResearchCharts track={track} />}
          {track === 'cifar' && <Link href="#ood-explorer" className="portfolio-text-link">{t(portfolioCopy.explorer)}</Link>}
        </section>

        <section className="portfolio-case-section">
          <h2>{t(labels.limitations)}</h2>
          <p>{t(decisions[slug])}</p>
          <ul className="mt-3 list-disc space-y-2 ps-5">
            {study.lessons.map((item) => <li key={item.en}>{t(item)}</li>)}
          </ul>
        </section>

        <section className="portfolio-case-section" id="artifacts">
          <h2>{t(labels.artifacts)}</h2>
          <div className="portfolio-case-links">
            {study.artifacts.map((artifact) => {
              const label = t(artifact.label)
              if (artifact.external) {
                return (
                  <a
                    key={artifact.href}
                    href={artifact.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portfolio-text-link"
                  >
                    {label}
                  </a>
                )
              }
              if (artifact.href.startsWith('/') && !artifact.href.endsWith('.pdf')) {
                return (
                  <Link key={artifact.href} href={artifact.href} className="portfolio-text-link">
                    {label}
                  </Link>
                )
              }
              return (
                <a key={artifact.href} href={artifact.href} className="portfolio-text-link">
                  {label}
                </a>
              )
            })}
          </div>
        </section>

        {track === 'cifar' && <OodDemo id="ood-explorer" heading="h2" />}
      </article>
    </main>
  )
}
