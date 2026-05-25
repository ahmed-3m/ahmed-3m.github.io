import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CaseStudyPage from '@/components/CaseStudyPage'

export const metadata: Metadata = {
  title: 'Faultrix case study',
  description: 'How Ahmed Mohammed built Faultrix from zero to a live AI construction quality-control SaaS.',
  alternates: { canonical: 'https://ahmed-3m.github.io/case-studies/faultrix/' },
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
