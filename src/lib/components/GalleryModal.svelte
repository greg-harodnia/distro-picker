<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { t } from '$lib/i18n/locale';
	import { lockBodyScroll } from '$lib/utils/body';

	export let images: string[] = [];
	export let distroName: string = '';

	const dispatch = createEventDispatcher();

	let currentIndex = 0;
	let preloadIndexes: number[] = [];

	function close() {
		dispatch('close');
	}

	function prev() {
		currentIndex = (currentIndex - 1 + images.length) % images.length;
		preloadAdjacent();
	}

	function next() {
		currentIndex = (currentIndex + 1) % images.length;
		preloadAdjacent();
	}

	function preloadAdjacent() {
		const prevIdx = (currentIndex - 1 + images.length) % images.length;
		const nextIdx = (currentIndex + 1) % images.length;
		preloadIndexes = [prevIdx, nextIdx];
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		} else if (e.key === 'ArrowLeft') {
			prev();
		} else if (e.key === 'ArrowRight') {
			next();
		}
	}

	onMount(() => {
		lockBodyScroll(true);
		preloadAdjacent();
		return () => {
			lockBodyScroll(false);
		};
	});
</script>

<svelte:window on:keydown={handleKeydown} />

	<div class="modal-overlay" on:click={close} on:keydown={handleKeydown} role="button" tabindex="0" transition:fade={{ duration: 200 }}>
	<div class="modal-content" on:click|stopPropagation on:keydown={handleKeydown} role="dialog" aria-modal="true" aria-label={`${distroName} screenshots`} tabindex="-1" transition:scale={{ duration: 200, start: 0.95 }}>
		<div class="modal-header">
			<span class="serial-number">{currentIndex + 1} / {images.length}</span>
			<button class="close-btn" on:click={close} aria-label={$t('modal.gallery.closeGallery')} type="button">×</button>
		</div>

		{#if images.length === 0}
			<div class="no-images">
				<p>{$t('modal.gallery.noImages')}</p>
			</div>
		{:else}
			<div class="image-container">
				<img 
					src={images[currentIndex]} 
					alt={`${distroName} screenshot ${currentIndex + 1}`} 
					loading="eager" 
					decoding="async" 
				/>
				{#each preloadIndexes as idx}
					<link rel="preload" as="image" href={images[idx]} />
				{/each}
			</div>

			{#if images.length > 1}
				<button class="arrow left-arrow" on:click={prev} aria-label={$t('modal.gallery.previousImage')} type="button">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="15 18 9 12 15 6"></polyline>
					</svg>
				</button>
				<button class="arrow right-arrow" on:click={next} aria-label={$t('modal.gallery.nextImage')} type="button">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</button>
			{/if}
		{/if}
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-lg);
	}

	.modal-content {
		background: var(--color-surface, #1a1a1a);
		border: 2px solid var(--color-border, #333);
		border-radius: var(--radius-lg, 8px);
		width: 100%;
		max-width: 1200px;
		max-height: 85vh;
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-lg, 1rem);
		border-bottom: 1px solid var(--color-border, #333);
		flex-shrink: 0;
	}

	.serial-number {
		color: var(--color-text-secondary, #aaa);
		font-size: var(--text-sm, 0.875rem);
	}

	.close-btn {
		background: none;
		border: none;
		font-size: var(--text-2xl, 1.5rem);
		color: var(--color-text-secondary, #aaa);
		cursor: pointer;
		padding: var(--space-xs, 0.25rem);
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm, 4px);
		transition: all var(--transition-normal, 0.2s);
		line-height: 1;
	}

	.close-btn:hover {
		background: var(--color-background-secondary, #333);
		color: var(--color-secondary, #4ecdc4);
	}

	.image-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: var(--space-lg, 1rem);
	}

	.image-container img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		border-radius: var(--radius-md, 6px);
	}

	.arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: var(--color-surface, #1a1a1a);
		border: 2px solid var(--color-border, #333);
		color: var(--color-text-secondary, #aaa);
		cursor: pointer;
		padding: var(--space-md, 0.75rem);
		border-radius: var(--radius-full, 9999px);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-normal, 0.2s);
	}

	.arrow:hover {
		background: var(--color-background-secondary, #333);
		color: var(--color-secondary, #4ecdc4);
		border-color: var(--color-secondary, #4ecdc4);
	}

	.left-arrow {
		left: var(--space-md, 0.5rem);
	}

	.right-arrow {
		right: var(--space-md, 0.5rem);
	}

	.no-images {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.no-images p {
		color: var(--color-text-secondary, #aaa);
		font-size: var(--text-lg, 1.125rem);
	}

	@media (max-width: 768px) {
		.modal-content {
			max-height: 60vh;
		}

		.arrow {
			padding: var(--space-sm);
		}

		.arrow svg {
			width: 20px;
			height: 20px;
		}
	}

	@media (max-width: 480px) {
		.modal-content {
			max-height: 50vh;
		}

		.left-arrow {
			left: var(--space-xs);
		}

		.right-arrow {
			right: var(--space-xs);
		}
	}
</style>
