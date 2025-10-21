import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';

// Wir verwenden jetzt wieder den sauberen Standard-Alias "$lib", der dank der tsconfig.json funktioniert.
import { supabase } from '$lib/supabaseClient';

import type { Actions } from './$types';

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

