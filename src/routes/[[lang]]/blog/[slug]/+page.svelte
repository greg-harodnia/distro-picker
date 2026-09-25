<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import BackLink from '$lib/components/BackLink.svelte';
	import PageTopBar from '$lib/components/PageTopBar.svelte';
	import { t, locale, localePath } from '$lib/i18n/locale';
	import { fetchBlogStats, addBlogView, setBlogLikes } from '$lib/supabase';
	import { SITE_URL as siteUrl } from '$lib/seo';

	let { data }: { data: PageData } = $props();

	const post = $derived(data.post);

	let views = $state(0);
	let likes = $state(0);
	let userLiked = $state(false);
	let liking = $state(false);

	function formatDate(iso: string): string {
		const date = new Date(`${iso}T00:00:00Z`);
		return new Intl.DateTimeFormat($locale === 'be' ? 'be' : 'en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			timeZone: 'UTC',
		}).format(date);
	}

	function readLikedState(): boolean {
		try {
			const set = JSON.parse(localStorage.getItem('blog_likes') || '[]');
			return Array.isArray(set) && set.includes(post.slug);
		} catch {
			return false;
		}
	}

	function persistLikedState(liked: boolean) {
		try {
			const set = JSON.parse(localStorage.getItem('blog_likes') || '[]');
			const next = Array.isArray(set) ? new Set(set) : new Set<string>();
			if (liked) next.add(post.slug);
			else next.delete(post.slug);
			localStorage.setItem('blog_likes', JSON.stringify([...next]));
		} catch {
			// storage unavailable — like state just isn't remembered
		}
	}

	onMount(async () => {
		userLiked = readLikedState();

		const stats = await fetchBlogStats(post.slug);
		views = stats?.views ?? 0;
		likes = stats?.likes ?? 0;

		// Count one view per browser session. If the stats DB is unreachable
		// (e.g. the `blog_posts` table is missing), at least count this
		// visitor locally so the counter never shows 0 after their visit.
		try {
			if (sessionStorage.getItem(`blog_view_${post.slug}`)) return;
			const next = await addBlogView(post.slug);
			if (next) {
				views = next.views;
				likes = next.likes;
			} else {
				views += 1;
			}
			sessionStorage.setItem(`blog_view_${post.slug}`, '1');
		} catch {
			views += 1;
		}
	});

	async function toggleLike() {
		if (liking) return;
		liking = true;

		userLiked = !userLiked;
		const nextCount = userLiked ? likes + 1 : Math.max(0, likes - 1);
		likes = nextCount;
		persistLikedState(userLiked);

		// Fire-and-forget: on failure we keep the optimistic local count.
		await setBlogLikes(post.slug, nextCount);
		liking = false;
	}

	let blogPath = $derived(localePath(`/blog/${post.slug}`, $locale));

	let ldJson = $derived(
		JSON.stringify(
			{
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				mainEntityOfPage: `${siteUrl}${blogPath}`,
				headline: post.meta.title,
				description: post.meta.description,
				datePublished: post.meta.date,
				inLanguage: post.lang,
			},
			null,
			2
		)
	);
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${ldJson}</script>`}
</svelte:head>

<main class="page-shell post-page">
	<PageTopBar backPath="/blog" label={$t('pages.blog.backToBlog')} />

	<article class="post">
		<header class="post-header">
			<h1>{post.meta.title}</h1>
			<p class="post-info">
				<time datetime={post.meta.date}>{$t('pages.blog.publishedOn')}: {formatDate(post.meta.date)}</time>
			</p>
		</header>

		<div class="blog-prose">
			{@html post.contentHtml}
		</div>

		<footer class="post-footer">
			<div class="stats">
				<span class="stat" title="views">
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
						<circle cx="12" cy="12" r="3"></circle>
					</svg>
					{views}
				</span>
				<button class="like-btn" class:liked={userLiked} onclick={toggleLike} type="button" aria-pressed={userLiked}>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={userLiked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
					</svg>
					<span>{likes}</span>
					<span class="like-label">{userLiked ? $t('pages.blog.liked') : $t('pages.blog.like')}</span>
				</button>
			</div>
			<BackLink path="/" label={$t('pages.blog.backToPicker')} variant="footer" />
		</footer>
	</article>
</main>

<style>
	.post {
		width: 100%;
		max-width: var(--container-md);
		min-width: 0;
		margin: 0 auto;
	}

	.post-header {
		margin-bottom: var(--space-2xl);
	}

	.post-header h1 {
		font-size: var(--text-3xl);
		color: var(--color-secondary);
		font-weight: var(--font-bold);
		line-height: var(--line-height-tight);
		margin: 0 0 var(--space-md);
		overflow-wrap: anywhere;
		text-wrap: balance;
	}

	.post-info {
		margin: 0;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	/* ---- rendered markdown ----
	   Content comes from `{@html}`, so descendants must be `:global()` —
	   otherwise Svelte treats these selectors as unused and drops them. */

	.blog-prose {
		min-width: 0;
		font-size: var(--text-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		overflow-wrap: break-word;
	}

	.blog-prose :global(:first-child) {
		margin-top: 0;
	}

	.blog-prose :global(h1),
	.blog-prose :global(h2),
	.blog-prose :global(h3),
	.blog-prose :global(h4),
	.blog-prose :global(h5),
	.blog-prose :global(h6) {
		color: var(--color-secondary);
		line-height: var(--line-height-tight);
		margin: 2rem 0 var(--space-md);
		overflow-wrap: anywhere;
		text-wrap: balance;
	}

	.blog-prose :global(h1) {
		font-size: 2rem;
	}

	.blog-prose :global(h2) {
		font-size: 1.5rem;
	}

	.blog-prose :global(h3) {
		font-size: 1.25rem;
	}

	.blog-prose :global(h4) {
		font-size: 1.125rem;
	}

	.blog-prose :global(h5) {
		font-size: 1rem;
	}

	.blog-prose :global(h6) {
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.blog-prose :global(p) {
		margin: 0 0 var(--space-lg);
	}

	.blog-prose :global(a) {
		color: var(--color-primary-dark);
		text-decoration: underline;
		text-underline-offset: 2px;
		overflow-wrap: anywhere;
	}

	.blog-prose :global(a:hover) {
		color: var(--color-secondary);
	}

	.blog-prose :global(ul),
	.blog-prose :global(ol) {
		margin: 0 0 var(--space-lg);
		padding-left: 1.75rem;
	}

	.blog-prose :global(li) {
		margin-bottom: var(--space-xs);
	}

	.blog-prose :global(li:last-child) {
		margin-bottom: 0;
	}

	.blog-prose :global(blockquote) {
		margin: 0 0 var(--space-lg);
		padding: var(--space-sm) var(--space-lg);
		border-left: 4px solid var(--color-primary-dark);
		background: var(--color-background-secondary);
		border-radius: 0 var(--radius-md) var(--radius-md) 0;
		color: var(--color-text-secondary);
	}

	.blog-prose :global(blockquote) :global(p:last-child) {
		margin-bottom: 0;
	}

	.blog-prose :global(code) {
		font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
		font-size: 0.875em;
		background: var(--color-background-secondary);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		overflow-wrap: anywhere;
	}

	.blog-prose :global(pre) {
		max-width: 100%;
		margin: 0 0 var(--space-lg);
		padding: var(--space-lg);
		/* Fixed dark palette on purpose: the previous `-secondary-dark` /
		   `-primary-light` variables flip to light colors in dark mode,
		   producing washed-out code blocks. A code block stays dark in both
		   themes so syntax always reads clearly. */
		background: #0d1117;
		color: #e6edf3;
		border: 1px solid #30363d;
		border-radius: var(--radius-md);
		overflow-x: auto;
	}

	.blog-prose :global(pre code) {
		background: transparent;
		padding: 0;
		font-size: var(--text-sm);
		color: inherit;
		overflow-wrap: normal;
		white-space: pre;
	}

	.blog-prose :global(.table-scroll) {
		max-width: 100%;
		margin: 0 0 var(--space-lg);
		overflow-x: auto;
		overscroll-behavior-inline: contain;
		-webkit-overflow-scrolling: touch;
		border-radius: var(--radius-sm);
	}

	.blog-prose :global(.table-scroll:focus-visible) {
		outline: 2px solid var(--color-primary-dark);
		outline-offset: 2px;
	}

	.blog-prose :global(table) {
		width: 100%;
		min-width: 36rem;
		border-collapse: collapse;
		margin: 0;
		font-size: var(--text-base);
	}

	.blog-prose :global(th),
	.blog-prose :global(td) {
		border: 1px solid var(--color-border);
		padding: var(--space-sm) var(--space-md);
		text-align: left;
		vertical-align: top;
	}

	.blog-prose :global(th) {
		background: var(--color-background-secondary);
		color: var(--color-secondary);
		font-weight: var(--font-semibold);
	}

	.blog-prose :global(img) {
		display: block;
		max-width: 100%;
		height: auto;
		border-radius: var(--radius-md);
	}

	.blog-prose :global(hr) {
		border: none;
		border-top: 1px solid var(--color-border);
		margin: var(--space-2xl) 0;
	}

	/* ---- footer stats ---- */

	.post-footer {
		margin-top: var(--space-2xl);
		padding-top: var(--space-xl);
		border-top: 1px solid var(--color-border);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.stats {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	.stat {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-full);
		background: var(--color-background-secondary);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
	}

	.like-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		min-height: 44px;
		padding: var(--space-sm) var(--space-md);
		border: none;
		border-radius: var(--radius-full);
		background: var(--color-background-secondary);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	.like-btn.liked {
		background: #fde8e8;
		color: #c53030;
	}

	@media (hover: hover) {
		.like-btn:hover {
			background: var(--color-border);
		}

		.like-btn.liked:hover {
			background: #fbd5d5;
		}
	}

	@media (max-width: 640px) {
		.post-header {
			margin-bottom: var(--space-xl);
		}

		.post-header h1 {
			font-size: 1.75rem;
		}

		.blog-prose {
			font-size: var(--text-base);
			line-height: 1.7;
		}

		.blog-prose :global(h1),
		.blog-prose :global(h2),
		.blog-prose :global(h3),
		.blog-prose :global(h4),
		.blog-prose :global(h5),
		.blog-prose :global(h6) {
			margin: 2rem 0 var(--space-sm);
		}

		.blog-prose :global(h1) {
			font-size: 1.75rem;
		}

		.blog-prose :global(h2) {
			font-size: 1.375rem;
		}

		.blog-prose :global(h3) {
			font-size: 1.1875rem;
		}

		.blog-prose :global(h4) {
			font-size: 1.0625rem;
		}

		.blog-prose :global(h6) {
			font-size: 0.8125rem;
		}

		.blog-prose :global(p) {
			margin-bottom: 1.25rem;
		}

		.blog-prose :global(ul),
		.blog-prose :global(ol) {
			margin-bottom: 1.25rem;
			padding-left: 1.25rem;
		}

		.blog-prose :global(li) {
			margin-bottom: 0.375rem;
		}

		.blog-prose :global(blockquote) {
			margin-bottom: 1.25rem;
			padding: 0.875rem var(--space-md);
			border-left-width: 3px;
		}

		.blog-prose :global(code) {
			font-size: 0.85em;
		}

		.blog-prose :global(pre),
		.blog-prose :global(.table-scroll) {
			margin-bottom: 1.25rem;
		}

		.blog-prose :global(pre) {
			padding: var(--space-md);
		}

		.blog-prose :global(pre code) {
			font-size: 0.8125rem;
		}

		.blog-prose :global(table) {
			font-size: var(--text-sm);
		}

		.blog-prose :global(th),
		.blog-prose :global(td) {
			padding: 0.625rem 0.75rem;
		}

		.blog-prose :global(hr) {
			margin: var(--space-xl) 0;
		}

		.post-footer {
			align-items: stretch;
			flex-direction: column;
			gap: var(--space-sm);
			margin-top: var(--space-xl);
			padding-top: var(--space-lg);
		}

		.stats {
			width: 100%;
		}
	}

	@media (max-width: 380px) {
		.post-header {
			margin-bottom: var(--space-lg);
		}

		.post-header h1 {
			font-size: 1.625rem;
		}

		.post-info {
			font-size: var(--text-xs);
		}

		.blog-prose {
			line-height: 1.65;
		}

		.blog-prose :global(h1),
		.blog-prose :global(h2),
		.blog-prose :global(h3),
		.blog-prose :global(h4),
		.blog-prose :global(h5),
		.blog-prose :global(h6) {
			margin-top: 1.75rem;
		}

		.blog-prose :global(h2) {
			font-size: 1.3125rem;
		}

		.blog-prose :global(h3) {
			font-size: 1.125rem;
		}

		.blog-prose :global(ul),
		.blog-prose :global(ol) {
			padding-left: 1.125rem;
		}

		.blog-prose :global(li) {
			margin-bottom: 0.25rem;
		}

		.blog-prose :global(blockquote) {
			padding: 0.75rem 0.875rem;
		}

		.blog-prose :global(pre) {
			padding: 0.875rem;
		}

		.blog-prose :global(th),
		.blog-prose :global(td) {
			padding: 0.5rem 0.625rem;
		}

		.post-footer {
			margin-top: var(--space-lg);
			padding-top: var(--space-md);
		}

		.stats {
			gap: 0.5rem;
		}

		.stat,
		.like-btn {
			padding: 0.5rem 0.75rem;
			font-size: var(--text-xs);
		}
	}
</style>
