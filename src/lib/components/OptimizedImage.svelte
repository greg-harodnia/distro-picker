<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
  	import { base } from '$app/paths';
	import { observeImage } from '$lib/utils/imageObserver';

	export let alt: string;
	export let customClass: string = '';
	export let logo: string | undefined = undefined;

	let imgElement: HTMLImageElement;
	let isLoaded = false;
	let isError = false;
	let unobserve: (() => void) | null = null;

	const iconPath = `${base}${logo || '/linux.webp'}`;

	onMount(() => {
		if (imgElement) {
			unobserve = observeImage(imgElement, iconPath);
		}
	});

	onDestroy(() => {
		if (unobserve) {
			unobserve();
		}
	});

	function handleLoad() {
		isLoaded = true;
	}

	function handleError() {
		isError = true;
		if (imgElement && iconPath !== `${base}/linux.webp`) {	
			imgElement.src = `${base}/linux.webp`;	
		}
	}
</script>

<div class="optimized-image-container {customClass}" class:loaded={isLoaded} class:error={isError}>
	<img
		bind:this={imgElement}
		alt={alt}
		class="optimized-image"
		on:load={handleLoad}
		on:error={handleError}
		style="object-fit: contain;"
		loading="lazy"
	/>
	{#if !isLoaded && !isError}
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