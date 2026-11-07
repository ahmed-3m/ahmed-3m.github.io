import { MetadataRoute } from 'next';
import { getAllBlogPostsMeta } from '@/lib/blog-posts-meta';
import { getLatestBlogDate, getLatestContentDate, getLatestNewsDate } from '@/lib/content-dates';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://ahmed-3m.github.io';
  const blogPosts = getAllBlogPostsMeta('en');

  // Real content dates instead of build time, so lastModified survives
  // no-op rebuilds and means something to crawlers. Shared with the JSON-LD
  // dateModified via @/lib/content-dates so the two cannot drift apart.
  const latestBlog = getLatestBlogDate();
  const latestNews = getLatestNewsDate();
  const latestContent = getLatestContentDate();

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
      lastModified: latestContent,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/case-studies/inkjet-ood/`,
      lastModified: latestContent,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/case-studies/faultrix/`,
      lastModified: latestContent,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...blogPostEntries,
  ];
}
