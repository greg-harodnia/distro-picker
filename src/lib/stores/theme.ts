import { writable } from 'svelte/store';

export const theme = writable<'light' | 'dark'>('light');

export const themeActions = {
	toggle: () => {
		theme.update(current => current === 'light' ? 'dark' : 'light');
	},

	set: (newTheme: 'light' | 'dark') => {
		theme.set(newTheme);
	}
};

/**
 * Client-only. Seeds the store from the saved (or system) preference, then
 * keeps `<html>` and `localStorage` in sync. Call once, from the root layout —
 * the inline script in `app.html` still applies the class before first paint so
 * there is no dark-mode flash. Returns the unsubscribe function.
 */
export function initTheme(): () => void {
	if (typeof window === 'undefined') return () => {};

	// Storage may be unavailable (private mode / blocked) — degrade to the
	// system preference instead of throwing during hydration.
	let stored: string | null = null;
	try {
		stored = localStorage.getItem('theme');
	} catch {
		// ignored
	}

	if (stored === 'light' || stored === 'dark') {
		theme.set(stored);
	} else {
		theme.set(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
	}

	return theme.subscribe((value) => {
		document.documentElement.classList.toggle('dark', value === 'dark');
		try {
			localStorage.setItem('theme', value);
		} catch {
			// Storage unavailable — the choice just isn't remembered.
		}
	});
}
