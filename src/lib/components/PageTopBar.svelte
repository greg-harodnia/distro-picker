<script lang="ts">
	import BackLink from '$lib/components/BackLink.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let {
		backPath,
		label,
		title = undefined
	}: { backPath: string; label?: string | undefined; title?: string | undefined } = $props();

	// Split the localized title so its final word can carry the serif-italic
	// accent, exactly like the app masthead splits "Linux Distro Picker" so
	// "Picker" gets it. A single-word title ends up entirely accented.
	let titleWords = $derived(title ? title.split(' ') : []);
</script>

<div class="page-top-bar" class:has-title={!!title}>
	<div class="bar-lead">
		{#if title}
			<h1 class="bar-title">
				{#each titleWords as word, i}
					{#if i === titleWords.length - 1}
						<span class="serif-accent">{word}</span>
					{:else}{word}{' '}{/if}
				{/each}
			</h1>
		{/if}
		<span class="bar-sub" class:with-rule={!!title}>
			<BackLink path={backPath} {label} />
		</span>
	</div>
	<div class="page-controls">
		<LanguageToggle />
		<ThemeToggle />
	</div>
</div>

<style>
	/* Masthead chrome, kept identical to the app's `.site-nav` (same bottom
	   rule, padding and spacing) so this bar and the app's title bar are the
	   same element visually — the shared page frame then pins the toggles to
	   the same coordinates on every route. */
	.page-top-bar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		min-width: 0;
		gap: var(--space-md);
		padding-bottom: var(--space-md);
		border-bottom: 1px solid var(--line);
		margin-bottom: var(--space-3xl);
	}

	.bar-lead {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-sm) var(--space-md);
		min-width: 0;
	}

	/* Matches `.site-title` on the app page: same size, weight and tracking. */
	.bar-title {
		font-size: clamp(1.25rem, 2.5vw, 1.75rem);
		font-weight: var(--font-semibold);
		letter-spacing: -0.03em;
		line-height: 1.1;
		color: var(--color-text);
		margin: 0;
		text-wrap: balance;
	}

	.bar-title .serif-accent {
		font-size: 1.06em;
		line-height: 1;
	}

	/* With a title beside it, the back link takes the tagline's place — split
	   off by the same hairline rule the app masthead uses for its description,
	   and set in the same type so both lead blocks are the same height. Any
	   mismatch here shifts the rule (and everything under it) vertically when
	   navigating between / and /blog. */
	.bar-sub.with-rule {
		border-left: 1px solid var(--line);
		padding-left: var(--space-md);
		font-size: clamp(var(--text-sm), 1.4vw, var(--text-base));
		line-height: 1.4;
	}

	/* The link ships its own size and line-height; inherit them so the
	   wrapper's line box — the one sized to match `.site-description` — is
	   what actually contributes to the bar's height. */
	.bar-sub.with-rule :global(.back-link) {
		font-size: inherit;
		line-height: inherit;
	}

	.page-controls {
		display: flex;
		flex-shrink: 0;
		gap: var(--space-sm);
		margin-left: auto;
	}

	@media (max-width: 640px) {
		.page-top-bar {
			margin-bottom: var(--space-xl);
			gap: var(--space-sm);
		}

		/* Titled bars centre on phones the way the app masthead does: title
		   stacked above the sub-link, control row centred underneath. The
		   row gap matches `.site-nav` so the controls land at the same
		   height as the app's own control row. */
		.page-top-bar.has-title {
			justify-content: center;
			gap: var(--space-md);
		}

		/* Phones get the app masthead's hero-sized title so the lead block
		   (and with it the control row below it) is the same height on both
		   pages — that keeps the toggles at the same y-position too. */
		.page-top-bar.has-title .bar-title {
			font-size: clamp(2rem, 8vw, 2.75rem);
		}

		.page-top-bar.has-title .bar-lead {
			width: 100%;
			flex-direction: column;
			align-items: center;
			text-align: center;
		}

		.page-top-bar.has-title .bar-sub.with-rule {
			border-left: none;
			padding-left: 0;
			/* `.site-description` reads `var(--text-base)`, which the app's
			   mobile font scale shrinks to 0.875rem inside `.app` — a scale
			   this page doesn't get. Pin that scaled value so both secondary
			   lines are 19.6px tall and the rules line up across routes. */
			font-size: 0.875rem;
			line-height: 1.4;
		}

		.page-top-bar.has-title .page-controls {
			margin-left: 0;
			justify-content: center;
		}
	}

	@media (max-width: 380px) {
		.page-controls {
			gap: 6px;
		}
	}
</style>
