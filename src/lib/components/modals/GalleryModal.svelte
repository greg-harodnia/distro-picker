<script lang="ts">
	import { untrack } from 'svelte';
	import { t } from '$lib/i18n/locale';
	import Modal from './Modal.svelte';
	import GalleryStage from '$lib/components/GalleryStage.svelte';
	import { createGalleryState } from '$lib/components/galleryState.svelte';

	let {
		images = [],
		distroName = '',
		initialIndex = 0,
		onclose = () => {},
	}: {
		images?: string[];
		distroName?: string;
		/** Opening position, read once per image list — not a live binding. */
		initialIndex?: number;
		onclose?: () => void;
	} = $props();

	// Derived, not snapshotted: client-side navigation can change `images`
	// while this modal is mounted, and the index must reset with the list.
	// `untrack` keeps `initialIndex` a one-time opening position.
	let gallery = $derived.by(() => createGalleryState(images, untrack(() => initialIndex)));

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') {
			gallery.prev();
		} else if (e.key === 'ArrowRight') {
			gallery.next();
		}
	}
</script>

<Modal
	{onclose}
	scrollable={false}
	onkeydown={handleKeydown}
	ariaLabel={`${distroName} screenshots`}
	contentStyle="max-width: 1200px;"
	contentClass="gallery-modal-content"
>
	{#if images.length === 0}
		<div class="no-images">
			<p>{$t('modals.gallery.noImages')}</p>
		</div>
	{:else}
		<GalleryStage
			src={images[gallery.index]}
			alt={`${distroName} screenshot ${gallery.index + 1}`}
			index={gallery.index}
			total={images.length}
			preloadSrcs={gallery.preloadSrcs}
			onprev={gallery.prev}
			onnext={gallery.next}
			zoom={true}
		/>
	{/if}
</Modal>

<style>
	.no-images {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-lg);
	}

	.no-images p {
		color: var(--color-text-secondary);
		font-size: var(--text-lg);
	}
</style>
