import { error as svelteError, fail, json } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// **KORREKTUR:** Diese Funktion verlässt sich nur noch auf `locals`.
export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
	const classId = params.id;
	console.log(`[klassen/+page.server.ts load] Starte Datenladung für Klasse ${classId}`); // DEBUGGING

	// **FINALE KORREKTUR V3: Explizite User-Prüfung VOR RPC**
	// Obwohl das Layout uns schützen sollte, stellen wir hier absolut sicher,
	// dass wir einen User haben, bevor wir seine ID verwenden.
	// Wichtig: Auch anonyme User haben eine ID! user ist null, wenn *niemand* authentifiziert ist.
	const userIdForRating = user?.id ?? '00000000-0000-0000-0000-000000000000'; // Standard-UUID für Gäste
	console.log(`[klassen/+page.server.ts load] User ID für RPC: ${userIdForRating}`); // DEBUGGING


	// Hole Klassendetails (unverändert)
	const { data: classData, error: classError } = await supabase
		.from('classes')
		.select('*')
		.eq('id', classId)
		.single();

	if (classError) {
		console.error(`[klassen/+page.server.ts load] Fehler beim Laden der Klasse ${classId}:`, classError);
		throw svelteError(404, { message: 'Klasse nicht gefunden.' });
	}
	console.log(`[klassen/+page.server.ts load] Klasse ${classId} gefunden:`, classData?.name);


	// Hole Songs mit Bewertungen. Verwende die User-ID aus locals (oder Standard).
	const { data: songs, error: songsError } = await supabase.rpc('get_songs_with_ratings', {
		p_class_id: classId,
		p_user_id: userIdForRating // Verwende die Variable hier
	});

	if (songsError) {
		console.error(`[klassen/+page.server.ts load] Fehler beim RPC-Aufruf für Klasse ${classId}:`, songsError);
		return { classData, songs: [] };
	}

	console.log(`[klassen/+page.server.ts load] ${songs?.length ?? 0} Songs via RPC gefunden für Klasse ${classId}.`);


	// Gib Klasse, Songs zurück. user/session kommen vom Layout.
	return {
		classData,
		songs: songs || []
		// Wir müssen user hier nicht mehr extra zurückgeben, da er vom Layout kommt
	};
};

// Actions bleiben unverändert
export const actions: Actions = {
	saveSongMetadata: async ({ request, locals: { supabase, user }, params }) => {
		console.log('[klassen/+page.server.ts saveSongMetadata] Action gestartet'); // DEBUGGING
		if (!user) {
			console.error('[saveSongMetadata] FEHLER: Kein Benutzer in locals gefunden!');
			return fail(401, { message: 'Nicht autorisiert.', error: true });
		}
		// ... Rest der Funktion ...
		const classId = params.id;
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const artist = formData.get('artist') as string;
		const filePath = formData.get('filePath') as string;
		if (!title || !artist || !filePath) {
			return fail(400, { message: 'Fehlende Metadaten.', error: true });
		}
		// Bestimme Status basierend auf User-Typ
		let songStatus: 'pending' | 'approved' = 'pending';
		let uploaderIdentifier = user.id;
		const { data: classOwnerData } = await supabase.from('classes').select('owner_id').eq('id', classId).single();
		if (!user.is_anonymous && classOwnerData?.owner_id === user.id) {
			songStatus = 'approved';
			uploaderIdentifier = user.email ?? user.id;
		}

		const insertData = { title, artist, class_id: parseInt(classId, 10), audio_url: filePath, uploader_info: uploaderIdentifier, status: songStatus };
		const { error: dbError } = await supabase.from('songs').insert(insertData);
		if (dbError) {
			console.error('[saveSongMetadata] Supabase DB Insert Error:', dbError);
			return fail(500, { message: `Song DB Error: ${dbError.message}`, error: true });
		}
		console.log('[saveSongMetadata] Song erfolgreich in DB gespeichert!');
		return { success: true };
	},

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

	rateSong: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Nicht autorisiert.' });
		const formData = await request.formData();
		const songId = formData.get('songId') as string;
		const ratingValue = formData.get('ratingValue') as string;
		if (!songId || !ratingValue) return fail(400, { message: 'Fehlende Song-ID/Bewertung.' });
		const ratingNumeric = parseInt(ratingValue); const songIdNumeric = parseInt(songId);
		const ratingData = { song_id: songIdNumeric, user_id: user.id, rating_value: ratingNumeric };
		console.log(`[rateSong] Versuche Upsert mit Daten:`, ratingData); // DEBUGGING
		const { error } = await supabase.from('ratings').upsert(ratingData, { onConflict: 'song_id, user_id' });
		if (error) {
			console.error("Fehler beim Speichern der Bewertung (Upsert):", error);
			if (error.code === '42501') { return fail(403, { message: 'Berechtigungsfehler: ' + error.message }); }
			return fail(500, { message: 'Bewertung Error: ' + error.message });
		}
		console.log(`[rateSong] Bewertung erfolgreich gespeichert/aktualisiert.`); // DEBUGGING
		return { success: true };
	}
};

