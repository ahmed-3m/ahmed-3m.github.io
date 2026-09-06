import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CaseStudyPage from '@/components/CaseStudyPage'

export const metadata: Metadata = {
  title: 'Inkjet Defect Detection on FTI_Zer0P (Case Study)',
  description:
    'Evaluating a public YOLO + conditional diffusion pipeline for inkjet print-quality control on the public FTI_Zer0P dataset under strict 5-fold cross-validation (0.8673 ± 0.0230 AUROC) — Ahmed Mohammed, JKU Linz / PROFACTOR.',
  alternates: { canonical: 'https://ahmed-3m.github.io/case-studies/inkjet-ood/' },
  openGraph: {
    title: 'Inkjet Defect Detection on FTI_Zer0P (Case Study)',
    description:
      'YOLO + conditional diffusion pipeline for industrial print QC on FTI_Zer0P under strict 5-fold cross-validation: 0.8673 ± 0.0230 AUROC.',
    type: 'article',
    url: 'https://ahmed-3m.github.io/case-studies/inkjet-ood/',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Inkjet OOD case study' }],
  },
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
