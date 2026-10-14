<script lang="ts">
	import { onMount } from "svelte";
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import FilterGroup from "$lib/components/FilterGroup.svelte";
	import DistroTierSection from "$lib/components/DistroTierSection.svelte";
	import DistroModal from "$lib/components/modals/DistroModal.svelte";
	import ErrorDisplay from "$lib/components/ErrorDisplay.svelte";
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import LanguageToggle from "$lib/components/LanguageToggle.svelte";
	import BlogLink from "$lib/components/BlogLink.svelte";
	import { dragScroll } from "$lib/actions/dragScroll";

	import { loadDistros, getLikedDistros } from "$lib/utils";
	import { fetchLikes } from "$lib/supabase";
	import {
		tags,
		error,
		selectedTags,
		selectedDistro,
		distros,
		filteredDistros,
		allTieredDistros,
		visibleDistroIds,
		tagActions,
		distroActions,
		dataActions,
	} from "$lib/stores";
	import type { Distro, Tag } from "$lib/types";
	import { t, locale, localePath } from "$lib/i18n/locale";
	import { humanizeId } from '$lib/i18n/translations';
	import distrosData from "$lib/distros.json";
	import { distros as distrosList } from "$lib/distros";
	import { SITE_URL as siteUrl } from "$lib/seo";
	import { getTagGroups, TAGS } from "$lib/tagGroups";

	dataActions.setTags(TAGS);
	dataActions.setDistros(distrosList.map(d => ({ ...d, likes: 0, userLiked: false })));

	let { data }: { data: PageData } = $props();

	// The JSON-LD description must match the meta description, otherwise Google
	// sees structured data that contradicts the page. `seo.home.description` is
	// the same string the layout renders into <meta name="description">; fall
	// back to the shorter `app.description` if a locale is ever missing it.
	let ldDescription = $derived(
		(data.seo?.description as string | undefined) ||
			$t('app.description') ||
			'Linux distro picker'
	);

	// Alternate site names, in order of preference, for Google's site-name
	// system. It falls back to the hosting platform's name ("Vercel") for a
	// `*.vercel.app` subdomain when it isn't confident about the subdomain's
	// own name; offering a concise brand form plus the host itself (which must
	// be all lowercase) gives it a backup that isn't the platform name. Derived
	// from SITE_URL so it stays correct if the domain ever changes.
	let alternateSiteNames = $derived(['Distro Picker', new URL(siteUrl).host.toLowerCase()]);

	// Structured data is derived (not module-level) so it is rendered in the
	// page's language — `/be` gets Belarusian names and `/be`-prefixed URLs.
	let ldJson = $derived(
		JSON.stringify(
			{
				"@context": "https://schema.org",
				"@graph": [
					{
						"@type": "WebSite",
						"url": `${siteUrl}${localePath('/', $locale)}`,
						"name": $t('app.title') || 'Linux Distro Picker',
						"alternateName": alternateSiteNames,
						"description": ldDescription,
						"inLanguage": $locale
					},
					{
						"@type": "ItemList",
						"numberOfItems": distrosData.distros.length,
						"itemListElement": distrosData.distros.map((d, i) => ({
							"@type": "ListItem",
							"position": i + 1,
							"item": {
								"@type": "SoftwareApplication",
								"name": d.name,
								"url": `${siteUrl}${localePath(`/distro/${d.id}`, $locale)}`,
								"image": `${siteUrl}${d.logo || '/linux.webp'}`,
								"applicationCategory": "OperatingSystem",
								"operatingSystem": "Linux"
							}
						}))
					}
				]
			},
			null,
			2
		)
	);

	let quickTestOpen = $state(false);
	let shareModalOpen = $state(false);
	let contactModalOpen = $state(false);
	let openGroup = $state<string | null>(null);

	// Tier sections: by default the first two ("Best", "Other good options") are
	// expanded, and the third is collapsed on a fresh visit. `expandedTiers` is
	// `null` until the visitor toggles a section; filters never change the
	// collapsed state — a collapsed section stays collapsed while filtering (its
	// count still updates, and it can be opened manually any time).
	let expandedTiers = $state<Set<string> | null>(null);

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
		const tagById = new Map($tags.map(tag => [tag.id, tag]));
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
		dataActions.clearError();

		try {
			const distrosResult = await loadDistros();

			if (distrosResult.error) {
				dataActions.setError(distrosResult.error);
			} else {
				const loadedDistros = distrosResult.data || [];
				const userLikes = getLikedDistros();

				const distrosWithLikes = loadedDistros.map(distro => ({
					...distro,
					likes: 0,
					userLiked: userLikes.includes(distro.id)
				}));

				dataActions.setDistros(distrosWithLikes);
			}
		} catch (err) {
			dataActions.setError(
				err instanceof Error ? err.message : "Failed to load data",
			);
		}

		try {
			const likesData = await fetchLikes();
			if (likesData.length > 0) {
				const likesMap = new Map(likesData.map(l => [l.id, l.likes]));
				// Update likes on the full distro list, not the filtered one —
				// writing back a filtered subset would permanently drop distros
				// from the store while filters are active (e.g. on remount).
				const updatedDistros = $distros.map(distro => {
					const newLikes = likesMap.get(distro.id);
					return newLikes !== undefined && newLikes !== distro.likes
						? { ...distro, likes: newLikes }
						: distro;
				});
				dataActions.setDistros(updatedDistros);
			}
		} catch (err) {
			console.error('Failed to fetch likes:', err);
		}
	}

	function toggleTag(tagId: string) {
		tagActions.toggle(tagId);
	}

	function groupLabel(group: string): string {
		return $t(`tags.${group}.name`) || humanizeId(group);
	}

	function selectDistro(distro: Distro) {
		distroActions.select(distro);
	}

	function closePanel() {
		distroActions.clear();
	}

	onMount(() => {
		loadData();
		const timer = setTimeout(() => {
			shareModalOpen = true;
		}, 60_000);

		const onDocClick = (e: Event) => {
			const target = e.target as HTMLElement;
			if (target.closest && !target.closest('.filter-group')) {
				openGroup = null;
			}
		};
		document.addEventListener('click', onDocClick);

		return () => {
			clearTimeout(timer);
			document.removeEventListener('click', onDocClick);
		};
	});
