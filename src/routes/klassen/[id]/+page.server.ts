    import { error as svelteError, fail, json } from '@sveltejs/kit';
    import type { Actions, PageServerLoad } from './$types';

    export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
    	// ... (load function unverändert)
    	const classId = params.id;
    	const { data: classData, error: classError } = await supabase.from('classes').select('*').eq('id', classId).single();
    	if (classError) throw svelteError(404, { message: 'Klasse nicht gefunden.' });
    	const userIdForRating = user?.id ?? '00000000-0000-0000-0000-000000000000';
    	const { data: songs, error: songsError } = await supabase.rpc('get_songs_with_ratings', { p_class_id: classId, p_user_id: userIdForRating });
    	if (songsError) { console.error('Fehler Songs laden:', songsError); return { classData, songs: [] }; }
    	return { classData, songs: songs || [] };
    };

    export const actions: Actions = {
    	// saveSongMetadata (unverändert)
    	saveSongMetadata: async ({ request, locals: { supabase, user }, params }) => {
    		// ...
    	},

    	// deleteSong (unverändert)
    	deleteSong: async ({ request, locals: { supabase, user } }) => {
    		// ...
    	},

    	// rateSong Action (Überarbeitet: Stellt sicher, dass user.id korrekt übergeben wird)
    	rateSong: async ({ request, locals: { supabase, user } }) => {
    		if (!user) return fail(401, { message: 'Nicht autorisiert.' });

    		const formData = await request.formData();
    		const songId = formData.get('songId') as string;
    		const ratingValue = formData.get('ratingValue') as string;

    		if (!songId || !ratingValue) {
    			return fail(400, { message: 'Fehlende Song-ID oder Bewertung.' });
    		}

    		const ratingNumeric = parseInt(ratingValue);
    		const songIdNumeric = parseInt(songId);

    		// Verwende explizit user.id (welches eine UUID ist) für die user_id Spalte (text)
    		const ratingData = {
    			song_id: songIdNumeric,
    			user_id: user.id, // user.id ist der UUID-String
    			rating_value: ratingNumeric
    		};

    		console.log(`[rateSong] Versuche Upsert mit Daten:`, ratingData); // DEBUGGING

    		// upsert versucht zuerst zu finden, dann einzufügen/aktualisieren
    		const { error } = await supabase
    			.from('ratings')
    			.upsert(ratingData, {
    				onConflict: 'song_id, user_id' // Sage upsert, welche Spalten den Konflikt definieren
    			});


    		if (error) {
    			console.error("Fehler beim Speichern der Bewertung (Upsert):", error);
    			// Spezifische Fehlermeldung für RLS hinzufügen
    			if (error.code === '42501') {
    				return fail(403, { message: 'Berechtigungsfehler beim Bewerten: ' + error.message });
    			}
    			return fail(500, { message: 'Bewertung konnte nicht gespeichert werden: ' + error.message });
    		}

    		console.log(`[rateSong] Bewertung erfolgreich gespeichert/aktualisiert.`); // DEBUGGING
    		return { success: true };
    	}
    };
    

