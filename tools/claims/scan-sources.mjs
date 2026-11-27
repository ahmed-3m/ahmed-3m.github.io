// Source scanner for the figure check (spec 008, research R5). Turns the site's copy
// into text units: TS/TSX cards and JSX blocks (per language), manifest and README
// paragraphs, the README hero SVGs, and the OG card definitions. No build needed.

import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

// Loaded from this repository's node_modules (a dev dependency already).
const ts = createRequire(import.meta.url)('typescript')

const LANGS = new Set(['en', 'de', 'fr', 'es', 'ar'])

/** JSX attributes whose strings are shown to readers; every other attribute is skipped. */
const VISIBLE_ATTRS = new Set(['alt', 'title', 'aria-label', 'aria-description', 'placeholder', 'content', 'label', 'summary'])

/** Object properties whose values are styling, geometry or addresses, never copy. */
const NON_COPY_PROPS = new Set([
  'className', 'style', 'd', 'viewBox', 'points', 'transform', 'transformOrigin', 'transition', 'animation',
  'background', 'backgroundImage', 'backgroundColor', 'boxShadow', 'textShadow', 'filter', 'backdropFilter',
  'color', 'fill', 'stroke', 'borderColor', 'border', 'outline', 'opacity', 'gradient', 'clipPath', 'mask',
  'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'top', 'left', 'right', 'bottom', 'inset',
  'margin', 'padding', 'gap', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'gridTemplateColumns',
  'href', 'src', 'url', 'path', 'icon', 'slug', 'id', 'key', 'image', 'ogImage',
])

export const posixPath = (p) => p.split(path.sep).join('/')

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? listFiles(p) : [p]
  })
}

const readText = (file) => readFileSync(file, 'utf8').replace(/\r\n?/g, '\n')

// ---------------------------------------------------------------------------------
// TS / TSX

function propertyName(node) {
  const name = node.name
  if (!name) return null
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) return name.text
  return null
}

function isTranslationMap(obj) {
  return (
    obj.properties.length > 0 &&
    obj.properties.every((p) => ts.isPropertyAssignment(p) && LANGS.has(propertyName(p) ?? ''))
  )
}

/** Strings of a TS/TSX file, grouped into text units by card or JSX block and language. */
export function scanTsFile(abs, rel) {
  const src = readText(abs)
  const kind = abs.endsWith('.tsx') ? ts.ScriptKind.TSX : abs.endsWith('.ts') ? ts.ScriptKind.TS : ts.ScriptKind.JS
  const sf = ts.createSourceFile(abs, src, ts.ScriptTarget.Latest, true, kind)
  const elementText = new Map()

  const jsxText = (node) => {
    if (elementText.has(node)) return elementText.get(node)
    let text = ''
    const visit = (n) => {
      if (ts.isJsxAttributes(n)) return
      if (ts.isJsxText(n)) text += ` ${n.text}`
      else if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) text += ` ${n.text}`
      ts.forEachChild(n, visit)
    }
    visit(node)
    elementText.set(node, text)
    return text
  }

  const skipped = (node) => {
    for (let a = node.parent; a; a = a.parent) {
      if (ts.isImportDeclaration(a) || ts.isExportDeclaration(a) || ts.isLiteralTypeNode(a)) return true
      if (ts.isJsxAttribute(a)) return !VISIBLE_ATTRS.has(a.name.getText(sf))
      if (ts.isPropertyAssignment(a) && NON_COPY_PROPS.has(propertyName(a) ?? '')) return true
      if (ts.isElementAccessExpression(a) && a.argumentExpression === node) return true
    }
    return false
  }

  const languageOf = (node) => {
    for (let a = node.parent; a; a = a.parent) {
      if (ts.isPropertyAssignment(a)) {
        const key = propertyName(a)
        if (key && LANGS.has(key)) return key
      }
    }
    return null
  }

  const containerOf = (node) => {
    let last = node
    for (let a = node.parent; a; a = a.parent) {
      if (ts.isObjectLiteralExpression(a) && !isTranslationMap(a)) return a
      if ((ts.isJsxElement(a) || ts.isJsxFragment(a)) && /\p{L}{3,}/u.test(jsxText(a))) return a
      if (ts.isSourceFile(a)) return last
      last = a
    }
    return last
  }

  /** container -> { lang|'neutral' -> pieces[] }, in source order */
  const groups = new Map()
  const addPiece = (node, text) => {
    if (!/\d[.,]\d/.test(text) && !/\p{L}/u.test(text)) return
    const container = containerOf(node)
    const lang = languageOf(node) ?? 'neutral'
    let group = groups.get(container)
    if (!group) groups.set(container, (group = new Map()))
    const pieces = group.get(lang) ?? []
    pieces.push({ text, line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1 })
    group.set(lang, pieces)
  }

  const visit = (node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node)) {
      if (!skipped(node)) addPiece(node, node.text)
      return
    }
    if (ts.isTemplateExpression(node)) {
      if (!skipped(node)) addPiece(node, [node.head.text, ...node.templateSpans.map((s) => s.literal.text)].join(' '))
      node.templateSpans.forEach((s) => visit(s.expression))
      return
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)

  const units = []
  for (const group of groups.values()) {
    const neutral = group.get('neutral') ?? []
    const langs = [...group.keys()].filter((k) => k !== 'neutral')
    for (const lang of langs.length ? langs : ['en']) {
      const pieces = [...(group.get(lang) ?? []), ...neutral].sort((a, b) => a.line - b.line)
      const withFigure = pieces.find((p) => /\d[.,]\d/.test(p.text)) ?? pieces[0]
      const lineMap = pieces.flatMap((p) => p.text.split('\n').map((_, i) => p.line + i))
      units.push({ file: rel, lang, scope: 'source', text: pieces.map((p) => p.text).join('\n'), line: withFigure.line, lineMap })
    }
  }
  return units
}

