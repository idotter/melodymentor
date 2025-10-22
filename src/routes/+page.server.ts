import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { user } }) => {
	// Leitet eingeloggte Lehrer direkt zum Dashboard weiter
	// Anonyme User bleiben hier, um Code einzugeben
	if (user && !user.is_anonymous) {
		throw redirect(303, '/dashboard');
	}
	return { user }; // user kann null oder ein anonymer User sein
};

export const actions: Actions = {
	joinClass: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const classCode = (formData.get('classCode') as string)?.toUpperCase().trim();

		if (!classCode) {
			return fail(400, { error: true, message: 'Bitte gib einen Klassencode ein.', classCode });
		}

		// 1. Klasse finden (unverändert)
		const { data: classData, error: findError } = await supabase
			.from('classes')
			.select('id')
			.eq('class_code', classCode)
			.single();

		if (findError || !classData) {
			console.error('Fehler bei Klassensuche oder Code nicht gefunden:', findError);
			return fail(404, { error: true, message: 'Ungültiger Klassencode.', classCode });
		}

		// **NEU: Anonymen Benutzer anmelden**
		// Supabase kümmert sich um das Setzen der nötigen Cookies für die anonyme Session.
		const { error: anonError } = await supabase.auth.signInAnonymously();

		if (anonError) {
			console.error('Fehler beim anonymen Login:', anonError);
			return fail(500, { error: true, message: 'Konnte der Klasse nicht beitreten (Auth-Fehler).', classCode });
		}

		// 3. Zur Klasse weiterleiten (unverändert)
		throw redirect(303, `/klassen/${classData.id}`);
	}
};

