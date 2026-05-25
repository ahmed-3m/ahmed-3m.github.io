import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CaseStudyPage from '@/components/CaseStudyPage'

export const metadata: Metadata = {
  title: 'InkjetOOD case study',
  description: 'Industrial print-quality control with a public YOLO + conditional diffusion pipeline on FTI_Zer0P.',
  alternates: { canonical: 'https://ahmed-3m.github.io/case-studies/inkjet-ood/' },
}

export default function InkjetOodCaseStudy() {
  return (
    <>
      <Header />
      <CaseStudyPage slug="inkjet-ood" />
      <Footer />
    </>
  )
}
