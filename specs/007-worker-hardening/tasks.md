---
description: "Task list for spec 007: Genie Worker hardening"
---

# Tasks: Genie Worker Hardening

**Input**: design documents in `specs/007-worker-hardening/`: [plan.md](plan.md), [spec.md](spec.md),
[research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/),
[quickstart.md](quickstart.md).

**Tests**: included. The spec requires them: FR-020 asks for the Worker self-test, SC-001 to SC-008 are proved in
Node and on the built export, and FR-002 asks for the figure check on the prompt file. Site tests use `node:test`
with `node:assert/strict`, under `tests/`, run by `npm test`. The Worker self-test is
`node worker/chat-proxy.selftest.mjs`, run in CI by `deploy.yml`.

**Delivery** (plan.md, "Delivery"). Five PRs, in the order FR-017 requires:
- **PR 1** = Phases 1–2. The site publishes the prompt file. The site deploys on merge.
- **PR 2** = Phase 3 (User Story 1). The Worker composes its own prompt and accepts v1 and v2. The owner deploys it.
- **PR 3** = Phase 4 (User Story 2). Budgets, stop switch, deadlines, telemetry, privacy notice. The site deploys on
  merge, then the owner deploys the Worker.
- **PR 4** = Phase 5 (User Story 3, site switch). The site deploys on merge.
- **PR 5** = Phase 6 (User Story 3, v1 removal), at least 7 days after PR 4 is live. The owner deploys it.

Branch each PR fresh from `origin/main`, never from the spec branch. Agents never merge their own PRs.

**Owner tasks** are marked **Owner**. They gate a deploy and are never done by an agent: keys, secrets, deploys,
dashboard settings and API tokens are the owner's (research R15).

