'use client'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { claimParts, formatClaim } from '@/lib/claims'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import type { Language } from '@/lib/i18n-config'
import ResearchCharts from '@/components/ResearchCharts'
import SeparationLoss from '@/components/SeparationLoss'

const OodDemo = dynamic(() => import('@/components/OodDemo'))

/** `± 0.07%` in one language: the 3-seed spread of the thesis mean. */
const meanSpread = (lang: Language) => {
  const p = claimParts('thesis.mean', lang)
  return `± ${p.spread}${p.unit}`
}

const copy = {
  eyebrow: { en: '// Research', de: '// Forschung', fr: '// Recherche', es: '// Investigación', ar: '// الأبحاث' },
  title: { en: 'Reports & Thesis', de: 'Berichte & Thesis', fr: 'Rapports & mémoire', es: 'Informes y tesis', ar: 'التقارير والرسالة' },
  summaryProblemLabel: { en: 'Problem', de: 'Problem', fr: 'Problème', es: 'Problema', ar: 'المشكلة' },
  summaryProblemText: {
    en: 'How can a model recognize when an image does not belong, instead of acting overconfident?',
    de: 'Wie kann ein Modell erkennen, dass ein Bild nicht zur Verteilung gehört, statt übertrieben sicher zu reagieren?',
    fr: "Comment un modèle peut-il reconnaître qu'une image ne lui appartient pas au lieu de répondre avec trop de confiance ?",
    es: '¿Cómo puede un modelo reconocer que una imagen no pertenece a su distribución en vez de responder con exceso de confianza?',
    ar: 'كيف يمكن للنموذج أن يدرك أن الصورة لا تنتمي إلى بياناته بدلاً من أن يجيب بثقة زائدة؟',
  },
  summaryContributionLabel: { en: 'Contribution', de: 'Beitrag', fr: 'Contribution', es: 'Contribución', ar: 'المساهمة' },
  summaryContributionText: {
    en: 'A separation loss that forces the model’s competing class explanations to move apart.',
    de: 'Eine Separation Loss, die konkurrierende Klassenerklärungen des Modells auseinanderdrückt.',
    fr: "Une separation loss qui force les explications de classe concurrentes à s'éloigner.",
    es: 'Una separation loss que obliga a separar las explicaciones de clase rivales del modelo.',
    ar: 'خسارة فصل تدفع تفسيرات الفئات المتنافسة داخل النموذج إلى الابتعاد عن بعضها.',
  },
  summaryResultLabel: { en: 'Result', de: 'Ergebnis', fr: 'Résultat', es: 'Resultado', ar: 'النتيجة' },
  summaryResultText: {
    en: `${formatClaim('thesis.mean', 'en', 'metric')} on CIFAR-10 airplane-vs-rest (binary, single ID class, 3-seed mean), with a ${formatClaim('thesis.gainPp', 'en')} gain over the non-separated baseline.`,
    de: `${formatClaim('thesis.mean', 'de', 'metric')} auf CIFAR-10 airplane-vs-rest (binär, Einzelklasse, 3-Seed-Mittel) mit ${claimParts('thesis.gainPp', 'de').number} Prozentpunkten gegenüber der Basis ohne Separation.`,
    fr: `${formatClaim('thesis.mean', 'fr', 'metric')} sur CIFAR-10 airplane-vs-rest (binaire, classe unique, moyenne 3 seeds) avec un gain de ${claimParts('thesis.gainPp', 'fr').number} points face à la baseline sans séparation.`,
    es: `${formatClaim('thesis.mean', 'es', 'metric')} en CIFAR-10 airplane-vs-rest (binaria, clase única, media 3 seeds) con una mejora de ${claimParts('thesis.gainPp', 'es').number} puntos sobre la base sin separación.`,
    ar: `${formatClaim('thesis.mean', 'ar', 'metric')} على CIFAR-10 airplane-vs-rest (ثنائي، فئة واحدة، متوسط 3 بذور) مع تحسن قدره \u2066${claimParts('thesis.gainPp', 'ar').number}\u2069 نقطة على الخط الأساسي بدون فصل.`,
  },
  summaryImpactLabel: { en: 'Why it matters', de: 'Warum es zählt', fr: 'Pourquoi cela compte', es: 'Por qué importa', ar: 'لماذا يهم ذلك' },
  summaryImpactText: {
    en: 'The score became not only higher, but also much more stable across seeds.',
    de: 'Der Score wurde nicht nur höher, sondern auch deutlich stabiler über verschiedene Seeds hinweg.',
    fr: 'Le score est devenu non seulement plus élevé, mais aussi beaucoup plus stable entre les seeds.',
    es: 'La puntuación no solo subió, sino que también se volvió mucho más estable entre semillas.',
    ar: 'لم ترتفع النتيجة فقط، بل أصبحت أكثر ثباتاً بكثير عبر البذور.',
  },
  track1: { en: "Master's Thesis (Track 1) - JKU Linz - 2026", de: 'Masterarbeit (Track 1) - JKU Linz - 2026', fr: 'Mémoire de master (Track 1) - JKU Linz - 2026', es: 'Tesis de máster (Track 1) - JKU Linz - 2026', ar: 'رسالة ماجستير (المسار 1) - JKU لينتس - 2026' },
  thesisTitle: { en: 'Conditional Diffusion Models as Generative Classifiers for Out-of-Distribution Detection in Inkjet Print Quality Control', de: 'Konditionale Diffusionsmodelle als generative Klassifikatoren für OOD-Erkennung in der Inkjet-Druckqualitätskontrolle', fr: 'Modèles de diffusion conditionnels comme classificateurs génératifs pour détection OOD dans le contrôle qualité impression inkjet', es: 'Modelos de difusión condicional como clasificadores generativos para detección OOD en control de calidad de impresión inkjet', ar: 'نماذج الانتشار الشرطية كمصنفات توليدية لكشف الخارج عن التوزيع في مراقبة جودة الطباعة النافثة' },
  thesisDesc: { en: 'A diffusion model compares how well different class explanations reconstruct an image. The new separation loss pushes those explanations apart, making the anomaly score clearer and more stable.', de: 'Ein Diffusionsmodell vergleicht, wie gut verschiedene Klassenerklärungen ein Bild rekonstruieren. Die neue Separation Loss trennt diese Erklärungen und macht den Anomalie-Score klarer und stabiler.', fr: "Un modèle de diffusion compare la reconstruction selon différentes explications de classe. La separation loss les éloigne et rend le score d'anomalie plus clair et stable.", es: 'Un modelo de difusión compara reconstrucciones bajo distintas explicaciones de clase. La separation loss las separa y hace el score de anomalía más claro y estable.', ar: 'يقارن نموذج الانتشار مدى قدرة تفسيرات الفئات المختلفة على إعادة بناء الصورة. خسارة الفصل تبعد هذه التفسيرات وتجعل درجة الشذوذ أوضح وأكثر ثباتاً.' },
  supervisor: { en: 'Supervisor', de: 'Betreuer', fr: 'Superviseur', es: 'Supervisor', ar: 'المشرف' },
  assistant: { en: 'Assistant', de: 'Assistent', fr: 'Assistant', es: 'Asistente', ar: 'المساعد' },
  metricLabel: { en: 'Mean AUROC · CIFAR-10 airplanes vs. other classes', de: 'Mittlere AUROC · CIFAR-10: Flugzeuge gegen andere Klassen', fr: 'AUROC moyenne · CIFAR-10 : avions contre les autres classes', es: 'AUROC media · CIFAR-10: aviones frente a otras clases', ar: 'متوسط AUROC · CIFAR-10: الطائرات مقابل الفئات الأخرى' },
  variance: { en: `${meanSpread('en')} std dev (3 seeds)`, de: `${meanSpread('de')} Std.-Abw. (3 Seeds)`, fr: `${meanSpread('fr')} écart-type (3 seeds)`, es: `${meanSpread('es')} desv. est. (3 semillas)`, ar: `${meanSpread('ar')} انحراف معياري (3 بذور)` },
  chartHeading: {
    en: 'Separation-weight sweep · Threshold calibration · Reconstruction error',
    de: 'Variation des Separationsgewichts · Schwellenwertkalibrierung · Rekonstruktionsfehler',
    fr: 'Balayage du poids de séparation · Calibration du seuil · Erreur de reconstruction',
    es: 'Barrido del peso de separación · Calibración del umbral · Error de reconstrucción',
    ar: 'مسح وزن الفصل · معايرة العتبة · خطأ إعادة البناء',
  },
  thesisPdf: { en: 'View Full Thesis (PDF)', de: 'Vollständige Thesis ansehen (PDF)', fr: 'Voir le mémoire complet (PDF)', es: 'Ver tesis completa (PDF)', ar: 'عرض الرسالة كاملة (PDF)' },
  track2: { en: "Master's Thesis (Track 2) - JKU Linz - 2026", de: 'Masterarbeit (Track 2) - JKU Linz - 2026', fr: 'Mémoire de master (Track 2) - JKU Linz - 2026', es: 'Tesis de máster (Track 2) - JKU Linz - 2026', ar: 'رسالة ماجستير (المسار 2) - JKU لينتس - 2026' },
  track2Title: { en: 'Rigorous Cross-Domain Transfer & FTI_Zer0P Benchmark', de: 'Strenger Cross-Domain Transfer & FTI_Zer0P Benchmark', fr: 'Transfert cross-domain rigoureux & benchmark FTI_Zer0P', es: 'Transferencia cross-domain rigurosa y benchmark FTI_Zer0P', ar: 'انتقال صارم بين المجالات ومعيار FTI_Zer0P' },
  track2Desc: { en: 'The public YOLO+CDM print-quality pipeline was evaluated on FTI_Zer0P with strict 5-fold cross-validation, showing the limits of transfer.', de: 'Die öffentliche YOLO+CDM Pipeline wurde auf FTI_Zer0P mit strenger 5-facher Kreuzvalidierung evaluiert und zeigt die Grenzen der Übertragbarkeit.', fr: 'La pipeline publique YOLO+CDM a été évaluée sur FTI_Zer0P avec validation croisée stricte en 5 plis, montrant les limites du transfert.', es: 'La pipeline pública YOLO+CDM se evaluó en FTI_Zer0P con validación cruzada estricta de 5 folds, mostrando los límites de transferencia.', ar: 'تم تقييم خط YOLO+CDM العام على FTI_Zer0P بتحقق تقاطعي صارم من 5 طيات، مع توضيح حدود الانتقال.' },
  track2Meta: {
    en: 'Public Benchmark - InkjetOOD Codebase - FTI_Zer0P Public Dataset',
    de: 'Öffentlicher Benchmark - InkjetOOD Codebasis - Öffentlicher FTI_Zer0P Datensatz',
    fr: 'Benchmark public - base de code InkjetOOD - jeu de données public FTI_Zer0P',
    es: 'Benchmark público - base de código InkjetOOD - conjunto de datos público FTI_Zer0P',
    ar: 'معيار عام - كود InkjetOOD - مجموعة بيانات FTI_Zer0P العامة',
  },
  auroc5FoldCv: {
    en: 'AUROC - 5-Fold CV Baseline',
    de: 'AUROC - 5-fache Kreuzvalidierungs-Baseline',
    fr: 'AUROC - baseline validation croisée 5 plis',
    es: 'AUROC - línea base 5-fold CV',
    ar: 'AUROC - خط أساس التحقق التقاطعي الخماسي',
  },
  publicEval: { en: 'Rigorous Public Evaluation', de: 'Strenge öffentliche Evaluierung', fr: 'Évaluation publique rigoureuse', es: 'Evaluación pública rigurosa', ar: 'تقييم عام صارم' },
  datasetOverview: {
    en: 'Dataset Overview',
    de: 'Datensatz-Übersicht',
    fr: 'Aperçu du jeu de données',
    es: 'Descripción del conjunto de datos',
    ar: 'نظرة عامة على مجموعة البيانات',
  },
  fiveFoldCv: {
    en: '5-Fold Cross-Validation',
    de: '5-fache Kreuzvalidierung',
    fr: 'Validation croisée en 5 plis',
    es: 'Validación cruzada de 5 folds',
    ar: 'تحقق تقاطعي خماسي (5-Fold)',
  },
  zeroDefectSamples: {
    en: 'Zero-defect samples',
    de: 'Fehlerfreie Stichproben',
    fr: 'Échantillons sans défaut',
    es: 'Muestras sin defectos',
    ar: 'عينات خالية من العيوب',
  },
  defectCategories: {
    en: 'Defect categories',
    de: 'Fehlerkategorien',
    fr: 'Catégories de défauts',
    es: 'Categorías de defectos',
    ar: 'فئات العيوب',
  },
  printImageCrops: {
    en: 'Industrial print-image crops',
    de: 'Ausschnitte industrieller Druckbilder',
    fr: 'Recadrages d’images d’impressions industrielles',
    es: 'Recortes de imágenes de impresiones industriales',
    ar: 'قصاصات من صور المطبوعات الصناعية',
  },
  industrialReport: { en: 'View Early Technical Report (2024)', de: 'Frühzeitigen Technikbericht ansehen (2024)', fr: 'Voir le rapport technique précoce (2024)', es: 'Ver informe técnico temprano (2024)', ar: 'عرض التقرير التقني المبكر (2024)' },
  diffusionCaseStudy: {
    en: 'Case Study',
    de: 'Fallstudie',
    fr: 'Étude de cas',
    es: 'Caso de estudio',
    ar: 'دراسة الحالة',
  },
  diffusionCode: {
    en: 'Code: DiffusionOOD',
    de: 'Code: DiffusionOOD',
    fr: 'Code : DiffusionOOD',
    es: 'Código: DiffusionOOD',
    ar: 'الكود: DiffusionOOD',
  },
  diffusionHf: {
    en: 'HF: Raw Scores & Weights',
    de: 'HF: Rohwerte & Gewichte',
    fr: 'HF : Scores bruts & poids',
    es: 'HF: Puntuaciones y pesos',
    ar: 'HF: النتائج الخام والأوزان',
  },
  inkjetCode: {
    en: 'Code: InkjetOOD',
    de: 'Code: InkjetOOD',
    fr: 'Code : InkjetOOD',
    es: 'Código: InkjetOOD',
    ar: 'الكود: InkjetOOD',
  },
  inkjetHf: {
    en: 'HF: Model Weights',
    de: 'HF: Modellgewichte',
    fr: 'HF : Poids du modèle',
    es: 'HF: Pesos del modelo',
    ar: 'HF: أوزان النموذج',
  },
  loadInteractiveLab: {
    en: 'Launch Interactive Thesis Explorer',
    de: 'Interaktives Thesis-Labor starten',
    fr: 'Lancer le laboratoire interactif de thèse',
    es: 'Abrir laboratorio interactivo de tesis',
    ar: 'تشغيل مختبر الأطروحة التفاعلي',
  },
  tryExplorer: {
    en: 'Try the explorer',
    de: 'Explorer ausprobieren',
    fr: 'Essayer l’explorateur',
    es: 'Probar el explorador',
    ar: 'جرّب المستكشف',
  },
} satisfies Record<string, TranslationMap>

