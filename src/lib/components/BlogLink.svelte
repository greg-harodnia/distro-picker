<script lang="ts">
	import { base } from '$app/paths';
	import { t, locale, localePath } from '$lib/i18n/locale';

	let href = $derived(`${base}${localePath('/blog', $locale)}`);
	let label = $derived($t('pages.blog.navLabel') || 'Blog');
</script>

<!-- Shares the `.btn-toggle` chrome (44px bordered pill) with the language and
     theme controls so the top bar reads as one group; carries a visible label
     because a bare book icon doesn't communicate "Blog". -->
<a class="blog-toggle btn-toggle" href={href} aria-label={label} title={label}>
	<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
		<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
	</svg>
	<span class="blog-label">{label}</span>
</a>

<style>
	.blog-toggle {
		gap: var(--space-sm);
		padding: 0 var(--space-md);
		font-size: var(--text-sm);
		font-weight: var(--font-medium);
		text-decoration: none;
		white-space: nowrap;
	}
</style>
