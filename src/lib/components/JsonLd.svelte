<script lang="ts">
	// The single place that turns structured data into a JSON-LD <script> in
	// <head>. Routes pass a plain object; serialization and injection live here
	// so the markup and the `{@html}` escape hatch aren't repeated per route.
	let { data }: { data: unknown } = $props();
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`}
</svelte:head>
