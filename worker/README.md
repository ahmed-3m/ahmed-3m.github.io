# ahmed-chat-proxy

An optional Cloudflare Worker that proxies the portfolio's ChatBot requests to
the Z.ai API (GLM Coding Plan, `api.z.ai`). It keeps the real
API key server-side so it is never inlined into the static JavaScript
bundle that ships to visitors' browsers.

Production currently stays on disposable `NEXT_PUBLIC_*` tokens. Do **not**
set `NEXT_PUBLIC_CHAT_PROXY_URL` in `.github/workflows/deploy.yml` until this
Worker is deployed with the rate-limit binding and a live SSE smoke test has
passed.

## Why this exists

Before this proxy, the ChatBot called BigModel (and Groq) **directly from the
browser** using `NEXT_PUBLIC_BIGMODEL_TOKEN` / `NEXT_PUBLIC_GROQ_TOKEN`. Anything
prefixed with `NEXT_PUBLIC_` is inlined into the static bundle at build time and
is therefore publicly extractable by anyone who opens the site's JS. Those keys
must be treated as disposable and rate-limited — anyone can grab them and burn
your quota.

This Worker fixes that: the browser POSTs to the Worker with **no** API key, and
the Worker attaches the real `ZAI_API_KEY` secret (stored only in Cloudflare)
before forwarding the request to BigModel. The secret never reaches the client.

> **Note on the `ZAI_API_KEY` binding name:** this is the Cloudflare secret
> *binding name* (set via `wrangler secret put ZAI_API_KEY`) and is retained for
> backward compatibility with existing deployments. The *value* it holds is a
> Z.ai (`api.z.ai`) GLM Coding Plan key, not an open.bigmodel.cn one.

## Deploy

Prerequisites: a free Cloudflare account. Wrangler 4.36.0+ is required for the
Rate Limiting binding.

```bash
# 1. Install the Wrangler CLI (Node 16.17+ required).
npm i -g wrangler

# 2. Authenticate with Cloudflare (opens a browser).
wrangler login

# 3. From this worker/ directory, set the Z.ai GLM Coding Plan API key as a secret.
#    You will be prompted to paste the key. It is stored encrypted in Cloudflare
#    and is never written to this repo.
wrangler secret put ZAI_API_KEY

# 4. Deploy the Worker (wrangler.toml already declares CHAT_RATE_LIMIT).
wrangler deploy
```

After deploying, Wrangler prints the Worker URL, e.g.
`https://ahmed-chat-proxy.<your-subdomain>.workers.dev`.

### Rate limiting

Quota uses Cloudflare's Rate Limiting binding `CHAT_RATE_LIMIT`, **not** KV.
The cap is **20 requests per 60-second period** per key (Cloudflare's maximum
period is 60 seconds). This is a per-minute limit, not the old 60/hour KV window.

`wrangler.toml` declares:

```toml
[[ratelimits]]
name = "CHAT_RATE_LIMIT"
namespace_id = "1001"
simple = { limit = 20, period = 60 }
```

The Worker calls `env.CHAT_RATE_LIMIT.limit({ key: ip })` (`CF-Connecting-IP`,
falling back to `"unknown"`):

- Missing binding → **503**
- `{ success: false }` → **429**

### CORS is not authentication

`Access-Control-Allow-Origin` is never `*`.

- Present but unknown Origin → **403**, no `Access-Control-Allow-Origin`.
- Missing Origin (non-browser) → allowed, but still rate-limited.
- Known Origin (`https://ahmed-3m.github.io` or `http://localhost:3000`) is echoed.

### Request rules

- `model` must be one of `glm-5.3`, `glm-5-turbo`, `glm-5.3-flash`; anything else
  is replaced with `glm-5.3`.
- `messages`: length 1–24; each `role` is `system|user|assistant`; each
  `content` is a string of at most 4000 characters.
- `stream: true` is forwarded and the upstream SSE body is piped unbuffered.
- `reasoning_effort` is forwarded only when it is `low`, `medium`, or `high`.
- Upstream status and body are propagated.

## Enable on the site (follow-up)

Do **not** add `NEXT_PUBLIC_CHAT_PROXY_URL` to `.github/workflows/deploy.yml`
in this change. Enabling the proxy is a follow-up after `wrangler deploy` with
the rate-limit binding and a live SSE smoke test.

When that follow-up happens, set `NEXT_PUBLIC_CHAT_PROXY_URL` to the Worker URL
in GitHub repository secrets. Example value:

```
NEXT_PUBLIC_CHAT_PROXY_URL=https://ahmed-chat-proxy.your-subdomain.workers.dev
```

That env var is read at build time and inlined into the bundle. The Worker URL
is safe to expose (it has no secret in it).

## How it works

- When `NEXT_PUBLIC_CHAT_PROXY_URL` is set, the `zaiProvider` in
  `src/components/ChatBot.tsx` POSTs `{ messages, model, max_tokens, temperature }`
  to the proxy URL **without** an `Authorization` header. The proxy adds the key.
- When `NEXT_PUBLIC_CHAT_PROXY_URL` is **not** set, the ChatBot falls back to
  direct-call behavior using `NEXT_PUBLIC_BIGMODEL_TOKEN`. **Note:** keys are
  provisioned per host — configure `NEXT_PUBLIC_BIGMODEL_TOKEN` with a valid
  Z.ai (`api.z.ai`) key; an `open.bigmodel.cn` key will not authenticate.
- The proxy enforces a hard `MAX_TOKENS` cap (2048 — glm-5.3 needs the room:
  its thinking tokens count against `max_tokens`) and only accepts POST
  requests; all other methods get a `405`. Malformed bodies get `400`.
- The `ZAI_API_KEY` lives only in Cloudflare and is referenced from the Worker as
  `env.ZAI_API_KEY`. It is never logged or returned to the client.

## Tests

From the repo root:

```bash
node worker/chat-proxy.selftest.mjs
```

The self-test imports the Worker module and calls `export default.fetch`.

## Future: proxying Groq

The Groq provider currently still calls `api.groq.com` directly from the browser
using `NEXT_PUBLIC_GROQ_TOKEN`. The same proxy pattern can be extended to Groq
in the future (e.g. add a `/groq` route and a `GROQ_API_KEY` secret) if the Groq
token becomes a concern. For now Groq remains a direct-call fallback provider.
