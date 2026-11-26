#!/usr/bin/env node
/**
 * Self-test for Genie v2 RAG, links, prompts, markdown/bidi tokenizer, and copy parity.
 * Run from the repo root:
 *   node tools/genie-selftest.mjs
 */
import { register } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const loader = `
  import { join } from 'node:path'
  import { pathToFileURL } from 'node:url'
  const root = ${JSON.stringify(repoRoot)}
  export async function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const abs = pathToFileURL(join(root, 'src', specifier.slice(2) + '.ts')).href
      return nextResolve(abs, context)
    }
    try {
      return await nextResolve(specifier, context)
    } catch (err) {
      if (typeof specifier === 'string' && !specifier.endsWith('.ts') && specifier.startsWith('.')) {
        return nextResolve(specifier + '.ts', context)
      }
      throw err
    }
  }
`
register(
  `data:text/javascript,${encodeURIComponent(loader)}`,
  pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'genie-selftest.mjs')),
)

const linksMod = await import('../src/lib/genie/links.ts')
const knowledgeMod = await import('../src/lib/genie/knowledge.ts')
const retrieverMod = await import('../src/lib/genie/retriever.ts')
const promptsMod = await import('../src/lib/genie/prompts.ts')
const markdownMod = await import('../src/lib/genie/markdown.ts')
const dictMod = await import('../src/components/chatbot-dictionaries.ts')
const bookingMod = await import('../src/lib/booking.ts')

const LOCALES = ['en', 'de', 'fr', 'es', 'ar']

function pass(label) {
  console.log(`self-test: ${label} ✓`)
}

function fail(label, detail) {
  console.error(`self-test: ${label} ✗${detail ? ` — ${detail}` : ''}`)
  process.exit(1)
}

function assert(label, condition, detail) {
  if (!condition) fail(label, detail)
  pass(label)
}

// 1. 5-locale parity & non-empty values across PROMPT_LIBRARY, LOCAL_REPLIES, CHAT_COPY
for (const [id, map] of Object.entries(promptsMod.PROMPT_LIBRARY)) {
  for (const locale of LOCALES) {
    assert(
      `PROMPT_LIBRARY.${id}.${locale} non-empty`,
      typeof map[locale] === 'string' && map[locale].trim().length > 0,
    )
  }
}

for (const [id, map] of Object.entries(promptsMod.LOCAL_REPLIES)) {
  for (const locale of LOCALES) {
    assert(
      `LOCAL_REPLIES.${id}.${locale} non-empty`,
      typeof map[locale] === 'string' && map[locale].trim().length > 0,
    )
    assert(
      `LOCAL_REPLIES.${id}.${locale} has no legacy email`,
      !map[locale].includes('ahmed.mu.0905'),
    )
  }
  for (const locale of ['de', 'fr']) {
    assert(
      `LOCAL_REPLIES.${id}.${locale} uses comma decimals & spaced %`,
      !/\d\.\d/.test(map[locale].replace(/https?:\/\/\S+/g, '')) &&
        !/\d%/.test(map[locale].replace(/https?:\/\/\S+/g, '')),
      map[locale],
    )
  }
}

for (const [id, map] of Object.entries(dictMod.CHAT_COPY)) {
  for (const locale of LOCALES) {
    assert(
      `CHAT_COPY.${id}.${locale} non-empty`,
      typeof map[locale] === 'string' && map[locale].trim().length > 0,
    )
  }
}

// 2. STARTER_PROMPT_IDS, ROUTE_SECTIONS, getStarterPrompts, FOLLOWUP_PROMPTS integrity
assert(
  'STARTER_PROMPT_IDS valid & length 4',
  promptsMod.STARTER_PROMPT_IDS.length === 4 &&
    promptsMod.STARTER_PROMPT_IDS.every((id) => id in promptsMod.PROMPT_LIBRARY),
)

for (const [route, section] of Object.entries(promptsMod.ROUTE_SECTIONS)) {
  assert(`ROUTE_SECTIONS[${route}] non-empty`, typeof section === 'string' && section.length > 0)
}

