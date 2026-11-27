# Contract: Genie prompt file

**URL:** `https://ahmed-3m.github.io/genie/prompt.json`

**Built by:** `src/app/genie/prompt.json/route.ts`, which calls `buildPromptFile()` in
`src/lib/genie/prompt-file.ts`.

**Bundled copy:** `worker/prompt-bundle.js` (`export default <same object>`). It is regenerated with
`node --import ./tools/test-hooks.mjs tools/genie/emit-worker-prompt.mjs`.

**Readers:**
- the Worker, which composes the prompt from it;
- the site-health canary;
- the figure check;
- from PR 4, the export check for rule sentences in the JavaScript bundle.

## Shape (version 1)

```json
{
  "version": 1,
  "maxChars": 7500,
  "rules": "You are Genie, a guide to Ahmed Mohammed’s public portfolio. … (or {{language}} if unclear). …\n\nActive page context: section=\"{{section}}\", pathname=\"{{pathname}}\"\n\nRetrieved portfolio knowledge:\n{{entries}}\n\nAllowlisted public links: {{links}}",
  "entryFormat": "[{{title}}] {{facts}} Links: {{links}}",
  "links": "CV https://… · About https://… · …",
  "languages": { "en": "English", "de": "German", "fr": "French", "es": "Spanish", "ar": "Arabic" },
  "entries": [
    {
      "id": "diffusion-headline",
      "title": "…",
      "facts": "…",
      "links": ["https://…"],
      "sections": ["research", "/research"]
    }
  ],
  "sections": ["hero", "about", "projects", "experience", "research", "evidence", "ood-explorer", "writing", "contact"],
  "paths": ["/", "/about", "/research", "/blog", "/news", "…"],
  "defaults": { "hero": ["profile-experience", "…"], "research": ["…"] }
}
```

The values above are illustrative. The real `rules`, `links` and `languages` text comes from
`src/lib/genie/prompt-rules.ts` and `@/lib/i18n-config`, so it matches today's prompt word for word.

## Rules a valid file meets

1. `version` is `1`.
2. `rules` contains each of `{{language}}`, `{{section}}`, `{{pathname}}`, `{{entries}}` and `{{links}}` exactly
   once, and no other `{{…}}`.
3. `entryFormat` contains `{{title}}`, `{{facts}}` and `{{links}}` exactly once each.
4. Entry IDs are unique, and so are entry titles.
5. `sections` contains `hero`, and `paths` contains `/`.
6. Every key of `defaults` is in `sections`. Every section has a `defaults` key. Every listed ID is an entry. No
   list has more than 4 IDs.
7. Every `languages` key is one of the site's five languages, and all five are present.

The Worker checks rules 1 to 7 before using a fetched file. The site-health canary checks rules 1, 2 and 6. A unit
test checks all of them on `buildPromptFile()`.

## Versioning

- Adding an entry, a section, a path or a link, or changing any text, keeps `version: 1`.
- Renaming or removing a field, or changing what a slot means, needs `version: 2`. The Worker must be deployed with
  support for version 2 before the site publishes it. Until then, the Worker keeps using its current copy.

## Figure check

`tools/claims/scan-export.mjs` reads the file as English text units: the `rules` text with its slots blanked, and
each entry's `title` and `facts`. A wrong or unqualified figure fails `verify:export` (008 FR-013, 007 FR-002).
