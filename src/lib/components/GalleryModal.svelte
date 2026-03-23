<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { t } from '$lib/i18n/locale';
	import { lockBodyScroll } from '$lib/utils/body';
	import CloseIcon from './icons/CloseIcon.svelte';

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

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
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

	<div class="modal-overlay" on:click={handleOverlayClick} on:keydown={handleKeydown} role="button" tabindex="0" transition:fade={{ duration: 200 }}>
	<div class="modal-content" on:click|stopPropagation on:keydown={handleKeydown} role="dialog" aria-modal="true" aria-label={`${distroName} screenshots`} tabindex="-1">
		<div class="modal-header">
			<span class="serial-number">{currentIndex + 1} / {images.length}</span>
			<button class="close-btn" on:click={close} aria-label={$t('modal.gallery.closeGallery')} type="button">
				<CloseIcon />
			</button>
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
	.modal-content {
		max-width: 1200px;
		height: 100%;
		position: relative;
	}

	.serial-number {
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}

	.image-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: var(--space-lg);
	}

	.image-container img {
		max-width: 100%;
		max-height: 100%;
		border-radius: var(--radius-md);
	}

	.arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: var(--space-md);
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-normal);
	}

	.arrow:hover {
		background: var(--color-background-secondary);
		color: var(--color-secondary);
		border-color: var(--color-secondary);
	}

	.left-arrow {
		left: var(--space-md);
	}

	.right-arrow {
		right: var(--space-md);
	}

	.no-images {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.no-images p {
		color: var(--color-text-secondary);
		font-size: var(--text-lg);
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
