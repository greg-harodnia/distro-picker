<script lang="ts">
	import { t } from '$lib/i18n/locale';
	import Modal from './Modal.svelte';

	interface Props {
		onclose?: () => void;
	}

	let { onclose = () => {} }: Props = $props();
	let copied = $state(false);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(window.location.href);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
	}
</script>

<Modal {onclose} ariaLabel={$t('share.title') || ''}>
	{#snippet header()}
		<h2 class="modal-title">{$t('share.title')}</h2>
	{/snippet}

	<div class="share-content">
		<p>{$t('share.text')}</p>
		<button class="btn-primary" onclick={copyLink} type="button">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
				<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
			</svg>
			{copied ? $t('share.copied') : $t('share.copyLink')}
		</button>
	</div>
</Modal>

<style>
	.share-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-lg);
	}

	.share-content p {
		font-size: var(--text-lg);
		color: var(--color-text-primary);
		text-align: center;
	}

	.share-content button {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}
</style>
