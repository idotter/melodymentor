import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Die `load`-Funktion holt die Daten, die NUR auf dieser spezifischen Seite angezeigt werden.
export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	// Wir können hier sicher sein, dass `user` existiert,
	// weil unser "Wächter" (`+layout.server.ts`) uns bereits geschützt hat.
	const { data: classes, error } = await supabase
		.from('classes')
		.select('*')
		.eq('owner_id', user!.id); // Das ! sagt TypeScript: "Ich weiss sicher, dass user hier nicht null ist"

	if (error) {
		console.error('Fehler beim Laden der Klassen:', error);
		return { classes: [] };
	}

	return { classes };
};

export const actions: Actions = {
	// KORREKTUR: Die signOut-Methode von @supabase/ssr kümmert sich
	// automatisch um das Löschen der Cookies. Wir müssen nichts mehr manuell tun.
	logout: async ({ locals: { supabase } }) => {
		await supabase.auth.signOut();
		throw redirect(303, '/login');
	},

	// Die createClass-Funktion, die nun auch auf den `user` vom Wächter vertraut.
	createClass: async ({ request, locals: { supabase, user } }) => {
		const formData = await request.formData();
		const className = formData.get('className') as string;

		if (!className) {
			return fail(400, { error: true, message: 'Klassenname darf nicht leer sein.' });
		}

		const classCode = Math.random().toString(36).substring(2, 8).toUpperCase();

		const { error } = await supabase.from('classes').insert({
			name: className,
			owner_id: user!.id,
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

