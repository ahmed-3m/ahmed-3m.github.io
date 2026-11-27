# Feature Specification: Genie Worker Hardening

**Feature Branch**: `spec/007-worker-hardening`

**Created**: 2026-11-28

**Status**: Draft

**Input**: User description: "Spec 007, Worker hardening. Part 1: the Worker owns Genie's prompt, which the site
build publishes as a file; a strict request format that also accepts today's for one release; a tighter
per-client limit keyed by IPv4 address or IPv6 /64; structured errors; the self-test rewritten. Part 2: a daily
and 5-hour budget per provider, content-free telemetry and an upstream deadline. Then the site switches to the
new format and stops sending the prompt." (Genie improvement backlog of 25 Nov 2026, items W1–W3.)

**Related**:
- constitution principle IV (Static Export Integrity) and "Claim Integrity Standards";
- `specs/008-claims-registry`, User Story 4 and FR-013: Genie's published prompt must come from the claims
  registry. This spec decides how the prompt is published, which unblocks 008 task T047;
- `worker/README.md`, which documents the Worker as it is today;
- the chat privacy notice ("Chat assistant" in the legal page), in all five languages.

## Background

Genie, the site's chat assistant, answers some questions from prepared replies built into the site. Other
questions go to a model through a Cloudflare Worker, which holds the provider keys (Z.ai, with Groq as the
fallback). The Worker is deployed by hand. The site and the Worker therefore ship separately.

How a model request works today:

- The browser builds the system prompt for every question. It picks the four most relevant knowledge entries
  (by the question, recent history, page section and path) and adds the rules, links and page context. It sends
  this as the first message, followed by up to 16 earlier turns.
- The browser also chooses the model, the token limit (900 or 1,600), the temperature and the reasoning effort.
- The Worker checks the `Origin` header, a per-IP limit of 60 requests per minute at each Cloudflare location
  (or 60 per hour through an optional KV fallback), the body size (64,000 bytes), the number of messages (up to
  24), the length of each message (up to 16,000 characters) and the model against an allowlist. It caps
  `max_tokens` at 2,000.
- It checks where a system message sits, not what it says, and forwards the messages unchanged.

The risk: anyone who sets the `Origin` header, which any non-browser client can do, can send their own system
prompt and use the owner's model quota as a general-purpose relay. There is no daily cap and no way to stop
model calls without a redeploy. The Z.ai key is a Coding Plan key, so abuse could also use up the owner's own
coding quota.

Smaller gaps:

