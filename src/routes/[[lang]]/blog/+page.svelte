<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { t, locale, localePath } from '$lib/i18n/locale';

	let { data }: { data: PageData } = $props();

	// slug -> { views, likes } for quick lookup while rendering the cards.
	let statsBySlug = $derived(new Map(data.stats.map((s) => [s.slug, s])));

	function viewsFor(slug: string): number {
		return statsBySlug.get(slug)?.views ?? 0;
	}

	function likesFor(slug: string): number {
		return statsBySlug.get(slug)?.likes ?? 0;
	}

	function formatDate(iso: string): string {
		const date = new Date(`${iso}T00:00:00Z`);
		return new Intl.DateTimeFormat($locale === 'be' ? 'be' : 'en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			timeZone: 'UTC',
		}).format(date);
	}
</script>

<main class="blog-page">
	<div class="top-bar">
		<a class="back-link" href={`${base}${localePath('/', $locale)}`}>← {$t('pages.blog.backToPicker')}</a>
		<div class="page-controls">
			<LanguageToggle />
			<ThemeToggle />
		</div>
	</div>

	<header class="blog-header">
		<h1>{$t('pages.blog.title')}</h1>
	</header>

	{#if data.posts.length === 0}
		<p class="empty">{$t('pages.blog.empty')}</p>
	{:else}
		<ul class="post-list">
			{#each data.posts as post (post.slug)}
				<li>
					<a class="post-card" href={`${base}${localePath(`/blog/${post.slug}`, $locale)}`}>
						<time datetime={post.date}>{formatDate(post.date)}</time>
						{#if post.pinned}
							<span class="pin-badge">📌 {$t('pages.blog.pinned')}</span>
						{/if}
						<h2>{post.title}</h2>
						{#if post.description}
							<p class="post-description">{post.description}</p>
						{/if}
						<div class="post-meta">
							<span class="post-stats">
								<span class="post-stat" title="{viewsFor(post.slug)} {$t('pages.blog.views')}">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
										<circle cx="12" cy="12" r="3"></circle>
									</svg>
									{viewsFor(post.slug)}
								</span>
								<span class="post-stat" title="{likesFor(post.slug)} {$t('pages.blog.likes')}">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
									</svg>
									{likesFor(post.slug)}
								</span>
							</span>
							<span class="read-more">{$t('pages.blog.readMore')} →</span>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style>
	.blog-page {
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

	.blog-header {
		text-align: center;
		margin-bottom: var(--space-2xl);
	}

	.blog-header h1 {
		font-size: var(--text-4xl);
		color: var(--color-secondary);
		font-weight: var(--font-bold);
		line-height: var(--line-height-tight);
		margin: 0;
	}

	.empty {
		text-align: center;
		color: var(--color-text-muted);
		padding: var(--space-2xl) 0;
	}

	.post-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.post-card {
		display: block;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		text-decoration: none;
		color: inherit;
		box-shadow: var(--shadow-sm);
		transition: transform var(--transition-normal), box-shadow var(--transition-normal);
	}

	@media (hover: hover) {
		.post-card:hover {
			transform: translateY(-2px);
			box-shadow: var(--shadow-md);
		}
	}

	.post-card time {
		display: block;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-bottom: var(--space-sm);
	}

	.pin-badge {
		display: inline-block;
		margin-bottom: var(--space-sm);
		padding: 2px var(--space-sm);
		font-size: var(--text-xs);
		font-weight: var(--font-semibold);
		color: var(--color-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-background);
	}

	.post-card h2 {
		font-size: var(--text-xl);
		color: var(--color-secondary);
		margin: 0 0 var(--space-sm);
		line-height: var(--line-height-tight);
	}

	.post-description {
		margin: 0 0 var(--space-md);
		color: var(--color-text-secondary);
		line-height: var(--line-height-normal);
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.post-stats {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.post-stat {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: var(--text-xs);
		font-weight: var(--font-semibold);
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.read-more {
		margin-left: auto;
		font-weight: var(--font-semibold);
		color: var(--color-secondary);
	}

	@media (max-width: 640px) {
		.blog-page {
			padding: var(--space-lg);
		}

		.blog-header h1 {
			font-size: var(--text-3xl);
		}

		.post-card {
			padding: var(--space-md);
		}
	}
</style>