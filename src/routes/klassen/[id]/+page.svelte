<!-- Zeigt Upload-Formular für alle an, unterscheidet Logik je nach User -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	let { supabase, session, user, classData, songs } = data;
	$: ({ supabase, session, user, classData, songs } = data);

	let currentlyPlayingUrl: string | null = null;
	let audioPlayer: HTMLAudioElement;
	let isUploading = false;

	function playSong(path: string) {
		// ... (unverändert) ...
	}

	async function handleUpload(event: SubmitEvent) {
		console.log('[handleUpload] Gestartet');
		// **KORREKTUR:** Upload ist für ALLE authentifizierten User erlaubt (auch anonyme)
		// Die Prüfung, ob Lehrer oder Schüler, erfolgt jetzt auf dem Server.
		if (!supabase || !session || !user) {
			console.error('[handleUpload] Fehler: Nicht eingeloggt');
			form = { error: true, message: 'Ein Fehler ist aufgetreten. Bitte lade die Seite neu.' };
			return; // Beenden, wenn keine Session/User da ist
		}

		isUploading = true;
		form = undefined;

		const formData = new FormData(event.target as HTMLFormElement);
		const audioFile = formData.get('audioFile') as File;
		const title = formData.get('title') as string;
		const artist = formData.get('artist') as string;

		if (!title || !artist || !audioFile || !audioFile.size) {
			form = { error: true, message: 'Alle Felder und eine Audio-Datei sind erforderlich.' };
			isUploading = false;
			return;
		}

		const sanitizedFileName = audioFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
		const filePath = `${user.id}/${classData?.id}/${Date.now()}-${sanitizedFileName}`;

		// 1. Direkter Upload (unverändert)
		const { error: uploadError } = await supabase.storage
			.from('songs')
			.upload(filePath, audioFile);

		if (uploadError) {
			form = { error: true, message: 'Datei konnte nicht hochgeladen werden: ' + uploadError.message };
			isUploading = false;
			return;
		}

		// 2. Metadaten senden (unverändert, Server entscheidet über Status)
		const metadataForm = new FormData();
		metadataForm.append('title', title);
		metadataForm.append('artist', artist);
		metadataForm.append('filePath', filePath);
		// Wir senden KEINE Info mit, ob Lehrer oder Schüler. Das prüft der Server.

		try {
			const response = await fetch('?/saveSongMetadata', {
				method: 'POST',
				body: metadataForm
			});

			// ... (Restliche Fehlerbehandlung und Erfolgslogik bleibt unverändert) ...
			if (!response.ok) {
				let errorMessage = 'Song konnte nicht gespeichert werden.';
				try { const errorResult = await response.json(); errorMessage = errorResult.message || errorMessage; } catch (e) {}
				form = { error: true, message: errorMessage };
				await supabase.storage.from('songs').remove([filePath]);
			} else {
				const result = await response.json();
				if (result?.type === 'success') {
					invalidateAll();
					(event.target as HTMLFormElement).reset();
					// **NEU:** Feedback für Schüler
					if (user.is_anonymous) {
						alert('Dein Song wurde hochgeladen und wartet auf Freischaltung durch die Lehrperson!'); // Provisorisches Feedback
					}
				} else {
					let errorMessage = 'Fehler nach DB-Speicherung.';
					if (result?.type === 'failure' && result.data?.message) errorMessage = result.data.message;
					else if (result?.message) errorMessage = result.message;
					form = { error: true, message: errorMessage };
					await supabase.storage.from('songs').remove([filePath]);
				}
			}
		} catch (fetchError) {
			form = { error: true, message: 'Netzwerkfehler.' };
			await supabase.storage.from('songs').remove([filePath]);
		}

		isUploading = false;
	}

	$: if (form?.success) {
		invalidateAll();
		form = undefined;
	}

</script>

<!-- HTML-Teil -->
<audio bind:this={audioPlayer} on:ended={() => (currentlyPlayingUrl = null)} />

<div class="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-pink-500 selection:text-white">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
		<!-- Header (Angepasst: Zurück-Link für Schüler zur Startseite) -->
		{#if classData}
			<div class="relative bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-10 overflow-hidden">
				<!-- ... (Header-Inhalt wie zuvor, mit angepasstem Zurück-Link) ... -->
				<div class="relative z-10">
					{#if user && !user.is_anonymous}
						<a href="/dashboard" class="text-sm text-pink-600 hover:underline font-medium mb-2 inline-block">&larr; Zurück zum Dashboard</a>
					{:else}
						<a href="/" class="text-sm text-pink-600 hover:underline font-medium mb-2 inline-block">&larr; Neue Klasse beitreten</a>
					{/if}
					<h1 class="text-4xl font-extrabold text-gray-900 leading-tight">{classData.name}</h1>
					{#if user && !user.is_anonymous}
						<div class="mt-4 bg-gray-100 border-2 border-dashed border-gray-200 rounded-lg p-3 inline-flex items-center gap-3">
							<span class="text-xs text-gray-500 font-semibold uppercase">Klassencode zum Teilen:</span>
							<p class="font-mono text-xl font-extrabold text-gray-800 tracking-wider">{classData.class_code}</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
			<!-- Linke Spalte: Hitparade (unverändert) -->
			<div class="lg:col-span-2">
				<!-- ... (Songliste bleibt unverändert) ... -->
			</div>

			<!-- Rechte Spalte: Song hochladen (jetzt für alle sichtbar) -->
			<div class="lg:col-span-1">
				<div class="bg-white p-6 rounded-xl shadow-lg sticky top-10">
					<h2 class="text-2xl font-bold mb-4">Neuen Song hochladen</h2>
					<form id="upload-form" on:submit|preventDefault={handleUpload} class="space-y-4">
						<div> <label for="title" class="block text-sm font-medium text-gray-700">Song-Titel</label> <input type="text" name="title" id="title" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500" /> </div>
						<div> <label for="artist" class="block text-sm font-medium text-gray-700">Interpret</label> <input type="text" name="artist" id="artist" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500" /> </div>
						<div> <label for="audioFile" class="block text-sm font-medium text-gray-700">Audio-Datei (MP3)</label> <input type="file" name="audioFile" id="audioFile" required accept=".mp3" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" /> </div>
						<button type="submit" disabled={isUploading} class="w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"> {#if isUploading} <span>Wird hochgeladen...</span> {:else} <span>Hochladen</span> {/if} </button>
						{#if form?.error && form?.message} <p class="text-red-500 text-sm mt-2">{form.message}</p> {/if}
					</form>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	button:disabled { cursor: not-allowed; }
	audio { display: none; }
</style>

