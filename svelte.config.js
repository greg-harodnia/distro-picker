import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			runtime: 'nodejs22.x'
		}),
		// Inline every CSS file smaller than this (UTF-16 units) into the
		// HTML as one <style> block. The homepage ships ~34 KB of CSS across
		// 6 render-blocking <link>s; inlining removes those requests from the
		// critical path (FCP), at the cost of a larger HTML document.
		// Raise alongside app.css if it ever outgrows this threshold.
		inlineStyleThreshold: 32768,
		paths: {
			base: ''
		},
		appDir: 'internal',
		prerender: {
			// '*' covers `/` (optional [[lang]] segment is stripped); `/be` is the
			// Belarusian homepage. The /be/distro/* pages come from the route's
			// `entries` export.
			entries: ['*', '/be']
		}
	}
};

export default config;