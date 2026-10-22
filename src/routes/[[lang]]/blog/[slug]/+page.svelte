<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import BackLink from '$lib/components/BackLink.svelte';
	import JsonLd from '$lib/components/JsonLd.svelte';
	import PageTopBar from '$lib/components/PageTopBar.svelte';
	import PostToc from '$lib/components/PostToc.svelte';
	import ScrollProgress from '$lib/components/ScrollProgress.svelte';
	import EyeIcon from '$lib/components/icons/EyeIcon.svelte';
	import HeartIcon from '$lib/components/icons/HeartIcon.svelte';
	import { t, locale, localePath, appTitle } from '$lib/i18n/locale';
	import { fetchBlogStats, addBlogView, incrementBlogLikes } from '$lib/supabase';
	import { formatDate, readLikedIds, setLikedId, toggleLike } from '$lib/utils';
	import { SITE_URL as siteUrl } from '$lib/seo';

	let { data }: { data: PageData } = $props();

	const post = $derived(data.post);

	// Separate key from the distro likes so the two systems don't collide.
	const BLOG_LIKES_KEY = 'blog_likes';

	let views = $state(0);
	let likes = $state(0);
	let userLiked = $state(false);
	let liking = $state(false);

	// The post element the progress line measures against.
	let postEl = $state<HTMLElement | undefined>(undefined);

	function readLikedState(): boolean {
		return readLikedIds(BLOG_LIKES_KEY).includes(post.slug);
	}

	function persistLikedState(liked: boolean) {
		setLikedId(BLOG_LIKES_KEY, post.slug, liked);
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

	async function handleLike() {
		if (liking) return;
		liking = true;

		await toggleLike(
			{ liked: userLiked, count: likes },
			{
				// The footer renders from local component state.
				apply: ({ liked, count }) => {
					userLiked = liked;
					likes = count;
				},
				remember: persistLikedState,
				rpc: (delta) => incrementBlogLikes(post.slug, delta).then((stats) => stats?.likes ?? null)
			}
		);

		liking = false;
	}

	// Fallback posts are English content served under `/be`; point the schema at
	// the English original so it matches the canonical link the layout emits.
	let blogPath = $derived(
		post.usingFallback ? `/blog/${post.slug}` : localePath(`/blog/${post.slug}`, $locale)
	);

	let ldData = $derived({
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		mainEntityOfPage: `${siteUrl}${blogPath}`,
		headline: post.meta.title,
		description: post.meta.description,
		datePublished: post.meta.date,
		dateModified: post.meta.date,
		inLanguage: post.lang,
		url: `${siteUrl}${blogPath}`,
		author: { '@type': 'Organization', name: $appTitle },
		publisher: {
			'@type': 'Organization',
			name: $appTitle,
			logo: { '@type': 'ImageObject', url: `${siteUrl}/linux.webp` }
		},
		image: `${siteUrl}/og-image.png`
	});
</script>

<JsonLd data={ldData} />

<ScrollProgress target={postEl} />

<PostToc headings={data.headings} />

<main class="page-shell post-page">
	<PageTopBar backPath="/blog" label={$t('pages.blog.backToBlog')} />

	<article class="post" bind:this={postEl}>
		<header class="post-header">
			<h1>{post.meta.title}</h1>
			<p class="post-info mono-label">
				<time datetime={post.meta.date}>{$t('pages.blog.publishedOn')}: {formatDate(post.meta.date, $locale)}</time>
			</p>
		</header>

		<div class="blog-prose">
			{@html post.contentHtml}
		</div>

		<footer class="post-footer">
			<div class="stats">
				<span class="stat" title="views">
					<EyeIcon size={18} />
					{views}
				</span>
				<button class="like-btn" class:liked={userLiked} onclick={handleLike} type="button" aria-pressed={userLiked}>
					<HeartIcon size={18} filled={userLiked} />
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
		padding-bottom: var(--space-lg);
		border-bottom: 1px solid var(--line);
	}

	.post-header h1 {
		font-size: clamp(2.25rem, 5.5vw, 3.5rem);
		color: var(--color-text);
		font-weight: var(--font-semibold);
		letter-spacing: -0.035em;
		line-height: 1.05;
		margin: 0 0 var(--space-md);
		overflow-wrap: anywhere;
		text-wrap: balance;
	}

	.post-info {
		margin: 0;
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
		color: var(--color-text);
		letter-spacing: -0.02em;
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

	/* Jumping to a section (the table of contents, or a fragment URL) should
	   not park the heading against the very top of the viewport. */
	.blog-prose :global(h2),
	.blog-prose :global(h3) {
		scroll-margin-top: var(--space-xl);
	}

	.blog-prose :global(p) {
		margin: 0 0 var(--space-lg);
	}

	.blog-prose :global(a) {
		color: var(--accent-ink);
		text-decoration: underline;
		text-underline-offset: 2px;
		overflow-wrap: anywhere;
	}

	.blog-prose :global(a:hover) {
		color: var(--accent);
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
		border-left: 3px solid var(--color-secondary);
		background: var(--color-background-secondary);
		border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
		color: var(--color-text-secondary);
	}

	.blog-prose :global(blockquote) :global(p:last-child) {
		margin-bottom: 0;
	}

	.blog-prose :global(code) {
		font-family: var(--font-mono);
		font-size: 0.875em;
		background: var(--color-background-secondary);
		border: 1px solid var(--line);
		padding: 1px 6px;
		border-radius: var(--radius-sm);
		overflow-wrap: anywhere;
	}

	.blog-prose :global(pre) {
		max-width: 100%;
		margin: 0 0 var(--space-lg);
		padding: var(--space-lg);
		/* Fixed dark palette on purpose: a code block stays dark in both
		   themes so syntax always reads clearly. */
		background: #0d1117;
		color: #e6edf3;
		font-family: var(--font-mono);
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
		outline: 2px solid var(--ink-strong);
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
		color: var(--color-text);
		font-family: var(--font-mono);
		font-size: var(--text-sm);
		font-weight: 500;
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

	/* The views chip and the like button are the same pill; the button adds
	   only the interactive bits. */
	.stat,
	.like-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--line);
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--color-text-secondary);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		font-weight: 500;
	}

	.like-btn {
		justify-content: center;
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	.like-btn.liked {
		background: var(--color-secondary);
		border-color: var(--color-secondary);
		color: var(--color-background);
	}

	@media (hover: hover) {
		.like-btn:hover {
			border-color: var(--color-text);
			color: var(--color-text);
		}

		.like-btn.liked:hover {
			background: var(--accent);
			border-color: var(--accent);
			color: #fff;
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
