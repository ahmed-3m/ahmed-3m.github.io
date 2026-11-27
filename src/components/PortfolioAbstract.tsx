'use client'

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, Layers, Terminal, X } from 'lucide-react'
import { QUALIFIERS } from '@/lib/claims'
import { useI18n, type TranslationMap } from '@/lib/i18n'
import { getAllBlogPostsMeta } from '@/lib/blog-posts-meta'
import { BENCHMARK_DATASETS, INKJET_OVERALL_SWEEP } from '@/lib/ood-explorer-data'
import { diffusionExplorerHref, focusPillars, portfolioCopy as copy, selectedWork } from '@/lib/portfolio-copy'
import { usePortfolioView } from '@/lib/portfolio-view'
import FrontDeskButton from '@/components/FrontDeskButton'
import MergeproofDemo from '@/components/MergeproofDemo'

const gateCopy = {
  tryGate: {
    en: 'Try interactive gate',
    de: 'Interaktives Gate testen',
    fr: 'Tester la porte interactive',
    es: 'Probar compuerta interactiva',
    ar: 'جرّب البوابة التفاعلية',
  },
  closeGate: {
    en: 'Close interactive gate',
    de: 'Interaktives Gate schließen',
    fr: 'Fermer la porte interactive',
    es: 'Cerrar compuerta interactiva',
    ar: 'إغلاق البوابة التفاعلية',
  },
} satisfies Record<string, TranslationMap>

const specimenCopy = {
  legendGood: { en: 'Classified good', de: 'Als in Ordnung erkannt', fr: 'Classé conforme', es: 'Clasificada como correcta', ar: 'مصنفة سليمة' },
  legendBad: { en: 'Classified defective', de: 'Als fehlerhaft erkannt', fr: 'Classé défectueux', es: 'Clasificada como defectuosa', ar: 'مصنفة معيبة' },
  open: { en: 'Enlarge image', de: 'Bild vergrößern', fr: 'Agrandir l’image', es: 'Ampliar imagen', ar: 'تكبير الصورة' },
  close: { en: 'Close image viewer', de: 'Bildansicht schließen', fr: 'Fermer la visionneuse', es: 'Cerrar el visor', ar: 'إغلاق عارض الصورة' },
} satisfies Record<string, TranslationMap>

const HIST_W = 520
const HIST_H = 148
const HIST_PAD_X = 6
const HIST_BASE = HIST_H - 4

function stepAreaPath(pct: readonly number[], yMax: number): string {
  const n = pct.length
  const bw = (HIST_W - HIST_PAD_X * 2) / n
  let d = `M${HIST_PAD_X},${HIST_BASE}`
  pct.forEach((v, i) => {
    const y = HIST_BASE - (v / yMax) * (HIST_BASE - 8)
    const x0 = HIST_PAD_X + i * bw
    d += ` L${x0.toFixed(2)},${y.toFixed(2)} L${(x0 + bw).toFixed(2)},${y.toFixed(2)}`
  })
  d += ` L${HIST_W - HIST_PAD_X},${HIST_BASE} Z`
  return d
}

