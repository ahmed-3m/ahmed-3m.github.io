# ahmed-chat-proxy

An optional Cloudflare Worker that proxies the portfolio's ChatBot requests to
the Z.ai API (GLM Coding Plan, `api.z.ai`) and Groq (`api.groq.com`). It keeps
the real API keys server-side so they are never inlined into the static
JavaScript bundle that ships to visitors' browsers.

## Why this exists

Before this proxy, the ChatBot called Z.ai and Groq **directly from the
browser** using `NEXT_PUBLIC_BIGMODEL_TOKEN` / `NEXT_PUBLIC_GROQ_TOKEN`. Anything
prefixed with `NEXT_PUBLIC_` is inlined into the static bundle at build time and
is therefore publicly extractable by anyone who opens the site's JS. Those keys
must be treated as disposable and rate-limited — anyone can grab them and burn
your quota.

This Worker fixes that: the browser POSTs to the Worker with **no** API key, and
the Worker attaches the real `ZAI_API_KEY` or `GROQ_API_KEY` secret (stored only
in Cloudflare) based on the requested allowlisted model before forwarding the
request upstream. Secrets never reach the client.

> **Note on the `ZAI_API_KEY` binding name:** this is the Cloudflare secret
> *binding name* (set via `wrangler secret put ZAI_API_KEY`) and is retained for
> backward compatibility with existing deployments. The *value* it holds is a
> Z.ai (`api.z.ai`) GLM Coding Plan key, not an open.bigmodel.cn one.

## Deploy

Prerequisites: a free Cloudflare account.

```bash
# 1. Install the Wrangler CLI (Node 16.17+ required).
npm i -g wrangler

# 2. Authenticate with Cloudflare (opens a browser).
wrangler login

# 3. From this worker/ directory, set the Z.ai and Groq API keys as secrets.
#    You will be prompted to paste each key. They are stored encrypted in
#    Cloudflare and are never written to this repo.
wrangler secret put ZAI_API_KEY
wrangler secret put GROQ_API_KEY

# 4. Deploy the Worker.
wrangler deploy
```

After deploying, Wrangler prints the Worker URL, e.g.
`https://ahmed-chat-proxy.<your-subdomain>.workers.dev`.

### Rate limiting (`CHAT_RATE_LIMITER` & `CHAT_RATE_KV` fallback)

- **Primary (`CHAT_RATE_LIMITER`):** `wrangler.toml` configures Cloudflare's
  native per-IP `[[ratelimits]]` binding at **60 requests per minute** per
  Cloudflare location.
- **Fallback (`CHAT_RATE_KV`):** if `CHAT_RATE_LIMITER` is unavailable and a KV
  namespace is bound as `CHAT_RATE_KV`, the Worker falls back to a fixed-window
  per-IP KV counter at **60 requests per hour** (`RATE_LIMIT_PER_HOUR = 60`).

To enable the optional KV fallback:

```bash
wrangler kv namespace create CHAT_RATE_KV
# Copy the printed id into the [[kv_namespaces]] block in wrangler.toml.
wrangler deploy
```

### Local development (`ALLOW_LOCALHOST`)

By default (`ALLOW_LOCALHOST = "false"` in `wrangler.toml`), the Worker only
allows `Origin: https://ahmed-3m.github.io` and rejects missing or unknown
origins on `POST` and `OPTIONS` with `403`. For local testing against
`http://localhost:3000`, set `ALLOW_LOCALHOST = "true"` (e.g. via
`wrangler dev --var ALLOW_LOCALHOST:true`). Never enable `ALLOW_LOCALHOST` in
production.

## Enable on the site

Set `NEXT_PUBLIC_CHAT_PROXY_URL` to the Worker URL in your GitHub repository
variables (and keep `NEXT_PUBLIC_*` fallback tokens in secrets if needed). Example value:

```
NEXT_PUBLIC_CHAT_PROXY_URL=https://ahmed-chat-proxy.your-subdomain.workers.dev
```

That env var is read at build time and inlined into the bundle. The Worker URL
is safe to expose (it has no secret in it), but it is the only thing the bundle
contains — no API key.

## How it works

- When `NEXT_PUBLIC_CHAT_PROXY_URL` is set, the Z.ai and Groq callers in
  `src/components/ChatBotPanel.tsx` POST `{ messages, model, max_tokens, temperature, ... }`
  to the proxy URL **without** an `Authorization` header. The proxy routes
  allowlisted Z.ai models (`glm-5.3`, `glm-5-turbo`, `glm-5.3-flash`) to
  `api.z.ai` with `env.ZAI_API_KEY` and allowlisted Groq models
  (`openai/gpt-oss-20b`) to `api.groq.com` with `env.GROQ_API_KEY`.
- When `NEXT_PUBLIC_CHAT_PROXY_URL` is **not** set, the ChatBot falls back to
  direct-call behavior using `NEXT_PUBLIC_BIGMODEL_TOKEN` / `NEXT_PUBLIC_GROQ_TOKEN`.
  **Note:** keys are provisioned per host — configure `NEXT_PUBLIC_BIGMODEL_TOKEN`
  with a valid Z.ai (`api.z.ai`) key; an `open.bigmodel.cn` key will not authenticate.
- The proxy requires an allowlisted `Origin` on `POST` and `OPTIONS` (missing or
  disallowed origins receive `403`), enforces `MAX_TOKENS_CAP = 1_200`, caps
  body size (`64_000` UTF-8 bytes), allows at most one `system` message (only at
  `messages[0]`), rejects malformed payloads with `400`, rejects non-`POST`
  methods with `405`, and passes SSE streaming responses through unbuffered.
- `ZAI_API_KEY` and `GROQ_API_KEY` live only in Cloudflare (`env.ZAI_API_KEY`
  and `env.GROQ_API_KEY`) and are never logged or returned to the client.
