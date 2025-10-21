import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabase } from '$lib/supabaseClient';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = locals;
	const classId = params.id;

	// Hole die Details der spezifischen Klasse
	const { data: classData, error: classError } = await supabase
		.from('classes')
		.select('*')
		.eq('id', classId)
		.single(); // .single() holt nur einen einzelnen Datensatz

	if (classError || !classData) {
		console.error('Fehler beim Laden der Klasse:', classError);
		return fail(404, { message: 'Klasse nicht gefunden.' });
	}

	// Hole alle Songs, die zu dieser Klasse gehören
	const { data: songs, error: songsError } = await supabase
		.from('songs')
		.select('*')
		.eq('class_id', classId);
		// Optional: Nach Bewertungen sortieren, sobald wir sie haben
		// .order('average_rating', { ascending: false });

	if (songsError) {
		console.error('Fehler beim Laden der Songs:', songsError);
	}

	return {
		user,
		classData,
		songs: songs || []
	};
};

export const actions: Actions = {
	uploadSong: async ({ request, locals, params }) => {
		const { user } = locals;
		const classId = params.id;

		if (!user) {
			return fail(401, { error: true, message: 'Nicht autorisiert.' });
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const artist = formData.get('artist') as string;
		const audioFile = formData.get('audioFile') as File;

		if (!title || !artist || !audioFile || audioFile.size === 0) {
			return fail(400, { error: true, message: 'Alle Felder und eine Audio-Datei sind erforderlich.' });
		}

		// 1. Lade die Audio-Datei in Supabase Storage hoch
		const filePath = `${user.id}/${classId}/${Date.now()}-${audioFile.name}`;
		const { error: uploadError } = await supabase.storage.from('songs').upload(filePath, audioFile);

		if (uploadError) {
			console.error('Fehler beim Hochladen der Datei:', uploadError);
			return fail(500, { error: true, message: 'Datei konnte nicht hochgeladen werden.' });
		}

		// 2. Hole die öffentliche URL der hochgeladenen Datei
		const { data: urlData } = supabase.storage.from('songs').getPublicUrl(filePath);

		// 3. Speichere die Song-Metadaten in der 'songs'-Datenbanktabelle
		const { error: dbError } = await supabase.from('songs').insert({
			title,
			artist,
			class_id: classId,
			audio_url: urlData.publicUrl,
			uploader_info: user.email, // Speichern, wer den Song hochgeladen hat
			status: 'approved' // Als LP laden wir direkt als 'approved' hoch
		});

		if (dbError) {
			console.error('Fehler beim Speichern des Songs in der DB:', dbError);
			// Optional: Lösche die hochgeladene Datei wieder, wenn der DB-Eintrag fehlschlägt
			await supabase.storage.from('songs').remove([filePath]);
			return fail(500, { error: true, message: 'Song konnte nicht in der Datenbank gespeichert werden.' });
		}

		return { success: true };
	}
};
