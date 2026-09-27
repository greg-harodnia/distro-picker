<script module lang="ts">
	// Every modal is a full-screen overlay with the same z-index, so nesting
	// (gallery → distro → quiz) is resolved by DOM order — and needs a stack
	// for the shared window-level handlers: only the topmost modal may react to
	// Escape / overlay clicks, and the body scroll lock must survive until the
	// *last* modal closes rather than being released by the first one.
	const modalStack: symbol[] = [];
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { fade } from 'svelte/transition';
	import { lockBodyScroll } from '$lib/utils/body';
	import { t } from '$lib/i18n/locale';
	import CloseIcon from '../icons/CloseIcon.svelte';

	const instance = Symbol('modal');

	interface Props {
		onclose?: () => void;
		ariaLabel?: string;
		scrollable?: boolean;
		contentStyle?: string;
		contentClass?: string;
		onkeydown?: (e: KeyboardEvent) => void;
		children: Snippet;
		header?: Snippet | undefined;
		footer?: Snippet | undefined;
	}

	let { 
		onclose = () => {}, 
		ariaLabel = '',
		scrollable = true,
		contentStyle = '',
		contentClass = '',
		onkeydown: onKeydown,
		children,
		header,
		footer
	}: Props = $props();

	function close() {
		onclose();
	}

	/** True when this modal is the one currently on top of the stack. */
	function isTopmost() {
		return modalStack[modalStack.length - 1] === instance;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isTopmost()) {
			close();
		}
		onKeydown?.(e);
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget && isTopmost()) {
			close();
		}
	}

	onMount(() => {
		modalStack.push(instance);
		lockBodyScroll(true);
		return () => {
			const index = modalStack.indexOf(instance);
			if (index !== -1) modalStack.splice(index, 1);
			if (modalStack.length === 0) lockBodyScroll(false);
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="modal-overlay"
	onclick={handleOverlayClick}
	transition:fade={{ duration: 200 }}
>
	<div
		class="modal-content {contentClass}"
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
			<button class="close-btn" onclick={close} aria-label={$t('app.close')} type="button">
				<CloseIcon />
			</button>
		</div>
		<div class="modal-body" class:modal-body-flex={!scrollable}>
			{@render children()}
		</div>
		{#if footer}
			<div class="modal-footer">
				{@render footer()}
			</div>
		{/if}
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
		--overlay-padding: var(--space-lg);
		padding: var(--overlay-padding);
		padding-top: max(var(--overlay-padding), env(safe-area-inset-top));
		padding-bottom: max(var(--overlay-padding), env(safe-area-inset-bottom));
		padding-left: max(var(--overlay-padding), env(safe-area-inset-left));
		padding-right: max(var(--overlay-padding), env(safe-area-inset-right));
	}

	.modal-overlay :global(.modal-content) {
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		width: 100%;
		max-width: 600px;
		max-height: 80vh;
		max-height: 85dvh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
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

	.modal-overlay :global(.modal-footer) {
		--footer-padding: var(--space-lg);
		padding: var(--footer-padding);
		padding-bottom: calc(var(--footer-padding) + env(safe-area-inset-bottom));
		border-top: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.modal-overlay :global(.modal-title) {
		font-size: var(--text-xl);
		color: var(--color-secondary);
		margin: 0;
		font-weight: var(--font-semibold);
		flex: 1;
		text-align: center;
	}

	@media (max-width: 640px) {
		.modal-overlay {
			--overlay-padding: var(--space-md);
		}

		.modal-overlay :global(.modal-header) {
			padding: var(--space-md);
		}

		.modal-overlay :global(.modal-body) {
			padding: var(--space-md);
		}

		.modal-overlay :global(.modal-footer) {
			--footer-padding: var(--space-md);
		}
	}
</style>
