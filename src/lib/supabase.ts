import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsydfkkkjazznplskovm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeWRma2tramF6em5wbHNrb3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODE3ODMsImV4cCI6MjA4ODU1Nzc4M30.HqKyYDSCscHztQfd71e5D1C1E-IsKPyxxfYQquM0dyw';

const supabase = createClient(supabaseUrl, supabaseKey);

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

export async function fetchLikes(): Promise<Array<{ name: string; likes: number }>> {
	const { data, error } = await supabase
		.from('distros')
		.select('name, likes');
	
	if (error) {
		console.error('Failed to fetch likes:', error);
		return [];
	}
	return data || [];
}

export async function updateLikes(distroId: string, newLikes: number): Promise<boolean> {
	const { error } = await supabase
		.from('distros')
		.update({ likes: newLikes })
		.eq('name', distroId);
	
	if (error) {
		console.error('Failed to update likes:', error);
		return false;
	}
	return true;
}
