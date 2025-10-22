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

	// **FINALE KORREKTUR: Verwende getUser() statt getSession()**
	// getUser() holt die Benutzerdaten und validiert sie gegen den Supabase Auth Server.
	// Das ist die sichere und empfohlene Methode.
	const {
		data: { user } // Wir holen direkt den `user`
	} = await event.locals.supabase.auth.getUser();

	// Wir speichern den (authentifizierten) Benutzer in `locals`
	event.locals.user = user;

	// Wir holen die Session separat, falls wir sie später brauchen (z.B. für RLS, obwohl getUser() meist reicht)
	const {
		data: { session }
	} = await event.locals.supabase.auth.getSession(); // getSession ist hier ok, da wir den User schon haben
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

