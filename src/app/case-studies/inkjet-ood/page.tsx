import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CaseStudyPage from '@/components/CaseStudyPage'
import { getRelatedPosts } from '@/lib/related-content'
import { BreadcrumbSchema } from '@/components/JsonLd'
import { formatClaim } from '@/lib/claims'
import { ogImage } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Inkjet Defect Detection on FTI_Zer0P (Case Study)',
  description:
    `Evaluating a public YOLO + conditional diffusion pipeline for inkjet print-quality control on the public FTI_Zer0P dataset under strict 5-fold cross-validation (${formatClaim('inkjet.baseline', 'en', 'metric')}) — Ahmed Mohammed, JKU Linz / PROFACTOR.`,
  alternates: { canonical: 'https://ahmed-3m.github.io/case-studies/inkjet-ood/' },
  openGraph: {
    title: 'Inkjet Defect Detection on FTI_Zer0P (Case Study)',
    description:
      `YOLO + conditional diffusion pipeline for industrial print QC on FTI_Zer0P under strict 5-fold cross-validation: ${formatClaim('inkjet.baseline', 'en', 'metric')}.`,
    type: 'article',
    url: 'https://ahmed-3m.github.io/case-studies/inkjet-ood/',
    images: ogImage('Inkjet OOD case study', '/og-inkjet-ood.png'),
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inkjet Defect Detection on FTI_Zer0P (Case Study)',
    description:
      `YOLO + conditional diffusion pipeline for industrial print QC on FTI_Zer0P under strict 5-fold cross-validation: ${formatClaim('inkjet.baseline', 'en', 'metric')}.`,
    images: ['/og-inkjet-ood.png'],
  },
}

export default function InkjetOodCaseStudy() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ahmed-3m.github.io/' },
          { name: 'Projects', url: 'https://ahmed-3m.github.io/#projects' },
          { name: 'Inkjet Defect Detection', url: 'https://ahmed-3m.github.io/case-studies/inkjet-ood/' },
        ]}
      />
      <Header />
      <CaseStudyPage slug="inkjet-ood" relatedPosts={getRelatedPosts('inkjet-ood')} />
      <Footer />
    </>
  )
}
