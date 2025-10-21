import { createClient } from '@supabase/supabase-js';
import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

import type { Actions } from './$types';

// Der Code aus der supabaseClient.ts Datei ist jetzt direkt hier drin.
// Das eliminiert das Import-Problem endgültig.
const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

export const actions: Actions = {
	register: async ({ request }) => {
		const body = Object.fromEntries(await request.formData());

		const { error: err } = await supabase.auth.signUp({
			email: body.email as string,
			password: body.password as string,
            options: {
                data: {
                    full_name: body.full_name as string
                }
            }
		});

		if (err) {
			if (err instanceof AuthApiError && err.status === 400) {
				return fail(400, {
					error: 'Ungültige E-Mail oder Passwort.'
				});
			}
			return fail(500, {
				error: 'Serverfehler. Bitte versuchen Sie es später erneut.'
			});
		}

		throw redirect(303, '/');
	}
};

