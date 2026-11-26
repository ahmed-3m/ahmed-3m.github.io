// Resolve hook for `npm test` (node --test). Node runs the TypeScript sources directly
// (type stripping), but it does not know the `@/` alias from tsconfig.json or the
// extensionless relative imports the bundler accepts. This maps both to `.ts` files.
// Loaded with `node --import ./tools/test-hooks.mjs`; it adds no dependency.

import { registerHooks } from 'node:module'

const srcRoot = new URL('../src/', import.meta.url)
const HAS_EXTENSION = /\.[a-z0-9]+$/i

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const rel = specifier.slice(2)
      return nextResolve(new URL(HAS_EXTENSION.test(rel) ? rel : `${rel}.ts`, srcRoot).href, context)
    }
    if ((specifier.startsWith('./') || specifier.startsWith('../')) && !HAS_EXTENSION.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context)
    }
    return nextResolve(specifier, context)
  },
})
