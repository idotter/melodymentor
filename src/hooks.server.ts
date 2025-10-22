import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Erstelle einen Supabase-Client für den Server, der Cookies verwalten kann
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => event.cookies.get(key),
			set: (key, value, options) => {
				event.cookies.set(key, value, { ...options, path: '/' });
			},
			remove: (key, options) => {
				event.cookies.delete(key, { ...options, path: '/' });
			}
		}
	});

	// **FINALE KORREKTUR V2: Verwende getUser() ZUERST und ZUVERLÄSSIG**
	// getUser() holt die Benutzerdaten und validiert sie gegen den Supabase Auth Server.
	const {
		data: { user } // Hole den User direkt und authentifiziert
	} = await event.locals.supabase.auth.getUser();

	// Speichere den (authentifizierten) Benutzer in `locals`
	event.locals.user = user;

	// Hole die Session danach (optional, aber nützlich für RLS-Policies, die evtl. `session` brauchen)
	const {
		data: { session }
	} = await event.locals.supabase.auth.getSession();
	event.locals.session = session;


	// Lade die angeforderte Seite
	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			// Supabase SSR braucht dies, um korrekt zu funktionieren
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});

	return response;
};

