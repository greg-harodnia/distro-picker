<script lang="ts">
	import { base } from '$app/paths';
	import { FALLBACK_LOGO, logoFlip, logoPath } from '$lib/utils/assets';

	const FALLBACK = `${base}${FALLBACK_LOGO}`;

	let {
		alt,
		customClass = '',
		logo,
		eager = false,
	}: {
		alt: string;
		customClass?: string;
		logo?: string | undefined;
		/**
		 * Load at parse time instead of on scroll. Set by the parent for the
		 * sections it expects to be in the first viewport — a guess, since the
		 * prerendered HTML doesn't know the screen size.
		 */
		eager?: boolean;
	} = $props();

	let iconPath = $derived(`${base}${logoPath(logo)}`);

	// Keyed by path rather than being a one-way boolean, so if the `logo` prop
	// ever changes a past failure stops substituting the fallback for it.
	let failedPath = $state<string | null>(null);
	let hasError = $derived(failedPath === iconPath);

	// The `src` is always set — including in the SSR/prerendered HTML — so the
	// logo paints as soon as the browser decodes it, like the rest of the page:
	// no placeholder and no fade-in. The card's fixed 64×64 slot is reserved by
	// the container, so a slow logo costs no layout shift either way. `onerror`
	// is the only state left to manage — a logo that 404s swaps to the shared
	// fallback image and dims, so the broken-image glyph never lingers.
	//
	// `eager` lifts a card out of `loading="lazy"`. The preload scanner already
	// fetched in-viewport lazy images at parse time anyway, so what the flag
	// really changes is the queue position — and `fetchpriority="low"` keeps
	// these logos from outbidding the preloaded LCP webfont, which went into
	// the fetch queue before them.
	let src = $derived(hasError ? FALLBACK : iconPath);

	function handleError() {
		failedPath = iconPath;
	}
</script>

<div class="optimized-image-container {customClass}" class:error={hasError}>
	<img
		{alt}
		class="optimized-image {logoFlip(logo)}"
		{src}
		onerror={handleError}
		style="object-fit: contain; -webkit-user-drag: none; user-select: none;"
		loading={eager ? 'eager' : 'lazy'}
		fetchpriority={eager ? 'low' : undefined}
		draggable="false"
	/>
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
	}

	.error .optimized-image {
		opacity: 0.5;
	}
</style>
