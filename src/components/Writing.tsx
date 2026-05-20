'use client'
import { useReveal } from '@/lib/useReveal'
import { getAllBlogPosts } from '@/lib/blog-posts'

export default function Writing() {
  useReveal()
  const posts = getAllBlogPosts().slice(0, 3)

  return (
    <section id="writing" className="cd-section">
      <div className="cd-container">
        <div className="cd-section-eyebrow">// 05 — Writing</div>
        <h2 className="cd-section-title" style={{ marginBottom: 8 }}>Thinking out loud.</h2>
        <p style={{ color: 'var(--cd-fg2)', fontSize: 15, marginBottom: 40, maxWidth: 560 }}>
          Deep-dives on research decisions, production lessons, and the gap between papers and products.
        </p>

        <div className="cd-writing-grid">
          {posts.map((post, i) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="cd-writing-card reveal"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="cd-wc-tags">
                {post.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="cd-wc-tag">{tag}</span>
                ))}
              </div>
              <div className="cd-wc-title">{post.title}</div>
              <div className="cd-wc-excerpt">
                {post.excerpt.length > 140 ? post.excerpt.slice(0, 140) + '…' : post.excerpt}
              </div>
              <div className="cd-wc-footer">
                <span className="cd-wc-time">{post.readingTime}</span>
                <span className="cd-proj-link" style={{ fontSize: 12 }}>Read ↗</span>
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a href="/blog" className="cd-btn-ghost" style={{ fontSize: 13 }}>
            View all posts ↗
          </a>
        </div>
      </div>
    </section>
  )
}
