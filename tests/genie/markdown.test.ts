import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseInlineTokens, tokenizeBidiNumbers, type InlineToken } from '@/lib/genie/markdown'

function linksIn(tokens: InlineToken[]): { href: string; external: boolean; label: string }[] {
  return tokens.flatMap((token) => {
    if (token.type === 'link') return [{ href: token.href, external: token.external, label: token.labelText }]
    if (token.type === 'bold' || token.type === 'italic') return linksIn(token.children)
    return []
  })
}

function plainText(tokens: InlineToken[]): string {
  return tokens
    .map((token) => {
      if (token.type === 'text') return token.segments.map((s) => s.text).join('')
      if (token.type === 'code') return token.text
      if (token.type === 'link') return token.labelText
      return plainText(token.children)
    })
    .join('')
}

describe('tokenizeBidiNumbers', () => {
  it('isolates ± intervals and signed deltas', () => {
    const segments = tokenizeBidiNumbers('AUROC 99.03% ± 0.07% (+6.5pp)')
    const bidi = segments.filter((s) => s.type === 'bidi').map((s) => s.text)
    assert.deepEqual(bidi, ['99.03% ± 0.07%', '+6.5pp'])
  })

  it('handles decimal commas and keeps identifiers and dates intact', () => {
    const segments = tokenizeBidiNumbers('99,03 % ± 0,07 % auf CIFAR-10 am 2026-09-07')
    assert.ok(segments.some((s) => s.type === 'bidi' && s.text === '99,03 % ± 0,07 %'))
    assert.ok(segments.some((s) => s.type === 'text' && s.text.includes('CIFAR-10') && s.text.includes('2026-09-07')))
  })

  it('never changes the text, only splits it', () => {
    for (const input of ['ما أفضل نتيجة AUROC؟ 99.03% ± 0.07%', 'no numbers here', '']) {
      assert.equal(tokenizeBidiNumbers(input).map((s) => s.text).join(''), input)
    }
  })
})

describe('parseInlineTokens links', () => {
  it('keeps allowlisted Markdown links and drops the rest to their label', () => {
    const tokens = parseInlineTokens('See [bad](https://evil.example/) and [good](/news/) and https://evil.example/bar')
    assert.deepEqual(linksIn(tokens), [{ href: '/news/', external: false, label: 'good' }])
    assert.equal(plainText(tokens), 'See bad and good and https://evil.example/bar')
  })

  it('links bare allowlisted domains and leaves trailing punctuation outside the link', () => {
    for (const mark of ['.', ',', ')', '،', '؟']) {
      const tokens = parseInlineTokens(`Code: github.com/ahmed-3m${mark}`)
      assert.deepEqual(linksIn(tokens), [
        { href: 'https://github.com/ahmed-3m', external: true, label: 'github.com/ahmed-3m' },
      ])
      assert.ok(plainText(tokens).endsWith(`github.com/ahmed-3m${mark}`), mark)
    }
  })

  it('does not link a domain that is only the end of a longer host', () => {
    assert.deepEqual(linksIn(parseInlineTokens('Visit notgithub.com/ahmed-3m today')), [])
  })

  it('links the public email address and nothing else', () => {
    assert.deepEqual(linksIn(parseInlineTokens('Email ahmed.mo.0595@gmail.com.')), [
      { href: 'mailto:ahmed.mo.0595@gmail.com', external: false, label: 'ahmed.mo.0595@gmail.com' },
    ])
    assert.deepEqual(linksIn(parseInlineTokens('Email someone@example.com.')), [])
  })

  it('links inside bold and italic text', () => {
    assert.deepEqual(linksIn(parseInlineTokens('**[CV](/cv.pdf)** and *[research](/research/)*')), [
      { href: '/cv.pdf', external: true, label: 'CV' },
      { href: '/research/', external: false, label: 'research' },
    ])
  })

  it('never links inside code spans', () => {
    const tokens = parseInlineTokens('Run `https://github.com/ahmed-3m` as text')
    assert.deepEqual(linksIn(tokens), [])
    assert.ok(tokens.some((t) => t.type === 'code' && t.text === 'https://github.com/ahmed-3m'))
  })

  it('rejects script and protocol-relative links written as Markdown', () => {
    const tokens = parseInlineTokens('[x](javascript:alert(1)) [y](//evil.example/)')
    assert.deepEqual(linksIn(tokens), [])
  })
})
