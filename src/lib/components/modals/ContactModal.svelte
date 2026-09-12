<script lang="ts">
	import { t } from '$lib/i18n/locale';
	import Modal from './Modal.svelte';
	import { sendMessage } from '$lib/supabase';

	interface Props {
		onclose?: () => void;
	}

	let { onclose = () => {} }: Props = $props();
	let name = $state('');
	let email = $state('');
	let message = $state('');
	let sending = $state(false);
	let sent = $state(false);
	let errorMsg = $state('');

	async function handleSend() {
		if (!name.trim() || !email.trim() || !message.trim()) return;

		sending = true;
		errorMsg = '';

		try {
			const ok = await sendMessage(name.trim(), email.trim(), message.trim());
			if (ok) {
				sent = true;
			} else {
				errorMsg = $t('modals.contact.error');
			}
		} catch {
			errorMsg = $t('modals.contact.error');
		} finally {
			sending = false;
		}
	}
</script>

<Modal {onclose} ariaLabel={$t('modals.contact.title') || ''}>
	{#snippet header()}
		<h2 class="modal-title">{$t('modals.contact.title')}</h2>
	{/snippet}

	<div class="contact-content">
		{#if sent}
			<p class="success-text">{$t('modals.contact.success')}</p>
		{:else}
			<p class="intro-text">{$t('modals.contact.intro')}</p>

			{#if errorMsg}
				<p class="error-text">{errorMsg}</p>
			{/if}

			<form onsubmit={(e) => { e.preventDefault(); handleSend(); }}>
				<label>
					<span>{$t('modals.contact.name')}</span>
					<input
						type="text"
						bind:value={name}
						required
						disabled={sending}
						placeholder={$t('modals.contact.name')}
					/>
				</label>

				<label>
					<span>{$t('modals.contact.email')}</span>
					<input
						type="email"
						bind:value={email}
						required
						disabled={sending}
						placeholder={$t('modals.contact.email')}
					/>
				</label>

				<label>
					<span>{$t('modals.contact.message')}</span>
					<textarea
						bind:value={message}
						required
						disabled={sending}
						rows="5"
						placeholder={$t('modals.contact.message')}
					></textarea>
				</label>

				<button class="btn-primary submit-btn" type="submit" disabled={sending || !name.trim() || !email.trim() || !message.trim()}>
					{#if sending}
						{$t('modals.contact.sending')}
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="22" y1="2" x2="11" y2="13"></line>
							<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
						</svg>
						{$t('modals.contact.send')}
					{/if}
				</button>
			</form>
		{/if}
	</div>
</Modal>

<style>
	.contact-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg);
		padding: var(--space-lg);
	}

	.intro-text {
		font-size: var(--text-lg);
		color: var(--color-text-primary);
		text-align: center;
	}

	.success-text {
		font-size: var(--text-lg);
		color: var(--color-best);
		text-align: center;
		font-weight: var(--font-semibold);
	}

	.error-text {
		font-size: var(--text-sm);
		color: #ef4444;
		text-align: center;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		width: 100%;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	label span {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		font-weight: var(--font-medium);
	}

	input, textarea {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-background);
		color: var(--color-text-primary);
		font-family: inherit;
		font-size: var(--text-base);
		transition: border-color var(--transition-normal);
		box-sizing: border-box;
	}

	input:focus, textarea:focus {
		outline: none;
		border-color: var(--color-secondary);
	}

	textarea {
		resize: vertical;
		min-height: 100px;
	}

	.submit-btn {
		align-self: center;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-top: var(--space-sm);
	}

	@media (max-width: 640px) {
		.contact-content {
			gap: var(--space-md);
			padding: var(--space-md);
		}
	}
</style>
