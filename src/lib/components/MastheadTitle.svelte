<script lang="ts">
	/**
	 * Renders a localized page title, giving its final word the serif-italic
	 * accent (e.g. "Linux Distro Picker" -> "Picker"). Shared by the app
	 * masthead and `PageTopBar`, so the splitting rule lives in one place.
	 * A single-word title ends up entirely accented.
	 *
	 * The `.masthead-title` / `.serif-accent` styling comes from app.css, so
	 * the emitted `<h1>` is identical wherever this is used.
	 */
	let { title }: { title: string } = $props();

	let words = $derived(title.split(' '));
</script>

<h1 class="masthead-title">
	{#each words as word, i}
		{#if i === words.length - 1}
			<span class="serif-accent">{word}</span>
		{:else}{word}{' '}{/if}
	{/each}
</h1>
