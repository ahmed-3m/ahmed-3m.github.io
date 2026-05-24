'use client'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { useReveal } from '@/lib/useReveal'

const copy = {
  open: {
    en: 'Open to AI/ML roles & research collaborations',
    de: 'Offen fur AI/ML-Rollen und Forschungskooperationen',
    fr: 'Ouvert aux roles IA/ML et collaborations de recherche',
    es: 'Abierto a roles de IA/ML y colaboraciones de investigacion',
    ar: 'متاح لأدوار الذكاء الاصطناعي وتعاونات البحث',
  },
  based: {
    en: 'Based in Linz, Austria',
    de: 'Standort Linz, Osterreich',
    fr: 'Base a Linz, Autriche',
    es: 'Con base en Linz, Austria',
    ar: 'مقيم في لينز، النمسا',
  },
  body: {
    en: 'AI/ML engineer and entrepreneur. I build systems that work in the real world - from research to production.',
    de: 'AI/ML Engineer und Grunder. Ich baue Systeme, die in der Praxis funktionieren - von Forschung bis Produktion.',
    fr: 'Ingenieur IA/ML et entrepreneur. Je construis des systemes utiles dans le monde reel - de la recherche a la production.',
    es: 'Ingeniero de IA/ML y emprendedor. Construyo sistemas que funcionan en el mundo real: de la investigacion a produccion.',
    ar: 'مهندس ذكاء اصطناعي وتعلم آلي ورائد أعمال. أبني أنظمة تعمل في الواقع من البحث إلى الإنتاج.',
  },
  viewWork: { en: 'View work', de: 'Arbeiten ansehen', fr: 'Voir les projets', es: 'Ver trabajos', ar: 'عرض الأعمال' },
  contact: { en: 'Get in touch', de: 'Kontakt', fr: 'Contact', es: 'Contacto', ar: 'تواصل' },
  years: { en: 'Years in AI/ML', de: 'Jahre in AI/ML', fr: 'Annees en IA/ML', es: 'Años en IA/ML', ar: 'سنوات في الذكاء الاصطناعي' },
  auroc: { en: 'OOD Detection AUROC', de: 'OOD-Erkennung AUROC', fr: 'Detection OOD AUROC', es: 'Deteccion OOD AUROC', ar: 'مقياس AUROC لكشف الخارج عن التوزيع' },
  gain: { en: 'Gain over baseline (stable)', de: 'Gewinn gegenuber Baseline (stabil)', fr: 'Gain face au baseline (stable)', es: 'Mejora sobre la base (estable)', ar: 'تحسن على خط الأساس (مستقر)' },
  report: { en: 'Report generation', de: 'Berichtserstellung', fr: 'Generation de rapports', es: 'Generacion de informes', ar: 'إنشاء التقارير' },
  loading: { en: 'Loading 42 images - GPU: RTX 4090', de: 'Lade 42 Bilder - GPU: RTX 4090', fr: 'Chargement de 42 images - GPU: RTX 4090', es: 'Cargando 42 imagenes - GPU: RTX 4090', ar: 'تحميل 42 صورة - GPU: RTX 4090' },
  detect: { en: 'Defect detection', de: 'Defekterkennung', fr: 'Detection de defauts', es: 'Deteccion de defectos', ar: 'كشف العيوب' },
  reportReady: { en: 'QC report ready', de: 'QC-Bericht bereit', fr: 'Rapport QC pret', es: 'Informe QC listo', ar: 'تقرير الجودة جاهز' },
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
              Ahmed<br />Mohammed
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
              <div className="cd-stat">
                <div className="cd-stat-num">&lt;1<span style={{ fontSize: 14, color: 'var(--cd-fg3)', fontWeight: 400 }}> min</span></div>
                <div className="cd-stat-label">{t(copy.report)}</div>
              </div>
            </div>
          </div>

          <div className="cd-hero-terminal-wrap">
            <div className="cd-hero-terminal">
              <div className="cd-term-bar">
                <div className="cd-term-dot" style={{ background: '#ff5f57' }} />
                <div className="cd-term-dot" style={{ background: '#febc2e' }} />
                <div className="cd-term-dot" style={{ background: '#28c840' }} />
              </div>
              <div className="cd-term-line"><span className="tc">~/faultrix $ </span><span className="ta">python</span> analyze.py --input site_photos/</div>
              <div className="cd-term-line" style={{ color: 'var(--cd-fg3)' }}>{t(copy.loading)}</div>
              <div className="cd-term-line"><span className="tg">✓</span> {t(copy.detect)} · AUROC: <span className="ta">99.03%</span> <span className="tc">SOTA</span></div>
              <div className="cd-term-line"><span className="tg">✓</span> Generating ONORM report... AES-256 encrypted</div>
              <div className="cd-term-line"><span className="tw">→</span> {t(copy.reportReady)} <span className="ta">&lt;1 min</span></div>
              <div className="cd-term-line"><span className="tc">~/faultrix $ </span><span className="cd-cursor" /></div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['PyTorch', 'Diffusion Models', 'Computer Vision', 'OOD Detection', 'CUDA', 'Python'].map(tag => (
                <span key={tag} className="cd-chip">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
