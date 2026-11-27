# Implementation Plan: Genie Worker Hardening

**Branch**: `spec/007-worker-hardening` (this plan). Each delivery PR gets its own branch off `main`.

**Date**: 2026-11-28

**Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-worker-hardening/spec.md`

## Summary

The chat Worker stops forwarding client system text.

**Site side.** The site build publishes `genie/prompt.json`, made from the same knowledge and claims modules as the
site:
- the rules template;
- every knowledge entry;
- the links and language names;
- the allowed sections and paths;
- the default entries for each section.

The figure check from spec 008 scans this file.

**Worker side.**
- **Composing the prompt.** The Worker composes the prompt from the file. It fetches the file in the background and
  keeps it for 10 minutes. If the fetch fails, it uses a copy committed with the Worker.
- **Requests.** It accepts a strict v2 request, which carries entry IDs and page context but no prompt text. It
  also accepts today's request shape: it drops that shape's system message and reads only listed values from it.
- **Its own settings.** The Worker picks the model and token limit.
- **Limits.** It limits each IPv4 address or IPv6 /64 to 8 requests a minute.
- **Errors.** It answers every failure with one error structure that today's site already understands.

**Part 2.**
- Per-provider 5-hour and daily budgets, counted in a SQLite Durable Object that fails closed.
- A stop switch kept as a secret, so a deploy cannot undo it.
- Upstream deadlines set just inside the site's own.
- Content-free telemetry in Analytics Engine.

**Then:**
- The site switches to v2 and drops the prompt from its JavaScript.
- At least 7 days later, the Worker drops v1.

## Technical Context

**Language/Version**:
- **Site:** TypeScript 5 with Next.js (static export).
- **Worker:** plain JavaScript ES modules, run in Cloudflare Workers and, for the self-test, in Node.

**Primary Dependencies**: none new. Wrangler (owner's machine) for deploys; existing `tools/test-hooks.mjs` for
running TypeScript modules in Node.

**Storage**:
- the prompt file in the static export;
- a committed bundled copy in `worker/`;
- budget counters in a SQLite-backed Durable Object (Free plan, research R0, R6);
- telemetry in Workers Analytics Engine (Free plan, R0, R9).

**Testing**:
- `npm test` (Node test runner, `tests/**/*.test.ts`);
- `node worker/chat-proxy.selftest.mjs`, run in CI by `deploy.yml`;
- `npm run verify:export`, which includes the figure check;
- the site-health canary workflow;
- the existing browser test for the chat flow (PR 4).

**Target Platform**: GitHub Pages (site), Cloudflare Workers Free plan (Worker).

**Project Type**: static website plus one edge Worker.

**Performance Goals**:
- No added wait for the prompt file on any request: it refreshes in the background.
- The budget call adds one Durable Object round trip. Its latency is not in the docs and is measured during PR 3
  (R6).

**Constraints**:
- 10 ms CPU per Worker request (Free), so the stream filter handles only lines that can contain an error.
- Composed prompt ≤ 7,500 characters.
- Rate-limit periods of 10 or 60 seconds only.
- Durable Object and Analytics Engine daily limits (R0).
- The owner deploys the Worker by hand and holds every key.

**Scale/Scope**:
- a portfolio site, with traffic of at most hundreds of model requests a day;
- 18 knowledge entries, 9 sections, about 20 paths;
- one Worker, one Durable Object class, one dataset.

## Constitution Check

*Gate: must pass before research. Re-checked after design.*

| Principle | Check | Result |
|---|---|---|
| I. Evidence-First | The prompt file is generated from the knowledge entries, which take their figures from the claims registry. The Worker adds no facts. | Pass |
| II. Cross-Artifact Consistency | One source (`knowledge.ts` plus `prompt-rules.ts`) feeds the site, the prompt file and the bundled copy. A test keeps the bundled copy equal to the build output, and a parity test keeps the Worker's composer equal to the site's until PR 4. | Pass |
| III. Honest Scope Qualifiers | The rules text keeps the "benchmark results, not general production accuracy" rule and the RWR Karte wording. The figure check scans the prompt file for missing qualifiers. | Pass |
| IV. Static Export Integrity | The prompt file is a static route in the export. The Worker is the documented edge worker the constitution allows. No server runtime is added to the site. | Pass |
| V. Multilingual | The prompt still names the visitor's language from five. The privacy notice change (FR-022) is made in all five languages, including Arabic. | Pass |
| Branch Discipline | Every PR branches off `main`, and agents never merge. | Pass |
| Claim Integrity Standards | The figure check covers the prompt file (FR-002, SC-005). This completes 008 T047. | Pass |
| Quality Gates | Lint, typecheck, tests, build, `verify:export` and the Worker self-test run in CI for every PR. | Pass |

**Re-check after design.** Still a pass. The design adds no site runtime, no new figures and no untranslated text.
The privacy promise gets stronger, not weaker: the Worker records counts and timings only.

## Project Structure

### Documentation (this feature)

```text
specs/007-worker-hardening/
├── spec.md
├── plan.md              # this file
├── research.md          # R0–R15
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── worker-api.md
│   └── prompt-file.md
├── checklists/requirements.md
└── tasks.md             # next step (/speckit-tasks), not written yet
```

### Source code

```text
src/
├── app/genie/prompt.json/route.ts     # PR 1: static route, force-static
├── lib/genie/
│   ├── prompt-rules.ts                # PR 1: rules template and link list, moved out of retriever.ts
│   ├── prompt-file.ts                 # PR 1: buildPromptFile(), sections, paths, defaults
│   ├── retriever.ts                   # PR 1: buildSystemPrompt fills the shared template; PR 4: composer removed
│   ├── providers.ts                   # PR 4: v2 request body, code-based errors
│   └── reply.ts                       # PR 4: per-code fallback
├── components/ChatBotPanel.tsx        # PR 4: input maxLength 2000
└── components/LegalContent.tsx        # PR 3: privacy notice, five languages

