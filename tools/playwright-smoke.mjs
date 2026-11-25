// Hermetic headless-Chromium smoke gate for ./out.
// Serves ./out on 127.0.0.1:<ephemeral-port>, intercepts external network calls,
// and audits representative routes across desktop dark/light + 375px mobile EN/AR
// for console/page errors, RTL attributes, and horizontal overflow.

import { createReadStream, existsSync, statSync } from 'node:fs'
import http from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'

const outDir = path.resolve(import.meta.dirname, '..', 'out')

const ROUTES = [
  '/',
  '/?view=full',
  '/about/',
  '/research/',
  '/blog/',
  '/news/',
  '/case-studies/diffusion-ood/',
  '/case-studies/sihem/',
]

const PROFILES = [
  {
    name: 'desktop-dark-en',
    viewport: { width: 1280, height: 800 },
    theme: 'dark',
    language: 'en',
  },
  {
    name: 'desktop-light-en',
    viewport: { width: 1280, height: 800 },
    theme: 'light',
    language: 'en',
  },
  {
    name: 'mobile-en-ltr',
    viewport: { width: 375, height: 812 },
    theme: 'dark',
    language: 'en',
  },
  {
    name: 'mobile-ar-rtl',
    viewport: { width: 375, height: 812 },
    theme: 'dark',
    language: 'ar',
  },
]

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
}

function loadPlaywright() {
  const candidates = []
  if (process.env.PLAYWRIGHT_MODULE_ROOT) {
    candidates.push(path.resolve(process.env.PLAYWRIGHT_MODULE_ROOT, 'package.json'))
  }
  if (process.env.PLAYWRIGHT_DIR) {
    candidates.push(path.resolve(process.env.PLAYWRIGHT_DIR, 'package.json'))
  }
  if (process.env.NODE_PATH) {
    for (const entry of process.env.NODE_PATH.split(path.delimiter).filter(Boolean)) {
      candidates.push(path.resolve(entry, '..', 'package.json'))
      candidates.push(path.resolve(entry, 'playwright', 'package.json'))
    }
  }

  for (const anchor of candidates) {
    try {
      return createRequire(anchor)('playwright')
    } catch {
      // Fall through to next candidate.
    }
  }

  return createRequire(import.meta.url)('playwright')
}

function isInsideOutDir(absCandidate) {
  const rel = path.relative(outDir, absCandidate)
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

function resolveStaticFile(urlPathname) {
  let decoded
  try {
    decoded = decodeURIComponent(urlPathname)
  } catch {
    return null
  }

  const stripped = decoded.replace(/^\/+/, '')
  if (stripped === '') {
    const rootIndex = path.join(outDir, 'index.html')
    return existsSync(rootIndex) && statSync(rootIndex).isFile() ? rootIndex : null
  }

  const trimmed = stripped.replace(/\/+$/, '')
  const direct = path.join(outDir, trimmed)
  if (!isInsideOutDir(direct)) return null

  if (!decoded.endsWith('/') && existsSync(direct) && statSync(direct).isFile()) {
    return direct
  }

  const dirIndex = path.join(outDir, trimmed, 'index.html')
  if (isInsideOutDir(dirIndex) && existsSync(dirIndex) && statSync(dirIndex).isFile()) {
    return dirIndex
  }

  // Next.js 16 static export writes per-segment RSC payloads under nested
  // `__next.<first>/<rest>.txt` directories while Link prefetch probes the
  // dot-flattened `__next.<first>.<rest>.txt` path first.
  const rscMatch = trimmed.match(/^(.*\/)?__next\.([^./]+)\.(.+)\.txt$/)
  if (rscMatch) {
    const [, prefix = '', firstSeg, restSegs] = rscMatch
    const nestedRel = `${prefix}__next.${firstSeg}/${restSegs.replace(/\./g, '/')}.txt`
    const nestedAbs = path.join(outDir, nestedRel)
    if (isInsideOutDir(nestedAbs) && existsSync(nestedAbs) && statSync(nestedAbs).isFile()) {
      return nestedAbs
    }
  }

  return null
}

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const method = req.method ?? 'GET'
    if (method !== 'GET' && method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Method Not Allowed')
      return
    }

    const reqUrl = new URL(req.url ?? '/', 'http://127.0.0.1')
    const fileAbs = resolveStaticFile(reqUrl.pathname)
    if (!fileAbs) {
      const fallback404 = path.join(outDir, '404.html')
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      if (method === 'HEAD' || !existsSync(fallback404)) {
        res.end()
      } else {
        createReadStream(fallback404).pipe(res)
      }
      return
    }

    const ext = path.extname(fileAbs).toLowerCase()
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream'
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    })
    if (method === 'HEAD') {
      res.end()
      return
    }
    createReadStream(fileAbs).pipe(res)
  })

  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address()
      if (!addr || typeof addr === 'string') {
        reject(new Error('Failed to bind ephemeral 127.0.0.1 port'))
        return
      }
      resolve({
        server,
        origin: `http://127.0.0.1:${addr.port}`,
      })
    })
  })
}

function closeServer(server) {
  return new Promise((resolve) => {
    server.close(() => resolve())
  })
}

