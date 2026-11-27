// Generate bespoke OG share cards (1200x630 PNG) for key surfaces.
//
// Local-only tool — the committed PNGs in public/ are the source of truth and
// CI never runs this. Uses sharp, which ships as a transitive dependency of
// Next (node_modules/sharp); guarded so a missing sharp is a clear message,
// not a stack trace. Run from the repo root:
//
//   node --import ./tools/test-hooks.mjs tools/generate-og-images.mjs
//
// The stat lines with a result come from the claims registry (spec 008). Each run
// also writes tools/claims/og-cards.lock.json, a hash of every card's text and of
// the PNG rendered from it; the figure check fails when a card or a committed PNG
// no longer matches it, so commit the PNGs and the lock together.
//
// Palette mirrors the site's --cd-* tokens (globals.css, dark theme):
// bg #08090d · accent #00d4ff · fg #e8eaf0 · dim fg #8b93a7.

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { QUALIFIERS, formatClaim } from '@/lib/claims'
import { OG_DIR, OG_LOCK, lockOf } from './claims/og-lock.mjs'

const thesisStat = `${formatClaim('thesis.mean', 'en', 'metric')} · ${QUALIFIERS.threeSeeds.text.en}`
const inkjetStat = `${formatClaim('inkjet.baseline', 'en', 'metric')} · ${QUALIFIERS.fiveFoldCv.text.en}`

const BG = '#08090d'
const ACCENT = '#00d4ff'
const FG = '#e8eaf0'
const DIM = '#8b93a7'
const MONO = "'Consolas', 'Courier New', monospace"
const SANS = "'Segoe UI', 'Arial', sans-serif"

// Histogram-style signal bars (echoes the HeroSignal panel motif).
function signalBars(x, y, { count = 16, barWidth = 12, gap = 8, maxH = 110, seed = 42 } = {}) {
  let s = ''
  let r = seed
  const rand = () => {
    // deterministic LCG so runs are reproducible
    r = (r * 1103515245 + 12345) % 2147483648
    return r / 2147483648
  }
  for (let i = 0; i < count; i++) {
    const h = Math.round(maxH * (0.18 + 0.82 * rand()))
    const barY = y - h
    const fill = i === Math.floor(count * 0.72) ? ACCENT : '#1c2536'
    const opacity = i === Math.floor(count * 0.72) ? '0.95' : '0.8'
    s += `<rect x="${x + i * (barWidth + gap)}" y="${barY}" width="${barWidth}" height="${h}" rx="2" fill="${fill}" opacity="${opacity}"/>`
  }
  return s
}

function grid() {
  let s = ''
  for (let gx = 0; gx <= 1200; gx += 60) s += `<line x1="${gx}" y1="0" x2="${gx}" y2="630" stroke="#ffffff" stroke-opacity="0.025" stroke-width="1"/>`
  for (let gy = 0; gy <= 630; gy += 60) s += `<line x1="0" y1="${gy}" x2="1200" y2="${gy}" stroke="#ffffff" stroke-opacity="0.025" stroke-width="1"/>`
  return s
}

function card({ eyebrow, title, sub, stat }) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const rawTitleLen = title.length
  const rawStatLen = stat.length
  eyebrow = esc(eyebrow); title = esc(title); sub = esc(sub); stat = esc(stat)
  const titleSize = rawTitleLen > 32 ? 48 : rawTitleLen > 24 ? 56 : 66
  const pillWidth = Math.min(1056, Math.max(360, rawStatLen * 16 + 56))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="${BG}"/>
  ${grid()}
  <rect x="0" y="0" width="1200" height="630" fill="url(#vignette)"/>
  <defs>
    <radialGradient id="vignette" cx="0.85" cy="0.9" r="1.1">
      <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.06"/>
      <stop offset="45%" stop-color="#00d4ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${signalBars(816, 560)}
  <text x="72" y="96" font-family="${MONO}" font-size="22" fill="${DIM}">${eyebrow}</text>
  <rect x="72" y="128" width="64" height="6" fill="${ACCENT}"/>
  <text x="72" y="226" font-family="${SANS}" font-size="${titleSize}" font-weight="700" fill="${FG}">${title}</text>
  <text x="72" y="302" font-family="${SANS}" font-size="29" fill="${DIM}">${sub}</text>
  <rect x="72" y="366" width="${pillWidth}" height="64" rx="10" fill="#0d1017" stroke="#1c2536"/>
  <text x="100" y="406" font-family="${MONO}" font-size="25" fill="${ACCENT}">${stat}</text>
  <text x="72" y="560" font-family="${MONO}" font-size="22" fill="${DIM}">Ahmed Mohammed · AI/ML Engineer · Linz, Austria</text>
