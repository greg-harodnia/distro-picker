<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { locale } from '$lib/i18n/locale';
	import { getTranslation } from '$lib/i18n/translations';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	$: lang = $locale;

	function gt(path: string): string {
		return getTranslation(lang, path);
	}

	function close() {
		dispatch('close');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			close();
		}
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			close();
		}
	}

	onMount(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		}
		return () => {
			document.body.style.overflow = '';
		};
	});

	$: if (isOpen) {
		document.body.style.overflow = 'hidden';
	} else {
		document.body.style.overflow = '';
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div 
		class="modal-overlay" 
		on:click={handleOverlayClick} 
		on:keydown={handleKeydown} 
		role="button" 
		tabindex="0"
		transition:fade={{ duration: 200 }}
	>
		<div 
			class="modal-content" 
			role="dialog" 
			aria-modal="true" 
			aria-label={gt('modal.additionalInfo')}
			tabindex="-1"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<div class="modal-header">
				<h2>{gt('modal.additionalInfo')}</h2>
				<button class="close-btn" on:click={close} aria-label={gt('modal.close')} type="button">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
			<div class="modal-body">
				<p>
					{@html gt('modal.additionalContent.intro')}
					<br /><br />
					<b>{gt('modal.additionalContent.installationTitle')}</b><br /><br />
					1. {gt('modal.additionalContent.hint1')}<br />
					2. {gt('modal.additionalContent.hint2')}<br />
					3. {gt('modal.additionalContent.hint3')}<br /><br />				
					<b>{gt('modal.additionalContent.softwareTitle')}</b><br /><br />

					{gt('modal.additionalContent.browsers')}<br />
					{gt('modal.additionalContent.office')}<br />
					{gt('modal.additionalContent.torrent')}<br />
					{gt('modal.additionalContent.diskAnalyzer')}<br />
					{gt('modal.additionalContent.localAI')}<br />
					{gt('modal.additionalContent.softwareSupport')}<br />
					{gt('modal.additionalContent.windowsApps')}<br />
					{gt('modal.additionalContent.cleaners')}<br />
					{gt('modal.additionalContent.backup')}<br />
					{gt('modal.additionalContent.nvidia')}<br />
					{gt('modal.additionalContent.photoshop')}<br />
					{gt('modal.additionalContent.lightroom')}<br />
					{gt('modal.additionalContent.illustrator')}<br />
					{gt('modal.additionalContent.premier')}<br />
					{@html gt('modal.additionalContent.ventoy')}
				</p>
			</div>
		</div>
	</div>
{/if}

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

	.modal-content {
		background: var(--color-surface);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		width: 100%;
		max-width: 800px;
		max-height: 80vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.modal-header h2 {
		font-size: var(--text-xl);
		color: var(--color-secondary);
		margin: 0;
		font-weight: var(--font-semibold);
	}

	.close-btn {
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
	}

	.close-btn:hover {
		background: var(--color-background-secondary);
		color: var(--color-secondary);
	}

	.modal-body {
		padding: 0 var(--space-lg);
		overflow-y: auto;
	}

	.modal-body p {
		color: var(--color-text-secondary);
		font-size: var(--text-base);
		line-height: var(--line-height-relaxed);
	}

	.modal-body :global(b) {
		color: var(--color-text);
	}
</style>
