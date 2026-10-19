import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const { data, error } = await supabase.from('distros').select('id, likes');

	if (error) {
		console.error('Failed to fetch likes:', error);
		return json({ likes: [] }, { status: 500 });
	}

	return json({ likes: data ?? [] });
};

export const POST: RequestHandler = async ({ request }) => {
	const { distroId, delta } = await request.json();

	if (!distroId || (delta !== 1 && delta !== -1)) {
		return json({ error: 'Invalid input' }, { status: 400 });
	}

	const { data, error } = await supabase.rpc('increment_distro_likes', {
		p_id: distroId,
		p_delta: delta,
	});

	if (error) {
		console.error('Failed to update likes:', error);
		return json({ error: 'Failed to update likes' }, { status: 500 });
	}

	return json({ likes: typeof data === 'number' ? data : null });
};
