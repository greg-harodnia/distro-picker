import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';
import type { BlogStats } from '$lib/supabase-types';

function firstRow(data: unknown): BlogStats | null {
	const row = Array.isArray(data) ? data[0] : data;
	return (row as BlogStats | undefined) ?? null;
}

export const POST: RequestHandler = async ({ params, request }) => {
	const { slug } = params;
	const { delta } = await request.json();

	if (delta !== 1 && delta !== -1) {
		return json({ error: 'Invalid delta' }, { status: 400 });
	}

	const { data, error } = await supabase.rpc('increment_blog_like', {
		p_slug: slug,
		p_delta: delta,
	});

	if (error) {
		console.error('Failed to update blog likes:', error);
		return json({ error: 'Failed to update likes' }, { status: 500 });
	}

	return json({ stats: firstRow(data) });
};
