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
  '/blog/deterministic-guardrails-for-llm-and-agent-systems/',
  '/news/',
  '/case-studies/diffusion-ood/',
  '/case-studies/inkjet-ood/',
  '/case-studies/sihem/',
  '/impressum/',
  '/privacy/',
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
    name: 'mobile-light-en',
    viewport: { width: 375, height: 812 },
    theme: 'light',
    language: 'en',
  },
  {
    name: 'mobile-ar-rtl',
    viewport: { width: 375, height: 812 },
    theme: 'dark',
    language: 'ar',
  },
]

const FOOTER_LOCALES = ['en', 'de', 'fr', 'es', 'ar']

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

async function attachHermeticRouting(page, origin) {
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
}

function attachErrorCollectors(page) {
  const pageErrors = []
  const consoleErrors = []
  page.on('pageerror', (err) => {
    pageErrors.push(err instanceof Error ? err.message : String(err))
  })
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })
  return {
    pageErrors,
    consoleErrors,
    reset() {
      pageErrors.length = 0
      consoleErrors.length = 0
    },
  }
}

async function waitForSettledLayout(page) {
  // Allow fonts and post-hydration useEffect / useLayoutEffect hooks (language/theme/view sync) to settle.
  await page.evaluate(
    () =>
      Promise.resolve(document.fonts?.ready)
        .catch(() => {})
        .then(
          () =>
            new Promise((resolve) => {
              requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
            }),
        ),
  )
}

async function checkFeaturedResearchChartCentering(page, label, failures) {
  const result = await page.evaluate(() => {
    const container = document.querySelector('.cd-research-featured')
    if (!container) return { ok: false, reason: 'missing .cd-research-featured' }
    const chart = container.querySelector('.portfolio-charts-featured')
    if (!chart) return { ok: false, reason: 'missing .portfolio-charts-featured inside .cd-research-featured' }
    const containerRect = container.getBoundingClientRect()
    const chartRect = chart.getBoundingClientRect()
    if (containerRect.width <= 0 || chartRect.width <= 0 || chartRect.height <= 0) {
      return {
        ok: false,
        reason: `zero-sized rect (containerWidth=${containerRect.width.toFixed(1)}, chart=${chartRect.width.toFixed(1)}x${chartRect.height.toFixed(1)})`,
      }
    }
    const containerCenter = (containerRect.left + containerRect.right) / 2
    const chartCenter = (chartRect.left + chartRect.right) / 2
    const delta = Math.abs(chartCenter - containerCenter)
    return { ok: delta <= 2, delta, chartCenter, containerCenter }
  })

  if (!result.ok) {
    failures.push(
      `${label}: featured research chart centering failed: ${
        result.reason ??
        `|chartCenter - containerCenter|=${result.delta.toFixed(2)}px > 2px (chart=${result.chartCenter.toFixed(1)}, container=${result.containerCenter.toFixed(1)})`
      }`,
    )
  }
}

