import { caseStudies } from '@/lib/case-studies';
import { MetadataRoute } from 'next';
import { getAllBlogPostsMeta } from '@/lib/blog-posts-meta';
import { getHomepageDate, getLatestBlogDate, getLatestNewsDate, PAGE_LAST_MODIFIED } from '@/lib/content-dates';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ahmed-3m.github.io';
  const blogPosts = getAllBlogPostsMeta('en');

  // Real content dates instead of build time, so lastModified survives
  // no-op rebuilds and means something to crawlers (see @/lib/content-dates).
  const latestBlog = getLatestBlogDate();
  const latestNews = getLatestNewsDate();

  const blogPostEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}/`,
    lastModified: new Date(post.lastModified ?? post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    {
      url: `${baseUrl}/`,
      lastModified: getHomepageDate(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: new Date(PAGE_LAST_MODIFIED.about),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/research/`,
      lastModified: new Date(PAGE_LAST_MODIFIED.research),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: latestBlog,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news/`,
      lastModified: latestNews ? new Date(latestNews) : latestBlog,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/impressum/`,
      lastModified: new Date(PAGE_LAST_MODIFIED.legal),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/privacy/`,
      lastModified: new Date(PAGE_LAST_MODIFIED.legal),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    ...caseStudies.map((study) => ({
      url: `${baseUrl}/case-studies/${study.slug}/`,
      lastModified: new Date(study.lastModified),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...blogPostEntries,
  ];
}