const sihemArchAria: TranslationMap = {
  en: 'Sihem 4-stage architecture pipeline: 1. Signals (Calendar and routines) feed 2. Deterministic Arbiter (Rules and pgvector RAG), then 3. LLM Composer and Failover (Multi-provider routing), delivering 4. Check-in (Telegram and PWA).',
  de: 'Vierstufige Architektur von Sihem: 1. Signale (Kalender und Routinen) speisen 2. Deterministischer Arbiter (Regeln und pgvector-RAG), weiter zu 3. LLM-Composer & Failover (Multi-Provider-Routing) bis 4. Check-in (Telegram und PWA).',
  fr: 'Pipeline d’architecture de Sihem en 4 étapes : 1. Signaux (calendrier et routines) vers 2. Arbitre déterministe (règles et RAG pgvector), puis 3. Compositeur LLM et bascule (routage multi-fournisseurs), jusqu’à 4. Suivi (Telegram et PWA).',
  es: 'Pipeline de arquitectura de Sihem en 4 etapas: 1. Señales (calendario y rutinas) alimentan a 2. Árbitro determinista (reglas y RAG pgvector), luego 3. Compositor LLM y respaldo (enrutamiento multiproveedor) y 4. Seguimiento (Telegram y PWA).',
  ar: 'مخطط معمارية \u2066Sihem\u2069 من \u20664\u2069 مراحل: 1. الإشارات (التقويم والروتين) تغذّي 2. المحكّم الحتمي (القواعد وذاكرة \u2066pgvector RAG\u2069)، ثم 3. صياغة \u2066LLM\u2069 والتبديل التلقائي (توجيه متعدد المزوّدين)، وصولاً إلى 4. المتابعة (\u2066Telegram + PWA\u2069).',
}

const sihemStages = [
  {
    num: '01',
    tone: 'signal' as const,
    title: { en: 'Signals', de: 'Signale', fr: 'Signaux', es: 'Señales', ar: 'الإشارات' },
    sub: {
      en: 'Calendar · Routines',
      de: 'Kalender · Routinen',
      fr: 'Calendrier · Routines',
      es: 'Calendario · Rutinas',
      ar: 'التقويم · الروتين',
    },
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
        <line x1="3" y1="8.5" x2="17" y2="8.5" />
        <line x1="7" y1="2.5" x2="7" y2="5.5" />
        <line x1="13" y1="2.5" x2="13" y2="5.5" />
        <path d="M6.5 13h2l1.2-2 1.6 3.2 1.2-1.2h1.5" />
      </svg>
    ),
  },
  {
    num: '02',
    tone: 'gate' as const,
    title: {
      en: 'Deterministic Arbiter',
      de: 'Deterministischer Arbiter',
      fr: 'Arbitre déterministe',
      es: 'Árbitro determinista',
      ar: 'المحكّم الحتمي',
    },
    sub: {
      en: 'Rules + pgvector RAG',
      de: 'Regeln + pgvector-RAG',
      fr: 'Règles + RAG pgvector',
      es: 'Reglas + RAG pgvector',
      ar: 'قواعد + \u2066pgvector RAG\u2069',
    },
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2.5L16.5 5.2v4.6c0 3.7-2.7 6.5-6.5 7.7-3.8-1.2-6.5-4-6.5-7.7V5.2L10 2.5z" />
        <path d="M7.3 10.2l1.8 1.8 3.6-3.7" />
      </svg>
    ),
  },
  {
    num: '03',
    tone: 'router' as const,
    title: {
      en: 'LLM Composer & Failover',
      de: 'LLM-Composer & Failover',
      fr: 'Compositeur LLM & bascule',
      es: 'Compositor LLM y respaldo',
      ar: 'صياغة \u2066LLM\u2069 والتبديل التلقائي',
    },
    sub: {
      en: 'Multi-provider routing',
      de: 'Multi-Provider-Routing',
      fr: 'Routage multi-fournisseurs',
      es: 'Enrutamiento multiproveedor',
      ar: 'توجيه متعدد المزوّدين',
    },
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="4.5" cy="10" r="2" />
        <circle cx="15.5" cy="5.5" r="2" />
        <circle cx="15.5" cy="14.5" r="2" />
        <path d="M6.5 10h3l4-4.5M9.5 10l4 4.5" />
      </svg>
    ),
  },
  {
    num: '04',
    tone: 'out' as const,
    title: { en: 'Check-in', de: 'Check-in', fr: 'Suivi', es: 'Seguimiento', ar: 'المتابعة' },
    sub: {
      en: 'Telegram + PWA',
      de: 'Telegram + PWA',
      fr: 'Telegram + PWA',
      es: 'Telegram + PWA',
      ar: '\u2066Telegram + PWA\u2069',
    },
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h7A2.5 2.5 0 0 1 16 5.5v6A2.5 2.5 0 0 1 13.5 14H8l-4 3v-3.5" />
        <line x1="7.5" y1="7.5" x2="12.5" y2="7.5" />
        <line x1="7.5" y1="10.2" x2="10.8" y2="10.2" />
      </svg>
    ),
  },
] as const satisfies ReadonlyArray<{
  num: string
  tone: 'signal' | 'gate' | 'router' | 'out'
  title: TranslationMap
  sub: TranslationMap
  icon: ReactNode
}>

