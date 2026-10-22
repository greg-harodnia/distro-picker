<script lang="ts">
	/**
	 * `PostToc` — a floating menu with the sections of a post, pinned to the
	 * left of the article.
	 *
	 * Every entry is a plain fragment link to the section's heading, so the
	 * menu works without JavaScript and the browser scrolls to the heading
	 * (smoothly, and with the heading's `scroll-margin-top` offset).
	 *
	 * The menu is only rendered when the post has `##` sections — a post
	 * without them has nothing to list.
	 */
	import type { TocEntry } from '$lib/blog/markdown';
	import { t } from '$lib/i18n/locale';
	import { frameThrottle } from '$lib/utils';

	let { headings }: { headings: TocEntry[] } = $props();

	/** The section the reader is currently in. */
	let activeId = $state<string | undefined>(undefined);

	/**
	 * How far below the top of the viewport a heading has to come to count as
	 * the current section. Small enough that a heading becomes active while it
	 * is still visible, large enough not to switch sections too early.
	 */
	const ACTIVATION_OFFSET = 100;

	function updateActive() {
		// If the reader has scrolled to (or very near) the bottom of the page,
		// the last section is active even if its heading sits below the
		// activation line (which happens when the section is shorter than the
		// viewport).
		if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
			activeId = headings[headings.length - 1]?.id;
			return;
		}

		let current: string | undefined;

		for (const heading of headings) {
			const element = document.getElementById(heading.id);
			if (!element) continue;

			// The headings are in document order, so the first one that is still
			// below the line ends the search.
			if (element.getBoundingClientRect().top > ACTIVATION_OFFSET) break;

			current = heading.id;
		}

		activeId = current;
	}

	const schedule = frameThrottle(updateActive);

	$effect(() => {
		schedule();

		return () => schedule.cancel();
	});
</script>

<svelte:window onscroll={schedule} onresize={schedule} />

{#if headings.length > 0}
	<nav class="post-toc" aria-label={$t('pages.blog.tocLabel')}>
		<ul class="post-toc__list">
			{#each headings as heading (heading.id)}
				<li class="post-toc__item">
					<a
						class="post-toc__link"
						class:post-toc__link--active={activeId === heading.id}
						href="#{heading.id}"
						aria-current={activeId === heading.id ? 'true' : undefined}
					>
						{heading.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<style>
	/* The article column is centred in the viewport, so the menu sits in the
	   free space to its left. Below 1280px there is no room for it, and the
	   sections stay reachable through the article itself. */
	.post-toc {
		--toc-width: 13rem;

		position: fixed;
		left: max(var(--space-lg), calc(50% - var(--container-md) / 2 - var(--space-2xl) - var(--toc-width)));
		top: 50%;
		transform: translateY(-50%);
		width: var(--toc-width);
		max-height: 70vh;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.post-toc__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.post-toc__item + .post-toc__item {
		margin-top: 2px;
	}

	.post-toc__link {
		display: block;
		padding: 4px 0 4px 12px;
		border-left: 1px solid var(--line);
		color: var(--color-text-secondary);
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		line-height: 1.45;
		text-decoration: none;
		transition:
			color var(--transition-normal),
			border-color var(--transition-normal);
	}

	.post-toc__link:hover {
		color: var(--color-text);
		border-left-color: var(--line-strong);
	}

	.post-toc__link--active {
		color: var(--accent);
		border-left-color: var(--accent);
	}

	@media (max-width: 1239px) {
		.post-toc {
			display: none;
		}
	}
</style>
