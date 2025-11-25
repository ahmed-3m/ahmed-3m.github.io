import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllBlogPosts } from '@/lib/blog-posts';

export const metadata: Metadata = {
  title: 'Blog | AI/ML Insights and Tutorials',
  description: 'Explore articles on AI, machine learning, computer vision, and deep learning. Practical insights from production deployments and research.',
  keywords: ['AI Blog', 'Machine Learning Articles', 'Deep Learning Tutorials', 'Computer Vision', 'Ahmed Mohammed Blog'],
  openGraph: {
    title: 'Blog | Ahmed Mohammed',
    description: 'AI/ML insights, tutorials, and experiences from production deployments',
    type: 'website',
    url: 'https://ahmed-3m.github.io/blog',
  },
  alternates: {
    canonical: 'https://ahmed-3m.github.io/blog',
  },
};

// Blog list schema
function BlogListJsonLd() {
  const posts = getAllBlogPosts();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Ahmed Mohammed AI/ML Blog',
    description: 'Articles on AI, machine learning, and computer vision',
    url: 'https://ahmed-3m.github.io/blog',
    author: {
      '@type': 'Person',
      name: 'Ahmed Mohammed',
    },
    blogPost: posts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      url: `https://ahmed-3m.github.io/blog/${post.slug}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function BlogPage() {
  const blogPosts = getAllBlogPosts();

  return (
    <>
      <BlogListJsonLd />
      <Header />
      <main className="pt-24 pb-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          <h1 className="text-4xl font-bold mb-2">Blog</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            Insights and experiences from AI/ML research and production deployments
          </p>

          <div className="space-y-6">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="card-3d bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                  <time dateTime={post.date} className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                  {post.readingTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {post.readingTime}
                    </span>
                  )}
                </div>

                <Link href={`/blog/${post.slug}`} className="group">
                  <h2 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-slate-600 dark:text-slate-300 mb-4">{post.excerpt}</p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Read more
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
