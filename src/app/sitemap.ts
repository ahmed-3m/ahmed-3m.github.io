import { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/blog-posts';
import { getAllNews } from '@/lib/news-items';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ahmed-3m.github.io';
  const blogPosts = getAllBlogPosts('en');

  // Real content dates instead of build time, so lastModified survives
  // no-op rebuilds and means something to crawlers.
  const latestBlog = blogPosts.length
    ? new Date(Math.max(...blogPosts.map((post) => new Date(post.date).getTime())))
    : new Date();
  const latestNews = getAllNews('en')[0]?.date;
  const latestContent = new Date(
    Math.max(latestBlog.getTime(), latestNews ? new Date(latestNews).getTime() : 0),
  );

  const blogPostEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}/`,
    lastModified: new Date(post.lastModified ?? post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified: latestContent,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: latestBlog,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news/`,
      lastModified: latestNews ? new Date(latestNews) : latestContent,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/feed.xml`,
      lastModified: latestNews ? new Date(latestNews) : latestContent,
      changeFrequency: 'weekly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/case-studies/diffusion-ood/`,
      lastModified: new Date('2026-05-25'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/case-studies/inkjet-ood/`,
      lastModified: new Date('2026-05-25'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/case-studies/faultrix/`,
      lastModified: new Date('2026-05-25'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    ...blogPostEntries,
  ];
}

