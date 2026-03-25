<script lang="ts">
	import { t } from '$lib/i18n/locale';

	let {
		title = 'Something went wrong',
		message = 'Please try again later.',
		retryable = false,
		onretry = () => {},
	}: {
		title?: string;
		message?: string;
		retryable?: boolean;
		onretry?: () => void;
	} = $props();
</script>

<div class="error-container">
	<div class="error-icon">⚠️</div>
	<h2 class="error-title">{title || $t('errors.somethingWentWrong')}</h2>
	<p class="error-message">{message || $t('errors.tryAgainLater')}</p>
	{#if retryable}
		<button class="retry-button" onclick={onretry}>
			{$t('errors.tryAgain')}
		</button>
	{/if}
</div>

<style>
	.error-container {
		text-align: center;
		padding: var(--space-3xl) var(--space-xl);
		background: var(--color-error-background);
		border: 2px solid var(--color-error-light);
		border-radius: var(--radius-lg);
		color: var(--color-error-dark);
		max-width: 400px;
		margin: var(--space-xl) auto;
		box-shadow: var(--shadow-md);
	}

	.error-icon {
		font-size: var(--text-4xl);
		margin-bottom: var(--space-lg);
		line-height: 1;
	}

	.error-title {
		font-size: var(--text-2xl);
		font-weight: var(--font-semibold);
		margin: 0 0 var(--space-lg) 0;
		color: var(--color-error);
		line-height: var(--line-height-tight);
	}

	.error-message {
		margin: 0 0 var(--space-2xl) 0;
		line-height: var(--line-height-relaxed);
		color: var(--color-error-dark);
		font-size: var(--text-base);
	}

	.retry-button {
		background: var(--color-error);
		color: var(--color-background);
		border: none;
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--radius-md);
		font-weight: var(--font-semibold);
		cursor: pointer;
		transition: all var(--transition-normal);
		font-size: var(--text-base);
		line-height: var(--line-height-normal);
	}

	.retry-button:hover {
		background: var(--color-error-dark);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}
</style>
