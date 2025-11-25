import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getBlogPost, getAllBlogPosts } from '@/lib/blog-posts';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: 'Ahmed Mohammed' }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: ['Ahmed Mohammed'],
      tags: post.tags,
      url: `https://ahmed-3m.github.io/blog/${post.slug}`,
      images: [
        {
          url: '/og-image.png',
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
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `https://ahmed-3m.github.io/blog/${post.slug}`,
    },
  };
}

// Blog post component with structured data
function BlogPostJsonLd({ post }: { post: any }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
      url: 'https://ahmed-3m.github.io',
    },
    datePublished: post.date,
    dateModified: post.date,
    publisher: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://ahmed-3m.github.io/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
    articleSection: 'Technology',
    wordCount: post.content ? post.content.split(' ').length : 0,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// Breadcrumb component with structured data
function Breadcrumbs({ title }: { title: string }) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://ahmed-3m.github.io',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://ahmed-3m.github.io/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/blog" className="text-blue-600 hover:text-blue-700">
              Blog
            </Link>
          </li>
          <li>/</li>
          <li className="text-slate-500">{title}</li>
        </ol>
      </nav>
    </>
  );
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  // Convert markdown-style content to HTML (simple conversion)
  const formatContent = (content: string | undefined) => {
    if (!content) return '';

    return content
      .split('\n\n')
      .map((paragraph, index) => {
        // Handle headings
        if (paragraph.startsWith('## ')) {
          return `<h2 class="text-2xl font-bold mt-8 mb-4" key="${index}">${paragraph.replace('## ', '')}</h2>`;
        }
        if (paragraph.startsWith('### ')) {
          return `<h3 class="text-xl font-semibold mt-6 mb-3" key="${index}">${paragraph.replace('### ', '')}</h3>`;
        }
        // Handle lists
        if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
          const items = paragraph.split('\n').map((item, i) =>
            `<li key="${i}">${item.replace(/^[-*]\s/, '')}</li>`
          ).join('');
          return `<ul class="list-disc list-inside mb-4 space-y-2" key="${index}">${items}</ul>`;
        }
        if (paragraph.match(/^\d+\./)) {
          const items = paragraph.split('\n').map((item, i) =>
            `<li key="${i}">${item.replace(/^\d+\.\s/, '')}</li>`
          ).join('');
          return `<ol class="list-decimal list-inside mb-4 space-y-2" key="${index}">${items}</ol>`;
        }
        // Handle code blocks
        if (paragraph.startsWith('```')) {
          const code = paragraph.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
          return `<pre class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto mb-4" key="${index}"><code>${code}</code></pre>`;
        }
        // Handle bold text
        paragraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Regular paragraph
        return `<p class="mb-4 leading-relaxed text-slate-600 dark:text-slate-300" key="${index}">${paragraph}</p>`;
      })
      .join('');
  };

  return (
    <>
      <BlogPostJsonLd post={post} />
      <Header />
      <main className="pt-24 pb-20 min-h-screen">
        <article className="max-w-3xl mx-auto px-5">
          <Breadcrumbs title={post.title} />

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
          >
            <ArrowLeft size={18} />
            Back to Blog
          </Link>

          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </span>
              {post.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {post.readingTime}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div
            className="prose prose-slate dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />

          <footer className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <Link
                href="/blog"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← View All Posts
              </Link>
              <div className="text-sm text-slate-500">
                Written by Ahmed Mohammed
              </div>
            </div>
          </footer>
        </article>
      </main>
      <Footer />
    </>
  );
}