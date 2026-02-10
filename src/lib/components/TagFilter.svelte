<script lang="ts">
	import type { Tag } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	export let tag: Tag;
	export let selected = false;

	const dispatch = createEventDispatcher();

	function handleClick() {
		dispatch('toggle');
	}
</script>

<button 
	class="tag-filter"
	class:selected
	style="--tag-color: {tag.color}"
	on:click={handleClick}
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
>
	{tag.name}
</button>

<div class="tooltip" role="tooltip">
	{tag.description}
</div>

<style>
	.tag-filter {
		padding: 0.5rem 1rem;
		border: 2px solid var(--tag-color);
		border-radius: 2rem;
		background: white;
		color: var(--tag-color);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		position: relative;
	}

	.tag-filter:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.tag-filter.selected {
		background: var(--tag-color);
		color: white;
	}

	.tooltip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: #2c3e50;
		color: white;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		white-space: nowrap;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s ease;
		margin-bottom: 0.5rem;
		z-index: 10;
		max-width: 200px;
		white-space: normal;
		text-align: center;
	}

	.tooltip::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 4px solid transparent;
		border-top-color: #2c3e50;
	}

	.tag-filter:hover + .tooltip {
		opacity: 1;
	}
</style>