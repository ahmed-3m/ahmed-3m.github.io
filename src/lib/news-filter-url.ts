import type { NewsCategory } from './news-items'

export type NewsFilterCategory = 'all' | NewsCategory

export interface NewsFilterState {
  filter: NewsFilterCategory
  selectedTags: string[]
  selectedSource: string
  searchQuery: string
}

export const DEFAULT_NEWS_FILTER_STATE: NewsFilterState = {
  filter: 'all',
  selectedTags: [],
  selectedSource: 'all',
  searchQuery: '',
}

export function parseNewsFilterSearch(search: string): NewsFilterState {
  const params = new URLSearchParams(search)
  const cat = params.get('category')
  const filter: NewsFilterCategory = cat === 'ai' || cat === 'agentic' ? cat : 'all'

  const tagsParam = params.get('tag')
  const selectedTags = tagsParam
    ? Array.from(
        new Set(
          tagsParam
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter((s) => /^[a-z0-9-]+$/.test(s)),
        ),
      )
    : []

  const src = params.get('source')
  const selectedSource = src && src.trim() ? src.trim() : 'all'

  const q = params.get('q')
  const searchQuery = q && q.trim() ? q.trim() : ''

  return { filter, selectedTags, selectedSource, searchQuery }
}

export function serializeNewsFilterSearch(state: NewsFilterState): string {
  const params = new URLSearchParams()
  if (state.filter !== 'all') params.set('category', state.filter)
  if (state.selectedTags.length > 0) params.set('tag', state.selectedTags.join(','))
  if (state.selectedSource !== 'all') params.set('source', state.selectedSource)
  const trimmedQuery = state.searchQuery.trim()
  if (trimmedQuery) params.set('q', trimmedQuery)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function canonicalizeNewsFilterSearch(search: string): string {
  return serializeNewsFilterSearch(parseNewsFilterSearch(search))
}
