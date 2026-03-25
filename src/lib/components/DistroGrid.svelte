<script lang="ts">
	import type { Distro } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import OptimizedImage from '$lib/components/OptimizedImage.svelte';
	import { updateLikes } from '$lib/supabase';
	import { setLikedDistro, removeLikedDistro } from '$lib/utils';
	import { t } from '$lib/i18n/locale';

	export let distros: Distro[] = [];
	export let selectedDistro: Distro | null = null;

	const dispatch = createEventDispatcher();

	function getDescription(distro: Distro): string {
		const desc = $t(`distros.descriptions.${distro.id}`);
		return typeof desc === 'string' ? desc : '';
	}

	function selectDistro(distro: Distro) {
		dispatch('select', distro);
	}

	async function handleLike(e: Event, distro: Distro) {
		e.stopPropagation();

		const newLikes = distro.userLiked 
			? (distro.likes || 1) - 1 
			: (distro.likes || 0) + 1;

		const success = await updateLikes(distro.id, newLikes);

		if (success) {
			distro.likes = newLikes;
			distro.userLiked = !distro.userLiked;
			if (distro.userLiked) {
				setLikedDistro(distro.id);
			} else {
				removeLikedDistro(distro.id);
			}
			distros = distros;
		}
	}

	function handleKeydown(e: any) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			const card = e.currentTarget as HTMLElement;
			const distroId = card.getAttribute('data-distro-id');
			if (distroId) {
				const distro = distros.find(d => d.id === distroId);
				if (distro) {
					selectDistro(distro);
				}
			}
		}
	}
</script>

<div class="distro-grid">
	{#each distros as distro (distro.id)}
		<div 
			class="distro-card"
			class:selected={selectedDistro?.id === distro.id}
			on:click={() => selectDistro(distro)}
			on:keydown={handleKeydown}
			role="button"
			tabindex="0"
			aria-label={`${distro.name}, ${getDescription(distro)}`}
			aria-pressed={selectedDistro?.id === distro.id}
			data-distro-id={distro.id}
		>
			<div class="reactions">
				{#if distro.best}
					<span class="best">🔥</span>
				{/if}
				<button 
					class="like" 
					class:liked={distro.userLiked}
					on:click={(e) => handleLike(e, distro)}
					aria-label={distro.userLiked ? 'Unlike this distro' : 'Like this distro'}
				>
					❤️{distro.likes ? ` ${distro.likes}` : ''}
				</button>
			</div>
			<OptimizedImage
				logo={distro.logo}
				alt="{distro.name} logo"
				customClass="distro-icon"
			/>
			<h3>{distro.name}</h3>
		</div>
	{/each}
</div>

<style>
	.distro-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: var(--space-xl);
		padding-top: var(--space-lg);
	}

	.distro-card {
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		text-align: center;
		cursor: pointer;
		transition: all var(--transition-normal);
		box-shadow: var(--shadow-md);
		position: relative;
	}

	.distro-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
		border-color: var(--color-primary);
	}

	.distro-card.selected {
		border-color: var(--color-primary);
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		color: var(--color-background);
	}

	.reactions {
		position: absolute;
		top: -10px;
		right: -10px;
		display: flex;
		gap: 4px;
		z-index: 1;
	}

	.best {
		font-size: 1.5rem;
		line-height: 1;
	}

	.like {
		font-size: 1rem;
		line-height: 1;
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-full);
		padding: 4px 8px;
		cursor: pointer;
		transition: all var(--transition-normal);
		display: flex;
		align-items: center;
		gap: 2px;
		color: var(--color-text, inherit);
	}

	.like:hover {
		transform: scale(1.1);
		border-color: #e25555;
	}

	.like.liked {
		border-color: #e25555;
		color: var(--color-text, inherit);
	}

	:global(.distro-card) {
		& .optimized-image-container {
			margin-bottom: var(--space-sm);
		}

		& .optimized-image {
			width: 64px;
			height: 64px;
		}
	}

	.distro-card h3 {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		margin: 0;
		line-height: var(--line-height-tight);
	}

	@media (max-width: 640px) { 
		.distro-grid {
			display: flex;
			width: calc(100vw - 2*var(--space-lg)); /* minus 2 paddings from .app*/
			gap: var(--space-md);
			overflow-x: auto;
		}

		.distro-card {
			min-width: 134px;
			padding: var(--space-lg);
		}

		:global(.distro-card) {
			& .optimized-image {
				width: 48px;
				height: 48px;
			}
		}
	}
</style>