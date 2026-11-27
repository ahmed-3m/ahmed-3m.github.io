// Resolve hook for `npm test` (node --test). Node runs the TypeScript sources directly
// (type stripping), but it does not know the `@/` alias from tsconfig.json or the
// extensionless relative imports the bundler accepts. This maps both to `.ts` files, and
// an `@/` folder import (`@/lib/claims`) to its `index.ts`.
// Loaded with `node --import ./tools/test-hooks.mjs`; it adds no dependency.

import { existsSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { fileURLToPath } from 'node:url'

const srcRoot = new URL('../src/', import.meta.url)
const HAS_EXTENSION = /\.[a-z0-9]+$/i

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const rel = specifier.slice(2)
      if (HAS_EXTENSION.test(rel)) return nextResolve(new URL(rel, srcRoot).href, context)
      const file = new URL(`${rel}.ts`, srcRoot)
      const index = new URL(`${rel}/index.ts`, srcRoot)
      const target = !existsSync(fileURLToPath(file)) && existsSync(fileURLToPath(index)) ? index : file
      return nextResolve(target.href, context)
    }
    if ((specifier.startsWith('./') || specifier.startsWith('../')) && !HAS_EXTENSION.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context)
    }
    return nextResolve(specifier, context)
  },
})
