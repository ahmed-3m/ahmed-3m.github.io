# Data Model: Genie Worker Hardening (spec 007)

The entities from the spec, with their fields, validation rules and where each one lives. The wire formats are in
[contracts/](contracts/).

## Prompt file

A build output: `out/genie/prompt.json`, served at `https://ahmed-3m.github.io/genie/prompt.json`. The same object
is committed as `worker/prompt-bundle.js` (research R2). It is built by `buildPromptFile()` in
`src/lib/genie/prompt-file.ts`.

| Field | Type | Rule |
|---|---|---|
| `version` | `1` | The Worker rejects any other value and keeps its current copy. |
| `maxChars` | number | 7,500 (FR-005). |
| `rules` | string | The prompt template. It must contain each slot exactly once: `{{language}}`, `{{section}}`, `{{pathname}}`, `{{entries}}` and `{{links}}`. Every other value is already filled in at build time: the Genie name, the contact and Calendly URLs. |
| `entryFormat` | string | `[{{title}}] {{facts}} Links: {{links}}`, one line per entry, joined with `\n`. |
| `links` | string | The allowlisted public links, joined with ` · `, as in today's prompt. |
| `languages` | object | Language code → name, for `en`, `de`, `fr`, `es`, `ar`. |
| `entries` | array | Every knowledge entry: `{ id, title, facts, links, sections }`. IDs are unique, and so are titles (R11 maps titles to IDs). |
| `sections` | string[] | Every section a request may name (R4). Includes `hero`. |
| `paths` | string[] | Every normalized path a request may name (R4). Includes `/`. |
| `defaults` | object | Section → up to 4 entry IDs. Every section has an entry, and every ID exists. |

The Worker's shape check, run on a fetched copy, enforces all of these rules. A file that fails any rule is not
used (R3).

**Size.** About 18 entries of a few hundred characters each. The file is well under the Worker's 256 KB fetch
limit.

## Composed prompt

Not stored. `composePrompt(file, selection)` (`worker/lib/compose-prompt.js`):

1. Look up `entryIds` in `entries`. Drop unknown and repeated IDs, and keep at most 4. If none remain, use
   `defaults[section]`.
2. Fill the slots in one pass:
   - `{{language}}` with `languages[lang]`;
   - `{{section}}` and `{{pathname}}` with the validated values;
   - `{{entries}}` with one `entryFormat` line per entry;
   - `{{links}}` with `links`.
3. If the result is over `maxChars`, cut it to `maxChars - 10` characters and add `…`, as the site does today.

Until PR 4, the output must equal the site's `buildSystemPrompt` for the same entries (R12).

## Chat request (v2)

Defined in [contracts/worker-api.md](contracts/worker-api.md). Fields: `version`, `turns`, `lane`, `provider`,
`lang`, `section`, `pathname`, `entryIds`, `stream`.

**Validation (FR-006 to FR-008).** Reject with `invalid_request` when:
- `version` is not `2`, or `lane` or `provider` is not a known value;
- `turns` is empty or has more than 16 turns;
- any turn's role is not `user` or `assistant`, so a `system` turn is rejected;
- the last turn is not `user`;
- a user turn has more than 2,000 characters, or an assistant turn more than 8,000;
- `entryIds` is not an array of at most 4 strings.

These values are corrected rather than rejected:
- an unknown `lang` becomes `en`;
- an unknown `section` becomes `hero`;
- an unknown `pathname` becomes `/`;
- an unknown entry ID is dropped.

Any other field is ignored, including `model`, `max_tokens`, `temperature` and `reasoning_effort` (FR-009).

## Chat request (v1, until PR 5)

Today's shape: `{ model, messages, max_tokens, temperature, stream, reasoning_effort? }`. The adapter turns it into a
v2 request (research R11). It is recognized by having `messages` and no `version`.

