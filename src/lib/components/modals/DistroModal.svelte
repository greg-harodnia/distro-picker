<script lang="ts">
	import type { Distro, Tag } from "$lib/types";
	import { base } from '$app/paths';
	import { sanitizeUrl } from "$lib/utils";
	import Modal from "./Modal.svelte";
	import GalleryModal from "./GalleryModal.svelte";
	import ScreenshotGallery from "$lib/components/ScreenshotGallery.svelte";
	import DistroDetails from "$lib/components/DistroDetails.svelte";
	import { t, locale, localePath } from "$lib/i18n/locale";

	let {
		distro,
		tags = [],
		screenshots = [],
		onclose = () => {},
	}: {
		distro: Distro;
		tags?: Tag[];
		screenshots?: string[];
		onclose?: () => void;
	} = $props();

	let galleryIndex = $state<number | null>(null);

	let fullPageUrl = $derived(`${base}${localePath(`/distro/${distro.id}`, $locale)}`);

	function visitWebsite() {
		const sanitizedUrl = sanitizeUrl(distro.website);
		if (sanitizedUrl !== "#") {
			window.open(sanitizedUrl, "_blank", "noopener,noreferrer");
		}
	}
</script>

{#snippet media()}
	<ScreenshotGallery
		images={screenshots}
		name={distro.name}
		onexpand={(index) => (galleryIndex = index)}
	/>
{/snippet}

<Modal
	{onclose}
	ariaLabel={distro.name}
	contentClass="distro-modal"
	media={screenshots.length > 0 ? media : undefined}
>
	{#snippet header()}
		<h2 class="modal-title">{distro.name}</h2>
		<a
			class="full-page-link"
			href={fullPageUrl}
			aria-label={`Open ${distro.name} full page`}
			title="Open full page"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
				<polyline points="15 3 21 3 21 9"></polyline>
				<line x1="10" y1="14" x2="21" y2="3"></line>
			</svg>
		</a>
	{/snippet}

	<DistroDetails {tags} {distro} />

	{#snippet footer()}
	<div class="buttons">
		<button
			class="website-btn"
			onclick={visitWebsite}
			aria-label={`Visit ${distro.name} website`}
			type="button"
		>
			{$t('modals.distro.visitWebsite')}
		</button>

		{#if screenshots.length > 0}
			<button
				class="gallery-btn"
				onclick={() => (galleryIndex = 0)}
				aria-label={`View ${distro.name} screenshots`}
				type="button"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
					<circle cx="8.5" cy="8.5" r="1.5"></circle>
					<polyline points="21 15 16 10 5 21"></polyline>
				</svg>
			</button>
		{/if}
	</div>
	{/snippet}
</Modal>

{#if galleryIndex !== null}
	<GalleryModal
		images={screenshots}
		distroName={distro.name}
		initialIndex={galleryIndex}
		onclose={() => (galleryIndex = null)}
	/>
{/if}

<style>
	:global(.modal-overlay .modal-content.distro-modal) {
		max-width: 720px;
	}

	@media (min-width: 900px) {
		:global(.modal-overlay .modal-content.distro-modal) {
			max-width: 1040px;
		}
	}

	:global(.distro-modal .modal-header) {
		justify-content: space-between;
		gap: var(--space-sm);
	}

	:global(.distro-modal .modal-title) {
		text-align: left;
		font-size: var(--text-lg);
		flex: 1;
	}

	.full-page-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		flex-shrink: 0;
		color: var(--color-text-muted);
		border-radius: var(--radius-full);
		transition: all var(--transition-normal);
	}

	.full-page-link svg {
		flex-shrink: 0;
	}

	@media (hover: hover) {
		.full-page-link:hover {
			background: var(--color-background-secondary);
			color: var(--color-secondary);
		}
	}

	.buttons {
		display: flex;
		height: 56px;
	}

	.buttons > button {
		background: var(--color-secondary);
		color: var(--color-background);
		border: 1px solid var(--color-secondary);
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		font-weight: var(--font-medium);
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	.website-btn {
		flex: 1;
		padding: var(--space-md) var(--space-xl);
		text-align: center;
	}

	.gallery-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		margin-left: var(--space-md);
		flex-shrink: 0;
	}

	.gallery-btn svg {
		flex-shrink: 0;
	}

	@media (hover: hover) {
		.buttons > button:hover {
			background: var(--accent);
			border-color: var(--accent);
			color: #fff;
		}
	}

	@media (max-width: 640px) {
		.buttons {
			height: 44px;
		}

		.buttons > button {
			border-radius: var(--radius-sm);
		}

		.website-btn {
			padding: var(--space-sm) var(--space-md);
		}

		.gallery-btn {
			width: 44px;
			margin-left: var(--space-sm);
		}
	}
</style>
