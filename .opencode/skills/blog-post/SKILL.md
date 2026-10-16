---
name: Blog post
description: Author or edit a blog post under src/lib/blog/posts, including locale handling and verification
---

# Authoring a blog post

Posts are Markdown files at `src/lib/blog/posts/<slug>.<lang>.md` (for example `dont-use-obs.en.md`). `README.md` is the source of truth for the format; this skill is the workflow.

## Steps
1. Pick a kebab-case `slug`. Write the English file as `<slug>.en.md`. Add `<slug>.be.md` for the Belarusian translation — a locale with no file falls back to English automatically.
2. Frontmatter between `---` markers:
   - `title` — required.
   - `date` — required, ISO `YYYY-MM-DD`; posts are sorted newest first.
   - `description` — optional; used for SEO, keep it under ~155 characters.
   - `pinned: true` — optional; pins the post to the top of the index.
3. Body: do **not** open with an `# H1` that repeats the title. The page header already renders the title, and a matching leading H1 is stripped. Start with prose or `##` sections.
4. Style: plain, concrete, addressed to newcomers; em dashes (`—`) with spaces; no trailing whitespace.
5. Verify with `bun run build` (regenerates the sitemap via `prebuild`), then open the post to confirm rendering, canonical URL, and `<html lang>`.

## Notes
- Add `/src/lib/blog/markdown.ts` features only if the post needs syntax the renderer does not support yet.
- Blog pages are dynamic (`prerender = false`); post content is fetched on navigation, not baked into the initial HTML.