if (!existsSync(outDir) || !statSync(outDir).isDirectory()) {
  console.error(`playwright-smoke: missing export directory ${outDir} (run \`npm run build\` first).`)
  process.exit(1)
}

const { chromium } = loadPlaywright()
const { server, origin } = await startStaticServer()
let browser = null
const failures = []
let checksRun = 0

try {
  browser = await chromium.launch({ headless: true })

  for (const profile of PROFILES) {
    const context = await browser.newContext({
      viewport: profile.viewport,
      reducedMotion: 'reduce',
    })

    await context.addInitScript(
      ({ theme, language }) => {
        try {
          window.localStorage.setItem('theme', theme)
          window.localStorage.setItem('language', language)
        } catch {
          // Ignore storage errors on non-http initial about:blank.
        }
      },
      { theme: profile.theme, language: profile.language },
    )

    const page = await context.newPage()

    // Keep the smoke gate 100% hermetic: intercept any external http(s) calls so
    // optional third-party scripts (e.g. GA4 when NEXT_PUBLIC_GA_MEASUREMENT_ID is set)
    // never touch the network or emit ERR_FAILED console noise.
    await page.route(/^https?:\/\//i, async (route) => {
      const url = new URL(route.request().url())
      if (url.origin === origin) {
        await route.continue()
        return
      }
      if (route.request().resourceType() === 'script') {
        await route.fulfill({
          status: 200,
          contentType: 'application/javascript; charset=utf-8',
          body: '',
        })
        return
      }
      await route.fulfill({ status: 204, body: '' })
    })

    let activePageErrors = []
    let activeConsoleErrors = []

    page.on('pageerror', (err) => {
      activePageErrors.push(err instanceof Error ? err.message : String(err))
    })
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        activeConsoleErrors.push(msg.text())
      }
    })

    for (const routePath of ROUTES) {
      checksRun += 1
      activePageErrors = []
      activeConsoleErrors = []
      const label = `[${profile.name}] ${routePath}`

      const response = await page.goto(`${origin}${routePath}`, {
        waitUntil: 'load',
        timeout: 20_000,
      })

      if (!response || response.status() !== 200) {
        failures.push(`${label}: expected HTTP 200, received ${response?.status() ?? 'no response'}`)
        continue
      }

      // Allow post-hydration useEffect / useLayoutEffect hooks (language/theme/view sync) to settle.
      await page.evaluate(
        () =>
          new Promise((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          }),
      )

      const metrics = await page.evaluate(() => {
        const docEl = document.documentElement
        return {
          scrollWidth: docEl.scrollWidth,
          clientWidth: docEl.clientWidth,
          dir: docEl.dir,
          lang: docEl.lang,
          theme: docEl.getAttribute('data-theme'),
        }
      })

      if (activePageErrors.length > 0) {
        failures.push(`${label}: pageerror(s): ${activePageErrors.join(' | ')}`)
      }
      if (activeConsoleErrors.length > 0) {
        failures.push(`${label}: console.error(s): ${activeConsoleErrors.join(' | ')}`)
      }
      if (metrics.theme !== profile.theme) {
        failures.push(`${label}: expected data-theme="${profile.theme}", got "${metrics.theme}"`)
      }
      if (profile.language === 'ar') {
        if (metrics.dir !== 'rtl' || metrics.lang !== 'ar') {
          failures.push(
            `${label}: expected html[dir="rtl"][lang="ar"], got dir="${metrics.dir}" lang="${metrics.lang}"`,
          )
        }
      } else if (metrics.dir === 'rtl' || metrics.lang !== profile.language) {
        failures.push(
          `${label}: expected LTR lang="${profile.language}", got dir="${metrics.dir}" lang="${metrics.lang}"`,
        )
      }

      if (metrics.scrollWidth > metrics.clientWidth) {
        const culprits = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth
          const list = []
          for (const el of document.querySelectorAll('body *')) {
            const rect = el.getBoundingClientRect()
            if (rect.width === 0 && rect.height === 0) continue
            if (rect.right > vw + 0.5 || rect.left < -0.5) {
              const id = el.id ? `#${el.id}` : ''
              const cls =
                typeof el.className === 'string' && el.className.trim()
                  ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
                  : ''
              list.push(
                `${el.tagName.toLowerCase()}${id}${cls} (left=${rect.left.toFixed(1)}, right=${rect.right.toFixed(1)})`,
              )
              if (list.length >= 5) break
            }
          }
          return list
        })
        failures.push(
          `${label}: horizontal overflow scrollWidth=${metrics.scrollWidth} > clientWidth=${metrics.clientWidth}` +
            (culprits.length ? ` [${culprits.join('; ')}]` : ''),
        )
      }
    }

    await context.close()
  }
} finally {
  if (browser) {
    await browser.close()
  }
  await closeServer(server)
}

if (failures.length > 0) {
  console.error(`playwright-smoke: FAILED (${failures.length} issue(s) across ${checksRun} checks):`)
  for (const failure of failures) {
    console.error(`  - ${failure}`)
  }
  process.exit(1)
}

console.log(
  `playwright-smoke: OK (${checksRun} route-state checks across ${PROFILES.length} profiles × ${ROUTES.length} routes)`,
)
