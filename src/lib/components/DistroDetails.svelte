<script lang="ts">
	import type { Distro, Tag } from "$lib/types";
	import { t, locale } from "$lib/i18n/locale";
	import { getNestedValue } from "$lib/i18n/translations";

	let {
		distro,
		tags = [],
	}: {
		distro: Distro;
		tags?: Tag[];
	} = $props();

	let translatedDescription = $derived($t(`distros.${distro.id}.description`) as string);
	let translatedUserbaseSuffix = $derived($t(`distros.${distro.id}.userbasePostfix`) as string | undefined);
	let translatedBasedOn = $derived(distro.based_on === 'independent' ? $t('modals.distro.independent') : distro.based_on);

	let tagMap = $derived(new Map(tags.map(tag => [tag.id, tag])));

	let translatedTagNames = $derived(distro.tag_ids?.map((tagId) => {
		const tag = tagMap.get(tagId);
		return {
			tagId,
			name: tag ? $t(`tags.${tagId}.name`) : '',
		};
	}) || []);

	let hasAdditionalDetails = $derived(
		(distro.desktops && distro.desktops.length > 0) ||
		distro.based_on ||
		distro.beginner_friendly ||
		(distro.userbase_number && translatedUserbaseSuffix) ||
		distro.secure_boot !== undefined ||
		distro.swap_strategy
	);

	let translatedSwapStrategy = $derived(
		distro.swap_strategy ? $t(`modals.distro.swap.${distro.swap_strategy}`) as string : ''
	);

	let translatedHighlights = $derived(getNestedValue<string[]>($locale, `distros.${distro.id}.highlights`));
</script>

<div class="distro-details">
	<div class="distro-description">
		<p>{translatedDescription}</p>
	</div>

	{#if hasAdditionalDetails}
		<div class="additional-details">
			{#if translatedBasedOn}
				<div class="additional-detail">
					<h3>{$t('modals.distro.basedOn')}</h3>
					<p>{translatedBasedOn}</p>
				</div>
			{/if}

			{#if distro.desktops && distro.desktops.length > 0}
				<div class="additional-detail">
					{#if distro.desktops.length === 1}
						<h3>{$t('modals.distro.desktop')}</h3>
					{:else}
						<h3>{$t('modals.distro.desktops')}</h3>
					{/if}
					<p>
						{distro.desktops.join(", ")}{#if distro.hasMoreDesktops}{$t('modals.distro.andMore')}{/if}
					</p>
				</div>
			{/if}

			{#if distro.beginner_friendly}
				<div class="additional-detail">
					<h3>{$t('modals.distro.beginnerFriendly')}</h3>
					<p>{distro.beginner_friendly}/5</p>
				</div>
			{/if}

			{#if distro.userbase_number && translatedUserbaseSuffix}
				<div class="additional-detail">
					<h3>{$t('modals.distro.userbase')}</h3>
					<p>{distro.userbase_number}{translatedUserbaseSuffix}</p>
				</div>
			{/if}

			{#if distro.secure_boot !== undefined}
				<div class="additional-detail">
					<h3>{$t('modals.distro.secureBoot')}</h3>
					<p>{distro.secure_boot ? $t('modals.distro.yes') : $t('modals.distro.no')}</p>
				</div>
			{/if}

			{#if distro.swap_strategy}
				<div class="additional-detail">
					<h3>{$t('modals.distro.swapStrategy')}</h3>
					<p>{translatedSwapStrategy}</p>
				</div>
			{/if}
		</div>
	{/if}

	{#if translatedHighlights && translatedHighlights.length > 0}
		<div class="highlights">
			<h3 class="highlights-title">{$t('pages.distro.features')}</h3>
			{#each translatedHighlights as highlight}
				<p class="highlight-item">✦ {highlight}</p>
			{/each}
		</div>
	{/if}

	{#if distro.tag_ids && distro.tag_ids.length > 0}
		<div class="distro-tags">
			<div class="tag-list">
				{#each translatedTagNames as { tagId, name }}
					{@const tag = tagMap.get(tagId)}
					{#if tag}
						<span class="tag" style="--tag-color: var(--tag-{tagId})">
							{name}
						</span>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.distro-description p {
		color: var(--color-text-secondary);
		line-height: var(--line-height-relaxed);
		margin: 0;
		font-size: var(--text-base);
	}

	.additional-details {
		margin-top: var(--space-xl);
	}

	.additional-detail {
		margin-top: var(--space-sm);
	}

	.additional-detail h3 {
		display: inline;
		color: var(--color-secondary);
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		margin: 0;
	}

	.additional-detail p {
		display: inline;
		color: var(--color-text-secondary);
		font-size: var(--text-base);
		margin: 0;
	}

	.highlights {
		margin-top: var(--space-xl);
	}

	.highlights-title {
		color: var(--color-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		text-transform: uppercase;
		letter-spacing: 0.03em;
		margin: 0 0 var(--space-sm);
	}

	.highlight-item {
		color: var(--color-text-secondary);
		font-size: var(--text-base);
		line-height: var(--line-height-relaxed);
		margin: 0;
	}

	.distro-tags {
		margin-top: var(--space-xl);
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.tag {
		padding: var(--space-xs) var(--space-md);
		background: var(--tag-color);
		color: var(--color-background);
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
	}

	@media (max-width: 640px) {
		.additional-details {
			margin-top: var(--space-lg);
		}

		.highlights {
			margin-top: var(--space-lg);
		}

		.distro-tags {
			margin-top: var(--space-lg);
		}

		.tag {
			padding: 0.125rem var(--space-sm);
			font-size: var(--text-base);
		}
	}
</style>