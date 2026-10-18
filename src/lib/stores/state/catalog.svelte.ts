import type { Distro } from '$lib/types';
import { distros as allDistros } from '$lib/distros';
import {
	filterDistros,
	groupByTier,
	toggleTagSelection,
} from '$lib/stores/core/filters';

/**
 * Shared picker state — filter selection, the distro list, the open detail
 * modal and the load error — as one runes class instead of a bag of
 * `writable`s. The pure filtering logic lives in `core/filters.ts`; this
 * class only holds state and wires the derivations.
 *
 * Collections are `$state.raw` and always replaced, never mutated in place
 * (Svelte doesn't deep-proxy `Set`s, and wholesale replacement keeps the
 * update path uniform). A single instance is exported because the state is
 * app-global; the server renders from the seeded initial values and every
 * mutation happens client-side (event handlers, `onMount`).
 */
class Catalog {
	/**
	 * The canonical distro list with the per-user like state layered on.
	 * Seeded at definition (rather than mutated from a route's render) so
	 * SSR renders the full grid from the first value.
	 */
	distros = $state.raw<Distro[]>(
		allDistros.map((d) => ({ ...d, likes: 0, userLiked: false }))
	);

	/** Active filter tags. Replace via `toggleTag` / `clearTags`, don't mutate. */
	selectedTags = $state.raw<Set<string>>(new Set());

	/** Distro whose detail modal is open, if any. */
	selectedDistro = $state.raw<Distro | null>(null);

	/** Non-null when loading distros failed; drives the error banner. */
	error = $state<string | null>(null);

	/** The distros that pass the active filters (disabled ones never do). */
	filteredDistros = $derived(filterDistros(this.distros, this.selectedTags));

	/** The full list grouped by tier in display order — see `groupByTier`. */
	allTieredDistros = $derived(groupByTier(this.distros));

	/** Ids of `filteredDistros`, for cheap show/hide of already-mounted cards. */
	visibleDistroIds = $derived(new Set(this.filteredDistros.map((d) => d.id)));

	/** Toggles a filter tag; picking one clears its single-select siblings. */
	toggleTag = (tagId: string): void => {
		this.selectedTags = toggleTagSelection(this.selectedTags, tagId);
	};

	clearTags = (): void => {
		this.selectedTags = new Set();
	};

	selectDistro = (distro: Distro): void => {
		this.selectedDistro = distro;
	};

	closeDistro = (): void => {
		this.selectedDistro = null;
	};

	/** Applies a partial update to one distro by id (likes, liked state…). */
	updateDistro = (id: string, updates: Partial<Distro>): void => {
		this.distros = this.distros.map((d) => (d.id === id ? { ...d, ...updates } : d));
	};

	/** Replaces the whole distro list (initial load, likes refresh). */
	setDistros = (distros: Distro[]): void => {
		this.distros = distros;
	};

	setError = (message: string | null): void => {
		this.error = message;
	};

	clearError = (): void => {
		this.error = null;
	};
}

export const catalog = new Catalog();
