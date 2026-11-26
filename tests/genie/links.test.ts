import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { CALENDLY_URL } from '@/lib/booking'
import * as links from '@/lib/genie/links'

const { formatLocaleNumber, linkKey, publicLinks, resolveLinkProps } = links

describe('publicLinks allowlist', () => {
  it('contains every exported *_URL constant', () => {
    const exported = Object.entries(links).filter(
      ([name, value]) => name.endsWith('_URL') && typeof value === 'string',
    )
    assert.ok(exported.length >= 25, `only ${exported.length} *_URL exports found`)
    for (const [name, href] of exported) {
      assert.ok(publicLinks.has(linkKey(new URL(href as string))), `${name} (${href}) is not allowlisted`)
    }
  })

  it('treats a trailing slash as the same link', () => {
    assert.equal(linkKey(new URL('https://ahmed-3m.github.io/about')), linkKey(new URL('https://ahmed-3m.github.io/about/')))
  })
})

describe('resolveLinkProps', () => {
  it('turns same-site links into relative paths that open in the same tab', () => {
    assert.deepEqual(resolveLinkProps('/news/'), { href: '/news/', external: false })
    assert.deepEqual(resolveLinkProps('https://ahmed-3m.github.io/research/'), { href: '/research/', external: false })
    assert.deepEqual(resolveLinkProps('/about'), { href: '/about/', external: false })
    assert.deepEqual(resolveLinkProps('/blog/deterministic-guardrails-for-llm-and-agent-systems/'), {
      href: '/blog/deterministic-guardrails-for-llm-and-agent-systems/',
      external: false,
    })
  })

  it('keeps the query and fragment of allowlisted deep links', () => {
    assert.deepEqual(resolveLinkProps('/?view=full#mergeproof-playground'), {
      href: '/?view=full#mergeproof-playground',
      external: false,
    })
    assert.deepEqual(resolveLinkProps('/research/#separation-loss'), {
      href: '/research/#separation-loss',
      external: false,
    })
  })

  it('opens PDFs and external sites in a new tab', () => {
    assert.deepEqual(resolveLinkProps('/cv.pdf'), { href: '/cv.pdf', external: true })
    assert.deepEqual(resolveLinkProps('https://github.com/ahmed-3m/mergeproof'), {
      href: 'https://github.com/ahmed-3m/mergeproof',
      external: true,
    })
    assert.deepEqual(resolveLinkProps(CALENDLY_URL), { href: CALENDLY_URL, external: true })
  })

  it('allows only the public contact email', () => {
    assert.deepEqual(resolveLinkProps('mailto:ahmed.mo.0595@gmail.com'), {
      href: 'mailto:ahmed.mo.0595@gmail.com',
      external: false,
    })
    assert.equal(resolveLinkProps('mailto:ahmed.mu.0905@gmail.com'), null)
    assert.equal(resolveLinkProps('mailto:someone@example.com'), null)
  })

  it('rejects anything not on the allowlist', () => {
    for (const href of [
      'https://evil.example/',
      '//evil.example/',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      '/not-a-page/',
      '/about/?utm_source=x',
      'https://github.com/someone-else',
      'https://ahmed-3m.github.io.evil.example/',
    ]) {
      assert.equal(resolveLinkProps(href), null, href)
    }
  })
})

describe('formatLocaleNumber', () => {
  it('uses decimal commas and a spaced percent sign in German and French', () => {
    assert.equal(formatLocaleNumber('99.03% ± 0.07%', 'de'), '99,03 % ± 0,07 %')
    assert.equal(formatLocaleNumber('0.8673 ± 0.0230', 'fr'), '0,8673 ± 0,0230')
  })

  it('leaves other languages unchanged', () => {
    for (const lang of ['en', 'es', 'ar'] as const) {
      assert.equal(formatLocaleNumber('99.03% ± 0.07%', lang), '99.03% ± 0.07%')
    }
  })
})
