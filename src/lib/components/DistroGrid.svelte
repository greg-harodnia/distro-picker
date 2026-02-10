<script lang="ts">
	import type { Distro } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	export let filteredDistros: Distro[] = [];
	export let selectedDistro: Distro | null = null;

	const dispatch = createEventDispatcher();

	function selectDistro(distro: Distro) {
		dispatch('select', distro);
	}

	function getIconPath(distro: Distro): string {
		const iconMap: Record<string, string> = {
			'mint': '/mint.png',
			'zorin': '/zorin.png',
			'popos': '/popos.png',
			'aurora': '/aurora.svg',
			'fedora-kde': '/fedora.png',
			'fedora-workstation': '/fedora.png',
			'bluefin': '/bluefin.svg',
			'bazzite-kde': '/bazzite.svg',
			'bazzite-gnome': '/bazzite.svg',
			'cachyos': '/cachyos.png',
			'lubuntu': '/lubuntu.png',
			'linux-lite': '/linux-lite.png'
		};
		return iconMap[distro.id] || '/ubuntu.png';
	}
</script>

<div class="distro-grid">
	{#each filteredDistros as distro (distro.id)}
		<div 
			class="distro-card"
			class:selected={selectedDistro?.id === distro.id}
			on:click={() => selectDistro(distro)}
			role="button"
			tabindex="0"
		>
			<img 
				src={getIconPath(distro)} 
				alt="{distro.name} logo" 
				class="distro-icon"
			/>
			<h3>{distro.name}</h3>
		</div>
	{/each}
</div>

{#if filteredDistros.length === 0}
	<div class="no-results">
		<p>No distributions match your selected criteria.</p>
		<p>Try adjusting your filters to see more options.</p>
	</div>
{/if}

<style>
	.distro-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1.5rem;
	}

	.distro-card {
		background: white;
		border: 2px solid #e1e8ed;
		border-radius: 1rem;
		padding: 1.5rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.distro-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
		border-color: #4ecdc4;
	}

	.distro-card.selected {
		border-color: #4ecdc4;
		background: linear-gradient(135deg, #4ecdc4 0%, #44a3a0 100%);
		color: white;
	}

	.distro-icon {
		width: 64px;
		height: 64px;
		margin-bottom: 1rem;
		object-fit: contain;
	}

	.distro-card h3 {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		line-height: 1.3;
	}

	.no-results {
		text-align: center;
		padding: 3rem;
		color: #7f8c8d;
	}

	.no-results p {
		margin: 0.5rem 0;
		font-size: 1.1rem;
	}

	@media (max-width: 640px) {
		.distro-grid {
			grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
			gap: 1rem;
		}

		.distro-card {
			padding: 1rem;
		}

		.distro-icon {
			width: 48px;
			height: 48px;
		}
	}
</style>