assert(
  'getStarterPrompts(/blog/*) resolves writing prompts',
  JSON.stringify(promptsMod.getStarterPrompts('/blog/ood-diffusion-thesis')) ===
    JSON.stringify(['guardrails_post', 'thesis_loss', 'industrial_pipeline', 'mergeproof_overview']),
)
assert(
  'getStarterPrompts(/news) resolves news prompts',
  JSON.stringify(promptsMod.getStarterPrompts('/news')) ===
    JSON.stringify(['mergeproof_overview', 'sihem_overview', 'tech_stack', 'open_to_work']),
)
assert(
  'getStarterPrompts(/case-studies/sihem) resolves sihem prompts',
  JSON.stringify(promptsMod.getStarterPrompts('/case-studies/sihem')) ===
    JSON.stringify(['sihem_overview', 'sihem_tech', 'guardrails_post', 'contact']),
)
assert(
  'getStarterPrompts(about) resolves about prompts',
  JSON.stringify(promptsMod.getStarterPrompts('about')) ===
    JSON.stringify(['background', 'tech_stack', 'open_to_work', 'cv']),
)
assert(
  'getStarterPrompts(projects) resolves projects prompts',
  JSON.stringify(promptsMod.getStarterPrompts('projects')) ===
    JSON.stringify(['projects_best', 'mergeproof_overview', 'sihem_overview', 'industrial_pipeline']),
)

for (const [replyId, followUps] of Object.entries(promptsMod.FOLLOWUP_PROMPTS)) {
  assert(`FOLLOWUP_PROMPTS.${replyId} exists in LOCAL_REPLIES`, replyId in promptsMod.LOCAL_REPLIES)
  for (const promptId of followUps) {
    assert(
      `FOLLOWUP_PROMPTS.${replyId} -> ${promptId} exists in PROMPT_LIBRARY`,
      promptId in promptsMod.PROMPT_LIBRARY,
    )
  }
}

// 3. publicLinks & resolveLinkProps
assert(
  'resolveLinkProps allows /news/',
  linksMod.resolveLinkProps('/news/')?.href === '/news/' &&
    linksMod.resolveLinkProps('/news/')?.external === false,
)
assert(
  'resolveLinkProps allows /?view=full#mergeproof-playground',
  linksMod.resolveLinkProps('/?view=full#mergeproof-playground')?.href ===
    '/?view=full#mergeproof-playground' &&
    linksMod.resolveLinkProps('/?view=full#mergeproof-playground')?.external === false,
)
assert(
  'resolveLinkProps allows /blog/deterministic-guardrails-for-llm-and-agent-systems/',
  linksMod.resolveLinkProps('/blog/deterministic-guardrails-for-llm-and-agent-systems/')?.href ===
    '/blog/deterministic-guardrails-for-llm-and-agent-systems/',
)
assert(
  'resolveLinkProps allows mailto:ahmed.mo.0595@gmail.com',
  linksMod.resolveLinkProps('mailto:ahmed.mo.0595@gmail.com')?.href ===
    'mailto:ahmed.mo.0595@gmail.com' &&
    linksMod.resolveLinkProps('mailto:ahmed.mo.0595@gmail.com')?.external === false,
)
assert(
  'resolveLinkProps allows Calendly',
  linksMod.resolveLinkProps(bookingMod.CALENDLY_URL)?.href === bookingMod.CALENDLY_URL &&
    linksMod.resolveLinkProps(bookingMod.CALENDLY_URL)?.external === true,
)
assert(
  'resolveLinkProps rejects untrusted domain',
  linksMod.resolveLinkProps('https://evil.example/') === null,
)
assert(
  'resolveLinkProps rejects legacy email',
  linksMod.resolveLinkProps('mailto:ahmed.mu.0905@gmail.com') === null,
)

// 4. retrieveKnowledgeChunks accuracy
assert(
  'knowledge has >= 16 chunks',
  knowledgeMod.KNOWLEDGE_CHUNKS.length >= 16,
  `count=${knowledgeMod.KNOWLEDGE_CHUNKS.length}`,
)

{
  const chunks = retrieverMod.retrieveKnowledgeChunks({ query: 'What AUROC on SVHN?' })
  assert(
    'retrieve SVHN returns 96.60 & 90.50',
    chunks.some((c) => c.facts.includes('96.60')) && chunks.some((c) => c.facts.includes('90.50')),
  )
}
{
  const chunks = retrieverMod.retrieveKnowledgeChunks({
    query: 'failover',
    section: 'sihem',
    pathname: '/case-studies/sihem/',
  })
  assert(
    'retrieve failover on /case-studies/sihem/ boosts Sihem chunk',
    chunks[0]?.id === 'sihem-architecture',
    `top=${chunks[0]?.id}`,
  )
}
{
  const chunks = retrieverMod.retrieveKnowledgeChunks({
    query: 'How does it store memories?',
    history: [{ role: 'user', content: 'What is Sihem?' }],
    section: 'hero',
    pathname: '/',
  })
  assert(
    'retrieve follow-up preserves prior Sihem topic for pgvector memory',
    chunks.some((c) => c.id === 'sihem-architecture' && c.facts.includes('pgvector')),
    `ids=${chunks.map((c) => c.id).join(',')}`,
  )
}
{
  const chunks = retrieverMod.retrieveKnowledgeChunks({ query: 'mergeproof' })
  assert(
    'retrieve mergeproof returns mergeproof chunk',
    chunks[0]?.id === 'mergeproof-guardrails',
    `top=${chunks[0]?.id}`,
  )
}
{
  const chunks = retrieverMod.retrieveKnowledgeChunks({ query: 'YOLOv8 blog' })
  assert(
    'retrieve YOLOv8 blog returns blog chunk',
    chunks[0]?.id === 'blog-inkjet-yolo',
    `top=${chunks[0]?.id}`,
  )
}
{
  const chunks = retrieverMod.retrieveKnowledgeChunks({ query: 'work permit RWR' })
  assert(
    'retrieve work permit RWR returns work-authorization chunk',
    chunks[0]?.id === 'work-authorization',
    `top=${chunks[0]?.id}`,
  )
}

