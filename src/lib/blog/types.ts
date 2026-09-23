import type { Language } from '$lib/locales/types';

/** Metadata extracted from the YAML-style frontmatter of a blog post file. */
export interface BlogPostMeta {
	slug: string;
	title: string;
	/** ISO date string, e.g. "2026-09-20". */
	date: string;
	description?: string;
	author?: string;
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
}

/** Full post as rendered for the detail page. */
export interface BlogPostDetail {
	slug: string;
	lang: Language;
	meta: BlogPostMeta;
	contentHtml: string;
	availableLangs: Language[];
	usingFallback: boolean;
}