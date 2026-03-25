<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { lockBodyScroll } from '$lib/utils/body';
	import { t } from '$lib/i18n/locale';
	import CloseIcon from './icons/CloseIcon.svelte';

	interface Props {
		onclose?: () => void;
		ariaLabel?: string;
		scrollable?: boolean;
		contentStyle?: string;
		onkeydown?: (e: KeyboardEvent) => void;
		children: Snippet;
		header?: Snippet;
	}

	let { 
		onclose = () => {}, 
		ariaLabel = '',
		scrollable = true,
		contentStyle = '',
		onkeydown: onKeydown,
		children,
		header
	}: Props = $props();

	function close() {
		onclose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
		onKeydown?.(e);
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	onMount(() => {
		lockBodyScroll(true);
		return () => {
			lockBodyScroll(false);
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="modal-overlay"
	onclick={handleOverlayClick}
	onkeydown={handleKeydown}
	role="button"
	tabindex="0"
	transition:fade={{ duration: 200 }}
>
	<div
		class="modal-content"
		class:modal-content-full={!scrollable}
		style={contentStyle}
		role="dialog"
		aria-modal="true"
		aria-label={ariaLabel}
		tabindex="-1"
	>
		<div class="modal-header">
			{#if header}
				{@render header()}
			{/if}
			<button class="close-btn" onclick={close} aria-label={$t('modal.close')} type="button">
				<CloseIcon />
			</button>
		</div>
		<div class="modal-body" class:modal-body-flex={!scrollable}>
			{@render children()}
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-lg);
	}

	.modal-overlay :global(.modal-content) {
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		width: 100%;
		max-width: 600px;
		max-height: 80vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;

		@media (max-width: 640px) {
			max-height: 60vh;
		}
	}

	.modal-overlay :global(.modal-content.modal-content-full) {
		height: 100%;
	}

	.modal-overlay :global(.modal-header) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.modal-overlay :global(.modal-body) {
		padding: var(--space-lg);
		overflow-y: auto;
		flex: 1;
	}

	.modal-overlay :global(.modal-body.modal-body-flex) {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: 0;
	}

	.modal-overlay :global(.modal-title) {
		font-size: var(--text-xl);
		color: var(--color-secondary);
		margin: 0;
		font-weight: var(--font-semibold);
		flex: 1;
		text-align: center;
	}
</style>
