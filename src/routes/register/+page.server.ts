import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { supabase } from '$lib/supabaseClient';

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const fullName = data.get('fullName') as string;

		if (!email || !password || !fullName) {
			return fail(400, { message: 'Alle Felder sind erforderlich.', error: true });
		}

		// Erstelle den Benutzer in Supabase Auth
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: `${url.origin}/login` }
		});

		if (authError) {
			return fail(500, { message: 'Benutzer konnte nicht erstellt werden: ' + authError.message, error: true });
		}
		if (!authData.user) {
			return fail(500, { message: 'Benutzerdaten konnten nicht abgerufen werden.', error: true });
		}

		// Füge den vollen Namen in die 'profiles'-Tabelle ein
		const { error: profileError } = await supabase
			.from('profiles')
			.update({ full_name: fullName })
			.eq('id', authData.user.id);

		if (profileError) {
			return fail(500, { message: 'Profil konnte nicht aktualisiert werden: ' + profileError.message, error: true });
		}

		throw redirect(303, '/check-email');
	}
};

