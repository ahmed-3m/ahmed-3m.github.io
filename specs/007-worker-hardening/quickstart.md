# Quickstart: Genie Worker Hardening (spec 007)

How to check each part of this feature locally, and the owner's deploy steps. None of the checks calls the live
Worker or a model provider.

## 1. The prompt file (PR 1)

Build the site and look at the file:

```powershell
npm run build
```

```powershell
node -e "const f=JSON.parse(require('fs').readFileSync('out/genie/prompt.json','utf8')); console.log(f.version, f.entries.length, Object.keys(f.defaults).length)"
```

Then run the export check, which includes the figure check on the prompt file:

```powershell
npm run verify:export
```

Revert `src/lib/news-homepage.json` after a build if it changed.

**Planted figure (SC-005).**
1. Change one figure inside a fact in `src/lib/genie/knowledge.ts` to a typed wrong value, for example `99.13%`.
2. Run `npm run build` and `npm run verify:export`.
3. Expect a finding for `out/genie/prompt.json`, in the same run as the source finding for `knowledge.ts`.
4. Revert the change.

**Prompt text unchanged.** `npm test` includes a test that pins `buildSystemPrompt` output to its value from before
PR 1.

## 2. The Worker (PR 2 and PR 3)

Run the self-test. It runs the handler in Node with stub providers, a fake rate limiter, a fake budget store and a
fake telemetry binding:

```powershell
node worker/chat-proxy.selftest.mjs
```

It covers:
- client system text never reaching a provider, in v1, in v2, and through the section or path (SC-001);
- today's request shape getting a streamed reply (SC-002);
- the caps, the rejected v2 shapes and the error structure (SC-004);
- the per-client limit and the /64 key;
- with a cap of N, request N+1 refused and the other provider still answering, then answering again after the
  window reset, using an injected clock (SC-003);
- the stop switch, the first-byte and total deadlines, and an error event inside a stream;
- telemetry points with no message text or IP address (SC-007).

Then check that the bundled copy is current:

```powershell
npm test
```

If the up-to-date test fails after a knowledge change, regenerate the copy and commit it:

```powershell
node --import ./tools/test-hooks.mjs tools/genie/emit-worker-prompt.mjs
```

To see exactly what Wrangler will upload, without deploying:

```powershell
npx wrangler deploy --dry-run --outdir worker-dist --config worker/wrangler.toml
```

Delete `worker-dist` afterwards; it is not committed.

**Local run.** `npx wrangler dev --config worker/wrangler.toml` serves the Worker with a local rate limiter, a local
Durable Object, and `ALLOW_LOCALHOST`. It needs `worker/.dev.vars` with test keys. That file is git-ignored and is
the owner's to fill in. Use it to measure the budget call's latency (research R6).

## 3. The site switch (PR 4)

```powershell
npm run build
```

```powershell
npm run verify:export
```

`verify:export` now fails if any rule sentence from `out/genie/prompt.json` is in `out/_next/static/**/*.js`
(SC-006). The browser test mocks the Worker and checks that the request body has `version: 2` and `entryIds`, and
that the streamed reply is shown. Error handling for each code is covered in `tests/genie/providers.test.ts` and
`reply.test.ts`.

## 4. Owner deploy steps

The owner does these steps. An agent never handles keys or deploys the Worker.

**Before the first deploy (after PR 2 merges):**
1. Create separate Z.ai and Groq keys, with spend limits where the provider offers them.
2. Check the Z.ai Coding Plan terms for serving a public website, and whether Groq billing is on.
3. From `worker/`, set the keys with `npx wrangler secret put ZAI_API_KEY` and
   `npx wrangler secret put GROQ_API_KEY`.

**Each deploy:**
1. Deploy from `main`: `npx wrangler deploy` in `worker/`.
2. Run the site-health workflow by hand. The preflight and the prompt file must pass (SC-008).
3. Ask Genie one question on the live site and check that the answer is focused on the question.

**PR 3 deploy:**
1. Confirm the cap values in `worker/wrangler.toml`.
2. The deploy runs the Durable Object migration (`new_sqlite_classes = ["GenieBudget"]`).
3. Enable Analytics Engine if the dashboard asks. Create an API token with Analytics read rights for queries.
4. Run one query from `worker/README.md` to check that points arrive.

**Stopping all model calls:**

```powershell
npx wrangler secret put GENIE_STOP
```

Enter `on` when asked. The site falls back to prepared answers. To resume:

```powershell
npx wrangler secret delete GENIE_STOP
```

**PR 5**, at least 7 days after PR 4 is live: merge the removal of the v1 format, then deploy the Worker.
