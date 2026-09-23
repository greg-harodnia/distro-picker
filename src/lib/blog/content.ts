import type { Language } from '$lib/locales/types';
import type { BlogPostDetail, BlogPostFile, BlogPostMeta, BlogPostSummary } from './types';

/** Fallback SEO description for the blog index and posts without a meta description. */
export const BLOG_INDEX_DESCRIPTION =
	'Notes on Linux distributions, desktops and the tools around them.';

// ---- Server-only entry point ----
//
// The markdown files are imported as raw strings *only here*, from modules
// that run on the server (page loads / endpoints). Nothing forces them into
// the client bundle, and no post content is part of the initial SSR HTML:
// blog pages are dynamic and their loaders run — and therefore fetch the
// markdown — exactly when a visitor navigates to a blog page.

const rawModules = import.meta.glob('/src/lib/blog/posts/*.md', {
	query: '?raw',
	import: 'default',
	eager: true,
}) as Record<string, string>;

interface ParsedFile {
	slug: string;
	lang: string;
	meta: Record<string, string | string[]>;
	body: string;
	raw: string;
}

/** Naive frontmatter parser for `---\nkey: value\nkey2: [a, b]\n---` blocks. */
export function parseFrontmatter(raw: string): { meta: Record<string, string | string[]>; body: string } {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
	if (!match) {
		return { meta: {}, body: raw };
	}

	const meta: Record<string, string | string[]> = {};
	for (const line of match[1].split(/\r?\n/)) {
		const sep = line.indexOf(':');
		if (sep <= 0) continue;
		const key = line.slice(0, sep).trim();
		let value = line.slice(sep + 1).trim();

		if (value.startsWith('[') && value.endsWith(']')) {
			meta[key] = value
				.slice(1, -1)
				.split(',')
				.map((part) => part.trim().replace(/^['"]|['"]$/g, ''))
				.filter(Boolean);
		} else {
			meta[key] = value.replace(/^['"]|['"]$/g, '');
		}
	}

	return { meta, body: raw.slice(match[0].length) };
}

const allFiles: ParsedFile[] = Object.entries(rawModules).flatMap(([path, raw]) => {
	const filename = path.split('/').pop() ?? '';
	const m = /^(.*?)\.([a-z]{2})\.md$/.exec(filename);
	if (!m) return [];
	const { slug, lang } = { slug: m[1], lang: m[2] as Language };
	const { meta, body } = parseFrontmatter(raw as string);
	return [{ slug, lang, meta, body, raw: raw as string }];
});

const KNOWN_LANGUAGES = new Set<Language>(['en', 'be', 'ru', 'es', 'pt', 'de', 'fr', 'tr']);

function normalizeMeta(slug: string, file: ParsedFile): BlogPostMeta {
	const meta = file.meta;
	const title = (typeof meta.title === 'string' && meta.title.trim()) || slug;
	const date = typeof meta.date === 'string' ? meta.date : '';
	const description = typeof meta.description === 'string' ? meta.description : undefined;
	const author = typeof meta.author === 'string' ? meta.author : undefined;
	return { slug, title, date, description, author };
}

function filesForSlug(slug: string): BlogPostFile[] {
	return allFiles
		.filter((f) => f.slug === slug)
		.map((f) => ({ slug: f.slug, lang: f.lang as Language, meta: normalizeMeta(f.slug, f), body: f.body }))
		.filter((f) => KNOWN_LANGUAGES.has(f.lang));
}

function pickFile(slug: string, lang: Language): { file: BlogPostFile; usingFallback: boolean } | null {
	const files = filesForSlug(slug);
	if (files.length === 0) return null;

	const exact = files.find((f) => f.lang === lang);
	if (exact) return { file: exact, usingFallback: false };

	// No translation for the requested language -> English is the default.
	const en = files.find((f) => f.lang === 'en');
	if (en) return { file: en, usingFallback: true };

	// No English either — fall back to whatever is available (first, sorted).
	const any = [...files].sort((a, b) => a.lang.localeCompare(b.lang))[0];
	return { file: any, usingFallback: true };
}

export function getAllSlugs(): string[] {
	return [...new Set(allFiles.map((f) => f.slug))];
}

/**
 * Summaries for the blog index, resolved for a locale (English fallback).
 * Sorted newest first; posts without any body are skipped.
 */
export function listPosts(lang: Language): BlogPostSummary[] {
	const summaries: BlogPostSummary[] = [];

	for (const slug of getAllSlugs()) {
		const files = filesForSlug(slug).filter((f) => f.body.trim().length > 0);
		if (files.length === 0) continue;

		const resolved = pickFile(slug, lang);
		if (!resolved) continue;

		const { meta } = resolved.file;
		summaries.push({
			slug,
			title: meta.title,
			description: meta.description || '',
			date: meta.date,
			availableLangs: files.map((f) => f.lang),
			usingFallback: resolved.usingFallback,
		});
	}

	return summaries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

/** The markdown file (or English fallback) for a single post, ready to render. */
export function getPost(slug: string, lang: Language): { file: BlogPostFile; usingFallback: boolean } | null {
	return pickFile(slug, lang);
}

export function toDetail(slug: string, lang: Language, contentHtml: string, usingFallback: boolean): BlogPostDetail {
	const files = filesForSlug(slug);
	const file = files.find((f) => f.lang === lang) ?? files.find((f) => f.lang === 'en') ?? files[0];
	return {
		slug,
		lang,
		meta: file.meta,
		contentHtml,
		availableLangs: [...new Set(files.map((f) => f.lang))],
		usingFallback,
	};
}