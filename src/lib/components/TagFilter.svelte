<script lang="ts">
	import type { Tag } from '$lib/types';
	import { t } from '$lib/i18n/locale';
	import { humanizeId } from '$lib/i18n/translations';
	import { getTagGroup } from '$lib/tagGroups';

	let {
		tag,
		selected = false,
		ontoggle = () => {},
	}: {
		tag: Tag;
		selected?: boolean;
		ontoggle?: () => void;
	} = $props();

	let group = $derived(getTagGroup(tag.id));

	let tagName = $derived(
		group ? $t(`tags.${group}.entries.${tag.id}.name`) || humanizeId(tag.id) : humanizeId(tag.id)
	);
	let tagDescription = $derived(
		group
			? $t(`tags.${group}.entries.${tag.id}.description`) || tag.description
			: tag.description
	);

	function handleClick() {
		ontoggle();
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
 	onclick={handleClick}
 	onkeydown={handleKeydown}
 	aria-pressed={selected}
 	tabindex="0"
 >
	{tagName}
	<span class="sr-only">, {tagDescription}</span>
</button>

<style>
	.tag-filter {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-sm) var(--space-md);
		height: 34px;
		border: 1px solid transparent;
		box-shadow: inset 0 0 0 1px var(--tag-color);
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--tag-color);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--transition-normal);
		position: relative;
		font-size: var(--text-sm);
		white-space: nowrap;
		flex-shrink: 0;
	}

	@media (hover: hover) {
		.tag-filter:hover {
			background: color-mix(in srgb, var(--tag-color) 12%, transparent);
		}
	}

	.tag-filter.selected {
		background: var(--tag-color);
		color: var(--color-background);
	}
</style>
