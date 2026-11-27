# Research: Genie Worker Hardening (spec 007)

Each entry gives the decision, the reason, and the alternatives considered. The Cloudflare platform facts were
checked against the Cloudflare developer docs on 2026-11-28, not taken from memory. Durable Object latency is the
only open number. It is measured during implementation (R6).

## R0. Platform facts (checked in the docs)

| Fact | Source page | Effect on the design |
|---|---|---|
| The rate-limit binding takes `period` = 10 or 60 seconds only. Counts are kept per Cloudflare location and are approximate. | Workers → Runtime APIs → Rate limiting | The per-client limit is `{ limit = 8, period = 60 }` (R5). A client hitting two locations can get up to 8 at each. |
| Durable Objects are on the Free plan, SQLite-backed only: 100,000 requests a day, 13,000 GB-s a day, 100,000 rows written and 5,000,000 rows read a day, 5 GB stored. The daily limits reset at 00:00 UTC, and operations over a limit fail. | Durable Objects → Platform → Limits / Pricing | One SQLite-backed Durable Object class holds the budget counters (R6). Over a limit, calls fail, so the budget check fails closed. |
| Workers Analytics Engine is on the Free plan: 100,000 data points written and 10,000 read queries a day, not billed yet. Each point has up to 20 blobs, 20 doubles and 1 index. At most 250 points per Worker invocation. Data is kept for 3 months. | Analytics → Analytics Engine → Limits / Pricing | Telemetry goes to Analytics Engine, one point per request (R9). |
| A Worker's `fetch()` of a non-Cloudflare URL goes through Cloudflare's cache. `cf: { cacheTtl, cacheEverything }` controls it. | Workers → Runtime APIs → Fetch; Cache → How the cache works with Workers | The prompt file is fetched with `cacheTtl: 600` (R3). |
| Workers Free: 10 ms CPU per request, 50 external subrequests, 100,000 requests a day, no limit on wall-clock time while a client is connected, `waitUntil()` up to 30 s after the response. | Workers → Platform → Limits | The stream filter (R8) must stay cheap. Prompt refresh runs in `waitUntil()`. |
| KV Free: 1,000 writes a day. | KV → Platform → Limits | KV is not suitable for a per-request counter. The old KV rate-limit fallback is removed (R5). |
| Variables changed in the dashboard are overwritten by the next `wrangler deploy` unless `keep_vars = true`. Secrets are never deleted by a deploy. | Wrangler → Configuration → Source of truth | The stop switch is a secret-type setting (R7). |
| Wrangler bundles the entry module with esbuild. `[build] command` runs a custom step before `wrangler dev` and `wrangler deploy`, in `sh` on Linux and macOS and in `cmd` on Windows. | Wrangler → Bundling; Wrangler → Custom builds | The bundled prompt copy is a committed `.js` module, so no custom build step is needed (R2). |
| Not found in the docs: the added latency of a Durable Object call from a Worker. | — | Measured with `wrangler dev` and once after the owner's first deploy (R6). |
| Not checked: whether `compatibility_date = "2024-01-01"` in `wrangler.toml` works with the Durable Object and Analytics Engine bindings. | — | PR 3 checks it with `wrangler dev` and `wrangler deploy --dry-run`. It moves the date forward only if a binding needs it, and then reads the compatibility flags between the two dates. |

## R1. How the site publishes the prompt file

**Decision.** A static route handler, `src/app/genie/prompt.json/route.ts`, with
`export const dynamic = 'force-static'`, like `src/app/feed.xml/route.ts`. It returns the output of a builder in
`src/lib/genie/prompt-file.ts`. `next build` writes it to `out/genie/prompt.json`, so it is served at
`https://ahmed-3m.github.io/genie/prompt.json`.

The builder reads:
- `KNOWLEDGE_CHUNKS` from `knowledge.ts`, which already takes its figures from the claims registry;
- the rule text and link list from a new module, `src/lib/genie/prompt-rules.ts`;
- `languageName` from `@/lib/i18n-config`;
- the sections and paths (R4).

`prompt-rules.ts` holds the rule paragraphs as a template with named slots (data model, "Prompt file").
`buildSystemPrompt` in `retriever.ts` is changed to fill the same template. A test pins its output to the output
before the change, so PR 1 changes no prompt text. `prompt-rules.ts` cannot be server-only yet: the site's composer
imports it until the site switch (PR 4). FR-019 is met in PR 4, when the client stops importing it.

