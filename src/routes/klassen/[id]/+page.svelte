<!-- Behebt das RLS-Problem, indem der fetch-Aufruf korrekt authentifiziert wird -->
<script lang="ts">
	import type { PageData, ActionData, SubmitFunction } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	// $: sorgt für Reaktivität, wenn sich `data` nach invalidateAll ändert
	$: supabase = data.supabase;
	$: session = data.session;
	$: user = data.user;
	$: classData = data.classData;
	// **WICHTIG:** Wir brauchen eine separate Variable für Sveltes Reaktivität in der Schleife
	let songs = data.songs;
	$: songs = data.songs; // Stelle sicher, dass `songs` aktualisiert wird, wenn `data.songs` sich ändert


	let currentlyPlayingUrl: string | null = null;
	let audioPlayer: HTMLAudioElement;
	let isUploading = false;

	function playSong(path: string) {
		if (!supabase) return;
		const {
			data: { publicUrl }
		} = supabase.storage.from('songs').getPublicUrl(path);
		if (audioPlayer && currentlyPlayingUrl === publicUrl) { audioPlayer.pause(); currentlyPlayingUrl = null; } else { if (audioPlayer) audioPlayer.pause(); audioPlayer.src = publicUrl; audioPlayer.play(); currentlyPlayingUrl = publicUrl; }
	}

	async function handleUpload(event: SubmitEvent) {
		// ... (handleUpload bleibt unverändert) ...
		if (!supabase || !session || !user) { form = { error: true, message: 'Du musst eingeloggt sein.' }; return; }
		isUploading = true; form = undefined;
		const formData = new FormData(event.target as HTMLFormElement);
		const audioFile = formData.get('audioFile') as File; const title = formData.get('title') as string; const artist = formData.get('artist') as string;
		if (!title || !artist || !audioFile || !audioFile.size) { form = { error: true, message: 'Alle Felder und Datei erforderlich.' }; isUploading = false; return; }
		const sanitizedFileName = audioFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
		const filePath = `${user.id}/${classData?.id}/${Date.now()}-${sanitizedFileName}`;
		const { error: uploadError } = await supabase.storage.from('songs').upload(filePath, audioFile);
		if (uploadError) { form = { error: true, message: 'Upload Error: ' + uploadError.message }; isUploading = false; return; }
		const metadataForm = new FormData(); metadataForm.append('title', title); metadataForm.append('artist', artist); metadataForm.append('filePath', filePath);
		try { const response = await fetch('?/saveSongMetadata', { method: 'POST', body: metadataForm }); if (!response.ok) { let errorMessage = 'DB Error.'; try { const errorResult = await response.json(); errorMessage = errorResult.message || errorMessage; } catch (e) {} form = { error: true, message: errorMessage }; await supabase.storage.from('songs').remove([filePath]); } else { const result = await response.json(); if (result?.type === 'success') { invalidateAll(); (event.target as HTMLFormElement).reset(); } else { let errorMessage = 'Unbekannter DB Fehler.'; if (result?.type === 'failure' && result.data?.message) errorMessage = result.data.message; else if (result?.message) errorMessage = result.message; form = { error: true, message: errorMessage }; await supabase.storage.from('songs').remove([filePath]); } } } catch (fetchError) { form = { error: true, message: 'Netzwerkfehler.' }; await supabase.storage.from('songs').remove([filePath]); }
		isUploading = false;
	}

	// Callback für das Bewertungsformular
	const handleRatingResult: SubmitFunction = () => {
		console.log('[handleRatingResult] Formular wird abgeschickt...');
		return async ({ result }) => { // update entfernt
			console.log('[handleRatingResult] Antwort vom Server erhalten:', result);
			if (result.type === 'success') {
				console.log('[handleRatingResult] Server meldet Erfolg! Rufe invalidateAll() auf...');
				await invalidateAll();
				console.log('[handleRatingResult] invalidateAll() abgeschlossen.');

				// **FINALE KORREKTUR V4:** Weise die `songs`-Variable explizit neu zu,
				// nachdem die Daten neu geladen wurden. Das zwingt Svelte zur Aktualisierung.
				// Wir greifen hier direkt auf die globale `data`-Variable zu,
				// die von SvelteKit nach invalidateAll aktualisiert werden sollte.
				// songs = data.songs; // Diese Zeile scheint nicht nötig, wenn $: songs = data.songs; oben steht. Testen wir ohne.

				console.log('[handleRatingResult] UI sollte jetzt aktualisiert sein.');


			} else {
				console.error('[handleRatingResult] Server meldet Fehler:', result);
				if (result.type === 'failure' && result.data?.message) {
					form = { error: true, message: result.data.message };
				} else {
					form = { error: true, message: 'Fehler beim Bewerten.' };
				}
			}
			// Kein update() Aufruf mehr
		};
	};