</script>

{#if $error}
	<ErrorDisplay
		title={$t('app.failedToLoad') ?? ''}
		message={$error}
		retryable
		onretry={loadData}
	/>
{/if}

<div class="app" class:app-hidden={!!$error}>
		<nav class="site-nav" aria-label={$t('app.title')}>
			<BlogLink variant="desktop" />
			<div class="site-nav-controls">
				<BlogLink variant="mobile" />
				<button
					class="contact-link btn-toggle"
					onclick={() => contactModalOpen = true}
					aria-label={$t('modals.contact.title')}
					type="button"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
						<polyline points="22,6 12,13 2,6"></polyline>
					</svg>
				</button>
				<LanguageToggle />
				<ThemeToggle />
			</div>
		</nav>

		<header class="header">
			<div class="header-title-group">
				<h1>{$t('app.title')}</h1>
				<h2 class="header-description">{$t('app.description')}</h2>
			</div>
		</header>

		<main>
		<section class="filters">
			<div class="filter-groups" use:dragScroll>
				{#each groups as group (group.id)}
					<FilterGroup
						label={groupLabel(group.id)}
						tags={group.tags}
						selectedTags={$selectedTags}
						open={openGroup === group.id}
						ontoggle={toggleTag}
						onopen={() => (openGroup = group.id)}
						onclose={() => (openGroup = null)}
					/>
				{/each}
				{#if $selectedTags.size > 0}
					<button class="clear-btn" onclick={() => { tagActions.clear(); }} aria-label={$t('app.filters.clearAll')}>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				{/if}
			</div>
		</section>

		<div class="content">
			<section class="distros" id="distribution-details">
				{#if $filteredDistros.length === 0}
					<div class="no-results" role="status" aria-live="polite">
						<p>{$t('app.noResults')}</p>
					</div>
				{/if}
				{#each $allTieredDistros as group, i (group.tier)}
					<DistroTierSection
						tier={group.tier}
						index={i + 1}
						title={$t(`app.tiers.${group.tier}.name`) || humanizeId(group.tier)}
						distros={group.distros}
						visibleIds={$visibleDistroIds}
						selectedDistro={$selectedDistro}
						onselect={(d) => selectDistro(d)}
						open={isTierOpen(group.tier)}
						ontoggle={() => toggleTier(group.tier)}
					/>
				{/each}
			</section>

		</div>
		</main>

		<footer class="site-footer">
			<div class="site-footer-brand">{$t('app.title')}</div>
			<nav class="site-footer-links mono-label">
				<a href={`${base}${localePath('/blog', $locale)}`}>{$t('pages.blog.navLabel')}</a>
				<span class="site-footer-year">© {new Date().getFullYear()}</span>
			</nav>
		</footer>

	{#if quickTestOpen}
		{#await import("$lib/components/modals/QuickTestModal.svelte") then { default: QuickTestModal }}
			<QuickTestModal onclose={() => quickTestOpen = false} />
		{/await}
	{/if}

	<!-- Rendered after the quiz modal on purpose: every modal shares
	     z-index 1000, so DOM order decides which one paints on top. A distro
	     popup opened from a quiz result must sit above the quiz. -->
	{#if $selectedDistro}
		<DistroModal
			distro={$selectedDistro}
			tags={$tags}
			screenshots={(data.screenshots[$selectedDistro.id] || []).map(s => `${base}${s}`)}
			onclose={closePanel}
		/>
	{/if}

	{#if shareModalOpen}
		{#await import("$lib/components/modals/ShareModal.svelte") then { default: ShareModal }}
			<ShareModal onclose={() => shareModalOpen = false} />
		{/await}
	{/if}

	{#if contactModalOpen}
		{#await import("$lib/components/modals/ContactModal.svelte") then { default: ContactModal }}
			<ContactModal onclose={() => contactModalOpen = false} />
		{/await}
	{/if}

		<button
			class="btn-primary quick-test-btn"
			onclick={() => quickTestOpen = true}
			aria-label={$t('modals.quiz.title')}
			type="button"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
				<line x1="12" y1="17" x2="12.01" y2="17"></line>
			</svg>
			<span>{$t('modals.quiz.title')}</span>
		</button>
</div>

<svelte:head>
	{@html `<script type="application/ld+json">${ldJson}</script>`}
</svelte:head>

<style>
	.app {
		max-width: var(--container-2xl);
		margin: 0 auto;
		padding: 0 var(--space-xl) var(--space-2xl);
	}

	.app.app-hidden {
		display: none;
	}

	/* ---- top nav ---- */
	.site-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		padding: var(--space-lg) 0 var(--space-md);
		border-bottom: 1px solid var(--line);
		margin-bottom: var(--space-3xl);
	}

	.site-nav-controls {
		display: flex;
		gap: var(--space-sm);
		margin-left: auto;
	}

	/* ---- hero ---- */
	.header {
		margin: 0 0 var(--space-2xl);
	}

	.header-title-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		max-width: 62rem;
	}

	.header h1 {
		font-size: clamp(2.5rem, 6.5vw, 5rem);
		font-weight: var(--font-semibold);
		letter-spacing: -0.035em;
		line-height: 1.02;
		color: var(--color-text);
		margin: 0;
		text-wrap: balance;
	}

	.header-description {
		font-size: clamp(var(--text-lg), 2vw, 1.5rem);
		font-weight: var(--font-normal);
		color: var(--color-text-secondary);
		max-width: 44rem;
		line-height: 1.45;
		letter-spacing: -0.01em;
		margin: 0;
	}

	.filters {
		margin-bottom: var(--space-xl);
	}

	.site-footer {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-md);
		flex-wrap: wrap;
		margin-top: var(--space-3xl);
		padding-top: var(--space-lg);
		border-top: 1px solid var(--line);
	}

	.site-footer-brand {
		font-family: var(--font-serif);
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		line-height: 1;
		letter-spacing: -0.01em;
		color: var(--color-text);
	}

	.site-footer-links {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
	}

	.site-footer-links a {
		text-decoration: none;
		color: var(--color-text-muted);
		transition: color var(--transition-normal);
	}

	@media (hover: hover) {
		.site-footer-links a:hover {
			color: var(--color-text);
		}
	}

	.filter-groups {
		display: flex;
		flex-wrap: nowrap;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		align-items: center;
		gap: var(--space-sm);
		padding-top: var(--space-md);
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.filter-groups::-webkit-scrollbar {
		display: none;
	}

	.clear-btn {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-md);
		background: var(--color-background);
		color: var(--color-text);
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	@media (hover: hover) {
		.clear-btn:hover {
			background: var(--color-secondary);
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

	.quick-test-btn {
		position: fixed;
		bottom: var(--space-xl);
		right: var(--space-xl);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-lg);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 500;
		letter-spacing: 0.02em;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		z-index: 100;
	}

	.quick-test-btn:active {
		transform: translateY(0);
	}

	@media (max-width: 640px) {
		.app {
			padding: 0 var(--space-lg) var(--space-xl);
		}

		.site-nav {
			padding-top: var(--space-md);
			margin-bottom: var(--space-xl);
		}

		.header {
			margin-bottom: var(--space-xl);
		}

		.header h1 {
			font-size: clamp(2rem, 9vw, 2.75rem);
		}

		.filter-groups {
			gap: var(--space-sm);
			padding-top: var(--space-sm);
		}

		.filters {
			margin-bottom: var(--space-xl);
		}

		.quick-test-btn {
			bottom: var(--space-lg);
			right: var(--space-lg);
			padding: var(--space-sm) var(--space-md);
		}
	}
</style>
