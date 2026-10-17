import { error } from '@sveltejs/kit';
import { distros } from '$lib/distros';
import { getTranslation, loadTranslation } from '$lib/i18n/translations';
import { getSiteTitle } from '$lib/i18n/locale';
import { screenshotsForDistro } from '$lib/screenshots';
import { logoPath } from '$lib/utils/assets';

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

	const siteTitle = getSiteTitle(locale);
	const description = getTranslation(locale, `distros.${distro.id}.description`) || '';

	return {
		distro,
		screenshots,
		seo: {
			title: `${distro.name} | ${siteTitle}`,
			description: description.length > 155 ? `${description.slice(0, 152).trim()}...` : description,
			image: `${logoPath(distro.logo)}`,
		},
	};
}
