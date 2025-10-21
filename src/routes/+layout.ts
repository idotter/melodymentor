import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createBrowserClient, isBrowser, parse, serialize } from '@supabase/ssr';
import type { LayoutLoad } from './$types';

// Diese `load`-Funktion ist das Herzstück der offiziellen Supabase-Architektur.
export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	// `depends('supabase:auth')` sorgt dafür, dass diese Funktion erneut ausgeführt wird,
	// wenn sich der Login-Status ändert. Das ist wichtig für Login/Logout.
	depends('supabase:auth');

	/**
	 * Wir erstellen einen Supabase-Client. Die entscheidende Logik liegt in der
	 * `cookies`-Konfiguration, die den Fehler behebt.
	 */
	const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: {
			fetch
		},
		cookies: {
			// **HIER IST DIE FINALE KORREKTUR:**
			// Die `get`, `set` und `remove` Methoden müssen ALLE implementiert sein,
			// damit der Supabase Client die Cookies korrekt verwalten kann.
			// Der vorherige Code hatte nur `get`.
			get(key) {
				if (!isBrowser()) {
					return JSON.stringify(data.session);
				}
				const cookie = parse(document.cookie);
				return cookie[key];
			},
			set(key, value, options) {
				if (!isBrowser()) return;
				document.cookie = serialize(key, value, options);
			},
			remove(key, options) {
				if (!isBrowser()) return;
				document.cookie = serialize(key, '', { ...options, maxAge: -1 });
			}
		}
	});

	/**
	 * Wir holen die aktuelle Session.
	 * Im Browser wird hier eine Anfrage an Supabase gestellt.
	 * Auf dem Server liest diese Funktion sicher aus den `data.session`-Daten,
	 * ohne eine erneute Anfrage zu stellen.
	 */
	const {
		data: { session }
	} = await supabase.auth.getSession();

	// Wir geben den initialisierten Supabase-Client und die Session an alle
	// untergeordneten Seiten weiter, damit diese darauf zugreifen können.
	return { supabase, session, user: session?.user ?? null };
};

