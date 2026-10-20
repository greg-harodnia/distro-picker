<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import DistroDetails from '$lib/components/DistroDetails.svelte';
	import ScreenshotGallery from '$lib/components/ScreenshotGallery.svelte';
	import JsonLd from '$lib/components/JsonLd.svelte';
	import PageTopBar from '$lib/components/PageTopBar.svelte';
	import { TAGS } from '$lib/tagGroups';
	import { getTranslation } from '$lib/i18n/translations';
	import { t, locale, localePath, appTitle } from '$lib/i18n/locale';
	import { SITE_URL as siteUrl } from '$lib/seo';
	import { logoFlip, logoPath } from '$lib/utils/assets';

	let { data }: { data: PageData } = $props();

	// Derive, don't snapshot: on client-side navigation between two distro
	// pages Svelte reuses this component instance, so reading `data` once would
	// keep rendering the previous distro.
	let distro = $derived(data.distro);
	let screenshots = $derived(data.screenshots);

	let galleryIndex = $state<number | null>(null);

	// Derived so JSON-LD is emitted in the page's language and points at the
	// locale-prefixed URLs (`/distro/x` vs `/be/distro/x`).
	let description = $derived(getTranslation($locale, `distros.${distro.id}.description`) || '');
	let homePath = $derived(localePath('/', $locale));
	let distroPath = $derived(localePath(`/distro/${distro.id}`, $locale));

	let ldData = $derived({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: $appTitle, item: `${siteUrl}${homePath}` },
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
				image: `${siteUrl}${logoPath(distro.logo)}`,
				...(distro.website ? { sameAs: distro.website } : {}),
			},
		],
	});
</script>

<JsonLd data={ldData} />

<main class="page-shell distro-page">
	<PageTopBar backPath="/" label={$t('pages.distro.backLink')} />

	<header class="distro-header">
		<img
			class="distro-logo {logoFlip(distro.logo)}"
			src={`${base}${logoPath(distro.logo)}`}
			alt="{distro.name} logo"
			height="96"
			width="96"
			decoding="async"
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
			<div
				class="shots-wrap"
				style="--shot-panel-h: clamp(240px, 40vw, 460px); --shot-border: 1px solid var(--line); --shot-radius: var(--radius-lg)"
			>
				<ScreenshotGallery
					images={screenshots.map((s) => `${base}${s}`)}
					name={distro.name}
					onexpand={(index) => (galleryIndex = index)}
				/>
			</div>
		</section>
	{/if}

	<div class="actions">
		<a class="btn-primary" href={`${base}${localePath('/', $locale)}`}>{$t('pages.distro.findMyDistro')}</a>
		{#if distro.website}
			<a class="btn-outline" href={distro.website} rel="noopener noreferrer" target="_blank">{$t('modals.distro.visitWebsite')}</a>
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

	.actions {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	/* Link CTAs: the global button classes already apply (same class names), so
	   only the link-specific bits and the wider CTA padding are declared here. */
	.btn-primary,
	.btn-outline {
		display: inline-block;
		text-decoration: none;
		padding: var(--space-md) var(--space-xl);
	}

	.btn-outline {
		letter-spacing: normal;
	}

	@media (hover: hover) {
		.btn-outline:hover {
			background: transparent;
			color: var(--color-secondary);
			border-color: var(--color-text);
		}
	}

	@media (max-width: 640px) {
		.distro-name {
			font-size: var(--text-3xl);
		}
	}
</style>
