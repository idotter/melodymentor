import { AuthApiError } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';

// Die Import-Anweisung wurde angepasst, um den direkten Pfad zu verwenden.
import { supabase } from '../../lib/supabaseClient.ts';

import type { Actions } from './$types';

export const actions: Actions = {
	register: async ({ request, locals }) => {
		const body = Object.fromEntries(await request.formData());

		// Hinweis: In SvelteKit wird `locals.supabase` oft durch "Hooks" bereitgestellt.
		// Da wir das noch nicht konfiguriert haben, verwenden wir hier direkt den importierten `supabase` Client.
		const { data, error: err } = await supabase.auth.signUp({
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

