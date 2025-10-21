// Diese Datei enthält die Server-Logik für die Dashboard-Seite,
// in diesem Fall die Logout-Funktion.
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	// Die 'logout'-Action wird aufgerufen, wenn das Formular abgeschickt wird.
	logout: async ({ cookies, locals }) => {
		// Sage Supabase, dass die Session beendet werden soll.
		await locals.supabase.auth.signOut();

		// Lösche die Authentifizierungs-Cookies manuell.
		cookies.delete('sb-access-token', { path: '/' });
		cookies.delete('sb-refresh-token', { path: '/' });

		// Leite den Benutzer zurück zur Login-Seite.
		throw redirect(303, '/login');
	}
};