</svg>`
}

/** Card definitions by PNG name. The figure check scans these and hashes them. */
export const CARDS = {
  'og-image.png': {
    eyebrow: 'ahmed-3m.github.io',
    title: 'Ahmed Mohammed',
    sub: 'AI/ML Engineer · Linz, Austria · M.Sc. Thesis Graded 1',
    stat: 'Industrial CV · Diffusion OOD · Reliable LLM & Agent Systems',
  },
  'og-news.png': {
    eyebrow: 'ahmed-3m.github.io/news',
    title: 'AI & Agentic AI News',
    sub: 'Curated daily · every item with a take',
    stat: 'updated by an automated agent pipeline',
  },
  'og-diffusion-ood.png': {
    eyebrow: 'ahmed-3m.github.io/case-studies/diffusion-ood',
    title: 'Diffusion OOD Detection',
    sub: 'Within-CIFAR airplane-vs-rest · binary, single ID class',
    stat: thesisStat,
  },
  'og-inkjet-ood.png': {
    eyebrow: 'ahmed-3m.github.io/case-studies/inkjet-ood',
    title: 'InkjetOOD — Case Study',
    sub: 'YOLOv8 + conditional diffusion on FTI_Zer0P',
    stat: inkjetStat,
  },
  'og-sihem.png': {
    eyebrow: 'ahmed-3m.github.io/case-studies/sihem',
    title: 'Sihem — Case Study',
    sub: 'Personal AI assistant · Telegram + PWA',
    stat: 'tech2b incubator · invitation-only beta',
  },
  'og-ood-diffusion-thesis.png': {
    eyebrow: 'ahmed-3m.github.io/blog/ood-diffusion-thesis',
    title: 'Conditional Diffusion for OOD',
    sub: 'Class-conditional separation loss · binary airplane-vs-rest',
    stat: `${thesisStat} (${formatClaim('thesis.gainPp', 'en', 'value')})`,
  },
  'og-deterministic-guardrails.png': {
    eyebrow: 'ahmed-3m.github.io/blog/deterministic-guardrails-for-llm-and-agent-systems',
    title: 'Deterministic AI Guardrails',
    sub: "Sihem's arbiter loop & mergeproof's zero-LLM PR gate",
    stat: 'Probabilistic synthesis · Deterministic boundaries',
  },
  'og-diffusion-models-anomaly-detection.png': {
    eyebrow: 'ahmed-3m.github.io/blog/diffusion-models-anomaly-detection',
    title: 'Diffusion Anomaly Detection',
    sub: 'From CIFAR-10 separation loss to FTI_Zer0P QC',
    stat: inkjetStat,
  },
  'og-computer-vision-yolo-mastery.png': {
    eyebrow: 'ahmed-3m.github.io/blog/computer-vision-yolo-mastery',
    title: 'Industrial Vision with YOLO',
    sub: 'Print defects, small crops, and lighting variance',
    stat: 'YOLO + Diffusion · Production Pipelines',
  },
}

async function main() {
  let sharp
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.error('sharp not found in node_modules — install deps first (npm ci). CI never runs this tool; committed PNGs are canonical.')
    process.exit(1)
  }
  const outDir = path.resolve(OG_DIR)
  await mkdir(outDir, { recursive: true })
  const pngs = {}
  for (const [file, spec] of Object.entries(CARDS)) {
    const png = await sharp(Buffer.from(card(spec))).png({ compressionLevel: 9 }).toBuffer()
    await writeFile(path.join(outDir, file), png)
    pngs[file] = png
    const meta = await sharp(png).metadata()
    console.log(`${file}: ${meta.width}x${meta.height}, ${(png.length / 1024).toFixed(1)} KB`)
  }
  await writeFile(path.resolve(OG_LOCK), `${JSON.stringify(lockOf(CARDS, pngs), null, 2)}\n`)
  console.log(`${OG_LOCK}: ${Object.keys(CARDS).length} cards`)
}

// Render only when run directly: the figure check imports CARDS without rendering.
// import.meta.main (Node 24.2+) holds through junctions and symlinks, where argv[1]
// and the module's real path differ.
if (import.meta.main) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