| v2 field | Taken from |
|---|---|
| `provider` | `model`, through the allowlist. An unknown model is an invalid request. |
| `lane` | `max_tokens` of 1,200 or more is `deep`, otherwise `fast`. |
| `turns` | `messages` with every `system` message removed. Earlier turns over a cap are cut to the cap (proposed). The last turn must be `user` and within its cap. |
| `section`, `pathname` | The `Active page context` line of the removed system message, if the values are listed. |
| `lang` | The `(or <name> if unclear)` phrase, mapped back through `languages`. |
| `entryIds` | Proposed: `[Title]` lines after `Retrieved portfolio knowledge:`, matched exactly against published titles, up to 4. As written today: none, so the section defaults are used. |
| `stream` | `stream`. |

## Error response

Defined in [contracts/worker-api.md](contracts/worker-api.md): `{ error: { code, message }, scope, retryAfter?,
requestId }`.

- The code comes from a fixed list.
- The message is fixed text for each code and never holds provider text, a setting name, a secret name or a model
  name.
- The scope is `proxy`, `worker`, `zai` or `groq`.

## Budget counter

Kept in the `GenieBudget` Durable Object, one instance per provider (R6).

| Field | Type | Rule |
|---|---|---|
| `fiveHourWindow` | integer | `Math.floor(nowMs / 18_000_000)` |
| `fiveHourCount` | integer | Reset to 0 when the window changes. |
| `dayWindow` | integer | `Math.floor(nowMs / 86_400_000)` |
| `dayCount` | integer | Reset to 0 when the window changes. |

**State changes.** One `consume({ caps, now })` call per request:
- if a window ID changed, that count is reset;
- if either count has reached its cap, the call is refused with the seconds until that window ends;
- otherwise both counts go up by 1.

The counter holds nothing about visitors.

## Telemetry point

One Analytics Engine data point for each request that passes validation, written when the response is complete
(R9). Requests refused for origin, rate limit or validity get no point.

| Slot | Value |
|---|---|
| `indexes[0]` | provider |
| `blobs` | lane, provider, model, outcome, format (`v1` or `v2`), prompt source (`fetched`, `cached`, `bundled`) |
| `doubles` | time to first byte (ms), total time (ms), number of entries used |

No message text, IP address, user agent, request ID or country.

## Worker settings

| Setting | Kind | Default | Notes |
|---|---|---|---|
| `ZAI_API_KEY`, `GROQ_API_KEY` | secret | — | Set by the owner. A missing key gives `unavailable` for that provider. |
| `GENIE_STOP` | secret | unset | `on` stops all model calls (R7). |
| `PROMPT_URL` | var | `https://ahmed-3m.github.io/genie/prompt.json` | |
| `ALLOW_LOCALHOST` | var | `false` | Unchanged. |
| `ZAI_FAST_MODEL`, `ZAI_DEEP_MODEL` | var | `glm-5.3-flash`, `glm-5.4` | Today's site defaults. |
| `GROQ_MODEL` | var | `openai/gpt-oss-20b` | Both lanes. |
| `FAST_MAX_TOKENS`, `DEEP_MAX_TOKENS` | var | `900`, `1600` | |
| `TEMPERATURE` | var | `0.3` | |
| `ZAI_REASONING_EFFORT` | var | `low` | Sent to Z.ai only. |
| `ZAI_CAP_5H`, `ZAI_CAP_DAY` | var | 100, 300 (proposed) | R6 |
| `GROQ_CAP_5H`, `GROQ_CAP_DAY` | var | 200, 600 (proposed) | R6 |
| `FIRST_BYTE_MS`, `TOTAL_MS` | var | 18000, 58000 | R10 |
| `CHAT_RATE_LIMITER` | binding | `{ limit = 8, period = 60 }` | R5 |
| `GENIE_BUDGET` | binding | Durable Object `GenieBudget` | PR 3 |
| `GENIE_EVENTS` | binding | Analytics Engine `genie_events` | PR 3, optional |

A var that is missing or not a valid number falls back to its default. A model var must be in the Worker's
allowlist, or the default is used.
