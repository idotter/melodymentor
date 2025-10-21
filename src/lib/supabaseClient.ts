
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { supabase } from '$lib/supabaseClient.ts'; // KORREKT: Importiert den zentralen Client

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const fullName = data.get('fullName') as string;

		if (!email || !password || !fullName) {
			return fail(400, {
				message: 'Alle Felder sind erforderlich.',
				error: true,
				data: { fullName, email }
			});
		}

		// Erstelle den Benutzer in Supabase Auth
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				// Leitet den Benutzer nach Klick auf den Bestätigungslink zur Login-Seite
				emailRedirectTo: `${url.origin}/login`
			}
		});

		if (authError) {
			console.error('Supabase Auth Error:', authError.message);
			return fail(500, {
				message: 'Benutzer konnte nicht erstellt werden: ' + authError.message,
				error: true,
				data: { fullName, email }
			});
		}

		if (!authData.user) {
			return fail(500, {
				message: 'Benutzer wurde erstellt, aber es wurden keine Benutzerdaten zurückgegeben.',
				error: true
			});
		}

		// Füge den vollen Namen in die 'profiles'-Tabelle ein
		const { error: profileError } = await supabase
			.from('profiles')
			.update({ full_name: fullName })
			.eq('id', authData.user.id);

		if (profileError) {
			console.error('Supabase Profile Error:', profileError.message);
			// Optional: Hier könnte man den Auth-Benutzer wieder löschen, wenn das Profil fehlschlägt
			return fail(500, {
				message: 'Auth-Benutzer erstellt, aber das Profil konnte nicht aktualisiert werden: ' + profileError.message,
				error: true
			});
		}

		// Erfolgreich! Leite den Benutzer zu einer "Bitte bestätige deine E-Mail"-Seite weiter.
		throw redirect(303, '/check-email');
	}
};

