import { listPosts, BLOG_INDEX_DESCRIPTION } from '$lib/blog/content';
import { getTranslation } from '$lib/i18n/translations';
import { fetchAllBlogStats } from '$lib/supabase';
import type { BlogStats } from '$lib/supabase';
import type { BlogPostSummary } from '$lib/blog/types';
import type { Language } from '$lib/locales/types';

// Blog pages are intentionally dynamic: the post list/content is fetched
// when a visitor goes to the blog, not baked into the initial SSR HTML.
export const prerender = false;

export async function load({ params }): Promise<{
	posts: BlogPostSummary[];
	stats: BlogStats[];
	locale: Language;
	seo: { title: string; description: string };
}> {
	const locale = params.lang === 'be' ? 'be' : 'en';

	const siteTitle = getTranslation(locale, 'app.title') || getTranslation('en', 'app.title');
	const blogTitle =
		getTranslation(locale, 'pages.blog.title') || getTranslation('en', 'pages.blog.title');
	const blogDescription = BLOG_INDEX_DESCRIPTION;

	// View/like counters for the cards. Degrades to [] (counters show 0)
	// when the `blog_posts` table isn't set up yet.
	const stats = await fetchAllBlogStats();

	return {
		posts: listPosts(locale),
		stats,
		locale,
		seo: {
			title: `${blogTitle} | ${siteTitle}`,
			description: blogDescription,
		},
	};
}