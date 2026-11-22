import type { Metadata } from 'next'
import Evidence from '@/components/Evidence'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { BreadcrumbSchema, ResearchSchema } from '@/components/JsonLd'
import PortfolioPageTitle from '@/components/PortfolioPageTitle'
import Research from '@/components/Research'
import { ogImage } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Research',
  description: 'Thesis experiments on unfamiliar-image detection and inkjet print inspection, with charts, an interactive explorer, code, and papers.',
  alternates: { canonical: 'https://ahmed-3m.github.io/research/' },
  openGraph: {
    title: 'Research | Ahmed Mohammed',
    description: 'Thesis experiments on unfamiliar-image detection and inkjet print inspection, with charts, an interactive explorer, code, and papers.',
    type: 'website',
    url: 'https://ahmed-3m.github.io/research/',
    images: ogImage('Ahmed Mohammed - AI/ML Engineer'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research | Ahmed Mohammed',
    description: 'Thesis experiments on unfamiliar-image detection and inkjet print inspection, with charts, an interactive explorer, code, and papers.',
    images: ['/og-image.png'],
  },
}

export default function ResearchPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ahmed-3m.github.io/' },
          { name: 'Research', url: 'https://ahmed-3m.github.io/research/' },
        ]}
      />
      <ResearchSchema />
      <Header />
      <main id="main" tabIndex={-1} className="portfolio-detail">
        <PortfolioPageTitle page="research" />
        <Research />
        <Evidence />
      </main>
      <Footer />
    </>
  )
}
