'use client'

import RequestCvButton from '@/components/RequestCvButton'
import ScheduleMeetingButton from '@/components/ScheduleMeetingButton'
import HeroSignal from '@/components/HeroSignal'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  open: {
    en: 'Open to AI/ML roles · available full time now',
    de: 'Offen für AI/ML-Rollen · ab sofort in Vollzeit verfügbar',
    fr: 'Ouvert aux rôles IA/ML · disponible à temps plein dès maintenant',
    es: 'Abierto a roles de IA/ML · disponible a tiempo completo ya',
    ar: 'متاح لأدوار الذكاء الاصطناعي · جاهز للعمل بدوام كامل الآن',
  },
  based: {
    en: 'Based in Linz, Austria',
    de: 'Standort Linz, Österreich',
    fr: 'Basé à Linz, Autriche',
    es: 'Con base en Linz, Austria',
    ar: 'مقيم في لينز، النمسا',
  },
  title1: {
    en: 'AI Systems',
    de: 'KI-Systeme',
    fr: "Systèmes d'IA",
    es: 'Sistemas de IA',
    ar: 'أنظمة الذكاء الاصطناعي',
  },
  title2: {
    en: 'LLM Products',
    de: 'LLM-Produkte',
    fr: 'Produits LLM',
    es: 'Productos LLM',
    ar: 'منتجات نماذج اللغة',
  },
  title3: {
    en: 'Agent Tooling',
    de: 'Agent-Tooling',
    fr: 'Outillage pour agents',
    es: 'Herramientas para agentes',
    ar: 'أدوات الوكلاء',
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
  or: { en: 'or', de: 'oder', fr: 'ou', es: 'o', ar: 'أو' },
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
          <div className="cd-hero-copy">
            <div className="cd-hero-status">
              <span className="cd-open-badge">
                <span className="cd-open-dot" aria-hidden="true" />
                {t(copy.open)}
              </span>
              <span className="cd-hero-eyebrow">{t(copy.based)}</span>
            </div>
            <h1 className="cd-hero-name">
              <bdi>
                Ahmed
                <br />
                Mohammed<span className="cd-hero-dot" aria-hidden="true">.</span>
              </bdi>
            </h1>
            <div className="cd-hero-title">
              <span>{t(copy.title1)}</span>
              <span>{t(copy.title2)}</span>
              <span>{t(copy.title3)}</span>
            </div>
            <p className="cd-hero-body" data-speakable>{t(copy.body)}</p>
            <div className="cd-hero-ctas">
              <a href="#projects" className="cd-btn-primary">{t(copy.viewWork)} <span aria-hidden="true">&rarr;</span></a>
              <RequestCvButton />
            </div>
            <div className="cd-hero-secondary">
              <span>{t(copy.or)}</span>
              <ScheduleMeetingButton variant="link" compact className="cd-hero-textlink" />
              <span aria-hidden="true">&middot;</span>
              <a href="#contact" className="cd-hero-textlink">{t(copy.contact)}</a>
            </div>
            <div className="cd-hero-stats">
              <div className="cd-stat">
                <div className="cd-stat-num">4<span className="a">+</span></div>
                <div className="cd-stat-label">{t(copy.years)}</div>
              </div>
              <div className="cd-stat">
                <div className="cd-stat-num">99<span className="a">.</span>03<span className="u">%</span></div>
                <div className="cd-stat-label">{t(copy.auroc)}</div>
              </div>
              <div className="cd-stat">
                <div className="cd-stat-num">+6.5<span className="g u">pp</span></div>
                <div className="cd-stat-label">{t(copy.gain)}</div>
              </div>
            </div>
            <p className="cd-hero-legend">{t(copy.legend)}</p>
          </div>
          <div className="cd-hero-visual">
            <HeroSignal />
          </div>
        </div>
      </div>
    </section>
  )
}
