import { blogPostsMeta } from '@/lib/blog-posts-meta'
import type { TranslationMap } from '@/lib/i18n-config'
import { selectedWork } from '@/lib/portfolio-copy'

// Crawlable cross-links between each case study and the posts that tell its story.
// Search engines reach inner pages mostly through the homepage, so these links give
// every post and case study a second path in (see the step-2 discovery work).
//
// Call these helpers from server components (the page.tsx files) and pass the result
// to the client component as a prop. That keeps the post and project catalogs out of
// the client bundles; only the few titles needed are serialized.

export type RelatedLink = { href: string; title: TranslationMap }

type CaseStudySlug = (typeof selectedWork)[number]['slug']

const postsByCaseStudy: Record<CaseStudySlug, readonly string[]> = {
  'diffusion-ood': ['ood-diffusion-thesis'],
  'inkjet-ood': ['diffusion-models-anomaly-detection', 'computer-vision-yolo-mastery'],
  sihem: ['deterministic-guardrails-for-llm-and-agent-systems'],
}

function postTitle(slug: string): TranslationMap {
  const post = blogPostsMeta.find((p) => p.slug === slug)
  if (!post) throw new Error(`related-content: unknown blog post "${slug}"`)
  const { en, de, fr, es, ar } = post.translations
  return { en: en.title, de: de.title, fr: fr.title, es: es.title, ar: ar.title }
}

/** Blog posts related to a case study, in the order listed above. */
export function getRelatedPosts(caseStudy: CaseStudySlug): RelatedLink[] {
  return postsByCaseStudy[caseStudy].map((slug) => ({ href: `/blog/${slug}/`, title: postTitle(slug) }))
}

/** Case studies related to a blog post (empty when the post stands alone). */
export function getRelatedCaseStudies(postSlug: string): RelatedLink[] {
  return selectedWork
    .filter((work) => postsByCaseStudy[work.slug].includes(postSlug))
    .map((work) => ({ href: `/case-studies/${work.slug}/`, title: work.title }))
}
