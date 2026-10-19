import { json } from '@sveltejs/kit';
import { supabase } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { name, email, message } = await request.json();

	if (!name || !email || !message) {
		return json({ error: 'Missing fields' }, { status: 400 });
	}

	const { error } = await supabase.from('messages').insert({ name, email, message });

	if (error) {
		console.error('Failed to send message:', error);
		return json({ error: 'Failed to send message' }, { status: 500 });
	}

	return json({ ok: true });
};
