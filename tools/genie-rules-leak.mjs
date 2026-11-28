// Spec 007 FR-019 / SC-006 (research R13): the site's JavaScript must not hold Genie's rules.
// The rules live only in the published prompt file (`out/genie/prompt.json`) and the Worker.
// Entry facts are not checked: the site's retriever scores questions against them, so they
// are in the bundle by design.

/** Sentences of at least this many characters are checked. */
export const MIN_SENTENCE_CHARS = 40

/** The rule sentences of the prompt file's rules template, with slot lines dropped. */
export function ruleSentences(rules) {
  const sentences = []
  for (const line of rules.split('\n')) {
    for (const sentence of line.split(/(?<=[.!?])\s+/)) {
      const text = sentence.trim()
      if (text.length >= MIN_SENTENCE_CHARS) sentences.push(text)
    }
  }
  return sentences
}

/** The ways a minifier may write one sentence inside a JavaScript string. */
function spellings(sentence) {
  const json = JSON.stringify(sentence).slice(1, -1)
  const ascii = json.replace(/[^\x20-\x7e]/g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`)
  return [...new Set([sentence, json, ascii, ascii.replace(/\\u([0-9a-f]{4})/g, (_m, hex) => `\\u${hex.toUpperCase()}`)])]
}

/**
 * The sentences found in each file. `files` is a list of `{ name, content }`. Returns
 * `[{ name, found: string[] }]` for files that hold at least one sentence.
 */
export function findRuleLeaks(sentences, files) {
  const forms = sentences.map((sentence) => ({ sentence, spellings: spellings(sentence) }))
  const leaks = []
  for (const { name, content } of files) {
    const found = forms.filter((form) => form.spellings.some((text) => content.includes(text))).map((form) => form.sentence)
    if (found.length > 0) leaks.push({ name, found })
  }
  return leaks
}
