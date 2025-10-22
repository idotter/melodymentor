<script lang="ts">
	// Importiere die globale CSS-Datei, die Tailwind initialisiert
	import '../app.css'; // << NEU HINZUGEFÜGT

	import type { PageData } from './$types';
	import { onMount } from 'svelte';
    import { invalidate } from '$app/navigation'
	import { createBrowserClient, isBrowser, parse } from '@supabase/ssr'; // Importiere nötige Supabase SSR Funktionen

	export let data: PageData;
	// Initialisiere supabase und session aus den Daten
	let { supabase, session } = data;

	// Sorge dafür, dass supabase und session reaktiv bleiben, falls sich `data` ändert
	$: ({ supabase, session } = data);

	onMount(() => {
		// Dieser Code läuft nur im Browser
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, newSession) => {
			// Wenn sich die Session ändert (z.B. Login/Logout oder Token-Refresh)...
			if (newSession?.expires_at !== session?.expires_at) {
				// ...dann invalidiere die 'supabase:auth'-Abhängigkeit.
				// Das löst die `load`-Funktion in `+layout.ts` erneut aus,
				// welche die neue Session holt und die Seite aktualisiert.
				invalidate('supabase:auth');
			}
		});

		// Wenn die Komponente zerstört wird (z.B. Seitenwechsel), beende das Abo
		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<!-- Das <slot /> rendert den Inhalt der aktuellen Seite -->
<slot />

