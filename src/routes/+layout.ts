import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createBrowserClient, isBrowser, parse } from '@supabase/ssr';
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
			get(key) {
				// **HIER IST DIE LÖSUNG DES 500-ERRORS:**
				// Die `isBrowser()`-Funktion prüft, ob der Code im Browser läuft.
				// Nur dann versuchen wir, auf `document.cookie` zuzugreifen.
				// Wenn der Code auf dem Server läuft (was den Absturz verursacht hat),
				// verwenden wir stattdessen die sicheren `data.session`-Daten,
				// die von `+layout.server.ts` übergeben wurden.
				if (!isBrowser()) {
					return JSON.stringify(data.session);
				}

				const cookie = parse(document.cookie);
				return cookie[key];
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

