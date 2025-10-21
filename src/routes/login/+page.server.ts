import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals: { supabase } }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		if (!email || !password) {
			return fail(400, { message: 'E-Mail und Passwort sind erforderlich.', error: true, email });
		}

		// Die signInWithPassword-Methode von @supabase/ssr kümmert sich
		// automatisch um das Setzen der Cookies. Wir müssen nichts mehr manuell tun.
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			return fail(401, { message: 'Ungültige Anmeldedaten: ' + error.message, error: true, email });
		}

		// Nach erfolgreichem Login leiten wir zum Dashboard weiter.
		throw redirect(303, '/dashboard');
	}
};

