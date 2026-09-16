<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { browser, dev } from '$app/environment';
	import { onMount } from 'svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import type { Snippet } from 'svelte';
	import { t, locale, availableLanguages } from '$lib/i18n/locale';
	import { getTranslation } from '$lib/i18n/translations';
	import type { Language } from '$lib/locales/types';
	import { theme, themeActions } from '$lib/stores/theme';
	import { SITE_URL as siteUrl, SEO_KEYWORDS } from '$lib/seo';

	injectAnalytics({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();

	let { children }: { children: Snippet } = $props();

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

		const hash = window.location.hash.slice(1);
		if (hash && availableLanguages.some(l => l.code === hash)) {
			locale.set(hash as Language);
		} else {
			locale.init();
		}

		return () => {
			unsubscribeTheme();
		};
	});
</script>

<svelte:head>
	<!-- Basic Meta -->
	<title>{pageTitle || ''}</title>
	<meta name="description" content={pageDescription} />
	<meta name="keywords" content={SEO_KEYWORDS} />
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

	<!-- Hreflang for all supported languages -->
	{#each availableLanguages as lang}
		<link rel="alternate" hreflang={lang.code} href="{siteUrl}{pathname}#{lang.code}" />
	{/each}
	<link rel="alternate" hreflang="x-default" href={canonicalUrl} />

	<!-- Open Graph Locales -->
	<meta property="og:locale" content={$locale === 'en' ? 'en_US' : $locale === 'be' ? 'be_BY' : $locale}>
	{#each availableLanguages.filter(l => l.code !== $locale) as lang}
		<meta property="og:locale:alternate" content={lang.code === 'en' ? 'en_US' : lang.code === 'be' ? 'be_BY' : lang.code}>
	{/each}
</svelte:head>

{@render children()}
