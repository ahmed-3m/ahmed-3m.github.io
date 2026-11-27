import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  DEFAULT_NEWS_FILTER_STATE,
  canonicalizeNewsFilterSearch,
  parseNewsFilterSearch,
  serializeNewsFilterSearch,
} from '@/lib/news-filter-url'

describe('news-filter-url query synchronization', () => {
  it('restores default unfiltered state when query parameters are absent', () => {
    assert.deepEqual(parseNewsFilterSearch(''), DEFAULT_NEWS_FILTER_STATE)
    assert.deepEqual(parseNewsFilterSearch('?'), DEFAULT_NEWS_FILTER_STATE)
    assert.deepEqual(parseNewsFilterSearch('?category=unknown&tag=BAD$TAG'), DEFAULT_NEWS_FILTER_STATE)
  })

  it('parses category, deduplicated kebab-case tags, source, and search query', () => {
    assert.deepEqual(
      parseNewsFilterSearch('?category=agentic&tag=MCP,agents,mcp,bad!tag&source=Anthropic&q=+rust+'),
      {
        filter: 'agentic',
        selectedTags: ['mcp', 'agents'],
        selectedSource: 'Anthropic',
        searchQuery: 'rust',
      },
    )
  })

  it('serializes only non-default filter values and omits empty defaults', () => {
    assert.equal(serializeNewsFilterSearch(DEFAULT_NEWS_FILTER_STATE), '')
    assert.equal(
      serializeNewsFilterSearch({
        filter: 'ai',
        selectedTags: ['llm', 'evals'],
        selectedSource: 'arXiv',
        searchQuery: '  benchmark  ',
      }),
      '?category=ai&tag=llm%2Cevals&source=arXiv&q=benchmark',
    )
  })

  it('canonicalizes equivalent search strings consistently for self-write detection', () => {
    const written = serializeNewsFilterSearch({
      filter: 'all',
      selectedTags: ['mcp'],
      selectedSource: 'all',
      searchQuery: 'server ',
    })
    assert.equal(canonicalizeNewsFilterSearch(written), written)
    assert.equal(canonicalizeNewsFilterSearch(''), '')
    assert.notEqual(canonicalizeNewsFilterSearch(''), written)
  })
})
