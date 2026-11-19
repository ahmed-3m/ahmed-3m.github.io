'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useI18n } from '@/lib/i18n'
import { portfolioCopy as copy, selectedWork } from '@/lib/portfolio-copy'

export default function PortfolioAbstract() {
  const { t } = useI18n()

  return (
    <div className="portfolio-shell">
      <section className="portfolio-intro" id="hero" aria-labelledby="portfolio-name">
        <div>
          <h1 id="portfolio-name"><bdi>Ahmed Mohammed</bdi></h1>
          <p className="portfolio-role">{t(copy.role)}</p>
          <p className="portfolio-lede" data-speakable>{t(copy.lede)}</p>
          <div className="portfolio-actions">
            <a className="portfolio-primary" href="/cv.pdf">{t(copy.cv)}</a>
            <Link className="portfolio-secondary" href="#contact">{t(copy.contact)}</Link>
          </div>
        </div>
        <div className="portfolio-location">
          <p>{t(copy.location)}</p>
          <p><span className="portfolio-status-dot" aria-hidden="true" />{t(copy.availability)}</p>
        </div>
      </section>

      <section className="portfolio-work" id="projects" aria-labelledby="portfolio-work-title">
        <h2 id="portfolio-work-title">{t(copy.work)}</h2>
        <div className="portfolio-work-grid">
          {selectedWork.map((work) => (
            <article key={work.href} className="portfolio-project">
              <div className="portfolio-project-body">
                <p className="portfolio-project-context">{t(work.context)}</p>
                <h3>{t(work.title)}</h3>
                <p className="portfolio-project-summary">{t(work.summary)}</p>
                <Link className="portfolio-text-link" href={work.href}>{t(work.link)}</Link>
              </div>
              {work.visual && (
                <figure className="portfolio-project-figure">
                  <Image src="/research/inkjet-inspection-samples.webp" width={1100} height={678}
                    sizes="(max-width: 720px) 94vw, 510px" alt={t(copy.inkjetAlt)} />
                  <figcaption>{t(copy.inkjetCaption)}</figcaption>
                </figure>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="portfolio-about" id="about" aria-labelledby="portfolio-about-title">
        <h2 id="portfolio-about-title">{t(copy.about)}</h2>
        <div>
          <p>{t(copy.background)}</p>
          <Link className="portfolio-text-link" href="/about/">{t(copy.moreAbout)}</Link>
          <Link id="experience" className="portfolio-text-link" href="/about/#experience">{t(copy.experience)}</Link>
        </div>
      </section>

      <nav className="portfolio-index" aria-labelledby="portfolio-index-title">
        <h2 id="portfolio-index-title">{t(copy.explore)}</h2>
        <ul>
          <li id="research"><Link className="portfolio-text-link" href="/research/">{t(copy.research)}</Link></li>
          <li id="evidence"><Link className="portfolio-text-link" href="/research/#evidence">{t(copy.evidence)}</Link></li>
          <li id="ood-explorer"><Link className="portfolio-text-link" href="/case-studies/diffusion-ood/#ood-explorer">{t(copy.explorer)}</Link></li>
          <li id="writing"><Link className="portfolio-text-link" href="/blog/">{t(copy.writing)}</Link></li>
          <li id="news"><Link className="portfolio-text-link" href="/news/">{t(copy.news)}</Link></li>
        </ul>
      </nav>
    </div>
  )
}
