'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useI18n } from '@/lib/i18n';

const blogPosts = [
  {
    slug: '5-month-llm-adventure',
    title: '5 Month LLM Adventure',
    date: '2024-11-15',
    excerpt: 'My journey exploring large language models over the past 5 months.',
    tags: ['LLM', 'AI', 'Deep Learning'],
  },
  {
    slug: 'computer-vision-overview',
    title: 'Computer Vision Overview',
    date: '2024-10-20',
    excerpt: 'A comprehensive overview of computer vision techniques and applications.',
    tags: ['Computer Vision', 'Deep Learning', 'CNN'],
  },
  {
    slug: 'mcp-model-context-protocol',
    title: 'MCP: Model Context Protocol',
    date: '2024-09-15',
    excerpt: 'Understanding the Model Context Protocol and its applications.',
    tags: ['MCP', 'AI', 'Protocol'],
  },
];

export default function BlogPage() {
  const { t } = useI18n();

  return (
    <>
      <Header />
      <main className="pt-24 pb-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
          >
            <ArrowLeft size={18} />
            {t('Back to Home', 'Zurück zur Startseite')}
          </Link>

          <h1 className="text-4xl font-bold mb-8">{t('Blog', 'Blog')}</h1>

          <div className="space-y-6">
            {blogPosts.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <time className="text-sm text-blue-600">{post.date}</time>
                <h2 className="text-xl font-semibold mt-2 mb-3">{post.title}</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-4">{post.excerpt}</p>
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
              </motion.article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