**Commands used throughout:**
- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run build`, then `npm run verify:export` (revert `src/lib/news-homepage.json` afterwards if the build changed it)
- `node worker/chat-proxy.selftest.mjs`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task).
- **[Story]**: US1–US3 from spec.md.

---

## Phase 1: Setup (PR 1)

**Purpose**: pin today's prompt text before anything moves, so PR 1 provably changes no prompt text.

- [x] T001 Before any code change, write `tests/genie/fixtures/system-prompt-baseline.json` from today's `buildSystemPrompt` in `src/lib/genie/retriever.ts`. Use a throwaway script in the scratchpad (not committed), run with `node --import ./tools/test-hooks.mjs`. Record, for each language (`en`, `de`, `fr`, `es`, `ar`) and each of these inputs, `{ input, entryIds, prompt }`, where `entryIds` is `retrieveKnowledgeChunks({ ...input, topK: 4 }).map((c) => c.id)`:
  - `{ query: '', section: 'hero', pathname: '/' }`;
  - `{ query: 'What did the thesis find?', section: 'research', pathname: '/research' }`;
  - `{ query: 'Is he available to work in Austria?', section: 'contact', pathname: '/' }`;
  - `{ query: 'Tell me about his writing', section: 'writing', pathname: '/blog/<first slug in blogPostsMeta>' }`;
  - `{ query: 'How does it store memories?', history: [one earlier user and assistant turn about the receptionist demo], section: 'projects', pathname: '/case-studies/sihem' }`.
  - Done in #316 with 9 cases, not 25: the five inputs in `en`, plus the research input in `de`, `fr`, `es` and `ar`. Language fills only the `{{language}}` slot, and each language name is covered once.
- [x] T002 Add `tests/genie/prompt-baseline.test.ts`. For every fixture case it asserts that `buildSystemPrompt(input)` equals `prompt`. It must pass on `main` before any other change in this PR.

---

## Phase 2: Foundational — the prompt file (PR 1)

**Purpose**: FR-001, FR-002, FR-021; User Story 1 scenario 8; completes 008 task T047. The Worker (Phase 3) and
the site switch (Phase 5) both read this file, so it blocks every story.

**⚠️ CRITICAL**: PR 1 must be merged and live before PR 2 is deployed (FR-017 step 1).

### Tests for the prompt file (write first; they fail until T005–T007)

- [x] T003 [P] Write `tests/genie/prompt-file.test.ts` for `buildPromptFile()`:
  - every rule in `contracts/prompt-file.md`, "Rules a valid file meets", 1 to 7;
  - `entries` has one item per `KNOWLEDGE_CHUNKS` entry, with `id`, `title`, `facts`, `links` and `sections`, and no `keywords`;
  - `sections` contains every value in the shared viewport section list (T004) and every value `resolveSectionForPathname` returns for a path in `paths`;
  - `paths` equals the routes found under `src/app` (each folder with a `page.tsx`, without dynamic segments) plus `/blog/<slug>` for each `blogPostsMeta` post, all passed through `normalizePathname`;
  - `defaults[s]` equals `retrieveKnowledgeChunks({ query: '', section: s, topK: 4 }).map((c) => c.id)` for every section;
  - filling `rules` and `entryFormat` for each fixture case of T001 (with that case's `entryIds`) gives exactly that case's `prompt`. Use a small fill helper in the test that replaces each `{{slot}}` once.

### Implementation for the prompt file

- [x] T004 [P] Move the viewport section list from `src/components/ChatBotPanel.tsx` (the inline array near line 184) into an exported constant, `GENIE_VIEWPORT_SECTIONS`, in `src/lib/genie/prompts.ts`, and import it in `ChatBotPanel.tsx`. No behaviour change.
- [x] T005 Create `src/lib/genie/prompt-rules.ts`. Move the rule paragraphs and `COMPACT_PUBLIC_LINKS` out of `buildSystemPrompt` in `src/lib/genie/retriever.ts`. Export:
  - `PROMPT_RULES_TEMPLATE`: today's prompt text with `GENIE_NAME`, `CONTACT_URL` and `CALENDLY_URL` filled in, and the slots `{{language}}`, `{{section}}`, `{{pathname}}`, `{{entries}}` and `{{links}}`, each exactly once;
  - `ENTRY_FORMAT = '[{{title}}] {{facts}} Links: {{links}}'` (entry links joined with `, `);
  - `COMPACT_PUBLIC_LINKS`;
  - `PROMPT_MAX_CHARS = 7500`;
  - `fillPromptSlots(template, values)`: one pass with `/\{\{(\w+)\}\}/g` and a lookup, so a value containing `{{…}}` is never expanded again.
- [x] T006 Change `buildSystemPrompt` in `src/lib/genie/retriever.ts` to fill `PROMPT_RULES_TEMPLATE` and `ENTRY_FORMAT` with `fillPromptSlots`, keeping its signature and its cut (`slice(0, PROMPT_MAX_CHARS - 10)` plus `…`). Export `normalizePathname`. T002 must still pass unchanged.
- [x] T007 Create `src/lib/genie/prompt-file.ts` with `buildPromptFile()`, returning the version 1 object in `contracts/prompt-file.md`:
  - `rules`, `entryFormat`, `links`, `maxChars` from `prompt-rules.ts`;
  - `languages` from `languageName` in `@/lib/i18n-config`;
  - `entries` from `KNOWLEDGE_CHUNKS`;
  - `sections`: `GENIE_VIEWPORT_SECTIONS` plus the `resolveSectionForPathname` values for every path, without repeats;
  - `paths`: the static routes and `/blog/<slug>` per post (research R4), normalized;
  - `defaults` per section, as in T003.

  It throws if any contract rule fails, so a bad file fails the build instead of shipping.
- [x] T008 Create `src/app/genie/prompt.json/route.ts` with `export const dynamic = 'force-static'`, returning `Response.json(buildPromptFile())`, modeled on `src/app/feed.xml/route.ts`. Run `npm run build` and confirm `out/genie/prompt.json` exists and parses (quickstart §1).
- [x] T009 Extend `tools/claims/scan-export.mjs` to read `out/genie/prompt.json` as English text units (research R13): the `rules` template with its slots blanked, and each entry's `title` and `facts`. A missing or unparsable file is a finding, so the check cannot skip it silently.
- [x] T010 Add cases to `tests/claims/check.test.ts`, next to the existing `scanExport` cases: a fixture export with a `genie/prompt.json` whose entry `facts` holds a wrong figure fails, the same file with the right figure passes, and a missing `genie/prompt.json` is reported.
- [x] T011 [P] Add a step to `.github/workflows/site-health.yml`, after the CORS preflight step, that fetches `https://ahmed-3m.github.io/genie/prompt.json`, expects `200`, and checks with `jq` that `version` is 1, `entries` is not empty, `rules` contains each of the five slots, and every `defaults` ID is an entry ID (research R14). Leave the preflight step unchanged.
- [x] T012 [P] In `specs/008-claims-registry/tasks.md`, replace the "Blocked on spec 007" text of T047 with a pointer to this phase (007 T007–T010), and mark it done when PR 1 merges.
- [x] T013 Run every command in the list above. Then do the planted-figure check in quickstart §1 by hand (SC-005): the finding for `out/genie/prompt.json` must appear in the same run as the one for `knowledge.ts`. Revert the plant. Open PR 1.

