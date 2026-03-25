<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { locale } from '$lib/i18n/locale';
	import { getTranslation } from '$lib/i18n/translations';
	import { lockBodyScroll } from '$lib/utils/body';
	import CloseIcon from './icons/CloseIcon.svelte';

	interface Props {
		onclose?: () => void;
	}
	let { onclose = () => {} }: Props = $props();

	let lang = $derived($locale);

	function gt(path: string): string {
		return getTranslation(lang, path) ?? '';
	}

	function close() {
		onclose();
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
		role="dialog" 
		aria-modal="true" 
		aria-label={gt('modal.additionalInfo')}
		tabindex="-1"
	>
		<div class="modal-header">
			<h2 class="modal-title">{gt('modal.additionalInfo')}</h2>
			<button class="close-btn" onclick={close} aria-label={gt('modal.close')} type="button">
				<CloseIcon />
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

<style>
	.modal-content {
		max-width: 800px;
	}

	.modal-body {
		padding: var(--space-lg);
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
