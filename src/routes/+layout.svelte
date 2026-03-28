<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { t, locale } from '$lib/i18n/locale';
	
	const siteUrl = 'https://greg-harodnia.github.io/distro-picker';
	
	let pageTitle = $derived(browser && $page ? (() => {
		const baseTitle = $t('app.title');
		const routeId = $page.route.id;
		const titles: Record<string, string> = {
			'/': $t('app.title'),
		};
		const routeTitle = titles[routeId || ''] || '';
		return routeTitle ? `${routeTitle} | ${baseTitle}` : baseTitle;
	})() : '');

	$effect(() => {
		if (browser) {
			document.title = pageTitle;
		}
	});

	onMount(() => {
		locale.init();
	});
</script>

<svelte:head>
	<!-- Basic Meta -->
	<meta name="description" content={$t('meta.description')} />
	<meta name="keywords" content="linux distribution, linux distro, choose linux, linux picker, ubuntu, fedora, arch, debian, mint" />
	<meta name="author" content={$t('app.title')}>
	<meta name="robots" content="index, follow">
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website">
	<meta property="og:title" content={$t('app.title')} />
	<meta property="og:description" content={$t('meta.description')} />
	<meta property="og:image" content="{siteUrl}{base}/linux.webp">
	<meta property="og:url" content="{siteUrl}{base}{$page.url.pathname}">
	<meta property="og:site_name" content={$t('app.title')}>
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content={$t('app.title')} />
	<meta name="twitter:description" content={$t('meta.description')} />
	<meta name="twitter:image" content="{siteUrl}{base}/linux.webp">
	<meta name="twitter:url" content="{siteUrl}{base}{$page.url.pathname}">
	
	<!-- Canonical URL -->
	<link rel="canonical" href="{siteUrl}{base}{$page.url.pathname}">
</svelte:head>

<slot />
