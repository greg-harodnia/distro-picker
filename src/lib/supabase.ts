import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lsydfkkkjazznplskovm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeWRma2tramF6em5wbHNrb3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODE3ODMsImV4cCI6MjA4ODU1Nzc4M30.HqKyYDSCscHztQfd71e5D1C1E-IsKPyxxfYQquM0dyw';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchLikes(): Promise<Array<{ id: string; likes: number }>> {
	const { data, error } = await supabase
		.from('distros')
		.select('id, likes');
	
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
		.eq('id', distroId);
	
	if (error) {
		console.error('Failed to update likes:', error);
		return false;
	}
	return true;
}

export async function sendMessage(name: string, email: string, message: string): Promise<boolean> {
	const { error } = await supabase
		.from('messages')
		.insert({ name, email, message });

	if (error) {
		console.error('Failed to send message:', error);
		return false;
	}
	return true;
}

// ---- Blog views & likes ----
// Rows live in the `blog_posts` table (slug PK, views, likes). Insert/update
// uses `upsert` so the first view/like on a post creates its row.

export interface BlogStats {
	slug: string;
	views: number;
	likes: number;
}

export async function fetchBlogStats(slug: string): Promise<BlogStats | null> {
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
	const { data, error } = await supabase.from('blog_posts').select('slug, views, likes');

	if (error) {
		console.error('Failed to fetch blog stats:', error);
		return [];
	}
	return (data as BlogStats[]) || [];
}

/** Counts one view for a post (call once per session from the client). */
export async function addBlogView(slug: string): Promise<BlogStats | null> {
	const current = (await fetchBlogStats(slug)) || { slug, views: 0, likes: 0 };
	const next = { slug, views: current.views + 1, likes: current.likes };

	const { error } = await supabase.from('blog_posts').upsert(next, { onConflict: 'slug' });
	if (error) {
		console.error('Failed to add blog view:', error);
		return null;
	}
	return next;
}

/** Persists the new like count for a post. */
export async function setBlogLikes(slug: string, likes: number): Promise<number | null> {
	const current = (await fetchBlogStats(slug)) || { slug, views: 0, likes: 0 };
	const { error } = await supabase
		.from('blog_posts')
		.upsert({ slug, views: current.views, likes }, { onConflict: 'slug' });

	if (error) {
		console.error('Failed to update blog likes:', error);
		return null;
	}
	return likes;
}
