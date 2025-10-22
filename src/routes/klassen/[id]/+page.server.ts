import { error as svelteError, fail, json } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
	// Wächter (bleibt unverändert)
	if (!user) {
		throw svelteError(401, { message: 'Du musst eingeloggt sein, um diese Seite zu sehen.' });
	}

	const classId = params.id;

	// Hole Klassendetails (bleibt unverändert)
	const { data: classData, error: classError } = await supabase
		.from('classes')
		.select('*')
		.eq('id', classId)
		.single();

	if (classError) {
		throw svelteError(404, { message: 'Klasse nicht gefunden oder du hast keine Berechtigung.' });
	}

	// Rufe die RPC-Funktion auf, um Songs MIT Bewertungen zu holen.
	const { data: songs, error: songsError } = await supabase.rpc('get_songs_with_ratings', {
		p_class_id: classId,
		p_user_id: user.id
	});

	if (songsError) {
		console.error('Fehler beim Laden der Songs mit Bewertungen:', songsError);
		return { classData, songs: [] };
	}

	return {
		classData,
		songs: songs || []
	};
};

export const actions: Actions = {
	saveSongMetadata: async ({ request, locals: { supabase, user }, params }) => {
		// **DEBUGGING START**
		console.log('--- saveSongMetadata Action gestartet ---');
		if (!user) {
			console.log('FEHLER: Kein Benutzer in locals gefunden!');
			return fail(401, { message: 'Nicht autorisiert.' });
		} else {
			console.log('Benutzer-ID aus locals:', user.id); // Zeigt uns die User-ID
		}

		const classId = params.id;
		console.log('Klassen-ID aus params:', classId); // Zeigt uns die Klassen-ID

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const artist = formData.get('artist') as string;
		const filePath = formData.get('filePath') as string;
		console.log('Empfangene Metadaten:', { title, artist, filePath });
		// **DEBUGGING ENDE**

		if (!title || !artist || !filePath) {
			return json({ success: false, message: 'Fehlende Metadaten.' });
		}

		// **DEBUGGING:** Gib die Daten aus, die wir einfügen wollen
		const insertData = {
			title,
			artist,
			class_id: classId,
			audio_url: filePath,
			uploader_info: user.email,
			status: 'approved'
		};
		console.log('Versuche einzufügen:', insertData);

		const { error: dbError } = await supabase.from('songs').insert(insertData);

		if (dbError) {
			// **DEBUGGING:** Gib den genauen DB-Fehler aus
			console.error('Supabase DB Insert Error:', dbError);
			return json({ success: false, message: 'Song DB Error: ' + dbError.message });
		}

		console.log('Song erfolgreich in DB gespeichert!');
		return json({ success: true });
	},

	// deleteSong (bleibt unverändert)
	deleteSong: async ({ request, locals: { supabase, user } }) => {
		// ... (Code unverändert) ...
	},

	// rateSong (bleibt unverändert)
	rateSong: async ({ request, locals: { supabase, user } }) => {
		// ... (Code unverändert) ...
	}
};

