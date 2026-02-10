<script lang="ts">
	import type { Distro, Tag } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import { sanitizeUrl } from '$lib/utils';

	export let distro: Distro;
	export let tags: Tag[] = [];

	const dispatch = createEventDispatcher();

	function getTagById(tagId: string): Tag | undefined {
		return tags.find(tag => tag.id === tagId);
	}

	function visitWebsite() {
		const sanitizedUrl = sanitizeUrl(distro.website);
		if (sanitizedUrl !== '#') {
			window.open(sanitizedUrl, '_blank', 'noopener,noreferrer');
		}
	}

	function closePanel() {
		dispatch('close');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			closePanel();
		}
	}

	function handleWebsiteKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			visitWebsite();
		}
	}
</script>

<div class="distro-panel">
	<div class="panel-header">
		<h2>{distro.name}</h2>
		<button 
			class="close-btn" 
			on:click={closePanel}
			on:keydown={handleKeydown}
			aria-label="Close distro details panel"
			type="button"
		>
			×
		</button>
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

		<button 
			class="website-btn" 
			on:click={visitWebsite}
			on:keydown={handleWebsiteKeydown}
			aria-label={`Visit ${distro.name} website`}
			type="button"
		>
			Visit Website
		</button>
	</div>
</div>

<style>
	.distro-panel {
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		width: 350px;
		box-shadow: var(--shadow-2xl);
		position: sticky;
		top: var(--space-xl);
		max-height: calc(100vh - 4rem);
		overflow-y: auto;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-xl);
		padding-bottom: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
	}

	.panel-header h2 {
		margin: 0;
		color: var(--color-secondary);
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
		line-height: var(--line-height-tight);
	}

	.close-btn {
		background: none;
		border: none;
		font-size: var(--text-2xl);
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: var(--space-xs);
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		transition: all var(--transition-normal);
		line-height: 1;
	}

	.close-btn:hover {
		background: var(--color-background-secondary);
		color: var(--color-secondary);
	}

	.close-btn:focus {
		box-shadow: 0 0 0 2px var(--color-primary);
	}

	.distro-description {
		margin-bottom: var(--space-2xl);
	}

	.distro-description p {
		color: var(--color-text-secondary);
		line-height: var(--line-height-relaxed);
		margin: 0;
		font-size: var(--text-base);
	}

	.distro-tags {
		margin-bottom: var(--space-2xl);
	}

	.distro-tags h3 {
		margin: 0 0 var(--space-lg) 0;
		color: var(--color-secondary);
		font-size: var(--text-lg);
		font-weight: var(--font-medium);
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

	.website-btn {
		width: 100%;
		padding: var(--space-md) var(--space-xl);
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		color: var(--color-background);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		cursor: pointer;
		transition: all var(--transition-normal);
		text-decoration: none;
		display: inline-block;
		text-align: center;
		line-height: var(--line-height-normal);
	}

	.website-btn:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.website-btn:focus {
		box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
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
			padding: var(--space-lg);
		}

		.panel-header h2 {
			font-size: var(--text-xl);
		}
	}
</style>