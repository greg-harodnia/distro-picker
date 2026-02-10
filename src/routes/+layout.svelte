<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

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
</script>

<svelte:head>
	<meta name="description" content="Discover the perfect Linux distribution for your needs. Filter by gaming, development, user-friendliness, and more." />
	<meta name="keywords" content="linux distribution, linux distro, choose linux, linux picker, ubuntu, fedora, arch, debian, mint" />
</svelte:head>

<slot />

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		min-height: 100vh;
	}
</style>