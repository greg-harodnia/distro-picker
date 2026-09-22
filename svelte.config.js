import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			runtime: 'nodejs22.x'
		}),
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