<script lang="ts">
	import { base } from '$app/paths';
	import { logoContrast } from '$lib/utils/logoContrast';

	// Paths of images that have loaded at least once on this page. If a card's
	// image is already in the cache, a fresh OptimizedImage instance starts
	// "loaded" so remounting (after a filter change collapses/restores a card)
	// doesn't flash the placeholder again. Module-scoped so it survives unmount.
	const loadedIcons = new Set<string>();

	const FALLBACK = `${base}/linux.webp`;

	let {
		alt,
		customClass = '',
		logo,
	}: {
		alt: string;
		customClass?: string;
		logo?: string | undefined;
	} = $props();

	let iconPath = $derived(`${base}${logo || '/linux.webp'}`);

	// Both flags are keyed by path rather than being one-way booleans, so if the
	// `logo` prop ever changes the component recovers instead of staying stuck
	// on the placeholder (or on the fallback).
	let loadedPath = $state<string | null>(null);
	let failedPath = $state<string | null>(null);

	let hasError = $derived(failedPath === iconPath);
	let isLoaded = $derived(loadedPath === iconPath || loadedIcons.has(iconPath));

	// The `src` is always set — including in the SSR/prerendered HTML — so the
	// logo is part of the initial document instead of appearing only after
	// hydration. Native `loading="lazy"` defers off-screen loads, which replaces
	// the old IntersectionObserver (that one deferred the `src` itself, leaving
	// every card's <img> without a source in the server-rendered markup).
	let src = $derived(hasError ? FALLBACK : iconPath);

	function handleLoad() {
		// When the substitute has been swapped in, this load is the fallback,
		// not the logo — don't mark the logo as cached.
		if (hasError) return;
		loadedIcons.add(iconPath);
		loadedPath = iconPath;
	}

	function handleError() {
		failedPath = iconPath;
	}
</script>

<div class="optimized-image-container {customClass}" class:loaded={isLoaded} class:error={hasError}>
	<img
		{alt}
		class="optimized-image"
		{src}
		onload={handleLoad}
		onerror={handleError}
		style="object-fit: contain; -webkit-user-drag: none; user-select: none;"
		loading="lazy"
		draggable="false"
		use:logoContrast={iconPath}
	/>
	{#if !isLoaded && !hasError}
		<div class="image-placeholder"></div>
	{/if}
</div>

<style>
	.optimized-image-container {
		position: relative;
		display: inline-block;
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.optimized-image {
		display: block;
		transition: opacity var(--transition-normal);
		opacity: 0;
	}

	.image-placeholder {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--color-border-light);
	}

	.loaded .optimized-image {
		opacity: 1;
	}

	.loaded .image-placeholder {
		display: none;
	}

	.error .optimized-image {
		opacity: 0.5;
	}
</style>
