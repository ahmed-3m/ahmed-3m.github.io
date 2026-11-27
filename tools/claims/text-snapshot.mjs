// Visible-text snapshot of the static export in all five languages (spec 008, T032/T043,
// FR-011). Serves ./out on 127.0.0.1, opens every built page (except the third-party
// /news/) once per language, and writes document.title, the meta description and
// document.body.innerText to <dir>/<lang>/<route>.txt. Diff two snapshots to list every
// visible change a PR makes.
//
// Run: PLAYWRIGHT_MODULE_ROOT=<dir with playwright installed> node tools/claims/text-snapshot.mjs <dir>
// (the same Playwright loading as tools/playwright-smoke.mjs).

import { createReadStream, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'

const outDir = path.resolve(import.meta.dirname, '..', '..', 'out')
const LANGS = ['en', 'de', 'fr', 'es', 'ar']
const EXCLUDED = [/^\/news\//]
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' }

function loadPlaywright() {
  const roots = [process.env.PLAYWRIGHT_MODULE_ROOT, process.env.PLAYWRIGHT_DIR].filter(Boolean)
  for (const root of roots) {
    try {
      return createRequire(path.resolve(root, 'package.json'))('playwright')
    } catch {
      // next candidate
    }
  }
  return createRequire(import.meta.url)('playwright')
}

/** Every built page as a route (`/`, `/research/`, ...), plus the full home view. */
function routes() {
  const found = []
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, e.name)
      if (e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('__next')) walk(abs)
      else if (e.name === 'index.html') {
        const rel = path.relative(outDir, dir).split(path.sep).join('/')
        found.push(rel ? `/${rel}/` : '/')
      }
    }
  }
  walk(outDir)
  return [...found.filter((r) => !EXCLUDED.some((re) => re.test(r))).sort(), '/?view=full']
}

function resolveFile(pathname) {
  const rel = decodeURIComponent(pathname).replace(/^\/+/, '').replace(/\/+$/, '')
  const candidates = [path.join(outDir, rel), path.join(outDir, rel, 'index.html')]
  const rsc = rel.match(/^(.*\/)?__next\.([^./]+)\.(.+)\.txt$/)
  if (rsc) candidates.push(path.join(outDir, `${rsc[1] ?? ''}__next.${rsc[2]}/${rsc[3].replace(/\./g, '/')}.txt`))
  return candidates.find((f) => path.relative(outDir, f).startsWith('..') === false && existsSync(f) && statSync(f).isFile())
}

function serve() {
  const server = http.createServer((req, res) => {
    const file = resolveFile(new URL(req.url ?? '/', 'http://x').pathname)
    if (!file) {
      res.writeHead(404).end()
      return
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' })
    createReadStream(file).pipe(res)
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)))
}

const dest = process.argv[2]
if (!dest) throw new Error('usage: node tools/claims/text-snapshot.mjs <dir>')
if (!existsSync(outDir)) throw new Error('text-snapshot: out/ does not exist; run npm run build first')

const { chromium } = loadPlaywright()
const server = await serve()
const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ headless: true })
const all = routes()
try {
  for (const lang of LANGS) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
    await context.addInitScript((l) => {
      window.localStorage.setItem('language', l)
      window.localStorage.setItem('theme', 'dark')
    }, lang)
    const page = await context.newPage()
    await page.route(/^https?:\/\//i, (route) => (route.request().url().startsWith(origin) ? route.continue() : route.abort()))
    for (const route of all) {
      await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' })
      await page.waitForFunction((l) => document.documentElement.lang === l || l === 'en', lang, { timeout: 5000 }).catch(() => {})
      const text = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''
        return `TITLE: ${document.title}\nDESCRIPTION: ${meta}\n\n${document.body.innerText}`
      })
      const name = route === '/' ? 'index' : route === '/?view=full' ? 'index-full' : route.replace(/^\/|\/$/g, '').replace(/\//g, '__')
      mkdirSync(path.join(dest, lang), { recursive: true })
      writeFileSync(path.join(dest, lang, `${name}.txt`), `${text.replace(/\r\n?/g, '\n').trimEnd()}\n`)
    }
    await context.close()
  }
  console.log(`text-snapshot: ${all.length} routes × ${LANGS.length} languages -> ${dest}`)
} finally {
  await browser.close()
  server.close()
}
