import type { Handle } from '@sveltejs/kit';

// Prerendered pages are static HTML shared by every language, so the
// `<html lang>` attribute in app.html (hardcoded to "en") is rewritten per
// URL here. Runs at build time during prerendering as well.
export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	const lang = path === '/be' || path.startsWith('/be/') ? 'be' : 'en';

	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('<html lang="en">', `<html lang="${lang}">`)
	});
};
