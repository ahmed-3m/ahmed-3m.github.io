import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BlogPostClient from '@/components/BlogPostClient'
import { getAllBlogPosts, getBlogPost, getRawBlogPost, type LocalizedBlogPost } from '@/lib/blog-posts'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllBlogPosts('en').map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug, 'en')

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: 'Ahmed Mohammed' }],
    alternates: { canonical: `https://ahmed-3m.github.io/blog/${post.slug}/` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: ['Ahmed Mohammed'],
      tags: post.tags,
      url: `https://ahmed-3m.github.io/blog/${post.slug}/`,
      images: [
        {
          url: post.ogImage ?? '/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.ogImage ?? '/og-image.png'],
    },
  }
}

function BlogPostJsonLd({ post }: { post: LocalizedBlogPost }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: `https://ahmed-3m.github.io${post.ogImage ?? '/og-image.png'}`,
    author: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
      url: 'https://ahmed-3m.github.io',
      image: 'https://ahmed-3m.github.io/headshot.jpg',
    },
    datePublished: post.date,
    dateModified: post.lastModified ?? post.date,
    publisher: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
      image: 'https://ahmed-3m.github.io/headshot.jpg',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://ahmed-3m.github.io/blog/${post.slug}/`,
    },
    keywords: post.tags.join(', '),
    wordCount: post.content ? post.content.split(/\s+/).length : 0,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

function BlogFaqJsonLd({ post }: { post: LocalizedBlogPost }) {
  if (post.faq.length === 0) return null

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  )
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug, 'en')
  const rawPost = getRawBlogPost(slug)

  if (!post || !rawPost) {
    notFound()
  }

  return (
    <>
      <BlogPostJsonLd post={post} />
      <BlogFaqJsonLd post={post} />
      <Header />
      <BlogPostClient slug={slug} />
      <Footer />
    </>
  )
}
