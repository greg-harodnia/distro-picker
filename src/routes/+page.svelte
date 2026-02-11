<script lang="ts">
	import { onMount } from 'svelte';
	import TagFilter from '$lib/components/TagFilter.svelte';
	import DistroGrid from '$lib/components/DistroGrid.svelte';
	import DistroPanel from '$lib/components/DistroPanel.svelte';
	import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { loadTags, loadDistros } from '$lib/utils';
	import { 
		tags, 
		loading, 
		error, 
		selectedTags, 
		selectedDistro, 
		filteredDistros,
		tagActions,
		distroActions,
		dataActions
	} from '$lib/stores';
	import type { Distro } from '$lib/types';





	async function loadData() {
		dataActions.setLoading(true);
		dataActions.clearError();

		try {
			const [tagsResult, distrosResult] = await Promise.all([
				loadTags(),
				loadDistros()
			]);

			if (tagsResult.error) {
				dataActions.setError(tagsResult.error);
			} else if (distrosResult.error) {
				dataActions.setError(distrosResult.error);
			} else {
				dataActions.setTags(tagsResult.data || []);
				dataActions.setDistros(distrosResult.data || []);
			}
		} catch (err) {
			dataActions.setError(err instanceof Error ? err.message : 'Failed to load data');
		} finally {
			dataActions.setLoading(false);
		}
	}

	function toggleTag(tagId: string) {
		tagActions.toggle(tagId);
	}

	function selectDistro(distro: Distro) {
		distroActions.select(distro);
	}

	function closePanel() {
		distroActions.clear();
	}

	onMount(() => {
		loadData();
	});


</script>

{#if $loading}
		<LoadingSpinner message="Loading distributions..." size="large" />
	{:else if $error}
		<ErrorDisplay 
			title="Failed to Load Data" 
			message={$error} 
			retryable 
			on:retry={loadData}
		/>
{:else}
	<a href="#main-content" class="skip-link">Skip to main content</a>
	<div class="app">
		<header class="header">
			<div class="header-content">
				<div class="header-text">
					<h1>Linux Distro Picker</h1>
					<p>Find the perfect Linux distribution for your needs</p>
				</div>
				<ThemeToggle />
			</div>
		</header>

		<main id="main-content">			
			<section class="filters" aria-labelledby="filters-heading">
				<h2 id="filters-heading">Filter by Tags</h2>
				<div class="tag-list" role="group" aria-label="Filter options">
					{#each $tags as tag (tag.id)}
						<TagFilter 
							{tag} 
							selected={$selectedTags.has(tag.id)}
							on:toggle={() => toggleTag(tag.id)}
						/>
					{/each}
				</div>
			</section>

			<div class="content">
				<section class="distros" aria-labelledby="distros-heading">
					<h2 id="distros-heading">Recommended Distros ({$filteredDistros.length})</h2>
					{#if $filteredDistros.length === 0}
						<div class="no-results" role="status" aria-live="polite">
							<p>No distributions match your selected criteria.</p>
							<p>Try adjusting your filters to see more options.</p>
						</div>
					{:else}
						<DistroGrid 
							distros={$filteredDistros} 
							selectedDistro={$selectedDistro}
							on:select={(e) => selectDistro(e.detail)}
						/>
					{/if}
				</section>

				{#if $selectedDistro}
				<section class="distros" aria-labelledby="details-heading">
					<h2 id="details-heading">Distribution Details</h2>
					<DistroPanel 
						distro={$selectedDistro}
						tags={$tags}
						on:close={closePanel}
					/>
				</section>
				{/if}
			</div>


			<footer>
				<p>Not all distributions are included, as this app is intended for beginners.
Feel free to dual boot the distribution you choose with your main OS, but do so on separate disks — Windows updates can break the Linux installation. Also, never use Windows tools to resize partitions on the disk where Linux is installed.

If some apps are missing in your distribution, consider the following:

1) First, make sure it's really missing — search for it in your distribution's repositories. Don't forget to check Flatpak (on Flathub.org or in your software center) and AppImage (on AppImageHub.com) versions as well.

2) If the app is truly missing, consider using alternatives (e.g., OnlyOffice over Microsoft Office, qBittorrent over uTorrent, etc.). There is a lot of great open source software available.

3) If the app is missing in your distribution but is available in others, you can use Distrobox to install it in a container.

4) If you still need to use Windows apps that aren't available for Linux, try Bottles (which uses Wine under the hood) to run them natively. This also works for the majority of games — though for gaming, Steam is recommended.

5) If the Windows app still doesn't run in Bottles, try Winboat to run it in a virtual machine. This works for apps like Photoshop, for example.
				</p>
			</footer>
		</main>
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
		margin-bottom: var(--space-3xl);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: var(--container-2xl);
		margin: 0 auto;
		padding: 0 var(--space-xl);
	}

	.header-text {
		text-align: center;
		flex: 1;
	}

	.header h1 {
		font-size: var(--text-4xl);
		color: var(--color-secondary);
		margin-bottom: var(--space-sm);
		font-weight: var(--font-bold);
		line-height: var(--line-height-tight);
	}

	.header p {
		color: var(--color-text-secondary);
		font-size: var(--text-lg);
		font-weight: var(--font-normal);
	}

	.filters {
		margin-bottom: var(--space-2xl);
	}

	.filters h2 {
		font-size: var(--text-2xl);
		color: var(--color-secondary);
		margin-bottom: var(--space-lg);
		font-weight: var(--font-semibold);
	}

	footer {
		margin-bottom: var(--space-2xl);
	}

	footer p {
		color: var(--color-text-secondary);
		font-size: var(--text-lg);
		font-weight: var(--font-normal);
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-lg);
	}

	.content {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-2xl);
		align-items: start;
		margin-bottom: var(--space-2xl);
	}

	.distros h2 {
		font-size: var(--text-2xl);
		color: var(--color-secondary);
		margin-bottom: var(--space-lg);
		font-weight: var(--font-semibold);
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

		.header-content {
			flex-direction: column;
			gap: var(--space-lg);
			padding: 0;
		}

		.header h1 {
			font-size: var(--text-3xl);
		}

		.tag-list {
			gap: var(--space-md);
		}
	}
</style>