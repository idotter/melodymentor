import { error as svelteError, fail, json } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
	// **KORREKTUR:** Wir entfernen den strengen Wächter hier.
	// Die Seite soll auch für nicht eingeloggte Benutzer (Schüler) laden.
	// `user` ist `null`, wenn niemand eingeloggt ist.

	const classId = params.id;

	// Hole Klassendetails
	const { data: classData, error: classError } = await supabase
		.from('classes')
		.select('*')
		.eq('id', classId)
		.single();

	// Wenn Klasse nicht gefunden, immer 404 werfen.
	if (classError) {
		throw svelteError(404, { message: 'Klasse nicht gefunden.' });
	}

	// Hole Songs mit Bewertungen.
	// Wenn kein Benutzer eingeloggt ist (user ist null), übergeben wir eine Standard-UUID,
	// damit die Datenbankfunktion nicht fehlschlägt. Der user_rating wird dann null sein.
	const userIdForRating = user?.id ?? '00000000-0000-0000-0000-000000000000'; // Standard-UUID
	const { data: songs, error: songsError } = await supabase.rpc('get_songs_with_ratings', {
		p_class_id: classId,
		p_user_id: userIdForRating
	});

	if (songsError) {
		console.error('Fehler beim Laden der Songs mit Bewertungen:', songsError);
		// Gib im Fehlerfall eine leere Liste zurück, aber zeige die Klasse trotzdem an.
		return { classData, songs: [], user }; // user mitgeben, falls vorhanden
	}

	// Gib Klasse, Songs und den (möglicherweise null) Benutzer zurück.
	return {
		classData,
		songs: songs || [],
		user // Kann null sein für Schüler
	};
};

// Die Actions bleiben unverändert, da sie immer noch einen eingeloggten Benutzer erfordern.
export const actions: Actions = {
	saveSongMetadata: async ({ request, locals: { supabase, user }, params }) => {
		// Dieser Code wird nur ausgeführt, wenn ein eingeloggter Benutzer (LP)
		// das Formular abschickt. Schüler können dies nicht tun.
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
		const { error } = await supabase.from('ratings').upsert({ song_id: songId, user_id: user.id, rating_value: parseInt(ratingValue) });
		if (error) {
			console.error("Fehler beim Bewerten:", error);
			return fail(500, { message: 'Bewertung konnte nicht gespeichert werden: ' + error.message });
		}
		return { success: true };
	}
};

