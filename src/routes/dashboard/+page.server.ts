import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Die `load`-Funktion wird ausgeführt, bevor die Seite geladen wird.
// Sie holt die Daten, die auf der Seite angezeigt werden sollen.
export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;

	if (!user) {
		throw redirect(303, '/login');
	}

	// KORREKTUR: Verwende `locals.supabase`
	const { data: classes, error } = await locals.supabase
		.from('classes')
		.select('*')
		.eq('owner_id', user.id);

	if (error) {
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

		if (!user) {
			return fail(401, { error: true, message: 'Nicht autorisiert. Bitte erneut einloggen.' });
		}

		const formData = await request.formData();
		const className = formData.get('className') as string;

		if (!className) {
			return fail(400, { error: true, message: 'Klassenname darf nicht leer sein.' });
		}

		const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();

		// KORREKTUR: Verwende `locals.supabase`
		const { error } = await locals.supabase.from('classes').insert({
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

		return { success: true };
	}
};

