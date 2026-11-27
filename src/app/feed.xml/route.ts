import { getAllBlogPostsMeta } from '@/lib/blog-posts-meta';
import { getLatestBlogDate } from '@/lib/content-dates';
import { escapeXml, wrapCdata } from '@/lib/rss';

export const dynamic = 'force-static';

export async function GET() {
  const posts = getAllBlogPostsMeta();
  const baseUrl = 'https://ahmed-3m.github.io';
  const lastBuildDate = getLatestBlogDate().toUTCString();

  const items = posts.map((post) => `
    <item>
      <title>${wrapCdata(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}/</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}/</guid>
      <description>${wrapCdata(post.excerpt)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      ${post.tags.map(t => `<category>${escapeXml(t)}</category>`).join('\n      ')}
    </item>
  `).join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ahmed Mohammed — AI/ML Blog</title>
    <link>${baseUrl}/blog/</link>
    <description>Articles on computer vision, diffusion models, OOD detection, and production AI engineering.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>ahmed.mo.0595@gmail.com (Ahmed Mohammed)</managingEditor>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