async function runDesktopFooterChecks(browser, origin, failures) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  })

  await context.addInitScript(() => {
    try {
      window.localStorage.setItem('theme', 'dark')
      if (!window.localStorage.getItem('language')) {
        window.localStorage.setItem('language', 'en')
      }
    } catch {
      // Ignore storage errors on non-http initial about:blank.
    }
  })

  const page = await context.newPage()
  await attachHermeticRouting(page, origin)
  const errors = attachErrorCollectors(page)
  let executed = 0

  try {
    for (const locale of FOOTER_LOCALES) {
      executed += 1
      errors.reset()
      const label = `[desktop-footer-1440-${locale}] /`

      if (page.url().startsWith(origin)) {
        await page.evaluate((loc) => {
          window.localStorage.setItem('theme', 'dark')
          window.localStorage.setItem('language', loc)
        }, locale)
      }

      const response = await page.goto(`${origin}/`, {
        waitUntil: 'load',
        timeout: 20_000,
      })
      if (!response || response.status() !== 200) {
        failures.push(`${label}: expected HTTP 200, received ${response?.status() ?? 'no response'}`)
        continue
      }

      await waitForSettledLayout(page)

      if (errors.pageErrors.length > 0) {
        failures.push(`${label}: pageerror(s): ${errors.pageErrors.join(' | ')}`)
      }
      if (errors.consoleErrors.length > 0) {
        failures.push(`${label}: console.error(s): ${errors.consoleErrors.join(' | ')}`)
      }

      const footer = await page.evaluate((expectedLocale) => {
        const docEl = document.documentElement
        const expectedDir = expectedLocale === 'ar' ? 'rtl' : 'ltr'
        const nav = document.querySelector('.cd-footer-nav')
        const links = nav ? Array.from(nav.querySelectorAll('.cd-footer-link')) : []
        const tops = links.map((el) => el.getBoundingClientRect().top)
        const navSpread = tops.length > 0 ? Math.max(...tops) - Math.min(...tops) : null

        const meta = document.querySelector('.cd-footer-meta')
        let metaRectCount = null
        let metaHeight = null
        if (meta) {
          const range = document.createRange()
          range.selectNodeContents(meta)
          metaRectCount = range.getClientRects().length
          metaHeight = meta.getBoundingClientRect().height
        }

        return {
          lang: docEl.lang,
          dir: docEl.dir,
          expectedDir,
          hasNav: Boolean(nav),
          linkCount: links.length,
          navSpread,
          hasMeta: Boolean(meta),
          metaRectCount,
          metaHeight,
        }
      }, locale)

      if (footer.lang !== locale || footer.dir !== footer.expectedDir) {
        failures.push(
          `${label}: expected html[lang="${locale}"][dir="${footer.expectedDir}"], got lang="${footer.lang}" dir="${footer.dir}"`,
        )
      }
      if (!footer.hasNav || footer.linkCount === 0) {
        failures.push(`${label}: missing .cd-footer-nav or .cd-footer-link elements`)
      } else if (footer.navSpread > 4) {
        failures.push(
          `${label}: .cd-footer-nav wrapped across multiple rows (top spread=${footer.navSpread.toFixed(1)}px > 4px)`,
        )
      }
      if (!footer.hasMeta) {
        failures.push(`${label}: missing .cd-footer-meta`)
      } else if (
        footer.metaHeight <= 0 ||
        (footer.metaRectCount !== 1 && footer.metaHeight > 24)
      ) {
        failures.push(
          `${label}: .cd-footer-meta wrapped or empty (clientRects=${footer.metaRectCount}, height=${footer.metaHeight.toFixed(1)}px)`,
        )
      }
    }
  } finally {
    await context.close()
  }

  return executed
}

function recordCollectedErrors(errors, label, failures) {
  if (errors.pageErrors.length > 0) {
    failures.push(`${label}: pageerror(s): ${errors.pageErrors.join(' | ')}`)
  }
  if (errors.consoleErrors.length > 0) {
    failures.push(`${label}: console.error(s): ${errors.consoleErrors.join(' | ')}`)
  }
}

async function createHermeticDesktopPage(browser, origin, { theme, language }) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'reduce',
  })

  await context.addInitScript(
    ({ initialTheme, initialLanguage }) => {
      try {
        window.localStorage.setItem('theme', initialTheme)
        window.localStorage.setItem('language', initialLanguage)
      } catch {
        // Ignore storage errors on non-http initial about:blank.
      }
    },
    { initialTheme: theme, initialLanguage: language },
  )

  const page = await context.newPage()
  await attachHermeticRouting(page, origin)
  const errors = attachErrorCollectors(page)
  return { context, page, errors }
}

