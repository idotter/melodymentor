import { error as svelteError, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = locals;
	const classId = params.id;

	// KORREKTUR: Verwende `locals.supabase`
	const { data: classDataArray, error: classError } = await locals.supabase
		.from('classes')
		.select('*')
		.eq('id', classId);

	if (classError || !classDataArray || classDataArray.length === 0) {
		if (classError) console.error('Fehler beim Laden der Klasse:', classError);
		throw svelteError(404, { message: 'Klasse nicht gefunden oder du hast keine Berechtigung.' });
	}

	const classData = classDataArray[0];

	// KORREKTUR: Verwende `locals.supabase`
	const { data: songs, error: songsError } = await locals.supabase
		.from('songs')
		.select('*')
		.eq('class_id', classId);

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

		const filePath = `${user.id}/${classId}/${Date.now()}-${audioFile.name}`;
		// KORREKTUR: Verwende `locals.supabase`
		const { error: uploadError } = await locals.supabase.storage.from('songs').upload(filePath, audioFile);

		if (uploadError) {
			console.error('Fehler beim Hochladen der Datei:', uploadError);
			return fail(500, { error: true, message: 'Datei konnte nicht hochgeladen werden.' });
		}

		const { data: urlData } = locals.supabase.storage.from('songs').getPublicUrl(filePath);

		// KORREKTUR: Verwende `locals.supabase`
		const { error: dbError } = await locals.supabase.from('songs').insert({
			title,
			artist,
			class_id: classId,
			audio_url: urlData.publicUrl,
			uploader_info: user.email,
			status: 'approved'
		});

		if (dbError) {
			console.error('Fehler beim Speichern des Songs in der DB:', dbError);
			await locals.supabase.storage.from('songs').remove([filePath]);
			return fail(500, { error: true, message: 'Song konnte nicht in der Datenbank gespeichert werden.' });
		}

		return { success: true };
	}
};

