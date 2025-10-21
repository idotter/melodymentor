import type { LayoutServerLoad } from './$types';

// Diese Funktion läuft NUR auf dem Server.
// Ihre einzige Aufgabe ist es, die Session aus `event.locals` zu nehmen
// (die in `hooks.server.ts` gesetzt wurde) und sie an `data` zu übergeben.
// Die `+layout.ts`-Datei kann dann auf `data.session` zugreifen.
export const load: LayoutServerLoad = async ({ locals: { session } }) => {
	return {
		session
	};
};

