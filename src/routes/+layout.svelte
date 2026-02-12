<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	
	const siteUrl = 'https://greg-harodnia.github.io/distro-picker';
	
	// Update page title dynamically based on current route
	$: if (browser && $page) {
		const baseTitle = 'Linux Distribution Picker';
		const routeTitle = getRouteTitle($page.route.id);
		document.title = routeTitle ? `${routeTitle} | ${baseTitle}` : baseTitle;
	}

	function getRouteTitle(routeId: string | null): string {
		if (!routeId) return '';
		
		const titles: Record<string, string> = {
			'/': 'Find Your Perfect Linux Distro',
			// Add more routes as needed
		};
		
		return titles[routeId] || '';
	}

	export const prerender = true; // for GitHub pages
</script>

<svelte:head>
	<!-- Basic Meta -->
	<meta name="description" content="Discover the perfect Linux distribution for your needs. Filter by gaming, development, user-friendliness, and more." />
	<meta name="keywords" content="linux distribution, linux distro, choose linux, linux picker, ubuntu, fedora, arch, debian, mint" />
	<meta name="author" content="Linux Distribution Picker">
	<meta name="robots" content="index, follow">
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website">
	<meta property="og:title" content="Linux Distribution Picker - Find Your Perfect Linux Distro">
	<meta property="og:description" content="Discover the perfect Linux distribution for your needs. Filter by gaming, development, user-friendliness, and more.">
	<meta property="og:image" content="{siteUrl}{base}/linux.png">
	<meta property="og:url" content="{siteUrl}{base}{$page.url.pathname}">
	<meta property="og:site_name" content="Linux Distribution Picker">
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:title" content="Linux Distribution Picker - Find Your Perfect Linux Distro">
	<meta name="twitter:description" content="Discover the perfect Linux distribution for your needs. Filter by gaming, development, user-friendliness, and more.">
	<meta name="twitter:image" content="{siteUrl}{base}/linux.png">
	<meta name="twitter:url" content="{siteUrl}{base}{$page.url.pathname}">
	
	<!-- Canonical URL -->
	<link rel="canonical" href="{siteUrl}{base}{$page.url.pathname}">
	
	<!-- Security Headers (can stay here or move back to app.html) -->
	<meta http-equiv="content-security-policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; font-src 'self';">
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