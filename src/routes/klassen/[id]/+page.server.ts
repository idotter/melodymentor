import { error as svelteError, fail, json } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { supabase, user } }) => {
	const classId = params.id;
	console.log(`[klassen/+page.server.ts load] Starte Datenladung für Klasse ${classId}`); // DEBUGGING

	// **FINALE KORREKTUR V3: Explizite User-Prüfung VOR RPC**
	// Obwohl das Layout uns schützen sollte, stellen wir hier absolut sicher,
	// dass wir einen User haben, bevor wir seine ID verwenden.
	if (!user) {
		// Dieser Fall sollte eigentlich nie eintreten, da +layout.server.ts umleitet,
		// aber sicher ist sicher.
		console.error(`[klassen/+page.server.ts load] FEHLER: Kein User in locals gefunden, obwohl auf Klassenseite.`);
		throw svelteError(401, { message: 'Authentifizierung fehlgeschlagen.' });
	}
	console.log(`[klassen/+page.server.ts load] User ID für RPC: ${user.id}`); // DEBUGGING


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


	// Hole Songs mit Bewertungen. Verwende die User-ID aus locals.
	const { data: songs, error: songsError } = await supabase.rpc('get_songs_with_ratings', {
		p_class_id: classId,
		p_user_id: user.id // Wir wissen jetzt sicher, dass user.id existiert
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
		// ... (Code unverändert) ...
	},

	deleteSong: async ({ request, locals: { supabase, user } }) => {
		// ... (Code unverändert) ...
	},

	rateSong: async ({ request, locals: { supabase, user } }) => {
		// ... (Code unverändert) ...
	}
};

