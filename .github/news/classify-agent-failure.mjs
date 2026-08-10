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
// marker below requires auth-error framing, not just the digits 401, and every
// numeric marker requires a non-digit boundary so "Error: 4013 tokens" is not
// read as a 401.
const AUTH_MARKERS = [
  /not logged in/i, // Claude Code, missing or blank ANTHROPIC_AUTH_TOKEN
  /run \/login/i, // Claude Code's remediation hint
  /invalid api[ _-]?key/i,
  /invalid_api_key/i,
  /authentication_error/i, // Anthropic-format error type
  /authentication failed/i,
  /401 unauthorized/i,
  /unauthorized[^a-z0-9]{0,3}401([^0-9]|$)/i,
  // "HTTP 401", "status: 401", "code":"401", and exa-mcp-server's own
  // formatToolError output: `${toolName} error (${statusCode}): ${message}`,
  // e.g. `web_search_exa error (401): Unauthorized`.
  /(error|http|status|code)[^0-9a-z]{0,4}\(?401\)?([^0-9]|$)/i,
]

// Attribution: only the Exa MCP's own failures carry an exa/mcp tag. A rejected
// model key surfaces before any tool call, on lines that never mention Exa — so
// an auth marker co-located with an Exa tag is Exa's, not the model's. Exa is
// the only MCP server configured (see exa-mcp.json), so a bare "mcp" mention is
// unambiguous.
//
// `\bexa\b` is unusable for this: upstream's tool names are `web_search_exa` and
// `crawling_exa`, and `_` is a word character, so \b never fires before the
// "exa". Spell the boundary out instead — and keep it a boundary, so "exact" and
// "hexadecimal" do not read as Exa.
const EXA_TOKEN = String.raw`(?:^|[^a-z0-9])exa(?:[^a-z0-9]|$)`
const EXA_TAG = new RegExp(`${EXA_TOKEN}|mcp__|mcp server`, 'i')

// Fallback for a wrapped MCP error block, where the tag and the status can land
// on different lines. Requires the neighbouring line to be an Exa *failure*, not
// merely an Exa mention: the log is full of successful Exa result lines, and
// treating those as attribution would hand every late-run model auth failure to
// EXA_API_KEY.
const EXA_FAILURE = new RegExp(
  `(?:${EXA_TOKEN}|mcp)[^\\n]*(?:error|failed|failure|rejected)`,
  'i',
)
const BLOCK_RADIUS = 2

const classify = (log) => {
  const lines = log.split(/\r?\n/)
  const authAt = lines.reduce(
    (acc, line, i) => (AUTH_MARKERS.some((re) => re.test(line)) ? [...acc, i] : acc),
    [],
  )
  if (authAt.length === 0) return 'other'

  const attributedToExa = authAt.some((i) => {
    if (EXA_TAG.test(lines[i])) return true
    const from = Math.max(0, i - BLOCK_RADIUS)
    const to = Math.min(lines.length - 1, i + BLOCK_RADIUS)
    for (let j = from; j <= to; j++) if (j !== i && EXA_FAILURE.test(lines[j])) return true
    return false
  })
  return attributedToExa ? 'exa-auth' : 'model-auth'
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
  // First case is exa-mcp-server's real formatToolError output.
  ['web_search_exa error (401): Unauthorized', 'exa-auth'],
  [['crawling_exa error (401): Unauthorized', 'Timestamp: 2026-08-10T06:23:11Z'].join('\n'), 'exa-auth'],
  ['mcp__exa search failed: Exa API returned 401 Unauthorized', 'exa-auth'],
  ['exa: request rejected — invalid API key', 'exa-auth'],
  ['MCP server "exa" failed: HTTP 401', 'exa-auth'],
  // Wrapped MCP error block: tag and status on separate lines, either order.
  [['mcp__exa search failed', 'HTTP 401'].join('\n'), 'exa-auth'],
  [['HTTP 401', 'mcp__exa search failed'].join('\n'), 'exa-auth'],

  // Transient: must keep falling through the model tiers.
  ['API Error: 529 service is overloaded, please retry', 'other'],
  ['Error: Claude Code exceeded --max-turns 60', 'other'],
  ['web_search_exa error (429): rate limited', 'other'], // Exa, but not a credential problem
  ['web_search_exa error (500): internal server error', 'other'],
  ['', 'other'],

  // Article text pulled in by Exa must never read as a credential failure.
  ['Exa result: "How AI is reshaping 401(k) retirement planning"', 'other'],
  ['Exa result: "Publishers sue over unauthorized scraping of news sites"', 'other'],
  ['Exa result: "Revenue climbed to $1,401 million on AI demand"', 'other'],
  ['Exa result: "Section 401 of the EU AI Act"', 'other'],
  ['Error: 4013 tokens exceeded the limit', 'other'], // digit boundary, not a 401

  // A transient failure whose log also happens to carry such text.
  [
    ['Exa result: "AI and your 401(k)"', 'unauthorized use of copyrighted data', 'API Error: 529 overloaded'].join(
      '\n',
    ),
    'other',
  ],

  // A real auth failure buried in a log that also carries article text.
  [['Exa result: "AI and your 401(k)"', 'Not logged in · Please run /login'].join('\n'), 'model-auth'],

  // Successful Exa research followed by the MODEL's key being rejected: the
  // nearby Exa lines are results, not failures, so this stays model-auth.
  [
    [
      'mcp__exa web_search_exa: 10 results',
      'Exa result: "Anthropic ships a new agent SDK"',
      'Exa result: "AI and your 401(k)"',
      '{"error":{"type":"authentication_error","message":"token expired"}}',
    ].join('\n'),
    'model-auth',
  ],
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
