import { buildPromptFile } from '@/lib/genie/prompt-file'

// Genie's prompt file, which the chat Worker will compose the system prompt from (spec 007,
// later PRs). Built with the site, so it always matches the site's knowledge entries.
export const dynamic = 'force-static'

export function GET() {
  return Response.json(buildPromptFile())
}
