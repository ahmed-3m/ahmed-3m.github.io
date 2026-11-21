'use client'

import { useEffect } from 'react'
import Hero from '@/components/Hero'
import { FullProjects } from '@/components/Projects'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Research from '@/components/Research'
import Evidence from '@/components/Evidence'
import Writing from '@/components/Writing'
import News from '@/components/News'
import PortfolioAbstract from '@/components/PortfolioAbstract'
import Contact from '@/components/Contact'
import { usePortfolioView } from '@/lib/portfolio-view'

export default function HomePortfolio() {
  const { view } = usePortfolioView()

  useEffect(() => {
    if (view !== 'full') return

    // The exported page starts in concise mode. Resolve the fragment again once the full sections exist.
    const sectionId = window.location.hash.slice(1)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'instant' })
  }, [view])

  if (view === 'full') {
    return (
      <>
        <div className="cd-ambient" aria-hidden="true" />
        <main id="main" tabIndex={-1} className="cd-full-portfolio">
          <Hero />
          <FullProjects />
          <Experience />
          <About />
          <Research />
          <Evidence />
          <Writing />
          <News />
          <Contact full />
        </main>
      </>
    )
  }

  return (
    <>
      <div className="cd-ambient" aria-hidden="true" />
      <main id="main" tabIndex={-1} className="portfolio-page">
        <PortfolioAbstract />
        <Contact />
      </main>
    </>
  )
}
