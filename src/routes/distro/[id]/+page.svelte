<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import DistroDetails from '$lib/components/DistroDetails.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import tagsData from '$lib/tags.json';
	import { getTranslation } from '$lib/i18n/translations';
	import { t } from '$lib/i18n/locale';
	import { SITE_URL as siteUrl } from '$lib/seo';

	let { data }: { data: PageData } = $props();

	const distro = data.distro;
	const screenshots = data.screenshots;

	const description = getTranslation('en', `distros.${distro.id}.description`) || '';

	let galleryIndex = $state<number | null>(null);

	const ldJson = JSON.stringify({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'BreadcrumbList',
				itemListElement: [
					{ '@type': 'ListItem', position: 1, name: 'Linux Distro Picker', item: `${siteUrl}/` },
					{ '@type': 'ListItem', position: 2, name: distro.name, item: `${siteUrl}/distro/${distro.id}` },
				],
			},
			{
				'@type': 'SoftwareApplication',
				name: distro.name,
				url: `${siteUrl}/distro/${distro.id}`,
				applicationCategory: 'OperatingSystem',
				operatingSystem: 'Linux',
				description,
				image: `${siteUrl}${distro.logo || '/linux.webp'}`,
				...(distro.website ? { sameAs: distro.website } : {}),
			},
		],
	}, null, 2);
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${ldJson}</script>`}
</svelte:head>

<main class="distro-page">
	<div class="top-bar">
		<a class="back-link" href={`${base}/`}>← {$t('pages.distro.backLink')}</a>
		<div class="page-controls">
			<LanguageToggle />
			<ThemeToggle />
		</div>
	</div>

	<header class="distro-header">
		<img class="distro-logo" src={`${base}${distro.logo || '/linux.webp'}`} alt="{distro.name} logo" height="96" width="96" />
		<h1 class="distro-name">{distro.name}</h1>
		{#if distro.best || distro.popular || distro.hidden_gem || distro.in_development}
			<p class="badges">
				{#if distro.best}<span class="badge">👑 {$t('pages.distro.recommended')}</span>{/if}
				{#if distro.popular}<span class="badge">🔥 {$t('pages.distro.popular')}</span>{/if}
				{#if distro.hidden_gem}<span class="badge">💎 {$t('pages.distro.hiddenGem')}</span>{/if}
				{#if distro.in_development}<span class="badge">🚧 {$t('pages.distro.inDevelopment')}</span>{/if}
			</p>
		{/if}
	</header>

	<div class="details-wrap">
		<DistroDetails {distro} tags={tagsData.tags} />
	</div>

	{#if screenshots.length > 0}
		<section class="screenshots" aria-label={$t('pages.distro.screenshots')}>
			<h2>{$t('pages.distro.screenshots')}</h2>
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
		<a class="btn-primary" href={`${base}/`}>{$t('pages.distro.findMyDistro')}</a>
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
	.distro-page {
		max-width: var(--container-xl);
		margin: 0 auto;
		padding: var(--space-xl);
	}

	.top-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-xl);
		gap: var(--space-md);
	}

	.back-link {
		color: var(--color-secondary);
		text-decoration: none;
		font-weight: var(--font-medium);
	}

	@media (hover: hover) {
		.back-link:hover {
			text-decoration: underline;
		}
	}

	.page-controls {
		display: flex;
		gap: var(--space-sm);
		flex-shrink: 0;
	}

	.distro-header {
		text-align: center;
		margin-bottom: var(--space-2xl);
	}

	.distro-logo {
		width: 96px;
		height: 96px;
		object-fit: contain;
		margin-bottom: var(--space-md);
	}

	.distro-name {
		font-size: var(--text-4xl);
		color: var(--color-secondary);
		line-height: var(--line-height-tight);
		margin: 0 0 var(--space-md);
	}

	.badges {
		margin: 0 0 var(--space-md);
		display: flex;
		gap: var(--space-sm);
		justify-content: center;
		flex-wrap: wrap;
	}

	.badge {
		font-size: var(--text-sm);
	}

	.details-wrap {
		margin-bottom: var(--space-2xl);
	}

	.screenshots {
		margin-bottom: var(--space-2xl);
	}

	h2 {
		font-size: var(--text-2xl);
		color: var(--color-secondary);
		font-weight: var(--font-semibold);
		margin: 0 0 var(--space-lg);
	}

	.screenshot-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: var(--space-md);
	}

	.screenshot-btn {
		padding: 0;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-background-secondary);
		cursor: pointer;
		overflow: hidden;
		transition: all var(--transition-normal);
	}

	@media (hover: hover) {
		.screenshot-btn:hover {
			border-color: var(--color-primary);
			box-shadow: var(--shadow-lg);
			transform: translateY(-2px);
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
		justify-content: center;
	}

	.btn-primary,
	.btn-secondary {
		display: inline-block;
		padding: var(--space-md) var(--space-xl);
		border-radius: var(--radius-md);
		font-size: var(--text-base);
		font-weight: var(--font-semibold);
		text-decoration: none;
		transition: all var(--transition-normal);
	}

	.btn-primary {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		border: none;
		color: var(--color-background);
	}

	.btn-secondary {
		background: var(--color-background-secondary);
		border: 1px solid var(--color-border);
		color: var(--color-secondary);
	}

	@media (hover: hover) {
		.btn-primary:hover,
		.btn-secondary:hover {
			transform: translateY(-2px);
			box-shadow: var(--shadow-lg);
		}
	}

	@media (max-width: 640px) {
		.distro-page {
			padding: var(--space-lg);
		}

		.distro-name {
			font-size: var(--text-3xl);
		}

		.screenshot-btn img {
			height: 120px;
		}
	}
</style>
