import { resolveLinkProps } from './links'

export type BidiSegment = {
  type: 'text' | 'bidi'
  text: string
}

export type InlineToken =
  | { type: 'text'; segments: BidiSegment[] }
  | { type: 'code'; text: string }
  | { type: 'bold'; children: InlineToken[] }
  | { type: 'italic'; children: InlineToken[] }
  | { type: 'link'; href: string; external: boolean; labelSegments: BidiSegment[]; labelText: string }

const NUMERIC_BIDI_PATTERN =
  /(?:[+-])?\d+(?:[.,]\d+)?(?:[ \u00A0]*%|pp(?![\p{L}\p{N}]))?[ \u00A0]*±[ \u00A0]*\d+(?:[.,]\d+)?(?:[ \u00A0]*%|pp(?![\p{L}\p{N}]))?|[+-]\d+(?:[.,]\d+)?(?:[ \u00A0]*%|pp(?![\p{L}\p{N}]))?|\d+(?:[.,]\d+)?(?:[ \u00A0]*%|pp(?![\p{L}\p{N}]))/gu

const LINK_PATTERN =
  /\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:|\/(?!\/))[^\s)]+)\)|((?:https?:\/\/|www\.)[^\s]+|(?:ahmed-3m\.github\.io|github\.com|linkedin\.com|huggingface\.co|wandb\.ai|epub\.jku\.at|orcid\.org|calendly\.com|sihem-pwa\.pages\.dev|t\.me)(?:\/[^\s]*)?|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi

/**
 * Isolates LTR numeric ± intervals, signed deltas, and percentage/pp values
 * inside RTL/mixed prose without altering adjacent whitespace or punctuation
 * or splitting hyphenated identifiers (CIFAR-10) and ISO dates (2026-09-07).
 */
export function tokenizeBidiNumbers(segment: string): BidiSegment[] {
  const segments: BidiSegment[] = []
  let lastIndex = 0

  for (const match of segment.matchAll(NUMERIC_BIDI_PATTERN)) {
    const raw = match[0]
    let start = match.index ?? 0
    const end = start + raw.length

    if (/^[+-]/.test(raw) && start > 0 && /[\p{L}\p{N}_]/u.test(segment[start - 1])) {
      if (!raw.includes('±')) {
        continue
      }
      start += 1
    }

    if (start > lastIndex) {
      segments.push({ type: 'text', text: segment.slice(lastIndex, start) })
    }
    segments.push({ type: 'bidi', text: segment.slice(start, end) })
    lastIndex = end
  }

  if (lastIndex < segment.length) {
    segments.push({ type: 'text', text: segment.slice(lastIndex) })
  }

  return segments.length > 0 ? segments : [{ type: 'text', text: segment }]
}

function tokenizeLinkedText(value: string): InlineToken[] {
  if (!value) return []
  const tokens: InlineToken[] = []
  let lastIndex = 0

  for (const match of value.matchAll(LINK_PATTERN)) {
    const raw = match[0]
    const start = match.index ?? 0
    const end = start + raw.length
    const [, label, namedUrl] = match
    const isEmail = !namedUrl && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(raw)

    if (!namedUrl && !isEmail && !/^(?:https?:\/\/|www\.)/i.test(raw)) {
      const prevChar = start > 0 ? value[start - 1] : ''
      if (/[a-z0-9._@-]/i.test(prevChar)) {
        continue
      }
    }

    if (start > lastIndex) {
      tokens.push({ type: 'text', segments: tokenizeBidiNumbers(value.slice(lastIndex, start)) })
    }

    const display = raw.replace(/[),.;!?،؛؟]+$/, '')
    const trailing = namedUrl ? '' : raw.slice(display.length)
    const rawHref =
      namedUrl ??
      (isEmail ? `mailto:${display}` : /^https?:\/\//i.test(display) ? display : `https://${display}`)
    const link = resolveLinkProps(rawHref)

    if (!link) {
      if (label) {
        const labelSegments = tokenizeBidiNumbers(label)
        if (trailing) labelSegments.push({ type: 'text', text: trailing })
        tokens.push({ type: 'text', segments: labelSegments })
      } else {
        tokens.push({ type: 'text', segments: [{ type: 'text', text: display + trailing }] })
      }
      lastIndex = end
      continue
    }

    tokens.push({
      type: 'link',
      href: link.href,
      external: link.external,
      labelSegments: label ? tokenizeBidiNumbers(label) : [{ type: 'text', text: display }],
      labelText: label ?? display,
    })

    if (trailing) {
      tokens.push({ type: 'text', segments: [{ type: 'text', text: trailing }] })
    }
    lastIndex = end
  }

  if (lastIndex < value.length) {
    tokens.push({ type: 'text', segments: tokenizeBidiNumbers(value.slice(lastIndex)) })
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', segments: tokenizeBidiNumbers(value) }]
}

/**
 * Parses inline markdown (code spans, bold, italic, allowlisted links, and
 * numeric bidi runs) into a pure TypeScript token list without JSX.
 */
export function parseInlineTokens(text: string): InlineToken[] {
  const parts = text.split(/(`[^`\n]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
  const tokens: InlineToken[] = []

  for (const part of parts) {
    if (!part) continue
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      tokens.push({ type: 'code', text: part.slice(1, -1) })
    } else if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      tokens.push({ type: 'bold', children: tokenizeLinkedText(part.slice(2, -2)) })
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      tokens.push({ type: 'italic', children: tokenizeLinkedText(part.slice(1, -1)) })
    } else {
      tokens.push(...tokenizeLinkedText(part))
    }
  }

  return tokens
}
