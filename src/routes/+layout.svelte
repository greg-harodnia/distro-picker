<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import { t, locale } from '$lib/i18n/locale';
	
	const siteUrl = 'https://greg-harodnia.github.io/distro-picker';
	
	// Update page title dynamically based on current route
	$: if (browser && $page) {
		const baseTitle = $t('app.title');
		const routeTitle = getRouteTitle($page.route.id);
		document.title = routeTitle ? `${routeTitle} | ${baseTitle}` : baseTitle;
	}

	function getRouteTitle(routeId: string | null): string {
		if (!routeId) return '';
		
		const titles: Record<string, string> = {
			'/': $t('app.title'),
		};
		
		return titles[routeId] || '';
	}

	export const prerender = true;

	if (browser) {
		locale.init();
	}
</script>

<svelte:head>
	<!-- Basic Meta -->
	<meta name="description" content={$t('app.noResults').replace('.', '')} />
	<meta name="keywords" content="linux distribution, linux distro, choose linux, linux picker, ubuntu, fedora, arch, debian, mint" />
	<meta name="author" content={$t('app.title')}>
	<meta name="robots" content="index, follow">
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website">
	<meta property="og:title" content="{$t('app.title')} - {$t('app.title')}" />
	<meta property="og:description" content={$t('app.noResults').replace('.', '')} />
	<meta property="og:image" content="{siteUrl}{base}/linux.png">
	<meta property="og:url" content="{siteUrl}{base}{$page.url.pathname}">
	<meta property="og:site_name" content={$t('app.title')}>
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content="{$t('app.title')} - {$t('app.title')}" />
	<meta name="twitter:description" content={$t('app.noResults').replace('.', '')} />
	<meta name="twitter:image" content="{siteUrl}{base}/linux.png">
	<meta name="twitter:url" content="{siteUrl}{base}{$page.url.pathname}">
	
	<!-- Canonical URL -->
	<link rel="canonical" href="{siteUrl}{base}{$page.url.pathname}">
	
	<!-- Security Headers (can stay here or move back to app.html) -->
	<meta http-equiv="content-security-policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://lsydfkkkjazznplskovm.supabase.co; font-src 'self';">
	<meta name="referrer" content="strict-origin-when-cross-origin">
</svelte:head>

<slot />

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		min-height: 100vh;
	}
</style>