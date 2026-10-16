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

<div class="masthead page-top-bar" class:masthead--titled={!!title}>
	<div class="masthead-lead">
		{#if title}
			<h1 class="masthead-title">
				{#each titleWords as word, i}
					{#if i === titleWords.length - 1}
						<span class="serif-accent">{word}</span>
					{:else}{word}{' '}{/if}
				{/each}
			</h1>
		{:else}
			<BackLink path={backPath} {label} />
		{/if}
	</div>
	<div class="masthead-controls">
		<LanguageToggle />
		<ThemeToggle />
	</div>
</div>
{#if title}
	<p class="masthead-sub">
		<BackLink path={backPath} {label} />
	</p>
{/if}

<style>
	/* Chrome comes from the shared `.masthead` / `.masthead-sub` classes in
	   app.css — the same ones the home nav uses — so the bar and the app
	   title bar are one element visually. Only the spacing that depends on
	   whether a tagline follows the rule is local here. */

	/* Untitled bars pair with page content directly (no sub below the
	   rule), so they keep the full bottom margin. */
	.page-top-bar:not(.masthead--titled) {
		margin-bottom: var(--space-3xl);
	}

	@media (max-width: 640px) {
		/* Untitled bars tighten up on phones; titled ones keep the shared
		   masthead spacing so both routes stay pixel-identical. */
		.page-top-bar:not(.masthead--titled) {
			gap: var(--space-sm);
			margin-bottom: var(--space-xl);
		}
	}

	@media (max-width: 380px) {
		.masthead-controls {
			gap: 6px;
		}
	}
</style>