worker/
├── chat-proxy.js                      # PR 2: entry; imports prompt-bundle.js; exports handler and GenieBudget
├── prompt-bundle.js                   # PR 2: generated, committed copy of the prompt file
├── lib/
│   ├── handler.js                     # PR 2: createHandler({ bundledPrompt, now, fetchImpl })
│   ├── request.js                     # PR 2: v2 validation, v1 adapter
│   ├── compose-prompt.js              # PR 2: composePrompt(file, selection)
│   ├── prompt-source.js               # PR 2: cached and bundled copies, background refresh, shape check
│   ├── client-key.js                  # PR 2: IPv4 or IPv6 /64
│   ├── errors.js                      # PR 2: codes, statuses, messages, stream error event
│   ├── settings.js                    # PR 2: settings with defaults and the model allowlist
│   ├── upstream.js                    # PR 2: provider call, stream filter; PR 3: deadlines
│   ├── budget.js                      # PR 3: windowIds, consume, GenieBudget class (no cloudflare: imports)
│   └── telemetry.js                   # PR 3: writeDataPoint, no-op without a binding
├── chat-proxy.selftest.mjs            # PR 2: rewritten; PR 3: budget, stop, deadline, telemetry cases
├── wrangler.toml                      # PR 2: limit 8/60, PROMPT_URL, model vars; PR 3: DO, migration, dataset, caps
└── README.md                          # PR 2 and PR 3 (FR-023)

tools/
├── genie/emit-worker-prompt.mjs       # PR 2: writes worker/prompt-bundle.js
├── claims/scan-export.mjs             # PR 1: scans out/genie/prompt.json
└── verify-export.mjs                  # PR 4: rule sentences absent from JS bundles

tests/genie/
├── prompt-file.test.ts                # PR 1: shape rules, routes vs paths, unchanged prompt text
├── worker-prompt.test.ts              # PR 2: bundled copy up to date; composer parity with the site
└── budget.test.ts                     # PR 3: windows and consume on an in-memory store

