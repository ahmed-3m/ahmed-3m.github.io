// OG card staleness (spec 008, research R12). When the generator renders the PNGs, it
// writes two SHA-256 hashes per card: one of the card's text and one of the PNG it wrote.
// The figure check recomputes the text hashes from the exported card definitions, without
// rendering, and hashes the committed PNGs. Any difference fails the check.

import { createHash } from 'node:crypto'

/** Repository-relative path of the lock file (data-model.md "OgCardLock"). */
export const OG_LOCK = 'tools/claims/og-cards.lock.json'
export const OG_REGENERATE = 'node --import ./tools/test-hooks.mjs tools/generate-og-images.mjs'
/** Where the generator writes the PNGs, repository-relative. */
export const OG_DIR = 'public'

const sha256 = (data) => createHash('sha256').update(data).digest('hex')

/** SHA-256 of the card's text (eyebrow, title, sub, stat), JSON-encoded so fields cannot run together. */
export function cardHash({ eyebrow, title, sub, stat }) {
  return sha256(JSON.stringify([eyebrow, title, sub, stat]))
}

/** SHA-256 of a rendered PNG. */
export function pngHash(bytes) {
  return sha256(bytes)
}

/**
 * The lock for a set of cards and the PNGs rendered from them, as the generator writes it.
 * @param {Record<string, {eyebrow: string, title: string, sub: string, stat: string}>} cards
 * @param {Record<string, Uint8Array>} pngs the rendered bytes, by PNG name
 */
export function lockOf(cards, pngs) {
  return Object.fromEntries(
    Object.entries(cards).map(([file, card]) => [file, { text: cardHash(card), png: pngs[file] ? pngHash(pngs[file]) : undefined }]),
  )
}

/**
 * `stale-og-image` findings:
 * - a card whose text hash differs from the lock, or that has no lock entry;
 * - a committed PNG that is missing or differs from the PNG hash in the lock;
 * - a lock entry with no card.
 * @param {Record<string, {eyebrow: string, title: string, sub: string, stat: string}>} cards
 * @param {Record<string, {text?: string, png?: string}>} lock
 * @param {{ file: string, lineOf?: (png: string) => number | undefined, pngOf?: (png: string) => Uint8Array | undefined }} where
 *   the generator, for the finding's location, and a reader for the committed PNGs
 */
export function staleOgImages(cards, lock, { file, lineOf = () => undefined, pngOf }) {
  const finding = (png, findingFile, line, detail) => ({
    scope: 'source',
    file: findingFile,
    ...(line ? { line } : {}),
    lang: 'en',
    figure: png,
    rule: 'stale-og-image',
    detail,
    fix: `run ${OG_REGENERATE}, then commit the PNG with ${OG_LOCK}`,
  })
  const findings = []
  for (const [png, card] of Object.entries(cards)) {
    const entry = lock[png]
    if (entry?.text !== cardHash(card)) {
      findings.push(finding(png, file, lineOf(png), `OG image ${png} is stale — regenerate it`))
      continue
    }
    if (!pngOf) continue
    const bytes = pngOf(png)
    if (!bytes || pngHash(bytes) !== entry.png) {
      findings.push(finding(png, `${OG_DIR}/${png}`, undefined, `OG image ${png} does not match ${OG_LOCK} — regenerate it`))
    }
  }
  for (const png of Object.keys(lock)) {
    if (!(png in cards)) findings.push(finding(png, OG_LOCK, undefined, `OG image ${png} is stale — regenerate it`))
  }
  return findings
}
