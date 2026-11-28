# ahmed-chat-proxy

The Cloudflare Worker that answers Genie's chat requests with Z.ai (GLM Coding Plan,
`api.z.ai`) or Groq (`api.groq.com`). The API keys live only in the Worker, so they never
reach the static site's JavaScript.

The Worker decides everything that costs money or shapes an answer:

- It **writes the system prompt itself**, from the published prompt file
  (`https://ahmed-3m.github.io/genie/prompt.json`) or its bundled copy. A client cannot
  send prompt text.
- It **chooses the model, the token limit, the temperature and the reasoning effort** from
  its settings. A client only names a provider (`zai` or `groq`) and a lane (`fast` or
  `deep`).
- It **limits each client** to 8 requests a minute.
- It keeps a **budget per provider** (requests per 5 hours and per day) that fails closed,
  and has a **stop switch** that survives deploys.
- It gives each provider call **deadlines** inside the site's own.
- It records **content-free telemetry**: counts and timings, never messages or IP addresses.
- It answers **every failure with one error structure** that holds no provider text.

The full contract is in `specs/007-worker-hardening/contracts/worker-api.md`.

## Files

| File | What it does |
|---|---|
| `chat-proxy.js` | The entry point: `createHandler({ bundledPrompt })`, and the `GenieBudget` class. |
| `lib/handler.js` | The request handler. Runs the checks in the contract's order. |
| `lib/request.js` | Reads and checks a v2 body, and adapts a v1 body to v2. |
| `lib/compose-prompt.js` | Builds the system prompt from the prompt file. Matches the site's `buildSystemPrompt`. |
| `lib/prompt-source.js` | Fetches and checks the published prompt file, with the bundled copy as fallback. |
| `lib/upstream.js` | Calls the provider with its deadlines and replaces provider errors, including error events in a stream. |
| `lib/budget.js` | The budget counter, the `GenieBudget` Durable Object, and `checkBudget`. |
| `lib/telemetry.js` | Writes one Analytics Engine data point per request. |
| `lib/settings.js` | Reads the settings below, with defaults and the model allowlist. |
| `lib/client-key.js` | The rate-limit key: the IPv4 address, or the IPv6 /64. |
| `lib/errors.js` | The error codes, messages and response helpers. |
| `prompt-bundle.js` | **Generated.** The bundled copy of the prompt file. Do not edit. |
| `chat-proxy.selftest.mjs` | The self-test. No network. CI runs it before each deploy. |

### The bundled prompt copy

`prompt-bundle.js` is generated from the site's knowledge and rules
(`src/lib/genie/prompt-file.ts`). **After any change to Genie's knowledge or prompt rules,
regenerate it and commit the result:**

```powershell
npm run genie:worker-prompt
```

`tests/genie/worker-prompt.test.ts` fails when the bundle is out of date.

## Request formats

### v2 (the site's new format)

```json
{
  "version": 2,
  "turns": [{ "role": "user", "content": "What did the thesis find?" }],
  "lane": "fast",
  "provider": "zai",
  "lang": "de",
  "section": "research",
  "pathname": "/research",
  "entryIds": ["diffusion-headline"],
  "stream": true
}
```

- `turns`: 1 to 16 turns, `user` or `assistant` only, the last one `user`. A `user` turn
  holds at most 2,000 characters, an `assistant` turn at most 8,000.
- `lane`: `fast` or `deep`. `provider`: `zai` or `groq`.
- `lang`, `section`, `pathname`: an unknown value is replaced by the default (`en`,
  `hero`, `/`), not echoed.
- `entryIds`: at most 4 knowledge entry IDs. Unknown IDs are dropped; with none left, the
  section's default entries are used.
- `stream`: optional, `true` by default.
- Any other field (`model`, `max_tokens`, `temperature`, `reasoning_effort`, …) is ignored.

### v1 (today's site, kept until PR 5)

A body without `version` and with `messages` is read as v1 and adapted:

