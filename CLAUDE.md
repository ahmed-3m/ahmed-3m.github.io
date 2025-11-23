# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:3000)
npm run build        # Build static export to ./out
npm run lint         # Run ESLint
```

## Architecture

**Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Framer Motion

**Deployment**: Static export (`output: 'export'`) to GitHub Pages via GitHub Actions on push to main.

### Key Directories

- `src/app/` - Next.js App Router pages and metadata (layout.tsx, page.tsx, sitemap.ts, robots.ts)
- `src/components/` - React components for each portfolio section (Hero, About, Projects, etc.)
- `src/lib/` - Context providers for theme (dark/light) and i18n (EN/DE)
- `src/content/blog/` - Blog post content (markdown or MDX)
- `public/` - Static assets (images, PDFs, favicon)

### State Management

Two React Context providers wrap the app in `layout.tsx`:
- **ThemeProvider** (`lib/ThemeContext.tsx`) - Manages dark/light mode via `data-theme` attribute on `<html>`
- **I18nProvider** (`lib/i18n.tsx`) - Manages EN/DE translations via `t(english, german)` helper

### Styling

- Tailwind CSS v4 with custom dark mode variant: `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`
- 3D button/card effects via `.btn-3d` and `.card-3d` classes in `globals.css`
- Framer Motion for scroll animations (`whileInView`, `initial`, `animate`)

### SEO

- Metadata API in `layout.tsx` for meta tags, Open Graph, Twitter cards
- JSON-LD schemas in `components/JsonLd.tsx` (Person, Organization, WebSite)
- Auto-generated sitemap.xml and robots.txt via `app/sitemap.ts` and `app/robots.ts`
- Google Analytics in `components/Analytics.tsx`

### Bilingual Support

All user-facing text uses the `t()` helper from `useI18n()`:
```tsx
const { t } = useI18n();
<h1>{t('English text', 'German text')}</h1>
```

### Adding Content

- **Experience/Projects/Skills**: Edit data arrays in respective component files
- **Blog posts**: Add to `src/content/blog/` and update blog page
- **Social links**: Edit `socials` array in `components/Contact.tsx`
