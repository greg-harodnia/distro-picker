import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

/**
 * Server-only Supabase client.
 *
 * This module must never be imported from client code — it lives under
 * `$lib/server` and reads private env vars. The browser talks to the app's
 * own API routes (see `src/routes/api/`), which use this client, so
 * `@supabase/supabase-js` never ships in the client bundle.
 *
 * The anon key is used (not the service-role key) so RLS policies still
 * apply. Set `SUPABASE_ANON_KEY` in `.env.local` / Vercel project settings.
 */

const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
	throw new Error(
		'SUPABASE_ANON_KEY is not set. Add it to .env.local and the Vercel project settings.'
	);
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
	auth: { persistSession: false, autoRefreshToken: false },
});
