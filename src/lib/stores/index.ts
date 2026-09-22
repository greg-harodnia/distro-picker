import { writable, derived } from 'svelte/store';
import type { Distro, Tag } from '$lib/types';
import { getTagGroup } from '$lib/tagGroups';

export { getTagGroup };

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

// Tag group whose tags are matched against `distro.desktops`.
// Derived from the locale structure (currently keyed "dekstops" there).
const DESKTOP_GROUP = getTagGroup('kde-plasma') ?? 'desktop';

// Tag group whose tags are matched against `distro.based_on`
// (the "Based on" / "Заклад на" filter), not `tag_ids`.
const BASED_ON_GROUP = getTagGroup('ubuntu') ?? 'based-on';

const MAIN_DESKTOPS = new Set(['KDE Plasma', 'GNOME', 'Xfce', 'COSMIC']);

// Tag groups (sections) where multiple tags may be selected at once.
// The second filter section ("release-model": point-release, rolling, immutable).
const MULTI_SELECT_GROUPS = new Set(['release-model']);

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

// Base families of `based_on` values (e.g. "Debian Testing", "Fedora Atomic"
// belong to their root family); everything else lands in the "other" bucket.
const BASED_ON_FAMILIES = ['Ubuntu', 'Debian', 'Fedora', 'Arch'];

// Which "Based on" filter tag a distro's `based_on` value matches.
function matchesBasedOn(basedOn: string | undefined, tagId: string): boolean {
	if (!basedOn) return false;
	switch (tagId) {
		case 'ubuntu':
			return basedOn.startsWith('Ubuntu');
		case 'debian':
			return basedOn.startsWith('Debian');
		case 'fedora':
			return basedOn.startsWith('Fedora');
		case 'arch':
			return basedOn.startsWith('Arch');
		case 'independent':
			return basedOn === 'independent';
		case 'based-on-other':
			return (
				basedOn !== 'independent' &&
				!BASED_ON_FAMILIES.some(family => basedOn.startsWith(family))
			);
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
					const group = getTagGroup(tagId);
					if (group === DESKTOP_GROUP) {
						return matchesDesktop(distro.desktops, tagId);
					}
					if (group === BASED_ON_GROUP) {
						return matchesBasedOn(distro.based_on, tagId);
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