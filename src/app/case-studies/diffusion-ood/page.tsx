import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CaseStudyPage from '@/components/CaseStudyPage'

import { ogImage } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Diffusion OOD Detection — 99.03% AUROC (Case Study)',
  description:
    'Class-conditional separation loss turns conditional diffusion models into stable generative OOD classifiers: 99.03% ± 0.07% AUROC on a within-CIFAR airplane-vs-rest binary split (single ID class), +6.5pp over baseline. Ahmed Mohammed M.Sc. thesis at JKU Linz.',
  alternates: { canonical: 'https://ahmed-3m.github.io/case-studies/diffusion-ood/' },
  openGraph: {
    title: 'Diffusion OOD Detection — 99.03% AUROC (Case Study)',
    description:
      'Conditional diffusion models as generative OOD classifiers with a novel separation loss: 99.03% ± 0.07% AUROC, +6.5pp over baseline, low seed standard deviation.',
    type: 'article',
    url: 'https://ahmed-3m.github.io/case-studies/diffusion-ood/',
    images: ogImage('Diffusion OOD detection case study', '/og-diffusion-ood.png'),
  },
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
