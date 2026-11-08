import type { Metadata } from 'next'

/**
 * Canonical Open Graph image descriptor for the site. The literal
 * `{ url: '/og-image.png', width: 1200, height: 630 }` must not be copied
 * per-route — page-level `openGraph` objects replace the layout's wholesale,
 * so every route that defines its own needs this same image.
 * Pass `image` for surfaces with a bespoke card (see
 * tools/generate-og-images.mjs for the committed assets).
 */
export function ogImage(alt: string, image = '/og-image.png'): NonNullable<NonNullable<Metadata['openGraph']>['images']> {
  return [{ url: image, width: 1200, height: 630, alt }]
}
