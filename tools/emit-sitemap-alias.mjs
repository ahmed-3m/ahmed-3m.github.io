// Emits out/sitemap-pages.xml — a byte-identical copy of the exported
// out/sitemap.xml served at a second URL.
//
// Why: Search Console has held /sitemap.xml in a "Couldn't fetch" null state
// (never read, Type "Unknown") since well before the file was healthy, and
// resubmitting the same URL reuses that stuck record. Submitting a URL Google
// has no prior record of forces a fresh fetch. The copy is generated at build
// time, so it can never drift from the real sitemap.
//
// Both URLs are listed in robots.txt and checked by site-health.yml.

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const outDir = path.resolve(import.meta.dirname, '..', 'out')
const source = path.join(outDir, 'sitemap.xml')
const alias = path.join(outDir, 'sitemap-pages.xml')

let xml
try {
  xml = await readFile(source, 'utf8')
} catch (cause) {
  throw new Error(
    `Expected ${source} after \`next build\`. If the sitemap route moved or the ` +
      `export layout changed, update this script — a missing alias silently ` +
      `breaks the Search Console workaround.`,
    { cause },
  )
}

if (!xml.includes('<urlset')) {
  throw new Error(`${source} is not a <urlset> sitemap — refusing to copy it.`)
}

await writeFile(alias, xml, 'utf8')
console.log(
  `sitemap alias: wrote ${path.basename(alias)} (${xml.length} bytes, ` +
    `${(xml.match(/<loc>/g) ?? []).length} URLs)`,
)
