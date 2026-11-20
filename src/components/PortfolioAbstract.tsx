'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, Layers } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { BENCHMARK_DATASETS } from '@/lib/ood-explorer-data'
import { diffusionExplorerHref, focusPillars, portfolioCopy as copy, selectedWork } from '@/lib/portfolio-copy'
import { usePortfolioView } from '@/lib/portfolio-view'

const HIST_W = 360
const HIST_H = 128
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

const exploreItems = [
  { id: 'research', href: '/research/', titleKey: 'research', descKey: 'exploreResearchDesc' },
  { id: 'ood-explorer', href: diffusionExplorerHref, titleKey: 'explorer', descKey: 'exploreExplorerDesc' },
  { id: 'writing', href: '/blog/', titleKey: 'writing', descKey: 'exploreWritingDesc' },
  { id: 'news', href: '/news/', titleKey: 'news', descKey: 'exploreNewsDesc' },
] as const

export default function PortfolioAbstract() {
  const { t } = useI18n()
  const { setView } = usePortfolioView()
  const [activeTab, setActiveTab] = useState<(typeof focusPillars)[number]['id']>('diffusion-ood')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const ds = BENCHMARK_DATASETS.within_cifar
  const hist = ds.histogram
  const yMax = Math.max(...hist.id_pct, ...hist.ood_pct)
  const tauX = HIST_PAD_X + ((ds.tauTpr95 - hist.lo) / (hist.hi - hist.lo)) * (HIST_W - HIST_PAD_X * 2)

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
    setActiveTab(nextPillar.id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="portfolio-shell">
      <section className="portfolio-intro" id="hero" aria-labelledby="portfolio-name">
        <div className="portfolio-hero-copy">
          <h1 id="portfolio-name">
            <bdi>
              Ahmed Mohammed<span className="cd-hero-dot" aria-hidden="true">.</span>
            </bdi>
          </h1>
          <p className="portfolio-role">{t(copy.role)}</p>
          <div className="portfolio-disciplines">
            <span>{t(copy.discipline1)}</span>
            <span>{t(copy.discipline2)}</span>
            <span>{t(copy.discipline3)}</span>
          </div>
          <p className="portfolio-lede" data-speakable>{t(copy.lede)}</p>
          <div className="portfolio-actions">
            <a className="portfolio-primary" href="/cv.pdf">{t(copy.cv)}</a>
            <button
              type="button"
              className="portfolio-full-cta"
              onClick={() => {
                setView('full')
                window.scrollTo({ top: 0 })
              }}
            >
              <Layers size={16} strokeWidth={2.2} aria-hidden="true" />
              <span>{t(copy.fullPortfolio)}</span>
              <ArrowRight size={16} strokeWidth={2.2} className="portfolio-cta-arrow rtl:rotate-180" aria-hidden="true" />
            </button>
            <Link className="portfolio-secondary" href="#contact">{t(copy.contact)}</Link>
          </div>
          <div className="portfolio-meta-row">
            <span className="cd-open-badge">
              <span className="cd-open-dot" aria-hidden="true" />
              {t(copy.availability)}
            </span>
            <span className="portfolio-location-text">{t(copy.locationMeta)}</span>
          </div>
        </div>

        <div className="portfolio-snapshot">
          <div
            role="tablist"
            aria-label={t(copy.snapshotLabel)}
            className="portfolio-snapshot-tabs"
          >
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
                  id={`snapshot-tab-${pillar.id}`}
                  aria-selected={isSelected}
                  aria-controls={`snapshot-panel-${pillar.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  className={`portfolio-snapshot-tab${isSelected ? ' is-active' : ''}`}
                  onClick={() => setActiveTab(pillar.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  {t(pillar.tabLabel)}
                </button>
              )
            })}
          </div>

          {focusPillars.map((pillar) => {
            const isSelected = pillar.id === activeTab
            return (
              <div
                key={pillar.id}
                role="tabpanel"
                id={`snapshot-panel-${pillar.id}`}
                aria-labelledby={`snapshot-tab-${pillar.id}`}
                hidden={!isSelected}
                className="portfolio-snapshot-panel"
              >
                <div className="portfolio-snapshot-stage">
                  {pillar.id === 'diffusion-ood' && (
                    <>
                      <div className="cd-signal-plot portfolio-hist-plot" dir="ltr">
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
                      <ul className="cd-signal-legend portfolio-hist-legend">
                        <li><span className="sw sw-id" aria-hidden="true" />{t(copy.histogramId)}</li>
                        <li><span className="sw sw-ood" aria-hidden="true" />{t(copy.histogramOod)}</li>
                      </ul>
                      <p className="portfolio-snapshot-caption">{t(copy.snapshotCaption)}</p>
                    </>
                  )}

                  {pillar.id === 'inkjet-ood' && (
                    <>
                      <div className="portfolio-snapshot-frame">
                        <Image
                          src="/research/inkjet-inspection-samples.webp"
                          width={1100}
                          height={678}
                          sizes="(max-width: 900px) 92vw, 440px"
                          alt={t(copy.inkjetAlt)}
                          className="portfolio-snapshot-img"
                        />
                      </div>
                      <p className="portfolio-snapshot-caption">{t(copy.inkjetCaption)}</p>
                    </>
                  )}

                  {pillar.id === 'sihem' && (
                    <ol className="portfolio-sihem-flow" aria-label={t(copy.sihemLoopAria)}>
                      <li className="portfolio-sihem-step">
                        <div className="portfolio-sihem-step-head">
                          <span className="portfolio-sihem-num" aria-hidden="true">01</span>
                          <span className="portfolio-sihem-label">{t(copy.sihemStep1Label)}</span>
                          <ArrowRight size={14} className="portfolio-sihem-arrow rtl:rotate-180" aria-hidden="true" />
                        </div>
                        <p className="portfolio-sihem-desc">{t(copy.sihemStep1Desc)}</p>
                      </li>
                      <li className="portfolio-sihem-step">
                        <div className="portfolio-sihem-step-head">
                          <span className="portfolio-sihem-num" aria-hidden="true">02</span>
                          <span className="portfolio-sihem-label">{t(copy.sihemStep2Label)}</span>
                          <ArrowRight size={14} className="portfolio-sihem-arrow rtl:rotate-180" aria-hidden="true" />
                        </div>
                        <p className="portfolio-sihem-desc">{t(copy.sihemStep2Desc)}</p>
                      </li>
                      <li className="portfolio-sihem-step">
                        <div className="portfolio-sihem-step-head">
                          <span className="portfolio-sihem-num" aria-hidden="true">03</span>
                          <span className="portfolio-sihem-label">{t(copy.sihemStep3Label)}</span>
                        </div>
                        <p className="portfolio-sihem-desc">{t(copy.sihemStep3Desc)}</p>
                      </li>
                    </ol>
                  )}
                </div>

                <div className="portfolio-snapshot-foot">
                  <div className="portfolio-snapshot-foot-top">
                    <p className="portfolio-snapshot-title">{t(pillar.title)}</p>
                    <p className="portfolio-snapshot-metric"><bdi dir="ltr">{pillar.metricValue}</bdi></p>
                  </div>
                  <div className="portfolio-snapshot-foot-bottom">
                    <p className="portfolio-snapshot-sub">{t(pillar.metricSub)}</p>
                    <Link href={pillar.href} className="portfolio-inline-link">
                      <span>{t(pillar.ctaLabel)}</span>
                      <ArrowRight size={15} className="rtl:rotate-180" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="portfolio-work" id="projects" aria-labelledby="portfolio-work-title">
        <h2 id="portfolio-work-title">{t(copy.work)}</h2>
        <div className="portfolio-work-grid">
          {selectedWork.map((work) => (
            <article key={work.slug} className="portfolio-project">
              {work.slug === 'inkjet-ood' && (
                <div className="portfolio-project-media portfolio-project-media--light">
                  <Image
                    src="/research/inkjet-inspection-samples.webp"
                    width={1100}
                    height={678}
                    sizes="(max-width: 900px) 94vw, 350px"
                    alt={t(copy.inkjetAlt)}
                  />
                </div>
              )}

              {work.slug === 'diffusion-ood' && (
                <div className="portfolio-project-media portfolio-project-media--dark">
                  <Image
                    src="/research/separation-apart-preview.webp"
                    width={800}
                    height={450}
                    sizes="(max-width: 900px) 94vw, 350px"
                    alt={t(copy.diffusionDiagramAlt)}
                  />
                </div>
              )}

              {work.slug === 'sihem' && (
                <div role="group" className="portfolio-project-media portfolio-project-media--sihem" aria-label={t(copy.sihemLoopAria)}>
                  <div className="portfolio-sihem-mini">
                    <span className="portfolio-sihem-mini-node">
                      <span className="portfolio-sihem-mini-dot" aria-hidden="true" />
                      <span>{t(copy.sihemStep1Label)}</span>
                    </span>
                    <ArrowRight size={14} className="portfolio-sihem-mini-arrow rtl:rotate-180" aria-hidden="true" />
                    <span className="portfolio-sihem-mini-node">
                      <span className="portfolio-sihem-mini-dot" aria-hidden="true" />
                      <span>{t(copy.sihemStep2Label)}</span>
                    </span>
                    <ArrowRight size={14} className="portfolio-sihem-mini-arrow rtl:rotate-180" aria-hidden="true" />
                    <span className="portfolio-sihem-mini-node">
                      <span className="portfolio-sihem-mini-dot" aria-hidden="true" />
                      <span>{t(copy.sihemStep3Label)}</span>
                    </span>
                  </div>
                </div>
              )}

              <div className="portfolio-project-body">
                <h3>{t(work.title)}</h3>
                <p className="portfolio-project-meta">{t(work.context)}</p>
                <div className="portfolio-project-metric">
                  <strong className="portfolio-metric-num"><bdi dir="ltr">{work.metricValue}</bdi></strong>
                  <span className="portfolio-metric-label">{t(work.metricLabel)}</span>
                </div>
                <p className="portfolio-project-summary">{t(work.summary)}</p>
                <div className="cd-proj-tags">
                  {work.tags.map((tag) => (
                    <span key={typeof tag === 'string' ? tag : tag.en} className="cd-proj-tag">
                      {typeof tag === 'string' ? tag : t(tag)}
                    </span>
                  ))}
                </div>
                <div className="portfolio-project-links">
                  <Link className="portfolio-text-link" href={work.href}>
                    <span>{t(work.link)}</span>
                    <ArrowRight size={15} className="rtl:rotate-180" aria-hidden="true" />
                  </Link>
                  {work.slug === 'diffusion-ood' && (
                    <Link className="portfolio-text-link portfolio-project-explorer" href={diffusionExplorerHref}>
                      <span>{t(copy.explorer)}</span>
                      <ArrowRight size={15} className="rtl:rotate-180" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="portfolio-oss-strip">
          <span className="portfolio-oss-name"><bdi dir="ltr">mergeproof</bdi></span>
          <span className="cd-proj-tag">{t(copy.ossBadge)}</span>
          <p className="portfolio-oss-summary">{t(copy.ossSummary)}</p>
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
      </section>

      <div className="portfolio-closing-grid">
        <section className="portfolio-about" id="about" aria-labelledby="portfolio-about-title">
          <h2 id="portfolio-about-title">{t(copy.about)}</h2>
          <div className="portfolio-about-lead">
            <Image
              src="/headshot.jpg"
              width={84}
              height={84}
              alt={t(copy.headshotAlt)}
              className="portfolio-headshot"
            />
            <p>{t(copy.background)}</p>
          </div>
          <div className="portfolio-about-links">
            <Link className="portfolio-text-link" href="/about/">{t(copy.moreAbout)}</Link>
            <Link id="experience" className="portfolio-text-link" href="/about/#experience">{t(copy.experience)}</Link>
            <Link id="evidence" className="portfolio-text-link" href="/research/#evidence">{t(copy.evidence)}</Link>
          </div>
        </section>

        <nav className="portfolio-index" aria-labelledby="portfolio-index-title">
          <h2 id="portfolio-index-title">{t(copy.explore)}</h2>
          <div className="portfolio-explore-grid">
            {exploreItems.map((item) => (
              <Link key={item.id} id={item.id} href={item.href} className="portfolio-explore-card">
                <div className="portfolio-explore-card-head">
                  <span className="portfolio-explore-card-title">{t(copy[item.titleKey])}</span>
                  <ArrowRight size={15} className="portfolio-explore-arrow rtl:rotate-180" aria-hidden="true" />
                </div>
                <p className="portfolio-explore-card-desc">{t(copy[item.descKey])}</p>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