**Why.** The builder runs inside the same build and module graph as the pages, so the file cannot disagree with
the site. It needs no extra script in `prebuild`, and the export already holds what GitHub Pages serves.

**Alternatives.**
- A `prebuild` script writing `public/genie/prompt.json`. It needs TypeScript and the `@/` alias outside Next, and a
  generated file in `public/` is easy to commit by mistake.
- A hand-written JSON file. It would drift from `knowledge.ts`.

## R2. The Worker's bundled copy

**Decision.** The copy is committed as `worker/prompt-bundle.js`: one `export default { … }` holding the same object
as `prompt.json`, with a "generated, do not edit" header. `node --import ./tools/test-hooks.mjs
tools/genie/emit-worker-prompt.mjs` writes it. A test in `npm test` fails when the committed copy differs from
`buildPromptFile()`, so CI catches a knowledge change made without regenerating it. This is the same pattern as the
OG card lock in spec 008.

The Worker is split so the self-test never needs the generated file:
- `worker/lib/handler.js` exports `createHandler({ bundledPrompt, now, fetchImpl })`;
- `worker/chat-proxy.js` stays the entry named in `wrangler.toml`. It imports `prompt-bundle.js`, calls
  `createHandler`, and exports the default handler and the Durable Object class.

**Why.**
- `knowledge.ts` reads nothing that changes from build to build. It imports `blog-posts-meta`, `claims`,
  `ood-explorer-data` and `links`. The `news-feed` entry is fixed text and does not read `news-homepage.json`. So a
  committed copy is deterministic and reviewable.
- A committed copy is checked in CI, the figure check covers its content through `prompt.json`, and the owner's
  deploy needs no build step. A `[build] command` would run only on the owner's machine, in `cmd` on Windows, with
  no figure check.
- A `.js` module avoids JSON import attributes, which Node and esbuild treat differently.

**Alternatives.**
- A `[build] command` that generates the copy at deploy. Rejected for the reasons above.
- No bundled copy, with the Worker failing when the fetch fails. Rejected by FR-004.

## R3. Fetching and caching the prompt file

**Decision.**
- The Worker keeps the parsed file in module scope with the time it was loaded. Module scope is lost when an
  isolate is recycled, which at this traffic happens often.
- **Isolate with no fetched copy yet:** the request waits for the fetch, up to 2 seconds. If the fetch fails or
  times out, the request uses the bundled copy, and the isolate does not try again for 60 seconds. So while GitHub
  Pages is down, a request waits at most once a minute per isolate.
- **Isolate with a fetched copy:** the request uses it at once. When it is older than 10 minutes, the request
  schedules a refresh with `ctx.waitUntil()`.
- Every fetch is `fetch(PROMPT_URL, { cf: { cacheTtl: 600, cacheEverything: true } })`. A cold isolate usually gets
  a Cloudflare cache hit at its location, not a GitHub Pages round trip.
- Each fetched copy is validated (R4, data model). A failed fetch, a non-200, a body over 256 KB, an unknown
  `version` or a failed shape check keeps the current copy.
- Telemetry records `promptSource` as `fetched`, `cached` or `bundled`.
- `PROMPT_URL` is a `[vars]` setting, defaulting to `https://ahmed-3m.github.io/genie/prompt.json`.

**Why.** If the fetch ran only in the background, a cold isolate would always answer from the bundled copy. Since
isolates are often cold here, a knowledge change would then hardly reach visitors before the next manual deploy,
and new entry IDs from the site would be dropped. Waiting once per isolate, usually for a cache hit, keeps the
Worker on the site's current file.

**Alternatives.**
- Background refresh only: no added wait, but often stale, for the reason above.
- Fetching on every request: the Cloudflare cache makes this cheap, but there is no reason to repeat it within
  10 minutes.

## R4. Sections, paths and default entries

**Decision.**
- **Sections:** the viewport sections the site reports (hero, about, projects, experience, research, evidence,
  ood-explorer, writing, contact) plus the values `resolveSectionForPathname` returns for routes.
- **Paths:** every static route (`/`, `/about`, `/research`, `/blog`, `/news`, the three case studies, the legal
  pages) and `/blog/<slug>` for each post in `blogPostsMeta`. Paths are normalized the way `normalizePathname` does.
  A test compares the list with the routes in `src/app`.
- **Defaults per section:** the site's own `retrieveKnowledgeChunks({ query: '', section, topK: 4 })`, run at build
  time. So the defaults match what the site would pick for an empty question.
- **Unknown values:** an unknown section becomes `hero`, an unknown path becomes `/`. Neither is echoed.

