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
	import { useModalStack } from './modalStack.svelte';

	const instance = Symbol('modal');
	const scrim = useModalStack();

	// The click that opens a dialog is often followed by a second click at
	// the same coordinates before the user notices the popup — but by then
	// the modal's text sits exactly under the cursor, so the browser pairs
	// the two clicks into a double-click and selects the word there.
	// Swallow the selection default for that first instant only, keeping
	// normal click-drag and double-click selection working afterwards.
	const openedAt = performance.now();
	const STRAY_CLICK_GUARD_MS = 500;

	/** True for a few hundred ms after mount — the window in which a second click may still belong to the double-click that opened the modal. */
	function isStrayClick() {
		return performance.now() - openedAt < STRAY_CLICK_GUARD_MS;
	}

	function guardStraySelection(e: Event) {
		if (isStrayClick()) {
			e.preventDefault();
		}
	}

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
		// The full-viewport overlay extends far past the centred dialog, so the
		// second click of the opening double-click can also land on the scrim
		// (e.target === e.currentTarget) and would otherwise close the dialog
		// the user just opened.
		if (e.target === e.currentTarget && isTopmost() && !isStrayClick()) {
			close();
		}
	}

	onMount(() => {
		modalStack.push(instance);
		const leaveScrim = scrim.enter();
		lockBodyScroll(true);
		return () => {
			leaveScrim();
			const index = modalStack.indexOf(instance);
			if (index !== -1) modalStack.splice(index, 1);
			if (modalStack.length === 0) lockBodyScroll(false);
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- The overlay is a decorative scrim: it has a click handler as a mouse
affordance to close the dialog, but the real interactive affordances are the
close button and the Escape key handled above. `role="presentation"` keeps it
out of the accessibility tree so it isn't announced as content. -->
<div
	class="modal-overlay"
	class:stacked={!scrim.isBottom}
	role="presentation"
	onselectstart={guardStraySelection}
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

	/* Only the bottom-most modal paints the scrim, so stacking never
	   composites into a brighter wash — the page stays at a constant 60%.
	   Deeper overlays stay transparent and the dialogs beneath them are
	   left completely static: no class swaps, so opening/closing a stacked
	   modal never animates the one already on screen. */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: color-mix(in srgb, var(--invert-bg) 60%, transparent);
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

	.modal-overlay.stacked {
		background: transparent;
	}

	.modal-overlay :global(.modal-content) {
		background: var(--color-surface);
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-lg);
		width: 100%;
		max-width: 600px;
		max-height: 80vh;
		max-height: 85dvh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-2xl);
	}

	.modal-overlay :global(.modal-content.modal-content-full) {
		height: 100%;
	}

	.modal-overlay :global(.modal-header) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-lg);
		border-bottom: 1px solid var(--line);
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
		border-top: 1px solid var(--line);
		flex-shrink: 0;
	}

	/* Consumers always supply the footer snippet and gate its content
	 * themselves; when nothing is rendered the bar would show as an empty
	 * bordered strip. A Svelte `{#if}` leaves only a comment anchor, so
	 * "no element children" is the reliable emptiness check. */
	.modal-footer:not(:has(*)) {
		display: none;
	}

	.modal-overlay :global(.modal-title) {
		font-size: var(--text-lg);
		color: var(--color-text);
		margin: 0;
		font-weight: var(--font-semibold);
		letter-spacing: -0.01em;
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
