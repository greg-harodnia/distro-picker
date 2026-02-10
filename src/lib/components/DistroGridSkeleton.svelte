<script lang="ts">
	export let count = 8;
</script>

<div class="skeleton-grid">
	{#each Array(count) as _, i (i)}
		<div class="skeleton-card">
			<div class="skeleton-icon"></div>
			<div class="skeleton-text"></div>
		</div>
	{/each}
</div>

<style>
	.skeleton-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: var(--space-xl);
	}

	.skeleton-card {
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		text-align: center;
	}

	.skeleton-icon {
		width: 64px;
		height: 64px;
		margin-bottom: var(--space-lg);
		background: var(--color-border-light);
		border-radius: var(--radius-sm);
		animation: skeleton-pulse 1.5s ease-in-out infinite;
	}

	.skeleton-text {
		height: 16px;
		background: var(--color-border-light);
		border-radius: var(--radius-sm);
		animation: skeleton-pulse 1.5s ease-in-out infinite;
		margin: 0 auto;
		width: 80%;
	}

	@keyframes skeleton-pulse {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}

	@media (max-width: 640px) {
		.skeleton-grid {
			grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
			gap: var(--space-lg);
		}

		.skeleton-card {
			padding: var(--space-lg);
		}

		.skeleton-icon {
			width: 48px;
			height: 48px;
			margin-bottom: var(--space-md);
		}
	}
</style>