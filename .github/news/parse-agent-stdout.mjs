#!/usr/bin/env node
/**
 * Extract a NewsDelta from Claude Code `--output-format json` stdout.
 *
 * A missing or non-JSON result is a hard failure — never default to `{items:[]}`.
 *
 *   node parse-agent-stdout.mjs <log-file>   # writes the delta JSON to stdout
 *   node parse-agent-stdout.mjs --self-test
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

function isPlainObject(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function stripFences(text) {
  const trimmed = text.trim()
  const match = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/i.exec(trimmed)
  return match ? match[1] : trimmed
}

// glm-5.3 (unlike glm-5.2) sometimes frames its JSON in prose — a preamble
// line before a ```json fence, or bare JSON after "Here is the delta:".
// Deterministic priority: (1) the LAST ```/```json fence whose content parses
// to a plain object — fences outrank bare objects regardless of position,
// because the delta lives in the fence; (2) the first-{ … last-} span if it
// parses to a plain object. Undefined when neither holds. Limitation: a
// non-json language tag (e.g. ```js) before the real fence can pair fence
// markers across blocks and defeat (1) — acceptable, because off-spec output
// then hard-fails loudly instead of recovering the wrong object.
function recoverJsonObject(text) {
  const fences = [...text.matchAll(/```(?:json)?\s*\r?\n([\s\S]*?)\r?\n?```/gi)]
  for (let i = fences.length - 1; i >= 0; i--) {
    try {
      const value = JSON.parse(fences[i][1])
      if (isPlainObject(value)) return value
    } catch {}
  }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end > start) {
    try {
      const value = JSON.parse(text.slice(start, end + 1))
      if (isPlainObject(value)) return value
    } catch {}
  }
  return undefined
}

/**
 * Parse the Claude JSON envelope, reject `is_error`, take `result`,
 * strip optional ```json fences, JSON.parse, and return the value — falling
 * back to deterministic recovery of the last fenced/plain JSON object when
 * the strict parse fails (glm-5.3 frames its JSON in prose).
 * Also accepts a raw `{ items }` object (model printed JSON without the wrapper).
 * Does not write files.
 *
 * @param {string} claudeStdout
 * @returns {unknown}
 */
export function extractDelta(claudeStdout) {
  if (typeof claudeStdout !== 'string' || claudeStdout.trim() === '') {
    throw new Error('missing agent stdout; refusing to invent {items:[]}')
  }

  let parsed
  try {
    parsed = JSON.parse(claudeStdout)
  } catch {
    throw new Error('agent stdout is not JSON')
  }

  if (!isPlainObject(parsed)) {
    throw new Error('agent stdout must be a JSON object')
  }

  if (parsed.is_error === true) {
    throw new Error('agent envelope is_error=true')
  }

  if (Object.prototype.hasOwnProperty.call(parsed, 'result')) {
    const result = parsed.result
    if (typeof result !== 'string') {
      throw new Error('agent envelope result must be a string')
    }
    const stripped = stripFences(result)
    if (stripped.trim() === '') {
      throw new Error('agent result is empty; refusing to invent {items:[]}')
    }
    try {
      return JSON.parse(stripped)
    } catch {
      const recovered = recoverJsonObject(result)
      if (recovered === undefined) throw new Error('agent result is not JSON')
      return recovered
    }
  }

  const keys = Object.keys(parsed)
  if (keys.length === 1 && keys[0] === 'items') {
    return parsed
  }

  throw new Error('unrecognized agent stdout')
}

function pass(label) {
  console.log(`self-test: ${label} ✓`)
}

function fail(label, detail) {
  console.error(`self-test: ${label} ✗${detail ? ` — ${detail}` : ''}`)
  process.exit(1)
}

function assertEqual(label, got, expected) {
  const gotJson = JSON.stringify(got)
  const expectedJson = JSON.stringify(expected)
  if (gotJson !== expectedJson) fail(label, `got ${gotJson}`)
  pass(label)
}

function assertThrows(label, fn) {
  try {
    fn()
  } catch {
    pass(label)
    return
  }
  fail(label, 'expected throw')
}

function selfTest() {
  assertEqual(
    'envelope empty items',
    extractDelta(JSON.stringify({ is_error: false, result: '{"items":[]}' })),
    { items: [] },
  )

  const fenced = '```json\n{"items":[{"id":"x"}]}\n```'
  assertEqual(
    'envelope fenced result',
    extractDelta(JSON.stringify({ is_error: false, result: fenced })),
    { items: [{ id: 'x' }] },
  )

  const proseFenced = 'Here is the delta for today:\n```json\n{"items":[{"id":"y"}]}\n```\nHope this helps.'
  assertEqual(
    'envelope prose + fenced result',
    extractDelta(JSON.stringify({ is_error: false, result: proseFenced })),
    { items: [{ id: 'y' }] },
  )

  assertEqual(
    'envelope prose + bare result',
    extractDelta(JSON.stringify({ is_error: false, result: 'Delta: {"items":[]}' })),
    { items: [] },
  )

  assertThrows('prose with broken json', () => {
    extractDelta(JSON.stringify({ is_error: false, result: 'Here: {"items": [broken}' }))
  })

  assertEqual(
    'stray prose object loses to fenced delta',
    extractDelta(
      JSON.stringify({
        is_error: false,
        result: 'Saw {"notes":"draft"} earlier.\n```json\n{"items":[{"id":"z"}]}\n```',
      }),
    ),
    { items: [{ id: 'z' }] },
  )

  assertEqual(
    'last object fence wins',
    extractDelta(
      JSON.stringify({
        is_error: false,
        result: '```json\n{"items":[{"id":"a"}]}\n```\nFinal:\n```json\n{"items":[{"id":"b"}]}\n```',
      }),
    ),
    { items: [{ id: 'b' }] },
  )

  assertEqual(
    'non-object last fence skipped, earlier object fence wins',
    extractDelta(
      JSON.stringify({
        is_error: false,
        result: '```json\n{"items":[{"id":"a"}]}\n```\nAlso:\n```\n[1,2]\n```',
      }),
    ),
    { items: [{ id: 'a' }] },
  )

  assertEqual(
    'fence outranks later bare object',
    extractDelta(
      JSON.stringify({
        is_error: false,
        result: '```json\n{"items":[{"id":"f"}]}\n```\nFinal: {"items":[{"id":"g"}]}',
      }),
    ),
    { items: [{ id: 'f' }] },
  )

  assertThrows('envelope is_error', () => {
    extractDelta(JSON.stringify({ is_error: true, result: '{"items":[]}' }))
  })

  assertEqual(
    'raw items envelope',
    extractDelta('{"items":[]}'),
    { items: [] },
  )

  assertThrows('empty string', () => {
    extractDelta('')
  })

  console.log('self-test OK: parse-agent-stdout')
}

function isDirectRun() {
  const entry = process.argv[1]
  if (!entry) return false
  try {
    return fileURLToPath(import.meta.url).toLowerCase() === resolve(entry).toLowerCase()
  } catch {
    return false
  }
}

if (isDirectRun()) {
  const arg = process.argv[2]
  if (arg === '--self-test') {
    selfTest()
  } else if (!arg) {
    console.error('usage: parse-agent-stdout.mjs <log-file> | --self-test')
    process.exit(2)
  } else {
    const delta = extractDelta(readFileSync(arg, 'utf8'))
    process.stdout.write(`${JSON.stringify(delta)}\n`)
  }
}
