import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CaseStudyPage from '@/components/CaseStudyPage'

export const metadata: Metadata = {
  title: 'DiffusionOOD case study',
  description: 'Conditional diffusion models used as generative classifiers for OOD detection with separation loss and 99.03% +/- 0.07% AUROC.',
  alternates: { canonical: 'https://ahmed-3m.github.io/case-studies/diffusion-ood/' },
}

export default function DiffusionOodCaseStudy() {
  return (
    <>
      <Header />
      <CaseStudyPage slug="diffusion-ood" />
      <Footer />
    </>
  )
}
