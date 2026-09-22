import enData from '$lib/locales/en.json';
import type { Tag } from '$lib/types';

/**
 * Canonical tag data, derived from the bundled en.json:
 *   tags.<group>.name + tags.<group>.entries.<tagId>
 * Group membership, tag names/descriptions and their order all live in
 * the locale structure (en is the canonical fallback for every other
 * locale), so tags.json is not needed.
 */

export interface TagGroup {
	id: string;
	entryIds: string[];
}

interface TagGroupStructure {
	name: string;
	entries: Record<string, { name: string; description: string }>;
}

const rawGroups: Record<string, TagGroupStructure> = (enData as { tags: Record<string, TagGroupStructure> }).tags;

export const TAG_GROUPS: TagGroup[] = Object.entries(rawGroups).map(([id, group]) => ({
	id,
	entryIds: Object.keys(group.entries),
}));

const tagToGroup = new Map<string, string>();
for (const group of TAG_GROUPS) {
	for (const tagId of group.entryIds) {
		tagToGroup.set(tagId, group.id);
	}
}

/** All tags as Tag objects (English descriptions from en.json as canonical fallback). */
export const TAGS: Tag[] = TAG_GROUPS.flatMap(group =>
	group.entryIds.map(tagId => ({
		id: tagId,
		description: rawGroups[group.id].entries[tagId].description,
	}))
);

/** Group id a tag belongs to (undefined for unknown tags). */
export function getTagGroup(tagId: string): string | undefined {
	return tagToGroup.get(tagId);
}

/** Ordered group list (order follows the locale structure). */
export function getTagGroups(): TagGroup[] {
	return TAG_GROUPS;
}
