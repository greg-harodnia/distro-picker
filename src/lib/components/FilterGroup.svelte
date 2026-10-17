<script lang="ts">
	import type { Tag } from '$lib/types';
	import TagFilter from './TagFilter.svelte';
	import ChevronRightIcon from './icons/ChevronRightIcon.svelte';
	import { fly } from 'svelte/transition';

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
	let panelEl = $state<HTMLElement | null>(null);

	// When a group opens, scroll the filter strip so the beginning of the
	// expanded tag list becomes visible (only if it pokes out of the viewport).
	$effect(() => {
		if (!open || !panelEl) return;

		const container = panelEl.closest('.filter-groups') as HTMLElement | null;
		if (!container) return;

		const containerRect = container.getBoundingClientRect();
		const panelRect = panelEl.getBoundingClientRect();

		const leftGap = panelRect.left - containerRect.left;
		const rightGap = panelRect.right - containerRect.right;

		// Already fully visible — nothing to scroll.
		if (leftGap >= 0 && rightGap <= 0) return;

		// Align the beginning of the expanded tag list with the left edge
		// of the strip (matters on mobile, where groups exceed 100% width).
		container.scrollTo({
			left: container.scrollLeft + leftGap,
			behavior: 'smooth',
		});
	});

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
		aria-expanded={open}
		bind:this={buttonEl}
	>
		<span class="group-label mono-label">{label}</span>
		<ChevronRightIcon size={16} class="chevron" />
	</button>

	{#if open}
		<div
			class="expanded-panel"
			role="group"
			aria-label={label}
			in:fly={{ x: -10, duration: 200 }}
			bind:this={panelEl}
		>
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
		flex-shrink: 0;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--space-sm);
	}

	.filter-group-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		height: 34px;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-full);
		background: var(--color-surface);
		color: var(--color-text);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--transition-normal);
		white-space: nowrap;
		flex-shrink: 0;
	}

	/* Pin inheritance so the label tracks the button's state colors
	   (esp. `.open`'s inverted palette) over `.mono-label`'s muted color. */
	.group-label {
		color: inherit;
	}

	@media (hover: hover) {
		.filter-group-btn:hover {
			border-color: var(--color-text);
		}
	}

	.filter-group-btn.active {
		border-color: var(--color-text);
	}

	.filter-group-btn.open {
		background: var(--color-secondary);
		border-color: var(--color-secondary);
		color: var(--color-background);
	}

	.filter-group-btn :global(.chevron) {
		flex-shrink: 0;
		transition: transform var(--transition-normal);
	}

	.filter-group-btn.open :global(.chevron) {
		transform: rotate(180deg);
	}

	.expanded-panel {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
		gap: var(--space-sm);
		flex-shrink: 0;
	}
</style>
