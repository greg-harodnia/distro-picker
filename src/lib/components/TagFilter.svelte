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
		white-space: nowrap;
	}

	@media (hover: hover) {
		.tag-filter:hover {
			transform: translateY(-2px);
			box-shadow: var(--shadow-lg);
		}
	}

	.tag-filter.selected {
		background: var(--tag-color);
		color: var(--color-background);
	}
</style>
