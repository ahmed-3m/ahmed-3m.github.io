import { buildPromptFile } from '@/lib/genie/prompt-file'

// Genie's prompt file for the chat Worker (spec 007). Built with the site, so it always
// matches the site's knowledge entries and the claims registry.
export const dynamic = 'force-static'

export function GET() {
  return Response.json(buildPromptFile())
}
