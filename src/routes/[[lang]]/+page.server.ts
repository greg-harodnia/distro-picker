import { loadTranslation } from '$lib/i18n/translations';
import { allScreenshots } from '$lib/screenshots';

export async function load({ params }) {
	const locale = params.lang === 'be' ? 'be' : 'en';
	// Server `load`s run concurrently with the layout's, so the locale's
	// translations must be awaited here rather than relied on from the layout.
	await loadTranslation(locale);
	const screenshots = allScreenshots();

	// The homepage's title/description are the shared `app.*` brand strings
	// (see the layout's `<svelte:head>`); only the blog and distro routes
	// return their own `seo` override.
	return { screenshots };
}