**Why.** Every value that reaches the prompt is one the file lists, so the page context cannot carry client text.

## R5. Client key and per-client limit

**Decision.**
- The key comes from `CF-Connecting-IP`:
  - IPv4: the full address;
  - IPv6: the first four hextets after expanding `::`, written in lowercase, plus `::/64`;
  - missing or unparsable: `unknown`.
- `CHAT_RATE_LIMITER` becomes `simple = { limit = 8, period = 60 }`. It is checked only for `POST`, after the origin
  check and before body parsing.
- If the binding is missing, the Worker answers `unavailable` instead of running unlimited.
- The KV fallback (60 an hour) is removed, since the binding is configured and KV allows 1,000 writes a day.
- The limit error is `429`, `scope: 'proxy'`, the message `Rate limit exceeded. Please try again later.` and
  `Retry-After: 60`. Today's site reads this as the proxy's own limit and does not try Groq (FR-012).

**Why.** One person behind an IPv6 /64 can rotate addresses freely, so the /64 is the client. The 60-second period
is the longest the binding supports, which keeps the privacy notice ("kept for at most one hour") true.

## R6. Budgets

**Decision.**
- One SQLite-backed Durable Object class, `GenieBudget`, with one instance per provider (`idFromName('zai')`,
  `idFromName('groq')`). It stores, for each window kind, the window ID and the count. It holds no visitor data.
- **Windows** are fixed and in UTC. A pure function, `windowIds(nowMs)`, returns
  `{ fiveHour: Math.floor(nowMs / 18_000_000), day: Math.floor(nowMs / 86_400_000) }`. Tests inject the clock, so
  the window reset in the US2 test needs no waiting.
- **Check and count are one call:** `consume({ caps, now })`. It resets a counter whose window ID changed, refuses
  when either count has reached its cap, and otherwise adds 1 to both. A Durable Object handles one request at a
  time, so the check and the increment cannot interleave. It returns `{ ok, retryAfterSeconds }`, the time to the
  end of the window that is full.
- **Order of checks:** origin, client limit, body and format, stop switch, budget, upstream. A rejected request
  spends no budget. A request is counted when it starts, and a stream that has started is never cut off.
- **Fail closed.** If the Durable Object call throws or times out, the Worker answers `unavailable` with
  `scope: 'worker'` and calls no provider. The timeout is set after the latency is measured (below), well above
  the measured value. A hard ceiling that disappears when the counter is down is not a ceiling.
- **Interface.** The Worker calls the object through `stub.fetch()`, not RPC, so the class needs no
  `cloudflare:workers` import and loads in Node. The self-test passes a fake stub; a unit test runs `consume` on an
  in-memory store.
- **Caps** are `[vars]` settings in `wrangler.toml`, reviewed like code. Starting values, approved by the owner on
  2026-11-28:

  | Provider | 5-hour cap | Daily cap |
  |---|---|---|
  | Z.ai | 100 | 300 |
  | Groq | 200 | 600 |

  These are guesses with no usage data behind them. They are well under the Free-plan Durable Object limits (two
  rows written per request). Telemetry gives the data to tune them.

**Why.** Concurrent requests from many isolates must share one count. A Durable Object is the only Free-plan store
that gives that without races.

**Alternatives.**
- KV counters: racy and 1,000 writes a day.
- The rate-limit binding with a long period: periods are 10 or 60 seconds only.
- Analytics Engine: it can be queried but is not consistent enough to enforce a cap.

**Open number.** The added latency of the budget call. It is measured with `wrangler dev` in PR 3 and once after the
first deploy, and recorded in `worker/README.md`.

## R7. Stop switch

**Decision.** The Worker reads `env.GENIE_STOP`. When it is `on`, every model request gets `unavailable` with
`scope: 'worker'` and no provider is called. `OPTIONS` and the prompt-file refresh still work. The owner sets it as a
secret-type value (`wrangler secret put GENIE_STOP`, or "Encrypt" in the dashboard) and deletes it to resume.

**Why.** A secret survives every deploy (R0), and setting one deploys at once with no code change (FR-014). A plain
dashboard variable would be removed by the next `wrangler deploy`, so a stop could undo itself without anyone
noticing.

**Alternatives.**
- A `[vars]` value: needs a deploy, and the owner may not have the repo at hand.
- `keep_vars = true`: also keeps stale variables and changes how every other variable behaves.

## R8. Error structure and streams

**Decision.** Every error body is

