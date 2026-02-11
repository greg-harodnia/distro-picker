<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getDistroIconPath } from '$lib/utils';
    import { base } from '$app/paths';

	export let distroId: string;
	export let alt: string;
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let customClass: string = '';

	let imgElement: HTMLImageElement;
	let observer: IntersectionObserver;
	let isLoaded = false;
	let isError = false;

	const sizes = {
		small: { width: 48, height: 48 },
		medium: { width: 64, height: 64 },
		large: { width: 96, height: 96 }
	};

	$: currentSize = sizes[size];
	$: iconPath = `${base}${getDistroIconPath(distroId)}`;

	onMount(() => {
		if ('IntersectionObserver' in window) {
			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach(entry => {
						if (entry.isIntersecting) {
							const target = entry.target as HTMLImageElement;
							target.src = iconPath;
							observer.unobserve(target);
						}
					});
				},
				{
					rootMargin: '50px 0px',
					threshold: 0.1
				}
			);

			if (imgElement) {
				observer.observe(imgElement);
			}
		} else {
			// Fallback for browsers that don't support IntersectionObserver
			if (imgElement) {
				imgElement.src = iconPath;
			}
		}
	});

	onDestroy(() => {
		if (observer) {
			observer.disconnect();
		}
	});

	function handleLoad() {
		isLoaded = true;
	}

	function handleError() {
		isError = true;
		// Try loading fallback icon
		if (imgElement && iconPath !== `${base}/linux.png`) {	
			imgElement.src = `${base}/linux.png`;	
		}
	}
</script>

<div class="optimized-image-container {customClass}" class:size class:loaded={isLoaded} class:error={isError}>
	<img
		bind:this={imgElement}
		alt={alt}
		width={currentSize.width}
		height={currentSize.height}
		class="optimized-image"
		on:load={handleLoad}
		on:error={handleError}
		style={`object-fit: contain;`}
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
		/* background: var(--color-border-light); */
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
		animation: shimmer 1.5s infinite;
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

	.optimized-image-container.small {
		width: 48px;
		height: 48px;
	}

	.optimized-image-container.medium {
		width: 64px;
		height: 64px;
	}

	.optimized-image-container.large {
		width: 96px;
		height: 96px;
	}

	@keyframes shimmer {
		0% {
			background: var(--color-border-light);
		}
		50% {
			background: var(--color-border);
		}
		100% {
			background: var(--color-border-light);
		}
	}

	/* Fallback animation for unsupported browsers */
	@supports not (display: grid) {
		.optimized-image-container {
			display: inline-block;
		}
	}
</style>