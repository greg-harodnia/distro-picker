import { error } from '@sveltejs/kit';
import distrosData from '$lib/distros.json';
import { getTranslation } from '$lib/i18n/translations';

export const prerender = true;

export const entries = () => distrosData.distros.map((distro) => ({ id: distro.id }));

export function load({ params }) {
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

	const description = getTranslation('en', `distros.${distro.id}.description`) || '';

	return {
		distro,
		screenshots,
		seo: {
			title: `${distro.name} | Linux Distro Picker`,
			description: description.length > 155 ? `${description.slice(0, 152).trim()}...` : description,
			image: `${distro.logo || '/linux.webp'}`,
		},
	};
}