```json
{ "error": { "code": "budget_exhausted", "message": "…" }, "scope": "zai", "retryAfter": 3600, "requestId": "…" }
```

with fixed codes, statuses and messages (contracts/worker-api.md). This shape works with today's site:
- `throwProviderError` reads `data.error.message` and `data.error.code`;
- `isProxyRateLimitPayload` matches `429` with `scope: 'proxy'`.

Status choices:
- **Per-client limit:** `429`, scope `proxy`. Today's site shows the rate-limit message and does not try Groq.
- **Budget, stop switch, missing key, budget store down:** `503`. Today's site then tries the other provider, and
  when both fail it shows a prepared answer (`reply.ts`, `getLocalReply` with `fallback: true`). With `429` instead,
  `chatErrorKind` would show the rate-limit text when no prepared answer matches, which is wrong for a budget.
  For Groq, today's site turns any `503` into "Model is warming up, try again in a moment." That text is only shown
  when no prepared answer matches. PR 4 replaces it with code-based messages.
- **Upstream error:** `502`. **Upstream timeout:** `504`. Both use the provider scope.
- **Invalid request:** `400`, or `413` for a body over 64,000 bytes, or `405` for a method other than `POST` or
  `OPTIONS`. Scope `proxy`.
- **Origin not allowed:** `403`, scope `proxy`.

The Worker never forwards a provider's error body. A provider status of 4xx or 5xx becomes `upstream_error`. The
provider body is read and dropped.

**Errors inside a stream.** A provider can send an error as an event inside a `200` stream. The Worker passes the
stream through a small transform that looks only at event lines containing `"error"`. Such an event is replaced
with one standard error event (`data: {"error":{"code":"upstream_error",…},"scope":…,"requestId":…}`), and the stream
ends. Today's site already reads `chunk.error.message` there. Other events pass through unchanged. The transform
works on whole lines and does not parse events that cannot contain an error, to keep CPU time low (R0: 10 ms).

**Request ID.** `crypto.randomUUID()`, returned in the body and in `X-Request-Id`. It is returned to the client only.
It is not recorded in telemetry (R9) and not linked to an IP address.

## R9. Telemetry

**Decision.** An Analytics Engine dataset binding, `GENIE_EVENTS` (dataset `genie_events`).

**Which requests get a point.** One point for each request that passes validation, that is, each request that
reaches the stop switch, the budget or a provider. This includes stop-switch and budget refusals, which US2
scenario 5 counts. Requests refused earlier get no point: wrong origin, rate-limited, invalid. A flood of those
could otherwise use up the 100,000 daily points. The rate limiter already bounds them.

**When it is written.** `writeDataPoint` does not return a promise, so it needs no `waitUntil()`. It is called when
the response is complete:
- for a stream, in the stream transform's end or cancel handler;
- otherwise, just before returning.

This avoids keeping a `waitUntil()` open through a stream of up to 58 seconds, past the 30-second limit (R0).

The point:

- `indexes: [provider]`
- `blobs: [lane, provider, model, outcome, format, promptSource]`
  - `format` is `v1` or `v2`;
  - `outcome` is `ok`, an error code, or `client_abort`;
  - `promptSource` is `fetched`, `cached` or `bundled`.
- `doubles: [ttfbMs, totalMs, entryCount]`

There is no message text, IP address, user agent, request ID or country in it. If the binding is missing, as in
the self-test, telemetry is skipped. The self-test captures the points with a fake binding and checks that no
field holds message text or an IP address (SC-007).

The owner reads it with the Analytics Engine SQL API, which needs an account API token with Analytics read rights
(an owner action). `worker/README.md` gives example queries: counts per provider and outcome per day, budget refusals,
and median time to first byte.

**Why.** It is on the Free plan, holds only what is written to it, and keeps data for 3 months.

**Alternatives.**
- Workers Logs: would carry request details unless every log line is scrubbed.
- A Durable Object counter per outcome: no timings, more writes.

## R10. Upstream deadline

**Decision.** An `AbortController` per upstream call:
- **First byte:** 18 s. If no response headers arrive in time, the Worker aborts and answers `upstream_timeout`.
- **Total:** 58 s. If a stream runs longer, it is aborted and ends with a standard `upstream_timeout` error event.

Both are settings.

**Why.** The site aborts at 20 s (first byte) and 60 s (total). If the Worker used the same limits, the site would
always give up first and never see the Worker's timeout error.

## R11. The old format (v1) during the compatibility window

