// Post-build static export verifier for ./out.
// Zero external dependencies — runs in <1s right after `npm run build` to catch:
//   1. Missing required routes, feeds, sitemaps, LLM manifests, or CV PDF
//   2. Missing <link rel="canonical"> tags or malformed application/ld+json blocks
//   3. Broken internal href/src paths (including %20-encoded PDFs) and #fragment anchors
//   4. Regressions of retired unsourced metrics, leaked public API token identifiers, or
//      Google Analytics tags
//   5. A privacy notice that disagrees with the build about the GoatCounter script

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const outDir = path.resolve(import.meta.dirname, '..', 'out')

const REQUIRED_FILES = [
  'index.html',
  '404.html',
  'about/index.html',
  'research/index.html',
  'blog/index.html',
  'news/index.html',
  'impressum/index.html',
  'privacy/index.html',
  'case-studies/diffusion-ood/index.html',
  'case-studies/inkjet-ood/index.html',
  'case-studies/sihem/index.html',
  'sitemap.xml',
  'sitemap-pages.xml',
  'feed.xml',
  'news/feed.xml',
  'robots.txt',
  'llms.txt',
  'llms-full.txt',
  'cv.pdf',
]

// Static export of `/` renders the concise view by default; `/?view=full#...`
// mounts the full-portfolio sections client-side (see src/components/HomePortfolio.tsx).
const FULL_VIEW_HOME_IDS = new Set([
  'main',
  'hero',
  'projects',
  'other-projects',
  'experience',
  'about',
  'research',
  'ood-explorer',
  'evidence',
  'writing',
  'news',
  'contact',
])

const NON_ROUTE_HTML = new Set([
  '404.html',
  '404/index.html',
  '_not-found/index.html',
])

// Joined from segments so repo-wide literal greps for retired strings never trip on this file.
const FORBIDDEN_SUBSTRINGS = [
  { label: 'unsourced baseline metric', value: ['80', '.25%'].join('') },
  { label: 'unsourced pp delta', value: ['+18', '.8pp'].join('') },
  { label: 'unsourced percentage phrase', value: ['18', '.8 percentage'].join('') },
  { label: 'retired NEXT_PUBLIC_BIGMODEL_TOKEN', value: ['NEXT_PUBLIC_BIGMODEL', '_TOKEN'].join('') },
  { label: 'retired NEXT_PUBLIC_GROQ_TOKEN', value: ['NEXT_PUBLIC_GROQ', '_TOKEN'].join('') },
  { label: 'retired NEXT_PUBLIC_ZAI_TOKEN', value: ['NEXT_PUBLIC_ZAI', '_TOKEN'].join('') },
  { label: 'Groq API key prefix', value: ['gsk', '_'].join('') },
  // GA4 was replaced by GoatCounter; the privacy notice no longer covers Google Analytics.
  { label: 'Google Analytics tag host', value: ['googletag', 'manager.com'].join('') },
  { label: 'Google Analytics collector host', value: ['google-', 'analytics.com'].join('') },
]

const GOATCOUNTER_SCRIPT = 'gc.zgo.at/count.js'

function walkFiles(dir, prefix = '') {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walkFiles(abs, rel))
    } else if (entry.isFile()) {
      results.push(rel)
    }
  }
  return results
}

function isExcludedFromCanonical(relHtml) {
  if (NON_ROUTE_HTML.has(relHtml)) return true
  const base = path.posix.basename(relHtml)
  return relHtml === base && /^google[a-z0-9]+\.html$/i.test(base)
}

function stripExecutableBlocks(html) {
  return html
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
}

function decodeHtmlAttr(raw) {
  return raw
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/gi, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
}

function safeDecodeUri(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}

