// Diese Datei definiert die globalen Typen für unsere SvelteKit-Anwendung.
// Sie ist entscheidend, damit TypeScript versteht, welche Daten in `event.locals`
// und `data` auf jeder Seite verfügbar sind.

import type { SupabaseClient, User, Session } from '@supabase/supabase-js';

declare global {
	namespace App {
		// interface Error {}

		// Definiert die `locals`-Eigenschaft, die auf dem Server verfügbar ist.
		// `hooks.server.ts` ist dafür verantwortlich, diese Eigenschaften zu befüllen.
		interface Locals {
			supabase: SupabaseClient;
			user: User | null;
			session: Session | null;
		}

		// Definiert die `PageData`-Eigenschaft, die für jede Seite geladen wird.
		// `+layout.server.ts` und `+layout.ts` übergeben hier die Session-Daten.
		interface PageData {
			session: Session | null;
		}

		// interface Platform {}
	}
}

export {};

