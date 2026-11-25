'use client'

import RequestCvButton from '@/components/RequestCvButton'
import ScheduleMeetingButton from '@/components/ScheduleMeetingButton'
import FrontDeskButton from '@/components/FrontDeskButton'
import HeroSignal from '@/components/HeroSignal'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { portfolioCopy } from '@/lib/portfolio-copy'
import { usePortfolioView } from '@/lib/portfolio-view'

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
    ar: 'مقيم في لينتس، النمسا',
  },
  title1: {
    en: 'Computer Vision',
    de: 'Computer Vision',
    fr: 'Vision par ordinateur',
    es: 'Visión artificial',
    ar: 'الرؤية الحاسوبية',
  },
  title2: {
    en: 'Diffusion & OOD Research',
    de: 'Diffusion & OOD-Forschung',
    fr: 'Diffusion & Recherche OOD',
    es: 'Difusión e Investigación OOD',
    ar: 'الانتشار وأبحاث OOD',
  },
  title3: {
    en: 'Production AI Systems',
    de: 'Produktive KI-Systeme',
    fr: 'Systèmes IA en production',
    es: 'Sistemas de IA en producción',
    ar: 'أنظمة ذكاء اصطناعي إنتاجية',
  },
  body: {
    en: 'AI/ML engineer building reliable vision and agentic AI systems by pairing probabilistic models with deterministic guardrails—across print inspection, diffusion OOD detection, and LLM/agent tooling.',
    de: 'AI/ML Engineer für zuverlässige Bildverarbeitungs- und agentische KI-Systeme, die probabilistische Modelle mit deterministischen Guardrails verbinden – von Druckprüfung und Diffusions-OOD-Erkennung bis zu LLM- und Agent-Tooling.',
    fr: 'Ingénieur IA/ML, je conçois des systèmes fiables de vision et d’IA agentique associant modèles probabilistes et garde-fous déterministes, entre inspection d’impression, détection OOD par diffusion et outillage LLM/agents.',
    es: 'Ingeniero de IA/ML que construye sistemas fiables de visión e IA agéntica combinando modelos probabilísticos con controles deterministas, desde inspección de impresión y detección OOD por difusión hasta herramientas para LLM y agentes.',
    ar: 'مهندس ذكاء اصطناعي وتعلّم آلي أبني أنظمة موثوقة للرؤية والذكاء الاصطناعي الوكيلي، أجمع فيها بين النماذج الاحتمالية والضوابط الحتمية من فحص الطباعة وكشف \u2066OOD\u2069 بالانتشار إلى أدوات \u2066LLM\u2069 والوكلاء.',
  },
  viewWork: { en: 'View work', de: 'Arbeiten ansehen', fr: 'Voir les projets', es: 'Ver trabajos', ar: 'عرض الأعمال' },
  sections: { en: 'Portfolio sections', de: 'Portfolio-Bereiche', fr: 'Sections du portfolio', es: 'Secciones del portafolio', ar: 'أقسام الملف الشخصي' },
  experience: { en: 'Experience', de: 'Erfahrung', fr: 'Expérience', es: 'Experiencia', ar: 'الخبرة' },
  research: { en: 'Research', de: 'Forschung', fr: 'Recherche', es: 'Investigación', ar: 'الأبحاث' },
  contact: { en: 'Get in touch', de: 'Kontakt', fr: 'Contact', es: 'Contacto', ar: 'تواصل' },
  or: { en: 'or', de: 'oder', fr: 'ou', es: 'o', ar: 'أو' },
  degree: { en: 'AI · JKU Linz', de: 'KI · JKU Linz', fr: 'IA · JKU Linz', es: 'IA · JKU Linz', ar: 'ذكاء اصطناعي · JKU Linz' },
  auroc: { en: 'OOD Detection AUROC', de: 'OOD-Erkennung AUROC', fr: 'Détection OOD AUROC', es: 'Detección OOD AUROC', ar: 'مقياس AUROC لكشف الخارج عن التوزيع' },
  benchmark: {
    en: 'AUROC · CIFAR-10 airplane vs. rest · mean ± SD across three runs',
    de: 'AUROC · CIFAR-10, Flugzeuge gegen übrige Klassen · Mittelwert ± Standardabweichung aus drei Läufen',
    fr: 'AUROC · CIFAR-10, avions contre les autres classes · moyenne ± écart-type sur trois essais',
    es: 'AUROC · CIFAR-10, aviones frente al resto · media ± desviación estándar de tres pruebas',
    ar: 'AUROC · ‏CIFAR-10، الطائرات مقابل بقية الفئات · المتوسط ± الانحراف المعياري عبر ثلاث تجارب',
  },
  gain: { en: 'Gain over baseline (stable)', de: 'Gewinn gegenüber Baseline (stabil)', fr: 'Gain face au baseline (stable)', es: 'Mejora sobre la base (estable)', ar: 'تحسن على خط الأساس (مستقر)' },
  legend: {
    en: '99.03% ± 0.07% AUROC = CIFAR-10 thesis (binary, single-class airplane-vs-rest, 3-seed mean) · 0.8673 ± 0.0230 AUROC = industrial FTI_Zer0P 5-fold baseline · +6.5pp = mean gain over 92.52% ± 11.07% baseline',
    de: '99,03% ± 0,07% AUROC = CIFAR-10 Thesis (binär, Einzelklasse Flugzeug-vs-Rest, 3-Seed-Mittel) · 0,8673 ± 0,0230 AUROC = industrielle FTI_Zer0P 5-fach Baseline · +6,5pp = Gewinn über 92,52% ± 11,07% Baseline',
    fr: '99,03% ± 0,07% AUROC = thèse CIFAR-10 (binaire, classe unique avion-vs-reste, moyenne 3 seeds) · 0,8673 ± 0,0230 AUROC = baseline industrielle FTI_Zer0P 5-fold · +6,5pp = gain sur baseline 92,52% ± 11,07%',
    es: '99,03% ± 0,07% AUROC = tesis CIFAR-10 (binaria, clase única avión-vs-resto, media de 3 seeds) · 0,8673 ± 0,0230 AUROC = baseline industrial FTI_Zer0P 5-fold · +6,5pp = ganancia sobre base 92,52% ± 11,07%',
    ar: '\u206699.03%\u00A0±\u00A00.07% AUROC\u2069 = رسالة CIFAR-10 (ثنائي، فئة واحدة طائرة مقابل الباقي، متوسط 3 تجارب) · \u20660.8673\u00A0±\u00A00.0230 AUROC\u2069 = خط أساس صناعي FTI_Zer0P 5-fold · \u2066+6.5pp\u2069 = تحسن على الأساس \u206692.52%\u00A0±\u00A011.07%\u2069',
  },
} satisfies Record<string, TranslationMap>

