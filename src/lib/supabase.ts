import type { SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

/**
 * Supabase data access.
 *
 * The client is created lazily: `@supabase/supabase-js` is ~170 KB of
 * JavaScript and this app only needs it for counters, so statically importing
 * it would put it on the critical path of every page. `getClient()` is only
 * called from the functions below, which all run after mount.
 *
 * Counters are mutated through Postgres functions (see
 * `supabase/migrations/0004_atomic_counters.sql`) rather than read-modify-write
 * updates, so concurrent likes/views can't clobber each other.
 */

// Public Supabase project URL (see `.env.example`). The anon key is public by
// design and lives here; the URL is also referenced by `app.html`, so it comes
// from one env var to keep the two in sync.
const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeWRma2tramF6em5wbHNrb3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODE3ODMsImV4cCI6MjA4ODU1Nzc4M30.HqKyYDSCscHztQfd71e5D1C1E-IsKPyxxfYQquM0dyw';

let clientPromise: Promise<SupabaseClient> | null = null;

function getClient(): Promise<SupabaseClient> {
	clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
		createClient(supabaseUrl, supabaseKey)
	);
	return clientPromise;
}

/** `(1 | -1)` — a like is only ever added or removed, never set. */
export type LikeDelta = 1 | -1;

// ---- Distro likes ----

export async function fetchLikes(): Promise<Array<{ id: string; likes: number }>> {
	const supabase = await getClient();
	const { data, error } = await supabase.from('distros').select('id, likes');

	if (error) {
		console.error('Failed to fetch likes:', error);
		return [];
	}
	return data || [];
}

/**
 * Atomically adds `delta` to a distro's like count.
 * Returns the new total, or `null` if the write failed.
 */
export async function incrementDistroLikes(distroId: string, delta: LikeDelta): Promise<number | null> {
	const supabase = await getClient();
	const { data, error } = await supabase.rpc('increment_distro_likes', {
		p_id: distroId,
		p_delta: delta,
	});

	if (error) {
		console.error('Failed to update likes:', error);
		return null;
	}
	return typeof data === 'number' ? data : null;
}

// ---- Contact form ----

export async function sendMessage(name: string, email: string, message: string): Promise<boolean> {
	const supabase = await getClient();
	const { error } = await supabase.from('messages').insert({ name, email, message });

	if (error) {
		console.error('Failed to send message:', error);
		return false;
	}
	return true;
}

// ---- Blog views & likes ----
// Rows live in the `blog_posts` table (slug PK, views, likes). The counter
// functions upsert, so the first view/like on a post creates its row.

export interface BlogStats {
	slug: string;
	views: number;
	likes: number;
}

export async function fetchBlogStats(slug: string): Promise<BlogStats | null> {
	const supabase = await getClient();
	const { data, error } = await supabase
		.from('blog_posts')
		.select('slug, views, likes')
		.eq('slug', slug)
		.maybeSingle();

	if (error) {
		console.error('Failed to fetch blog stats:', error);
		return null;
	}
	return (data as BlogStats) || null;
}

/** All posts' counters in one query — used by the blog index. */
export async function fetchAllBlogStats(): Promise<BlogStats[]> {
	const supabase = await getClient();
	const { data, error } = await supabase.from('blog_posts').select('slug, views, likes');

	if (error) {
		console.error('Failed to fetch blog stats:', error);
		return [];
	}
	return (data as BlogStats[]) || [];
}

/** The `returns table` RPCs come back as a one-row array. */
function firstRow(data: unknown): BlogStats | null {
	const row = Array.isArray(data) ? data[0] : data;
	return (row as BlogStats | undefined) ?? null;
}

/** Counts one view for a post (call once per session from the client). */
export async function addBlogView(slug: string): Promise<BlogStats | null> {
	const supabase = await getClient();
	const { data, error } = await supabase.rpc('increment_blog_view', { p_slug: slug });

	if (error) {
		console.error('Failed to add blog view:', error);
		return null;
	}
	return firstRow(data);
}

/** Atomically adds `delta` to a post's like count; returns the authoritative row. */
export async function incrementBlogLikes(slug: string, delta: LikeDelta): Promise<BlogStats | null> {
	const supabase = await getClient();
	const { data, error } = await supabase.rpc('increment_blog_like', {
		p_slug: slug,
		p_delta: delta,
	});

	if (error) {
		console.error('Failed to update blog likes:', error);
		return null;
	}
	return firstRow(data);
}
