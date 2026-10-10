<script lang="ts">
	import { t } from '$lib/i18n/locale';
	import Modal from './Modal.svelte';
	import Quiz, { type QuizApi } from '$lib/components/Quiz.svelte';

	interface Props {
		onclose?: () => void;
	}
	let { onclose = () => {} }: Props = $props();

	// The back arrow lives in the modal header (as it always has) and restart
	// in the modal footer, so the quiz reports its state up here instead of
	// rendering those controls itself.
	let quiz = $state<QuizApi | null>(null);
</script>

<Modal
	{onclose}
	ariaLabel={$t('modals.quiz.title') || ''}
>
	{#snippet header()}
		{#if quiz?.canGoBack}
			<button class="back-btn" onclick={() => quiz?.goBack()} aria-label={$t('modals.quiz.goBack')} type="button">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>
		{:else}
			<div class="spacer"></div>
		{/if}
		<h2 class="modal-title">{$t('modals.quiz.title')}</h2>
	{/snippet}

	{#snippet footer()}
		{#if quiz?.isComplete}
			<div class="footer-actions">
				<button class="btn-outline" onclick={() => quiz?.restart()} type="button">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="1 4 1 10 7 10"></polyline>
						<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
					</svg>
					{$t('modals.quiz.restartTest')}
				</button>
				<button class="btn-primary" onclick={onclose} type="button">
					{$t('app.close')}
				</button>
			</div>
		{/if}
	{/snippet}

	<Quiz onchange={(api) => (quiz = api)} />
</Modal>

<style>
	.back-btn {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: var(--space-xs);
		border-radius: var(--radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-normal);
		flex-shrink: 0;
	}

	@media (hover: hover) {
		.back-btn:hover {
			background: var(--color-background-secondary);
			color: var(--color-secondary);
		}
	}

	.spacer {
		width: 36px;
		flex-shrink: 0;
	}

	.modal-title {
		font-size: var(--text-lg);
		color: var(--color-text);
		margin: 0;
		flex: 1;
		text-align: center;
	}

	/* .modal-footer is a plain block, so the buttons need their own flex row
	   to split the width evenly instead of stacking left. */
	.footer-actions {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.footer-actions button {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
	}
</style>
