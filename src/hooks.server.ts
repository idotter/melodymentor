import type { Handle } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
	// **ULTIMATIVE KORREKTUR:** Initialisiere den Supabase Client für JEDE Anfrage
	// und stelle ihn über `event.locals` zur Verfügung.
	// Das eliminiert alle Import-Probleme und ist die offizielle SvelteKit-Methode.
	event.locals.supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	// Lese die Cookies, um die Session wiederherzustellen
	const accessToken = event.cookies.get('sb-access-token');
	const refreshToken = event.cookies.get('sb-refresh-token');

	if (accessToken && refreshToken) {
		await event.locals.supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken
		});
	}

	// Lese den Benutzer aus der (möglicherweise wiederhergestellten) Session
	const { data, error } = await event.locals.supabase.auth.getUser();
	if (data?.user) {
		event.locals.user = data.user;
	}

	// Lade die angeforderte Seite
	const response = await resolve(event);

	// Setze die korrekte Content-Security-Policy
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src * data:; font-src 'self' data:; connect-src *;"
	);

	return response;
};

