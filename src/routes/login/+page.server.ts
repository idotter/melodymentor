import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { supabase } from '$lib/supabaseClient';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		if (!email || !password) {
			return fail(400, { message: 'E-Mail und Passwort sind erforderlich.', error: true });
		}

		const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (authError) {
			return fail(401, { message: 'Ungültige Anmeldedaten: ' + authError.message, error: true });
		}

		if (authData.session) {
			// Setze die Auth-Cookies, damit der Benutzer eingeloggt bleibt
			cookies.set('sb-access-token', authData.session.access_token, {
				path: '/',
				secure: process.env.NODE_ENV === 'production',
				httpOnly: true,
				sameSite: 'lax'
			});
			cookies.set('sb-refresh-token', authData.session.refresh_token, {
				path: '/',
				secure: process.env.NODE_ENV === 'production',
				httpOnly: true,
				sameSite: 'lax'
			});
		} else {
			return fail(500, { message: 'Session konnte nicht erstellt werden.', error: true });
		}

		// Erfolgreich! Leite den Benutzer zum Dashboard weiter.
		throw redirect(303, '/dashboard');
	}
};

