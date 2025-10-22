import { error as svelteError, fail, json } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
	// ... (load function unverändert, ruft get_songs_with_ratings auf) ...
	const classId = params.id;
	const { data: classData, error: classError } = await supabase.from('classes').select('*').eq('id', classId).single();
	if (classError) throw svelteError(404, { message: 'Klasse nicht gefunden.' });
	const userIdForRating = user?.id ?? '00000000-0000-0000-0000-000000000000';
	// Wir rufen jetzt die Funktion auf, die wir im SQL-Editor erstellt haben.
	const { data: songs, error: songsError } = await supabase.rpc('get_songs_with_ratings', {
		p_class_id: classId,
		p_user_id: userIdForRating // Verwende die Variable hier
	});
	if (songsError) { console.error('Fehler Songs laden:', songsError); return { classData, songs: [] }; }
	return { classData, songs: songs || [] };
};

export const actions: Actions = {
	// **saveSongMetadata überarbeitet für Lehrer vs. Schüler**
	saveSongMetadata: async ({ request, locals: { supabase, user }, params }) => {
		// Prüfung auf eingeloggten User (egal ob Lehrer oder anonym)
		if (!user) {
			return fail(401, { message: 'Du musst eingeloggt sein oder einer Klasse beigetreten sein.', error: true });
		}

		const classId = params.id;
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const artist = formData.get('artist') as string;
		const filePath = formData.get('filePath') as string;

		if (!title || !artist || !filePath) {
			return fail(400, { message: 'Fehlende Metadaten.', error: true });
		}

		// Standard-Status ist 'pending'
		let songStatus: 'pending' | 'approved' = 'pending';
		// Uploader-Info ist standardmässig die User ID (kann anonym sein)
		let uploaderIdentifier = user.id;

		// Prüfe, ob der User der Besitzer der Klasse ist (also Lehrer)
		const { data: classOwnerData, error: ownerError } = await supabase
			.from('classes')
			.select('owner_id')
			.eq('id', classId)
			.single();

		if (ownerError) {
			console.error("Fehler beim Prüfen des Klassenbesitzers:", ownerError);
			// Wir verwenden hier fail statt json, da dies eine Form Action ist
			return fail(500, { message: "Konnte Klassenbesitzer nicht überprüfen.", error: true });
		}

		// Wenn der User der Besitzer ist UND NICHT anonym...
		if (!user.is_anonymous && classOwnerData?.owner_id === user.id) {
			songStatus = 'approved'; // Lehrer dürfen direkt genehmigen
			uploaderIdentifier = user.email ?? user.id; // Nimm E-Mail, wenn vorhanden
		} else {
            // Wenn es ein anonymer User ist, stelle sicher, dass die uploader_info seine ID ist
            uploaderIdentifier = user.id;
        }


		// Füge den Song mit dem ermittelten Status und Uploader-Info ein
		const { error: dbError } = await supabase.from('songs').insert({
			title,
			artist,
			class_id: parseInt(classId, 10),
			audio_url: filePath,
			uploader_info: uploaderIdentifier, // Kann anonyme ID oder Lehrer-E-Mail sein
			status: songStatus // 'pending' für Schüler, 'approved' für Lehrer
		});

		if (dbError) {
			// Gib spezifischen RLS Fehler zurück, falls es daran liegt
			if (dbError.code === '42501') { // RLS violation code
				return fail(403, { message: 'Du hast keine Berechtigung, diesen Song hochzuladen. (' + dbError.message + ')', error: true });
			}
			return fail(500, { message: `Song DB Error: ${dbError.message}`, error: true });
		}

		// WICHTIG: Gib success:true zurück, damit das Frontend weiß, dass es geklappt hat
		return { success: true };
	},

	// deleteSong (unverändert)
	deleteSong: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Nicht autorisiert.' });
		const formData = await request.formData();
		const songId = formData.get('songId') as string;
		const songPath = formData.get('songPath') as string;
		if (!songId || !songPath) return fail(400, { message: 'Fehlende Song-ID/Pfad.' });
		const { error: storageError } = await supabase.storage.from('songs').remove([songPath]);
		if (storageError) console.warn('Storage Delete Error:', storageError.message);
		const { error: dbError } = await supabase.from('songs').delete().eq('id', songId);
		if (dbError) return fail(500, { message: 'Song DB Delete Error: ' + dbError.message });
		return { success: true };
	},

	// rateSong (unverändert)
	rateSong: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Nicht autorisiert.' });
		const formData = await request.formData();
		const songId = formData.get('songId') as string;
		const ratingValue = formData.get('ratingValue') as string;
		if (!songId || !ratingValue) return fail(400, { message: 'Fehlende Song-ID/Bewertung.' });
		const ratingNumeric = parseInt(ratingValue); const songIdNumeric = parseInt(songId);
		const { data: existingRating, error: selectError } = await supabase.from('ratings').select('id').eq('song_id', songIdNumeric).eq('user_id', user.id).maybeSingle();
		if (selectError) { console.error("Fehler beim Prüfen:", selectError); return fail(500, { message: 'Fehler Abrufen Bewertung: ' + selectError.message }); }
		let dbError = null;
		if (existingRating) { const { error: updateError } = await supabase.from('ratings').update({ rating_value: ratingNumeric }).eq('id', existingRating.id); dbError = updateError; } else { const { error: insertError } = await supabase.from('ratings').insert({ song_id: songIdNumeric, user_id: user.id, rating_value: ratingNumeric }); dbError = insertError; }
		if (dbError) { console.error("Fehler beim Speichern:", dbError); return fail(500, { message: 'Bewertung Speichern Error: ' + dbError.message }); }
		return { success: true };
	}
};

