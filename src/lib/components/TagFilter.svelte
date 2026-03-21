<script lang="ts">
	import type { Tag } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import { t } from '$lib/i18n/locale';

	export let tag: Tag;
	export let selected = false;

	const dispatch = createEventDispatcher();

	$: tagName = $t(`tags.${tag.id}.name`) || tag.name;
	$: tagDescription = $t(`tags.${tag.id}.description`) || tag.description;

	function handleClick() {
		dispatch('toggle');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	}
</script>

<button 
 	class="tag-filter"
 	class:selected
 	style="--tag-color: var(--tag-{tag.id})"
 	on:click={handleClick}
 	on:keydown={handleKeydown}
 	aria-pressed={selected}
 	aria-describedby={tag.id + '-tooltip'}
 	tabindex="0"
 >
	{tagName}
	<span class="sr-only">, {tagDescription}</span>
</button>

<div class="tooltip" role="tooltip" id={tag.id + '-tooltip'}>
	{tagDescription}
</div>

<style>
	.tag-filter {
		padding: var(--space-sm) var(--space-md);
		border: 2px solid var(--tag-color);
		border-radius: var(--radius-full);
		background: var(--color-background);
		color: var(--tag-color);
		font-weight: var(--font-semibold);
		cursor: pointer;
		transition: all var(--transition-normal);
		position: relative;
		font-size: var(--text-sm);
	}

	.tag-filter:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	/* .tag-filter:focus {
		box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
	} */

	.tag-filter.selected {
		background: var(--tag-color);
		color: var(--color-background);
	}

	.tooltip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: var(--color-secondary);
		color: var(--color-background);
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		font-size: var(--text-xs);
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--transition-normal);
		margin-bottom: var(--space-sm);
		z-index: var(--z-tooltip);
		max-width: 200px;
		white-space: normal;
		text-align: center;
		box-shadow: var(--shadow-lg);
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 4px solid transparent;
		border-top-color: var(--color-secondary);
	}

	.tag-filter:hover + .tooltip,
	.tag-filter:focus + .tooltip {
		opacity: 1;
	}
</style>