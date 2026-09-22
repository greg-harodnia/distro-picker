<script lang="ts">
	import type { Tag } from '$lib/types';
	import TagFilter from './TagFilter.svelte';

	let {
		label,
		tags,
		selectedTags,
		open = false,
		ontoggle,
		onopen,
		onclose,
	}: {
		label: string;
		tags: Tag[];
		selectedTags: Set<string>;
		open?: boolean;
		ontoggle: (tagId: string) => void;
		onopen: () => void;
		onclose: () => void;
	} = $props();

	let selectedCount = $derived(tags.filter(tag => selectedTags.has(tag.id)).length);

	let buttonEl = $state<HTMLButtonElement | null>(null);

	function handleClick() {
		if (open) {
			onclose();
		} else {
			onopen();
		}
	}

	// Close on Escape (from anywhere) while the panel is open.
	$effect(() => {
		if (!open) return;

		const onKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				onclose();
				buttonEl?.focus();
			}
		};

		document.addEventListener('keydown', onKeydown);
		return () => document.removeEventListener('keydown', onKeydown);
	});
</script>

<div class="filter-group">
	<button
		class="filter-group-btn"
		class:open
		class:active={selectedCount > 0}
		onclick={handleClick}
		type="button"
		aria-haspopup="true"
		aria-expanded={open}
		bind:this={buttonEl}
	>
		<span class="group-label">{label}</span>
		<svg
			class="chevron"
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>

	{#if open}
		<div class="dropdown-panel" role="group" aria-label={label}>
			{#each tags as tag (tag.id)}
				<TagFilter
					{tag}
					selected={selectedTags.has(tag.id)}
					ontoggle={() => ontoggle(tag.id)}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.filter-group {
		position: relative;
	}

	.filter-group-btn {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-background);
		color: var(--color-text);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		cursor: pointer;
		transition: all var(--transition-normal);
		white-space: nowrap;
	}

	@media (hover: hover) {
		.filter-group-btn:hover {
			border-color: var(--color-secondary);
		}
	}

	.filter-group-btn.active,
	.filter-group-btn.open {
		border-color: var(--color-secondary);
	}

	.filter-group-btn.open {
		background: var(--color-secondary);
		color: var(--color-background);
	}

	.chevron {
		flex-shrink: 0;
		transition: transform var(--transition-normal);
	}

	.filter-group-btn.open .chevron {
		transform: rotate(180deg);
	}

	.dropdown-panel {
		position: absolute;
		top: calc(100% + var(--space-sm));
		left: 0;
		z-index: var(--z-dropdown);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-sm);
		min-width: 220px;
		max-width: min(85vw, 420px);
		padding: var(--space-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
	}

	@media (max-width: 640px) {
		.dropdown-panel {
			position: fixed;
			top: 30%;
			left: 50%;
			transform: translateX(-50%);
			width: min(90vw, 360px);
			min-width: 0;
			max-width: 90vw;
		}
	}
</style>
