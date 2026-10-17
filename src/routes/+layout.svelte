<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { browser, dev } from '$app/environment';
	import { onMount } from 'svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import type { Snippet } from 'svelte';
	import { t, locale, setLocale, localePath, localeFromPath, availableLanguages, appTitle, redirectToPreferredLocale } from '$lib/i18n/locale';
	import type { Language } from '$lib/locales/types';
	import { initTheme } from '$lib/stores/theme';
	import { warmUp } from '$lib/utils/warmup';
	import { SITE_URL as siteUrl, SEO_KEYWORDS } from '$lib/seo';

	injectAnalytics({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();

	let { children, data }: { children: Snippet; data: { locale: Language } } = $props();

	// Seed the locale from the URL before anything renders — this runs during
	// SSR/prerender, so `/be` pages are emitted as Belarusian HTML.
	// (Read inside a function so it's an explicit initial-value read; the
	// $effect below keeps the store in sync on later changes.)
	function seedLocale() {
		setLocale(data.locale);
	}
	seedLocale();

	// Keep the store in sync on client-side navigations (`/` <-> `/be`),
	// where the layout component is not remounted.
	$effect(() => {
		setLocale(data.locale);
	});

	let seo = $derived(($page.data['seo'] || {}) as {
		title?: string;
		description?: string;
	});

	let baseTitle = $derived($appTitle);
	let description = $derived($t('app.description'));

	let pageTitle = $derived(seo.title || baseTitle);
	let pageDescription = $derived(seo.description || description);

	let pathname = $derived($page.url.pathname);

	// Language variants of the current page: `/` <-> `/be`, `/distro/x` <-> `/be/distro/x`
	let isBe = $derived(localeFromPath(pathname) === 'be');
	let enPath = $derived(isBe ? pathname.slice(3) || '/' : pathname);
	let bePath = $derived(isBe ? pathname : enPath === '/' ? '/be' : `/be${enPath}`);

	// Blog posts may exist in only some languages; `availableLangs` is the set
	// they actually have. Every other page is fully localized, so it falls back
	// to the full language list.
	let pageLangs = $derived(
		($page.data as { post?: { availableLangs?: Language[] } }).post?.availableLangs ??
			availableLanguages.map((l) => l.code)
	);
	// True when the requested language has no post and English stands in.
	let isFallback = $derived(
		Boolean(($page.data as { post?: { usingFallback?: boolean } }).post?.usingFallback)
	);
	// Fallback pages render English text under a `/be` URL; point the canonical
	// at the English original so the same content isn't indexed twice, and treat
	// the page as English for Open Graph.
	let canonicalUrl = $derived(`${siteUrl}${isFallback ? enPath : pathname}`);
	let contentLocale = $derived(isFallback ? 'en' : $locale);
	let socialImage = $derived(`${siteUrl}/og-image.png`);

	// Blog posts are `article`; the blog index and every other page are
	// `website`. `enPath` has the locale prefix stripped, so one regex covers
	// both `/blog/x` and `/be/blog/x`.
	let ogType = $derived(/^\/blog\/[^/]+$/.test(enPath) ? 'article' : 'website');

	function langHref(lang: Language): string {
		return siteUrl + (lang === 'en' ? enPath : bePath);
	}

	// Warm up the blog route and the modals that are otherwise only fetched on
	// first interaction (Quick Quiz / Contact), so the first
	// click or navigation isn't a network round-trip. warmUp() schedules the
	// work for the first idle moment after load and deduplicates it per target,
	// so it's fine for this effect to re-run on navigation/locale changes.
	$effect(() => {
		const blogPath = localePath('/blog', data.locale);
		warmUp({
			// The page we're already on has its data loaded — don't refetch it.
			pages: pathname === blogPath ? [] : [blogPath],
			// Individual post pages: warm their route code. Their data is
			// prefetched on hover by the document-level SvelteKit link setting.
			codes: [`${blogPath}/*`],
		});
	});

	$effect(() => {
		if (browser) {
			document.title = pageTitle || '';
		}
	});

	$effect(() => {
		if (browser) {
			document.documentElement.lang = $locale;
		}
	});

	onMount(() => {
		// Client-only auto-redirect for visitors who prefer Belarusian —
		// runs after the (English) HTML is served, so crawlers never see it.
		redirectToPreferredLocale();

		// Seed the theme from storage/system and keep <html> + localStorage
		// in sync; the returned unsubscribe is this onMount's cleanup.
		return initTheme();
	});
</script>

<svelte:head>
	<!-- Basic Meta -->
	<title>{pageTitle || ''}</title>
	<meta name="description" content={pageDescription} />
	<meta name="keywords" content={SEO_KEYWORDS}>
	<meta name="author" content={baseTitle}>
	<meta name="robots" content="index, follow">
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={ogType}>
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content={socialImage}>
	<meta property="og:image:width" content="1200">
	<meta property="og:image:height" content="630">
	<meta property="og:image:alt" content={pageTitle}>
	<meta property="og:url" content={canonicalUrl}>
	<meta property="og:site_name" content={baseTitle}>
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content={socialImage}>
	<meta name="twitter:image:alt" content={pageTitle}>
	<meta name="twitter:url" content={canonicalUrl}>
	
	<!-- Canonical URL -->
	<link rel="canonical" href={canonicalUrl}>

	<!-- Hreflang: only the languages this page actually exists in -->
	{#each pageLangs as code}
		<link rel="alternate" hreflang={code} href={langHref(code)} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={langHref('en')} />

	<!-- Open Graph Locales -->
	<meta property="og:locale" content={contentLocale === 'en' ? 'en_US' : contentLocale === 'be' ? 'be_BY' : contentLocale}>
	{#each pageLangs.filter((code) => code !== contentLocale) as code}
		<meta property="og:locale:alternate" content={code === 'en' ? 'en_US' : code === 'be' ? 'be_BY' : code}>
	{/each}
</svelte:head>

{@render children()}
