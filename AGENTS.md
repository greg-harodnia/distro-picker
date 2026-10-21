# AGENTS.md

## Stack
- Local tooling: **bun** — `bun install`, `bun run dev`, `bun run build`.
- Server: **Vercel** (SvelteKit via `@sveltejs/adapter-vercel`; routes are prerendered by default, blog is dynamic) and **Supabase** (distro likes, blog views/likes, contact messages).
- Response headers and cache policy for static assets live in `vercel.json`.

## Verify
- `bun run check` — `svelte-check` type + a11y check. Keep it at zero errors/warnings.
- `bun run check:quiz` — quiz locales and data stay consistent.
- `bun run build` — runs `prebuild` (sitemap) then the Vite build. Run all three after changes to routes, data, or content.

## Conventions
- No duplicated code; keep modules small and cohesive.
- Prefer shared abstractions over appending. When a new feature strains an existing implementation, evolve that code instead of patching around its limits.
- SEO and performance are priorities — flag regressions rather than shipping them.
- Ask before a significant unrequested rewrite.
- Use BEM (Block, Element, Modificator) approach in CSS when writing new code or editing the old. This allows to use one-class rules with the same specificity everywhere.

## Where to look
- `README.md` — project structure, blog format, i18n, Supabase schema.
- Routes: `src/routes/[[lang]]/…` — the locale is part of the URL.
- Blog posts: `src/lib/blog/posts/<slug>.<lang>.md`.

## Git strategy

- Offer a commit name idea every time for all uncommited changes.
- Don't commit yourself.