<script lang="ts">
	import { onMount } from "svelte";
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import FilterGroup from "$lib/components/FilterGroup.svelte";
	import DistroTierSection from "$lib/components/DistroTierSection.svelte";
	// DistroModal is lazy-loaded on demand to reduce initial bundle size
	import ErrorDisplay from "$lib/components/ErrorDisplay.svelte";
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import LanguageToggle from "$lib/components/LanguageToggle.svelte";
	import BlogLink from "$lib/components/BlogLink.svelte";
	import MastheadTitle from "$lib/components/MastheadTitle.svelte";
	import JsonLd from "$lib/components/JsonLd.svelte";
	import CloseIcon from "$lib/components/icons/CloseIcon.svelte";
	import { dragScroll } from "$lib/actions/dragScroll";
	import { whenIdle } from "$lib/utils/warmup";

	import { loadDistros, getLikedDistros, logoPath } from "$lib/utils";
	import { fetchLikes } from "$lib/supabase";
	import { catalog } from "$lib/stores/state/catalog.svelte";
	import type { Tag } from "$lib/types";
	import { t, locale, localePath, appTitle } from "$lib/i18n/locale";
	import { humanizeId } from '$lib/i18n/translations';
	import { distros as allDistros } from "$lib/distros";
	import { SITE_URL as siteUrl } from "$lib/seo";
	import { TAGS, getTagGroups } from "$lib/tagGroups";

	let { data }: { data: PageData } = $props();

	// ItemList only: the `WebSite` site-name node lives in `+layout.svelte` and
	// is emitted on `/` alone, so the subdomain has exactly one site-name block
	// (Google ignores `WebSite` markup on subdirectories like `/be` anyway).
	let ldData = $derived({
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "ItemList",
				"numberOfItems": allDistros.length,
				"itemListElement": allDistros.map((d, i) => ({
					"@type": "ListItem",
					"position": i + 1,
					"item": {
						"@type": "SoftwareApplication",
						"name": d.name,
						"url": `${siteUrl}${localePath(`/distro/${d.id}`, $locale)}`,
						"image": `${siteUrl}${logoPath(d.logo)}`,
						"applicationCategory": "OperatingSystem",
						"operatingSystem": "Linux"
					}
				}))
			}
		]
	});

	let quickTestOpen = $state(false);
	let contactModalOpen = $state(false);
	let openGroup = $state<string | null>(null);

	// Tier sections: by default the first two ("Best", "Other good options") are
	// expanded, and the third is collapsed on a fresh visit. `expandedTiers` is
	// `null` until the visitor toggles a section; filters never change the
	// collapsed state — a collapsed section stays collapsed while filtering (its
	// count still updates, and it can be opened manually any time).
	let expandedTiers = $state<Set<string> | null>(null);

	// How many leading tiers count as "the first screen". On a laptop the two
	// open tiers are what fits above the fold (7 cards per row at ≥1280 px), so
	// their logos load at parse time; a phone only gets the first rows of tier 1,
	// and the collapsed third tier isn't fetched at all until it's opened. The
	// prerendered HTML can't know the viewport, so this is a fixed guess rather
	// than a measurement — hence the low fetch priority those logos get.
	const FIRST_SCREEN_TIERS = 2;

	function defaultExpandedTiers(): Set<string> {
		return new Set(['best', 'other']);
	}

	function isTierOpen(tier: string): boolean {
		if (expandedTiers) return expandedTiers.has(tier);
		return tier === 'best' || tier === 'other';
	}

	function toggleTier(tier: string) {
		const next = new Set(expandedTiers ?? defaultExpandedTiers());
		if (next.has(tier)) next.delete(tier);
		else next.add(tier);
		expandedTiers = next;
	}

	let groups = $derived.by(() => {
		const tagById = new Map(TAGS.map(tag => [tag.id, tag]));
		return getTagGroups()
			.map(group => ({
				id: group.id,
				tags: group.entryIds
					.map(tagId => tagById.get(tagId))
					.filter((tag): tag is Tag => tag !== undefined),
			}))
			.filter(group => group.tags.length > 0);
	});

	async function loadData() {
		catalog.clearError();

		try {
			const distrosResult = await loadDistros();

			if (distrosResult.error) {
				catalog.setError(distrosResult.error);
			} else {
				const loadedDistros = distrosResult.data || [];
				const userLikes = getLikedDistros();

				const distrosWithLikes = loadedDistros.map(distro => ({
					...distro,
					likes: 0,
					userLiked: userLikes.includes(distro.id)
				}));

				catalog.setDistros(distrosWithLikes);
			}
		} catch (err) {
			catalog.setError(
				err instanceof Error ? err.message : "Failed to load data",
			);
		}

	}

	// Likes are cosmetic, and fetching them pulls the ~170 KB Supabase client
	// onto the main thread (Google reports it as unused JS on first load).
	// Scheduling it after hydration/first idle keeps it off the critical path;
	// retry re-runs it so a failed first attempt still resolves.
	async function loadLikes() {
		try {
			const likesData = await fetchLikes();
			if (likesData.length > 0) {
				const likesMap = new Map(likesData.map(l => [l.id, l.likes]));
				// Update likes on the full distro list, not the filtered one —
				// writing back a filtered subset would permanently drop distros
				// from the catalog while filters are active (e.g. on remount).
				const updatedDistros = catalog.distros.map(distro => {
					const newLikes = likesMap.get(distro.id);
					return newLikes !== undefined && newLikes !== distro.likes
						? { ...distro, likes: newLikes }
						: distro;
				});
				catalog.setDistros(updatedDistros);
			}
		} catch (err) {
			console.error('Failed to fetch likes:', err);
		}
	}

	function scheduleLikes() {
		whenIdle(() => void loadLikes());
	}

	function retryData() {
		loadData();
		scheduleLikes();
	}

	function groupLabel(group: string): string {
		return $t(`tags.${group}.name`) || humanizeId(group);
	}

	onMount(() => {
		loadData();
		scheduleLikes();

		const onDocClick = (e: Event) => {
			const target = e.target as HTMLElement;
			if (target.closest && !target.closest('.filter-group')) {
				openGroup = null;
			}
		};
		document.addEventListener('click', onDocClick);

		return () => {
			document.removeEventListener('click', onDocClick);
		};
	});
