const STORAGE_KEY = 'distro-picker-likes';

export function getLikedDistros(): string[] {
	if (typeof window === 'undefined' || !globalThis.localStorage) return [];
	const stored = localStorage.getItem(STORAGE_KEY);
	return stored ? JSON.parse(stored) : [];
}

export function setLikedDistro(distroId: string) {
	const liked = getLikedDistros();
	if (!liked.includes(distroId)) {
		liked.push(distroId);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(liked));
	}
}

export function removeLikedDistro(distroId: string) {
	const liked = getLikedDistros();
	const index = liked.indexOf(distroId);
	if (index > -1) {
		liked.splice(index, 1);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(liked));
	}
}