											<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n/locale';
	import Modal from './Modal.svelte';

	let {
		images = [],
		distroName = '',
		onclose = () => {},
	}: {
		images?: string[];
		distroName?: string;
		onclose?: () => void;
	} = $props();

	let currentIndex = $state(0);
	let preloadIndexes: number[] = $state([]);

	let scale = $state(1);
	let translateX = $state(0);
	let translateY = $state(0);
	let isZooming = $state(false);

	let startDistance = 0;
	let startScale = 1;
	let startX = 0;
	let startY = 0;
	let originX = $state('50%');
	let originY = $state('50%');

	function getTouchCenter(touches: TouchList) {
		return {
			x: (touches[0].clientX + touches[1].clientX) / 2,
			y: (touches[0].clientY + touches[1].clientY) / 2
		};
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 2) {
			isZooming = true;
			startDistance = Math.hypot(
				e.touches[0].clientX - e.touches[1].clientX,
				e.touches[0].clientY - e.touches[1].clientY
			);
			startScale = scale;
			
			const center = getTouchCenter(e.touches);
			const img = (e.target as HTMLElement).closest('.image-container')?.querySelector('img');
			if (img) {
				const rect = img.getBoundingClientRect();
				originX = `${((center.x - rect.left) / rect.width) * 100}%`;
				originY = `${((center.y - rect.top) / rect.height) * 100}%`;
			}
		} else if (e.touches.length === 1 && scale > 1) {
			isZooming = true;
			startX = e.touches[0].clientX - translateX;
			startY = e.touches[0].clientY - translateY;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isZooming) return;
		e.preventDefault();

		if (e.touches.length === 2) {
			const distance = Math.hypot(
				e.touches[0].clientX - e.touches[1].clientX,
				e.touches[0].clientY - e.touches[1].clientY
			);
			scale = Math.max(1, Math.min(startScale * (distance / startDistance), 4));
		} else if (e.touches.length === 1 && scale > 1) {
			translateX = e.touches[0].clientX - startX;
			translateY = e.touches[0].clientY - startY;
		}
	}

	function handleTouchEnd() {
		isZooming = false;
		scale = 1;
		translateX = 0;
		translateY = 0;
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
		if (e.key === 'ArrowLeft') {
			prev();
		} else if (e.key === 'ArrowRight') {
			next();
		}
	}

	onMount(() => {
		preloadAdjacent();
	});
</script>

<Modal {onclose} scrollable={false} onkeydown={handleKeydown} ariaLabel={`${distroName} screenshots`} contentStyle="max-width: 1200px; position: relative;" contentClass="gallery-modal-content">
	{#snippet header()}
		<span class="serial-number">{currentIndex + 1} / {images.length}</span>
	{/snippet}

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
				ontouchstart={handleTouchStart}
				ontouchmove={handleTouchMove}
				ontouchend={handleTouchEnd}
				class:zoomed={scale > 1}
				style="transform: translate({translateX}px, {translateY}px) scale({scale}); transform-origin: {originX} {originY}"
			/>
			{#each preloadIndexes as idx}
				<link rel="preload" as="image" href={images[idx]} />
			{/each}
		</div>

		{#if images.length > 1}
			<button class="arrow left-arrow" onclick={prev} aria-label={$t('modal.gallery.previousImage')} type="button">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>
			<button class="arrow right-arrow" onclick={next} aria-label={$t('modal.gallery.nextImage')} type="button">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>
		{/if}
	{/if}
</Modal>

<style>
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
		transition: transform 0.2s ease-out;
		touch-action: none;
	}

	.image-container img.zoomed {
		transition: none;
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

	@media (max-width: 640px) {
		:global(.modal-overlay .modal-content.gallery-modal-content) {
			max-height: 50vh;
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
		.left-arrow {
			left: var(--space-xs);
		}

		.right-arrow {
			right: var(--space-xs);
		}
	}
</style>
