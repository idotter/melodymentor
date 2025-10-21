import type { Handle } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export const handle: Handle = async ({ event, resolve }) => {
	// Schritt 1: Lese die Cookies, um die Session wiederherzustellen
	const accessToken = event.cookies.get('sb-access-token');
	const refreshToken = event.cookies.get('sb-refresh-token');

	if (accessToken && refreshToken) {
		await supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken
		});
	}

	// Schritt 2: Lese den Benutzer aus der (möglicherweise wiederhergestellten) Session
	// KORREKTUR: Wir prüfen jetzt sicher, ob `data` und `data.user` existieren,
	// bevor wir darauf zugreifen. Das verhindert den Absturz.
	const { data, error } = await supabase.auth.getUser();
	if (error) {
		// Logge den Fehler für Debugging-Zwecke, aber fahre normal fort.
		console.error('Fehler beim Abrufen des Benutzers im Hook:', error.message);
	}

	if (data?.user) {
		event.locals.user = data.user;
	}

	// Schritt 3: Lade die angeforderte Seite
	const response = await resolve(event);

	// Schritt 4: Setze die korrekte Content-Security-Policy
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src * data:; font-src 'self' data:; connect-src *;"
	);

	// Schritt 5: Gib die Antwort mit dem neuen Header zurück
	return response;
};

