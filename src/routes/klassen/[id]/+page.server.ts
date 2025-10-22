import { error as svelteError, fail, json } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
	// ... (load function remains unchanged)
	if (!user) {
		throw svelteError(401, { message: 'Du musst eingeloggt sein, um diese Seite zu sehen.' });
	}
	const classId = params.id;
	const { data: classData, error: classError } = await supabase
		.from('classes')
		.select('*')
		.eq('id', classId)
		.single();
	if (classError) {
		throw svelteError(404, { message: 'Klasse nicht gefunden oder du hast keine Berechtigung.' });
	}
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
			console.error('[saveSongMetadata] FEHLER: Kein Benutzer in locals gefunden!');
			// Verwende json() statt fail() für fetch-Antworten
			return json({ success: false, message: 'Nicht autorisiert.' }, { status: 401 });
		} else {
			console.log('[saveSongMetadata] Benutzer-ID aus locals:', user.id);
		}

		const classId = params.id;
		console.log('[saveSongMetadata] Klassen-ID aus params:', classId);

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const artist = formData.get('artist') as string;
		const filePath = formData.get('filePath') as string;
		console.log('[saveSongMetadata] Empfangene Metadaten:', { title, artist, filePath });
		// **DEBUGGING ENDE**


		if (!title || !artist || !filePath) {
			console.error('[saveSongMetadata] FEHLER: Fehlende Metadaten.');
			return json({ success: false, message: 'Fehlende Metadaten.' }, { status: 400 });
		}

		// **DEBUGGING:** Gib die Daten aus, die wir einfügen wollen
		const insertData = {
			title,
			artist,
			// Stelle sicher, dass classId eine Zahl ist, falls die DB das erwartet
			class_id: parseInt(classId, 10),
			audio_url: filePath,
			uploader_info: user.email,
			status: 'approved'
		};
		console.log('[saveSongMetadata] Versuche einzufügen:', insertData);


		const { error: dbError } = await supabase.from('songs').insert(insertData);

		if (dbError) {
			// **DEBUGGING:** Gib den genauen DB-Fehler aus
			console.error('[saveSongMetadata] Supabase DB Insert Error:', dbError);
			// Gib den spezifischen Fehler zurück
			return json({ success: false, message: `Song DB Error: ${dbError.message}` }, { status: 500 });
		}

		console.log('[saveSongMetadata] Song erfolgreich in DB gespeichert!');
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

