import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Die `load`-Funktion gibt einfach den eingeloggten Benutzer zurück (falls vorhanden).
// Das Frontend (`+page.svelte`) entscheidet dann, was angezeigt wird.
export const load: PageServerLoad = async ({ locals: { user } }) => {
	return { user };
};

// **WICHTIG:** Dieses `actions`-Objekt MUSS exportiert werden,
// damit SvelteKit die `joinClass`-Action findet.
export const actions: Actions = {
	// Diese Action wird aufgerufen, wenn das Beitritts-Formular abgeschickt wird.
	joinClass: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		// Stelle sicher, dass der Code in Grossbuchstaben umgewandelt und von Leerzeichen befreit wird
		const classCode = (formData.get('classCode') as string)?.toUpperCase().trim();

		if (!classCode) {
			return fail(400, { error: true, message: 'Bitte gib einen Klassencode ein.', classCode });
		}

		// Suche in der Datenbank nach einer Klasse mit diesem Code.
		const { data: classData, error } = await supabase
			.from('classes')
			.select('id') // Wir brauchen nur die ID für die Weiterleitung
			.eq('class_code', classCode)
			.single(); // Erwarte genau einen Treffer

		if (error || !classData) {
			console.error('Fehler bei Klassensuche oder Code nicht gefunden:', error);
			// Gib den eingegebenen Code zurück, damit das Formular ihn wieder anzeigen kann (optional)
			return fail(404, { error: true, message: 'Ungültiger Klassencode. Bitte überprüfe die Eingabe.', classCode });
		}

		// Klasse gefunden! Leite den Schüler zur Klassen-Ansicht weiter.
		throw redirect(303, `/klassen/${classData.id}`);
	}
};

