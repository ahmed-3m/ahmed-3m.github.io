import { type Language } from '@/lib/i18n-config'

/**
 * News data.
 *
 * This file is intentionally a plain, strongly-typed data module so it can be
 * updated safely by an automated agent. See AGENTS.md -> "News update protocol"
 * for the rules an agent MUST follow when adding items.
 *
 * Quick contract:
 *  - Append new objects to the `newsItems` array. Do not reorder (sorting is done
 *    at read time by date, newest first).
 *  - `id` must be unique and stable (kebab-case). Never reuse an id.
 *  - `category` is exactly 'ai' or 'agentic'. Use 'agentic' for autonomous agents,
 *    tool-use, multi-agent systems, agent frameworks/protocols; 'ai' for everything else.
 *  - `take.en` is required (Ahmed's 1-2 sentence editorial take). Other languages
 *    are optional and fall back to English automatically.
 *  - `url` must be the canonical source link. `date` is ISO 'YYYY-MM-DD'.
 */

export type NewsCategory = 'ai' | 'agentic'

export interface NewsItem {
  /** Unique, stable, kebab-case identifier. Never reuse. */
  id: string
  /** Publication date, ISO 'YYYY-MM-DD'. */
  date: string
  /** 'agentic' for agent/tool-use/multi-agent topics; 'ai' otherwise. */
  category: NewsCategory
  /** The news headline (kept in the source language, usually English). */
  headline: string
  /** Outlet / publisher name, e.g. 'Anthropic', 'arXiv', 'The Verge'. */
  source: string
  /** Canonical link to the source. */
  url: string
  /** Editorial take. `en` required; other languages optional (fall back to en). */
  take: Partial<Record<Language, string>> & { en: string }
  /** Optional free-form tags shown as chips. */
  tags?: string[]
}

export interface LocalizedNewsItem extends Omit<NewsItem, 'take'> {
  /** Take resolved for the requested language (falls back to English). */
  take: string
}

/**
 * Items are kept current by the weekly news pipeline
 * (.github/workflows/news-update.yml). Add entries following the schema and the
 * rules above / in AGENTS.md. Newest items sort to the top at read time.
 */
const newsItems: NewsItem[] = [
  {
    id: 'claude-fable-5-mythos-tier',
    date: '2026-06-24',
    category: 'ai',
    headline: 'Claude Mythos 5 and Fable 5 Explained: What Anthropic Actually Shipped',
    source: 'AI DOERS',
    url: 'https://www.aidoers.io/blog/claude-mythos-5-and-fable-5-explained-what-anthropic-actually-shipped',
    take: {
      en: 'Anthropic’s new Mythos-class tier above Opus is significant for agentic coding, but at double Opus’s price, the production economics need scrutiny. The temporary free window before June 23 is telling—Anthropic is effectively trialing capacity constraints before committing to subscription inclusion.'
    },
    tags: ['models', 'agentic-coding', 'pricing']
  },
  {
    id: 'qwen-agentworld-simulator-training',
    date: '2026-06-24',
    category: 'agentic',
    headline: "Alibaba's model never trained as an agent — and improved agent performance across seven benchmarks",
    source: 'VentureBeat',
    url: 'https://venturebeat.com/technology/alibabas-model-never-trained-as-an-agent-and-improved-agent-performance-across-seven-benchmarks',
    take: {
      en: 'Training agents to predict environment states rather than actions is a clever inversion, and controlled simulation that injects edge cases real environments rarely surface is genuinely useful. But the overfitting risk is real—synthetic training should complement real-environment RL, not replace it.'
    },
    tags: ['world-models', 'agent-training', 'simulation']
  },
  {
    id: 'google-adk-a2a-multi-language',
    date: '2026-06-22',
    category: 'agentic',
    headline: 'Build Cross-Language Multi-Agent Team with Google’s Agent Development Kit and A2A',
    source: 'Google Developers Blog',
    url: 'https://developers.googleblog.com/build-cross-language-multi-agent-team-with-google-agent-development-kit-and-a2a/',
    take: {
      en: 'A2A as the "HTTP of agents" is the right interoperability abstraction—production multi-agent systems shouldn’t require rewriting services in a single language. RemoteA2aAgent’s clean wrapping of external agents enables genuinely polyglot orchestration without hand-rolling JSON-RPC clients.'
    },
    tags: ['a2a-protocol', 'multi-agent', 'interoperability']
  },
  {
    id: 'mistral-3-large-leanstral-lean4',
    date: '2026-06-18',
    category: 'ai',
    headline: 'Mistral Releases Mistral 3 Family: 675B-Parameter Large 3 MoE and Three Edge Models Under Apache 2.0',
    source: 'TPS Report',
    url: 'https://tpsreport.news/news/mistral-3-release-large-675b-ministral-models',
    take: {
      en: 'Leanstral achieving 26.3 FLTEval at $36 versus Claude Sonnet 4.6’s $549 is exactly the kind of specialized efficiency production systems need. Apache 2.0 licensing on the full Mistral 3 family matters for regulated enterprises that can’t route sensitive work through opaque SaaS APIs.'
    },
    tags: ['open-weights', 'moe', 'proof-assistance']
  },
  {
    id: 'autonomy-dynamic-tool-synthesis',
    date: '2026-06-20',
    category: 'agentic',
    headline: 'Autonomy Lets AI Agents Write Their Own Toolchains at Runtime',
    source: 'AINews',
    url: 'https://ainews.cool/article/20260620-autonomy-ai-agent-toolchain',
    take: {
      en: 'Dynamic tool synthesis solves a real production gap—static toolsets break when novel tasks emerge. But letting agents generate executable code at runtime demands serious sandboxing and validation; this is promising research, not plug-and-play infrastructure.'
    },
    tags: ['tool-use', 'dynamic-tools', 'agent-autonomy']
  },
  {
    id: 'multiverse-pulsar-16b-nemotron',
    date: '2026-06-23',
    category: 'ai',
    headline: 'Multiverse Computing Launches Pulsar 16B in collaboration with NVIDIA: Frontier-Grade Reasoning at Half the Parameters',
    source: 'Globe Newswire',
    url: 'https://www.globenewswire.com/news-release/2026/06/23/3315999/0/en/Multiverse-Computing-Launches-Pulsar-16B-in-collaboration-with-NVIDIA-Frontier-Grade-Reasoning-at-Half-the-Parameters.html',
    take: {
      en: 'Achieving 30B-class reasoning at 16B parameters through compression is meaningful for deployment cost, but "no retraining from scratch" claims need verification. Production systems care about inference latency and accuracy degradation curves, not just parameter count.'
    },
    tags: ['model-compression', 'reasoning', 'deployment']
  }
]

