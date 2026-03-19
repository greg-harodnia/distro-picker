<script lang="ts">
	import type { Distro } from '$lib/types';
	import { createEventDispatcher } from 'svelte';
	import OptimizedImage from '$lib/components/OptimizedImage.svelte';
	import { supabase, getLikedDistros, setLikedDistro, removeLikedDistro } from '$lib/supabase';

	export let distros: Distro[] = [];
	export let selectedDistro: Distro | null = null;

	const dispatch = createEventDispatcher();

	function selectDistro(distro: Distro) {
		dispatch('select', distro);
	}

	async function handleLike(e: Event, distro: Distro) {
		e.stopPropagation();

		const newLikes = distro.userLiked 
			? (distro.likes || 1) - 1 
			: (distro.likes || 0) + 1;

		const { error } = await supabase
			.from('distros')
			.update({ likes: newLikes })
			.eq('name', distro.id);

		console.log('Update likes error:', error);

		if (!error) {
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
			aria-label={`${distro.name}, ${distro.description}`}
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
				distroId={distro.id}
				alt="{distro.name} logo"
				size="medium"
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

	/* .distro-card:focus {
		box-shadow: 0 0 0 3px rgba(78, 205, 196, 0.2);
	} */

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

	:global(.distro-icon) {
		margin-bottom: var(--space-lg);
		margin: 0 auto; /* Center the image within the card */
	}

	.distro-card h3 {
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		margin: 0;
		line-height: var(--line-height-tight);
	}

	@media (max-width: 640px) {
		.distro-grid {
			grid-template-columns: repeat(3, auto-fill, minmax(120px, 1fr));
			gap: var(--space-lg);
		}

		.distro-card {
			padding: var(--space-lg);
		}

		.distro-icon {
			width: 48px;
			height: 48px;
			margin-bottom: var(--space-md);
		}
	}
</style>