</script>

{#if catalog.error}
	<ErrorDisplay
		title={$t('app.failedToLoad') ?? ''}
		message={catalog.error}
		retryable
		onretry={retryData}
	/>
{/if}

<div class="app page-shell" class:app-hidden={!!catalog.error}>
		<nav class="masthead masthead--titled" aria-label={$t('app.title')}>
			<div class="masthead-lead">
				<MastheadTitle title={$appTitle} />
			</div>
			<div class="masthead-controls">
				<BlogLink />
				<button
					class="btn-primary quiz-nav-btn"
					onclick={() => quickTestOpen = true}
					aria-label={$t('modals.quiz.title')}
					type="button"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
						<line x1="12" y1="17" x2="12.01" y2="17"></line>
					</svg>
					<span>{$t('modals.quiz.title')}</span>
				</button>
				<LanguageToggle />
				<ThemeToggle />
			</div>
		</nav>

		<p class="masthead-sub">{$t('app.description')}</p>

		<main>
		<section class="filters">
			<div class="filter-row">
				<div class="filter-groups" use:dragScroll>
					{#each groups as group (group.id)}
						<FilterGroup
							label={groupLabel(group.id)}
							tags={group.tags}
							selectedTags={catalog.selectedTags}
							open={openGroup === group.id}
							ontoggle={catalog.toggleTag}
							onopen={() => (openGroup = group.id)}
							onclose={() => (openGroup = null)}
						/>
					{/each}
				</div>
				{#if catalog.selectedTags.size > 0}
					<button class="clear-btn" onclick={() => { catalog.clearTags(); }} aria-label={$t('app.filters.clearAll')}>
						<CloseIcon size={16} />
						<span>{$t('app.filters.clearAll')}</span>
					</button>
				{/if}
			</div>
		</section>

		<div class="content">
			<section class="distros" id="distribution-details">
				{#if catalog.filteredDistros.length === 0}
					<div class="no-results" role="status" aria-live="polite">
						<p>{$t('app.noResults')}</p>
					</div>
				{/if}
				{#each catalog.allTieredDistros as group, i (group.tier)}
					<!-- The sections a laptop sees without scrolling load their logos
					     at parse time (see FIRST_SCREEN_TIERS); the rest load on
					     scroll. -->
					<DistroTierSection
						tier={group.tier}
						index={i + 1}
						title={$t(`app.tiers.${group.tier}.name`) || humanizeId(group.tier)}
						distros={group.distros}
						visibleIds={catalog.visibleDistroIds}
						onselect={catalog.selectDistro}
						open={isTierOpen(group.tier)}
						ontoggle={() => toggleTier(group.tier)}
						eager={i < FIRST_SCREEN_TIERS}
					/>
				{/each}
			</section>

		</div>
		</main>

		<footer class="site-footer">
			<button
				class="footer-contact mono-label"
				onclick={() => contactModalOpen = true}
				type="button"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
					<polyline points="22,6 12,13 2,6"></polyline>
				</svg>
				<span>{$t('modals.contact.title')}</span>
			</button>
			<a
				class="footer-link mono-label"
				href={`${base}${localePath('/blog/welcome-to-distro-picker', $locale)}`}
			>
				{$t('pages.blog.whyNotOtherDistros')}
			</a>
		</footer>

	{#if quickTestOpen}
		{#await import("$lib/components/modals/QuickTestModal.svelte") then { default: QuickTestModal }}
			<QuickTestModal onclose={() => quickTestOpen = false} />
		{/await}
	{/if}

	<!-- Rendered after the quiz modal on purpose: every modal shares
	     z-index 1000, so DOM order decides which one paints on top. A distro
	     popup opened from a quiz result must sit above the quiz. -->
	{#if catalog.selectedDistro}
		{#await import("$lib/components/modals/DistroModal.svelte") then { default: DistroModal }}
			<DistroModal
				distro={catalog.selectedDistro}
				tags={TAGS}
				screenshots={(data.screenshots[catalog.selectedDistro.id] || []).map(s => `${base}${s}`)}
				onclose={catalog.closeDistro}
			/>
		{/await}
	{/if}

	{#if contactModalOpen}
		{#await import("$lib/components/modals/ContactModal.svelte") then { default: ContactModal }}
			<ContactModal onclose={() => contactModalOpen = false} />
		{/await}
	{/if}
</div>

<JsonLd data={ldData} />

<style>
	/* Width, gutters and top inset come from the shared `.page-shell` frame —
	   keeping them identical to the blog/distro routes is what stops the
	   theme and language toggles from shifting on navigation. Only the extra
	   bottom breathing room is home-specific. */
	.app {
		padding-bottom: var(--space-2xl);
	}

	.app.app-hidden {
		display: none;
	}

	.filters {
		margin-bottom: var(--space-xl);
	}

	.site-footer {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: var(--space-lg);
		margin-top: var(--space-3xl);
		padding-top: var(--space-lg);
		border-top: 1px solid var(--line);
	}

	.footer-contact,
	.footer-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		background: none;
		border: none;
		padding: 0;
	}

	.footer-link {
		text-decoration: none;
	}

	@media (hover: hover) {
		.footer-contact:hover,
		.footer-link:hover {
			color: var(--color-text);
		}
	}

	/* Strip + reset share one row: the strip takes all leftover width and
	   scrolls, while the reset stays pinned outside the drag-scroll region.
	   The top inset comes from the shared `--content-top-pad` so the first
	   content lands at the same y as the blog post list. */
	.filter-row {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding-top: var(--content-top-pad);
	}

	.filter-groups {
		display: flex;
		flex-wrap: nowrap;
		flex: 1;
		min-width: 0;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		align-items: center;
		gap: var(--space-sm);
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.filter-groups::-webkit-scrollbar {
		display: none;
	}

	/* Ghost pill matching the filter-strip language: transparent fill with a
	   fractional-DPR-safe inset hairline (round corners alias with a real
	   border), inverting to the secondary pill on hover. */
	.clear-btn {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		height: 34px;
		padding: 0 var(--space-md);
		border: 1px solid transparent;
		box-shadow: inset 0 0 0 1px var(--line-strong);
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		white-space: nowrap;
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	@media (hover: hover) {
		.clear-btn:hover {
			background: var(--color-secondary);
			box-shadow: inset 0 0 0 1px var(--color-secondary);
			color: var(--color-background);
		}
	}

	.content {
		margin-bottom: var(--space-3xl);
	}

	.no-results {
		text-align: center;
		padding: var(--space-3xl);
		color: var(--color-text-secondary);
		grid-column: 1 / -1;
	}

	.no-results p {
		margin: var(--space-sm) 0;
		font-size: var(--text-lg);
		line-height: var(--line-height-normal);
	}

	/* Quiz CTA in the top bar — compact primary pill, sized to match the
	   44px toggle controls next to it. */
	.quiz-nav-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		height: 44px;
		padding: 0 var(--space-md);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 500;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	@media (max-width: 640px) {
		.app {
			padding-bottom: var(--space-xl);
		}

		.filter-groups {
			gap: var(--space-sm);
		}

		.filters {
			margin-bottom: var(--space-xl);
		}
	}

	@media (max-width: 480px) {
		/* Icon-only circle on phones so the label never steals strip room. */
		.clear-btn span {
			display: none;
		}

		.clear-btn {
			width: 34px;
			padding: 0;
		}
	}
</style>
