import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CaseStudyPage from '@/components/CaseStudyPage'
import { BreadcrumbSchema } from '@/components/JsonLd'
import { ogImage } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Sihem — Satellite-Driven Crop Health & Yield Intelligence (Case Study)',
  description:
    'How Ahmed Mohammed built Sihem: fusing Sentinel-1 SAR and Sentinel-2 multispectral time-series with an agronomic LLM copilot, accepted into the tech2b startup incubator Linz.',
  alternates: { canonical: 'https://ahmed-3m.github.io/case-studies/sihem/' },
  openGraph: {
    title: 'Sihem — Satellite-Driven Crop Health & Yield Intelligence (Case Study)',
    description:
      'Copernicus Sentinel-1/2 fusion paired with an agronomic LLM copilot for sub-parcel crop health intelligence, incubated at tech2b Linz.',
    type: 'article',
    url: 'https://ahmed-3m.github.io/case-studies/sihem/',
    images: ogImage('Sihem case study'),
  },
}

export default function SihemCaseStudy() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ahmed-3m.github.io/' },
          { name: 'Projects', url: 'https://ahmed-3m.github.io/#projects' },
          { name: 'Sihem', url: 'https://ahmed-3m.github.io/case-studies/sihem/' },
        ]}
      />
      <Header />
      <CaseStudyPage slug="sihem" />
      <Footer />
    </>
  )
}
