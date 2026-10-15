<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import DistroDetails from '$lib/components/DistroDetails.svelte';
	import PageTopBar from '$lib/components/PageTopBar.svelte';
	import { TAGS } from '$lib/tagGroups';
	import { getTranslation } from '$lib/i18n/translations';
	import { t, locale, localePath } from '$lib/i18n/locale';
	import { SITE_URL as siteUrl } from '$lib/seo';
	import { logoContrast } from '$lib/utils/logoContrast';

	let { data }: { data: PageData } = $props();

	const distro = data.distro;
	const screenshots = data.screenshots;

	let galleryIndex = $state<number | null>(null);

	// Derived so JSON-LD is emitted in the page's language and points at the
	// locale-prefixed URLs (`/distro/x` vs `/be/distro/x`).
	let description = $derived(getTranslation($locale, `distros.${distro.id}.description`) || '');
	let homePath = $derived(localePath('/', $locale));
	let distroPath = $derived(localePath(`/distro/${distro.id}`, $locale));

	let ldJson = $derived(
		JSON.stringify(
			{
				'@context': 'https://schema.org',
				'@graph': [
					{
						'@type': 'BreadcrumbList',
						itemListElement: [
							{ '@type': 'ListItem', position: 1, name: $t('app.title') || 'Linux Distro Picker', item: `${siteUrl}${homePath}` },
							{ '@type': 'ListItem', position: 2, name: distro.name, item: `${siteUrl}${distroPath}` },
						],
					},
					{
						'@type': 'SoftwareApplication',
						name: distro.name,
						url: `${siteUrl}${distroPath}`,
						applicationCategory: 'OperatingSystem',
						operatingSystem: 'Linux',
						description,
						inLanguage: $locale,
						image: `${siteUrl}${distro.logo || '/linux.webp'}`,
						...(distro.website ? { sameAs: distro.website } : {}),
					},
				],
			},
			null,
			2
		)
	);
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${ldJson}</script>`}
</svelte:head>

<main class="page-shell distro-page">
	<PageTopBar backPath="/" label={$t('pages.distro.backLink')} />

	<header class="distro-header">
		<img
			class="distro-logo"
			src={`${base}${distro.logo || '/linux.webp'}`}
			alt="{distro.name} logo"
			height="96"
			width="96"
			use:logoContrast={distro.logo || '/linux.webp'}
		/>
		<h1 class="distro-name">{distro.name}</h1>
		{#if distro.popular || distro.in_development}
			<p class="badges">
			{#if distro.popular}<span class="badge mono-label">🔥 {$t('pages.distro.popular')}</span>{/if}
			{#if distro.in_development}<span class="badge mono-label">🚧 {$t('pages.distro.inDevelopment')}</span>{/if}
			</p>
		{/if}
	</header>

	<div class="details-wrap">
		<DistroDetails {distro} tags={TAGS} />
	</div>

	{#if screenshots.length > 0}
		<section class="screenshots" aria-label={$t('pages.distro.screenshots')}>
			<h2 class="mono-label">{$t('pages.distro.screenshots')}</h2>
			<div class="screenshot-grid">
				{#each screenshots as screenshot, i}
					<button
						class="screenshot-btn"
						onclick={() => galleryIndex = i}
						aria-label="{$t('pages.distro.screenshots')} {i + 1} of {distro.name}"
						type="button"
					>
						<img src={`${base}${screenshot}`} alt="Screenshot {i + 1} of {distro.name}" loading="lazy" />
					</button>
				{/each}
			</div>
		</section>
	{/if}

	<div class="actions">
		<a class="btn-primary" href={`${base}${localePath('/', $locale)}`}>{$t('pages.distro.findMyDistro')}</a>
		{#if distro.website}
			<a class="btn-secondary" href={distro.website} rel="noopener noreferrer" target="_blank">{$t('modals.distro.visitWebsite')}</a>
		{/if}
	</div>
</main>

{#if galleryIndex !== null}
	{#await import('$lib/components/modals/GalleryModal.svelte') then { default: GalleryModal }}
		<GalleryModal
			images={screenshots}
			distroName={distro.name}
			initialIndex={galleryIndex}
			onclose={() => galleryIndex = null}
		/>
	{/await}
{/if}

<style>
	.distro-header {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-md);
		padding-bottom: var(--space-lg);
		border-bottom: 1px solid var(--line);
		margin-bottom: var(--space-2xl);
	}

	.distro-logo {
		width: 80px;
		height: 80px;
		object-fit: contain;
	}

	.distro-name {
		font-size: clamp(2.25rem, 6vw, 4rem);
		letter-spacing: -0.035em;
		line-height: 1.02;
		color: var(--color-text);
		margin: 0;
	}

	.badges {
		margin: 0;
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.badge {
		color: var(--color-text-secondary);
		border: 1px solid var(--line);
		border-radius: var(--radius-full);
		padding: var(--space-2xs) var(--space-sm);
	}

	.details-wrap {
		max-width: 46rem;
		margin-bottom: var(--space-2xl);
	}

	.screenshots {
		margin-bottom: var(--space-2xl);
	}

	h2 {
		margin: 0 0 var(--space-lg);
	}

	.screenshot-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: var(--space-md);
	}

	.screenshot-btn {
		padding: 0;
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background: var(--color-background-secondary);
		cursor: pointer;
		overflow: hidden;
		transition: border-color var(--transition-normal);
	}

	@media (hover: hover) {
		.screenshot-btn:hover {
			border-color: var(--color-text);
		}
	}

	.screenshot-btn img {
		width: 100%;
		height: 160px;
		object-fit: cover;
		display: block;
	}

	.actions {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.btn-primary,
	.btn-secondary {
		display: inline-block;
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		font-weight: var(--font-medium);
		text-decoration: none;
		transition: all var(--transition-normal);
	}

	.btn-primary {
		background: var(--color-secondary);
		border: 1px solid var(--color-secondary);
		color: var(--color-background);
	}

	.btn-secondary {
		background: transparent;
		border: 1px solid var(--line-strong);
		color: var(--color-secondary);
	}

	@media (hover: hover) {
		.btn-primary:hover {
			background: var(--accent);
			border-color: var(--accent);
			color: #fff;
		}

		.btn-secondary:hover {
			border-color: var(--color-text);
		}
	}

	@media (max-width: 640px) {
		.distro-name {
			font-size: var(--text-3xl);
		}

		.screenshot-btn img {
			height: 120px;
		}
	}
</style>