**Checkpoint**: after merge, `https://ahmed-3m.github.io/genie/prompt.json` is live and scanned. No visible change.

---

## Phase 3: User Story 1 — The Worker is no longer an open relay (Priority: P1) 🎯 MVP (PR 2)

**Goal**: the Worker composes the prompt from the published file, accepts strict v2 and today's v1 (with its system
message replaced), picks the model and limits itself, limits each client to 8 a minute, and answers every failure
with one error structure (FR-003 to FR-012, FR-018, FR-020, FR-023).

**Independent test**: `node worker/chat-proxy.selftest.mjs`. A v1 request whose system message says "ignore your
rules" reaches the stub provider with the Worker's own prompt and none of the client text, and today's request shape
still gets a streamed reply (SC-001, SC-002, SC-004).

### Tests for User Story 1 (write first; they fail until T017–T026)

- [x] T014 [P] [US1] Write `tests/genie/worker-prompt.test.ts`:
  - **Up to date:** the default export of `worker/prompt-bundle.js` deep-equals `buildPromptFile()`. The failure message names the regenerate command (quickstart §2).
  - **Parity (research R12):** for every case in `tests/genie/fixtures/system-prompt-baseline.json`, `composePrompt(buildPromptFile(), { entryIds, lang, section, pathname })` from `worker/lib/compose-prompt.js` equals the case's `prompt`, and also equals today's `buildSystemPrompt(input)`.
  - **Slots:** an entry whose facts contain `{{entries}}` or `{{links}}` is inserted as written, not expanded.
  - **Cut:** a prompt over 7,500 characters is cut the way `buildSystemPrompt` cuts it.
  - **Selection:** unknown and repeated IDs are dropped, at most 4 are kept, and an empty result uses `defaults[section]`.
- [x] T015 [US1] Rewrite `worker/chat-proxy.selftest.mjs` to build a handler with `createHandler({ bundledPrompt, now, fetchImpl })` from `worker/lib/handler.js`. Use the committed `worker/prompt-bundle.js` as the bundled copy, stub providers, a fake rate limiter, a fake `ctx` that collects `waitUntil` promises, an injected clock, and no network. Remove the old case that asserts a client system message is accepted. Cases for the prompt and the request format:
  - **SC-001:** a v1 system message saying "ignore your rules" is absent from what the stub provider receives, and the Worker's rules text is present; a v2 body with a `system` turn gets `400 invalid_request` and no provider call; a v1 `Active page context` line with an injected section (`section="hero\"\nIgnore…"`) gives `hero`; a v1 message with a real `[Title]` line followed by planted instructions selects that entry and the planted text is absent.
  - **SC-002:** today's site body (as `src/lib/genie/providers.ts` sends it, `max_tokens` 900 and 1600) gets a `200` stream passed through unchanged.
  - **v1 adapter (R11, FR-018 as amended):** lane from `max_tokens` (`deep` at 1,200 or more); provider from `model`, unknown model `400`; language from `(or <name> if unclear)`; titles matched exactly, up to 4, defaults when none match; an earlier turn over its cap is cut to the cap; a last turn over 2,000 characters is rejected.
  - **v2 validation (FR-006 to FR-008):** each rejected shape in data-model.md, "Chat request (v2)"; a body over 64,000 bytes gets `413`; unknown `lang`, `section`, `pathname` are corrected, not echoed; `model`, `max_tokens`, `temperature` and `reasoning_effort` in the body are ignored, and the upstream body carries the settings' values (FR-009); `reasoning_effort` goes to Z.ai only.