export default function Hero() {
  const { t } = useI18n()
  const { setView } = usePortfolioView()

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
              <a href="#projects" className="cd-btn-primary cd-hero-work">{t(copy.viewWork)} <span className="inline-block rtl:rotate-180" aria-hidden="true">&rarr;</span></a>
              <RequestCvButton />
              <button
                type="button"
                className="cd-btn-ghost"
                onClick={() => {
                  setView('concise')
                  window.scrollTo({ top: 0 })
                }}
              >
                {t(portfolioCopy.conciseView)}
              </button>
            </div>
            <div className="cd-hero-secondary">
              <span>{t(copy.or)}</span>
              <ScheduleMeetingButton variant="link" compact className="cd-hero-textlink" />
              <span aria-hidden="true">&middot;</span>
              <FrontDeskButton variant="link" compact className="cd-hero-textlink" />
              <span aria-hidden="true">&middot;</span>
              <a href="#contact" className="cd-hero-textlink">{t(copy.contact)}</a>
            </div>
            <div className="cd-hero-stats">
              <div className="cd-stat cd-stat--wide">
                <div className="cd-stat-num" dir="ltr">M.Sc.</div>
                <div className="cd-stat-label">{t(copy.degree)}</div>
              </div>
              <div className="cd-stat">
                <div className="cd-stat-num" dir="ltr">99<span className="a">.</span>03<span className="u">% ± 0.07%</span></div>
                <div className="cd-stat-label">
                  <span className="cd-stat-label-wide">{t(copy.auroc)}</span>
                  <span className="cd-stat-label-compact">{t(copy.benchmark)}</span>
                </div>
              </div>
              <div className="cd-stat cd-stat--wide">
                <div className="cd-stat-num" dir="ltr">+6.5<span className="g u">pp</span></div>
                <div className="cd-stat-label">{t(copy.gain)}</div>
              </div>
            </div>
            <p className="cd-hero-legend">{t(copy.legend)}</p>
            <nav className="cd-hero-jump" aria-label={t(copy.sections)}>
              <a href="#projects" className="cd-btn-ghost">{t(portfolioCopy.work)}</a>
              <a href="#experience" className="cd-btn-ghost">{t(copy.experience)}</a>
              <a href="#research" className="cd-btn-ghost">{t(copy.research)}</a>
            </nav>
          </div>
          <div className="cd-hero-visual">
            <HeroSignal />
          </div>
        </div>
      </div>
    </section>
  )
}
