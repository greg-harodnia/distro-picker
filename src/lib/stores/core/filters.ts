import type { Distro, DistroTier } from '$lib/types';
import { getTagGroup } from '$lib/tagGroups';

/**
 * Pure filter engine for the picker grid: tier grouping, tag matching and
 * tag-selection rules. No Svelte imports and no state — every function takes
 * its inputs and returns its result, so the reactive layer
 * (`state/catalog.svelte.ts`) is the only thing that knows about runes.
 */

/**
 * Homepage display order of the distro tiers. Each becomes its own labelled,
 * collapsible section.
 */
const TIERS: readonly DistroTier[] = ['best', 'other', 'less-popular'];

export interface TierGroup {
	tier: DistroTier;
	distros: Distro[];
}

/** Tier a distro belongs to (unknown/missing tiers fall back to `other`). */
function tierOf(distro: Distro): DistroTier {
	return distro.tier && TIERS.includes(distro.tier) ? distro.tier : 'other';
}

// Tag group whose tags are matched against `distro.desktops`.
// Derived from the locale structure (currently keyed "dekstops" there).
const DESKTOP_GROUP = getTagGroup('kde-plasma') ?? 'desktop';

// Tag group whose tags are matched against `distro.based_on`
// (the "Based on" / "Заклад на" filter), not `tag_ids`.
const BASED_ON_GROUP = getTagGroup('ubuntu') ?? 'based-on';

// Desktop filter tag id -> the exact `distro.desktops` value it matches.
// `other` is the catch-all and is handled separately below.
const DESKTOP_MATCHES: Record<string, string> = {
	'kde-plasma': 'KDE Plasma',
	gnome: 'GNOME',
	cosmic: 'COSMIC',
	cinnamon: 'Cinnamon',
	xfce: 'Xfce',
	lxqt: 'LXQt',
};

// Desktops that have their own filter tag; anything else counts as "other".
const MAIN_DESKTOPS = new Set(Object.values(DESKTOP_MATCHES));

// Tag groups (sections) where multiple tags may be selected at once.
// The second filter section ("release-model": point-release, rolling, immutable).
const MULTI_SELECT_GROUPS = new Set(['release-model']);

function matchesDesktop(desktops: string[] | undefined, tagId: string): boolean {
	if (!desktops || desktops.length === 0) return false;
	if (tagId === 'other') return desktops.some(d => !MAIN_DESKTOPS.has(d));
	const desktop = DESKTOP_MATCHES[tagId];
	return desktop !== undefined && desktops.includes(desktop);
}

// "Based on" filter tag id -> the root family its `based_on` value starts with
// (e.g. "Debian Testing", "Fedora Atomic" belong to their root family).
// `independent` / `based-on-other` are handled separately below.
const BASED_ON_MATCHES: Record<string, string> = {
	ubuntu: 'Ubuntu',
	debian: 'Debian',
	fedora: 'Fedora',
	arch: 'Arch',
};

// Which "Based on" filter tag a distro's `based_on` value matches.
function matchesBasedOn(basedOn: string | undefined, tagId: string): boolean {
	if (!basedOn) return false;
	if (tagId === 'independent') return basedOn === 'independent';
	if (tagId === 'based-on-other') {
		return (
			basedOn !== 'independent' &&
			!Object.values(BASED_ON_MATCHES).some(family => basedOn.startsWith(family))
		);
	}
	const family = BASED_ON_MATCHES[tagId];
	return family !== undefined && basedOn.startsWith(family);
}

/**
 * The distros that pass `selectedTags` (disabled ones never do). Every
 * selected tag must match (AND semantics), with desktop / based-on tags
 * matched against their dedicated fields instead of `tag_ids`.
 */
export function filterDistros(distros: Distro[], selectedTags: ReadonlySet<string>): Distro[] {
	let result = distros.filter(d => !d.disabled);

	if (selectedTags.size > 0) {
		const selectedArray = Array.from(selectedTags);
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

/**
 * Every (non-disabled) distro grouped by tier in `TIERS` order — the full set,
 * regardless of the active filters. The grid renders this list and hides the
 * cards that don't match, so filtering never unmounts a card. Unmounting would
 * recreate the `<img>` and make the browser re-fetch/re-decode the icon, which
 * reads as a flicker.
 */
export function groupByTier(distros: Distro[]): TierGroup[] {
	return TIERS.map(tier => ({
		tier,
		distros: distros.filter(d => !d.disabled && tierOf(d) === tier),
	}));
}

/**
 * The selection that results from toggling `tagId` inside `current`.
 * Toggling off removes the tag; toggling on adds it, replacing any sibling
 * from the same single-select group (groups in `MULTI_SELECT_GROUPS` are
 * exempt). Returns a new set — callers replace rather than mutate.
 */
export function toggleTagSelection(current: ReadonlySet<string>, tagId: string): Set<string> {
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
}
