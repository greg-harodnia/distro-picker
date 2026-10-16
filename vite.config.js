import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	// Bind an explicit loopback address so two Vite dev servers (e.g. this one
	// and slounia) really collide: the second then gets EADDRINUSE and Vite
	// bumps 5173 → 5174 automatically. With the default `localhost` host, Bun
	// quietly binds the other IP family instead, letting both apps share one
	// port number while `localhost` reaches whichever grabbed ::1 first.
	server: {
		host: '127.0.0.1'
	}
});