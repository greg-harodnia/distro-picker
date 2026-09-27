/**
 * Generates `static/sitemap.xml` from the actual content sources.
 *
 * The file used to be hand-maintained: its URL list and `<lastmod>` dates
 * drifted behind the site (distros added in `distros.json` never appeared,
 * dates froze at whatever was hand-typed). Here the URL list is derived from
 * `distros.json`, `src/lib/locales/*.json` and the blog posts, and each
 * `<lastmod>` is the last git commit date of the files that page renders —
 * so both stay correct automatically.
 *
 * Wired into npm's `prebuild`, so `npm run build` (what Vercel runs) always
 * publishes a fresh sitemap.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://distro-picker.vercel.app';
/** Served at the unprefixed root; every other locale gets `/<code>` prefix. */
const DEFAULT_LOCALE = 'en';

const today = new Date().toISOString().slice(0, 10);

const commitCache = new Map<string, string>();

/** Last commit date (YYYY-MM-DD) of a repo file; build date if git is unavailable. */
function lastCommit(path: string): string {
	const cached = commitCache.get(path);
	if (cached) return cached;
	let date = '';
	try {
		date = execFileSync('git', ['log', '-1', '--format=%cs', '--', path], {
			cwd: root,
			encoding: 'utf8'
		}).trim();
	} catch {
		// no git in the build environment
	}
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) date = today;
	commitCache.set(path, date);
	return date;
}

/** Newest commit date across the files a page renders (ISO dates sort as strings). */
function lastChanged(...paths: string[]): string {
	return paths.reduce((newest, path) => {
		const date = lastCommit(path);
		return date > newest ? date : newest;
	}, '');
}

interface Entry {
	loc: string;
	lastmod: string;
	changefreq: 'weekly' | 'monthly';
	priority: string;
}

const locales = readdirSync(join(root, 'src/lib/locales'))
	.filter((file) => file.endsWith('.json'))
	.map((file) => file.slice(0, -5))
	.sort((a, b) => (a === DEFAULT_LOCALE ? -1 : b === DEFAULT_LOCALE ? 1 : a.localeCompare(b)));
const prefix = (locale: string) => (locale === DEFAULT_LOCALE ? '' : `/${locale}`);

const distros: { id: string }[] = (
	JSON.parse(readFileSync(join(root, 'src/lib/distros.json'), 'utf8')) as {
		distros: { id: string }[];
	}
).distros;

const postsDir = join(root, 'src/lib/blog/posts');
const postFiles = readdirSync(postsDir).filter((file) => file.endsWith('.md'));
const slugs = [...new Set(postFiles.map((file) => file.replace(/\.[a-z]{2}\.md$/, '')))].sort();

const localeJson = (locale: string) => `src/lib/locales/${locale}.json`;
const distroSources = (locale: string) => [localeJson(locale), 'src/lib/distros.json'];

const entries: Entry[] = [];

for (const locale of locales) {
	// Root keeps its slash (`/` is canonical there); prefixed locales are
	// trailing-slash-free — `/be/` answers 308 → `/be`.
	const loc = locale === DEFAULT_LOCALE ? `${SITE}/` : `${SITE}${prefix(locale)}`;
	entries.push({
		loc,
		lastmod: lastChanged(...distroSources(locale)),
		changefreq: 'weekly',
		priority: '1.0'
	});
}

for (const distro of distros) {
	for (const locale of locales) {
		// The page body comes from distros.json, its copy from the locale file.
		entries.push({
			loc: `${SITE}${prefix(locale)}/distro/${distro.id}`,
			lastmod: lastChanged(...distroSources(locale)),
			changefreq: 'monthly',
			priority: locale === DEFAULT_LOCALE ? '0.8' : '0.7'
		});
	}
}

for (const locale of locales) {
	entries.push({
		loc: `${SITE}${prefix(locale)}/blog`,
		// The index lists every post, so it changes when any of them does.
		lastmod: lastChanged(...postFiles.map((file) => join('src/lib/blog/posts', file))),
		changefreq: 'weekly',
		priority: '0.9'
	});
}

for (const slug of slugs) {
	for (const locale of locales) {
		// A post without a translation renders the source language file, so any
		// locale variant of a slug tracks all of that slug's files.
		const sources = postFiles
			.filter((file) => file.startsWith(`${slug}.`))
			.map((file) => join('src/lib/blog/posts', file));
		entries.push({
			loc: `${SITE}${prefix(locale)}/blog/${slug}`,
			lastmod: lastChanged(...sources),
			changefreq: 'monthly',
			priority: '0.8'
		});
	}
}

const xml = [
	'<?xml version="1.0" encoding="UTF-8"?>',
	'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
	...entries.flatMap((entry) => [
		'\t<url>',
		`\t\t<loc>${entry.loc}</loc>`,
		`\t\t<lastmod>${entry.lastmod}</lastmod>`,
		`\t\t<changefreq>${entry.changefreq}</changefreq>`,
		`\t\t<priority>${entry.priority}</priority>`,
		'\t</url>'
	]),
	'</urlset>',
	''
].join('\n');

const target = join(root, 'static/sitemap.xml');
writeFileSync(target, xml);
console.log(`sitemap: ${entries.length} urls (${distros.length} distros × ${locales.length} locales, ${slugs.length} posts) → static/sitemap.xml`);