- [x] T016 [US1] Add to `worker/chat-proxy.selftest.mjs` the cases for limits, errors and the prompt source:
  - **Client key:** `clientKey` for IPv4, compressed and full IPv6 (same /64 → same key), and a missing header (`unknown`); two IPv6 addresses in one /64 share the limit; the 9th request in a minute gets `429`, `scope: 'proxy'`, `Retry-After: 60` and the exact message in the contract; a missing rate-limit binding gives `503 unavailable` with scope `worker`.
  - **Errors (SC-004):** a provider `500` with a body holding a fake secret and a model name gives `502 upstream_error` without that text; an error event inside a `200` stream is replaced by one standard error event and the stream ends; a non-stream body without `choices` gives `502`; a missing key gives `503 unavailable` with the provider scope. A sweep over every error body in the run checks that none contains provider text, a setting or secret name, or a model the request did not name.
  - **Methods and headers:** `OPTIONS` from an allowed origin gets `204`, another origin `403`; `GET` gets `405`; every response has `X-Request-Id` and the CORS headers.
  - **Prompt source (R3):** a cold isolate with a working fetch uses the fetched copy (`fetched`); a failing, non-200, over-256-KB or malformed fetch uses the bundled copy and does not fetch again within 60 seconds; a copy older than 10 minutes is used at once and refreshed through `waitUntil`; every fetch passes `cf: { cacheTtl: 600, cacheEverything: true }`.

### Implementation for User Story 1

- [x] T017 [P] [US1] Create `worker/lib/errors.js`: the code table in `contracts/worker-api.md` (code, status, fixed message), `errorResponse({ code, scope, retryAfter, requestId, headers })` and `errorEvent(...)`, which returns the `data: …\n\n` line for a stream.
- [x] T018 [P] [US1] Create `worker/lib/settings.js`: `readSettings(env)` with the defaults in data-model.md, "Worker settings" (this PR: `PROMPT_URL`, `ALLOW_LOCALHOST`, the model vars, `FAST_MAX_TOKENS`, `DEEP_MAX_TOKENS`, `TEMPERATURE`, `ZAI_REASONING_EFFORT`). A missing or invalid number falls back to its default; a model var outside the allowlist falls back to its default.
- [x] T019 [P] [US1] Create `worker/lib/client-key.js`: `clientKey(ip)` per research R5 (IPv4 as is; IPv6 expanded, first four hextets in lowercase plus `::/64`; else `unknown`).
- [x] T020 [P] [US1] Create `worker/lib/compose-prompt.js`: `composePrompt(file, { entryIds, lang, section, pathname })` per data-model.md, "Composed prompt", with a one-pass slot fill and the same cut as the site. Plain JavaScript, no imports from `src/`.
- [x] T021 [US1] Create `worker/lib/prompt-source.js`: `validatePromptFile(file)` (contract rules 1 to 7) and `createPromptSource({ bundled, url, fetchImpl, now })` with `get(ctx)` returning `{ file, source }`, following research R3: a 2-second wait on a cold isolate, a 60-second pause after a failure, a background refresh after 10 minutes, the `cf` cache options and a 256 KB limit.
- [x] T022 [US1] Create `worker/lib/request.js`: `parseRequest(body, file)` returning `{ request, format }` or an error code. It holds the v2 validation (data-model.md) and the v1 adapter (research R11, FR-018 as amended). For titles, compare each line after `Retrieved portfolio knowledge:` with `` `[${title}] ` `` for each published title (exact prefix match), so no part of the line is parsed or kept.
- [x] T023 [US1] Create `worker/lib/upstream.js`: `callUpstream({ provider, lane, settings, apiKey, prompt, turns, stream })`. It uses the endpoints and authorization header from today's `worker/chat-proxy.js`, sends the body in `contracts/worker-api.md`, "What the Worker sends upstream", reads and drops any error body, and passes a stream through a transform that only looks at lines containing `"error"` (research R8).
- [x] T024 [US1] Create `worker/lib/handler.js`: `createHandler({ bundledPrompt, now, fetchImpl })` returning `{ fetch(request, env, ctx) }`. It runs the checks in the order of `contracts/worker-api.md` (origin, client limit on `POST` only, body, v2 validation, key, then prompt and upstream). It gets the prompt file from the prompt source before parsing the body, because `parseRequest` needs the listed sections, paths, titles and languages; composing the prompt stays at the last step. It also adds a request ID (`crypto.randomUUID()`) and CORS headers to every response, and keeps today's allowed-origin rules.
- [x] T025 [US1] Create `tools/genie/emit-worker-prompt.mjs`. It imports `buildPromptFile()` and writes `worker/prompt-bundle.js` as `export default <object>` with a "generated, do not edit; run …" header. Run it and commit the output. T014 must now pass.
- [x] T026 [US1] Reduce `worker/chat-proxy.js` to the entry: import `./prompt-bundle.js` and `createHandler`, and export the default handler. Remove the KV fallback and the old request handling.
- [x] T027 [P] [US1] In `worker/wrangler.toml`, set `[[ratelimits]]` to `simple = { limit = 8, period = 60 }`, remove the commented KV block, and add the `[vars]` from T018 with their defaults. Add `worker/.dev.vars` and `worker-dist/` to `.gitignore`. Run `npx wrangler deploy --dry-run --outdir worker-dist --config worker/wrangler.toml` to confirm the bundle builds, then delete `worker-dist/`.
- [x] T028 [P] [US1] Update `worker/README.md` (FR-023): the v2 and v1 formats, the error table, the settings and their defaults, the per-client limit, the bundled copy and how to regenerate it, the rollout order (FR-017) and the owner steps in quickstart §4.
- [x] T029 [US1] Confirm `.github/workflows/deploy.yml` still runs `node worker/chat-proxy.selftest.mjs` (path unchanged). Run every command in the list above and the self-test. Open PR 2.
- [ ] T030 [US1] **Owner**, after PR 2 merges (quickstart §4): create separate Z.ai and Groq keys with spend limits where offered; check the Z.ai Coding Plan terms and whether Groq billing is on; set both keys with `npx wrangler secret put` in `worker/`; deploy from `main`; run the site-health workflow by hand (SC-008); ask Genie one question on the live site and check the answer is focused on it (SC-002).

