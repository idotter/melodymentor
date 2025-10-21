// Diese `load`-Funktion läuft sowohl auf dem Server als auch im Browser.
// Sie ist dafür verantwortlich, die Session-Daten vom Server entgegenzunehmen
// und den Supabase-Client im Browser damit zu initialisieren.

import { supabase } from '$lib/supabaseClient';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, data, depends }) => {
	// `depends` sagt SvelteKit, dass diese Funktion erneut ausgeführt werden soll,
	// wenn sich der Authentifizierungsstatus ändert (z.B. nach Login/Logout).
	depends('supabase:auth');

	// `data` enthält die `session`, die von `+layout.server.ts` bereitgestellt wird.
	const { session } = data;

	// Wenn eine Session vom Server kommt, initialisieren wir den Browser-Client damit.
	if (session) {
		const { data } = await supabase.auth.setSession({
			access_token: session.access_token,
			refresh_token: session.refresh_token
		});
		return { supabase, user: data.user };
	}

	// Wenn keine Session da ist, geben wir `null` zurück.
	return { supabase, user: null };
};

