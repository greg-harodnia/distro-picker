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