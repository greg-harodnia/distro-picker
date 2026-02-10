<script lang="ts">
	import tagsData from '$lib/tags.json';
	import distrosData from '$lib/distros.json';
	import TagFilter from '$lib/components/TagFilter.svelte';
	import DistroGrid from '$lib/components/DistroGrid.svelte';
	import DistroPanel from '$lib/components/DistroPanel.svelte';
	import type { Distro, Tag } from '$lib/types';

	let selectedTags: Set<string> = new Set();
	let selectedDistro: Distro | null = null;
	let filteredDistros: Distro[] = [...distrosData.distros];

	$: {
		filteredDistros = distrosData.distros
			.filter(distro => {
				if (selectedTags.size === 0) return true;
				return Array.from(selectedTags).every(tagId => 
					distro.tag_ids.includes(tagId)
				);
			})
			.sort((a, b) => a.priority - b.priority);
	}

	function toggleTag(tagId: string) {
		if (selectedTags.has(tagId)) {
			selectedTags.delete(tagId);
		} else {
			selectedTags.add(tagId);
		}
		selectedTags = new Set(selectedTags);
	}

	function selectDistro(distro: Distro) {
		selectedDistro = distro;
	}
</script>

<main class="app">
	<header class="header">
		<h1>Linux Distro Picker</h1>
		<p>Find the perfect Linux distribution for your needs</p>
	</header>

	<section class="filters">
		<h2>Filter by Tags</h2>
		<div class="tag-list">
			{#each tagsData.tags as tag (tag.id)}
				<TagFilter 
					{tag} 
					selected={selectedTags.has(tag.id)}
					on:toggle={() => toggleTag(tag.id)}
				/>
			{/each}
		</div>
	</section>

	<div class="content">
		<section class="distros">
			<h2>Recommended Distros ({filteredDistros.length})</h2>
			<DistroGrid 
				{filteredDistros} 
				{selectedDistro}
				on:select={(e) => selectDistro(e.detail)}
			/>
		</section>

		{#if selectedDistro}
		<section class="distros">
			<h2>Details</h2>
			<DistroPanel 
				distro={selectedDistro}
				tags={tagsData.tags}
				on:close={() => selectedDistro = null}
			/>
		</section>
		{/if}
	</div>
</main>

<style>
	.app {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}

	.header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.header h1 {
		font-size: 2.5rem;
		color: #2c3e50;
		margin-bottom: 0.5rem;
	}

	.header p {
		color: #7f8c8d;
		font-size: 1.1rem;
	}

	.filters {
		margin-bottom: 2rem;
	}

	.filters h2 {
		font-size: 1.5rem;
		color: #2c3e50;
		margin-bottom: 1rem;
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.content {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 2rem;
		align-items: start;
	}

	.distros h2 {
		font-size: 1.5rem;
		color: #2c3e50;
		margin-bottom: 1rem;
	}

	@media (max-width: 1024px) {
		.content {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.app {
			padding: 1rem;
		}

		.header h1 {
			font-size: 2rem;
		}

		.tag-list {
			gap: 0.5rem;
		}
	}
</style>