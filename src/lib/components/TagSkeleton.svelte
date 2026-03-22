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