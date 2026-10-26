import type { Language } from '$lib/locales/types';

/** Metadata extracted from the YAML-style frontmatter of a blog post file. */
export interface BlogPostMeta {
	slug: string;
	title: string;
	/** ISO date string, e.g. "2026-09-20". */
	date: string;
	/**
	 * ISO date of the last meaningful edit. Surfaced as schema.org
	 * `dateModified`, so search engines see when a post actually changed
	 * instead of the day it was first published. Omitted when never edited.
	 */
	updated?: string;
	description?: string;
	/** Frontmatter `pinned: true` — sorted to the top of the blog index. */
	pinned: boolean;
}

/** A post file that exists for a given slug, in a given language. */
export interface BlogPostFile {
	slug: string;
	lang: Language;
	meta: BlogPostMeta;
	/** Raw markdown body (frontmatter stripped). */
	body: string;
}

/** Summary used on the blog index. Title/description already resolve to the current locale with an English fallback. */
export interface BlogPostSummary {
	slug: string;
	title: string;
	description: string;
	date: string;
	/** Languages for which a translation file exists. */
	availableLangs: Language[];
	/** True when English has to stand in for the requested locale. */
	usingFallback: boolean;
	/** Pinned posts are shown first on the index. */
	pinned: boolean;
}

/** Full post as rendered for the detail page. */
export interface BlogPostDetail {
	slug: string;
	/** Language of the file actually rendered (English for fallback posts). */
	lang: Language;
	meta: BlogPostMeta;
	contentHtml: string;
	availableLangs: Language[];
	usingFallback: boolean;
}