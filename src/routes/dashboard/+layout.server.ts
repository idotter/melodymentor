import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

// Diese `load`-Funktion agiert als "Wächter" für alle Seiten
// innerhalb des /dashboard-Verzeichnisses.
export const load: LayoutServerLoad = async ({ locals: { user } }) => {
	// Wenn `hooks.server.ts` keinen eingeloggten Benutzer findet...
	if (!user) {
		// ...leite den Benutzer sofort zur Login-Seite um.
		// Das verhindert den 500-Error auf den Dashboard-Seiten.
		throw redirect(303, '/login');
	}

	// Wenn ein Benutzer da ist, geben wir ihn an die Seite weiter.
	return {
		user
	};
};

