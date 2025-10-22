<!--
  Dies ist die Haupt-Ansicht für eine einzelne Klasse – die Hitparade.
  Sie zeigt Klassendetails, eine Liste der Songs und ein Upload-Formular.
  Das Design basiert auf unserem "fetzigen" Entwurf.
-->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	let { supabase, session, user } = data;
	$: ({ supabase, session, user } = data);

	let currentlyPlayingUrl: string | null = null;
	let audioPlayer: HTMLAudioElement;
	let isUploading = false;

	function playSong(path: string) {
		const {
			data: { publicUrl }
		} = supabase.storage.from('songs').getPublicUrl(path);

		if (audioPlayer && currentlyPlayingUrl === publicUrl) {
			audioPlayer.pause();
			currentlyPlayingUrl = null;
		} else {
			if (audioPlayer) audioPlayer.pause();
			// Initialisiere den Player neu, falls er noch nicht existiert oder um Probleme zu vermeiden
			audioPlayer = new Audio(publicUrl);
			audioPlayer.play();
			audioPlayer.addEventListener('ended', () => (currentlyPlayingUrl = null)); // Listener für das Ende hinzufügen
			currentlyPlayingUrl = publicUrl;
		}
	}

	async function handleUpload(event: SubmitEvent) {
		if (!session) {
			form = { error: true, message: 'Du musst eingeloggt sein, um hochzuladen.' };
			return;
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
		const filePath = `${session.user.id}/${data.classData?.id}/${Date.now()}-${sanitizedFileName}`;
		const { error: uploadError } = await supabase.storage.from('songs').upload(filePath, audioFile);
		if (uploadError) {
			form = { error: true, message: 'Datei konnte nicht hochgeladen werden: ' + uploadError.message };
			isUploading = false;
			return;
		}
		const metadataForm = new FormData();
		metadataForm.append('title', title);
		metadataForm.append('artist', artist);
		metadataForm.append('filePath', filePath);
		try {
			const response = await fetch('?/saveSongMetadata', { method: 'POST', body: metadataForm });
			if (!response.ok) {
				let errorMessage = 'Song konnte nicht in der DB gespeichert werden.';
				try { const errorResult = await response.json(); errorMessage = errorResult.message || errorMessage; } catch (e) { /* ignore */ }
				form = { error: true, message: errorMessage };
				await supabase.storage.from('songs').remove([filePath]);
			} else {
				const result = await response.json();
				if (result.type === 'success' || result.success) { // Prüfe beide möglichen Erfolgsrückgaben
					invalidateAll();
					(event.target as HTMLFormElement).reset();
				} else {
					let errorMessage = 'Unbekannter Fehler nach DB-Speicherung.';
					if (result && result.type === 'failure' && result.data?.message) { errorMessage = result.data.message; }
					else if (result && result.message) { errorMessage = result.message; }
					form = { error: true, message: errorMessage };
					await supabase.storage.from('songs').remove([filePath]);
				}
			}
		} catch (fetchError) {
			form = { error: true, message: 'Netzwerkfehler beim Speichern der Song-Details.' };
			await supabase.storage.from('songs').remove([filePath]);
		}
		isUploading = false;
	}

	$: if (form?.success) {
		invalidateAll();
		form = undefined;
	}

	onMount(() => {
		({ supabase, session, user } = data);
		// Stelle sicher, dass der Audioplayer initialisiert wird, falls er serverseitig nicht existiert
		if (typeof Audio !== 'undefined' && !audioPlayer) {
			audioPlayer = new Audio();
			audioPlayer.addEventListener('ended', () => (currentlyPlayingUrl = null));
		}
	});

	// Cleanup-Funktion, um den Audio-Player zu stoppen, wenn die Komponente verlassen wird
	import { onDestroy } from 'svelte';
	onDestroy(() => {
		if (audioPlayer) {
			audioPlayer.pause();
			audioPlayer.src = ''; // Quelle leeren, um Ressourcen freizugeben
		}
	});
</script>

<!-- Audio-Element ausserhalb des Haupt-Divs, um Layout-Sprünge zu vermeiden -->
<audio bind:this={audioPlayer} />

<!-- Hauptcontainer mit Hintergrund und Basisschrift -->
<div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 text-gray-800 font-sans selection:bg-pink-500 selection:text-white p-4 sm:p-6 lg:p-10">
	<div class="container mx-auto">

		<!-- Header-Bereich mit Klassendetails -->
		{#if data.classData}
			<div class="relative bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-lg mb-10 border border-gray-200">
				<!-- Dekoratives Element -->
				<div class="absolute -top-3 -left-3 w-16 h-16 bg-pink-500 rounded-full opacity-30 blur-xl animate-pulse"></div>
				<div class="relative z-10">
					<a href="/dashboard" class="inline-flex items-center gap-1 text-sm text-pink-600 hover:text-pink-800 font-semibold mb-3 transition-colors">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
						Zurück zum Dashboard
					</a>
					<h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">{data.classData.name}</h1>
					<div class="bg-gray-100 border border-gray-200 rounded-lg p-3 inline-flex items-center gap-3 shadow-sm">
						<span class="text-xs text-gray-500 font-semibold uppercase">Klassencode:</span>
						<p class="font-mono text-lg sm:text-xl font-bold text-gray-800 tracking-wider bg-white px-2 py-1 rounded shadow-inner">{data.classData.class_code}</p>
						<!-- Einfacher Kopieren-Button (optional) -->
						<button title="Code kopieren" class="text-gray-400 hover:text-pink-600 transition-colors"
								onclick={async () => {
									try {
										await navigator.clipboard.writeText(data.classData?.class_code || '');
										alert('Code kopiert!');
									} catch (err) {
										console.error('Fehler beim Kopieren:', err);
									}
								}}>
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Hauptbereich: Hitparade und Upload-Formular -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-10">

			<!-- Linke Spalte: Hitparade -->
			<div class="lg:col-span-2">
				<div class="flex justify-between items-center mb-6">
					<h2 class="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-pink-500"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
						Hitparade
					</h2>
					<!-- Optional: Sortier-Buttons könnten hier hin -->
				</div>
				<div class="space-y-4">
					{#if data.songs && data.songs.length > 0}
						{#each data.songs as song, i (song.id)}
							<div class="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-100 flex flex-col gap-3 transition-shadow hover:shadow-lg">
								<!-- Oberer Teil: Song-Infos & Player -->
								<div class="flex items-center gap-4">
									<div class="text-2xl sm:text-3xl font-bold text-pink-600 w-10 text-center flex-shrink-0">{i + 1}.</div>
									<button
										on:click={() => playSong(song.audio_url)}
										class:bg-pink-600={!currentlyPlayingUrl?.includes(song.audio_url)}
										class:bg-green-500={currentlyPlayingUrl?.includes(song.audio_url)}
										class="text-white p-3 sm:p-4 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all duration-200 flex-shrink-0"
										aria-label={currentlyPlayingUrl?.includes(song.audio_url) ? 'Pause' : 'Play'}>
										{#if currentlyPlayingUrl?.includes(song.audio_url)}
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
										{:else}
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
										{/if}
									</button>
									<!-- KORREKTUR: Korrekte HTML-Kommentar-Syntax -->
									<div class="flex-grow min-w-0"> <!-- Verhindert Überlaufen bei langen Titeln -->
										<h3 class="text-md sm:text-lg font-bold text-gray-900 leading-snug truncate" title={song.title}>{song.title}</h3>
										<p class="text-sm text-gray-600 font-medium mt-1 truncate" title={song.artist}>{song.artist}</p>
									</div>
									<!-- Löschen-Button nur für den Klassenbesitzer -->
									{#if user?.id === data.classData?.owner_id}
										<form method="POST" action="?/deleteSong" use:enhance class="flex-shrink-0">
											<input type="hidden" name="songId" value={song.id} />
											<input type="hidden" name="songPath" value={song.audio_url} />
											<button type="submit" title="Song löschen" class="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-100">
												<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
											</button>
										</form>
									{/if}
								</div>
								<!-- Unterer Teil: Bewertungssystem -->
								<div class="flex justify-between items-center mt-2 pt-3 border-t border-gray-100 px-2">
									<div class="flex items-center gap-1 text-sm sm:text-base">
										<span class="font-bold text-lg text-yellow-500">★</span>
										<span class="font-semibold text-gray-700">{(song.average_rating ?? 0).toFixed(1)}</span>
										<span class="text-gray-500">/ 5.0</span>
									</div>
									<!-- Interaktives 5-Sterne-Rating -->
									<form method="POST" action="?/rateSong" use:enhance class="flex items-center gap-0.5 sm:gap-1">
										<input type="hidden" name="songId" value={song.id} />
										{#each { length: 5 } as _, starValue}
											{@const rating = starValue + 1}
											<button
												name="ratingValue"
												value={rating}
												title={`Bewerte mit ${rating} Sternen`}
												class="text-xl sm:text-2xl transition-transform duration-150 ease-in-out hover:scale-125 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 rounded-sm
												{rating <= (song.user_rating ?? 0) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}">
												★
											</button>
										{/each}
									</form>
								</div>
							</div>
						{/each}
					{:else}
						<div class="text-center py-16 px-6 bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-gray-100">
							<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-gray-400 mb-4"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
							<p class="font-semibold text-gray-600">Noch keine Songs in dieser Klasse.</p>
							<p class="text-sm text-gray-500">Lade den ersten Song über das Formular rechts hoch!</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Rechte Spalte: Song hochladen (Sticky) -->
			<div class="lg:col-span-1">
				<div class="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg sticky top-6 border border-gray-200">
					<h2 class="text-2xl font-bold mb-5 text-gray-900 flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-pink-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
						Neuen Song hochladen
					</h2>
					<form id="upload-form" on:submit|preventDefault={handleUpload} class="space-y-4">
						<div>
							<label for="title" class="block text-sm font-medium text-gray-700 mb-1">Song-Titel</label>
							<input type="text" name="title" id="title" required placeholder="z.B. Der Wasserkreislauf-Rap" class="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
						</div>
						<div>
							<label for="artist" class="block text-sm font-medium text-gray-700 mb-1">Interpret</label>
							<input type="text" name="artist" id="artist" required placeholder="z.B. Gruppe A, Klasse 5b" class="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
						</div>
						<div>
							<label for="audioFile" class="block text-sm font-medium text-gray-700 mb-1">Audio-Datei (MP3)</label>
							<input type="file" name="audioFile" id="audioFile" required accept=".mp3" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200 transition-colors cursor-pointer border border-gray-300 rounded-lg shadow-sm" />
							<p class="mt-1 text-xs text-gray-500">Maximal ~10MB empfohlen.</p>
						</div>
						<button
							type="submit"
							disabled={isUploading}
							class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:from-pink-600 hover:to-rose-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
							{#if isUploading}
								<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								<span>Wird hochgeladen...</span>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
								<span>Hochladen</span>
							{/if}
						</button>
						{#if form?.error && form?.message}
							<div class="mt-3 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
								<p><strong class="font-medium">Fehler:</strong> {form.message}</p>
							</div>
						{/if}
					</form>
				</div>
			</div>

		</div> <!-- Ende Grid -->
	</div> <!-- Ende Container -->
</div> <!-- Ende Haupt-Div -->

<style>
	/* Zusätzliche Stile für besseres Aussehen und Gefühl */
	body {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	/* Styling für den aktiven Play-Button (optional) */
	/* button.playing {
		animation: pulse 1.5s infinite cubic-bezier(0.4, 0, 0.6, 1);
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.05);
		}
	} */

	/* Styling für die Sterne beim Hover/Fokus */
	form[action*="rateSong"] button:hover,
	form[action*="rateSong"] button:focus {
		/* transform: scale(1.2); */ /* Wurde durch Tailwind-Klasse ersetzt */
	}
</style>

