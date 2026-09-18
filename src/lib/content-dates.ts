import { getAllBlogPosts } from '@/lib/blog-posts'
import { getAllNews } from '@/lib/news-items'

// Shared "when did the content last change" dates.
//
// Derived from real publication dates rather than build time, so a no-op
// rebuild does not churn the values and they mean something to crawlers.
// The sitemap's <lastmod> and the JSON-LD's dateModified describe the same
// thing, so they read it from here and cannot drift apart.
//
// JsonLd.tsx is a client module, so a `new Date()` there is baked into the
// exported HTML at build time and re-evaluated at hydration — a guaranteed
// hydration mismatch. These helpers are the deterministic replacement.

/** A post's effective last-change date: the later of `date` and `lastModified`. */
function postDate(post: { date: string; lastModified?: string }): number {
  // Not `lastModified ?? date`: one post carries a `lastModified` that predates
  // its own `date`, and `??` would silently discard the newer of the two.
  const published = new Date(post.date).getTime()
  const modified = post.lastModified ? new Date(post.lastModified).getTime() : 0
  return Math.max(published, modified)
}

/** Newest effective date across blog posts. */
export function getLatestBlogDate(): Date {
  const posts = getAllBlogPosts('en')
  return posts.length ? new Date(Math.max(...posts.map(postDate))) : new Date()
}

/** Date of the newest news item, or undefined when there are none. */
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
