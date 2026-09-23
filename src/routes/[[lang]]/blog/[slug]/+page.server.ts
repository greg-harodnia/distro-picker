import { error } from '@sveltejs/kit';
import { getPost, toDetail, BLOG_INDEX_DESCRIPTION } from '$lib/blog/content';
import { renderMarkdown } from '$lib/blog/markdown';
import { getTranslation } from '$lib/i18n/translations';

// Blog pages are intentionally dynamic: the markdown is fetched and rendered
// when a visitor opens the post, not baked into the initial SSR HTML.
export const prerender = false;

export function load({ params }) {
	const locale = params.lang === 'be' ? 'be' : 'en';

	const resolved = getPost(params.slug, locale);
	if (!resolved) {
		error(404, 'Post not found');
	}

	const { file, usingFallback } = resolved;
	// The page header already renders the post title as the page's single
	// <h1>; drop the identical leading H1 from the markdown body so posts
	// don't end up with two identical H1s.
	const body = file.body.replace(
		/^\s*#\s+(.+?)\s*\n/,
		(heading, text) =>
			text.trim().toLowerCase() === file.meta.title.trim().toLowerCase() ? '' : heading
	);
	const contentHtml = renderMarkdown(body);

	const siteTitle = getTranslation(locale, 'app.title') || getTranslation('en', 'app.title');
	const description = file.meta.description || BLOG_INDEX_DESCRIPTION;

	return {
		post: toDetail(params.slug, locale, contentHtml, usingFallback),
		seo: {
			title: `${file.meta.title} | ${siteTitle}`,
			description: description.length > 155 ? `${description.slice(0, 152).trim()}...` : description,
		},
	};
}