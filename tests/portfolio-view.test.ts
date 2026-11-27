import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildHomeHref, isHomePathname, resolvePortfolioView } from '@/lib/portfolio-view-logic'

describe('portfolio-view navigation persistence', () => {
  it('identifies the home pathname with or without trailing slash', () => {
    assert.equal(isHomePathname('/'), true)
    assert.equal(isHomePathname(''), true)
    assert.equal(isHomePathname('/news/'), false)
    assert.equal(isHomePathname('/blog'), false)
  })

  it('defaults to concise on a fresh homepage visit', () => {
    assert.equal(
      resolvePortfolioView({ pathname: '/', search: '', storedView: null }),
      'concise',
    )
  })

  it('honors explicit ?view=full and ?view=concise query params', () => {
    assert.equal(
      resolvePortfolioView({ pathname: '/', search: '?view=full', storedView: null }),
      'full',
    )
    assert.equal(
      resolvePortfolioView({ pathname: '/', search: '?view=concise', storedView: 'full' }),
      'concise',
    )
  })

  it('keeps full view when navigating from /?view=full to /news/ and back', () => {
    const onNews = resolvePortfolioView({
      pathname: '/news/',
      search: '',
      storedView: 'full',
      fallbackView: 'full',
    })
    assert.equal(onNews, 'full')

    const backHome = resolvePortfolioView({
      pathname: '/',
      search: '',
      storedView: 'full',
      fallbackView: onNews,
    })
    assert.equal(backHome, 'full')
  })

  it('honors an explicit history-entry portfolioView when stepping back in history', () => {
    assert.equal(
      resolvePortfolioView({
        pathname: '/',
        search: '',
        historyView: 'concise',
        storedView: 'full',
      }),
      'concise',
    )
    assert.equal(
      resolvePortfolioView({
        pathname: '/',
        search: '',
        historyView: 'full',
        storedView: null,
      }),
      'full',
    )
  })

  it('builds canonical concise and full homepage hrefs with optional hashes', () => {
    assert.equal(buildHomeHref('concise'), '/')
    assert.equal(buildHomeHref('concise', '#projects'), '/#projects')
    assert.equal(buildHomeHref('full'), '/?view=full')
    assert.equal(buildHomeHref('full', '#projects'), '/?view=full#projects')
    assert.equal(buildHomeHref('full', 'news'), '/?view=full#news')
  })

  it('restores concise on browser Back from /?view=full when initial / entry recorded concise', () => {
    // 1. Fresh visit on `/` resolves concise and stamps historyView: 'concise'
    const initial = resolvePortfolioView({ pathname: '/', search: '', storedView: null })
    assert.equal(initial, 'concise')

    // 2. Switching to Full pushes `/?view=full` and stores `'full'` in sessionStorage
    const full = resolvePortfolioView({
      pathname: '/',
      search: '?view=full',
      historyView: 'full',
      storedView: 'full',
    })
    assert.equal(full, 'full')

    // 3. Browser Back pops to `/` with stamped historyView: 'concise' while sessionStorage still had `'full'`
    const afterBack = resolvePortfolioView({
      pathname: '/',
      search: '',
      historyView: initial,
      storedView: 'full',
      fallbackView: full,
    })
    assert.equal(afterBack, 'concise')
  })
})