.github/workflows/
├── site-health.yml                    # PR 1: prompt file check
└── deploy.yml                         # PR 2: self-test path unchanged unless renamed
```

**Structure decision.**
- The site keeps its layout. New Genie modules sit beside the existing ones in `src/lib/genie/`.
- The Worker grows from one file to an entry plus `worker/lib/`. This lets the self-test build a handler from a
  fixture, and keeps every `cloudflare:` dependency out of the modules Node loads.
- PR 2 adds `worker/.dev.vars` and `worker-dist/` to `.gitignore`.

## Delivery

Five PRs, in the order FR-017 requires. Each one branches off `main` and is merged by the owner.

| PR | Scope | Stories and FRs | Deploy after merge |
|---|---|---|---|
| 1 | Site publishes the prompt file. Rules move to `prompt-rules.ts`, with no change to the prompt text. The figure check scans the file. The site-health check is added. | US1 scenario 8; FR-001, FR-002, FR-021; 008 T047 | The site deploys on merge. |
| 2 | Worker US1: composer, v2 and v1, client key and limit, error structure, stream error events, committed bundled copy, self-test rewrite, README. | US1; FR-003 to FR-012, FR-018, FR-020, FR-023 | The owner deploys the Worker, after the key and terms actions. |
| 3 | Worker US2: budget Durable Object, stop switch, deadlines, telemetry. Privacy notice in five languages. README. | US2; FR-013 to FR-016, FR-022 | The site deploys on merge, then the owner deploys the Worker. |
| 4 | Site US3: v2 requests with entry IDs, code-based error handling, input limit, composer and rules out of the client bundle, export check. | US3 scenarios 1–3; FR-019, SC-006 | The site deploys on merge. |
| 5 | Worker drops v1. The self-test expects v1 to be rejected. | US3 scenario 4; FR-017 step 4 | The owner deploys, at least 7 days after PR 4 is live. |

**Notes.**
- **PR 2 and PR 3 can swap order.** The spec lets US1 ship alone. PR 3 depends on PR 2's handler.
- **The privacy notice must be live before telemetry is deployed.** PR 3's site change goes live on merge, before
  the owner deploys the Worker.
- **After each Worker deploy,** the owner runs the site-health workflow by hand (SC-008).

## Open decisions for the owner

These need an answer when the plan is approved. Each has a recommendation and a fallback.

1. **v1 entry selection.** This is a proposed amendment to FR-018 (research R11).
   - *Recommended:* read the retrieved entry titles from today's system message and match them exactly against
     the published titles. This keeps per-question focus for all traffic until the site switch.
   - *As written today:* always use the section defaults.

   If approved, FR-018 is updated in this PR.
2. **v1 history turns over a cap.** Also an FR-018 amendment.
   - *Recommended:* in v1 only, earlier turns over a cap are cut to the cap. Today's input has no length limit, so a
     long paste would otherwise break the next 15 requests.
   - *Alternative:* reject them, as FR-008 says for v2.
3. **Status for budget and stop-switch errors.**
   - *Recommended:* `503`. Today's site then tries the other provider and falls back to prepared answers.
   - *Alternative:* `429`, which today's site would show as the rate-limit message when no prepared answer
     matches.
4. **Starting caps.**
   - *Proposed:* Z.ai 100 per 5 hours and 300 a day; Groq 200 per 5 hours and 600 a day.
   - These are guesses with no usage data. The owner may lower them, for example to fit the Z.ai Coding Plan's own
     limits.
5. **Budget store failure.**
   - *Recommended:* fail closed. No model calls while the counter is down.
   - *Alternative:* fail open with a telemetry outcome, which keeps answers but drops the ceiling.

## Complexity Tracking

No constitution violations. Two choices add moving parts and are kept on purpose:
- **The Durable Object.** It is the only Free-plan store that counts correctly across concurrent requests.
- **The committed bundled copy.** It is checked by a test instead of generated at deploy. A deploy-time step would
  run only on the owner's machine, with no figure check.
