// Composes Genie's system prompt from the published prompt file (spec 007, data-model.md
// "Composed prompt", research R12). Plain JavaScript with no imports from `src/`. Since PR 4
// the site sends only entry IDs; tests/genie/prompt-baseline.test.ts pins the output.

export const MAX_ENTRIES = 4
const SLOT_RE = /\{\{(\w+)\}\}/g

/**
 * Fills every `{{slot}}` in one pass. A value is inserted as written (a function
 * replacement does not read `$&` and the like), so a value holding `{{…}}` is never
 * expanded. An unknown slot is an error.
 */
export function fillSlots(template, values) {
  return template.replace(SLOT_RE, (_match, name) => {
    if (!Object.hasOwn(values, name)) throw new Error(`No value for prompt slot {{${name}}}`)
    return values[name]
  })
}

/** Cuts a prompt over `maxChars` the way the site does: `maxChars - 10` characters and `…`. */
export function capPrompt(prompt, maxChars) {
  return prompt.length <= maxChars ? prompt : `${prompt.slice(0, maxChars - 10)}…`
}

/** Language, section and path, each replaced by its default when the file does not list it. */
export function resolveContext(file, { lang, section, pathname } = {}) {
  return {
    lang: typeof lang === 'string' && Object.hasOwn(file.languages, lang) ? lang : 'en',
    section: typeof section === 'string' && file.sections.includes(section) ? section : 'hero',
    pathname: typeof pathname === 'string' && file.paths.includes(pathname) ? pathname : '/',
  }
}

/**
 * The entries to use, in the order asked: unknown and repeated IDs are dropped and at
 * most four are kept. When none remain, the section's defaults are used.
 */
export function selectEntries(file, entryIds, section) {
  const byId = new Map(file.entries.map((entry) => [entry.id, entry]))
  const pick = (ids) => {
    const chosen = []
    for (const id of Array.isArray(ids) ? ids : []) {
      const entry = typeof id === 'string' ? byId.get(id) : undefined
      if (entry && !chosen.includes(entry)) chosen.push(entry)
      if (chosen.length === MAX_ENTRIES) break
    }
    return chosen
  }
  const chosen = pick(entryIds)
  return chosen.length ? chosen : pick(Object.hasOwn(file.defaults, section) ? file.defaults[section] : [])
}

/** The system prompt for one request. */
export function composePrompt(file, selection = {}) {
  const context = resolveContext(file, selection)
  const entries = selectEntries(file, selection.entryIds, context.section)
    .map((entry) => fillSlots(file.entryFormat, { title: entry.title, facts: entry.facts, links: entry.links.join(', ') }))
    .join('\n')
  const prompt = fillSlots(file.rules, {
    language: file.languages[context.lang],
    section: context.section,
    pathname: context.pathname,
    entries,
    links: file.links,
  })
  return capPrompt(prompt, file.maxChars)
}
