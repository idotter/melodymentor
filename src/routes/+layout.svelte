<script lang="ts">
	// Diese Svelte-Komponente ist das Haupt-Layout, das alle Seiten umschliesst.
	// Sie initialisiert den Supabase-Client im Browser und reagiert auf Änderungen
	// im Authentifizierungsstatus (Login, Logout).

	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	// `data` wird von unseren `+layout.ts`- und `+layout.server.ts`-Dateien bereitgestellt.
	export let data: PageData;
	let { supabase, session } = data;

	// Diese reaktive Anweisung sorgt dafür, dass unsere lokalen Variablen `supabase` und `session`
	// immer aktuell sind, wenn sich die `data` von aussen ändern.
	$: ({ supabase, session } = data);

	// `onMount` wird ausgeführt, sobald die Komponente im Browser geladen ist.
	onMount(() => {
		// Wir erstellen einen "Listener", der Supabase über Änderungen im Login-Status informiert.
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, newSession) => {
			// Wenn die neue Session sich von der alten unterscheidet...
			if (newSession?.access_token !== session?.access_token) {
				// ...laden wir die gesamte Seite neu, um sicherzustellen, dass alle
				// Server- und Client-Komponenten den neuen Status korrekt widerspiegeln.
				location.reload();
			}
		});

		// Diese Funktion wird aufgerufen, wenn die Komponente zerstört wird.
		// Sie "meldet" den Listener ab, um Speicherlecks zu vermeiden.
		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<!-- Das `<slot />`-Element ist der Platzhalter, an dem der Inhalt der
     aktuell angezeigten Seite (z.B. /login, /dashboard) gerendert wird. -->
<slot />

