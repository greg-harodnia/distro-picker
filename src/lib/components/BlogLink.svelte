<script lang="ts">
	import { base } from '$app/paths';
	import { t, locale, localePath } from '$lib/i18n/locale';

	let { variant = 'desktop' }: { variant?: 'desktop' | 'mobile' } = $props();

	let href = $derived(`${base}${localePath('/blog', $locale)}`);
	let label = $derived($t('pages.blog.navLabel') || 'Blog');
</script>

<a
	class="blog-toggle btn-toggle {variant === 'desktop' ? 'variant-desktop' : 'variant-mobile'}"
	href={href}
	aria-label={label}
	title={label}
>
	<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
		<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
	</svg>
	<span class="blog-label">{label}</span>
</a>

<style>
	/* Both variants render the same pill button; only one is visible per breakpoint. */
	.blog-toggle {
		gap: var(--space-xs);
		height: 44px;
		padding: 0 var(--space-md);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		text-decoration: none;
		white-space: nowrap;
	}

	.variant-desktop {
		display: inline-flex;
	}

	.variant-mobile {
		display: none;
	}

	@media (max-width: 640px) {
		.variant-desktop {
			display: none;
		}

		.variant-mobile {
			display: inline-flex;
		}
	}
</style>