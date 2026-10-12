<script lang="ts">
	import type { Distro, DistroTier } from '$lib/types';
	import DistroGrid from '$lib/components/DistroGrid.svelte';

	let {
		tier,
		title,
		distros = [],
		visibleIds = null,
		selectedDistro = null,
		onselect = (_distro: Distro) => {},
		open = true,
		ontoggle = () => {},
	}: {
		tier: DistroTier;
		title: string;
		distros?: Distro[];
		visibleIds?: Set<string> | null;
		selectedDistro?: Distro | null;
		onselect?: (distro: Distro) => void;
		open?: boolean;
		ontoggle?: () => void;
	} = $props();

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
			<svg
				class="chevron"
				class:open
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<polyline points="6 9 12 15 18 9"></polyline>
			</svg>
			<span class="tier-title">{title}</span>
			<span class="tier-count">{visibleCount}</span>
		</button>
	</h3>

	<!-- Kept mounted (only hidden) so the card images stay loaded and don't
	     re-fetch/re-flash every time the section is expanded or re-shown. -->
	<div class="tier-panel" class:collapsed={!open}>
		<DistroGrid {distros} {visibleIds} {selectedDistro} {onselect} />
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
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
		padding: var(--space-sm) 0;
		background: none;
		border: none;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-secondary);
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		text-align: left;
		cursor: pointer;
		transition: color var(--transition-normal);
	}

	@media (hover: hover) {
		.tier-header:hover {
			color: var(--color-text);
		}

		.tier-header:hover .chevron {
			color: var(--color-text-secondary);
		}
	}

	.tier-header:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.chevron {
		flex-shrink: 0;
		color: var(--color-text-muted);
		transform: rotate(-90deg);
		transition: transform var(--transition-normal), color var(--transition-normal);
	}

	.chevron.open {
		transform: rotate(0deg);
	}

	.tier-title {
		font-size: inherit;
		line-height: var(--line-height-tight);
	}

	.tier-count {
		margin-left: auto;
		font-size: var(--text-sm);
		font-weight: var(--font-normal);
		color: var(--color-text-secondary);
	}

	@media (max-width: 640px) {
		.tier-header {
			font-size: var(--text-lg);
		}
	}
</style>