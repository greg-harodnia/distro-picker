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
		<DistroGrid {distros} {visibleIds} {onselect} />
	</div>
</section>

<style>
	.tier[hidden] {
		display: none;
	}

	.tier:not(:last-child) {
		margin-bottom: var(--space-xl);
	}

	/* The panel stays mounted (so the card images don't reload) and collapses by
	   animating its height from auto to 0 and back via `clip-path`, which both
	   (a) extends the clip 16px beyond the box so the ❤️/badge overhangs and
	   shadows of the outer card columns stay visible at rest, and (b) clips
	   exactly at the panel edge while opening/closing — nothing lingers as a
	   visible sliver when the panel finishes closing. Height (not overflow) does
	   the layout collapsing, so card widths stay untouched. */
	.tier-panel {
		height: auto;
		clip-path: inset(-16px);
	}

	.tier-panel.collapsed {
		height: 0;
		/* `clip-path` hides the overflowing grid visually but does NOT remove it
		   from scrollable overflow — without this the document stays ~530px
		   scrollable past the end (empty space where the expanded grid would
		   be). `overflow: clip` (not `hidden`: no scroll container) drops that
		   phantom scroll area; the 16px clip margin matches clip-path's own
		   -16px bleed so badge overhangs animate identically. */
		overflow: clip;
		overflow-clip-margin: 16px;
		clip-path: inset(-16px -16px 100% -16px);
	}

	@supports (interpolate-size: allow-keywords) {
		.tier-panel {
			interpolate-size: allow-keywords;
			transition:
				height var(--transition-slow),
				clip-path var(--transition-slow);
		}
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