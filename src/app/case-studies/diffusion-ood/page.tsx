import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CaseStudyPage from '@/components/CaseStudyPage'
import { getRelatedPosts } from '@/lib/related-content'
import { BreadcrumbSchema } from '@/components/JsonLd'

import { formatClaim } from '@/lib/claims'
import { ogImage } from '@/lib/seo'

// Titles carry the spread and the 3-seed qualifier (spec 008, R11 option a).
const TITLE = `Diffusion OOD Detection — ${formatClaim('thesis.mean', 'en', 'full')} · Case Study`
const SHARE_DESCRIPTION = `Conditional diffusion models as generative OOD classifiers with a novel separation loss: ${formatClaim('thesis.mean', 'en', 'full')}, ${formatClaim('thesis.gainPp', 'en')} over baseline, low seed standard deviation.`

export const metadata: Metadata = {
  title: TITLE,
  description:
    `Class-conditional separation loss turns conditional diffusion models into stable generative OOD classifiers: ${formatClaim('thesis.mean', 'en', 'full')} on a within-CIFAR airplane-vs-rest binary split (single ID class), ${formatClaim('thesis.gainPp', 'en')} over baseline. Ahmed Mohammed M.Sc. thesis at JKU Linz.`,
  alternates: { canonical: 'https://ahmed-3m.github.io/case-studies/diffusion-ood/' },
  openGraph: {
    title: TITLE,
    description: SHARE_DESCRIPTION,
    type: 'article',
    url: 'https://ahmed-3m.github.io/case-studies/diffusion-ood/',
    images: ogImage('Diffusion OOD detection case study', '/og-diffusion-ood.png'),
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: SHARE_DESCRIPTION,
    images: ['/og-diffusion-ood.png'],
  },
}

export default function DiffusionOodCaseStudy() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://ahmed-3m.github.io/' },
          { name: 'Projects', url: 'https://ahmed-3m.github.io/#projects' },
          { name: 'Diffusion OOD Detection', url: 'https://ahmed-3m.github.io/case-studies/diffusion-ood/' },
        ]}
      />
      <Header />
      <CaseStudyPage slug="diffusion-ood" relatedPosts={getRelatedPosts('diffusion-ood')} />
      <Footer />
    </>
  )
}