**Checkpoint**: User Story 1 is live. The relay is closed, and today's site still works with no change.

---

## Phase 4: User Story 2 — Model use has a hard ceiling and can be seen (Priority: P2) (PR 3)

**Goal**: per-provider 5-hour and daily budgets that fail closed, a stop switch that survives deploys, upstream
deadlines inside the site's own, content-free telemetry, and a privacy notice that says so (FR-013 to FR-016,
FR-022).

**Independent test**: in the self-test, with a Z.ai cap of 3, the fourth Z.ai request gets `budget_exhausted`, a
Groq request still succeeds, and after the clock moves past the window Z.ai answers again (SC-003). Telemetry points
hold no message text, IP address or user agent (SC-007).

### Tests for User Story 2 (write first; they fail until T033–T037)

- [x] T031 [P] [US2] Write `tests/genie/budget.test.ts` against `worker/lib/budget.js` with an in-memory store: `windowIds` at and around window edges; `consume` allows N, refuses N+1 with `retryAfterSeconds` to the end of the full window, and does not count a refused call; the 5-hour and daily counts reset separately; a full daily count refuses even in a fresh 5-hour window.
- [x] T032 [US2] Add to `worker/chat-proxy.selftest.mjs`, with a fake budget stub and a fake `GENIE_EVENTS` binding:
  - **SC-003:** cap 3 on Z.ai: request 4 gets `503 budget_exhausted`, `scope: 'zai'` and `retryAfter`; Groq answers; after the clock passes the window, Z.ai answers again;
  - **fail closed:** a budget stub that throws or never answers gives `503 unavailable` with scope `worker`, and no provider is called;
  - **stop switch:** `GENIE_STOP=on` gives `503 unavailable` with scope `worker` for every `POST`, no provider call and no budget call; `OPTIONS` still gets `204`;
  - **deadlines:** with small `FIRST_BYTE_MS` and `TOTAL_MS` settings, a provider that never sends headers gives `504 upstream_timeout`, and a stream that runs past the total ends with an `upstream_timeout` error event;
  - **order:** a rejected request (origin, limit, invalid, stop) spends no budget;
  - **telemetry (SC-007):** one point per request that passes validation and none for origin, rate-limit or invalid refusals; the blobs, doubles and index of research R9; `outcome` is `client_abort` when the client cancels a stream; no field holds message text, the client IP, a user agent or the request ID.

### Implementation for User Story 2

