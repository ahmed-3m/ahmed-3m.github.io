import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsPageClient from '@/components/NewsPageClient'

export const metadata: Metadata = {
  title: 'News | AI and agentic AI, with a take',
  description: 'Curated news on AI and agentic AI, each with a short editorial take from Ahmed Mohammed.',
  alternates: { canonical: 'https://ahmed-3m.github.io/news/' },
  openGraph: {
    title: 'News | AI and agentic AI, with a take',
    description: 'Curated news on AI and agentic AI, each with a short editorial take from Ahmed Mohammed.',
    type: 'website',
    url: 'https://ahmed-3m.github.io/news/',
    // Page-level openGraph replaces the layout's object wholesale — without
    // this images array the route ships no og:image.
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Ahmed Mohammed - AI/ML Engineer' }],
  },
}

export default function NewsPage() {
  return (
    <>
      <Header />
      <NewsPageClient />
      <Footer />
    </>
  )
}
