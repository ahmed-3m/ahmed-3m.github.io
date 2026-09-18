import { getAllBlogPosts } from '@/lib/blog-posts'
import { getAllNews } from '@/lib/news-items'

// Shared "when did the content last change" dates.
//
// Derived from real publication dates rather than build time, so a no-op
// rebuild does not churn the values and they mean something to crawlers.
// The sitemap's <lastmod> and the JSON-LD's dateModified describe the same
// thing, so they read it from here and cannot drift apart.

/** Newest publication date across blog posts. */
export function getLatestBlogDate(): Date {
  const posts = getAllBlogPosts('en')
  return posts.length
    ? new Date(Math.max(...posts.map((post) => new Date(post.date).getTime())))
    : new Date()
}

/** Date of the newest news item, or null when there are none. */
export function getLatestNewsDate(): string | undefined {
  return getAllNews('en')[0]?.date
}

/** Newest date across all content — the site's effective last-modified. */
export function getLatestContentDate(): Date {
  const latestNews = getLatestNewsDate()
  return new Date(
    Math.max(
      getLatestBlogDate().getTime(),
      latestNews ? new Date(latestNews).getTime() : 0,
    ),
  )
}
