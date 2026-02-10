<script lang="ts">
	export let count = 5;
</script>

<div class="skeleton-tags">
	{#each Array(count) as _, i (i)}
		<div class="skeleton-tag"></div>
	{/each}
</div>

<style>
	.skeleton-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-lg);
	}

	.skeleton-tag {
		height: 40px;
		width: 120px;
		background: var(--color-border-light);
		border-radius: var(--radius-full);
		animation: skeleton-pulse 1.5s ease-in-out infinite;
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
		.skeleton-tags {
			gap: var(--space-md);
		}

		.skeleton-tag {
			width: 100px;
			height: 36px;
		}
	}
</style>