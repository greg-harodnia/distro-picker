<script lang="ts">
	import type { Distro, Tag } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	export let distro: Distro;
	export let tags: Tag[] = [];

	const dispatch = createEventDispatcher();

	function getTagById(tagId: string): Tag | undefined {
		return tags.find(tag => tag.id === tagId);
	}

	function visitWebsite() {
		window.open(distro.website, '_blank');
	}

	function closePanel() {
		dispatch('close');
	}
</script>

<div class="distro-panel">
	<div class="panel-header">
		<h2>{distro.name}</h2>
		<button class="close-btn" on:click={closePanel} aria-label="Close panel">×</button>
	</div>

	<div class="panel-content">
		<div class="distro-description">
			<p>{distro.description}</p>
		</div>

		<div class="distro-tags">
			<h3>Features</h3>
			<div class="tag-list">
				{#each distro.tag_ids as tagId}
					{#if getTagById(tagId)}
						{@const tag = getTagById(tagId)!}
						<span 
							class="tag"
							style="--tag-color: {tag.color}"
						>
							{tag.name}
						</span>
					{/if}
				{/each}
			</div>
		</div>

		<button class="website-btn" on:click={visitWebsite}>
			Visit Website
		</button>
	</div>
</div>

<style>
	.distro-panel {
		background: white;
		border: 2px solid #e1e8ed;
		border-radius: 1rem;
		padding: 2rem;
		width: 350px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 2rem;
		max-height: calc(100vh - 4rem);
		overflow-y: auto;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #e1e8ed;
	}

	.panel-header h2 {
		margin: 0;
		color: #2c3e50;
		font-size: 1.5rem;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 1.5rem;
		color: #7f8c8d;
		cursor: pointer;
		padding: 0.25rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.25rem;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: #f8f9fa;
		color: #2c3e50;
	}

	.distro-description {
		margin-bottom: 2rem;
	}

	.distro-description p {
		color: #5a6c7d;
		line-height: 1.6;
		margin: 0;
	}

	.distro-tags {
		margin-bottom: 2rem;
	}

	.distro-tags h3 {
		margin: 0 0 1rem 0;
		color: #2c3e50;
		font-size: 1.1rem;
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag {
		padding: 0.25rem 0.75rem;
		background: var(--tag-color);
		color: white;
		border-radius: 1rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.website-btn {
		width: 100%;
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #4ecdc4 0%, #44a3a0 100%);
		color: white;
		border: none;
		border-radius: 0.5rem;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		display: inline-block;
		text-align: center;
	}

	.website-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
	}

	@media (max-width: 1024px) {
		.distro-panel {
			width: 100%;
			position: static;
			max-height: none;
		}
	}

	@media (max-width: 640px) {
		.distro-panel {
			padding: 1.5rem;
		}

		.panel-header h2 {
			font-size: 1.25rem;
		}
	}
</style>