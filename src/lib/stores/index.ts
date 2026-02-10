import { writable, derived } from 'svelte/store';
import type { Distro, Tag } from '$lib/types';

// Stores for application state
export const selectedTags = writable<Set<string>>(new Set());
export const selectedDistro = writable<Distro | null>(null);
export const tags = writable<Tag[]>([]);
export const distros = writable<Distro[]>([]);
export const loading = writable(true);
export const error = writable<string | null>(null);

// Derived store for filtered distros
export const filteredDistros = derived(
	[distros, selectedTags],
	([$distros, $selectedTags]) => {
		if (!$distros) return [];
		
		return $distros
			.filter(distro => {
				if ($selectedTags.size === 0) return true;
				return Array.from($selectedTags).every(tagId => 
					distro.tag_ids.includes(tagId)
				);
			})
			.sort((a, b) => a.priority - b.priority);
	}
);

// Actions for state management
export const tagActions = {
	toggle: (tagId: string) => {
		selectedTags.update(current => {
			const newSet = new Set(current);
			if (newSet.has(tagId)) {
				newSet.delete(tagId);
			} else {
				newSet.add(tagId);
			}
			return newSet;
		});
	},
	
	clear: () => {
		selectedTags.set(new Set());
	},
	
	set: (tagIds: string[]) => {
		selectedTags.set(new Set(tagIds));
	}
};

export const distroActions = {
	select: (distro: Distro) => {
		selectedDistro.set(distro);
	},
	
	clear: () => {
		selectedDistro.set(null);
	}
};

export const dataActions = {
	setTags: (newTags: Tag[]) => {
		tags.set(newTags);
	},
	
	setDistros: (newDistros: Distro[]) => {
		distros.set(newDistros);
	},
	
	setLoading: (isLoading: boolean) => {
		loading.set(isLoading);
	},
	
	setError: (errorMessage: string | null) => {
		error.set(errorMessage);
	},
	
	clearError: () => {
		error.set(null);
	}
};

// Reset all stores
export const reset = () => {
	selectedTags.set(new Set());
	selectedDistro.set(null);
	tags.set([]);
	distros.set([]);
	loading.set(true);
	error.set(null);
};