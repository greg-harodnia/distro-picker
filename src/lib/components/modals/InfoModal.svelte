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

<Modal {onclose} ariaLabel={gt('modals.additionalInfo.title')} contentStyle="max-width: 800px;">
	{#snippet header()}
		<h2 class="modal-title">{gt('modals.additionalInfo.title')}</h2>
	{/snippet}

	<p>
		{@html gt('modals.additionalInfo.content')}
	</p>
</Modal>

<style>
	p {
		color: var(--color-text-secondary);
		font-size: var(--text-base);
		line-height: var(--line-height-relaxed);
	}

	:global(a) {
		color: var(--color-secondary);
		font-weight: var(--font-medium);
		text-decoration: underline;
		text-decoration-color: var(--color-border);
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
		transition: color var(--transition-fast), text-decoration-color var(--transition-fast);
	}

	@media (hover: hover) {
		:global(a:hover) {
			color: var(--color-text);
			text-decoration-color: var(--color-secondary);
		}
	}

	:global(a:focus-visible) {
		outline: 2px solid var(--color-secondary);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	:global(b) {
		color: var(--color-text);
	}
</style>
