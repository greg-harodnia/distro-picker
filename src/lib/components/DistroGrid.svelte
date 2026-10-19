<script lang="ts">
	import type { Distro } from '$lib/types';
	import OptimizedImage from '$lib/components/OptimizedImage.svelte';
	import { incrementDistroLikes } from '$lib/supabase';
	import { setLikedDistro, removeLikedDistro, toggleLike } from '$lib/utils';
	import { catalog } from '$lib/stores/state/catalog.svelte';
	import { t, localePath } from '$lib/i18n/locale';

	let {
		distros = [],
		visibleIds = null,
		onselect = (_distro: Distro) => {},
		eager = false,
	}: {
		distros?: Distro[];
		visibleIds?: Set<string> | null;
		onselect?: (distro: Distro) => void;
		/** Load these cards' logos at parse time (a first-screen section). */
		eager?: boolean;
	} = $props();

	function getDescription(distro: Distro): string {
		const desc = $t(`distros.${distro.id}.description`);
		return typeof desc === 'string' ? desc : '';
	}

	function selectDistro(distro: Distro) {
		onselect(distro);
	}

	/**
	 * The card is a JS-only modal trigger, which left every /distro/<id> page
	 * as an orphan reachable only through sitemap.xml. The name is a real
	 * <a href> for crawlers (and middle-click / cmd-click / "open in new tab"),
	 * but it is styled as plain text and a plain click still opens the modal,
	 * so the hover state never promises a page navigation it won't perform.
	 */
	function handleNameClick(e: MouseEvent, distro: Distro) {
		e.stopPropagation();
		const isModified =
			e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
		if (isModified) return; // let the browser follow the href
		e.preventDefault();
		selectDistro(distro);
	}

	async function handleLike(e: Event, distro: Distro) {
		e.stopPropagation();

		await toggleLike(
			{ liked: distro.userLiked ?? false, count: distro.likes ?? 0 },
			{
				// The card renders from the global catalog.
				apply: ({ liked, count }) =>
					catalog.updateDistro(distro.id, { likes: count, userLiked: liked }),
				remember: (liked) =>
					liked ? setLikedDistro(distro.id) : removeLikedDistro(distro.id),
				rpc: (delta) => incrementDistroLikes(distro.id, delta)
			}
		);
	}
</script>

<div class="distro-grid">
	{#each distros as distro (distro.id)}
		<!-- The card's click is a redundant mouse affordance: the real
		     interactive elements are the like <button> and the name <a> below
		     (which also opens the modal on Enter). `role="presentation"` keeps
		     this wrapper out of the accessibility tree so it isn't announced as
		     content with no keyboard equivalent of its own. -->
		<div 
			class="distro-card"
			role="presentation"
			hidden={visibleIds ? !visibleIds.has(distro.id) : false}
			onclick={() => selectDistro(distro)}
			data-distro-id={distro.id}
		>
			<div class="reactions">
			{#if distro.popular}
				<span class="popular">🔥</span>
			{/if}
			{#if distro.in_development}
				<span class="in-development">🚧</span>
			{/if}
				<button 
					class="like" 
					class:liked={distro.userLiked}
					onclick={(e) => handleLike(e, distro)}
					aria-label={distro.userLiked ? 'Unlike this distro' : 'Like this distro'}
				>
					❤️ {distro.likes ?? 0}
				</button>
			</div>
			<OptimizedImage
				logo={distro.logo}
				alt="{distro.name} logo"
				customClass="distro-icon"
				{eager}
			/>
			<h3>
				<a
					class="distro-name-link"
					href={localePath(`/distro/${distro.id}`)}
					onclick={(e) => handleNameClick(e, distro)}
					aria-label={`${distro.name}, ${getDescription(distro)}`}
				>{distro.name}</a>
			</h3>
		</div>
	{/each}
</div>

<style>
	.distro-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
		gap: var(--space-md);
		padding-top: var(--space-lg);
	}

	.distro-card {
		background: var(--color-surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		padding: var(--space-lg) var(--space-md);
		text-align: center;
		cursor: pointer;
		transition: border-color var(--transition-normal), background var(--transition-normal);
		position: relative;
		user-select: none;
		-webkit-user-select: none;
		/* Square tile: the card grows with the column (grid `min-height: auto`
		   keeps it from clipping), so the content is centred inside the extra
		   height instead of floating at the top. */
		aspect-ratio: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.distro-card[hidden] {
		display: none;
	}

	@media (hover: hover) {
		.distro-card:hover {
			border-color: var(--color-text);
			background: var(--color-background);
		}
	}

	.reactions {
		position: absolute;
		top: -10px;
		right: -10px;
		display: flex;
		gap: 4px;
		z-index: 1;
	}

	.reactions .popular,
	.reactions .in-development {
		font-size: 1.25rem;
		line-height: 1;
	}

	.like {
		font-size: var(--text-sm);
		line-height: 1;
		background: var(--color-surface);
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-full);
		padding: 5px 10px;
		cursor: pointer;
		transition: all var(--transition-normal);
		display: flex;
		align-items: center;
		gap: 2px;
		color: var(--color-text, inherit);
	}

	@media (hover: hover) {
		.like:hover {
			border-color: #e25555;
		}
	}

	.like.liked {
		border-color: #e25555;
		color: var(--color-text, inherit);
	}

	:global(.distro-card) {
		& .optimized-image-container {
			margin-bottom: var(--space-md);
		}

		& .optimized-image {
			width: 64px;
			height: 64px;
		}
	}

	.distro-card h3 {
		margin: 0;
		line-height: var(--line-height-tight);
	}

	.distro-name-link {
		display: block;
		width: 100%;
		margin: 0;
		padding: 0;
		font-family: inherit;
		font-size: var(--text-base);
		font-weight: var(--font-medium);
		letter-spacing: -0.01em;
		line-height: var(--line-height-tight);
		color: inherit;
		text-decoration: none;
		cursor: pointer;
		border-radius: var(--radius-sm);
	}

	@media (hover: hover) {
		/* No underline here on purpose: a plain click opens the modal, not the
		   page, so a link-styled hover would promise a navigation that never
		   happens. The card's own hover (border colour) is the affordance; the
		   href is there for crawlers and modified clicks. */
		.distro-card:hover .distro-name-link {
			text-decoration: none;
		}
	}

	.distro-name-link:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	@media (max-width: 640px) {
		.distro-grid {
			grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
			gap: var(--space-lg);
			padding-top: var(--space-md);
		}

		.distro-card {
			padding: var(--space-lg);
		}

		/* below is the option for one-liner */
		
		/* .distro-grid {
			display: flex;
			width: calc(100vw - 2*var(--space-lg)); minus 2 paddings from .app
			gap: var(--space-md);
			overflow-x: auto;
		}

		.distro-card {
			min-width: 134px;
			padding: var(--space-lg);
		} */
		 
		:global(.distro-card) {
			& .optimized-image {
				width: 48px;
				height: 48px;
			}
		}
	}
</style>
