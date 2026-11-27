// Static-export scanner for the figure check (spec 008, research R5). Turns out/**/*.html
// into block units (paragraphs, list items, rows, headings, titles, meta content, and the
// smallest element around any other figure that also holds words), plus raw-file units
// for the retired rule, so retired figures in inline scripts and JS bundles still fail
// the build (FR-008). No dependency: a small tag tokenizer is enough for built HTML.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
// dt/dd are not blocks: a term and its value belong together, so a figure in a dd joins
// its dt through the smallest ancestor that holds words (the telemetry cells).
const BLOCKS = new Set(['p', 'li', 'tr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'figcaption', 'blockquote', 'title'])
const INLINE = new Set(['span', 'tspan', 'bdi', 'b', 'strong', 'em', 'i', 'sup', 'sub', 'small', 'code', 'a', 'abbr', 'mark'])
const META_CONTENT = /^(?:description|og:title|og:description|twitter:title|twitter:description|og:image:alt|twitter:image:alt)$/i

/** The JS bundles share one stable label: their file names are content hashes. */
export const JS_BUNDLE_LABEL = 'out/_next/static/**/*.js'

/** Built pages whose text is third-party news, not the owner's results (spec 008 scope note). */
const EXCLUDED_HTML = [/^news\//]
/** The same news on other pages: the home page's daily-updated news section (News.tsx).
 *  Retired figures are still caught there by the raw-file unit. */
const EXCLUDED_SECTION_ID = /(?:^|\s)id\s*=\s*"news"/

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? listFiles(p) : [p]
  })
}

const attr = (attrs, name) => attrs.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i'))?.[1] ?? null

/** A minimal element tree: { tag, attrs, children: (node | string)[] }. */
function parse(html) {
  const root = { tag: '#root', attrs: '', children: [] }
  const stack = [root]
  const token = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>|([^<]+)|</g
  for (const m of html.matchAll(token)) {
    const [, close, open, attrs = '', text] = m
    const top = stack[stack.length - 1]
    if (text !== undefined) top.children.push(text)
    else if (open) {
      const tag = open.toLowerCase()
      const node = { tag, attrs, children: [], parent: top }
      top.children.push(node)
      if (!VOID.has(tag) && !attrs.trimEnd().endsWith('/')) stack.push(node)
    } else if (close) {
      const tag = close.toLowerCase()
      const at = stack.findLastIndex((n) => n.tag === tag)
      if (at > 0) stack.length = at
    }
  }
  return root
}

const textCache = new WeakMap()
function textOf(node) {
  if (typeof node === 'string') return node
  if (textCache.has(node)) return textCache.get(node)
  const sep = INLINE.has(node.tag) ? '' : ' '
  // Sibling elements are separate boxes on screen (flex rows, label/value pairs): keep a
  // space between them so `CIFAR-10` and `98.98%` do not read as `CIFAR-1098.98%`.
  const inner = node.children
    .map((child, i) => (i > 0 && typeof child !== 'string' && typeof node.children[i - 1] !== 'string' ? ' ' : '') + textOf(child))
    .join('')
  const text = `${sep}${inner}${sep}`
  textCache.set(node, text)
  return text
}

const hasFigure = (text) => /\d[.,]\d/.test(text)
const hasWords = (text) => /\p{L}{3,}/u.test(text.replace(/\d[\d.,]*\s?%?/g, ''))

/** Block units of one page. */
function pageUnits(html, file) {
  const stripped = html
    .replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  const units = []
  const add = (text) => units.push({ file, lang: 'en', scope: 'export', text })

  for (const m of stripped.matchAll(/<meta\b([^>]*)>/gi)) {
    const key = attr(m[1], 'name') ?? attr(m[1], 'property') ?? ''
    const content = attr(m[1], 'content')
    if (content && META_CONTENT.test(key)) add(content)
  }

  const root = parse(stripped)
  const taken = new Set()
  const visit = (node, insideBlock) => {
    if (node.tag === 'script' || node.tag === 'style') return
    if (EXCLUDED_SECTION_ID.test(node.attrs)) return
    const isBlock = BLOCKS.has(node.tag)
    if (isBlock && !insideBlock) add(textOf(node))
    for (const child of node.children) {
      if (typeof child !== 'string') {
        visit(child, insideBlock || isBlock)
        continue
      }
      if (insideBlock || isBlock || !hasFigure(child)) continue
      // A figure outside any block: the smallest ancestor that also holds words.
      let unit = node
      while (unit.parent && !hasWords(textOf(unit))) unit = unit.parent
      if (!taken.has(unit)) {
        taken.add(unit)
        add(textOf(unit))
      }
    }
  }
  visit(root, false)
  return units
}

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }
const jsonBody = (s) => JSON.stringify(s).slice(1, -1)
const asciiEscaped = (s) => s.replace(/[^\x00-\x7f]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)

/** The ways a string can be written in built HTML and JS: as is, HTML-escaped, as a JSON
 *  string body (also with \u escapes), and JSON inside JSON (the RSC payload in a page). */
export function encodedForms(s) {
  const forms = [s, s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]), jsonBody(s), asciiEscaped(jsonBody(s)), jsonBody(jsonBody(s))]
  return [...new Set(forms)].filter(Boolean)
}

/** Removes every encoded form of the given strings from a text. */
export function blankStrings(text, strings) {
  let out = text
  for (const s of strings) for (const form of encodedForms(s)) if (out.includes(form)) out = out.split(form).join(' ')
  return out
}

/**
 * Every export-scope text unit. Fails like verify-export does when out/ is missing.
 * `thirdParty` strings (news headlines that hold a retired figure) are blanked from the
 * raw HTML and JS units, so third-party text cannot fail the build but owner copy can.
 * @param {string} outDir
 * @param {{ thirdParty?: string[] }} [options]
 */
export function scanExport(outDir, { thirdParty = [] } = {}) {
  if (!existsSync(outDir)) throw new Error(`scan-export: ${outDir} does not exist; run npm run build first`)
  const units = []
  const rel = (abs) => path.relative(outDir, abs).split(path.sep).join('/')
  const raw = (text) => (thirdParty.length ? blankStrings(text, thirdParty) : text)
  const files = listFiles(outDir)
  for (const abs of files.filter((f) => f.endsWith('.html')).sort()) {
    const relHtml = rel(abs)
    const html = readFileSync(abs, 'utf8').replace(/\r\n?/g, '\n')
    const file = `out/${relHtml}`
    units.push({ file, lang: 'en', scope: 'export', rules: 'retired-only', text: raw(html) })
    if (EXCLUDED_HTML.some((re) => re.test(relHtml))) continue
    units.push(...pageUnits(html, file))
  }
  const bundles = files.filter((f) => f.endsWith('.js') && rel(f).startsWith('_next/static/'))
  for (const abs of bundles) {
    units.push({ file: JS_BUNDLE_LABEL, lang: 'en', scope: 'export', rules: 'retired-only', text: raw(readFileSync(abs, 'utf8')) })
  }
  return units
}
