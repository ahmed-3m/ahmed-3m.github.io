// OG card staleness (spec 008, research R12). The generator writes a SHA-256 of each
// card's text when it renders the PNGs; the figure check recomputes the hashes from the
// exported card definitions, without rendering, and fails on any difference.

import { createHash } from 'node:crypto'

/** Repository-relative path of the lock file (data-model.md "OgCardLock"). */
export const OG_LOCK = 'tools/claims/og-cards.lock.json'
export const OG_REGENERATE = 'node --import ./tools/test-hooks.mjs tools/generate-og-images.mjs'

/** SHA-256 of `eyebrow|title|sub|stat`: the text the PNG shows. */
export function cardHash({ eyebrow, title, sub, stat }) {
  return createHash('sha256').update([eyebrow, title, sub, stat].join('|')).digest('hex')
}

/** The lock for a set of cards, as the generator writes it. */
export function lockOf(cards) {
  return Object.fromEntries(Object.entries(cards).map(([file, card]) => [file, cardHash(card)]))
}

/**
 * `stale-og-image` findings: a card whose hash differs from the lock, a card with no lock
 * entry, and a lock entry with no card.
 * @param {Record<string, {eyebrow: string, title: string, sub: string, stat: string}>} cards
 * @param {Record<string, string>} lock
 * @param {{ file: string, lineOf?: (png: string) => number | undefined }} where the generator, for the finding's location
 */
export function staleOgImages(cards, lock, { file, lineOf = () => undefined }) {
  const finding = (png, findingFile, line) => ({
    scope: 'source',
    file: findingFile,
    ...(line ? { line } : {}),
    lang: 'en',
    figure: png,
    rule: 'stale-og-image',
    detail: `OG image ${png} is stale — regenerate it`,
    fix: `run ${OG_REGENERATE}, then commit the PNG with ${OG_LOCK}`,
  })
  const findings = []
  for (const [png, card] of Object.entries(cards)) {
    if (lock[png] !== cardHash(card)) findings.push(finding(png, file, lineOf(png)))
  }
  for (const png of Object.keys(lock)) {
    if (!(png in cards)) findings.push(finding(png, OG_LOCK))
  }
  return findings
}
