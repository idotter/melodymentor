import { error as svelteError, fail, json } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
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
		if (!user) return fail(401, { message: 'Nicht autorisiert.' });

		const classId = params.id;
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const artist = formData.get('artist') as string;
		const filePath = formData.get('filePath') as string;

		if (!title || !artist || !filePath) {
			return json({ success: false, message: 'Fehlende Metadaten.' });
		}

		const { error: dbError } = await supabase.from('songs').insert({
			title,
			artist,
			class_id: classId,
			audio_url: filePath,
			uploader_info: user.email,
			status: 'approved'
		});

		if (dbError) {
			return json({ success: false, message: 'Song konnte nicht in der DB gespeichert werden: ' + dbError.message });
		}

		return json({ success: true });
	},

	deleteSong: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Nicht autorisiert.' });
		const formData = await request.formData();
		const songId = formData.get('songId') as string;
		const songPath = formData.get('songPath') as string;
		if (!songId || !songPath) {
			return fail(400, { message: 'Fehlende Song-ID oder Pfad.' });
		}
		const { error: storageError } = await supabase.storage.from('songs').remove([songPath]);
		if (storageError) {
			return fail(500, { message: 'Datei konnte nicht gelöscht werden: ' + storageError.message });
		}
		const { error: dbError } = await supabase.from('songs').delete().eq('id', songId);
		if (dbError) {
			return fail(500, { message: 'Song konnte nicht aus der DB gelöscht werden: ' + dbError.message });
		}
		return { success: true };
	},

	rateSong: async ({ request, locals: { supabase, user } }) => {
		if (!user) return fail(401, { message: 'Nicht autorisiert.' });
		const formData = await request.formData();
		const songId = formData.get('songId') as string;
		const ratingValue = formData.get('ratingValue') as string;
		if (!songId || !ratingValue) {
			return fail(400, { message: 'Fehlende Song-ID oder Bewertung.' });
		}
		const { error } = await supabase.from('ratings').upsert({
			song_id: songId,
			user_id: user.id,
			rating_value: ratingValue
		});
		if (error) {
			return fail(500, { message: 'Bewertung konnte nicht gespeichert werden: ' + error.message });
		}
		return { success: true };
	}
};

