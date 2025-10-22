import { error as svelteError, fail } from '@sveltejs/kit'; // json entfernt
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
		console.log('--- saveSongMetadata Action gestartet ---');
		if (!user) {
			console.error('[saveSongMetadata] FEHLER: Kein Benutzer in locals gefunden!');
			// **KORREKTUR:** fail() verwenden für Formularfehler
			return fail(401, { message: 'Nicht autorisiert.', error: true });
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


		if (!title || !artist || !filePath) {
			console.error('[saveSongMetadata] FEHLER: Fehlende Metadaten.');
			// **KORREKTUR:** fail() verwenden für Formularfehler
			return fail(400, { message: 'Fehlende Metadaten.', error: true });
		}

		const insertData = {
			title,
			artist,
			class_id: parseInt(classId, 10),
			audio_url: filePath,
			uploader_info: user.email,
			status: 'approved'
		};
		console.log('[saveSongMetadata] Versuche einzufügen:', insertData);


		const { error: dbError } = await supabase.from('songs').insert(insertData);

		if (dbError) {
			console.error('[saveSongMetadata] Supabase DB Insert Error:', dbError);
			// **KORREKTUR:** fail() verwenden für Formularfehler
			return fail(500, { message: `Song DB Error: ${dbError.message}`, error: true });
		}

		console.log('[saveSongMetadata] Song erfolgreich in DB gespeichert!');
		// **KORREKTUR:** Einfaches Objekt zurückgeben, nicht json()
		return { success: true };
	},

	// deleteSong (bleibt unverändert, verwendet bereits fail() und {success: true})
	deleteSong: async ({ request, locals: { supabase, user } }) => {
		// ... (Code unverändert) ...
	},

	// rateSong (bleibt unverändert, verwendet bereits fail() und {success: true})
	rateSong: async ({ request, locals: { supabase, user } }) => {
		// ... (Code unverändert) ...
	}
};

