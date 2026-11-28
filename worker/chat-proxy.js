/**
 * Cloudflare Worker: ahmed-chat-proxy
 *
 * Answers Genie's chat requests with Z.ai (GLM Coding Plan) or Groq, so the API keys never
 * reach the browser. The Worker composes the system prompt itself from the published
 * prompt file (bundled copy: ./prompt-bundle.js), chooses the model and limits, limits each
 * client, keeps a budget per provider (the GenieBudget Durable Object), and answers every
 * failure with one error structure. See worker/README.md and
 * specs/007-worker-hardening/contracts/worker-api.md.
 */

import { createHandler } from './lib/handler.js'
import bundledPrompt from './prompt-bundle.js'

// The per-provider budget Durable Object (research R6), bound as GENIE_BUDGET.
export { GenieBudget } from './lib/budget.js'

export default createHandler({ bundledPrompt })
