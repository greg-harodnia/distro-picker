/**
 * Client-side data access for Supabase-backed features.
 *
 * The actual Supabase client lives server-side (`$lib/server/supabase.ts`).
 * This module is a thin fetch wrapper around the app's own API routes, so
 * `@supabase/supabase-js` never ships in the client bundle.
 */

/** `(1 | -1)` — a like is only ever added or removed, never set. */
export type LikeDelta = 1 | -1;

export interface BlogStats {
	slug: string;
	views: number;
	likes: number;
}

// ---- Distro likes ----

export async function fetchLikes(): Promise<Array<{ id: string; likes: number }>> {
	try {
		const res = await fetch('/api/likes');
		if (!res.ok) return [];
		const { likes } = await res.json();
		return likes ?? [];
	} catch {
		return [];
	}
}

export async function incrementDistroLikes(distroId: string, delta: LikeDelta): Promise<number | null> {
	try {
		const res = await fetch('/api/likes', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ distroId, delta }),
		});
		if (!res.ok) return null;
		const { likes } = await res.json();
		return typeof likes === 'number' ? likes : null;
	} catch {
		return null;
	}
}

// ---- Contact form ----

export async function sendMessage(name: string, email: string, message: string): Promise<boolean> {
	try {
		const res = await fetch('/api/contact', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, email, message }),
		});
		return res.ok;
	} catch {
		return false;
	}
}

// ---- Blog views & likes ----

export async function fetchBlogStats(slug: string): Promise<BlogStats | null> {
	try {
		const res = await fetch(`/api/blog/${encodeURIComponent(slug)}/stats`);
		if (!res.ok) return null;
		const { stats } = await res.json();
		return stats ?? null;
	} catch {
		return null;
	}
}

export async function addBlogView(slug: string): Promise<BlogStats | null> {
	try {
		const res = await fetch(`/api/blog/${encodeURIComponent(slug)}/view`, { method: 'POST' });
		if (!res.ok) return null;
		const { stats } = await res.json();
		return stats ?? null;
	} catch {
		return null;
	}
}

export async function incrementBlogLikes(slug: string, delta: LikeDelta): Promise<BlogStats | null> {
	try {
		const res = await fetch(`/api/blog/${encodeURIComponent(slug)}/like`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ delta }),
		});
		if (!res.ok) return null;
		const { stats } = await res.json();
		return stats ?? null;
	} catch {
		return null;
	}
}
