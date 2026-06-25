import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsPageClient from '@/components/NewsPageClient'
import { getAllNews } from '@/lib/news-items'

export const metadata: Metadata = {
  title: 'News | AI and agentic AI, with a take',
  description: 'Curated news on AI and agentic AI, each with a short editorial take from Ahmed Mohammed.',
  alternates: { canonical: 'https://ahmed-3m.github.io/news/' },
  openGraph: {
    title: 'News | AI and agentic AI, with a take',
    description: 'Curated news on AI and agentic AI, each with a short editorial take from Ahmed Mohammed.',
    type: 'website',
    url: 'https://ahmed-3m.github.io/news/',
  },
}

function NewsListJsonLd() {
  const items = getAllNews('en')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI & Agentic AI News',
    description: 'Curated AI and agentic AI news with editorial commentary.',
    url: 'https://ahmed-3m.github.io/news/',
    hasPart: items.map((item) => ({
      '@type': 'NewsArticle',
      headline: item.headline,
      datePublished: item.date,
      url: item.url,
      abstract: item.take,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default function NewsPage() {
  return (
    <>
      <NewsListJsonLd />
      <Header />
      <NewsPageClient />
      <Footer />
    </>
  )
}
