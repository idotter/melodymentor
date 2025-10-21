import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Die `load`-Funktion holt die Daten für die Dashboard-Seite.
export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	// **FINALE KORREKTUR: Paranoider Sicherheits-Check**
	// Wir vertrauen nicht mehr nur dem Wächter, sondern prüfen hier erneut.
	// Wenn kein Benutzer da ist, existiert die Seite für uns nicht.
	if (!user) {
		throw redirect(303, '/login');
	}

	// Lade die Klassen nur, wenn wir sicher einen Benutzer haben.
	const { data: classes, error } = await supabase
		.from('classes')
		.select('*')
		.eq('owner_id', user.id);

	if (error) {
		console.error('Fehler beim Laden der Klassen:', error);
		// Gib im Fehlerfall eine leere Liste zurück, um einen Absturz zu verhindern.
		return { classes: [], user };
	}

	return { classes, user };
};

export const actions: Actions = {
	// Die Logout-Funktion ist korrekt und bleibt unverändert.
	logout: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
		throw redirect(303, '/login');
	},

	// Die createClass-Funktion ist korrekt und bleibt unverändert.
	createClass: async ({ request, locals: { supabase, user } }) => {
		// Auch hier fügen wir einen paranoiden Check hinzu.
		if (!user) {
			return fail(401, { error: true, message: 'Nicht autorisiert.' });
		}

		const formData = await request.formData();
		const className = formData.get('className') as string;

		if (!className) {
			return fail(400, { error: true, message: 'Klassenname darf nicht leer sein.' });
		}

		const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();

		const { error } = await supabase.from('classes').insert({
			name: className,
			owner_id: user.id,
			class_code: classCode
		});

		if (error) {
			return fail(500, {
				error: true,
				message: 'Klasse konnte nicht erstellt werden: ' + error.message
			});
		}

		return { success: true };
	}
};

