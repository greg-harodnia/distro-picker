import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsydfkkkjazznplskovm.supabase.co';
const supabaseKey = 'sb_publishable_9A2HyDx26ux5yDZr1-5ROQ__PqNIIlD';

export const supabase = createClient(supabaseUrl, supabaseKey);

export function getLikedDistros(): string[] {
	if (typeof window === 'undefined') return [];
	const stored = localStorage.getItem('distro-picker-likes');
	return stored ? JSON.parse(stored) : [];
}

export function setLikedDistro(distroId: string) {
	const liked = getLikedDistros();
	if (!liked.includes(distroId)) {
		liked.push(distroId);
		localStorage.setItem('distro-picker-likes', JSON.stringify(liked));
	}
}

export function removeLikedDistro(distroId: string) {
	const liked = getLikedDistros();
	const index = liked.indexOf(distroId);
	if (index > -1) {
		liked.splice(index, 1);
		localStorage.setItem('distro-picker-likes', JSON.stringify(liked));
	}
}
