<script lang="ts">
	let { size = 24, class: className }: { size?: number; class?: string } = $props();
</script>

<svg
	class={className}
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<polyline points="9 18 15 12 9 6"></polyline>
</svg>
