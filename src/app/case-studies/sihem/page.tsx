import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CaseStudyPage from '@/components/CaseStudyPage'
import { BreadcrumbSchema } from '@/components/JsonLd'
import { ogImage } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Sihem — Proactive AI Personal-Mentor Assistant (Case Study)',
  description:
    'How Ahmed Mohammed built Sihem: a proactive AI personal-mentor assistant on Telegram (@sihem_ai_bot) and PWA with a deterministic decision engine, pgvector RAG memory, and multi-provider LLM routing, incubated at tech2b Linz.',
  alternates: { canonical: 'https://ahmed-3m.github.io/case-studies/sihem/' },
  openGraph: {
    title: 'Sihem — Proactive AI Personal-Mentor Assistant (Case Study)',
    description:
      'Proactive personal-mentor and daily-routine assistant with deterministic nudging, pgvector RAG memory, and multi-provider LLM routing, incubated at tech2b Linz.',
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