- The provider comes from `model` (an allowlisted Z.ai or Groq model). Another model is
  `400`.
- The lane is `deep` when `max_tokens` is 1,200 or more, otherwise `fast`.
- Every `system` message is dropped. The page context, the language and up to 4 knowledge
  entries are read from the site's prompt text by exact patterns, and the Worker composes
  its own prompt from them.
- An earlier turn over its cap is cut to the cap. A last turn over 2,000 characters is
  `400`.
- It streams only when `stream` is `true`.

The v1 format is removed in PR 5, at least 7 days after the site sends v2 (PR 4).

## Checks, in order

1. **Origin.** Only `https://ahmed-3m.github.io` (and `http://localhost:3000` when
   `ALLOW_LOCALHOST` is `true`), for every method. `OPTIONS` gets `204`. Methods other
   than `POST` get `405`.
2. **Per-client limit.** 8 requests a minute for each IPv4 address or IPv6 /64, counted at
   each Cloudflare location. Without the `CHAT_RATE_LIMITER` binding, the Worker answers
   `503` and calls no model.
3. **Body.** At most 64,000 bytes (`413`), valid JSON (`400`).
4. **Validation** of the v2 or v1 body (`400`).
5. **Stop switch.** With `GENIE_STOP` set to `on`, every `POST` gets `503` with scope
   `worker`, and no budget or model is used. `OPTIONS` still works.
6. **Key.** A missing provider key gives `503` for that provider.
7. **Budget.** A provider over its cap gets `503 budget_exhausted` with `retryAfter`. If the
   budget object fails, is missing or does not answer within `BUDGET_TIMEOUT_MS`, the Worker
   answers `503` with scope `worker` and calls no model.
8. **Prompt and upstream call**, with the deadlines below.

A request refused in steps 1 to 4 spends no budget and records no telemetry. Every request
that passes step 4 records one telemetry point.

## Errors

Every error, as a response body or as one event in a stream, has this shape:

```json
{ "error": { "code": "rate_limited", "message": "Rate limit exceeded. Please try again later." },
  "scope": "proxy", "retryAfter": 60, "requestId": "…" }
```

| Code | Status | Message | Scope |
|---|---|---|---|
| `invalid_request` | 400, 405, 413 | Invalid request. | `proxy` |
| `origin_not_allowed` | 403 | Origin not allowed. | `proxy` |
| `rate_limited` | 429 | Rate limit exceeded. Please try again later. | `proxy` |
| `unavailable` | 503 | This model is unavailable right now. | `zai` or `groq` |
| `unavailable` | 503 | Models are unavailable right now. | `worker` |
| `budget_exhausted` | 503 | This model is unavailable right now. | `zai` or `groq` |
| `upstream_error` | 502 | The model could not answer. | `zai` or `groq` |
| `upstream_timeout` | 504 | The model took too long to answer. | `zai` or `groq` |

Every response carries `X-Request-Id`. A `429` also carries `Retry-After: 60`, and a
`budget_exhausted` answer carries `Retry-After` with the seconds until its window ends. A provider's
error body is read and dropped. When a provider sends an error event inside a `200` stream,
the Worker replaces it with one standard `upstream_error` event and ends the stream.

## Settings

