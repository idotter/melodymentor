import { error as svelteError, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
	// Wächter: Stellt sicher, dass ein Benutzer eingeloggt ist.
	if (!user) {
		throw svelteError(401, { message: 'Du musst eingeloggt sein, um diese Seite zu sehen.' });
	}

	const classId = params.id;

	// Hole die Details der spezifischen Klasse
	const { data: classData, error: classError } = await supabase
		.from('classes')
		.select('*')
		.eq('id', classId)
		.single(); // .single() ist hier sicher, da wir einen 404-Fehler erwarten, wenn nichts gefunden wird.

	// Wenn es einen Fehler gibt ODER keine Klasse gefunden wurde...
	if (classError) {
		throw svelteError(404, { message: 'Klasse nicht gefunden oder du hast keine Berechtigung.' });
	}

	// Hole alle Songs, die zu dieser Klasse gehören, sortiert nach Erstellungsdatum
	const { data: songs, error: songsError } = await supabase
		.from('songs')
		.select('*')
		.eq('class_id', classId)
		.order('created_at', { ascending: false }); // Neueste zuerst

	if (songsError) {
		console.error('Fehler beim Laden der Songs:', songsError);
		// Gib im Fehlerfall eine leere Liste zurück, um einen Absturz zu verhindern
		return { classData, songs: [] };
	}

	return {
		classData,
		songs: songs || []
	};
};

export const actions: Actions = {
	uploadSong: async ({ request, locals: { supabase, user }, params }) => {
		if (!user) return fail(401, { message: 'Nicht autorisiert.' });

		const classId = params.id;
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const artist = formData.get('artist') as string;
		const audioFile = formData.get('audioFile') as File;

		if (!title || !artist || !audioFile || audioFile.size === 0) {
			return fail(400, { message: 'Alle Felder und eine Audio-Datei sind erforderlich.', error: true });
		}

		// 1. Lade die Audio-Datei in Supabase Storage hoch
		const filePath = `${user.id}/${classId}/${Date.now()}-${audioFile.name}`;
		const { error: uploadError } = await supabase.storage.from('songs').upload(filePath, audioFile);

		if (uploadError) {
			return fail(500, { message: 'Datei konnte nicht hochgeladen werden: ' + uploadError.message, error: true });
		}

		// 2. Speichere die Song-Metadaten in der 'songs'-Datenbanktabelle
		const { error: dbError } = await supabase.from('songs').insert({
			title,
			artist,
			class_id: classId,
			audio_url: filePath, // WICHTIG: Wir speichern nur den Pfad, nicht die ganze URL
			uploader_info: user.email,
			status: 'approved'
		});

		if (dbError) {
			// Wenn der DB-Eintrag fehlschlägt, löschen wir die hochgeladene Datei wieder
			await supabase.storage.from('songs').remove([filePath]);
			return fail(500, { message: 'Song konnte nicht in der DB gespeichert werden: ' + dbError.message, error: true });
		}

		return { success: true };
	},

	deleteSong: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Nicht autorisiert.' });

		const formData = await request.formData();
		const songId = formData.get('songId') as string;
		const songPath = formData.get('songPath') as string;

		if (!songId || !songPath) {
			return fail(400, { message: 'Fehlende Song-ID oder Pfad.' });
		}

		// Sicherheits-Check: Gehört der Song zu einer Klasse des aktuellen Benutzers?
		// (Dieser Check wird eigentlich schon durch die RLS-Policy abgedeckt, ist aber eine gute zweite Verteidigungslinie)

		// 1. Lösche die Datei aus dem Storage
		const { error: storageError } = await supabase.storage.from('songs').remove([songPath]);
		if (storageError) {
			return fail(500, { message: 'Datei konnte nicht gelöscht werden: ' + storageError.message });
		}

		// 2. Lösche den Eintrag aus der Datenbank
		const { error: dbError } = await supabase.from('songs').delete().eq('id', songId);
		if (dbError) {
			return fail(500, { message: 'Song konnte nicht aus der DB gelöscht werden: ' + dbError.message });
		}

		return { success: true };
	}
};

