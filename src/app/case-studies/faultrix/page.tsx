import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CaseStudyPage from '@/components/CaseStudyPage'

export const metadata: Metadata = {
  title: 'Faultrix — AI Construction Quality Control (Case Study)',
  description:
    'How Ahmed Mohammed built Faultrix solo from zero to production: photo-based defect analysis generating ÖNORM B 2110-compliant reports in under a minute, with SHA-256 evidence chain and DSGVO compliance.',
  alternates: { canonical: 'https://ahmed-3m.github.io/case-studies/faultrix/' },
  openGraph: {
    title: 'Faultrix — AI Construction Quality Control (Case Study)',
    description:
      'Solo-built AI construction QC SaaS: photo analysis to ÖNORM B 2110-compliant reports in under a minute, SHA-256 evidence chain, DSGVO compliant.',
    type: 'article',
    url: 'https://ahmed-3m.github.io/case-studies/faultrix/',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Faultrix case study' }],
  },
}

export default function FaultrixCaseStudy() {
  return (
    <>
      <Header />
      <CaseStudyPage slug="faultrix" />
      <Footer />
    </>
  )
}
