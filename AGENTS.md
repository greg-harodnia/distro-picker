# AGENTS.md

## Stack
- Local tooling: **bun** — `bun install`, `bun run dev`, `bun run build`.
- Server: **Vercel** (prerendered SvelteKit via `adapter-static`) and **Supabase** (distro likes, blog views/likes).

## Verify
- `bun run check:quiz` — quiz locales and data stay consistent.
- `bun run build` — runs `prebuild` (sitemap) then the Vite build. Run both after changes to routes, data, or content.

## Conventions
- No duplicated code; keep modules small and cohesive.
- Prefer shared abstractions over appending. When a new feature strains an existing implementation, evolve that code instead of patching around its limits.
- SEO and performance are priorities — flag regressions rather than shipping them.
- Ask before a significant unrequested rewrite.

## Where to look
- `README.md` — project structure, blog format, i18n, Supabase schema.
- Routes: `src/routes/[[lang]]/…` — the locale is part of the URL.
- Blog posts: `src/lib/blog/posts/<slug>.<lang>.md`.
