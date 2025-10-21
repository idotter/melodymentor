import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Die `load`-Funktion holt die Daten für die Dashboard-Seite.
export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	// Wir können sicher sein, dass `user` existiert, da der Wächter uns schützt.
	const { data: classes, error } = await supabase
		.from('classes')
		.select('*')
		.eq('owner_id', user!.id);

	if (error) {
		console.error('Fehler beim Laden der Klassen:', error);
		return { classes: [], user: user };
	}

	return { classes, user: user };
};

export const actions: Actions = {
	// Logout-Funktion
	logout: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
		throw redirect(303, '/login');
	},

	// createClass-Funktion
	createClass: async ({ request, locals: { supabase, user } }) => {
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

