# ahmed-chat-proxy

An optional Cloudflare Worker that proxies the portfolio's ChatBot requests to
the Z.ai API. It keeps the real Z.ai API key server-side so it is never inlined
into the static JavaScript bundle that ships to visitors' browsers.

## Why this exists

Before this proxy, the ChatBot called Z.ai (and Groq) **directly from the
browser** using `NEXT_PUBLIC_ZAI_TOKEN` / `NEXT_PUBLIC_GROQ_TOKEN`. Anything
prefixed with `NEXT_PUBLIC_` is inlined into the static bundle at build time and
is therefore publicly extractable by anyone who opens the site's JS. Those keys
must be treated as disposable and rate-limited — anyone can grab them and burn
your quota.

This Worker fixes that: the browser POSTs to the Worker with **no** API key, and
the Worker attaches the real `ZAI_API_KEY` secret (stored only in Cloudflare)
before forwarding the request to Z.ai. The secret never reaches the client.

## Deploy

Prerequisites: a free Cloudflare account.

```bash
# 1. Install the Wrangler CLI (Node 16.17+ required).
npm i -g wrangler

# 2. Authenticate with Cloudflare (opens a browser).
wrangler login

# 3. From this worker/ directory, set the Z.ai API key as a secret.
#    You will be prompted to paste the key. It is stored encrypted in Cloudflare
#    and is never written to this repo.
wrangler secret put ZAI_API_KEY

# 4. Deploy the Worker.
wrangler deploy
```

After deploying, Wrangler prints the Worker URL, e.g.
`https://ahmed-chat-proxy.<your-subdomain>.workers.dev`.

### (Optional) Enable IP-based rate limiting

The Worker supports a simple per-IP rate limit using a Cloudflare KV namespace.
Without it, the Worker still works (rate limiting is skipped).

```bash
wrangler kv namespace create CHAT_RATE_KV
# Copy the printed id into the [[kv_namespaces]] block in wrangler.toml.
wrangler deploy
```

## Enable on the site

Set `NEXT_PUBLIC_CHAT_PROXY_URL` to the Worker URL in your GitHub repository
secrets (the same place the existing `NEXT_PUBLIC_*` tokens live). Example value:

```
NEXT_PUBLIC_CHAT_PROXY_URL=https://ahmed-chat-proxy.your-subdomain.workers.dev
```

That env var is read at build time and inlined into the bundle. The Worker URL
is safe to expose (it has no secret in it), but it is the only thing the bundle
contains — no API key.

## How it works

- When `NEXT_PUBLIC_CHAT_PROXY_URL` is set, the `zaiProvider` in
  `src/components/ChatBot.tsx` POSTs `{ messages, model, max_tokens, temperature }`
  to the proxy URL **without** an `Authorization` header. The proxy adds the key.
- When `NEXT_PUBLIC_CHAT_PROXY_URL` is **not** set, the ChatBot falls back to the
  original direct-call behavior using `NEXT_PUBLIC_ZAI_TOKEN`. This keeps the
  change fully backward compatible.
- The proxy enforces a hard `MAX_TOKENS` cap (500) and only accepts POST
  requests; all other methods get a `405`. It returns CORS headers for the
  portfolio origin and rejects malformed bodies with `400`.
- The `ZAI_API_KEY` lives only in Cloudflare and is referenced from the Worker as
  `env.ZAI_API_KEY`. It is never logged or returned to the client.

## Future: proxying Groq

The Groq provider currently still calls `api.groq.com` directly from the browser
using `NEXT_PUBLIC_GROQ_TOKEN`. The same proxy pattern can be extended to Groq
in the future (e.g. add a `/groq` route and a `GROQ_API_KEY` secret) if the Groq
token becomes a concern. For now Groq remains a direct-call fallback provider.
