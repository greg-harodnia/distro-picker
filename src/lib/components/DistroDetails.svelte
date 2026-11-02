<script lang="ts">
	import type { Distro, Tag } from "$lib/types";
	import { t } from "$lib/i18n/locale";
	import { humanizeId } from "$lib/i18n/translations";
	import { getTagGroup } from "$lib/tagGroups";

	let {
		distro,
		tags = [],
		distroSeaUrl,
	}: {
		distro: Distro;
		tags?: Tag[];
		distroSeaUrl?: string | undefined;
	} = $props();

	let translatedDescription = $derived($t(`distros.${distro.id}.description`) as string);
	let translatedUserbaseSuffix = $derived($t(`distros.${distro.id}.userbasePostfix`) as string | undefined);
	let translatedBasedOn = $derived(distro.based_on === 'independent' ? $t('modals.distro.independent') : distro.based_on);

	let tagMap = $derived(new Map(tags.map(tag => [tag.id, tag])));

	let translatedTagNames = $derived(distro.tag_ids?.map((tagId) => {
		const tag = tagMap.get(tagId);
		const group = tag ? getTagGroup(tag.id) : undefined;
		return {
			tagId,
			name: group
				? $t(`tags.${group}.entries.${tagId}.name`) || humanizeId(tagId)
				: humanizeId(tagId),
		};
	}) || []);

	let translatedSwapStrategy = $derived(
		distro.swap_strategy ? $t(`modals.distro.swap.${distro.swap_strategy}`) as string : ''
	);
</script>

<div class="distro-details">
	<div class="specs">
		{#if translatedBasedOn}
			<div class="spec">
				<span class="spec-label mono-label">{$t('modals.distro.basedOn')}</span>
				<span class="spec-value">{translatedBasedOn}</span>
			</div>
		{/if}

		{#if distro.desktops && distro.desktops.length > 0}
			<div class="spec">
				<span class="spec-label mono-label">
					{distro.desktops.length === 1 ? $t('modals.distro.desktop') : $t('modals.distro.desktops')}
				</span>
				<span class="spec-value">
					{distro.desktops.join(", ")}{#if distro.hasMoreDesktops}{$t('modals.distro.andMore')}{/if}
				</span>
			</div>
		{/if}

		{#if distro.ease_of_use}
			<div class="spec">
				<span class="spec-label mono-label">{$t('modals.distro.easeOfUse')}</span>
				<span class="spec-value">{distro.ease_of_use}/5</span>
			</div>
		{/if}

		{#if distro.userbase_number && translatedUserbaseSuffix}
			<div class="spec">
				<span class="spec-label mono-label">{$t('modals.distro.userbase')}</span>
				<span class="spec-value">{distro.userbase_number}{translatedUserbaseSuffix}</span>
			</div>
		{/if}

		{#if distro.secure_boot !== undefined}
			<div class="spec">
				<span class="spec-label mono-label">{$t('modals.distro.secureBoot')}</span>
				<span class="spec-value">{distro.secure_boot ? $t('modals.distro.yes') : $t('modals.distro.no')}</span>
			</div>
		{/if}

		{#if distro.swap_strategy}
			<div class="spec">
				<span class="spec-label mono-label">{$t('modals.distro.swapStrategy')}</span>
				<span class="spec-value">{translatedSwapStrategy}</span>
			</div>
		{/if}
	</div>

	{#if translatedTagNames.length > 0 || distroSeaUrl}
		<div class="tag-list">
			{#each translatedTagNames as { tagId, name } (tagId)}
				{@const tag = tagMap.get(tagId)}
				{#if tag}
					<span class="tag" style="--tag-color: var(--tag-{tagId})">
						{name}
					</span>
				{/if}
			{/each}

			{#if distroSeaUrl}
				<a
					class="distro-details__try"
					href={distroSeaUrl}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={`${$t('modals.distro.tryOnDistroSea')} (opens in a new tab)`}
				>
					{$t('modals.distro.tryOnDistroSea')}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
						<polyline points="15 3 21 3 21 9"></polyline>
						<line x1="10" y1="14" x2="21" y2="3"></line>
					</svg>
				</a>
			{/if}
		</div>
	{/if}

	<div class="distro-description">
		<p>{translatedDescription}</p>
	</div>
</div>

<style>
	.distro-details {
		display: flex;
		flex-direction: column;
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-bottom: var(--space-lg);
	}

	.tag {
		padding: var(--space-xs) var(--space-md);
		background: transparent;
		border: 1px solid transparent;
		box-shadow: inset 0 0 0 1px var(--tag-color);
		color: var(--tag-color);
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
	}

	.distro-details__try {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		padding: var(--space-xs) var(--space-md);
		background: var(--accent-soft);
		border-radius: var(--radius-full);
		box-shadow: inset 0 0 0 1px var(--accent);
		color: var(--accent-ink);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		text-decoration: none;
		transition: all var(--transition-normal);
	}

	@media (hover: hover) {
		.distro-details__try:hover {
			background: var(--accent);
			color: #fff;
		}
	}

	.specs {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin-bottom: var(--space-lg);
	}

	/* Label and value share one line so a long value wraps back to the start
	   of the row (under the label) instead of hanging in a value column. */
	.spec {
		line-height: var(--line-height-normal);
		overflow-wrap: anywhere;
	}

	.spec-label {
		color: var(--color-text-muted);
		margin-right: var(--space-xs);
	}

	.spec-value {
		color: var(--color-text);
		font-size: var(--text-base);
		line-height: var(--line-height-normal);
	}

	.distro-description p {
		color: var(--color-text-secondary);
		line-height: var(--line-height-relaxed);
		margin: 0;
		font-size: var(--text-base);
	}

	@media (max-width: 640px) {
		.tag,
		.distro-details__try {
			padding: var(--space-xs) var(--space-sm);
		}
	}
</style>