// ---------------------------------------------------------------------------------
// Markdown and plain-text manifests: one unit per paragraph, list item, table row or heading.

export function scanTextFile(abs, rel) {
  const lines = readText(abs).split('\n')
  const units = []
  let current = null
  const flush = () => {
    if (current && current.text.trim()) {
      const lineMap = current.text.split('\n').map((_, i) => current.line + i)
      units.push({ file: rel, lang: 'en', scope: 'source', text: current.text, line: current.line, lineMap })
    }
    current = null
  }
  lines.forEach((line, i) => {
    const startsItem = /^\s*(?:[-*+]\s|\d+[.)]\s|\||#{1,6}\s|>)/.test(line)
    if (!line.trim()) return flush()
    if (startsItem || !current) {
      flush()
      current = { text: line, line: i + 1 }
      if (/^\s*(?:\||#{1,6}\s)/.test(line)) flush() // a table row or heading stands alone
      return
    }
    current.text += `\n${line}`
  })
  flush()
  return units
}

// ---------------------------------------------------------------------------------
// OG generator: one unit per card definition in its CARDS object.

export function scanOgCards(abs, rel) {
  const src = readText(abs)
  const sf = ts.createSourceFile(abs, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
  const units = []
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(sf) === 'CARDS' && node.initializer && ts.isObjectLiteralExpression(node.initializer)) {
      for (const prop of node.initializer.properties) {
        if (!ts.isPropertyAssignment(prop) || !ts.isObjectLiteralExpression(prop.initializer)) continue
        const text = prop.initializer.properties
          .filter((p) => ts.isPropertyAssignment(p) && (ts.isStringLiteral(p.initializer) || ts.isNoSubstitutionTemplateLiteral(p.initializer)))
          .map((p) => p.initializer.text)
          .join('\n')
        units.push({ file: rel, lang: 'en', scope: 'source', text, line: sf.getLineAndCharacterOfPosition(prop.getStart(sf)).line + 1 })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return units
}

// ---------------------------------------------------------------------------------
// README hero SVGs: one unit per file, with line numbers.

export function scanSvgFile(abs, rel) {
  const text = readText(abs)
  return [{ file: rel, lang: 'en', scope: 'source', text, line: 1, lineMap: text.split('\n').map((_, i) => i + 1) }]
}

// ---------------------------------------------------------------------------------

export const TEXT_FILES = ['public/llms.txt', 'public/llms-full.txt', 'README.md']
export const SVG_FILES = ['.github/readme/hero-dark.svg', '.github/readme/hero-light.svg']
export const OG_GENERATOR = 'tools/generate-og-images.mjs'

/** Source files of the site's copy, repository-relative. */
export function sourceFiles(root) {
  return listFiles(path.join(root, 'src'))
    .map((abs) => posixPath(path.relative(root, abs)))
    .filter((rel) => /\.(ts|tsx)$/.test(rel) && !rel.endsWith('.d.ts'))
    .filter((rel) => rel !== 'src/lib/ood-explorer-data.ts' && !rel.startsWith('src/lib/claims/'))
    .sort()
}

/** Every source-scope text unit (contracts/figure-check.md, "Inputs scanned"). */
export function scanSources(root) {
  const units = []
  for (const rel of sourceFiles(root)) units.push(...scanTsFile(path.join(root, rel), rel))
  for (const rel of TEXT_FILES) units.push(...scanTextFile(path.join(root, rel), rel))
  for (const rel of SVG_FILES) units.push(...scanSvgFile(path.join(root, rel), rel))
  units.push(...scanOgCards(path.join(root, OG_GENERATOR), OG_GENERATOR))
  return units
}
