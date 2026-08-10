#!/usr/bin/env node
/**
 * Classifies a FAILED news-agent attempt from its combined stdout+stderr log,
 * so news-update.yml can tell a terminal credential problem from transient
 * capacity pressure — and can name the right secret when it is a credential
 * problem.
 *
 * Prints exactly one class:
 *   model-auth  the model API (BigModel) rejected the credentials -> BIGMODEL_NEWS_TOKEN
 *   exa-auth    the Exa research MCP rejected its key             -> EXA_API_KEY
 *   other       no credential signal; treat as transient and fall to the next tier
 *
 * The exit code is 0 for every classification and non-zero ONLY if this script
 * itself cannot run. The caller reads stdout, so a crash here degrades to the
 * generic retry-the-next-tier path rather than inventing a cause — which is the
 * failure mode this classifier exists to prevent.
 *
 * Self-test: `node classify-agent-failure.mjs --self-test` pins both boundaries
 * (auth vs transient, and BigModel vs Exa) with no network access. Wired into
 * CI *before* the agent step, since that is the step that consumes the verdict.
 */

import { readFileSync } from 'node:fs'

// Deliberately narrow. The log embeds third-party article text fetched through
// Exa, where a bare "401" or "unauthorized" occurs entirely innocently
// ("401(k)", "unauthorized scraping", "$1,401 million"). A false positive here
// reproduces the exact bug this step was added to fix — a confident, wrong
// cause — while a false negative merely falls back to the tier loop. So every
// marker below requires auth-error framing, not just the digits 401.
const AUTH_MARKERS = [
  /not logged in/i, // Claude Code, missing or blank ANTHROPIC_AUTH_TOKEN
  /run \/login/i, // Claude Code's remediation hint
  /invalid api[ _-]?key/i,
  /invalid_api_key/i,
  /authentication_error/i, // Anthropic-format error type
  /authentication failed/i,
  /401 unauthorized/i,
  /unauthorized[^a-z0-9]{0,3}401/i,
  /(http|status|code)[^0-9a-z]{0,4}401/i, // "HTTP 401", "status: 401", "code":"401"
]

// Attribution: only the Exa MCP's own failures are tagged with exa/mcp. A
// rejected model key surfaces before any tool call, on lines that never mention
// Exa — so an auth marker co-located with an Exa tag is Exa's, not the model's.
const EXA_MARKER = /\bexa\b|mcp__exa|mcp server/i

const classify = (log) => {
  const authLines = log.split(/\r?\n/).filter((line) => AUTH_MARKERS.some((re) => re.test(line)))
  if (authLines.length === 0) return 'other'
  return authLines.some((line) => EXA_MARKER.test(line)) ? 'exa-auth' : 'model-auth'
}

// --- Self-test (runs only with --self-test, never on the production path) ---
const CASES = [
  // Terminal: the model API rejected the credentials.
  ['Not logged in · Please run /login', 'model-auth'], // run #23's actual output
  ['API Error: 401 Unauthorized', 'model-auth'],
  ['{"error":{"type":"authentication_error","message":"invalid api key"}}', 'model-auth'],
  ['{"error":{"code":"401","message":"token expired or incorrect"}}', 'model-auth'],
  ['API Error: 403 authentication failed', 'model-auth'],

  // Terminal: the Exa MCP rejected its key. Must NOT blame BIGMODEL_NEWS_TOKEN.
  ['mcp__exa search failed: Exa API returned 401 Unauthorized', 'exa-auth'],
  ['exa: request rejected — invalid API key', 'exa-auth'],
  ['MCP server "exa" failed: HTTP 401', 'exa-auth'],

  // Transient: must keep falling through the model tiers.
  ['API Error: 529 service is overloaded, please retry', 'other'],
  ['Error: Claude Code exceeded --max-turns 60', 'other'],
  ['', 'other'],

  // Article text pulled in by Exa must never read as a credential failure.
  ['Exa result: "How AI is reshaping 401(k) retirement planning"', 'other'],
  ['Exa result: "Publishers sue over unauthorized scraping of news sites"', 'other'],
  ['Exa result: "Revenue climbed to $1,401 million on AI demand"', 'other'],
  ['Exa result: "Section 401 of the EU AI Act"', 'other'],

  // A transient failure whose log also happens to carry such text.
  [
    ['Exa result: "AI and your 401(k)"', 'unauthorized use of copyrighted data', 'API Error: 529 overloaded'].join(
      '\n',
    ),
    'other',
  ],

  // A real auth failure buried in a log that also carries article text.
  [['Exa result: "AI and your 401(k)"', 'Not logged in · Please run /login'].join('\n'), 'model-auth'],
]

function selfTest() {
  let failed = false
  for (const [log, expected] of CASES) {
    const got = classify(log)
    const ok = got === expected
    if (!ok) failed = true
    const excerpt = log.length > 64 ? `${log.slice(0, 64)}…` : log
    console.log(
      `self-test: ${JSON.stringify(excerpt)} -> ${got} (expected ${expected}) ${ok ? '✓' : '✗'}`,
    )
  }

  if (failed) {
    console.error('self-test FAILED: failure classification drifted from the documented policy.')
    process.exit(1)
  }
  console.log(
    `\nself-test OK: all ${CASES.length} cases match the documented policy.`,
  )
}

const arg = process.argv[2]
if (arg === '--self-test') {
  selfTest()
} else if (!arg) {
  console.error('usage: classify-agent-failure.mjs <log-file> | --self-test')
  process.exit(2)
} else {
  console.log(classify(readFileSync(arg, 'utf8')))
}
