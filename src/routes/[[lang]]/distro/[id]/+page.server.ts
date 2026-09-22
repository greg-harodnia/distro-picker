import { error } from '@sveltejs/kit';
import distrosData from '$lib/distros.json';
import { getTranslation } from '$lib/i18n/translations';

export const prerender = true;

export const entries = () =>
	distrosData.distros.flatMap((distro) => [{ id: distro.id }, { id: distro.id, lang: 'be' }]);

export function load({ params }) {
	const locale = params.lang === 'be' ? 'be' : 'en';
	const distro = distrosData.distros.find((d) => d.id === params.id);
	if (!distro) {
		error(404, 'Distribution not found');
	}

	const screenshots: string[] = [];
	const modules = import.meta.glob('/static/screenshots/*/*');

	for (const path in modules) {
		const match = path.match(/\/screenshots\/([^/]+)\//);
		if (match && match[1] === distro.id) {
			screenshots.push(path.replace('/static', ''));
		}
	}

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
