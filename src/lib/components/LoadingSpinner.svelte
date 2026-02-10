<script lang="ts">
	export let message = 'Loading...';
	export let size = 'medium';
</script>

<div class="loading-container" class:size>
	<div class="spinner"></div>
	<p class="loading-message">{message}</p>
</div>

<style>
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-xl);
	}

	.loading-container.small {
		padding: var(--space-lg);
	}

	.loading-container.large {
		padding: var(--space-3xl);
	}

	.spinner {
		border: 3px solid var(--color-border-light);
		border-top: 3px solid var(--color-primary);
		border-radius: 50%;
		width: 40px;
		height: 40px;
		animation: spin 1s linear infinite;
	}

	.small .spinner {
		width: 24px;
		height: 24px;
		border-width: 2px;
	}

	.large .spinner {
		width: 60px;
		height: 60px;
		border-width: 4px;
	}

	.loading-message {
		margin-top: var(--space-lg);
		color: var(--color-text-secondary);
		font-size: var(--text-base);
		text-align: center;
		font-weight: var(--font-normal);
		line-height: var(--line-height-normal);
	}

	.small .loading-message {
		font-size: var(--text-sm);
		margin-top: var(--space-md);
	}

	.large .loading-message {
		font-size: var(--text-xl);
		margin-top: var(--space-xl);
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>