import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, url, locals }) => {
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

		// KORREKTUR: Verwende den Supabase Client aus `locals`
		const { data: authData, error: authError } = await locals.supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${url.origin}/login`
			}
		});

		if (authError) {
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

		// KORREKTUR: Verwende den Supabase Client aus `locals`
		const { error: profileError } = await locals.supabase
			.from('profiles')
			.update({ full_name: fullName })
			.eq('id', authData.user.id);

		if (profileError) {
			return fail(500, {
				message:
					'Auth-Benutzer erstellt, aber das Profil konnte nicht aktualisiert werden: ' +
					profileError.message,
				error: true
			});
		}

		throw redirect(303, '/check-email');
	}
};

