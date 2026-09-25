<script lang="ts">
	import { base } from '$app/paths';
	import { locale, localePath } from '$lib/i18n/locale';

	let {
		path,
		label,
		variant = 'default'
	}: { path: string; label?: string; variant?: 'default' | 'footer' } = $props();

	let href = $derived(`${base}${localePath(path, $locale)}`);
</script>

<a class="back-link" class:footer-link={variant === 'footer'} {href}>← {label}</a>

<style>
	.back-link {
		min-width: 0;
		color: var(--color-secondary);
		text-decoration: none;
		font-weight: var(--font-medium);
		line-height: var(--line-height-normal);
		overflow-wrap: anywhere;
	}

	.footer-link {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
	}

	@media (hover: hover) {
		.back-link:hover {
			text-decoration: underline;
		}
	}

	@media (max-width: 640px) {
		.back-link {
			font-size: 0.9rem;
		}
	}

	@media (max-width: 380px) {
		.back-link {
			font-size: 0.8125rem;
		}
	}
</style>
