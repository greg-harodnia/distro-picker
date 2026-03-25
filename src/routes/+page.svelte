<script lang="ts">
	import { onMount } from "svelte";
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import TagFilter from "$lib/components/TagFilter.svelte";
	import DistroGrid from "$lib/components/DistroGrid.svelte";
	import DistroPanel from "$lib/components/DistroPanel.svelte";
	import ErrorDisplay from "$lib/components/ErrorDisplay.svelte";
	import LoadingSpinner from "$lib/components/LoadingSpinner.svelte";
	import ThemeToggle from "$lib/components/ThemeToggle.svelte";
	import LanguageToggle from "$lib/components/LanguageToggle.svelte";
	import InfoModal from "$lib/components/InfoModal.svelte";
	import QuickTestModal from "$lib/components/QuickTestModal.svelte";
	import { loadTags, loadDistros, getLikedDistros } from "$lib/utils";
	import { fetchLikes } from "$lib/supabase";
	import {
		tags,
		loading,
		error,
		selectedTags,
		selectedDistro,
		filteredDistros,
		tagActions,
		distroActions,
		dataActions,
	} from "$lib/stores";
	import type { Distro } from "$lib/types";
	import { t } from "$lib/i18n/locale";

	let { data }: { data: PageData } = $props();

	let infoModalOpen = $state(false);
	let quickTestOpen = $state(false);

	async function loadData() {
		dataActions.setLoading(true);
		dataActions.clearError();

		try {
			const [tagsResult, distrosResult] = await Promise.all([
				loadTags(),
				loadDistros(),
			]);

			if (tagsResult.error) {
				dataActions.setError(tagsResult.error);
			} else if (distrosResult.error) {
				dataActions.setError(distrosResult.error);
			} else {
				const loadedDistros = distrosResult.data || [];
				const userLikes = getLikedDistros();

				const distrosWithLikes = loadedDistros.map(distro => ({
					...distro,
					likes: 0,
					userLiked: userLikes.includes(distro.id)
				}));

				dataActions.setTags(tagsResult.data || []);
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
				const likesMap = new Map(likesData.map(l => [l.name, l.likes]));
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

	function selectDistro(distro: Distro) {
		distroActions.select(distro);
		if (window.innerWidth < 1024) {
			setTimeout(() => {
				document.querySelector('.distro-panel')?.scrollIntoView({ behavior: 'smooth' });
			}, 0);
		}
	}

	function closePanel() {
		distroActions.clear();
	}

	onMount(() => {
		loadData();
	});
</script>

{#if $loading}
	<LoadingSpinner message={$t('app.loadingDistributions')} size="large" />
{:else if $error}
	<ErrorDisplay
		title={$t('app.failedToLoad')}
		message={$error}
		retryable
		onretry={loadData}
	/>
{:else}
	<div class="app">
		<header class="header">
			<h1>{$t('app.title')}</h1>
			<div class="header-controls">
				<LanguageToggle />
				<ThemeToggle />
			</div>
		</header>

		<main>
		<section class="filters" aria-labelledby="filters-heading">
			<h2 id="filters-heading">{$t('filters.title')}</h2>
			<div class="tag-list-wrapper">
				<div class="tag-list" role="group" aria-label="Filter options">
				{#each $tags as tag, i (tag.id)}
					{#if i > 0 && tag.group !== $tags[i - 1].group}
						<span class="tag-separator" aria-hidden="true"></span>
					{/if}
					<TagFilter
						{tag}
						selected={$selectedTags.has(tag.id)}
						ontoggle={() => toggleTag(tag.id)}
					/>
				{/each}
				{#if $selectedTags.size > 0}
					<button class="clear-btn" onclick={() => { tagActions.clear(); }} aria-label={$t('filters.clearAll')}>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				{/if}
			</div>
		</div>
		</section>

		<div class="content">
			<section class="distros" id="distribution-details" aria-labelledby="distros-heading">
				<h2 id="distros-heading">
					<span class="heading-text">{$t('distros.recommended')} ({$filteredDistros.length})</span>
					<button 
						class="info-btn" 
						onclick={() => infoModalOpen = true}
						aria-label={$t('distros.info')}
						type="button"
					>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="12" cy="12" r="10"/>
						<text x="12" y="17" text-anchor="middle" font-size="14" font-family="sans-serif" font-weight="bold" fill="currentColor" stroke="none" dy="1">i</text>
					</svg>
					</button>
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

			{#if $selectedDistro}
				<section class="distros" aria-labelledby="details-heading">
					<h2 id="details-heading">{$t('distros.details')}</h2>
					<DistroPanel
						distro={$selectedDistro}
						tags={$tags}
						screenshots={(data.screenshots[$selectedDistro.id] || []).map(s => `${base}${s}`)}
						onclose={closePanel}
					/>
				</section>
			{/if}
		</div>
		</main>

		<div class="sr-only">
			<p>Linux distro chooser - find your perfect Linux distribution. Distro picker tool to choose a distro based on your needs. Browse and filter popular Linux distributions including Ubuntu, Fedora, Debian, Arch Linux, Linux Mint, Pop!_OS, Zorin OS, Elementary OS, Manjaro, openSUSE, and more. Use our interactive Linux distribution chooser to discover the best distro for beginners, power users, developers, gamers, and professionals. Try our distro finder to match your use case whether you need a beginner-friendly Linux OS, a rolling release distribution, an immutable distro, or a server-oriented Linux system.</p>
			<p>Linux, distro chooser, distro picker, choose a distro, find a distro, Linux distribution picker, best Linux distro, Linux distro for beginners, Linux distribution finder, interactive distro chooser, Linux OS chooser, which Linux distro, pick a Linux distro, Linux distro recommendation, distro selection tool, Linux distro quiz.</p>
		</div>

		<footer>
		</footer>

	{#if infoModalOpen}
		<InfoModal onclose={() => infoModalOpen = false} />
	{/if}

	{#if quickTestOpen}
		<QuickTestModal onclose={() => quickTestOpen = false} />
	{/if}

		<button
			class="quick-test-btn"
			onclick={() => quickTestOpen = true}
			aria-label={$t('app.startQuiz')}
			type="button"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
				<line x1="12" y1="17" x2="12.01" y2="17"></line>
			</svg>
			<span>{$t('app.quickQuiz')}</span>
		</button>
	</div>
{/if}

<svelte:head>
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "Linux Distribution Picker",
			"description": "Interactive tool to help users find the perfect Linux distribution based on their needs",
			"url": "",
			"applicationCategory": "UtilitiesApplication",
			"operatingSystem": "Any",
			"offers": {
				"@type": "Offer",
				"price": "0",
				"priceCurrency": "USD"
			},
			"creator": {
				"@type": "Organization",
				"name": "Linux Distribution Picker"
			}
		}
	</script>
</svelte:head>

<style>
	.app {
		max-width: var(--container-2xl);
		margin: 0 auto;
		padding: var(--space-xl);
		font-family: var(--font-sans);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: var(--space-lg) auto var(--space-3xl);
		padding: 0 var(--space-xl);
	}

	.header h1 {
		text-align: center;
		flex: 1;
		font-size: var(--text-4xl);
		color: var(--color-secondary);
		font-weight: var(--font-bold);
		line-height: var(--line-height-tight);
	}

	.header-controls {
		display: flex;
		gap: var(--space-sm);
	}

	.filters {
		margin-bottom: var(--space-2xl);
	}

	.filters h2 {
		font-size: var(--text-2xl);
		color: var(--color-secondary);
		font-weight: var(--font-semibold);
	}

	footer {
		margin-bottom: var(--space-2xl);
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-lg);
		align-items: center;
		padding-top: var(--space-lg);
	}

	.tag-separator {
		flex-shrink: 0;
		width: 1px;
		height: 24px;
		background: var(--color-border);
		margin: 0 var(--space-xs);
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

	.clear-btn:hover {
		transform: scale(1.1);
		box-shadow: var(--shadow-lg);
	}

	.content {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-2xl);
		align-items: start;
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

	.info-btn:hover {
		border-color: var(--color-secondary);
		color: var(--color-secondary);
	}

	.quick-test-btn {
		position: fixed;
		bottom: var(--space-xl);
		right: var(--space-xl);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-md) var(--space-lg);
		background: var(--color-secondary);
		color: var(--color-background);
		border: none;
		border-radius: var(--radius-full);
		font-size: var(--text-base);
		font-weight: var(--font-medium);
		cursor: pointer;
		box-shadow: var(--shadow-lg);
		transition: all var(--transition-normal);
		z-index: 100;
	}

	.quick-test-btn:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-xl);
	}

	.quick-test-btn:active {
		transform: translateY(0);
	}

	@media (max-width: 1024px) {
		.content {
			grid-template-columns: 1fr;
		}
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

		.tag-list {
			gap: var(--space-md);
			flex-wrap: nowrap;
			overflow-x: auto;
		}

		.filters {
			margin-bottom: var(--space-xl);
		}

		.quick-test-btn {
			bottom: var(--space-lg);
			right: var(--space-lg);
			padding: var(--space-sm) var(--space-md);
		}

		.quick-test-btn span {
			display: none;
		}
	}
</style>
