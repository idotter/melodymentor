import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Erstelle einen Supabase-Client für den Server, der Cookies verwalten kann.
	// Dieser wird für jede Anfrage neu erstellt und ist über `event.locals.supabase` verfügbar.
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

	// Hole die Benutzerdaten aus der Session.
	const {
		data: { session }
	} = await event.locals.supabase.auth.getSession();

	// Mache den Benutzer und die Session in `event.locals` für alle Server-Routen verfügbar.
	event.locals.user = session?.user ?? null;
	event.locals.session = session;

	// Filtere Header, um Warnungen zu vermeiden (Standard-Vorgehen).
	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
};

