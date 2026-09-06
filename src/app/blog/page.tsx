import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BlogPageClient from '@/components/BlogPageClient'

export const metadata: Metadata = {
  title: 'Blog | AI, research, and product notes',
  description: 'Articles on diffusion models, industrial AI, product engineering, and real-world ML work.',
  alternates: { canonical: 'https://ahmed-3m.github.io/blog/' },
  openGraph: {
    title: 'Blog | AI, research, and product notes',
    description: 'Articles on diffusion models, industrial AI, product engineering, and real-world ML work.',
    type: 'website',
    url: 'https://ahmed-3m.github.io/blog/',
  },
}

export default function BlogPage() {
  return (
    <>
      <Header />
      <BlogPageClient />
      <Footer />
    </>
  )
}
