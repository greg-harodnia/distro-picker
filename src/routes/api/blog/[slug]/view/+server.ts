import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';
import type { BlogStats } from '$lib/supabase-types';

function firstRow(data: unknown): BlogStats | null {
	const row = Array.isArray(data) ? data[0] : data;
	return (row as BlogStats | undefined) ?? null;
}

export const POST: RequestHandler = async ({ params }) => {
	const { slug } = params;

	const { data, error } = await supabase.rpc('increment_blog_view', { p_slug: slug });

	if (error) {
		console.error('Failed to add blog view:', error);
		return json({ stats: null }, { status: 500 });
	}

	return json({ stats: firstRow(data) });
};