</script>

<!-- Rest des HTML bleibt unverändert -->

<audio bind:this={audioPlayer} on:ended={() => (currentlyPlayingUrl = null)} />

<div class="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-pink-500 selection:text-white">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
		<!-- Header (unverändert) -->
		{#if classData}
			<div class="relative bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-10 overflow-hidden">
				<!-- ... -->
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
			<!-- Linke Spalte: Hitparade -->
			<div class="lg:col-span-2">
				<h2 class="text-2xl font-bold mb-6">Hitparade 🎵</h2>
				<div class="space-y-4">
					<!-- **WICHTIG:** Verwende die reaktive `songs`-Variable hier -->
					{#if songs && songs.length > 0}
						{#each songs as song, i (song.id)}
							<div class="bg-white p-4 rounded-xl shadow-lg flex flex-col gap-3 border-l-4 border-pink-500 transform hover:-translate-y-1 hover:shadow-xl transition-all duration-200 ease-in-out">
								<!-- Song-Infos & Player (unverändert) -->
								<div class="flex items-center gap-4">
									<!-- ... -->
									<div class="text-3xl font-extrabold text-pink-500 w-10 text-center">{i + 1}.</div>
									<button on:click={() => playSong(song.audio_url)} class="bg-pink-500 text-white p-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200">
										{#if currentlyPlayingUrl?.includes(song.audio_url)} <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> {:else} <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6"><path d="M8 5v14l11-7z"/></svg> {/if}
									</button>
									<div class="flex-grow min-w-0"> <h3 class="text-md sm:text-lg font-bold text-gray-900 leading-snug truncate" title={song.title}>{song.title}</h3> <p class="text-sm text-gray-600 font-medium mt-1 truncate" title={song.artist}>{song.artist}</p> </div>
									{#if data.user?.id === data.classData?.owner_id} <form method="POST" action="?/deleteSong" use:enhance> <input type="hidden" name="songId" value={song.id} /> <input type="hidden" name="songPath" value={song.audio_url} /> <button type="submit" class="text-gray-400 hover:text-red-500 transition-colors transform hover:scale-110"> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg> </button> </form> {/if}
								</div>
								<!-- Bewertung -->
								<div class="flex justify-between items-center mt-2 pt-3 border-t border-gray-100">
									<div class="flex items-center gap-2">
										<span class="font-bold text-lg text-yellow-500">★</span>
										<span class="font-semibold text-gray-700">{(song.average_rating ?? 0).toFixed(1)}</span>
										<span class="text-sm text-gray-500">/ 5.0</span>
									</div>
									<!-- use:enhance mit handleRatingResult verwenden -->
									<form method="POST" action="?/rateSong" use:enhance={handleRatingResult} class="flex items-center gap-1">
										<input type="hidden" name="songId" value={song.id} />
										{#each { length: 5 } as _, starValue}
											{@const rating = starValue + 1}
											<button name="ratingValue" value={rating} class="text-2xl transition-transform hover:scale-125
												{rating <= (song.user_rating ?? 0) ? 'text-yellow-400' : 'text-gray-300'}">
												★
											</button>
										{/each}
									</form>
								</div>
							</div>
						{/each}
					{:else}
						<div class="text-center py-10 px-6 bg-white rounded-xl shadow-md"> <p class="font-semibold text-gray-500">Noch keine Songs in dieser Klasse.</p> </div>
					{/if}
				</div>
			</div>

			<!-- Rechte Spalte: Song hochladen (unverändert) -->
			{#if data.user && !data.user.is_anonymous}
				<div class="lg:col-span-1">
					<!-- ... (Upload Formular unverändert) ... -->
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
			{/if}
		</div>
	</div>
</div>

<style>
	button:disabled { cursor: not-allowed; }
	audio { display: none; }
</style>

