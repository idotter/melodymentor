import type { Handle } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export const handle: Handle = async ({ event, resolve }) => {
	// Lies die Auth-Cookies aus dem Request
	const accessToken = event.cookies.get('sb-access-token');
	const refreshToken = event.cookies.get('sb-refresh-token');

	// Initialisiere locals
	event.locals.session = null;
	event.locals.user = null;

	// Wenn beide Tokens vorhanden sind, versuche die Session zu validieren
	if (accessToken && refreshToken) {
		const { data: { session } } = await supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken
		});
		
		if (session) {
			event.locals.session = session;
			event.locals.user = session.user;
		}
	}
	
	return resolve(event);
};

