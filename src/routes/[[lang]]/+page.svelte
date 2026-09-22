<script lang="ts">
	import { onMount } from "svelte";
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import FilterGroup from "$lib/components/FilterGroup.svelte";
	import DistroGrid from "$lib/components/DistroGrid.svelte";
	import DistroModal from "$lib/components/modals/DistroModal.svelte";
	import ErrorDisplay from "$lib/components/ErrorDisplay.svelte";
	import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import LanguageToggle from "$lib/components/LanguageToggle.svelte";

	import { loadDistros, getLikedDistros } from "$lib/utils";
	import { fetchLikes } from "$lib/supabase";
	import {
		tags,
		loading,
		error,
		selectedTags,
		selectedDistro,
		filteredDistros,
		showBestOnly,
		tagActions,
		distroActions,
		dataActions,
	} from "$lib/stores";
	import type { Distro, Tag } from "$lib/types";
	import { t, locale, localePath } from "$lib/i18n/locale";
	import { humanizeId } from '$lib/i18n/translations';
	import distrosData from "$lib/distros.json";
	import { SITE_URL as siteUrl, SEO_KEYWORDS } from "$lib/seo";
	import { getTagGroups, TAGS } from "$lib/tagGroups";

	dataActions.setTags(TAGS);
	dataActions.setDistros(distrosData.distros.map(d => ({ ...d, likes: 0, userLiked: false })));

	const seoKeywords = SEO_KEYWORDS;

	let { data }: { data: PageData } = $props();

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
						"description": $t('app.description') || 'A distro chooser for beginners with a quiz',
						"keywords": seoKeywords,
						"inLanguage": $locale
					},
					{
						"@type": "ItemList",
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

	let infoModalOpen = $state(false);
	let quickTestOpen = $state(false);
	let shareModalOpen = $state(false);
	let contactModalOpen = $state(false);
	let openGroup = $state<string | null>(null);

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
		dataActions.setLoading(true);
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
		} finally {
			dataActions.setLoading(false);
		}

		try {
			const likesData = await fetchLikes();
			if (likesData.length > 0) {
				const likesMap = new Map(likesData.map(l => [l.id, l.likes]));
				const updatedDistros = $filteredDistros.map(distro => {
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

{#if $loading}
	<LoadingSpinner message={$t('app.loading')} size="large" />
{:else if $error}
	<ErrorDisplay
		title={$t('app.failedToLoad')}
		message={$error}
		retryable
		onretry={loadData}
	/>
{/if}

<div class="app" class:app-hidden={$loading || !!$error}>
		<header class="header">
			<div class="header-title-group">
				<h1>{$t('app.title')}</h1>
				<h2 class="header-description">{$t('app.description')}</h2>
			</div>
			<div class="header-controls">
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
		</header>

		<main>
		<section class="filters" aria-labelledby="filters-heading">
			<h2 id="filters-heading">
				<span class="heading-text">{$t('app.filters.title')}</span>
				{#if $selectedTags.size > 0}
					<button class="clear-btn" onclick={() => { tagActions.clear(); }} aria-label={$t('app.filters.clearAll')}>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				{/if}
				<button 
					class="info-btn" 
					onclick={() => infoModalOpen = true}
					aria-label={$t('modals.additionalInfo.title')}
					type="button"
				>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10"/>
					<text x="12" y="17" text-anchor="middle" font-size="14" font-family="sans-serif" font-weight="bold" fill="currentColor" stroke="none" dy="1">i</text>
				</svg>
				</button>
			</h2>
			<div class="filter-groups">
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
			</div>
		</section>

		<div class="content">
			<section class="distros" id="distribution-details" aria-labelledby="distros-heading">
				<h2 id="distros-heading">
					<span class="heading-text">{$t('app.distroGridTitle')} ({$filteredDistros.length})</span>
					<label class="toggle-label">
						<span class="toggle-text">{$t('app.filters.bestOnly')}</span>
						<input type="checkbox" class="toggle-input" bind:checked={$showBestOnly} />
						<span class="toggle-switch"></span>
					</label>
				</h2>
				{#if $filteredDistros.length === 0}
					<div class="no-results" role="status" aria-live="polite">
						<p>{$t('app.noResults')}</p>
					</div>
				{:else}
					<DistroGrid
						distros={$filteredDistros}
						selectedDistro={$selectedDistro}
						onselect={(d) => selectDistro(d)}
					/>
				{/if}
			</section>

		</div>
		</main>

		<div class="sr-only">
			<p>Linux Distro Chooser - Find Your Perfect Linux Distribution. Distro chooser, distrochooser, choose a distro</p>
			<p>Distro picker tool to choose a distro based on your needs. Browse and filter popular Linux distributions including Linux Mint, Kubuntu, Zorin OS, Pop!_OS, Fedora, EndeavourOS, CachyOS, SteamOS, Bazzite, Nobara, PikaOS, Lubuntu, AntiX, Ubuntu, Debian, Arch Linux, openSUSE, NixOS, Gentoo, Void, Slackware, MX Linux, Omarchy, Manjaro, elementaryOS, Solus, and more. Use our interactive Linux distribution chooser to discover the best distro for beginners, power users, developers, gamers, and professionals. Try our distro finder to match your use case whether you need a beginner-friendly Linux OS, a rolling release distribution, an immutable distro, or a server-oriented Linux system.</p>
			<p>Linux, distro chooser, distro picker, choose a distro, find a distro, Linux distribution picker, best Linux distro, Linux distro for beginners, Linux distribution finder, interactive distro chooser, Linux OS chooser, which Linux distro, pick a Linux distro, Linux distro recommendation, distro selection tool, Linux distro quiz.</p>
		</div>

		<footer>
		</footer>

	{#if $selectedDistro}
		<DistroModal
			distro={$selectedDistro}
			tags={$tags}
			screenshots={(data.screenshots[$selectedDistro.id] || []).map(s => `${base}${s}`)}
			onclose={closePanel}
		/>
	{/if}

	{#if infoModalOpen}
		{#await import("$lib/components/modals/InfoModal.svelte") then { default: InfoModal }}
			<InfoModal onclose={() => infoModalOpen = false} />
		{/await}
	{/if}

	{#if quickTestOpen}
		{#await import("$lib/components/modals/QuickTestModal.svelte") then { default: QuickTestModal }}
			<QuickTestModal onclose={() => quickTestOpen = false} />
		{/await}
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
		padding: var(--space-xl);
	}

	.app.app-hidden {
		display: none;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: var(--space-lg) auto var(--space-3xl);
	}

	.header-title-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}

	.header h1 {
		text-align: center;
		font-size: var(--text-4xl);
		color: var(--color-secondary);
		font-weight: var(--font-bold);
		line-height: var(--line-height-tight);
		margin-bottom: var(--space-xs);
	}

	.header-description {
		text-align: center;
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-width: 32rem;
		line-height: var(--line-height-normal);
	}

	.header-controls {
		display: flex;
		gap: var(--space-sm);
	}

	:global(.btn-toggle) {
		height: 44px;

		&.theme-toggle,
		&.contact-link {
			width: 44px;
		}

		@media (hover: hover) {
			&:hover {
				transform: translateY(-2px);
			}
		}

		&:active {
			transform: translateY(0);
		}
	}

	.filters {
		margin-bottom: var(--space-2xl);
	}

	.filters h2 {
		font-size: var(--text-2xl);
		color: var(--color-secondary);
		font-weight: var(--font-semibold);
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.filters h2 .heading-text {
		flex: 0 1 auto;
	}

	footer {
		margin-bottom: var(--space-2xl);
	}

	.filter-groups {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-sm);
		padding-top: var(--space-md);
	}

	.clear-btn {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		border-radius: var(--radius-full);
		background: var(--color-secondary);
		color: var(--color-background);
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	@media (hover: hover) {
		.clear-btn:hover {
			transform: scale(1.1);
			box-shadow: var(--shadow-lg);
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

	.distros h2 {
		font-size: var(--text-2xl);
		color: var(--color-secondary);
		font-weight: var(--font-semibold);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.heading-text {
		flex: 1;
	}

	.info-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: auto;
		width: 32px;
		height: 32px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-normal);
		flex-shrink: 0;
	}

	@media (hover: hover) {
		.info-btn:hover {
			border-color: var(--color-secondary);
			color: var(--color-secondary);
		}
	}

	.quick-test-btn {
		position: fixed;
		bottom: var(--space-xl);
		right: var(--space-xl);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		border-radius: var(--radius-full);
		box-shadow: var(--shadow-lg);
		z-index: 100;
	}

	.quick-test-btn:active {
		transform: translateY(0);
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		cursor: pointer;
		flex-shrink: 0;
	}

	.toggle-text {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.toggle-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-switch {
		display: inline-block;
		position: relative;
		width: 36px;
		height: 20px;
		background: var(--color-border);
		border-radius: var(--radius-full);
		transition: background var(--transition-normal);
	}

	.toggle-switch::after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		background: var(--color-surface);
		border-radius: 50%;
		transition: transform var(--transition-normal);
	}

	.toggle-input:checked + .toggle-switch {
		background: var(--color-best);
	}

	.toggle-input:checked + .toggle-switch::after {
		transform: translateX(16px);
	}

	#distros-heading {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	@media (max-width: 640px) {
		.app {
			padding: var(--space-lg);
		}

		.header {
			margin: var(--space-md) 0 var(--space-xl);
			flex-direction: column;
			gap: var(--space-lg);
			padding: 0;
		}

		.header h1 {
			font-size: var(--text-3xl);
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