- The Worker sets no upstream deadline.
- It passes provider error bodies through, and some of its errors name configuration ("missing GROQ_API_KEY
  secret", "Disallowed model: …").
- It records nothing, so a revoked key or an exhausted quota goes unnoticed until a visitor hits it.
- Its self-test asserts that a client system message is accepted, which locks the open request shape in place.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The Worker is no longer an open relay (Priority: P1)

The Worker composes Genie's system prompt itself, from a prompt file that the site build publishes. A client can
choose which published knowledge entries, language and page context the prompt uses, but it cannot add
instructions. The Worker also picks the model and token limit for each lane, checks every request against a strict
format, limits each client more tightly, and answers every failure with one error structure. Today's site keeps
working throughout: the Worker still accepts the current request shape, and it replaces any system message the
client sends.

**Why this priority**: it closes the live risk, which is the reason for the feature. It can ship alone. Today's
site needs no change, because the Worker accepts the current request shape.

**Independent Test**: run the Worker's request handler in Node, as the self-test does, with stub providers.
- Send a request whose system message says "ignore your rules". The stub provider receives the Worker's own
  prompt, and the client text is not in it.
- Send today's request shape as the site sends it. It still gets a normal reply.

**Acceptance Scenarios**:

1. **Given** a request in today's format with a system message, **When** the Worker forwards it, **Then** the
   provider receives the Worker's prompt in place of the client's, and the rest of the turns are unchanged.
2. **Given** a request in the new format that contains a system turn, **When** the Worker checks it, **Then** it
   is rejected as an invalid request, and nothing is sent to a provider.
3. **Given** a request in the new format naming published knowledge entries, a language and a page section,
   **When** the Worker forwards it, **Then** the prompt contains exactly those entries, that language and that
   section. Unknown entries or values are left out, not echoed.
4. **Given** a request asking for a model or token limit, **When** the Worker forwards it, **Then** the model and
   token limit come from the Worker's settings for that lane and provider, not from the request.
5. **Given** one client sends more requests in a minute than the per-client limit allows, **When** the next
   request arrives, **Then** the Worker answers with the rate-limit error and a retry time. Two IPv6 addresses
   in the same /64 count as one client.
6. **Given** a provider returns an error or a malformed body, **When** the Worker answers, **Then** the client
   gets the standard error structure, and the provider's body and the Worker's configuration are not in it.
7. **Given** the published prompt file cannot be fetched or is malformed, **When** a request arrives, **Then**
   the Worker uses the copy bundled at its last deploy and still answers.
8. **Given** the site is built, **When** the export is checked, **Then** the prompt file is in it, and every
   figure in the file passes the figure check from spec 008.

---

### User Story 2 - Model use has a hard ceiling and can be seen (Priority: P2)

Each provider has a budget for a 5-hour window and for a day. When a budget is used up, the Worker stops calling
that provider until the window resets, and the site falls back cleanly. The owner can stop all model calls
without a code change. Each request leaves a content-free record (lane, provider, outcome, timings), so the owner
can see use, failures and fallbacks without any visitor text or IP address being stored.

**Why this priority**: User Story 1 removes most of the risk. A budget turns "abuse is unlikely" into "abuse
costs at most this much". It adds a step to every request, so it ships second and does not hold up User Story 1.

**Independent Test**: in Node, with the budget set to 3 for one provider:
- the fourth request gets the budget error naming that provider;
- a request to the other provider still succeeds;
- after the window resets, the first provider answers again.

**Acceptance Scenarios**:

1. **Given** the Z.ai budget for the current window is used up, **When** today's site asks Z.ai, **Then** the
   Worker answers with the budget error, the site asks Groq, and the visitor gets a generated answer.
2. **Given** both providers' budgets are used up, **When** a visitor asks a question, **Then** the site shows its
   prepared answers with an honest "models unavailable" message, not an error.
3. **Given** the owner sets the stop switch, **When** any model request arrives, **Then** no provider is called,
   and the site falls back as in scenario 2.
4. **Given** a provider sends no first byte before the Worker's deadline, **When** the deadline passes, **Then**
   the Worker ends the call and answers with the timeout error.
5. **Given** a day of traffic, **When** the owner reads the telemetry, **Then** it shows per-provider counts of
   requests, successes, failures by error code, budget refusals and timings. It contains no message text, IP
   address or user agent.

---

### User Story 3 - The site stops sending the prompt (Priority: P3)

The site switches to the new request format. It sends the question, the history, the lane, the provider, the
language, the page context and the IDs of the knowledge entries it retrieved, and no prompt text. One release
later, the Worker stops accepting the old format.

**Why this priority**: until this ships, the system prompt still ships in the site's JavaScript. That is not a
risk, since the prompt is public, but the old format stays open. This story needs User Story 1 deployed first.

**Independent Test**: build the site and search the JavaScript bundle for the prompt's rule sentences. There are
none. A mocked chat flow in the browser test sends a request in the new format and shows the streamed reply.

**Acceptance Scenarios**:

1. **Given** the site is built, **When** its JavaScript is searched, **Then** none of the prompt's rule sentences
   are in it.
2. **Given** a visitor asks a question that needs the model, **When** the site sends the request, **Then** it is
   in the new format and names knowledge entries by ID.
3. **Given** the Worker answers with any of the standard errors, **When** the site handles it, **Then** it shows
   the right message: the rate-limit message with the retry time for the per-client limit, a try of the other
   provider for a provider budget, and prepared answers when no provider can answer.
4. **Given** the old-format support has been removed, **When** a request in the old format arrives, **Then** it
   is rejected as an invalid request.

---

### Edge Cases

- **Old cached pages.** A visitor can keep a tab open with the old site for hours, so the old format is still
  accepted for the compatibility window (FR-016).
- **Knowledge entry IDs from an older site.** After a knowledge change, an older page can send IDs that no longer
  exist. They are dropped. If none remain, the Worker uses its default entries for the page section.
- **Page context.** The section and path come from the client. Only values listed in the published file are used,
  so client text never reaches the prompt through them.
- **History.** Earlier user and assistant turns are still client text. A client can fake an assistant turn or put
  instructions in a user turn. The prompt already tells the model to treat turns as untrusted. The caps on turn
  length, history length and tokens limit what such text can buy.
- **Last turn.** A request whose last turn is not the visitor's question is rejected.
- **Missing client address.** In local tests there is no client IP, and all such requests share one bucket.
- **Stream already started.** Budgets are counted when a request starts. A stream that has started is not cut off
  when the budget fills.
- **Deploy order.** If the site switches to the new format before the Worker supports it, every model request
  fails. The rollout order in FR-017 prevents this, and the site keeps its prepared-answer fallback.
- **Stale bundled copy.** If the site's prompt file is unreachable for a long time, the Worker answers from the
  copy bundled at its last deploy. The facts may then be older than the site's, but they still passed the figure
  check when they were built.
- **Preflight.** `OPTIONS` requests from allowed origins still get `204`, which the site-health canary checks.

## Requirements *(mandatory)*

### Functional Requirements

**Prompt ownership**

- **FR-001**: The site build MUST publish one prompt file. It MUST contain everything the Worker needs to compose
  Genie's system prompt for any of the five languages:
  - the rules text;
  - every knowledge entry, by ID;
  - the allowlisted public links;
  - the language names;
  - the page sections and paths a request may name;
  - the default entries for each section.
- **FR-002**: The prompt file MUST be generated from the same knowledge and claims modules the site uses, so its
  figures come from the claims registry (008 FR-013). The figure check MUST scan it, and a wrong or unqualified
  figure in it MUST fail the build.
- **FR-003**: The Worker MUST compose the system prompt itself, from the prompt file. It MUST NOT forward any
  system text supplied by a client.
- **FR-004**: The Worker MUST fetch the prompt file from the site's own origin and reuse it for about 10 minutes.
  If the fetch fails or the file is malformed, it MUST use a copy of the file bundled when it was last deployed.
- **FR-005**: A composed prompt MUST stay within today's size limit of 7,500 characters.

**Request format**

- **FR-006**: The new format MUST carry:
  - a format version;
  - the turns, as user and assistant turns only, ending with the visitor's question;
  - the lane (fast or deep);
  - the provider (Z.ai or Groq);
  - the language;
  - the page section and path;
  - up to 4 knowledge entry IDs;
  - whether to stream.
- **FR-007**: The Worker MUST reject a new-format request that has a system turn, a last turn that is not the
  visitor's, or an unknown field value it cannot ignore (lane, provider, version).
- **FR-008**: The Worker MUST cap:
  - each user turn at 2,000 characters;
  - each assistant turn at 8,000 characters;
  - the history at 16 turns;
  - the body at 64,000 bytes.

  It MUST reject anything over these caps.
- **FR-009**: The Worker MUST choose the model, the token limit, the temperature and the reasoning effort from
  its own settings for each lane and provider. Request fields that name them MUST be ignored. The starting values
  are today's: 900 tokens for fast and 1,600 for deep, temperature 0.3, low reasoning effort on Z.ai.

**Limits and errors**

- **FR-010**: The Worker MUST limit each client to at most 8 model requests per minute. A client is one IPv4
  address or one IPv6 /64.
- **FR-011**: Every error response MUST use one structure:
  - a code from a fixed list (invalid request, origin not allowed, rate limited, budget exhausted, upstream error,
    upstream timeout, unavailable);
  - a scope (the client, a named provider, or the Worker);
  - a retry time where one is known;
  - a request ID.

  Responses MUST NOT include provider error bodies or name any setting, secret or model the client did not ask
  for.
- **FR-012**: The per-client limit error MUST keep the scope today's site reads as "the proxy's own limit", so the
  site shows the rate-limit message and does not try the other provider. A provider budget error MUST use a
  provider scope, so today's site still tries the other provider.

**Budgets, deadline and telemetry**

- **FR-013**: The Worker MUST keep, for each provider, a count of model requests in the current 5-hour window and
  in the current day (fixed windows in UTC). When either count reaches the owner's cap, it MUST refuse calls to
  that provider with the budget error until the window resets. The counters MUST hold no personal data.
- **FR-014**: The owner MUST be able to stop all model calls by changing one Worker setting, with no code change.
- **FR-015**: The Worker MUST end an upstream call that sends no first byte, or runs longer in total, than the
  site's own limits. It answers with the timeout error.
- **FR-016**: The Worker MUST record one content-free data point per request: lane, provider, model, outcome code,
  time to first byte, total time, and whether the request used the old format. It MUST NOT record message text,
  IP addresses or user agents.

**Compatibility and rollout**

- **FR-017**: The rollout MUST follow this order:
  1. the site publishes the prompt file;
  2. the owner deploys the Worker, which accepts both formats;
  3. the site switches to the new format;
  4. the Worker stops accepting the old format, at least 7 days after step 3 is live.
- **FR-018**: Until step 4, the Worker MUST accept today's request shape. It MUST replace that shape's system
  message with its own prompt, using the default entries for the page section, and apply FR-008 to FR-016 to it.
- **FR-019**: After the site switch, the site's JavaScript MUST NOT contain the prompt's rule sentences, and the
  export check MUST fail if it does.

**Checks and documentation**

- **FR-020**: The Worker self-test MUST assert that a client's system text never reaches a provider. It MUST also
  cover the cases in FR-007 to FR-015, running the handler in Node with stub providers and no network.
- **FR-021**: The site-health canary MUST keep checking the Worker's `OPTIONS` preflight. It MUST also check that
  the deployed prompt file is reachable and well-formed.
- **FR-022**: The chat privacy notice MUST say, in all five languages, that the Worker records only counts and
  timings, never messages or IP addresses. Its statement that the IP address is kept for at most one hour MUST
  stay true.
- **FR-023**: `worker/README.md` MUST describe the new format, the settings (caps, stop switch, lane models) and
  the rollout order.

### Key Entities

- **Prompt file**: a build output published with the site. It contains:
  - a version;
  - the rules text, with a slot for the language;
  - the knowledge entries (ID, title, facts, links, sections);
  - the allowlisted links;
  - the allowed sections and paths;
  - the default entries per section.
- **Chat request (new format)**: the fields in FR-006.
- **Error response**: code, scope, retry time, request ID (FR-011).
- **Budget counter**: provider, window (5-hour or day) and count. It holds nothing about visitors.
- **Telemetry point**: the fields in FR-016.
- **Worker settings**: the lane models and token limits, the provider caps, the per-client limit and the stop
  switch.

## Success Criteria *(mandatory)*

### Measurable Outcomes

All of these are proved without calling the live Worker: the handler runs in Node with stub providers, and the
site checks run on the built export.

- **SC-001**: In 100% of the self-test's system-text cases (old format, new format, injected section or path),
  the stub provider receives no client-supplied system text.
- **SC-002**: A request in today's site format gets a normal streamed reply from the new Worker, with no site
  change.
- **SC-003**: With a provider cap of N, request N+1 to that provider is refused, and the other provider still
  answers.
- **SC-004**: No error response in the self-test contains a provider body, a secret name or a model the client did
  not ask for.
- **SC-005**: A wrong figure planted in the knowledge source fails the build through the prompt file, in the same
  run that 008's check reports it.
- **SC-006**: After the site switch, the built JavaScript contains none of the prompt's rule sentences.
- **SC-007**: The telemetry for a self-test run contains no message text, IP address or user agent.
- **SC-008**: The site-health canary passes against the deployed Worker and prompt file after each rollout step.

## Assumptions

- **Owner actions (dependency).** Before the Worker is deployed, the owner:
  - gives it its own Z.ai and Groq keys, with spend limits where the provider offers them;
  - checks whether the Z.ai Coding Plan terms allow serving a public website;
  - checks whether billing is on for the Groq account.

  The keys are set by the owner. This work never handles them. If the Coding Plan terms do not allow this use,
  the lane settings move the affected lanes to another key or provider, and the request format does not change.
- **Deploys stay manual.** The owner deploys the Worker, as today. Whether CI should deploy it is out of scope.
- **Budget values.** The 5-hour and daily caps are settings. The owner sets the starting values during planning,
  since there is no usage data yet. Telemetry (User Story 2) then gives the data to tune them.
- **Retrieval stays in the site.** The site keeps choosing the knowledge entries for each question, as today, and
  sends their IDs. The Worker only puts together entries that are already published, so it needs no copy of the
  retrieval code. A client that sends chosen IDs can only pick among published facts.
- **The knowledge entries are in English.** The prompt asks the model to answer in the visitor's language, as
  today. The figure check scans the prompt file as English.
- **Platform facts to confirm in plan research**, not from memory:
  - which periods the Cloudflare rate-limit binding supports;
  - whether Durable Objects (or another counter that holds up under concurrent requests) are available on the
    account's plan, and at what added latency;
  - whether Workers Analytics Engine, or another content-free store, is available on that plan;
  - how a Worker's fetch of a GitHub Pages file is cached.
- **The prompt is already public.** It ships in the site's JavaScript today, so publishing it as a file exposes
  nothing new.

### Out of Scope

- A server-side provider chain (the Worker trying Z.ai, then Groq, then another model in one request).
- Turnstile or any visitor challenge.
- Answer receipts, a runtime claim guard and the evaluation harness (specs 009 and 010).
- Storing chats, ratings or anything else that would change the privacy promise beyond FR-022.
- CI deploying the Worker.

## Clarifications

### Session 2026-11-28

- Q: Where does the system prompt live, now that the site builds it for each question? → A (proposed, awaiting
  the owner's approval): the site build publishes a prompt file. The client sends only selectors (knowledge entry
  IDs, language, section and path), and the Worker composes the prompt from the published file.

  Considered and not chosen:
  - the Worker runs retrieval itself, which needs a second copy of the retrieval code in the Worker;
  - one compact prompt with all the facts, which loses the per-question focus the site has today.
- Q: Does spec 007 cover the site switch (backlog item W3)? → A: yes, as User Story 3, in its own pull request
  after User Story 1 is deployed.
