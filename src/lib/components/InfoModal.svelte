<script lang="ts">
	import { locale } from '$lib/i18n/locale';
	import { getTranslation } from '$lib/i18n/translations';
	import Modal from './Modal.svelte';

	interface Props {
		onclose?: () => void;
	}
	let { onclose = () => {} }: Props = $props();

	let lang = $derived($locale);

	function gt(path: string): string {
		return getTranslation(lang, path) ?? '';
	}
</script>

<Modal {onclose} ariaLabel={gt('modal.additionalInfo')} contentStyle="max-width: 800px;">
	{#snippet header()}
		<h2 class="modal-title">{gt('modal.additionalInfo')}</h2>
	{/snippet}

	<p>
		{@html gt('modal.additionalContent.intro')}
		<br /><br />
		<b>{gt('modal.additionalContent.installationTitle')}</b><br /><br />
		1. {gt('modal.additionalContent.hint1')}<br />
		2. {gt('modal.additionalContent.hint2')}<br />
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
</Modal>

<style>
	p {
		color: var(--color-text-secondary);
		font-size: var(--text-base);
		line-height: var(--line-height-relaxed);
	}

	:global(b) {
		color: var(--color-text);
	}
</style>
