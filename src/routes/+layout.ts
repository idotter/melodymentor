import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createBrowserClient, isBrowser, parse, serialize } from '@supabase/ssr';
import type { LayoutLoad } from './$types';

// Diese `load`-Funktion ist das Herzstück der offiziellen Supabase-Architektur.
export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	// `depends('supabase:auth')` sorgt dafür, dass diese Funktion erneut ausgeführt wird,
	// wenn sich der Login-Status ändert.
	depends('supabase:auth');

	// Initialisiert den Supabase-Client für den Browser.
	// Die Cookie-Methoden sind wichtig für die automatische Verwaltung.
	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch
		},
		cookies: {
			get(key) {
				if (!isBrowser()) {
					// Auf dem Server: Verwende die Session-Daten, die vom Server-Hook kommen.
					return JSON.stringify(data.session);
				}
				// Im Browser: Lese die Cookies direkt.
				const cookie = parse(document.cookie);
				return cookie[key];
			},
			set(key, value, options) {
				if (!isBrowser()) return;
				document.cookie = serialize(key, value, { ...options, path: '/' }); // Path hinzugefügt
			},
			remove(key, options) {
				if (!isBrowser()) return;
				document.cookie = serialize(key, '', { ...options, path: '/', maxAge: -1 }); // Path hinzugefügt
			}
		}
	});

	// **FINALE KORREKTUR:** Wir holen die Session NICHT erneut im Browser-Layout.
	// Wir verlassen uns auf `data.session`, das vom Server (`+layout.server.ts`) kommt.
	const { session } = data;

	// Gib den Client und die vom Server gelieferte Session weiter.
	// Der 'user' wird daraus abgeleitet.
	return { supabase, session, user: session?.user ?? null };
};

