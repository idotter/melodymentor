import type { Handle } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export const handle: Handle = async ({ event, resolve }) => {
	// Schritt 1: Lese die Cookies, um die Session wiederherzustellen (bleibt unverändert)
	const accessToken = event.cookies.get('sb-access-token');
	const refreshToken = event.cookies.get('sb-refresh-token');

	if (accessToken && refreshToken) {
		await supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken
		});
	}

	// Lese den Benutzer aus der (möglicherweise wiederhergestellten) Session
	const { data: { user } } = await supabase.auth.getUser();
	if (user) {
		event.locals.user = user;
	}

	// Schritt 2: Lade die angeforderte Seite
	const response = await resolve(event);

	// Schritt 3: Setze die korrekte Content-Security-Policy
	// Dies ist der offizielle SvelteKit-Weg, um Header zu setzen.
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src * data:; font-src 'self' data:; connect-src *;"
	);

	// Schritt 4: Gib die Antwort mit dem neuen Header zurück
	return response;
};

