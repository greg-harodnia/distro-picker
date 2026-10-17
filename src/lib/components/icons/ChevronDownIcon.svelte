<script lang="ts">
	let {
		size = 18,
		strokeWidth = 2,
		rounded = true,
		class: className = '',
	}: {
		size?: number;
		strokeWidth?: number;
		rounded?: boolean;
		class?: string;
	} = $props();
</script>

<svg
	class={className}
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap={rounded ? 'round' : undefined}
	stroke-linejoin={rounded ? 'round' : undefined}
	aria-hidden="true"
>
	<polyline points="6 9 12 15 18 9"></polyline>
</svg>
