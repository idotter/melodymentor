<!-- Dies ist die Startseite der App. -->
<!-- Wenn ein Lehrer eingeloggt ist, wird er zum Dashboard weitergeleitet. -->
<!-- Ansonsten wird ein Formular zur Eingabe des Klassencodes angezeigt. -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms'; // Für Formularverbesserung

	export let data: PageData;
	export let form: ActionData; // Nimmt Fehlermeldungen vom Server entgegen

	// Prüfe beim Laden der Seite, ob ein Lehrer eingeloggt ist
	onMount(() => {
		// data.user kommt von der `load`-Funktion in +page.server.ts
		if (data.user) {
			goto('/dashboard', { replaceState: true }); // Leite Lehrer zum Dashboard
		}
	});
</script>

<!-- Zeige das Beitritts-Formular nur an, wenn kein Benutzer eingeloggt ist -->
{#if !data.user}
	<div class="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4">
		<div class="bg-white p-8 sm:p-10 rounded-xl shadow-2xl max-w-md w-full text-center">
			<svg class="mx-auto h-16 w-auto text-pink-500 mb-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9 18V5l12-2v13" />
				<circle cx="6" cy="18" r="3" />
				<circle cx="18" cy="16" r="3" />
			</svg>
			<h1 class="text-3xl font-extrabold text-gray-900 mb-2">Willkommen bei MelodyMentor!</h1>
			<p class="text-gray-600 mb-8">Gib den Klassencode ein, um zur Hitparade zu gelangen.</p>

			<form method="POST" action="?/joinClass" use:enhance class="space-y-6">
				<div>
					<label for="classCode" class="sr-only">Klassencode</label>
					<input
						type="text"
						name="classCode"
						id="classCode"
						required
						placeholder="ABC-DEF"
						class="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-center text-lg font-mono uppercase tracking-widest"
					/>
				</div>
				<button type="submit" class="w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors shadow-lg text-lg">
					Beitreten
				</button>
				{#if form?.error}
					<p class="text-red-500 text-sm mt-4">{form.message}</p>
				{/if}
			</form>
		</div>
	</div>
{/if}