- [x] T033 [P] [US2] Create `worker/lib/budget.js`: `windowIds(nowMs)`, `consume(store, { caps, now })`, the `GenieBudget` Durable Object class (its `fetch` reads `{ caps, now }` and answers `{ ok, retryAfterSeconds }`, stored with the SQLite-backed storage API), and `checkBudget({ env, provider, caps, now, timeoutMs })`, which calls `stub.fetch()` with a timeout and throws on any failure. No `cloudflare:` imports (research R6). Check the current Durable Objects storage API in the Cloudflare docs before writing the class.
- [x] T034 [P] [US2] Create `worker/lib/telemetry.js`: `recordPoint(env, point)` writing one Analytics Engine data point in the shape of research R9, and doing nothing when `GENIE_EVENTS` is missing.
- [x] T035 [US2] Extend `worker/lib/settings.js` with `ZAI_CAP_5H` (100), `ZAI_CAP_DAY` (300), `GROQ_CAP_5H` (200), `GROQ_CAP_DAY` (600), `FIRST_BYTE_MS` (18000), `TOTAL_MS` (58000) and `BUDGET_TIMEOUT_MS`. Start `BUDGET_TIMEOUT_MS` at a conservative 2000 until T038 and T042 give measured values.
- [x] T036 [US2] In `worker/lib/handler.js` and `worker/lib/upstream.js`: the stop switch after validation, the budget after the key check (contract order), `budget_exhausted` and fail-closed `unavailable` per the contract table, first-byte and total deadlines with `AbortController` (research R10), and one telemetry point written when the response completes, in the stream transform's end or cancel handler for streams (no `waitUntil`).
- [x] T037 [US2] Export `GenieBudget` from `worker/chat-proxy.js`. In `worker/wrangler.toml`, add the `GENIE_BUDGET` Durable Object binding, `[[migrations]] tag = "v1"` with `new_sqlite_classes = ["GenieBudget"]`, the `GENIE_EVENTS` Analytics Engine binding (dataset `genie_events`) and the T035 vars. Check `compatibility_date = "2024-01-01"` with `wrangler dev` and `wrangler deploy --dry-run` (research R0); move it forward only if a binding needs it, and then read the compatibility flags between the two dates.
- [x] T038 [US2] Measure the budget call's added latency with `npx wrangler dev --config worker/wrangler.toml` (the owner fills `worker/.dev.vars` if a run needs keys; an agent never handles them). Record the measurement in `worker/README.md`. Lower `BUDGET_TIMEOUT_MS` from its starting value only if it stays well above the measured value; the production measurement in T042 decides the final value.
- [x] T039 [P] [US2] Update the "Chat assistant" privacy text in `src/components/LegalContent.tsx` in all five languages, Arabic included (FR-022): the Worker records only counts and timings, never messages or IP addresses. Keep the statement that the IP address is kept for at most one hour. Check the chat panel's AI notice in `src/components/ChatBotPanel.tsx` for the same claim and keep both consistent.
- [x] T040 [P] [US2] Update `worker/README.md`: budgets and caps, the stop switch (`wrangler secret put GENIE_STOP`, delete to resume), the deadlines, the telemetry fields, and example Analytics Engine SQL queries for counts per provider and outcome per day, budget refusals and median time to first byte.
- [x] T041 [US2] (PR 3 is #319, stacked on #318.) Run every command in the list above and the self-test. Check the privacy notice with the UI verification checklist in `AGENTS.md`: light and dark theme, and `ar` (reset `language` to `en` afterwards). Open PR 3.
- [ ] T042 [US2] **Owner**, after PR 3 merges: wait until the site deploy with the new privacy notice is live; confirm the cap values in `worker/wrangler.toml`; deploy the Worker (the migration runs with it); enable Analytics Engine if the dashboard asks; create an API token with Analytics read rights; run one README query to check that points arrive; measure the budget call's latency in production once (research R6) and, if it is close to `BUDGET_TIMEOUT_MS`, raise the timeout and record both numbers in `worker/README.md` (an agent can make that README and settings change in a follow-up PR); run the site-health workflow by hand (SC-008).

**Checkpoint**: model use has a ceiling, can be stopped without a deploy, and is visible without visitor data.

---

## Phase 5: User Story 3 — The site stops sending the prompt (Priority: P3) (PR 4)

**Goal**: the site sends v2 requests with entry IDs and no prompt text, handles each error code, limits the input
to 2,000 characters, and its JavaScript no longer contains the rules (FR-019, SC-006). Starts only after PR 2 is
deployed (FR-017 step 3).

**Independent test**: build, then `npm run verify:export` finds none of the rule sentences in
`out/_next/static/**/*.js`; the browser smoke test sends a v2 body with `entryIds` and shows the streamed reply.

### Tests for User Story 3 (write first)

- [x] T043 [P] [US3] In `tests/genie/providers.test.ts`: the request body has `version: 2`, `turns` without any `system` turn, `lane`, `provider`, `lang`, `section`, `pathname` (normalized: `/research/` is sent as `/research`), `entryIds` (the retrieved IDs) and `stream`, and no `model`, `messages`, `max_tokens`, `temperature` or `reasoning_effort`. Error handling per code (contract, "PR 4 adds code-based handling"): `rate_limited` shows the rate-limit message with `retryAfter` and does not try Groq; `budget_exhausted` or `unavailable` with a provider scope tries the other provider; `unavailable` with scope `worker`, or both providers failing, gives prepared answers with a "models unavailable" note.
- [x] T044 [P] [US3] In `tests/genie/reply.test.ts`: the per-code fallback messages exist in all five languages, and the Groq "Model is warming up" text is no longer used for `503`.

### Implementation for User Story 3

- [x] T045 [US3] In `src/lib/genie/providers.ts`, build the v2 body and handle errors by `error.code` and `scope` as T043 describes. The site no longer sends a model or token settings; it still chooses the provider and lane.
- [x] T046 [US3] In `src/lib/genie/reply.ts`, add the per-code fallback and the "models unavailable" note in all five languages, next to the existing chat strings.
- [x] T047 [US3] In `src/components/ChatBotPanel.tsx`, get `entryIds` from `retrieveKnowledgeChunks(...)` (same query, history, section and path as today) instead of calling `buildSystemPrompt`, pass them to the provider call with the pathname sent as `normalizePathname(pathname) || '/'` (so it matches the published `paths`), and add `maxLength={2000}` to the chat input.
- [x] T048 [US3] Remove `buildSystemPrompt` from `src/lib/genie/retriever.ts`. Make `src/lib/genie/prompt-rules.ts` reachable only from `prompt-file.ts`: add a `no-restricted-imports` rule in `eslint.config.mjs` for `src/components/**` and `src/app/**` (the prompt route excepted) that forbids `@/lib/genie/prompt-rules`. Point `tests/genie/prompt-baseline.test.ts` at `composePrompt(buildPromptFile(), …)` with each case's recorded `entryIds`, so the prompt text stays pinned, and remove the parity part of `tests/genie/worker-prompt.test.ts`.
- [x] T049 [US3] In `tools/verify-export.mjs`, read every rule sentence of 40 characters or more from `out/genie/prompt.json` and fail when any of them is in `out/_next/static/**/*.js` (research R13, SC-006). Check it once by hand: import `prompt-rules.ts` into a client component, build, see the failure, and revert.
- [x] T050 [US3] In `tools/playwright-smoke.mjs`, mock the chat proxy URL in the existing route handler: assert that the request body has `version: 2` and a non-empty `entryIds`, answer with a short event stream, and check that the reply is shown. Confirm that the smoke build sets a proxy URL and that the question asked has no prepared answer, so it reaches the mock; the test fails if the mock is never called.
- [x] T051 [US3] (PR 4 is #325, stacked on #319 and #318.) Run every command in the list above. Check the chat panel with the UI verification checklist in `AGENTS.md` (light and dark, `ar`, then reset `language` to `en`), including the 2,000-character input limit and one error message. Open PR 4. After merge the site deploys; the owner runs the site-health workflow by hand (SC-008).

**Checkpoint**: the site sends no prompt text. The Worker still accepts v1 for old open tabs.

---

## Phase 6: User Story 3 — The Worker drops the old format (PR 5)

**Purpose**: US3 scenario 4, FR-017 step 4. Start no earlier than 7 days after PR 4 is live.

- [ ] T052 [US3] **Owner**: confirm that PR 4 has been live for at least 7 days, and check with the README query that `format = 'v1'` points have dropped to near zero.
- [ ] T053 [US3] In `worker/lib/request.js`, remove the v1 adapter: a body with `messages` and no `version` gets `400 invalid_request`. In `worker/chat-proxy.selftest.mjs`, replace the v1 cases with one that expects the rejection, and keep the system-text cases for v2. Update `worker/README.md` and `specs/007-worker-hardening/contracts/worker-api.md` to drop v1. Run the self-test and `npm test`. Open PR 5.
- [ ] T054 [US3] **Owner**, after PR 5 merges: deploy the Worker and run the site-health workflow by hand (SC-008).

---

## Phase 7: Polish and cross-cutting concerns

- [ ] T055 [P] After each PR, check that `quickstart.md`, `data-model.md` and `contracts/*.md` match what was built (file names, commands, settings, messages), and update them in that PR where the implementation refined a name.
- [x] T056 [P] (PR 1 part done in #316, PR 2 part in #318.) In PR 1 and PR 2, add the new files to the file map in `AGENTS.md`: the prompt route, `prompt-rules.ts`, `prompt-file.ts`, `worker/lib/`, `worker/prompt-bundle.js` and the emit script, with the rule that the bundle is regenerated after any knowledge change.
- [x] T057 Before PR 4 is opened, walk SC-001 to SC-008 and name the test or check that proves each one in the PR description.

---

## Dependencies and execution order

### Phase dependencies

- **Setup (Phase 1)**: none. T001 must run before any code change.
- **Foundational (Phase 2)**: depends on Phase 1. It is PR 1, and blocks every story.
- **US1 (Phase 3)**: depends on PR 1 being merged (it imports `buildPromptFile()` and the fixture). It is PR 2. The owner deploys it after T030's key steps.
- **US2 (Phase 4)**: depends on PR 2 merged (it extends the handler). It is PR 3. Its Worker deploy waits for its own site deploy (the privacy notice).
- **US3 site switch (Phase 5)**: depends on PR 2 being deployed (FR-017 step 3), not on PR 3. It is PR 4.
- **US3 v1 removal (Phase 6)**: depends on PR 4 live for at least 7 days. It is PR 5.
- **Polish (Phase 7)**: within the PR each task belongs to.

### Within phases

- **Phase 1**: T001 → T002.
- **Phase 2**: T003 and T004 first. T005 → T006 → T007 → T008 → T009 → T010. T011 and T012 are independent. T013 last.
- **US1**: T014–T016 are written first and fail. T017–T020 are independent. T021 and T022 are independent of each other; T023 needs T017 and T018; T024 needs T017–T023. T025 → T026. T027 and T028 are independent. T029, then T030.
- **US2**: T031 and T032 first. T033 and T034 are independent. T035 → T036 → T037 → T038. T039 and T040 are independent. T041, then T042.
- **US3**: T043 and T044 first. T045 → T047 → T048 → T049. T046 can run beside T045. T050 after T047. T051 last.

## Parallel examples

```text
# Phase 2, after T001–T002:
T003 prompt-file.test.ts · T004 GENIE_VIEWPORT_SECTIONS · T011 site-health.yml · T012 008 tasks note

# US1, after the tests are written:
T017 errors.js · T018 settings.js · T019 client-key.js · T020 compose-prompt.js · T027 wrangler.toml · T028 README

# US2:
T031 budget.test.ts · T033 budget.js · T034 telemetry.js · T039 LegalContent.tsx (five languages)

# US3:
T043 providers.test.ts · T044 reply.test.ts · T046 reply.ts
```

## Implementation strategy

- **MVP**: PR 1, then PR 2 and the owner's first deploy. This closes the open relay (the reason for the feature)
  with no site change.
- **Then PR 3**: the ceiling and telemetry. The site deploy with the privacy notice goes live before the Worker
  deploy.
- **Then PR 4**: the site switch. It can be prepared while PR 3 is in review, since it needs only PR 2 deployed.
- **Last, PR 5**: v1 removal, at least 7 days after PR 4 is live.

## Notes

- Never handle API keys or secrets, and never deploy the Worker. Those are owner tasks.
- `worker/prompt-bundle.js` is generated. Regenerate it with `node --import ./tools/test-hooks.mjs tools/genie/emit-worker-prompt.mjs` after any change to `knowledge.ts`, `prompt-rules.ts` or the claims registry; `npm test` fails until it is current.
- Never write a retired figure as a plain literal in any fixture or test (008 rule). The T001 fixture holds today's prompt text, which uses only current figures.
- Before pushing follow-ups to a PR, check it is still open (`gh pr view <n> --json state`). Agents never merge their own PRs (CLAUDE.md).
