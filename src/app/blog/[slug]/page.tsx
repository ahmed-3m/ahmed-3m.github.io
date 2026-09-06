import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BlogPostClient from '@/components/BlogPostClient'
import { getAllBlogPosts, getBlogPost, getRawBlogPost } from '@/lib/blog-posts'

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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug, 'en')
  const rawPost = getRawBlogPost(slug)

  if (!post || !rawPost) {
    notFound()
  }

  return (
    <>
      <Header />
      <BlogPostClient slug={slug} />
      <Footer />
    </>
  )
}