| Setting | Kind | Default |
|---|---|---|
| `ZAI_API_KEY`, `GROQ_API_KEY` | secret | none; a missing key makes that provider `unavailable` |
| `ALLOW_LOCALHOST` | var | `false` |
| `PROMPT_URL` | var | `https://ahmed-3m.github.io/genie/prompt.json` (must be `https`) |
| `ZAI_FAST_MODEL`, `ZAI_DEEP_MODEL` | var | `glm-5.3-flash`, `glm-5.4` |
| `GROQ_MODEL` | var | `openai/gpt-oss-20b` (both lanes) |
| `FAST_MAX_TOKENS`, `DEEP_MAX_TOKENS` | var | `900`, `1600` |
| `TEMPERATURE` | var | `0.3` |
| `ZAI_REASONING_EFFORT` | var | `low` (sent to Z.ai only) |
| `ZAI_CAP_5H`, `ZAI_CAP_DAY` | var | `100`, `300` |
| `GROQ_CAP_5H`, `GROQ_CAP_DAY` | var | `200`, `600` |
| `FIRST_BYTE_MS`, `TOTAL_MS` | var | `18000`, `58000` |
| `BUDGET_TIMEOUT_MS` | var | `2000` |
| `GENIE_STOP` | secret | not set; `on` stops all model calls |
| `CHAT_RATE_LIMITER` | binding | `{ limit = 8, period = 60 }` |
| `GENIE_BUDGET` | binding | the `GenieBudget` Durable Object (SQLite-backed, migration `v1`) |
| `GENIE_EVENTS` | binding | the Analytics Engine dataset `genie_events` |

A var that is missing or invalid falls back to its default. A model var outside the
allowlist in `lib/settings.js` falls back to its default.

### The prompt file

On a cold start the Worker waits up to 2 seconds for the published prompt file. If the fetch
fails, answers with another status than `200`, is over 256 KB or fails the shape check, the
Worker uses the bundled copy and does not try again for 60 seconds. A copy older than 10
minutes is used at once and refreshed in the background.

### Budgets

One `GenieBudget` Durable Object per provider counts requests in two fixed windows: 5 hours,
counted from 1 January 1970 UTC (so the start times move from day to day), and the UTC day. Check and count are one call, so two
requests cannot both take the last place. A refused request is not counted. When a count is
full, the provider answers `503 budget_exhausted` until its window ends; the site then tries
the other provider, then its prepared answers. The object stores two counters per provider
and nothing about visitors.

Change a cap by editing its var in `wrangler.toml` and deploying. Counts already spent in the
current window stay.

The budget call's added time, measured with `wrangler dev` on 2026-11-28 (local runtime, not
production): 31 ms for the first counted call while the object started, 5 ms for the second
counted call, and for 32 refused calls (which read the counts but write nothing) a median of
1 ms and at most 9 ms. `BUDGET_TIMEOUT_MS` stays at 2000 until the owner measures the counted
path in production (see the owner steps).

### Stop switch

To stop all model calls at once, in `worker/`:

```powershell
npx wrangler secret put GENIE_STOP
```

and enter `on`. It takes effect within seconds and stays on through deploys, because it is a
secret and not a var. To resume:

```powershell
npx wrangler secret delete GENIE_STOP
```

While it is on, Genie shows its prepared answers.

### Deadlines

The Worker gives up on a provider that sends no response headers within `FIRST_BYTE_MS`
(18 s), and on any answer that is not finished within `TOTAL_MS` (58 s). Before the first
byte it answers `504 upstream_timeout`; during a stream it sends one `upstream_timeout`
error event and ends the stream. Both are inside the site's own 20 s and 60 s timers, so the
site sees the Worker's error and not its own timeout.

### Telemetry

Each request that passes validation writes one data point to the `genie_events` dataset,
when the answer is complete (for a stream: when it ends or the visitor cancels it):

| Field | Holds |
|---|---|
| `index1` | provider |
| `blob1` | lane (`fast`, `deep`) |
| `blob2` | provider (`zai`, `groq`) |
| `blob3` | model |
| `blob4` | outcome: `ok`, `client_abort`, `unavailable`, `budget_exhausted`, `upstream_error`, `upstream_timeout` |
| `blob5` | request format (`v1`, `v2`) |
| `blob6` | prompt source (`fetched`, `cached`, `bundled`) |
| `double1` | milliseconds to the provider's response headers (0 when no provider was called) |
| `double2` | total milliseconds |
| `double3` | number of prompt entries used |

No point holds message text, an IP address, a user agent, a country or the request ID.

Queries go to the SQL API with a token that has **Account Analytics Read** rights (the
owner creates it; never commit it):