const publications: Array<{ title: string; venue: TranslationMap; href: string }> = [
  {
    title: 'Motor Imagery Classification Based Brain-Computer Interface for Rehabilitation',
    venue: {
      en: 'Karunya Institute of Technology and Sciences · 2023',
      de: 'Karunya Institute of Technology and Sciences · 2023',
      fr: 'Karunya Institute of Technology and Sciences · 2023',
      es: 'Karunya Institute of Technology and Sciences · 2023',
      ar: 'معهد كارونيا للتكنولوجيا والعلوم · 2023',
    },
    href: '/Motor%20Imagery%20classification%20Based%20Brain%20Computer.pdf',
  },
  {
    title: 'Reading Thoughts Using GANs',
    venue: {
      en: 'Project Report · JKU Linz · 2023',
      de: 'Projektbericht · JKU Linz · 2023',
      fr: 'Rapport de projet · JKU Linz · 2023',
      es: 'Informe de proyecto · JKU Linz · 2023',
      ar: 'تقرير مشروع · JKU لينتس · 2023',
    },
    href: '/Reading%20Thoughts%20Using%20GANs.pdf',
  },
]

function RtlArrow() {
  return <span className="inline-block rtl:rotate-180" aria-hidden="true">&rarr;</span>
}

/**
 * Renders the two-track M.Sc. thesis research section (CIFAR-10 binary CDM OOD detection
 * and FTI_Zer0P inkjet print quality control) with lightbox figures and the on-demand
 * interactive thesis explorer.
 */
