import { getTranslation, loadTranslation } from '$lib/i18n/translations';
import { allScreenshots } from '$lib/screenshots';

export async function load({ params }) {
	const locale = params.lang === 'be' ? 'be' : 'en';
	// Server `load`s run concurrently with the layout's, so the locale's
	// translations must be awaited here rather than relied on from the layout.
	await loadTranslation(locale);
	const screenshots = allScreenshots();

	// The homepage is the head-term landing page for "distro picker", so it gets
	// its own title/description instead of the bare `app.*` brand strings.
	const seo = {
		title: getTranslation(locale, 'seo.home.title'),
		description: getTranslation(locale, 'seo.home.description'),
	};

	return { screenshots, seo };
}
