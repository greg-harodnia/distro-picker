<script lang="ts">
	import { base } from '$app/paths';
	import type { PageData } from './$types';
	import PageTopBar from '$lib/components/PageTopBar.svelte';
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

<main class="page-shell blog-page">
	<PageTopBar backPath="/" label={$t('pages.blog.backToPicker')} />

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
	.blog-header {
		width: 100%;
		max-width: var(--container-lg);
		margin-right: auto;
		margin-bottom: var(--space-2xl);
		margin-left: auto;
		text-align: center;
	}

	.blog-header h1 {
		font-size: var(--text-4xl);
		color: var(--color-secondary);
		font-weight: var(--font-bold);
		line-height: var(--line-height-tight);
		margin: 0;
		text-wrap: balance;
	}

	.empty {
		text-align: center;
		color: var(--color-text-muted);
		padding: var(--space-2xl) 0;
	}

	.post-list {
		width: 100%;
		max-width: var(--container-lg);
		min-width: 0;
		list-style: none;
		padding: 0;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.post-list > li {
		min-width: 0;
	}

	.post-card {
		display: block;
		min-width: 0;
		overflow-wrap: anywhere;
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
		text-wrap: balance;
	}

	.post-description {
		margin: 0 0 var(--space-md);
		color: var(--color-text-secondary);
		line-height: var(--line-height-normal);
		text-wrap: pretty;
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
		.blog-header {
			margin-bottom: var(--space-xl);
		}

		.blog-header h1 {
			font-size: 1.75rem;
		}

		.post-list {
			gap: 0.75rem;
		}

		.post-card {
			padding: var(--space-md);
		}

		.post-card h2 {
			font-size: 1.125rem;
		}

		.post-description {
			margin-bottom: 0.875rem;
		}

		.post-meta {
			gap: 0.75rem;
		}
	}

	@media (max-width: 380px) {
		.blog-header {
			margin-bottom: var(--space-lg);
		}

		.blog-header h1 {
			font-size: 1.625rem;
		}

		.post-list {
			gap: 0.625rem;
		}

		.post-card {
			padding: 0.875rem;
		}

		.post-card h2 {
			font-size: 1.0625rem;
		}
	}
</style>