function isInsideOutDir(candidateAbs) {
  const rel = path.relative(outDir, candidateAbs)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

function resolveInternalTarget(decodedPathname, sourceRelHtml) {
  let cleanRel
  if (decodedPathname.startsWith('/')) {
    cleanRel = decodedPathname.replace(/^\/+/, '')
  } else {
    const sourceDir = path.posix.dirname(sourceRelHtml)
    cleanRel = path.posix.normalize(
      sourceDir === '.' ? decodedPathname : `${sourceDir}/${decodedPathname}`,
    )
  }

  if (cleanRel === '' || cleanRel === '.') {
    const indexAbs = path.join(outDir, 'index.html')
    return existsSync(indexAbs) && statSync(indexAbs).isFile()
      ? { exists: true, htmlRel: 'index.html' }
      : { exists: false, htmlRel: null }
  }

  const trimmed = cleanRel.replace(/\/+$/, '')
  const directAbs = path.join(outDir, trimmed)
  if (!isInsideOutDir(directAbs)) {
    return { exists: false, htmlRel: null }
  }

  if (!decodedPathname.endsWith('/') && existsSync(directAbs) && statSync(directAbs).isFile()) {
    return {
      exists: true,
      htmlRel: trimmed.endsWith('.html') ? trimmed.replace(/\\/g, '/') : null,
    }
  }

  const indexRel = `${trimmed}/index.html`
  const indexAbs = path.join(outDir, indexRel)
  if (isInsideOutDir(indexAbs) && existsSync(indexAbs) && statSync(indexAbs).isFile()) {
    return { exists: true, htmlRel: indexRel }
  }

  return { exists: false, htmlRel: null }
}

if (!existsSync(outDir) || !statSync(outDir).isDirectory()) {
  console.error(`verify-export: missing export directory ${outDir} (run \`npm run build\` first).`)
  process.exit(1)
}

const errors = []

// 1. Required static files exist and are non-empty.
for (const rel of REQUIRED_FILES) {
  const abs = path.join(outDir, rel)
  if (!existsSync(abs) || !statSync(abs).isFile()) {
    errors.push(`Missing required file in out/: ${rel}`)
  } else if (statSync(abs).size === 0) {
    errors.push(`Empty required file in out/: ${rel}`)
  }
}

const allFiles = walkFiles(outDir)
const htmlFiles = allFiles.filter((rel) => rel.endsWith('.html')).sort()
const jsBundleFiles = allFiles
  .filter((rel) => rel.startsWith('_next/static/') && rel.endsWith('.js'))
  .sort()

const htmlContents = new Map()
const htmlIdSets = new Map()

let canonicalCount = 0
let jsonLdCount = 0

// 2. Canonical tags on route HTML pages + valid JSON-LD across all HTML files.
for (const relHtml of htmlFiles) {
  const html = readFileSync(path.join(outDir, relHtml), 'utf8')
  htmlContents.set(relHtml, html)

  const ids = new Set()
  for (const match of html.matchAll(/\bid=(?:"([^"]+)"|'([^']+)')/g)) {
    const id = match[1] ?? match[2]
    if (id) ids.add(id)
  }
  htmlIdSets.set(relHtml, ids)

  if (!isExcludedFromCanonical(relHtml)) {
    const canonMatch = html.match(
      /<link\b[^>]*\brel=(?:"canonical"|'canonical'|canonical)(?=[\s/>])[^>]*>/i,
    )
    if (!canonMatch) {
      errors.push(`Missing <link rel="canonical"> in out/${relHtml}`)
    } else {
      const hrefMatch = canonMatch[0].match(/\bhref=(?:"([^"]+)"|'([^']+)')/i)
      const href = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? '').trim()
      if (!href) {
        errors.push(`Empty canonical href in out/${relHtml}`)
      } else {
        canonicalCount += 1
      }
    }
  }

  const ldMatches = html.matchAll(
    /<script\b[^>]*\btype=(?:"application\/ld\+json"|'application\/ld\+json')[^>]*>([\s\S]*?)<\/script>/gi,
  )
  for (const match of ldMatches) {
    const rawJson = match[1].trim()
    if (!rawJson) {
      errors.push(`Empty <script type="application/ld+json"> block in out/${relHtml}`)
      continue
    }
    try {
      JSON.parse(rawJson)
      jsonLdCount += 1
    } catch (err) {
      errors.push(
        `Invalid JSON-LD in out/${relHtml}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
  }
}

// 3. Internal href/src path resolution + #fragment anchor checks.
let internalRefCount = 0
let anchorCheckCount = 0

for (const relHtml of htmlFiles) {
  const cleanHtml = stripExecutableBlocks(htmlContents.get(relHtml))
  const attrMatches = cleanHtml.matchAll(/\b(?:href|src)=(?:"([^"]*)"|'([^']*)')/gi)

  for (const match of attrMatches) {
    const rawAttr = decodeHtmlAttr((match[1] ?? match[2] ?? '').trim())
    if (!rawAttr) continue
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|blob:)/i.test(rawAttr)) continue
    if (rawAttr.startsWith('//')) continue

    if (rawAttr.startsWith('#')) {
      const rawFrag = rawAttr.slice(1)
      if (!rawFrag) continue
      const frag = safeDecodeUri(rawFrag)
      if (frag === null) {
        errors.push(`Malformed URI fragment "${rawAttr}" in out/${relHtml}`)
        continue
      }
      anchorCheckCount += 1
      if (!htmlIdSets.get(relHtml)?.has(frag)) {
        errors.push(`Broken same-page anchor "${rawAttr}" in out/${relHtml} (no id="${frag}")`)
      }
      continue
    }

    internalRefCount += 1
    const hashIndex = rawAttr.indexOf('#')
    const rawFragment = hashIndex >= 0 ? rawAttr.slice(hashIndex + 1) : ''
    const withoutHash = hashIndex >= 0 ? rawAttr.slice(0, hashIndex) : rawAttr

    const queryIndex = withoutHash.indexOf('?')
    const rawPathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash
    const rawQuery = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : ''

    const decodedPathname = safeDecodeUri(rawPathname)
    if (decodedPathname === null) {
      errors.push(`Malformed URI path "${rawAttr}" in out/${relHtml}`)
      continue
    }

    const resolved = resolveInternalTarget(decodedPathname, relHtml)
    if (!resolved.exists) {
      errors.push(
        `Broken internal reference "${rawAttr}" in out/${relHtml} (decoded path "${decodedPathname}" not found in out/)`,
      )
      continue
    }

    if (rawFragment && resolved.htmlRel) {
      const frag = safeDecodeUri(rawFragment)
      if (frag === null) {
        errors.push(`Malformed URI fragment "${rawAttr}" in out/${relHtml}`)
        continue
      }
      anchorCheckCount += 1
      const targetIds = htmlIdSets.get(resolved.htmlRel)
      const isFullHomeView =
        resolved.htmlRel === 'index.html' &&
        new URLSearchParams(rawQuery).get('view') === 'full'
      const hasAnchor =
        Boolean(targetIds?.has(frag)) ||
        (isFullHomeView && FULL_VIEW_HOME_IDS.has(frag))
      if (!hasAnchor) {
        errors.push(
          `Broken target anchor "${rawAttr}" in out/${relHtml} (no id="${frag}" in out/${resolved.htmlRel})`,
        )
      }
    }
  }
}

// 4. Scan HTML and _next/static/**/*.js bundles for forbidden metrics & leaked token identifiers.
const scanTargets = [...htmlFiles, ...jsBundleFiles]
for (const rel of scanTargets) {
  const content =
    htmlContents.get(rel) ?? readFileSync(path.join(outDir, rel), 'utf8')
  for (const rule of FORBIDDEN_SUBSTRINGS) {
    if (content.includes(rule.value)) {
      errors.push(`Forbidden ${rule.label} ("${rule.value}") found in out/${rel}`)
    }
  }
}

// 5. The privacy notice describes GoatCounter exactly when the build loads its script
//    (src/lib/analytics.ts decides both from NEXT_PUBLIC_GOATCOUNTER_CODE).
const analyticsLoaded = (htmlContents.get('index.html') ?? '').includes(GOATCOUNTER_SCRIPT)
const privacyMentionsGoatCounter = (htmlContents.get('privacy/index.html') ?? '').includes('GoatCounter')
if (analyticsLoaded !== privacyMentionsGoatCounter) {
  errors.push(
    analyticsLoaded
      ? `out/index.html loads ${GOATCOUNTER_SCRIPT} but out/privacy/index.html does not mention GoatCounter`
      : `out/privacy/index.html mentions GoatCounter but out/index.html does not load ${GOATCOUNTER_SCRIPT}`,
  )
}

if (errors.length > 0) {
  console.error(`verify-export: FAILED with ${errors.length} error(s):`)
  for (const err of errors) {
    console.error(`  - ${err}`)
  }
  process.exit(1)
}

console.log(
  `verify-export: OK (${REQUIRED_FILES.length} required files, ` +
    `${canonicalCount} canonical tags, ${jsonLdCount} JSON-LD blocks, ` +
    `${internalRefCount} internal refs, ${anchorCheckCount} anchors, ` +
    `${scanTargets.length} HTML/JS bundles scanned, ` +
    `analytics ${analyticsLoaded ? 'on' : 'off'} and privacy notice consistent)`,
)