async function runInteractiveSmokeChecks(browser, origin, failures) {
  let executed = 0

  // 1) Genie interactive AR flow on `/` (ar, dark, desktop 1280x800).
  {
    const label = '[interactive-genie-ar] /'
    executed += 1
    const { context, page, errors } = await createHermeticDesktopPage(browser, origin, {
      theme: 'dark',
      language: 'ar',
    })

    try {
      errors.reset()
      const response = await page.goto(`${origin}/`, {
        waitUntil: 'load',
        timeout: 20_000,
      })
      if (!response || response.status() !== 200) {
        failures.push(`${label}: expected HTTP 200, received ${response?.status() ?? 'no response'}`)
      } else {
        await waitForSettledLayout(page)
        await page.locator('button[aria-controls="chatbot-dialog"]').click()

        const formInput = page.locator('#ahmed-chatbot-panel form input').first()
        await formInput.waitFor({ state: 'visible', timeout: 10_000 })
        await formInput.fill('ما أفضل نتيجة AUROC؟')
        await formInput.press('Enter')

        await page.waitForFunction(
          () => {
            const log = document.querySelector('#ahmed-chatbot-panel [role="log"]')
            if (!log) return false
            const hasBdiPlusMinus = Array.from(log.querySelectorAll('bdi[dir="ltr"]')).some((el) =>
              (el.textContent ?? '').includes('±'),
            )
            if (!hasBdiPlusMinus) return false
            return Array.from(log.children).some((entry) => {
              const text = entry.textContent ?? ''
              return text.includes('±') && Boolean(entry.querySelector('bdi[dir="ltr"]'))
            })
          },
          null,
          { timeout: 10_000 },
        )

        await page.keyboard.press('Escape')
        await page.waitForFunction(
          () => document.querySelector('#chatbot-dialog')?.getAttribute('aria-hidden') === 'true',
          null,
          { timeout: 5_000 },
        )
      }
      recordCollectedErrors(errors, label, failures)
    } catch (err) {
      failures.push(`${label}: ${err instanceof Error ? err.message : String(err)}`)
      recordCollectedErrors(errors, label, failures)
    } finally {
      await context.close()
    }
  }

  // 2–4) Desktop EN dark interactive flows (`MergeproofDemo`, `SihemWalkthrough`, `OodDemo`).
  const { context, page, errors } = await createHermeticDesktopPage(browser, origin, {
    theme: 'dark',
    language: 'en',
  })

  try {
    // 2) MergeproofDemo flow on `/` (en, dark, desktop 1280x800).
    {
      const label = '[interactive-mergeproof-en] /'
      executed += 1
      errors.reset()

      try {
        const response = await page.goto(`${origin}/`, {
          waitUntil: 'load',
          timeout: 20_000,
        })
        if (!response || response.status() !== 200) {
          failures.push(`${label}: expected HTTP 200, received ${response?.status() ?? 'no response'}`)
        } else {
          await waitForSettledLayout(page)
          await page.locator('.stage-oss-try-btn').click()

          const dialog = page.locator('dialog.mp-dialog[open], [role="dialog"]:has(.mp-demo)').first()
          await dialog.waitFor({ state: 'visible', timeout: 5_000 })

          const demo = dialog.locator('.mp-demo').first()
          await demo.waitFor({ state: 'visible', timeout: 5_000 })

          const scenarioBtns = demo.locator('[role="tablist"] [role="tab"], .mp-scenario-btn')
          const btnCount = await scenarioBtns.count()
          if (btnCount < 2) {
            failures.push(`${label}: expected at least 2 Mergeproof scenario buttons, got ${btnCount}`)
          } else {
            const panel = demo.locator('[role="tabpanel"], .mp-panel').first()
            const beforeText = await panel.innerText()
            await scenarioBtns.nth(1).click()

            await page.waitForFunction(
              (prev) => {
                const dlg = document.querySelector('dialog.mp-dialog[open], [role="dialog"] .mp-demo')
                const activePanel = dlg?.querySelector('[role="tabpanel"], .mp-panel')
                if (!activePanel) return false
                return activePanel.innerText.trim() !== prev.trim()
              },
              beforeText,
              { timeout: 5_000 },
            )
          }

          await page.keyboard.press('Escape')
        }
        recordCollectedErrors(errors, label, failures)
      } catch (err) {
        failures.push(`${label}: ${err instanceof Error ? err.message : String(err)}`)
        recordCollectedErrors(errors, label, failures)
      }
    }

    // 3) SihemWalkthrough flow on `/case-studies/sihem/` (en, dark, desktop 1280x800).
    {
      const label = '[interactive-sihem-en] /case-studies/sihem/'
      executed += 1
      errors.reset()

      try {
        const response = await page.goto(`${origin}/case-studies/sihem/`, {
          waitUntil: 'load',
          timeout: 20_000,
        })
        if (!response || response.status() !== 200) {
          failures.push(`${label}: expected HTTP 200, received ${response?.status() ?? 'no response'}`)
        } else {
          await waitForSettledLayout(page)
          const walkthrough = page.locator('#walkthrough, .sihem-wt-section').first()
          const tabs = walkthrough.locator('[role="tablist"] [role="tab"]')
          const tabCount = await tabs.count()
          if (tabCount < 2) {
            failures.push(`${label}: expected at least 2 walkthrough tabs, got ${tabCount}`)
          } else {
            const secondTab = tabs.nth(1)
            await secondTab.click()

            const selected = await secondTab.getAttribute('aria-selected')
            if (selected !== 'true') {
              failures.push(`${label}: expected 2nd tab aria-selected="true", got "${selected}"`)
            }

            const activePanel = walkthrough.locator('[role="tabpanel"]:not([hidden])').first()
            await activePanel.waitFor({ state: 'visible', timeout: 5_000 })
            const panelText = await activePanel.innerText()
            if (!panelText.includes('0 LLM calls')) {
              failures.push(`${label}: expected quiet-hours panel to include "0 LLM calls"`)
            }
          }
        }
        recordCollectedErrors(errors, label, failures)
      } catch (err) {
        failures.push(`${label}: ${err instanceof Error ? err.message : String(err)}`)
        recordCollectedErrors(errors, label, failures)
      }
    }

    // 4) OodDemo flow on `/research/` (en, dark, desktop 1280x800).
    {
      const label = '[interactive-ood-en] /research/'
      executed += 1
      errors.reset()

      try {
        const response = await page.goto(`${origin}/research/`, {
          waitUntil: 'load',
          timeout: 20_000,
        })
        if (!response || response.status() !== 200) {
          failures.push(`${label}: expected HTTP 200, received ${response?.status() ?? 'no response'}`)
        } else {
          await waitForSettledLayout(page)
          const explorer = page.locator('#ood-explorer, .ood-demo').first()
          await explorer.scrollIntoViewIfNeeded()

          const slider = explorer.locator('input[type="range"]').first()
          try {
            await slider.waitFor({ state: 'visible', timeout: 3_000 })
          } catch {
            const loadBtn = explorer.locator('button').first()
            if (await loadBtn.isVisible()) {
              await loadBtn.click()
            }
            await slider.waitFor({ state: 'visible', timeout: 5_000 })
          }

          const extractFpr = (text) => text.match(/FPR\s*=\s*([0-9]+(?:\.[0-9]+)?%)/)?.[1] ?? null
          const beforeText = await explorer.innerText()
          const beforeVal = await slider.inputValue()
          const beforeFpr = extractFpr(beforeText)
          await slider.focus()
          await page.keyboard.press('PageDown')

          await page.waitForFunction(
            ({ prevVal, prevFpr }) => {
              const root = document.querySelector('#ood-explorer, .ood-demo')
              const range = root?.querySelector('input[type="range"]')
              if (!root || !(root instanceof HTMLElement) || !(range instanceof HTMLInputElement)) {
                return false
              }
              const nextFpr = root.innerText.match(/FPR\s*=\s*([0-9]+(?:\.[0-9]+)?%)/)?.[1] ?? null
              return range.value !== prevVal && nextFpr !== null && nextFpr !== prevFpr
            },
            { prevVal: beforeVal, prevFpr: beforeFpr },
            { timeout: 5_000 },
          )

          const afterText = await explorer.innerText()
          const afterFpr = extractFpr(afterText)
          if (!beforeFpr || !afterFpr || afterFpr === beforeFpr) {
            failures.push(
              `${label}: expected threshold-dependent FPR diagnostic to change (before=${beforeFpr}, after=${afterFpr})`,
            )
          }
        }
        recordCollectedErrors(errors, label, failures)
      } catch (err) {
        failures.push(`${label}: ${err instanceof Error ? err.message : String(err)}`)
        recordCollectedErrors(errors, label, failures)
      }
    }
  } finally {
    await context.close()
  }

  return executed
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
  browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHROMIUM_CHANNEL } : {}) })

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
    await attachHermeticRouting(page, origin)
    const errors = attachErrorCollectors(page)

    for (const routePath of ROUTES) {
      checksRun += 1
      errors.reset()
      const label = `[${profile.name}] ${routePath}`

      const response = await page.goto(`${origin}${routePath}`, {
        waitUntil: 'load',
        timeout: 20_000,
      })

      if (!response || response.status() !== 200) {
        failures.push(`${label}: expected HTTP 200, received ${response?.status() ?? 'no response'}`)
        continue
      }

      await waitForSettledLayout(page)

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

      if (errors.pageErrors.length > 0) {
        failures.push(`${label}: pageerror(s): ${errors.pageErrors.join(' | ')}`)
      }
      if (errors.consoleErrors.length > 0) {
        failures.push(`${label}: console.error(s): ${errors.consoleErrors.join(' | ')}`)
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

      if (profile.name === 'desktop-dark-en' && routePath === '/research/') {
        checksRun += 1
        await checkFeaturedResearchChartCentering(page, label, failures)
      }
    }

    await context.close()
  }

  checksRun += await runDesktopFooterChecks(browser, origin, failures)
  checksRun += await runInteractiveSmokeChecks(browser, origin, failures)
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
  `playwright-smoke: OK (${checksRun} checks: ${PROFILES.length} profiles × ${ROUTES.length} routes + ${FOOTER_LOCALES.length} desktop footer locales + /research/ chart centering + 4 interactive flows)`,
)
