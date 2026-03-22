<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getDistroIconPath } from '$lib/utils';
  import { base } from '$app/paths';
	import { observeImage } from '$lib/utils/imageObserver';

	export let distroId: string;
	export let alt: string;
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let customClass: string = '';

	let imgElement: HTMLImageElement;
	let isLoaded = false;
	let isError = false;
	let unobserve: (() => void) | null = null;

	const sizes = {
		small: { width: 48, height: 48 },
		medium: { width: 64, height: 64 },
		large: { width: 96, height: 96 }
	};

	const iconPath = `${base}${getDistroIconPath(distroId)}`;
	const currentSize = sizes[size];

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
		width={currentSize.width}
		height={currentSize.height}
		class="optimized-image size-{size}"
		on:load={handleLoad}
		on:error={handleError}
		style="object-fit: contain;"
		loading="lazy"
		decoding="async"
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

	.size-small {
		width: 48px;
		height: 48px;
	}

	.size-medium {
		width: 64px;
		height: 64px;
	}

	.size-large {
		width: 96px;
		height: 96px;
	}
</style>