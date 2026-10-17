import { error } from '@sveltejs/kit';
import { distros } from '$lib/distros';
import { getTranslation, loadTranslation } from '$lib/i18n/translations';
import { screenshotsForDistro } from '$lib/screenshots';

export const prerender = true;

export const entries = () =>
	distros.flatMap((distro) => [{ id: distro.id }, { id: distro.id, lang: 'be' }]);

export async function load({ params }) {
	const locale = params.lang === 'be' ? 'be' : 'en';
	// Server `load`s run concurrently with the layout's, so the locale's
	// translations must be awaited here rather than relied on from the layout.
	await loadTranslation(locale);
	const distro = distros.find((d) => d.id === params.id);
	if (!distro) {
		error(404, 'Distribution not found');
	}

	const screenshots = screenshotsForDistro(distro.id);

	const siteTitle = getTranslation(locale, 'app.title') || getTranslation('en', 'app.title');
	const description = getTranslation(locale, `distros.${distro.id}.description`) || '';

	return {
		distro,
		screenshots,
		seo: {
			title: `${distro.name} | ${siteTitle}`,
			description: description.length > 155 ? `${description.slice(0, 152).trim()}...` : description,
			image: `${distro.logo || '/linux.webp'}`,
		},
	};
}
