import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Die `load`-Funktion wird ausgeführt, bevor die Seite geladen wird.
export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	// Lehrer zum Dashboard weiterleiten
	if (user && !user.is_anonymous) {
		throw redirect(303, '/dashboard');
	}

	// Für anonyme User oder nicht eingeloggte: Lade die globalen Top-Songs
	// Rufe die neue Datenbankfunktion auf.
	const { data: topSongs, error: topSongsError } = await supabase
		.rpc('get_top_songs_global', { limit_count: 10 }); // limit_count ist optional, default ist 10

	if (topSongsError) {
		console.error("Fehler beim Laden der globalen Top-Songs:", topSongsError);
		// Gib auch im Fehlerfall ein leeres Array zurück, damit die Seite nicht abstürzt
		return { user, topSongs: [] };
	}

	// Gib den User (null oder anonym) UND die Top-Songs zurück
	return { user, topSongs: topSongs || [] };
};

// Die joinClass Action bleibt unverändert
export const actions: Actions = {
	joinClass: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const classCode = (formData.get('classCode') as string)?.toUpperCase().trim();
		if (!classCode) return fail(400, { error: true, message: 'Code eingeben.', classCode });
		const { data: classData, error } = await supabase.from('classes').select('id').eq('class_code', classCode).single();
		if (error || !classData) return fail(404, { error: true, message: 'Ungültiger Code.', classCode });
		// Anonymen Benutzer anmelden
		const { error: anonError } = await supabase.auth.signInAnonymously();
		if (anonError) return fail(500, { error: true, message: 'Beitritt fehlgeschlagen (Auth).', classCode });
		// Zur Klasse weiterleiten
		throw redirect(303, `/klassen/${classData.id}`);
	}
};

