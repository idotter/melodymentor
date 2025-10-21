import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		// **HIER WIRD DER CSP-FEHLER ENDGÜLTIG BEHOBEN**
		csp: {
			directives: {
				'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
				'style-src': ["'self'", "'unsafe-inline'"],
				'img-src': ['*', 'data:'],
				'font-src': ["'self'", 'data:'],
				'connect-src': ['*']
			}
		}
	}
};

export default config;

