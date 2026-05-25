'use client'

import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  eyebrow: { en: '// Proof', de: '// Nachweise', fr: '// Preuves', es: '// Evidencia', ar: '// أدلة' },
  title: {
    en: 'Selected evidence.',
    de: 'Ausgewaehlte Nachweise.',
    fr: 'Preuves selectionnees.',
    es: 'Evidencia seleccionada.',
    ar: 'أدلة مختارة.',
  },
  intro: {
    en: 'Public artifacts, reports, and repositories behind the portfolio claims.',
    de: 'Oeffentliche Artefakte, Berichte und Repositorien hinter den Aussagen im Portfolio.',
    fr: 'Artefacts publics, rapports et depots derriere les affirmations du portfolio.',
    es: 'Artefactos publicos, informes y repositorios detras de las afirmaciones del portfolio.',
    ar: 'الروابط العامة والتقارير والمستودعات التي تدعم ما يظهر في البورتفوليو.',
  },
  caseStudy: { en: 'Case study', de: 'Case Study', fr: 'Etude de cas', es: 'Caso de estudio', ar: 'دراسة حالة' },
  proof: { en: 'Proof', de: 'Nachweis', fr: 'Preuve', es: 'Prueba', ar: 'دليل' },
} satisfies Record<string, TranslationMap>

const evidenceItems = [
  {
    title: { en: 'Master thesis PDF', de: 'Masterarbeit PDF', fr: 'PDF du memoire', es: 'PDF de la tesis', ar: 'PDF الرسالة' },
    meta: { en: '99.03% +/- 0.07% AUROC', de: '99.03% +/- 0.07% AUROC', fr: '99.03% +/- 0.07% AUROC', es: '99.03% +/- 0.07% AUROC', ar: '99.03% +/- 0.07% AUROC' },
    href: '/Mohammed_Ahmed_Thesis_Diffusion_OOD_Detection.pdf',
    label: 'Proof',
  },
  {
    title: { en: 'Industrial technical report', de: 'Industriebericht', fr: 'Rapport technique industriel', es: 'Informe tecnico industrial', ar: 'التقرير الصناعي' },
    meta: { en: '0.8673 +/- 0.0230 AUROC baseline', de: '0.8673 +/- 0.0230 AUROC Baseline', fr: 'baseline a 0.8673 +/- 0.0230 AUROC', es: 'baseline de 0.8673 +/- 0.0230 AUROC', ar: 'baseline بقيمة 0.8673 +/- 0.0230 AUROC' },
    href: '/Diffusion-Based Multi-class Defect Detection.pdf',
    label: 'Proof',
  },
  {
    title: { en: 'DiffusionOOD repository', de: 'DiffusionOOD Repository', fr: 'Depot DiffusionOOD', es: 'Repositorio DiffusionOOD', ar: 'مستودع DiffusionOOD' },
    meta: { en: 'CIFAR-10 OOD implementation', de: 'CIFAR-10 OOD Implementierung', fr: 'Implementation OOD sur CIFAR-10', es: 'Implementacion OOD sobre CIFAR-10', ar: 'تنفيذ OOD على CIFAR-10' },
    href: 'https://github.com/ahmed-3m/DiffusionOOD',
    label: 'Proof',
  },
  {
    title: { en: 'InkjetOOD repository', de: 'InkjetOOD Repository', fr: 'Depot InkjetOOD', es: 'Repositorio InkjetOOD', ar: 'مستودع InkjetOOD' },
    meta: { en: 'Industrial transfer codebase', de: 'Codebasis fuer den Industrietransfer', fr: 'Base de code pour le transfert industriel', es: 'Base de codigo para transferencia industrial', ar: 'قاعدة كود للنقل الصناعي' },
    href: 'https://github.com/ahmed-3m/InkjetOOD',
    label: 'Proof',
  },
  {
    title: { en: 'Hugging Face model weights', de: 'Hugging Face Modellgewichte', fr: 'Poids de modele Hugging Face', es: 'Pesos del modelo en Hugging Face', ar: 'أوزان النموذج على Hugging Face' },
    meta: { en: 'Public checkpoints and artifacts', de: 'Oeffentliche Checkpoints und Artefakte', fr: 'Checkpoints et artefacts publics', es: 'Checkpoints y artefactos publicos', ar: 'نماذج وartefacts عامة' },
    href: 'https://huggingface.co/ahmed-3m/InkjetOOD',
    label: 'Proof',
  },
  {
    title: { en: 'Research poster', de: 'Forschungsposter', fr: 'Poster de recherche', es: 'Poster de investigacion', ar: 'الملصق البحثي' },
    meta: { en: 'Visual summary of the thesis', de: 'Visuelle Zusammenfassung der Thesis', fr: 'Resume visuel du memoire', es: 'Resumen visual de la tesis', ar: 'ملخص بصري للرسالة' },
    href: '/research-poster.pdf',
    label: 'Proof',
  },
  {
    title: { en: 'DiffusionOOD case study', de: 'DiffusionOOD Case Study', fr: 'Etude de cas DiffusionOOD', es: 'Caso de estudio DiffusionOOD', ar: 'دراسة حالة DiffusionOOD' },
    meta: { en: 'Problem, method, results, lessons', de: 'Problem, Methode, Ergebnisse, Erkenntnisse', fr: 'Probleme, methode, resultats, lecons', es: 'Problema, metodo, resultados, lecciones', ar: 'المشكلة والمنهج والنتائج والدروس' },
    href: '/case-studies/diffusion-ood',
    label: 'Case study',
  },
  {
    title: { en: 'Faultrix case study', de: 'Faultrix Case Study', fr: 'Etude de cas Faultrix', es: 'Caso de estudio Faultrix', ar: 'دراسة حالة Faultrix' },
    meta: { en: 'Research-to-product build story', de: 'Geschichte vom Research zum Produkt', fr: 'Histoire du passage recherche-produit', es: 'Historia del paso de investigacion a producto', ar: 'قصة الانتقال من البحث إلى المنتج' },
    href: '/case-studies/faultrix',
    label: 'Case study',
  },
]

export default function Evidence() {
  useReveal()
  const { t } = useI18n()

  return (
    <section id="evidence" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">{t(copy.eyebrow)}</div>
        <h2 className="cd-section-title" style={{ marginBottom: 8 }}>
          {t(copy.title)}
        </h2>
        <p style={{ color: 'var(--cd-fg2)', fontSize: 15, marginBottom: 34, maxWidth: 640 }}>
          {t(copy.intro)}
        </p>

        <div className="cd-evidence-grid">
          {evidenceItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target={item.href.startsWith('http') ? '_blank' : undefined}
              rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="cd-evidence-card reveal glass-surface glass-subtle"
            >
              <div
                className="cd-evidence-card-label"
                style={{ color: item.label === 'Case study' ? 'var(--cd-success)' : 'var(--cd-accent)' }}
              >
                {item.label === 'Case study' ? t(copy.caseStudy) : t(copy.proof)}
              </div>
              <div className="cd-evidence-card-title">{t(item.title)}</div>
              <div className="cd-evidence-card-meta">{t(item.meta)}</div>
              <div className="cd-proj-link" style={{ marginTop: 2 }}>
                Open &rarr;
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
