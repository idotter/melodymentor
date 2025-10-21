import type { LayoutServerLoad } from './$types';

// Diese Datei ist jetzt überflüssig, da die Seitendatei die Prüfung selbst übernimmt.
// Um sicherzugehen, dass keine alten Reste Probleme machen, leeren wir sie
// und lassen sie nur noch den Benutzer durchreichen.
export const load: LayoutServerLoad = async ({ locals: { user } }) => {
	// Wir geben nur noch den `user` weiter, mehr nicht.
	// Die Hauptseite (`+page.server.ts`) kümmert sich um die Weiterleitung,
	// falls der `user` nicht existiert.
	return {
		user
	};
};

