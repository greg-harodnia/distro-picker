import { error } from '@sveltejs/kit';

export const prerender = true;

// The URL is the source of truth for the language: `/` -> en, `/be` -> be.
// Unknown locale prefixes are 404s.
export function load({ params }) {
	if (params.lang !== undefined && params.lang !== 'be') {
		error(404, 'Language not found');
	}
	return { locale: params.lang ?? 'en' };
}
