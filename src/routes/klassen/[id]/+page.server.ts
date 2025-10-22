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
	// saveSongMetadata (bleibt unverändert)
	saveSongMetadata: async ({ request, locals: { supabase, user }, params }) => {
		// ... (Code unverändert) ...
		if (!user) return fail(401, { message: 'Nicht autorisiert.' });
		const classId = params.id;
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const artist = formData.get('artist') as string;
		const filePath = formData.get('filePath') as string;
		if (!title || !artist || !filePath) {
			return fail(400, { message: 'Fehlende Metadaten.', error: true });
		}
		const insertData = { title, artist, class_id: parseInt(classId, 10), audio_url: filePath, uploader_info: user.email, status: 'approved' };
		const { error: dbError } = await supabase.from('songs').insert(insertData);
		if (dbError) {
			return fail(500, { message: `Song DB Error: ${dbError.message}`, error: true });
		}
		return { success: true };
	},

	// deleteSong (bleibt unverändert)
	deleteSong: async ({ request, locals: { supabase, user } }) => {
		// ... (Code unverändert) ...
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

	// **rateSong Action (Überarbeitet: Explizites Update/Insert statt upsert)**
	rateSong: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Nicht autorisiert.' });

		const formData = await request.formData();
		const songId = formData.get('songId') as string;
		const ratingValue = formData.get('ratingValue') as string;

		if (!songId || !ratingValue) {
			return fail(400, { message: 'Fehlende Song-ID oder Bewertung.' });
		}

		const ratingNumeric = parseInt(ratingValue);
		const songIdNumeric = parseInt(songId); // Falls songId als String kommt

		// 1. Prüfe, ob bereits eine Bewertung existiert
		const { data: existingRating, error: selectError } = await supabase
			.from('ratings')
			.select('id') // Wir brauchen nur die ID, um zu wissen, ob es existiert
			.eq('song_id', songIdNumeric)
			.eq('user_id', user.id)
			.maybeSingle(); // Gibt null zurück, wenn nichts gefunden wird

		if (selectError) {
			console.error("Fehler beim Prüfen auf existierende Bewertung:", selectError);
			return fail(500, { message: 'Fehler beim Abrufen der Bewertung: ' + selectError.message });
		}

		let dbError = null;

		if (existingRating) {
			// 2a. Bewertung existiert -> UPDATE
			console.log(`[rateSong] Aktualisiere Bewertung für Song ${songIdNumeric} von User ${user.id} auf ${ratingNumeric}`);
			const { error: updateError } = await supabase
				.from('ratings')
				.update({ rating_value: ratingNumeric })
				.eq('id', existingRating.id); // Update über die gefundene ID
			dbError = updateError;
		} else {
			// 2b. Bewertung existiert nicht -> INSERT
			console.log(`[rateSong] Füge neue Bewertung für Song ${songIdNumeric} von User ${user.id} mit Wert ${ratingNumeric} ein`);
			const { error: insertError } = await supabase
				.from('ratings')
				.insert({
					song_id: songIdNumeric,
					user_id: user.id,
					rating_value: ratingNumeric
				});
			dbError = insertError;
		}

		// 3. Fehlerbehandlung
		if (dbError) {
			console.error("Fehler beim Speichern der Bewertung (Update/Insert):", dbError);
			return fail(500, { message: 'Bewertung konnte nicht gespeichert werden: ' + dbError.message });
		}

		return { success: true };
	}
};

