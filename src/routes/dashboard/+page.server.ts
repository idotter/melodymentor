import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabase } from '$lib/supabaseClient';

// Die `load`-Funktion wird ausgeführt, bevor die Seite geladen wird.
// Sie holt die Daten, die auf der Seite angezeigt werden sollen.
export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;

	// Wenn kein Benutzer eingeloggt ist, sollte das Layout uns bereits umgeleitet haben,
	// aber als doppelte Sicherheit prüfen wir hier nochmals.
	if (!user) {
		throw redirect(303, '/login');
	}

	// Hole alle Klassen aus der Datenbank, die dem aktuell eingeloggten Benutzer gehören.
	const { data: classes, error } = await supabase
		.from('classes')
		.select('*')
		.eq('owner_id', user.id);

	if (error) {
		// Im Fehlerfall geben wir eine leere Liste zurück und loggen den Fehler.
		console.error('Fehler beim Laden der Klassen:', error);
		return { user, classes: [] };
	}

	return { user, classes };
};

export const actions: Actions = {
	// Die 'logout'-Action bleibt unverändert.
	logout: async ({ locals, cookies }) => {
		await locals.supabase.auth.signOut();
		cookies.delete('sb-access-token', { path: '/' });
		cookies.delete('sb-refresh-token', { path: '/' });
		throw redirect(303, '/login');
	},

	// Neue 'createClass'-Action zum Erstellen einer Klasse.
	createClass: async ({ request, locals }) => {
		const { user } = locals;
		const formData = await request.formData();
		const className = formData.get('className') as string;

		if (!className) {
			return fail(400, { error: true, message: 'Klassenname darf nicht leer sein.' });
		}

		// Erzeuge einen zufälligen, einzigartigen Klassencode
		const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();

		const { error } = await supabase.from('classes').insert({
			name: className,
			owner_id: user.id,
			class_code: classCode
		});

		if (error) {
			console.error('Fehler beim Erstellen der Klasse:', error);
			return fail(500, {
				error: true,
				message: 'Klasse konnte nicht erstellt werden: ' + error.message
			});
		}

		// Kein redirect, die Seite lädt nach der Action automatisch neu und zeigt die neue Klasse an.
		return { success: true };
	}
};

