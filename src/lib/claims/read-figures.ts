// Reads decimal figures out of copy, with each language's decimal-mark and thousands
// rules (spec 008, research R4). Used by the figure check; not imported by components.

import type { Language } from '@/lib/i18n-config'

export interface Figure {
  /** The figure as written, e.g. `99,03`. */
  raw: string
  /** Its value, reading either `.` or `,` as the decimal mark. */
  value: number
  /** Followed by %, pp or a points word, or next to a metric word. */
  resultLooking: boolean
  /** Position in the cleaned text (see cleanText). */
  index: number
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  plusmn: '±',
  thinsp: ' ',
  rlm: '',
  lrm: '',
}

const INLINE_TAG = /<\/?(?:span|tspan|bdi|b|strong|em|i|sup|sub|small|code|a|abbr|mark)(?=[\s/>])[^>]*>/gi
const BIDI_MARKS = /[⁦-⁩‎‏]/g
const WIDE_SPACES = /[   ]/g

/** The line breaks inside a removed tag or comment, so line numbers stay right. */
const keepBreaks = (removed: string, filler = '') => removed.replace(/[^\n]/g, '') || filler

/**
 * Normalises text before reading figures: line endings, HTML comments, inline tags (so
 * that `99.03<span>%</span>` reads as one figure; other tags become a space), entities,
 * bidi marks, no-break and thin spaces, and `+/-` as `±`. A tag or comment that spans
 * lines leaves its line breaks behind.
 */
export function cleanText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, (m) => keepBreaks(m))
    .replace(INLINE_TAG, (m) => keepBreaks(m))
    .replace(/<[a-z/!][^>]*>/gi, (m) => keepBreaks(m, ' '))
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, name: string) => {
      if (name[0] === '#') {
        const hex = name[1] === 'x' || name[1] === 'X'
        const code = hex ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10)
        return Number.isFinite(code) ? String.fromCodePoint(code) : m
      }
      return ENTITIES[name.toLowerCase()] ?? m
    })
    .replace(BIDI_MARKS, '')
    .replace(WIDE_SPACES, ' ')
    .replace(/\+\/-/g, '±')
}

const GROUPING_COMMA = /^\d{1,3}(?:,\d{3})+$/ // en, ar: 9,000
const GROUPING_POINT = /^\d{1,3}(?:\.\d{3})+$/ // de, fr, es: 9.000

const UNIT_AFTER = /^\s?(?:%|pp\b|p\.p\.|percentage|Prozentpunkt|points?\b|puntos?\b|نقط)/i
const METRIC_WORD =
  /AUROC|AUPRC?|\bFPR|\bTPR|\bmAP\b|\bF1\b|accuracy|precision|Genauigkeit|précision|exactitud|precisión|دقة/i
const WINDOW = 50

/** Reads a figure's value; NaN for version strings and dates (several marks of one kind). */
export function parseFigure(raw: string): number {
  const points = (raw.match(/\./g) ?? []).length
  const commas = (raw.match(/,/g) ?? []).length
  if (points && commas) {
    const decimalMark = raw.lastIndexOf('.') > raw.lastIndexOf(',') ? '.' : ','
    return Number(raw.replace(decimalMark === '.' ? /,/g : /\./g, '').replace(',', '.'))
  }
  if (points + commas > 1) return Number.NaN
  return Number(raw.replace(',', '.'))
}

/** Decimal figures in a text, read with the language's rules. */
export function readFigures(text: string, lang: Language): Figure[] {
  const clean = cleanText(text)
  const grouping = lang === 'en' || lang === 'ar' ? GROUPING_COMMA : GROUPING_POINT
  const figures: Figure[] = []
  for (const m of clean.matchAll(/\d+(?:[.,]\d+)+/g)) {
    const raw = m[0]
    const index = m.index
    const after = clean.slice(index + raw.length)
    if (/[a-z_]$/i.test(clean.slice(Math.max(0, index - 1), index))) continue // part of a name: v1.2, x2.5
    if (grouping.test(raw) && !/^\s?%/.test(after)) continue // a count: 9,000 (en) or 9.000 (de)
    if (/^\d{1,2}:\d{2}/.test(after)) continue // a time
    const value = parseFigure(raw)
    if (!Number.isFinite(value)) continue // a version string or a date
    const lineStart = clean.lastIndexOf('\n', index) + 1
    const nextBreak = clean.indexOf('\n', index)
    const lineEnd = nextBreak === -1 ? clean.length : nextBreak
    const window = clean.slice(Math.max(lineStart, index - WINDOW), Math.min(lineEnd, index + raw.length + WINDOW))
    const resultLooking = UNIT_AFTER.test(after) || METRIC_WORD.test(window)
    figures.push({ raw, value, resultLooking, index })
  }
  return figures
}
