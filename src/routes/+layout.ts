import type { LayoutLoad } from './$types';
import { loadTranslation } from '$lib/i18n/translations';
import type { Language } from '$lib/locales/types';

/**
 * Ensures the active locale's translations are in memory before anything
 * renders.
 *
 * English is bundled, so this is a no-op for `/`. Other locales (currently just
 * `be`) are fetched on demand, and this runs both during the server render and
 * again during hydration — universal `load` functions re-run in the browser,
 * and SvelteKit awaits them before mounting, so the first client render matches
 * the server HTML instead of briefly falling back to English.
 */
export const load: LayoutLoad = async ({ data }) => {
	await loadTranslation((data.locale as Language) ?? 'en');
	// A `+layout.ts` shadows the sibling `+layout.server.js`, so the server's
	// data must be passed through explicitly or the locale store loses it.
	return { locale: data.locale };
};