```powershell
curl.exe "https://api.cloudflare.com/client/v4/accounts/<account_id>/analytics_engine/sql" --header "Authorization: Bearer <token>" --data "SHOW TABLES"
```

Requests per provider and outcome per day (counts use `_sample_interval`, because Analytics
Engine may sample):

```sql
SELECT toStartOfInterval(timestamp, INTERVAL '1' DAY) AS day, blob2 AS provider,
       blob4 AS outcome, SUM(_sample_interval) AS requests
FROM genie_events
WHERE timestamp > NOW() - INTERVAL '7' DAY
GROUP BY day, provider, outcome
ORDER BY day, provider, outcome
```

Budget refusals per hour:

```sql
SELECT toStartOfInterval(timestamp, INTERVAL '1' HOUR) AS hour, blob2 AS provider,
       SUM(_sample_interval) AS refusals
FROM genie_events
WHERE blob4 = 'budget_exhausted' AND timestamp > NOW() - INTERVAL '7' DAY
GROUP BY hour, provider
ORDER BY hour
```

Median time to first byte per provider and lane, for answered requests:

```sql
SELECT blob2 AS provider, blob1 AS lane,
       quantileExactWeighted(0.5)(double1, _sample_interval) AS median_ttfb_ms
FROM genie_events
WHERE blob4 = 'ok' AND timestamp > NOW() - INTERVAL '7' DAY
GROUP BY provider, lane
```

## Owner steps

An agent never handles keys or deploys the Worker. The owner does these steps.

**Before the first deploy of this version:**

1. Create separate Z.ai and Groq keys, with spend limits where the provider offers them.
2. Check the Z.ai Coding Plan terms for serving a public website, and whether Groq billing
   is on.
3. From `worker/`, set the keys:

   ```powershell
   npx wrangler secret put ZAI_API_KEY
   ```

   ```powershell
   npx wrangler secret put GROQ_API_KEY
   ```

**Each deploy:**

1. Deploy from `main`, in `worker/`:

   ```powershell
   npx wrangler deploy
   ```

2. Run the site-health workflow by hand. The preflight and the prompt file must pass.
3. Ask Genie one question on the live site and check that the answer is about the question.

**The first deploy with budgets (PR 3):** wait until the site deploy with the new privacy
notice is live, confirm the caps in `wrangler.toml`, then deploy. The `v1` migration that
creates `GenieBudget` runs with the deploy. Enable Analytics Engine if the dashboard asks,
run one telemetry query to check that points arrive (after a few streamed answers, `ok`
rows should appear, and closing the chat panel during an answer should add a `client_abort`
row), and measure the budget call's time in
production once. If it is close to `BUDGET_TIMEOUT_MS`, raise the timeout and record both
numbers here.

**Rollout order:** deploy this Worker (it accepts both v1 and v2) before the site starts
sending v2 (PR 4). Remove v1 (PR 5) only after PR 4 has been live for 7 days.

## Local development

Create `worker/.dev.vars` (ignored by git) with:

```
ALLOW_LOCALHOST=true
ZAI_API_KEY=<a development key>
GROQ_API_KEY=<a development key>
```

Then run `npx wrangler dev` in `worker/`, and set `NEXT_PUBLIC_CHAT_PROXY_URL` to the local
Worker URL for `npm run dev`. Never set `ALLOW_LOCALHOST` to `true` in production.

## Tests

```powershell
node worker/chat-proxy.selftest.mjs
```

```powershell
npm test
```

The self-test covers the checks, the v1 adapter, the errors, the stream error events, the
prompt source, the budgets (on in-memory storage), the stop switch, the deadlines and the
telemetry. `tests/genie/budget.test.ts` covers the budget counter and its windows. `tests/genie/worker-compat.test.ts` runs the site's own request code against
the Worker, and `tests/genie/worker-prompt.test.ts` checks the bundle and that the Worker's
prompt matches the site's.
