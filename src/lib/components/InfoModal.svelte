<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

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
			aria-label="Additional information"
			tabindex="-1"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<div class="modal-header">
				<h2>Additional Information</h2>
				<button class="close-btn" on:click={close} aria-label="Close" type="button">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
			<div class="modal-body">
				<p>
					This app doesn't include other popular distributions (<i>like, Arch Linux, Ubuntu, Debian, OpenSUSE, NixOS, Gentoo, Solus, Void, elementaryOS, EndeavourOS, Nobara, Omarchy, MX Linux, Manjaro, and so on</i>), enterprise-level distributions (<i>like, Red Hat, AlmaLinux</i>) and niche distributions (<i>like, Kali, Alpine</i>) as it's intended for complete beginners and aims to simplify the choice.
					<br /><br />
					<b>Hints for installation and dual-booting:</b><br /><br />
					1. Install Linux on a separate disk as Windows updates may break the Linux installation.<br />
					2. Don't use Windows tools to resize partitions on the disk where Linux is installed for the same reason.<br />
					3. Don't forget to create a swap file/partition, especially on systems with limited RAM.<br /><br />				
					<b>Software that I recommend.</b><br /><br />

					Browsers: Brave, Helium, Zen.<br />
					Office: OnlyOffice, LibreOffice.<br />
					Nvidia Shadow Play alternative: GPU Screen Recorder.<br />
					Torrent client: qBittorrent.<br />
					Disk analyzer: Filelight (KDE/Qt), Baobab (Gnome/GTK), gdu (command-line written in Rust).<br />
					Local AI: LM Studio (I recommend Mistral model).<br />
					Extended software support: Flatpak (Bazaar or your software center), Distrobox (DistroShelf).<br />
					Running Windows apps: Bottles, Winboat.<br />
					Cleaners: BleachBit, Stacer (not needed for immutable systems).<br />
					System Backup: Timeshift (not needed for immutable systems).<br />
					Photoshop alternatives: Photopea/GIMP/Krita/Affinity(via Bottles).<br />
					Lightroom alternative: Darktable.<br />
					Illustrator alternative: Inkscape.<br />
					Premier Pro alternative: DaVinci Resolve.<br />
					<i>Ventoy</i> for creating a bootable USB drive with multiple Linux distributions.
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