export default function Research() {
  const { t, lang } = useI18n()
  const thesisParts = claimParts('thesis.mean', lang)
  const inkjetParts = claimParts('inkjet.baseline', lang)
  const [shouldRenderLab, setShouldRenderLab] = useState(false)
  const labContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shouldRenderLab) return
    const node = labContainerRef.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldRenderLab(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldRenderLab(true)
          observer.disconnect()
        }
      },
      { rootMargin: '350px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [shouldRenderLab])

  return (
    <section id="research" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <h2 className="cd-section-title" style={{ marginBottom: 32 }}>{t(copy.title)}</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: 14,
            marginBottom: 24,
          }}
        >
          {[
            [t(copy.summaryProblemLabel), t(copy.summaryProblemText)],
            [t(copy.summaryContributionLabel), t(copy.summaryContributionText)],
            [t(copy.summaryResultLabel), t(copy.summaryResultText)],
            [t(copy.summaryImpactLabel), t(copy.summaryImpactText)],
          ].map(([label, text]) => (
            <div
              className="cd-summary-card glass-surface glass-subtle"
              key={label}
            >
              <div className="cd-band-eyebrow" style={{ marginBottom: 10 }}>{label}</div>
              <div style={{ color: 'var(--cd-fg2)', fontSize: 14, lineHeight: 1.65 }}>{text}</div>
            </div>
          ))}
        </div>

        <div className="cd-research-featured" itemScope itemType="https://schema.org/Thesis">
          <div className="cd-rf-header">
            <div className="cd-rf-left">
              <div className="cd-rf-label">{t(copy.track1)}</div>
              <h3 className="cd-rf-title" itemProp="name">{t(copy.thesisTitle)}</h3>
              <div className="cd-rf-desc" itemProp="description">
                {t(copy.thesisDesc)}
              </div>
              <div className="cd-rf-meta">
                {t(copy.supervisor)}: Prof. Sepp Hochreiter - {t(copy.assistant)}: Claus Hofmann, MSc - JKU Linz - 2026
              </div>
            </div>
            <div className="cd-rf-metric">
              <div className="cd-rf-metric-num" dir="ltr">{thesisParts.number}<span className="cd-rf-metric-unit">{thesisParts.unit}</span></div>
              <div className="cd-rf-metric-label">{t(copy.metricLabel)}</div>
              <div className="cd-rf-metric-delta">{t(copy.variance)}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 pb-4 min-[481px]:px-6 min-[769px]:px-8">
            <a href="/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf" target="_blank" rel="noopener noreferrer" className="cd-proj-link">
              {t(copy.thesisPdf)} <RtlArrow />
            </a>
            <a href="https://github.com/ahmed-3m/DiffusionOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link">
              {t(copy.diffusionCode)} <RtlArrow />
            </a>
            <a href="#ood-explorer" className="cd-proj-link" onClick={() => setShouldRenderLab(true)}>
              {t(copy.tryExplorer)} <span aria-hidden="true">&darr;</span>
            </a>
          </div>

          <SeparationLoss />

          <div className="px-4 min-[481px]:px-6 min-[769px]:px-8">
            <div className="cd-band-eyebrow" style={{ marginTop: 20, marginBottom: 10 }}>
              {t(copy.chartHeading)}
            </div>

            <ResearchCharts track="cifar" />
          </div>

          <div id="ood-explorer" className="scroll-mt-24" ref={labContainerRef} style={{ minHeight: shouldRenderLab ? undefined : 720 }}>
            {shouldRenderLab ? (
              <OodDemo />
            ) : (
              <div style={{ marginTop: 24, marginBottom: 24, textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShouldRenderLab(true)}
                  className="cd-proj-link"
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    border: '1px solid var(--cd-b1)',
                    background: 'var(--cd-surf)',
                    cursor: 'pointer',
                  }}
                >
                  {t(copy.loadInteractiveLab)} <RtlArrow />
                </button>
              </div>
            )}
          </div>

          <div className="cd-rf-footer" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/case-studies/diffusion-ood/" className="cd-proj-link">
              {t(copy.diffusionCaseStudy)} <RtlArrow />
            </Link>
            <a href="https://huggingface.co/ahmed-3m/DiffusionOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link">
              {t(copy.diffusionHf)} <RtlArrow />
            </a>
          </div>
        </div>

        <div className="cd-research-featured">
          <div className="cd-rf-header">
            <div className="cd-rf-left">
              <div className="cd-rf-label">{t(copy.track2)}</div>
              <h3 className="cd-rf-title">{t(copy.track2Title)}</h3>
              <div className="cd-rf-desc">{t(copy.track2Desc)} <strong>{formatClaim('inkjet.baseline', lang, 'full')}</strong>.</div>
              <div className="cd-rf-meta">{t(copy.track2Meta)}</div>
            </div>
            <div className="cd-rf-metric">
              <div className="cd-rf-metric-num" dir="ltr">{inkjetParts.number}<span className="cd-rf-metric-unit"> ± {inkjetParts.spread}</span></div>
              <div className="cd-rf-metric-label">{t(copy.auroc5FoldCv)}</div>
              <div className="cd-rf-metric-delta">{t(copy.publicEval)}</div>
            </div>
          </div>

          <div className="px-4 min-[481px]:px-6 min-[769px]:px-8">
            <div className="cd-band-eyebrow" style={{ marginTop: 20, marginBottom: 10 }}>
              {t(copy.datasetOverview)}: {t(copy.printImageCrops)} · {t(copy.zeroDefectSamples)} · {t(copy.defectCategories)} · {t(copy.fiveFoldCv)}
            </div>

            <ResearchCharts track="industrial" />
          </div>

          <div className="cd-rf-footer" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="/Diffusion-Based%20Multi-class%20Defect%20Detection.pdf" target="_blank" rel="noopener noreferrer" className="cd-proj-link">{t(copy.industrialReport)} <RtlArrow /></a>
            <a href="https://github.com/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link">{t(copy.inkjetCode)} <RtlArrow /></a>
            <a href="https://huggingface.co/ahmed-3m/InkjetOOD" target="_blank" rel="noopener noreferrer" className="cd-proj-link">{t(copy.inkjetHf)} <RtlArrow /></a>
          </div>
        </div>

        <div className="cd-pub-list">
          {publications.map(pub => (
            <a key={pub.href} href={pub.href} target="_blank" rel="noopener noreferrer" className="cd-pub-item">
              <div>
                <div className="cd-pub-title">{pub.title}</div>
                <div className="cd-pub-venue">{t(pub.venue)}</div>
              </div>
              <div className="cd-pub-arrow"><RtlArrow /></div>
            </a>
          ))}
        </div>
      </div>

    </section>
  )
}
