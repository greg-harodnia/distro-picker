const DISTRO_LIKES_KEY = 'distro-picker-likes';

/**
 * `localStorage` is unavailable during SSR and can be blocked by the browser,
 * so every access is guarded and degrades to "nothing remembered".
 */
function safeStorage(): Storage | null {
	try {
		return typeof window !== 'undefined' && globalThis.localStorage ? localStorage : null;
	} catch {
		return null;
	}
}

/**
 * Ids remembered as "liked" under `key`. Shared by the distro and blog like
 * systems, which keep separate keys but identical storage semantics.
 */
export function readLikedIds(key: string): string[] {
	const storage = safeStorage();
	if (!storage) return [];
	try {
		const stored = storage.getItem(key);
		if (!stored) return [];
		const parsed = JSON.parse(stored);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		try {
			storage.removeItem(key);
		} catch {
			// ignore — a corrupt entry just won't be remembered
		}
		return [];
	}
}

/** Remembers (or forgets) `id` as liked under `key`. */
export function setLikedId(key: string, id: string, liked: boolean): void {
	const storage = safeStorage();
	if (!storage) return;
	try {
		const ids = readLikedIds(key);
		const next = liked ? Array.from(new Set([...ids, id])) : ids.filter((x) => x !== id);
		storage.setItem(key, JSON.stringify(next));
	} catch {
		// storage unavailable/full — the like just isn't remembered
	}
}

export function getLikedDistros(): string[] {
	return readLikedIds(DISTRO_LIKES_KEY);
}

export function setLikedDistro(distroId: string): void {
	setLikedId(DISTRO_LIKES_KEY, distroId, true);
}

export function removeLikedDistro(distroId: string): void {
	setLikedId(DISTRO_LIKES_KEY, distroId, false);
}