**Decision.** The Worker turns a v1 request into the v2 form before any other check runs, so one code path
handles both.

- **Provider:** from `model` (in the Z.ai or Groq allowlist). An unknown model is an invalid request.
- **Lane:** from `max_tokens`. 1,200 or more is `deep`, anything else `fast`. Today's site sends 900 for fast and
  1,600 for deep, to both providers (`providers.ts`).
- **System messages:** every message with role `system` is removed, wherever it sits.
- **Section, path and language:** read from the removed system message:
  - section and path from the `Active page context: section="…", pathname="…"` line;
  - language from the `(or <language name> if unclear)` phrase.

  Each value is used only if it exactly matches a value the prompt file lists. Otherwise the section is `hero`, the
  path `/` and the language `en`.
- **Knowledge entries** (FR-018, as amended with the owner's approval on 2026-11-28): read `[Title]` at the start
  of a line after `Retrieved portfolio knowledge:`, up to 4. Map each title to an entry ID by exact match against
  the published titles. If none match, use the section defaults.

  Only selection happens. No text from the client's system message reaches the composed prompt. A self-test plants
  instructions right after a real title and checks that they are not in the prompt.
- **Turn caps:**
  - the last turn must be the visitor's question and is held to FR-008's caps;
  - earlier turns over a cap are cut to the cap in v1 only (FR-018, as amended). Today's chat input has no length
    limit, so a long paste would otherwise stay in the history and make the next 15 requests fail. v2 rejects
    over-cap turns. PR 4 adds `maxLength={2000}` to the input.

**Why read titles.** Between the Worker deploy and the site switch, all traffic is v1. With section defaults only,
every answer in that window loses the per-question focus the site has today. Reading titles only selects among
published entries, so it opens nothing.

## R12. One composer, and parity with the site

**Decision.** The Worker's composer is plain JavaScript in `worker/lib/compose-prompt.js`:
`composePrompt(file, { entryIds, lang, section, pathname })`.
- It fills the template's slots in one pass, so a slot value containing `{{…}}` is never expanded again.
- It applies the 7,500-character cap the way the site does.

A test in `tests/genie` imports it and checks that, for sample inputs, its output equals the site's
`buildSystemPrompt` when the site retrieves the same entry IDs. The test stays until PR 4 removes the site's
composer.

**Alternatives.** The site importing the Worker's JavaScript composer. That would cross the `src`/`worker` boundary
and pull plain JS into the type-checked client bundle.

## R13. Figure check and export checks

**Decision.**
- `tools/claims/scan-export.mjs` adds `out/genie/prompt.json` as English text units:
  - the rules template, with its slots blanked;
  - each entry's title and facts.

  A wrong or unqualified figure there fails `verify:export` in the same run as the rest of 008's check (SC-005). This
  completes 008 task T047.
- `worker/prompt-bundle.js` is not scanned directly. `tools/claims/scan-sources.mjs` reads only `src/` and its
  listed text and SVG files, so 008's empty baseline is unaffected. The bundle is covered through the up-to-date
  test (R2): it must equal `buildPromptFile()`, whose output is scanned as `out/genie/prompt.json`.
- **PR 4.** `tools/verify-export.mjs` reads the rule sentences from `out/genie/prompt.json` (every sentence of 40
  characters or more) and fails when any of them is in `out/_next/static/**/*.js` (FR-019, SC-006).

## R14. Site-health canary

**Decision.** A step in `.github/workflows/site-health.yml` after the CORS preflight. It fetches
`https://ahmed-3m.github.io/genie/prompt.json`, expects `200`, and checks with `jq` that:
- `version` is 1;
- `entries` is not empty;
- `rules` contains every slot;
- every `defaults` ID is a known entry.

The preflight step is unchanged (FR-021).

## R15. Owner actions

These come before the deploy they gate. None of them is done by an agent.

**Before the first Worker deploy (after PR 2):**
- separate Z.ai and Groq keys, with spend limits where offered, set with `wrangler secret put`;
- a check of the Z.ai Coding Plan terms;
- a check of whether Groq billing is on.

**Before the PR 3 deploy:**
- confirm the cap values;
- the Durable Object migration runs with the deploy (`[[migrations]] new_sqlite_classes = ["GenieBudget"]`);
- create the Analytics Engine dataset (created on first write; enable Analytics Engine in the dashboard if asked);
- create an API token with Analytics read rights, for queries only.

**Every Worker deploy:** run `wrangler deploy` from `worker/`, then run the site-health workflow by hand (SC-008).
