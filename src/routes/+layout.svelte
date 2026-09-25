<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { browser, dev } from '$app/environment';
	import { onMount } from 'svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import type { Snippet } from 'svelte';
	import { t, locale, setLocale, localePath, availableLanguages, redirectToPreferredLocale } from '$lib/i18n/locale';
	import { getTranslation } from '$lib/i18n/translations';
	import type { Language } from '$lib/locales/types';
	import { theme, themeActions } from '$lib/stores/theme';
	import { warmUp } from '$lib/utils/warmup';
	import { SITE_URL as siteUrl } from '$lib/seo';

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

	let seo = $derived(($page.data.seo || {}) as {
		title?: string;
		description?: string;
	});

	let baseTitle = $derived($t('app.title') || getTranslation('en', 'app.title'));
	let description = $derived($t('app.description') || getTranslation('en', 'app.description'));

	let pageTitle = $derived(seo.title || baseTitle);
	let pageDescription = $derived(seo.description || description);

	let pathname = $derived($page.url.pathname);
	let canonicalUrl = $derived(`${siteUrl}${pathname}`);
	let socialImage = $derived(`${siteUrl}/og-image.png`);

	// Language variants of the current page: `/` <-> `/be`, `/distro/x` <-> `/be/distro/x`
	let isBe = $derived(pathname === '/be' || pathname.startsWith('/be/'));
	let enPath = $derived(isBe ? pathname.slice(3) || '/' : pathname);
	let bePath = $derived(isBe ? pathname : enPath === '/' ? '/be' : `/be${enPath}`);

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
			document.title = pageTitle;
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

		const storedTheme = localStorage.getItem('theme');
		if (storedTheme === 'light' || storedTheme === 'dark') {
			themeActions.set(storedTheme);
		} else {
			const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			themeActions.set(systemTheme);
		}

		const unsubscribeTheme = theme.subscribe((value) => {
			document.documentElement.classList.toggle('dark', value === 'dark');
			localStorage.setItem('theme', value);
		});

		return () => {
			unsubscribeTheme();
		};
	});
</script>

<svelte:head>
	<!-- Basic Meta -->
	<title>{pageTitle || ''}</title>
	<meta name="description" content={pageDescription} />
	<meta name="author" content={baseTitle}>
	<meta name="robots" content="index, follow">
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website">
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

	<!-- Hreflang: real per-language URLs (the URL carries the language) -->
	{#each availableLanguages as lang}
		<link rel="alternate" hreflang={lang.code} href={langHref(lang.code)} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={langHref('en')} />

	<!-- Open Graph Locales -->
	<meta property="og:locale" content={$locale === 'en' ? 'en_US' : $locale === 'be' ? 'be_BY' : $locale}>
	{#each availableLanguages.filter(l => l.code !== $locale) as lang}
		<meta property="og:locale:alternate" content={lang.code === 'en' ? 'en_US' : lang.code === 'be' ? 'be_BY' : lang.code}>
	{/each}
</svelte:head>

{@render children()}
