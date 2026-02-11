<script lang="ts">
	import { theme, themeActions } from '$lib/stores/theme';
	import { onMount } from 'svelte';

	let isDark = false;

	onMount(() => {
		// Initialize theme from localStorage or system preference
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme === 'light' || storedTheme === 'dark') {
			themeActions.set(storedTheme);
		} else {
			const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			themeActions.set(systemPreference);
		}

		// Subscribe to theme changes
		const unsubscribe = theme.subscribe(value => {
			isDark = value === 'dark';
			// Update DOM
			if (value === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
			// Save to localStorage
			localStorage.setItem('theme', value);
		});

		return unsubscribe;
	});

	function toggleTheme() {
		themeActions.toggle();
	}
</script>

<button
	type="button"
	class="theme-toggle"
	on:click={toggleTheme}
	aria-label="Toggle dark mode"
	title="Toggle dark mode"
>
	{#if isDark}
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="5"/>
			<line x1="12" y1="1" x2="12" y2="3"/>
			<line x1="12" y1="21" x2="12" y2="23"/>
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
			<line x1="1" y1="12" x2="3" y2="12"/>
			<line x1="21" y1="12" x2="23" y2="12"/>
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
		</svg>
	{:else}
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
		</svg>
	{/if}
</button>

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: none;
		border-radius: var(--radius-md);
		background: var(--color-surface);
		color: var(--color-text);
		cursor: pointer;
		transition: var(--transition-normal);
		box-shadow: var(--shadow-sm);
	}

	.theme-toggle:hover {
		background: var(--color-background-secondary);
		box-shadow: var(--shadow-md);
		transform: translateY(-1px);
	}

	/* .theme-toggle:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	} */

	.theme-toggle:active {
		transform: translateY(0);
	}

	svg {
		transition: var(--transition-normal);
	}

	.theme-toggle:hover svg {
		transform: scale(1.1);
	}
</style>