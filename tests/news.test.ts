import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  canonicalNewsUrl,
  normalizeIncomingTags,
  sanitizeIncomingDelta,
  stripTrackingParams,
  type NewsItem,
} from '@/lib/news'

const BASE_ITEM: NewsItem = {
  id: 'existing-item',
  date: '2026-11-20',
  category: 'agentic',
  headline: {
    en: 'Existing Item',
    de: 'Bestehender Eintrag',
    fr: 'Élément existant',
    es: 'Elemento existente',
    ar: 'عنصر حالي',
  },
  source: 'Anthropic',
  url: 'https://example.com/existing',
  take: {
    en: 'Existing take.',
    de: 'Bestehende Einordnung.',
    fr: 'Analyse existante.',
    es: 'Análisis existente.',
    ar: 'تعليق حالي.',
  },
  tags: ['evaluation'],
}

function makeCandidate(index: number, overrides: Record<string, unknown> = {}) {
  return {
    id: `candidate-${index}`,
    date: '2026-11-27',
    category: 'agentic',
    headline: {
      en: `Headline ${index}`,
      de: `Überschrift ${index}`,
      fr: `Titre ${index}`,
      es: `Titular ${index}`,
      ar: `عنوان ${index}`,
    },
    source: 'OpenAI',
    url: `https://example.com/news-${index}?utm_source=exa&id=${index}`,
    take: {
      en: `Take ${index}.`,
      de: `Einordnung ${index}.`,
      fr: `Analyse ${index}.`,
      es: `Análisis ${index}.`,
      ar: `تعليق ${index}.`,
    },
    tags: ['agent-governance', 'governance', 'agentic-coding'],
    ...overrides,
  }
}

describe('news intake hardening', () => {
  it('strips tracking query params while preserving significant params', () => {
    assert.equal(
      stripTrackingParams('https://example.com/article?utm_source=newsletter&id=77&fbclid=xyz'),
      'https://example.com/article?id=77',
    )
    assert.equal(
      canonicalNewsUrl('https://Example.COM/article/?id=77&gclid=123#section'),
      canonicalNewsUrl('https://example.com/article?id=77'),
    )
  })

  it('normalizes overlapping tag synonyms onto canonical tags without duplicates', () => {
    assert.deepEqual(
      normalizeIncomingTags(['agent-governance', 'governance', 'safeguards', 'guardrails']),
      ['governance', 'guardrails'],
    )
  })

  it('survives mixed deltas by keeping valid items and dropping invalid or duplicate siblings', () => {
    const now = new Date('2026-11-27T18:00:00Z')
    const result = sanitizeIncomingDelta(
      [BASE_ITEM],
      {
        items: [
          makeCandidate(1),
          makeCandidate(2, { take: { en: 'English only' } }), // missing 4 locales -> dropped invalid
          makeCandidate(3, { url: 'https://example.com/existing/?utm_medium=social' }), // dupe URL -> dropped duplicate
          makeCandidate(4, { url: 'https://example.com/news-1?id=1&utm_campaign=repost' }), // in-batch dupe URL -> dropped duplicate
        ],
      },
      now,
    )

    assert.equal(result.accepted.length, 1)
    assert.equal(result.accepted[0].id, 'candidate-1')
    assert.equal(result.accepted[0].url, 'https://example.com/news-1?id=1')
    assert.deepEqual(result.accepted[0].tags, ['governance', 'coding-agents'])
    assert.equal(result.dropped.length, 3)
    assert.equal(result.dropped[0].kind, 'invalid')
    assert.equal(result.dropped[1].kind, 'duplicate')
    assert.equal(result.dropped[2].kind, 'duplicate')
  })

  it('treats an all-duplicate delta as a healthy quiet no-op, but rejects an all-invalid delta', () => {
    const now = new Date('2026-11-27T18:00:00Z')
    const dupesOnly = sanitizeIncomingDelta(
      [BASE_ITEM],
      { items: [makeCandidate(1, { url: 'https://example.com/existing' })] },
      now,
    )
    assert.equal(dupesOnly.accepted.length, 0)
    assert.equal(dupesOnly.dropped.length, 1)

    assert.throws(() =>
      sanitizeIncomingDelta(
        [BASE_ITEM],
        { items: [makeCandidate(2, { url: 'http://example.com/insecure' })] },
        now,
      ),
    )

    assert.throws(() =>
      sanitizeIncomingDelta(
        [BASE_ITEM],
        { items: [makeCandidate(3, { headline: 'Bare English string' })] },
        now,
      ),
    )
  })
})
