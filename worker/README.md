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
- It answers **every failure with one error structure** that holds no provider text.

The full contract is in `specs/007-worker-hardening/contracts/worker-api.md`.

## Files

| File | What it does |
|---|---|
| `chat-proxy.js` | The entry point: `createHandler({ bundledPrompt })`. |
| `lib/handler.js` | The request handler. Runs the checks in the contract's order. |
| `lib/request.js` | Reads and checks a v2 body, and adapts a v1 body to v2. |
| `lib/compose-prompt.js` | Builds the system prompt from the prompt file. Matches the site's `buildSystemPrompt`. |
| `lib/prompt-source.js` | Fetches and checks the published prompt file, with the bundled copy as fallback. |
| `lib/upstream.js` | Calls the provider and replaces provider errors, including error events in a stream. |
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
5. **Key.** A missing provider key gives `503` for that provider.
6. **Prompt and upstream call.**

PR 3 adds the stop switch, the shared budgets, deadlines and telemetry.

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
| `budget_exhausted` | 503 | This model is unavailable right now. | `zai` or `groq` (PR 3) |
| `upstream_error` | 502 | The model could not answer. | `zai` or `groq` |
| `upstream_timeout` | 504 | The model took too long to answer. | `zai` or `groq` (PR 3) |

Every response carries `X-Request-Id`. A `429` also carries `Retry-After: 60`. A provider's
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
| `CHAT_RATE_LIMITER` | binding | `{ limit = 8, period = 60 }` |

A var that is missing or invalid falls back to its default. A model var outside the
allowlist in `lib/settings.js` falls back to its default.

### The prompt file

On a cold start the Worker waits up to 2 seconds for the published prompt file. If the fetch
fails, answers with another status than `200`, is over 256 KB or fails the shape check, the
Worker uses the bundled copy and does not try again for 60 seconds. A copy older than 10
minutes is used at once and refreshed in the background.

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

The self-test covers the checks, the v1 adapter, the errors, the stream error events and the
prompt source. `tests/genie/worker-compat.test.ts` runs the site's own request code against
the Worker, and `tests/genie/worker-prompt.test.ts` checks the bundle and that the Worker's
prompt matches the site's.
