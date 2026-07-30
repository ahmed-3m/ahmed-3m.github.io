'use client'

import RequestCvButton from '@/components/RequestCvButton'
import ScheduleMeetingButton from '@/components/ScheduleMeetingButton'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  open: {
    en: 'Open to AI/ML roles & research collaborations',
    de: 'Offen für AI/ML-Rollen und Forschungskooperationen',
    fr: "Ouvert aux rôles IA/ML et collaborations de recherche",
    es: 'Abierto a roles de IA/ML y colaboraciones de investigación',
    ar: 'متاح لأدوار الذكاء الاصطناعي وتعاونات البحث',
  },
  based: {
    en: 'Based in Linz, Austria',
    de: 'Standort Linz, Österreich',
    fr: 'Basé à Linz, Autriche',
    es: 'Con base en Linz, Austria',
    ar: 'مقيم في لينز، النمسا',
  },
  body: {
    en: 'AI/ML engineer. I build ML systems I can stand behind — verified error bars in research, eval harnesses in production.',
    de: 'AI/ML Engineer. Ich baue ML-Systeme, für die ich geradestehen kann — belegte Fehlerbalken in der Forschung, Eval-Harnesses in der Produktion.',
    fr: "Ingénieur IA/ML. Je construis des systèmes ML dont je peux répondre — barres d'erreur vérifiées en recherche, harnais d'évaluation en production.",
    es: 'Ingeniero de IA/ML. Construyo sistemas de ML de los que puedo responder: barras de error verificadas en investigación, arneses de evaluación en producción.',
    ar: 'مهندس ذكاء اصطناعي وتعلم آلي. أبني أنظمة يمكنني الدفاع عنها — أشرطة خطأ موثّقة في البحث، وأطر تقييم في الإنتاج.',
  },
  viewWork: { en: 'View work', de: 'Arbeiten ansehen', fr: 'Voir les projets', es: 'Ver trabajos', ar: 'عرض الأعمال' },
  contact: { en: 'Get in touch', de: 'Kontakt', fr: 'Contact', es: 'Contacto', ar: 'تواصل' },
  years: { en: 'Years in AI/ML', de: 'Jahre in AI/ML', fr: 'Années en IA/ML', es: 'Años en IA/ML', ar: 'سنوات في الذكاء الاصطناعي' },
  auroc: { en: 'OOD Detection AUROC', de: 'OOD-Erkennung AUROC', fr: 'Détection OOD AUROC', es: 'Detección OOD AUROC', ar: 'مقياس AUROC لكشف الخارج عن التوزيع' },
  gain: { en: 'Gain over baseline (stable)', de: 'Gewinn gegenüber Baseline (stabil)', fr: 'Gain face au baseline (stable)', es: 'Mejora sobre la base (estable)', ar: 'تحسن على خط الأساس (مستقر)' },
  legend: {
    en: '99.03% AUROC = CIFAR-10 thesis (binary, single-class airplane-vs-rest, 3-seed mean) · 0.8673 AUROC = industrial FTI_Zer0P 5-fold baseline · +6.5pp = gain from separation loss',
    de: '99,03% AUROC = CIFAR-10 Thesis (binär, Einzelklasse Flugzeug-vs-Rest, 3-Seed-Mittel) · 0,8673 AUROC = industrielle FTI_Zer0P 5-fach Baseline · +6,5pp = Gewinn durch Separation Loss',
    fr: '99,03% AUROC = thèse CIFAR-10 (binaire, classe unique avion-vs-reste, moyenne 3 seeds) · 0,8673 AUROC = baseline industrielle FTI_Zer0P 5-fold · +6,5pp = gain grâce à la separation loss',
    es: '99,03% AUROC = tesis CIFAR-10 (binaria, clase única avión-vs-resto, media de 3 seeds) · 0,8673 AUROC = baseline industrial FTI_Zer0P 5-fold · +6,5pp = ganancia por separation loss',
    ar: '99.03% AUROC = رسالة CIFAR-10 (ثنائي، فئة واحدة طائرة مقابل الباقي، متوسط 3 تجارب) · 0.8673 AUROC = خط أساس صناعي FTI_Zer0P 5-fold · +6.5pp = تحسن بفضل separation loss',
  },
} satisfies Record<string, TranslationMap>

export default function Hero() {
  useReveal()
  const { t } = useI18n()

  return (
    <section id="hero" className="cd-hero" style={{ borderTop: 'none' }}>
      <div className="cd-container">
        <div className="cd-hero-grid">
          <div>
            <div className="cd-open-badge">
              <span className="cd-open-dot" />
              {t(copy.open)}
            </div>
            <div className="cd-hero-eyebrow">{t(copy.based)}</div>
            <h1 className="cd-hero-name">
              Ahmed
              <br />
              Mohammed
            </h1>
            <div className="cd-hero-title">
              <span>Computer Vision</span>
              {' · '}
              <span>Diffusion Models</span>
              {' · '}
              <span>OOD Detection</span>
            </div>
            <p className="cd-hero-body" data-speakable>{t(copy.body)}</p>
            <div className="cd-hero-ctas">
              <a href="#projects" className="cd-btn-primary">{t(copy.viewWork)} &rarr;</a>
              <a href="#contact" className="cd-btn-ghost">{t(copy.contact)}</a>
              <ScheduleMeetingButton />
              <RequestCvButton />
            </div>
            <div className="cd-hero-stats">
              <div className="cd-stat">
                <div className="cd-stat-num">4<span className="a">+</span></div>
                <div className="cd-stat-label">{t(copy.years)}</div>
              </div>
              <div className="cd-stat">
                <div className="cd-stat-num">99<span className="a">.</span>03<span style={{ fontSize: 14, color: 'var(--cd-fg3)', fontWeight: 400 }}>%</span></div>
                <div className="cd-stat-label">{t(copy.auroc)}</div>
              </div>
              <div className="cd-stat">
                <div className="cd-stat-num">+6.5<span className="g" style={{ fontSize: 14 }}>pp</span></div>
                <div className="cd-stat-label">{t(copy.gain)}</div>
              </div>
            </div>
            <p className="cd-hero-legend" style={{ fontSize: 11, color: 'var(--cd-fg3)', marginTop: 14, lineHeight: 1.6, maxWidth: 480 }}>
              {t(copy.legend)}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
