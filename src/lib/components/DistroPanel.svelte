<script lang="ts">
	import type { Distro, Tag } from "$lib/types";
	import { createEventDispatcher } from "svelte";
	import { sanitizeUrl } from "$lib/utils";
	import GalleryModal from "./GalleryModal.svelte";

	export let distro: Distro;
	export let tags: Tag[] = [];
	export let screenshots: string[] = [];

	const dispatch = createEventDispatcher();

	let showGallery = false;

	function getTagById(tagId: string): Tag | undefined {
		return tags.find((tag) => tag.id === tagId);
	}

	function visitWebsite() {
		const sanitizedUrl = sanitizeUrl(distro.website);
		if (sanitizedUrl !== "#") {
			window.open(sanitizedUrl, "_blank", "noopener,noreferrer");
		}
	}

	function closePanel() {
		dispatch("close");
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			closePanel();
		}
	}

	function handleWebsiteKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			visitWebsite();
		}
	}

	function handleGalleryKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			showGallery = true;
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

		{#if distro.tag_ids && distro.tag_ids.length > 0}
			<div class="distro-tags">
				<div class="tag-list">
					{#each distro.tag_ids as tagId}
						{#if getTagById(tagId)}
							{@const tag = getTagById(tagId)!}
							<span class="tag" style="--tag-color: {tag.color}">
								{tag.name}
							</span>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		<div class="buttons">
			<button
				class="website-btn"
				on:click={visitWebsite}
				on:keydown={handleWebsiteKeydown}
				aria-label={`Visit ${distro.name} website`}
				type="button"
			>
				Visit Website
			</button>

			<button
				class="gallery-btn"
				on:click={() => (showGallery = true)}
				on:keydown={handleGalleryKeydown}
				aria-label={`View ${distro.name} screenshots`}
				type="button"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2"
					></rect>
					<circle cx="8.5" cy="8.5" r="1.5"></circle>
					<polyline points="21 15 16 10 5 21"></polyline>
				</svg>
			</button>
		</div>
	</div>
</div>

{#if showGallery}
	<GalleryModal
		images={screenshots}
		distroName={distro.name}
		on:close={() => (showGallery = false)}
	/>
{/if}

<style>
	.distro-panel {
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		width: 350px;
		box-shadow: var(--shadow-xl);
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

	/* .close-btn:focus {
		box-shadow: 0 0 0 2px var(--color-primary);
	} */

	.distro-description p {
		color: var(--color-text-secondary);
		line-height: var(--line-height-relaxed);
		margin: 0;
		font-size: var(--text-base);
	}

	.distro-tags {
		margin-top: var(--space-2xl);
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

	.buttons {
		display: flex;
		height: 56px;
		margin-top: var(--space-2xl);
	}

	.buttons > button {
		background: linear-gradient(
			135deg,
			var(--color-primary) 0%,
			var(--color-primary-dark) 100%
		);
		color: var(--color-background);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	.website-btn {
		width: calc(100% - 56px - var(--space-md));
		padding: var(--space-md) var(--space-xl);
		text-decoration: none;
		text-align: center;
	}

	.gallery-btn {
		width: 56px;
		margin-left: var(--space-md);
	}

	.buttons > button:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	/* .website-btn:focus {
		box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
	} */

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
