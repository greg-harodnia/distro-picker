<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { t, locale, availableLanguages } from '$lib/i18n/locale';
	import { getTranslation } from '$lib/i18n/translations';

	let { children }: { children: Snippet } = $props();

	const siteUrl = 'https://distro-picker.vercel.app/';

	let pageTitle = $derived(browser && $page ? (() => {
		const baseTitle = $t('app.title') || getTranslation('en', 'app.title');
		const routeId = $page.route.id;
		const titles: Record<string, string|undefined> = {
			'/': $t('app.title') || getTranslation('en', 'app.title'),
		};
		const routeTitle = titles[routeId || ''] || '';
		return routeTitle ? `${routeTitle} | ${baseTitle}` : baseTitle;
	})() : getTranslation('en', 'app.title'));

	$effect(() => {
		if (browser) {
			document.title = pageTitle;
		}
	});

	onMount(() => {
		const hash = window.location.hash.slice(1);
		if (hash && availableLanguages.some(l => l.code === hash)) {
			locale.set(hash as any);
		} else {
			locale.init();
		}
	});
	let description = $derived($t('meta.description') || getTranslation('en', 'meta.description'));
	let title = $derived($t('app.title') || getTranslation('en', 'app.title'));
</script>

<svelte:head>
	<!-- Basic Meta -->
	<title>{pageTitle || getTranslation('en', 'app.title') || ''}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content="linux distribution, linux distro, choose linux, linux picker, linux distribution finder, best linux distro, ubuntu, fedora, arch, debian, mint, linux for beginners" />
	<meta name="author" content={title}>
	<meta name="robots" content="index, follow">
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website">
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="{siteUrl}{base}/linux.webp">
	<meta property="og:url" content="{siteUrl}{base}{$page.url.pathname}">
	<meta property="og:site_name" content={title}>
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="{siteUrl}{base}/linux.webp">
	<meta name="twitter:url" content="{siteUrl}{base}{$page.url.pathname}">
	
	<!-- Canonical URL -->
	<link rel="canonical" href="{siteUrl}{base}{$page.url.pathname}">

	<!-- Hreflang for all supported languages -->
	{#each availableLanguages as lang}
		<link rel="alternate" hreflang={lang.code} href="{siteUrl}{base}{$page.url.pathname}#{lang.code}" />
	{/each}
	<link rel="alternate" hreflang="x-default" href="{siteUrl}{base}{$page.url.pathname}" />

	<!-- Open Graph Locales -->
	<meta property="og:locale" content={$locale === 'en' ? 'en_US' : $locale}>
	{#each availableLanguages.filter(l => l.code !== $locale) as lang}
		<meta property="og:locale:alternate" content={lang.code === 'en' ? 'en_US' : lang.code}>
	{/each}
</svelte:head>

{@render children()}
