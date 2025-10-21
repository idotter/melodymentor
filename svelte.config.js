import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		// **HIER WIRD DER CSP-FEHLER ENDGÜLTIG BEHOBEN**
		// Dies ist der offizielle Weg, die CSP in SvelteKit zu setzen.
		csp: {
			directives: {
				'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
				'style-src': ["'self'", "'unsafe-inline'"],
				'img-src': ['*', 'data:'],
				'font-src': ["'self'", 'data:'],
				'connect-src': ['*'] // Erlaubt Verbindungen zu allen Quellen, inkl. Supabase
			}
		}
	}
};

export default config;

