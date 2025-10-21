// Diese Layout-Datei agiert als Wächter für alle Seiten unter /dashboard.
// Sie prüft vor dem Laden der Seite, ob ein Benutzer eingeloggt ist.
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Prüfe, ob eine gültige Session vom Hook (hooks.server.ts) übergeben wurde.
	const session = locals.session;

	// Wenn keine Session existiert, leiten wir den Benutzer gnadenlos zur Login-Seite.
	if (!session) {
		throw redirect(303, '/login');
	}

	// Wenn eine Session existiert, geben wir die Benutzerdaten an die Seite weiter,
	// damit wir sie anzeigen können (z.B. "Hallo, user@email.com").
	return {
		user: session.user
	};
};
