import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BlogPageClient from '@/components/BlogPageClient'
import { getAllBlogPosts } from '@/lib/blog-posts'

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

function BlogListJsonLd() {
  const posts = getAllBlogPosts('en')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Ahmed Mohammed AI/ML Blog',
    description: 'Articles on AI, machine learning, computer vision, and product engineering',
    url: 'https://ahmed-3m.github.io/blog/',
    author: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      url: `https://ahmed-3m.github.io/blog/${post.slug}/`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default function BlogPage() {
  return (
    <>
      <BlogListJsonLd />
      <Header />
      <BlogPageClient />
      <Footer />
    </>
  )
}