/**
 * Build-time guard. Runs once when the module is first imported (during
 * `next build` / static generation), so a malformed agent edit fails the build
 * instead of shipping. Keep these rules in sync with AGENTS.md.
 */
function validateNewsItems(items: NewsItem[]): void {
  const seen = new Set<string>()
  const isoDate = /^\d{4}-\d{2}-\d{2}$/
  for (const item of items) {
    const where = `news item "${item.id || '(missing id)'}"`
    if (!item.id || !/^[a-z0-9-]+$/.test(item.id)) throw new Error(`${where}: id must be non-empty kebab-case`)
    if (seen.has(item.id)) throw new Error(`${where}: duplicate id`)
    seen.add(item.id)
    if (item.category !== 'ai' && item.category !== 'agentic') throw new Error(`${where}: category must be 'ai' or 'agentic'`)
    if (!isoDate.test(item.date) || Number.isNaN(new Date(item.date).getTime())) throw new Error(`${where}: date must be a valid 'YYYY-MM-DD'`)
    if (!item.headline?.trim()) throw new Error(`${where}: headline is required`)
    if (!item.source?.trim()) throw new Error(`${where}: source is required`)
    if (!/^https?:\/\//.test(item.url)) throw new Error(`${where}: url must be an absolute http(s) link`)
    if (!item.take?.en?.trim()) throw new Error(`${where}: take.en is required`)
  }
}

validateNewsItems(newsItems)

export const newsCategoryLabels: Record<NewsCategory, { en: string; de: string; fr: string; es: string; ar: string }> = {
  ai: { en: 'AI', de: 'KI', fr: 'IA', es: 'IA', ar: 'الذكاء الاصطناعي' },
  agentic: { en: 'Agentic AI', de: 'Agentische KI', fr: 'IA agentique', es: 'IA agentica', ar: 'الذكاء الاصطناعي الوكيل' },
}

function localizeNewsItem(item: NewsItem, lang: Language): LocalizedNewsItem {
  const { take, ...rest } = item
  return { ...rest, take: take[lang] ?? take.en }
}

/** All items, newest first. */
export function getAllNews(lang: Language = 'en'): LocalizedNewsItem[] {
  return [...newsItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((item) => localizeNewsItem(item, lang))
}

/** Items in a single category, newest first. */
export function getNewsByCategory(category: NewsCategory, lang: Language = 'en'): LocalizedNewsItem[] {
  return getAllNews(lang).filter((item) => item.category === category)
}

/** Raw items (unsorted, untranslated) — for tooling/validation. */
export function getRawNews(): NewsItem[] {
  return newsItems
}
