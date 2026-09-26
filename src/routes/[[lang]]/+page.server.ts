import { getTranslation } from '$lib/i18n/translations';

export async function load({ params }) {
	const locale = params.lang === 'be' ? 'be' : 'en';
	const screenshots: Record<string, string[]> = {};

	const modules = import.meta.glob('/static/screenshots/*/*');

	for (const path in modules) {
		const match = path.match(/\/screenshots\/([^/]+)\//);
		if (match) {
			const distroId = match[1];
			if (!screenshots[distroId]) {
				screenshots[distroId] = [];
			}
			screenshots[distroId].push(path.replace('/static', ''));
		}
	}

	// The homepage is the head-term landing page for "distro picker", so it gets
	// its own title/description instead of the bare `app.*` brand strings.
	const seo = {
		title:
			getTranslation(locale, 'seo.home.title') || getTranslation('en', 'seo.home.title'),
		description:
			getTranslation(locale, 'seo.home.description') ||
			getTranslation('en', 'seo.home.description'),
	};

	return { screenshots, seo };
}
