import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			domain: 'greg-harodnia.github.io',
			jekyll: false,
			fallback: null,
			precompress: false,
			strict: true
		}),
        paths: {
            base: process.argv.includes('dev') ? '' : '/distro-picker'
        },
        appDir: 'internal'
	}
};

export default config;