<script lang="ts">
	import BackLink from '$lib/components/BackLink.svelte';
	import LanguageToggle from '$lib/components/LanguageToggle.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { backPath, label }: { backPath: string; label?: string } = $props();
</script>

<div class="page-top-bar">
	<BackLink path={backPath} {label} />
	<div class="page-controls">
		<LanguageToggle />
		<ThemeToggle />
	</div>
</div>

<style>
	.page-top-bar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		min-width: 0;
		margin-bottom: var(--space-xl);
		gap: var(--space-md);
	}

	.page-controls {
		display: flex;
		flex-shrink: 0;
		gap: var(--space-sm);
		margin-left: auto;
	}

	@media (max-width: 640px) {
		.page-top-bar {
			margin-bottom: var(--space-lg);
			gap: var(--space-sm);
		}
	}

	@media (max-width: 380px) {
		.page-top-bar {
			margin-bottom: var(--space-md);
			gap: 0.5rem;
		}

		.page-controls {
			gap: 6px;
		}
	}
</style>