// 5. buildSystemPrompt length & legacy email check across all 5 locales
for (const locale of LOCALES) {
  const prompt = retrieverMod.buildSystemPrompt({
    lang: locale,
    query: 'What is the best AUROC on CIFAR-10 and SVHN?',
    section: 'research',
    pathname: '/research/',
  })
  assert(
    `buildSystemPrompt(${locale}) < 8000 chars`,
    prompt.length > 500 && prompt.length < 8000,
    `len=${prompt.length}`,
  )
  assert(
    `buildSystemPrompt(${locale}) has zero ahmed.mu.0905`,
    !prompt.includes('ahmed.mu.0905'),
  )
}

// 6. tokenizeBidiNumbers & parseInlineTokens
{
  const segs1 = markdownMod.tokenizeBidiNumbers('AUROC 99.03% ± 0.07% (+6.5pp)')
  assert(
    'tokenizeBidiNumbers isolates 99.03% ± 0.07% and +6.5pp',
    segs1.some((s) => s.type === 'bidi' && s.text === '99.03% ± 0.07%') &&
      segs1.some((s) => s.type === 'bidi' && s.text === '+6.5pp'),
    JSON.stringify(segs1),
  )

  const segs2 = markdownMod.tokenizeBidiNumbers('99,03 % ± 0,07 % auf CIFAR-10 am 2026-09-07')
  assert(
    'tokenizeBidiNumbers isolates 99,03 % ± 0,07 % and keeps CIFAR-10 & 2026-09-07 intact',
    segs2.some((s) => s.type === 'bidi' && s.text === '99,03 % ± 0,07 %') &&
      segs2.some((s) => s.type === 'text' && s.text.includes('CIFAR-10') && s.text.includes('2026-09-07')),
    JSON.stringify(segs2),
  )

  const tokens = markdownMod.parseInlineTokens(
    'See [bad](https://evil.example/) and [good](/news/) and https://evil.example/bar',
  )
  const linkTokens = tokens.filter((t) => t.type === 'link')
  assert(
    'parseInlineTokens strips untrusted links to plain text',
    linkTokens.length === 1 &&
      linkTokens[0].href === '/news/' &&
      tokens.some((t) => t.type === 'text' && t.segments.some((s) => s.text === 'bad')),
    JSON.stringify(tokens),
  )
}

// 7. routeLocally across all 5 languages + formatLocaleNumber
const routeCases = [
  ['Explain how separation loss works', 'deep'],
  ['Warum funktioniert Separation Loss?', 'deep'],
  ['Comment fonctionne Sihem ?', 'deep'],
  ['¿Por qué usar difusión?', 'deep'],
  ['كيف يعمل محرك Sihem؟', 'deep'],
  ['Where is his CV?', 'fast'],
  ['Wo ist sein Lebenslauf?', 'fast'],
  ['Où est son CV ?', 'fast'],
  ['¿Cuál es su stack?', 'fast'],
  ['ما أفضل نتيجة AUROC؟', 'fast'],
]
for (const [query, expected] of routeCases) {
  assert(`routeLocally("${query}") === ${expected}`, promptsMod.routeLocally(query) === expected)
}

assert(
  'formatLocaleNumber converts de/fr decimals & % spacing consistently',
  linksMod.formatLocaleNumber('99.03% ± 0.07%', 'de') === '99,03 % ± 0,07 %' &&
    linksMod.formatLocaleNumber('0.8673 ± 0.0230', 'fr') === '0,8673 ± 0,0230' &&
    linksMod.formatLocaleNumber('99.03% ± 0.07%', 'en') === '99.03% ± 0.07%',
)

console.log('self-test OK: Genie v2 checks passed')
