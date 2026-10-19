<script lang="ts">
	import type { Distro, DistroTier } from '$lib/types';
	import DistroGrid from '$lib/components/DistroGrid.svelte';
	import ChevronDownIcon from '$lib/components/icons/ChevronDownIcon.svelte';

	let {
		tier,
		title,
		index = 1,
		distros = [],
		visibleIds = null,
		onselect = (_distro: Distro) => {},
		open = true,
		ontoggle = () => {},
	}: {
		tier: DistroTier;
		title: string;
		index?: number;
		distros?: Distro[];
		visibleIds?: Set<string> | null;
		onselect?: (distro: Distro) => void;
		open?: boolean;
		ontoggle?: () => void;
	} = $props();

	// Two-digit section number, e.g. `01`, used as an editorial index.
	let sectionNumber = $derived(String(index).padStart(2, '0'));

	// `distros` is the full, unfiltered tier list (kept mounted so icons never
	// reload). Only the count / section visibility respond to the filters.
	let visibleCount = $derived(
		visibleIds ? distros.filter(d => visibleIds.has(d.id)).length : distros.length
	);
</script>

<section class="tier tier--{tier}" hidden={visibleCount === 0}>
	<h3 class="tier-heading">
		<button
			type="button"
			class="tier-header"
			onclick={ontoggle}
			aria-expanded={open}
		>
			<span class="tier-index mono-label">{sectionNumber}</span>
			<span class="tier-sep mono-label" aria-hidden="true">/</span>
			<span class="tier-title">{title}</span>
			<span class="tier-count mono-label">{visibleCount}</span>
			<ChevronDownIcon size={18} strokeWidth={1.75} class="chevron{open ? ' open' : ''}" />
		</button>
	</h3>

	<!-- Kept mounted (only hidden) so the card images stay loaded and don't
	     re-fetch/re-flash every time the section is expanded or re-shown. -->
	<div class="tier-panel" class:collapsed={!open}>
		<div class="tier-clip">
			<DistroGrid {distros} {visibleIds} {onselect} />
		</div>
	</div>
</section>

<style>
	.tier[hidden] {
		display: none;
	}

	/* Skip rendering off-screen tiers; contain-intrinsic-size reserves space
	   to avoid scroll jank when they enter the viewport.

	   `content-visibility` implies paint containment, which clips descendants
	   to the padding box — the content box is exactly the grid's width, so the
	   last column's ❤️ pill (`.reactions` hangs 10px past its card) got sliced
	   off at the content edge. The 16px right bleed matches `.tier-panel`'s
	   clip-path margin so the overhang paints again; the negative margin
	   cancels the padding, so the header rule, cards and column positions are
	   byte-for-byte where they were. */
	.tier {
		content-visibility: auto;
		contain-intrinsic-size: auto 400px;
		margin-right: -16px;
		padding-right: 16px;
	}

	.tier:not(:last-child) {
		margin-bottom: var(--space-xl);
	}

	/* The panel stays mounted (so the card images don't reload) and collapses by
	   animating a grid track 1fr ↔ 0fr rather than `height` ↔ `auto`: keyword
	   height interpolation needs `interpolate-size`, which only Chromium
	   implements, so Firefox/Safari would snap with no animation. Grid track
	   interpolation runs everywhere (Chrome/Edge 107+, Firefox 66+, Safari 16+)
	   and degrades to that same instant snap only below those versions. The
	   track does the layout collapsing, so card widths stay untouched, and the
	   row shrinks in flow — no phantom scroll past the end of the document.

	   `clip-path` extends the clip 16px beyond the box so the ❤️/badge
	   overhangs and shadows of the outer card columns stay visible at rest, and
	   clips exactly at the panel edge while opening/closing — nothing lingers
	   as a visible sliver when the panel finishes closing. */
	.tier-panel {
		display: grid;
		grid-template-rows: 1fr;
		clip-path: inset(-16px);
		transition:
			grid-template-rows var(--transition-slow),
			clip-path var(--transition-slow);
	}

	.tier-panel.collapsed {
		grid-template-rows: 0fr;
		clip-path: inset(-16px -16px 100% -16px);
	}

	/* The grid's wrapper: `min-height: 0` lets it collapse with the 0fr track
	   (its automatic minimum size would otherwise hold the row open), while
	   `overflow: clip` — not `hidden`: no scroll container — drops the grid
	   from the document's scrollable overflow. `clip-path` alone hides it
	   visually but still leaves ~530px of scrollable space past the end. The
	   16px clip margin matches the panel's own -16px bleed so the card
	   overhangs paint at rest. */
	.tier-clip {
		min-height: 0;
		overflow: clip;
		overflow-clip-margin: 16px;
	}

	@media (prefers-reduced-motion: reduce) {
		.tier-panel {
			transition: none;
		}
	}

	.tier-heading {
		margin: 0;
		font-size: inherit;
	}

	.tier-header {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
		width: 100%;
		padding: var(--space-md) 0;
		background: none;
		border: none;
		border-bottom: 1px solid var(--line);
		color: var(--color-text);
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		letter-spacing: -0.01em;
		text-align: left;
		cursor: pointer;
		transition: color var(--transition-normal);
	}

	.tier-index {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.tier-sep {
		color: var(--color-text-muted);
	}

	@media (hover: hover) {
		.tier-header:hover {
			color: var(--accent);
		}

		.tier-header:hover :global(.chevron) {
			color: var(--color-text);
		}
	}

	.tier-header:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.tier-header :global(.chevron) {
		flex-shrink: 0;
		align-self: center;
		margin-left: auto;
		color: var(--color-text-muted);
		transform: rotate(-90deg);
		transition: transform var(--transition-normal), color var(--transition-normal);
	}

	.tier-header :global(.chevron.open) {
		transform: rotate(0deg);
	}

	.tier-title {
		font-size: inherit;
		line-height: var(--line-height-tight);
	}

	.tier-count {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		/* Sit the count off the title instead of hugging it (the flex gap
		   alone leaves it cramped). */
		margin-left: var(--space-sm);
	}

	@media (max-width: 640px) {
		.tier-header {
			font-size: var(--text-lg);
		}
	}
</style>