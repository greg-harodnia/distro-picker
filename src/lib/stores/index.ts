import { writable, derived } from 'svelte/store';
import type { Distro, Tag } from '$lib/types';

export const selectedTags = writable<Set<string>>(new Set());
export const selectedDistro = writable<Distro | null>(null);
export const tags = writable<Tag[]>([]);
export const distros = writable<Distro[]>([]);
export const loading = writable(true);
export const error = writable<string | null>(null);
export const showBestOnly = writable<boolean>(false);

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

const DESKTOP_GROUP = 'desktop';
const MAIN_DESKTOPS = new Set(['KDE Plasma', 'GNOME', 'Xfce', 'COSMIC']);

// Tag groups (sections) where multiple tags may be selected at once.
// The second filter section ("update-model": point-release, rolling, immutable).
const MULTI_SELECT_GROUPS = new Set(['update-model']);

function matchesDesktop(desktops: string[] | undefined, tagId: string): boolean {
	if (!desktops || desktops.length === 0) return false;
	switch (tagId) {
		case 'kde-plasma':
			return desktops.includes('KDE Plasma');
		case 'gnome':
			return desktops.includes('GNOME');
		case 'xfce':
			return desktops.includes('Xfce');
		case 'cosmic':
			return desktops.includes('COSMIC');
		case 'other':
			return desktops.some(d => !MAIN_DESKTOPS.has(d));
		default:
			return false;
	}
}

export const filteredDistros = derived(
	[distros, selectedTags, showBestOnly],
	([$distros, $selectedTags, $showBestOnly]) => {
		if (!$distros || $distros.length === 0) return [];
		
		let result = $distros.filter(d => !d.disabled);
		
		if ($showBestOnly) {
			result = result.filter(d => d.best);
		}
		
		if ($selectedTags.size > 0) {
			const selectedArray = Array.from($selectedTags);
			result = result.filter(distro => 
				selectedArray.every(tagId => {
					if (getTagGroup(tagId) === DESKTOP_GROUP) {
						return matchesDesktop(distro.desktops, tagId);
					}
					return distro.tag_ids.includes(tagId);
				})
			);
		}
		
		return result;
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
				if (tagGroup && !MULTI_SELECT_GROUPS.has(tagGroup)) {
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
	},

	update: (id: string, updates: Partial<Distro>) => {
		distros.update(current =>
			current.map(d => d.id === id ? { ...d, ...updates } : d)
		);
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