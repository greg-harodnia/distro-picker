import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const prerender = true;

// The URL is the source of truth for the language: `/` -> en, `/be` -> be.
// Unknown locale prefixes are 404s.
//
// The active locale's translations are loaded by `+layout.ts` (for rendering,
// on the server and during hydration) and by each server `load` that needs them
// (server loads run concurrently with this one, so they can't rely on it).
export const load: LayoutServerLoad = ({ params }) => {
	if (params.lang !== undefined && params.lang !== 'be') {
		error(404, 'Language not found');
	}
	// `params.lang` is already narrowed to `'be' | undefined` by the 404 guard
	// above, so no cast is needed — and leaving one out means a future change to
	// that guard gets flagged here instead of silently cast away.
	return { locale: params.lang ?? 'en' };
};
