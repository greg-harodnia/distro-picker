import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';
import type { BlogStats } from '$lib/supabase-types';

export const GET: RequestHandler = async ({ params }) => {
	const { slug } = params;

	const { data, error } = await supabase
		.from('blog_posts')
		.select('slug, views, likes')
		.eq('slug', slug)
		.maybeSingle();

	if (error) {
		console.error('Failed to fetch blog stats:', error);
		return json({ stats: null }, { status: 500 });
	}

	return json({ stats: (data as BlogStats) ?? null });
};