const exploreItems = [
  { id: 'research', href: '/research/', titleKey: 'research', descKey: 'exploreResearchDesc' },
  { id: 'ood-explorer', href: diffusionExplorerHref, titleKey: 'explorer', descKey: 'exploreExplorerDesc' },
  { id: 'writing', href: '/blog/', titleKey: 'writing', descKey: 'exploreWritingDesc' },
  { id: 'news', href: '/news/', titleKey: 'news', descKey: 'exploreNewsDesc' },
] as const

const latestWritingCopy = {
  title: { en: 'Latest writing', de: 'Neueste Beiträge', fr: 'Derniers articles', es: 'Últimos artículos', ar: 'أحدث المقالات' },
} satisfies Record<string, TranslationMap>

export default function PortfolioAbstract() {
  const { lang, t } = useI18n()
  const latestPosts = getAllBlogPostsMeta(lang).slice(0, 3)
  const { setView } = usePortfolioView()
  const [activeTab, setActiveTab] = useState<(typeof focusPillars)[number]['id']>('diffusion-ood')
  const [hasVisitedInkjet, setHasVisitedInkjet] = useState(false)
  const [diffusionView, setDiffusionView] = useState<'histogram' | 'diagram'>('histogram')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const specimenDialog = useRef<HTMLDialogElement>(null)
  const specimenTrigger = useRef<HTMLButtonElement>(null)
  const [specimenOpen, setSpecimenOpen] = useState(false)
  const gateDialog = useRef<HTMLDialogElement>(null)
  const gateTrigger = useRef<HTMLButtonElement>(null)
  const [gateOpen, setGateOpen] = useState(false)

  const ds = BENCHMARK_DATASETS.within_cifar
  const hist = ds.histogram
  const yMax = Math.max(...hist.id_pct, ...hist.ood_pct)
  const tauX = HIST_PAD_X + ((ds.tauTpr95 - hist.lo) / (hist.hi - hist.lo)) * (HIST_W - HIST_PAD_X * 2)
  const inkjet = INKJET_OVERALL_SWEEP['0.0']

  const activateTab = (id: typeof activeTab) => {
    setActiveTab(id)
    if (id === 'inkjet-ood') setHasVisitedInkjet(true)
  }

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = focusPillars.length
    const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl'
    let nextIndex: number | null = null

    if (event.key === 'ArrowRight') {
      nextIndex = isRtl ? (index - 1 + count) % count : (index + 1) % count
    } else if (event.key === 'ArrowLeft') {
      nextIndex = isRtl ? (index + 1) % count : (index - 1 + count) % count
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = count - 1
    }

    if (nextIndex === null) return
    event.preventDefault()
    const nextPillar = focusPillars[nextIndex]
    activateTab(nextPillar.id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="portfolio-shell">
      <section className="stage-hero" id="hero" aria-labelledby="portfolio-name">
        <h1 id="portfolio-name" className="stage-hero-name">
          <bdi>
            Ahmed Mohammed<span className="cd-hero-dot" aria-hidden="true">.</span>
          </bdi>
        </h1>

        <p className="stage-role">{t(copy.role)}</p>

        <div className="stage-disciplines">
          <span>{t(copy.discipline1)}</span>
          <span>{t(copy.discipline2)}</span>
          <span>{t(copy.discipline3)}</span>
        </div>

        <p className="stage-hero-lede" data-speakable>
          {t(copy.lede)}
        </p>

        <div className="stage-dock">
          <a className="stage-cta-cv" href="/cv.pdf">
            {t(copy.cv)}
          </a>
          <button
            type="button"
            className="stage-cta-full"
            onClick={() => {
              setView('full')
              window.scrollTo({ top: 0 })
            }}
          >
            <Layers size={16} strokeWidth={2.2} aria-hidden="true" />
            <span>{t(copy.fullPortfolio)}</span>
            <ArrowRight size={16} strokeWidth={2.2} className="stage-cta-arrow rtl:rotate-180" aria-hidden="true" />
          </button>
          <Link className="stage-cta-contact" href="#contact">
            {t(copy.contact)}
          </Link>
          <FrontDeskButton variant="link" compact className="stage-cta-contact" />
        </div>

        <div className="stage-telemetry-ribbon">
          <span className="cd-open-badge">
            <span className="cd-open-dot" aria-hidden="true" />
            {t(copy.availability)}
          </span>
          <span className="stage-ribbon-sep" aria-hidden="true" />
          <span>{t(copy.location)}</span>
          <span className="stage-ribbon-sep" aria-hidden="true" />
          <span>{t(copy.degreeBadge)}</span>
        </div>
      </section>

      <section className="stage-theater-section" id="projects" aria-labelledby="portfolio-work-title">
        <div className="stage-section-head">
          <h2 id="portfolio-work-title">{t(copy.work)}</h2>
        </div>

        <div className="stage-theater">
          <div role="tablist" aria-label={t(copy.stageTablistAria)} className="stage-rail">
            {focusPillars.map((pillar, index) => {
              const isSelected = pillar.id === activeTab
              return (
                <button
                  key={pillar.id}
                  ref={(el) => {
                    tabRefs.current[index] = el
                  }}
                  type="button"
                  role="tab"
                  id={`stage-tab-${pillar.id}`}
                  aria-selected={isSelected}
                  aria-controls={`stage-panel-${pillar.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  className={`stage-rail-btn${isSelected ? ' is-active' : ''}`}
                  onClick={() => activateTab(pillar.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  <span className="stage-rail-dot" aria-hidden="true" />
                  <span className="stage-rail-title">{t(pillar.tabLabel)}</span>
                  <span className="stage-rail-metric">
                    <bdi dir="ltr">{t(pillar.metricValue)}</bdi>
                    {pillar.metricQualifier && (
                      <span className="stage-rail-qual">{t(QUALIFIERS[pillar.metricQualifier].text)}</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          {focusPillars.map((pillar) => {
            const isSelected = pillar.id === activeTab
            const work = selectedWork.find((item) => item.slug === pillar.id) ?? selectedWork[0]

            return (
              <div
                key={pillar.id}
                role="tabpanel"
                id={`stage-panel-${pillar.id}`}
                aria-labelledby={`stage-tab-${pillar.id}`}
                tabIndex={pillar.id === 'diffusion-ood' ? undefined : 0}
                hidden={!isSelected}
                className="stage-panel"
              >
                <div className="stage-canvas">
                  {pillar.id === 'diffusion-ood' && (
                    <>
                      <div className="stage-canvas-head">
                        <div className="stage-mode-switch" role="group" aria-label={t(copy.stageVisualModeAria)}>
                          <button
                            type="button"
                            className={`stage-mode-btn${diffusionView === 'histogram' ? ' is-active' : ''}`}
                            aria-pressed={diffusionView === 'histogram'}
                            onClick={() => setDiffusionView('histogram')}
                          >
                            {t(copy.stageVisualHistogram)}
                          </button>
                          <button
                            type="button"
                            className={`stage-mode-btn${diffusionView === 'diagram' ? ' is-active' : ''}`}
                            aria-pressed={diffusionView === 'diagram'}
                            onClick={() => setDiffusionView('diagram')}
                          >
                            {t(copy.stageVisualDiagram)}
                          </button>
                        </div>
                        <p className="stage-canvas-cap">{t(copy.snapshotCaption)}</p>
                      </div>

                      <div className="stage-canvas-body">
                        {diffusionView === 'histogram' ? (
                          <>
                            <div className="cd-signal-plot stage-hist-plot" dir="ltr">
                              <svg viewBox={`0 0 ${HIST_W} ${HIST_H}`} role="img" aria-label={t(copy.histogramChartLabel)} preserveAspectRatio="none">
                                {[0.25, 0.5, 0.75].map((f) => (
                                  <line
                                    key={f}
                                    x1={HIST_PAD_X}
                                    x2={HIST_W - HIST_PAD_X}
                                    y1={HIST_BASE - f * (HIST_BASE - 8)}
                                    y2={HIST_BASE - f * (HIST_BASE - 8)}
                                    className="cd-signal-grid"
                                  />
                                ))}
                                <rect x={tauX} y={0} width={HIST_W - HIST_PAD_X - tauX} height={HIST_BASE} className="cd-signal-flag" />
                                <path d={stepAreaPath(hist.ood_pct, yMax)} className="cd-signal-ood" />
                                <path d={stepAreaPath(hist.id_pct, yMax)} className="cd-signal-id" />
                                <line x1={HIST_PAD_X} x2={HIST_W - HIST_PAD_X} y1={HIST_BASE} y2={HIST_BASE} className="cd-signal-axis" />
                                <line x1={tauX} x2={tauX} y1={2} y2={HIST_BASE} className="cd-signal-tau" />
                              </svg>
                              <span className="cd-signal-tau-label" style={{ left: `${(tauX / HIST_W) * 100}%` }}>
                                {t(copy.histogramTau)}
                              </span>
                            </div>
                            <ul className="cd-signal-legend stage-hist-legend">
                              <li><span className="sw sw-id" aria-hidden="true" />{t(copy.histogramId)}</li>
                              <li><span className="sw sw-ood" aria-hidden="true" />{t(copy.histogramOod)}</li>
                            </ul>
                          </>
                        ) : (
                          <div className="stage-visual-frame stage-visual-frame--dark">
                            <Image
                              src="/research/separation-apart-preview.webp"
                              width={800}
                              height={450}
                              sizes="(max-width: 900px) 92vw, 620px"
                              loading="eager"
                              alt={t(copy.diffusionDiagramAlt)}
                              className="stage-visual-img"
                            />
                          </div>
                        )}
                      </div>

                      <dl className="stage-telemetry-grid">
                        <div className="stage-telemetry-cell">
                          <dt>
                            <bdi dir="ltr">AUROC</bdi>
                            <span className="stage-telemetry-qual"> · {t(copy.telemetrySeed42)}</span>
                          </dt>
                          <dd><bdi dir="ltr">{ds.auroc.toFixed(2)}%</bdi></dd>
                        </div>
                        <div className="stage-telemetry-cell">
                          <dt><bdi dir="ltr">FPR@95</bdi></dt>
                          <dd><bdi dir="ltr">{ds.fpr95.toFixed(1)}%</bdi></dd>
                        </div>
                        <div className="stage-telemetry-cell">
                          <dt><bdi dir="ltr">AUPRC</bdi></dt>
                          <dd><bdi dir="ltr">{ds.auprc.toFixed(2)}%</bdi></dd>
                        </div>
                      </dl>
                    </>
                  )}

                  {pillar.id === 'inkjet-ood' && hasVisitedInkjet && (
                    <>
                      <div className="stage-canvas-head">
                        <p className="stage-canvas-cap">{t(copy.inkjetCaption)}</p>
                        <ul className="stage-specimen-legend">
                          <li><span className="stage-specimen-key stage-specimen-key--good" aria-hidden="true" />{t(specimenCopy.legendGood)}</li>
                          <li><span className="stage-specimen-key stage-specimen-key--bad" aria-hidden="true" />{t(specimenCopy.legendBad)}</li>
                        </ul>
                      </div>

                      <div className="stage-canvas-body">
                        <button
                          ref={specimenTrigger}
                          type="button"
                          className="stage-visual-frame stage-visual-frame--specimen"
                          aria-haspopup="dialog"
                          aria-label={`${t(specimenCopy.open)}: ${t(copy.inkjetAlt)}`}
                          title={t(specimenCopy.open)}
                          onClick={() => {
                            const viewer = specimenDialog.current
                            if (typeof viewer?.showModal !== 'function') return
                            viewer.showModal()
                            setSpecimenOpen(true)
                          }}
                        >
                          <Image
                            src="/research/inkjet-inspection-samples-dark.webp"
                            width={1083}
                            height={546}
                            sizes="(max-width: 900px) 92vw, 620px"
                            loading="lazy"
                            alt={t(copy.inkjetAlt)}
                            className="stage-visual-img stage-visual-img--dark"
                          />
                          <Image
                            src="/research/inkjet-inspection-samples-light.webp"
                            width={1083}
                            height={546}
                            sizes="(max-width: 900px) 92vw, 620px"
                            loading="lazy"
                            alt=""
                            aria-hidden="true"
                            className="stage-visual-img stage-visual-img--light"
                          />
                        </button>
                        <dialog
                          ref={specimenDialog}
                          className="portfolio-figure-dialog"
                          aria-labelledby="stage-specimen-dialog-cap"
                          onClick={(event) => {
                            if (event.target === event.currentTarget) event.currentTarget.close()
                          }}
                          onClose={() => {
                            setSpecimenOpen(false)
                            specimenTrigger.current?.focus()
                          }}
                        >
                          <div>
                            <button type="button" className="portfolio-text-link" onClick={() => specimenDialog.current?.close()}>
                              {t(specimenCopy.close)}
                            </button>
                            {specimenOpen && (
                              <Image
                                src="/research/inkjet-inspection-samples.webp"
                                width={1100}
                                height={678}
                                alt={t(copy.inkjetAlt)}
                              />
                            )}
                            <p id="stage-specimen-dialog-cap">{t(copy.inkjetCaption)}</p>
                          </div>
                        </dialog>
                      </div>

                      <dl className="stage-telemetry-grid">
                        <div className="stage-telemetry-cell">
                          <dt><bdi dir="ltr">AUROC</bdi></dt>
                          <dd><bdi dir="ltr">{`${inkjet.aurocMean.toFixed(4)} ± ${inkjet.aurocStd.toFixed(4)}`}</bdi></dd>
                        </div>
                        <div className="stage-telemetry-cell">
                          <dt>{t(copy.telemetryAccuracy)}</dt>
                          <dd><bdi dir="ltr">{`${inkjet.accMean.toFixed(4)} ± ${inkjet.accStd.toFixed(4)}`}</bdi></dd>
                        </div>
                        <div className="stage-telemetry-cell">
                          <dt>{t(copy.telemetryProtocol)}</dt>
                          <dd className="stage-telemetry-val--prose">{t(copy.telemetryInkjetProtocolVal)}</dd>
                        </div>
                      </dl>
                    </>
                  )}

                  {pillar.id === 'sihem' && (
                    <>
                      <div className="stage-canvas-head">
                        <p className="stage-canvas-cap">{t(work.context)}</p>
                      </div>

                      <div className="stage-canvas-body">
                        <div
                          className="stage-sihem-schematic"
                          role="region"
                          aria-label={t(sihemArchAria)}
                        >
                          <svg
                            className="stage-sihem-bus"
                            viewBox="0 0 600 42"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M525 22 C525 6, 75 6, 75 22"
                              className="stage-sihem-bus-loop"
                            />
                            <line x1="75" y1="26" x2="525" y2="26" className="stage-sihem-bus-track" />
                            <path d="M146 22 L152 26 L146 30" className="stage-sihem-bus-chevron" />
                            <path d="M296 22 L302 26 L296 30" className="stage-sihem-bus-chevron" />
                            <path d="M446 22 L452 26 L446 30" className="stage-sihem-bus-chevron" />
                            <circle cx="75" cy="26" r="4.5" className="stage-sihem-bus-node" />
                            <circle cx="225" cy="26" r="5.5" className="stage-sihem-bus-node is-gate" />
                            <circle cx="375" cy="26" r="4.5" className="stage-sihem-bus-node" />
                            <circle cx="525" cy="26" r="4.5" className="stage-sihem-bus-node is-out" />
                          </svg>

                          <ol className="stage-sihem-grid">
                            {sihemStages.map((stage) => (
                              <li
                                key={stage.num}
                                className={`stage-sihem-step stage-sihem-step--${stage.tone}`}
                              >
                                <div className="stage-sihem-head">
                                  <span className="stage-sihem-index">
                                    <bdi dir="ltr">{stage.num}</bdi>
                                  </span>
                                  <span className="stage-sihem-icon" aria-hidden="true">
                                    {stage.icon}
                                  </span>
                                </div>
                                <span className="stage-sihem-label">{t(stage.title)}</span>
                                <p className="stage-sihem-desc">{t(stage.sub)}</p>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>

                      <dl className="stage-telemetry-grid">
                        <div className="stage-telemetry-cell">
                          <dt>{t(copy.telemetryChannels)}</dt>
                          <dd><bdi dir="ltr">Telegram + PWA</bdi></dd>
                        </div>
                        <div className="stage-telemetry-cell">
                          <dt>{t(copy.telemetryMemory)}</dt>
                          <dd><bdi dir="ltr">pgvector RAG</bdi></dd>
                        </div>
                        <div className="stage-telemetry-cell">
                          <dt>{t(copy.telemetryStage)}</dt>
                          <dd className="stage-telemetry-val--prose">{t(copy.telemetryBeta)}</dd>
                        </div>
                      </dl>
                    </>
                  )}
                </div>

                <div className="stage-dossier">
                  <h3>{t(work.title)}</h3>
                  <p className="stage-dossier-meta">{t(work.context)}</p>

                  <div className="stage-dossier-kpi">
                    <strong className="stage-dossier-num">
                      <bdi dir="ltr">{t(pillar.metricValue)}</bdi>
                    </strong>
                    <p className="stage-dossier-qual">{t(pillar.metricSub)}</p>
                  </div>

                  <p className="stage-dossier-summary">{t(work.summary)}</p>

                  <div className="cd-proj-tags">
                    {work.tags.map((tag) => {
                      const isStringTag = typeof tag === 'string'
                      return (
                        <span
                          key={isStringTag ? tag : tag.en}
                          className={isStringTag ? 'cd-proj-tag' : 'cd-proj-tag stage-tag--prose'}
                        >
                          {isStringTag ? tag : t(tag)}
                        </span>
                      )
                    })}
                  </div>

                  <div className="stage-dossier-actions">
                    <Link className="portfolio-text-link" href={work.href}>
                      <span>{t(work.link)}</span>
                      <ArrowRight size={15} className="rtl:rotate-180" aria-hidden="true" />
                    </Link>
                    {pillar.id === 'diffusion-ood' && (
                      <Link className="portfolio-text-link" href={diffusionExplorerHref}>
                        <span>{t(copy.explorer)}</span>
                        <ArrowRight size={15} className="rtl:rotate-180" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          <div className="stage-oss-rail">
            <span className="stage-oss-name"><bdi dir="ltr">mergeproof</bdi></span>
            <span className="cd-proj-tag stage-tag--prose">{t(copy.ossBadge)}</span>
            <p className="stage-oss-summary">{t(copy.ossSummary)}</p>
            <div className="stage-oss-actions">
              <button
                ref={gateTrigger}
                type="button"
                className="stage-oss-try-btn"
                aria-haspopup="dialog"
                onClick={() => {
                  const dialog = gateDialog.current
                  if (typeof dialog?.showModal !== 'function') return
                  setGateOpen(true)
                  dialog.showModal()
                }}
              >
                <Terminal size={14} strokeWidth={2.1} aria-hidden="true" />
                <span>{t(gateCopy.tryGate)}</span>
              </button>
              <a
                href="https://github.com/ahmed-3m/mergeproof"
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-inline-link"
              >
                <span>{t(copy.ossLink)}</span>
                <ArrowUpRight size={15} className="rtl:-scale-x-100" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <dialog
          ref={gateDialog}
          className="portfolio-figure-dialog mp-dialog"
          aria-labelledby="stage-mergeproof-dialog-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close()
          }}
          onClose={() => {
            setGateOpen(false)
            gateTrigger.current?.focus()
          }}
        >
          <div className="mp-dialog-inner">
            <div className="mp-dialog-bar">
              <h3 id="stage-mergeproof-dialog-title" className="mp-dialog-title">
                <bdi dir="ltr">mergeproof</bdi>
                <span className="mp-dialog-sep" aria-hidden="true"> · </span>
                <span>{t(gateCopy.tryGate)}</span>
              </h3>
              <button
                type="button"
                className="mp-dialog-close"
                aria-label={t(gateCopy.closeGate)}
                onClick={() => gateDialog.current?.close()}
              >
                <X size={16} strokeWidth={2.2} aria-hidden="true" />
                <span>{t(gateCopy.closeGate)}</span>
              </button>
            </div>
            {gateOpen && <MergeproofDemo />}
          </div>
        </dialog>
      </section>

      <div className="stage-closing-grid">
        <section className="stage-about" id="about" aria-labelledby="portfolio-about-title">
          <h2 id="portfolio-about-title">{t(copy.about)}</h2>
          <div className="stage-about-lead">
            <Image
              src="/headshot.jpg"
              width={64}
              height={64}
              alt={t(copy.headshotAlt)}
              className="stage-headshot"
            />
            <p>{t(copy.background)}</p>
          </div>
          <div className="stage-about-links">
            <Link className="portfolio-text-link" href="/about/">{t(copy.moreAbout)}</Link>
            <Link id="experience" className="portfolio-text-link" href="/about/#experience">{t(copy.experience)}</Link>
            <Link id="evidence" className="portfolio-text-link" href="/research/#evidence">{t(copy.evidence)}</Link>
          </div>
        </section>

        <nav className="stage-directory" aria-labelledby="portfolio-index-title">
          <h2 id="portfolio-index-title">{t(copy.explore)}</h2>
          <div className="stage-dir-list">
            {exploreItems.map((item) => (
              <Link key={item.id} id={item.id} href={item.href} className="stage-dir-row">
                <span className="stage-dir-title">{t(copy[item.titleKey])}</span>
                <span className="stage-dir-desc">{t(copy[item.descKey])}</span>
                <ArrowRight size={15} className="stage-dir-arrow rtl:rotate-180" aria-hidden="true" />
              </Link>
            ))}
          </div>
          {/* Plain links to individual posts: the concise homepage is the page crawlers revisit most,
              and the full Writing section only renders in the client-side full view. */}
          <div className="stage-dir-posts">
            <h3 id="portfolio-latest-writing">{t(latestWritingCopy.title)}</h3>
            <ul aria-labelledby="portfolio-latest-writing">
              {latestPosts.map((post) => (
                <li key={post.slug}>
                  <Link className="portfolio-text-link" href={`/blog/${post.slug}/`}>{post.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  )
}
