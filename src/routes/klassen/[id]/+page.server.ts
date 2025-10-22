import { error as svelteError, fail, json } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
	const classId = params.id;
	console.log(`[klassen/+page.server.ts load] Starte Datenladung für Klasse ${classId}, User: ${user?.id ?? 'Nicht eingeloggt'}`); // DEBUGGING

	// Hole Klassendetails
	const { data: classData, error: classError } = await supabase
		.from('classes')
		.select('*')
		.eq('id', classId)
		.single();

	if (classError) {
		console.error(`[klassen/+page.server.ts load] Fehler beim Laden der Klasse ${classId}:`, classError); // DEBUGGING
		throw svelteError(404, { message: 'Klasse nicht gefunden.' });
	}
	console.log(`[klassen/+page.server.ts load] Klasse ${classId} gefunden:`, classData?.name); // DEBUGGING

	// Hole Songs mit Bewertungen.
	const userIdForRating = user?.id ?? '00000000-0000-0000-0000-000000000000';
	const { data: songs, error: songsError } = await supabase.rpc('get_songs_with_ratings', {
		p_class_id: classId,
		p_user_id: userIdForRating
	});

	if (songsError) {
		console.error(`[klassen/+page.server.ts load] Fehler beim Laden der Songs für Klasse ${classId}:`, songsError); // DEBUGGING
		return { classData, songs: [] }; // Nur Klasse und leere Songs zurückgeben
	}

	// **DEBUGGING:** Gib aus, welche Songs gefunden wurden
	console.log(`[klassen/+page.server.ts load] ${songs?.length ?? 0} Songs gefunden für Klasse ${classId}.`);
	// console.log(songs); // Optional: Ganze Songliste ausgeben

	// Gib Klasse, Songs zurück. user/session kommen vom Layout.
	return {
		classData,
		songs: songs || []
	};
};

// Actions bleiben unverändert
export const actions: Actions = {
	saveSongMetadata: async ({ request, locals: { supabase, user }, params }) => {
		console.log('[klassen/+page.server.ts saveSongMetadata] Action gestartet'); // DEBUGGING
		if (!user) return fail(401, { message: 'Nicht autorisiert.' });
		// ... Rest der Funktion ...
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

	deleteSong: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Nicht autorisiert.' });
		// ... Rest der Funktion ...
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

	rateSong: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Nicht autorisiert.' });
		// ... Rest der Funktion ...
		const formData = await request.formData();
		const songId = formData.get('songId') as string;
		const ratingValue = formData.get('ratingValue') as string;
		if (!songId || !ratingValue) return fail(400, { message: 'Fehlende Song-ID/Bewertung.' });
		const { error } = await supabase.from('ratings').upsert({ song_id: songId, user_id: user.id, rating_value: parseInt(ratingValue) });
		if (error) {
			console.error("Fehler beim Bewerten:", error);
			return fail(500, { message: 'Bewertung konnte nicht gespeichert werden: ' + error.message });
		}
		return { success: true };
	}
};

