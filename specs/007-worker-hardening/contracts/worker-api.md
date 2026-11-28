# Contract: Chat Worker API

The Worker serves one URL (the site's `NEXT_PUBLIC_CHAT_PROXY_URL`). Today's behaviour is in `worker/README.md`.
This contract replaces it from PR 2.

## Methods

| Method | Allowed origin | Other origin |
|---|---|---|
| `OPTIONS` | `204` with CORS headers (unchanged; the site-health canary checks it) | `403 origin_not_allowed` |
| `POST` | Handled as below. | `403 origin_not_allowed` |
| anything else | `405 invalid_request` | `403 origin_not_allowed` |

The allowed origins are `https://ahmed-3m.github.io`, plus `http://localhost:3000` when `ALLOW_LOCALHOST` is `true`.
These are unchanged.

## Order of checks for `POST`

1. Origin.
2. Per-client limit: 8 a minute per IPv4 address or IPv6 /64.
3. Body: at most 64,000 bytes; JSON. A v1 body is converted to v2 here.
4. v2 validation.
5. Stop switch.
6. Provider key present.
7. Budget for the provider.
8. Prompt composition and the upstream call, with deadlines.

The first failing step answers. Steps 1 to 6 never reach a provider or the budget.

## Request (v2)

```json
{
  "version": 2,
  "turns": [
    { "role": "user", "content": "What did Ahmed's thesis find?" }
  ],
  "lane": "fast",
  "provider": "zai",
  "lang": "en",
  "section": "research",
  "pathname": "/research",
  "entryIds": ["diffusion-headline", "diffusion-benchmarks"],
  "stream": true
}
```

| Field | Required | Values |
|---|---|---|
| `version` | yes | `2` |
| `turns` | yes | 1 to 16 turns. Roles `user` or `assistant` only. The last turn is `user`. User turns ≤ 2,000 characters, assistant turns ≤ 8,000. |
| `lane` | yes | `fast` or `deep` |
| `provider` | yes | `zai` or `groq` |
| `lang` | no | `en`, `de`, `fr`, `es`, `ar`. Anything else is treated as `en`. |
| `section` | no | A section listed in the prompt file. Anything else is treated as `hero`. |
| `pathname` | no | A path listed in the prompt file. Anything else is treated as `/`. |
| `entryIds` | no | Up to 4 strings. Unknown IDs are dropped. If none remain, the section's defaults are used. |
| `stream` | no | Boolean, default `true`. |

The Worker ignores all other fields, including `model`, `max_tokens`, `temperature` and `reasoning_effort`.

## Request (v1, accepted until PR 5)

Today's body: `{ model, messages, max_tokens, temperature, stream, reasoning_effort? }`. It is converted as in
data-model.md, "Chat request (v1)". Every system message is dropped, and the Worker's own prompt is used.

## What the Worker sends upstream

```json
{
  "model": "<from the lane and provider settings>",
  "messages": [{ "role": "system", "content": "<composed prompt>" }, "...the turns..."],
  "max_tokens": 900,
  "temperature": 0.3,
  "stream": true,
  "reasoning_effort": "low"
}
```

`reasoning_effort` is sent to Z.ai only. The endpoints and the authorization header are unchanged.

## Success

- **Stream:** `200`, `Content-Type: text/event-stream`. The provider's events pass through unchanged, except:
  - an event carrying an `error` is replaced by one standard error event, and the stream ends;
  - a stream that passes the total deadline ends with an `upstream_timeout` error event.
- **Not streamed:** `200`, the provider's JSON body when it has a `choices` array. Any other body is
  `502 upstream_error`.

Every response has `X-Request-Id` and the CORS headers for the allowed origin.

## Errors

The body is always:

```json
{
  "error": { "code": "rate_limited", "message": "Rate limit exceeded. Please try again later." },
  "scope": "proxy",
  "retryAfter": 60,
  "requestId": "6f1c…"
}
```

The same object, after `data: `, is the standard error event inside a stream.

| Code | Status | Scope | When | Message | `retryAfter` / `Retry-After` |
|---|---|---|---|---|---|
| `invalid_request` | 400, 405 or 413 | `proxy` | Bad JSON, bad shape, over a cap, wrong method, unknown v1 model | `Invalid request.` | — |
| `origin_not_allowed` | 403 | `proxy` | Origin not allowed | `Origin not allowed.` | — |
| `rate_limited` | 429 | `proxy` | Per-client limit | `Rate limit exceeded. Please try again later.` | 60 |
| `budget_exhausted` | 503 | `zai` or `groq` | That provider's 5-hour or daily cap is reached | `This model is unavailable right now.` | Seconds until the full window ends |
| `unavailable` | 503 | `worker` | Stop switch on, budget store failed, rate limiter missing | `Models are unavailable right now.` | — |
| `unavailable` | 503 | `zai` or `groq` | That provider's key is not set | `This model is unavailable right now.` | — |
| `upstream_error` | 502 | `zai` or `groq` | Provider status ≥ 400, unreadable body, or an error event | `The model could not answer.` | — |
| `upstream_timeout` | 504 | `zai` or `groq` | No first byte in 18 s, or the stream ran past 58 s | `The model took too long to answer.` | — |

The `503` status for the budget and the stop switch was approved by the owner on 2026-11-28 (plan.md, decision 3).

**Never in a response:** a provider's error body, a secret or setting name, a model name the client did not ask
for, or the composed prompt.

## How today's site reads these (until PR 4)

- `rate_limited`, `429` with scope `proxy`: `isProxyRateLimitPayload` is true. The site shows the rate-limit
  message and skips Groq. This is unchanged.
- Any other error: the site tries Groq after Z.ai. When both fail, it shows a prepared answer (`fallback`) when one
  matches, and otherwise the generic error message.
- `error.message` and `error.code` are read by `throwProviderError`.

PR 4 adds code-based handling (US3 scenario 3):
- `rate_limited`: the rate-limit message with `retryAfter`;
- `budget_exhausted` or `unavailable` with a provider scope: try the other provider;
- `unavailable` with scope `worker`, or both providers failed: prepared answers with a "models unavailable" note.

As built (#325): the site asks Z.ai first and Groq second, so "the other provider" is always Groq. Since the
site's chain only runs Z.ai → Groq, a Groq error goes straight to prepared answers. `requestModelReply` in
`src/lib/genie/reply.ts` routes by code. A prepared answer carries the `fallbackNotice` line. When no prepared
answer fits, `chatErrorMessage` shows `rateLimitedRetry` (with the seconds), `limitedAnswers` or `genericError`.
