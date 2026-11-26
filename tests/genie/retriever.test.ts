import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { KNOWLEDGE_CHUNKS } from '@/lib/genie/knowledge'
import { buildSystemPrompt, retrieveKnowledgeChunks } from '@/lib/genie/retriever'

describe('retrieveKnowledgeChunks', () => {
  it('has a knowledge base of at least 16 chunks', () => {
    assert.ok(KNOWLEDGE_CHUNKS.length >= 16, `count=${KNOWLEDGE_CHUNKS.length}`)
  })

  it('finds the SVHN results', () => {
    const chunks = retrieveKnowledgeChunks({ query: 'What AUROC on SVHN?' })
    assert.ok(chunks.some((c) => c.facts.includes('96.60')))
    assert.ok(chunks.some((c) => c.facts.includes('90.50')))
  })

  it('boosts the Sihem chunk on the Sihem case study', () => {
    const chunks = retrieveKnowledgeChunks({ query: 'failover', section: 'sihem', pathname: '/case-studies/sihem/' })
    assert.equal(chunks[0]?.id, 'sihem-architecture')
  })

  it('keeps the topic of the previous question for a follow-up', () => {
    const chunks = retrieveKnowledgeChunks({
      query: 'How does it store memories?',
      history: [{ role: 'user', content: 'What is Sihem?' }],
      section: 'hero',
      pathname: '/',
    })
    assert.ok(
      chunks.some((c) => c.id === 'sihem-architecture' && c.facts.includes('pgvector')),
      chunks.map((c) => c.id).join(','),
    )
  })

  for (const [query, id] of [
    ['mergeproof', 'mergeproof-guardrails'],
    ['YOLOv8 blog', 'blog-inkjet-yolo'],
    ['work permit RWR', 'work-authorization'],
  ]) {
    it(`ranks ${id} first for "${query}"`, () => {
      assert.equal(retrieveKnowledgeChunks({ query })[0]?.id, id)
    })
  }
})

describe('buildSystemPrompt', () => {
  for (const lang of ['en', 'de', 'fr', 'es', 'ar'] as const) {
    it(`stays under 8000 characters without the retired email (${lang})`, () => {
      const prompt = buildSystemPrompt({
        lang,
        query: 'What is the best AUROC on CIFAR-10 and SVHN?',
        section: 'research',
        pathname: '/research/',
      })
      assert.ok(prompt.length > 500 && prompt.length < 8000, `len=${prompt.length}`)
      assert.ok(!prompt.includes('ahmed.mu.0905'))
    })
  }
})
