import { getAllBlogPosts } from '@/lib/blog-posts'
import { getAllNews } from '@/lib/news-items'

/**
 * Newest committed content date across blog posts and news items, as a full
 * ISO datetime.
 *
 * Derived from committed content rather than `Date.now()` so the value is
 * identical on the server and in the client bundle of the static export: a
 * build-time `new Date()` is re-evaluated at hydration and never matches what
 * was baked into the HTML, which React reports as a hydration mismatch. It
 * also survives no-op rebuilds and means something to crawlers, the same
 * reasoning `sitemap.ts` applies to `lastModified`.
 */
export function latestContentDateIso(): string {
  const blogTimes = getAllBlogPosts('en').map((post) =>
    new Date(post.lastModified ?? post.date).getTime(),
  )
  const latestNews = getAllNews('en')[0]?.date
  const latest = Math.max(
    ...blogTimes,
    latestNews ? new Date(latestNews).getTime() : 0,
  )
  return new Date(latest).toISOString()
}
