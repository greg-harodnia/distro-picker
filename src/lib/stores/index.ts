import { writable, derived } from 'svelte/store';
import type { Distro, Tag } from '$lib/types';

export const selectedTags = writable<Set<string>>(new Set());
export const selectedDistro = writable<Distro | null>(null);
export const tags = writable<Tag[]>([]);
export const distros = writable<Distro[]>([]);
export const loading = writable(true);
export const error = writable<string | null>(null);

let tagMap = new Map<string, Tag>();

tags.subscribe(tagList => {
	tagMap.clear();
	for (const tag of tagList) {
		tagMap.set(tag.id, tag);
	}
});

export function getTagById(tagId: string): Tag | undefined {
	return tagMap.get(tagId);
}

export function getTagGroup(tagId: string): string | undefined {
	const tag = tagMap.get(tagId);
	return tag?.group;
}

export const filteredDistros = derived(
	[distros, selectedTags],
	([$distros, $selectedTags]) => {
		if (!$distros || $distros.length === 0) return [];
		
		if ($selectedTags.size === 0) {
			return $distros
				.filter(d => !d.disabled)
				.sort((a, b) => a.priority - b.priority);
		}
		
		const selectedArray = Array.from($selectedTags);
		return $distros
			.filter(distro => {
				if (distro.disabled) return false;
				return selectedArray.every(tagId => distro.tag_ids.includes(tagId));
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
				const tagGroup = getTagGroup(tagId);
				if (tagGroup) {
					for (const selectedId of newSet) {
						if (getTagGroup(selectedId) === tagGroup) {
							newSet.delete(selectedId);
						}
					}
				}
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