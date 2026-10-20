<script lang="ts">
	import { t } from '$lib/i18n/locale';
	import GalleryStage from './GalleryStage.svelte';
	import { createGalleryState } from './galleryState.svelte';

	let {
		images,
		name,
		onexpand
	}: {
		images: string[];
		name: string;
		onexpand?: ((index: number) => void) | undefined;
	} = $props();

	// Recreated when the image list changes (client-side navigation between
	// two distro pages reuses this component), so the index never points
	// beyond the new list.
	let gallery = $derived.by(() => createGalleryState(images));

	let stripEl = $state<HTMLDivElement | null>(null);
	let thumbEls = $state<Array<HTMLElement | null>>([]);

	let expandLabel = $derived(
		`${$t('pages.distro.screenshots')} ${gallery.index + 1} of ${name}`
	);

	$effect(() => {
		const current = gallery.index;
		const strip = stripEl;
		const thumb = thumbEls[current];
		if (!strip || !thumb) return;
		const target = Math.max(0, thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2);
		if (strip.scrollLeft === target) return;
		const reduced =
			typeof matchMedia !== 'undefined' &&
			matchMedia('(prefers-reduced-motion: reduce)').matches;
		strip.scrollTo({ left: target, behavior: reduced ? 'auto' : 'smooth' });
	});
</script>

<div class="shot-panel">
	<GalleryStage
		src={images[gallery.index]}
		alt={`${name} screenshot ${gallery.index + 1}`}
		index={gallery.index}
		total={images.length}
		preloadSrcs={gallery.preloadSrcs}
		onprev={gallery.prev}
		onnext={gallery.next}
		onexpand={onexpand ? () => onexpand(gallery.index) : undefined}
		{expandLabel}
	/>

	{#if images.length > 1}
		<div class="shot-strip" bind:this={stripEl}>
			{#each images as image, i (image)}
				<button
					class="shot-thumb"
					class:active={i === gallery.index}
					type="button"
					aria-current={i === gallery.index ? 'true' : undefined}
					aria-label="{$t('pages.distro.screenshots')} {i + 1} of {name}"
					onclick={() => gallery.jumpTo(i)}
					bind:this={thumbEls[i]}
				>
					<img src={image} alt="" loading="lazy" decoding="async" />
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.shot-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-height: 0;
		height: var(--shot-panel-h, 100%);
		background: var(--color-background-secondary);
		border: var(--shot-border, none);
		border-radius: var(--shot-radius, 0px);
		overflow: hidden;
	}

	.shot-strip {
		position: relative;
		flex: 0 0 auto;
		display: flex;
		gap: var(--space-sm);
		padding: var(--space-sm);
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-snap-type: x proximity;
		scrollbar-width: thin;
	}

	.shot-thumb {
		flex: 0 0 auto;
		width: 96px;
		height: 64px;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: none;
		overflow: hidden;
		cursor: pointer;
		scroll-snap-align: center;
		scroll-margin-inline: var(--space-sm);
		transition: border-color var(--transition-normal);
	}

	.shot-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		user-select: none;
		-webkit-user-drag: none;
	}

	@media (hover: hover) {
		.shot-thumb:hover {
			border-color: var(--color-text);
		}
	}

	.shot-thumb.active {
		border-color: var(--accent);
		box-shadow: 0 0 0 1px var(--accent);
	}

	@media (max-width: 899px) {
		.shot-strip {
			position: absolute;
			left: 0;
			right: 0;
			bottom: 0;
			padding-top: var(--space-xl);
			background: linear-gradient(
				to top,
				color-mix(in srgb, var(--invert-bg) 55%, transparent),
				transparent
			);
			scroll-snap-type: x mandatory;
			scrollbar-width: none;
		}

		.shot-strip::-webkit-scrollbar {
			display: none;
		}

		.shot-thumb {
			width: 84px;
			height: 56px;
		}
	}
</style>
