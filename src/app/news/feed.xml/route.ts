import { getLatestNewsDate } from '@/lib/content-dates'
import { getAllNews, newsCategoryLabels } from '@/lib/news-items'
import { escapeXml, wrapCdata } from '@/lib/rss'

export const dynamic = 'force-static'

const RSS_ITEM_LIMIT = 30

export async function GET() {
  const baseUrl = 'https://ahmed-3m.github.io'
  const items = getAllNews('en').slice(0, RSS_ITEM_LIMIT)
  const latest = getLatestNewsDate()
  const lastBuildDate = (latest ? new Date(`${latest}T00:00:00Z`) : new Date()).toUTCString()

  const entries = items
    .map((item) => {
      const categoryLabel = newsCategoryLabels[item.category].en
      const tagsXml = (item.tags ?? [])
        .map((tag) => `<category>${escapeXml(tag)}</category>`)
        .join('\n      ')
      const summary = `[${item.source} · ${categoryLabel}] ${item.take}`
      return `
    <item>
      <title>${wrapCdata(item.headline)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="false">${escapeXml(`${baseUrl}/news/#${item.id}`)}</guid>
      <description>${wrapCdata(summary)}</description>
      <pubDate>${new Date(`${item.date}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${escapeXml(categoryLabel)}</category>${tagsXml ? `\n      ${tagsXml}` : ''}
    </item>`
    })
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ahmed Mohammed — AI &amp; Agentic AI News</title>
    <link>${baseUrl}/news/</link>
    <description>Daily curated AI and agentic-AI engineering news, each paired with a concise editorial take.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/news/feed.xml" rel="self" type="application/rss+xml"/>
    <managingEditor>ahmed.mo.0595@gmail.com (Ahmed Mohammed)</managingEditor>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    ${entries}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
