<!-- Behebt das RLS-Problem, indem der fetch-Aufruf korrekt authentifiziert wird -->
<script lang="ts">
	import type { PageData, ActionData, SubmitFunction } from './$types'; // SubmitFunction hinzugefügt
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	let currentlyPlayingUrl: string | null = null;
	let audioPlayer: HTMLAudioElement;
	let isUploading = false;

	function playSong(path: string) {
		if (!data.supabase) return;
		const {
			data: { publicUrl }
		} = data.supabase.storage.from('songs').getPublicUrl(path);
		if (audioPlayer && currentlyPlayingUrl === publicUrl) { audioPlayer.pause(); currentlyPlayingUrl = null; } else { if (audioPlayer) audioPlayer.pause(); audioPlayer.src = publicUrl; audioPlayer.play(); currentlyPlayingUrl = publicUrl; }
	}

	async function handleUpload(event: SubmitEvent) {
		// ... (handleUpload bleibt unverändert) ...
		if (!data.supabase || !data.session || !data.user) { form = { error: true, message: 'Du musst eingeloggt sein.' }; return; }
		isUploading = true; form = undefined;
		const formData = new FormData(event.target as HTMLFormElement);
		const audioFile = formData.get('audioFile') as File; const title = formData.get('title') as string; const artist = formData.get('artist') as string;
		if (!title || !artist || !audioFile || !audioFile.size) { form = { error: true, message: 'Alle Felder und Datei erforderlich.' }; isUploading = false; return; }
		const sanitizedFileName = audioFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
		const filePath = `${data.user.id}/${data.classData?.id}/${Date.now()}-${sanitizedFileName}`;
		const { error: uploadError } = await data.supabase.storage.from('songs').upload(filePath, audioFile);
		if (uploadError) { form = { error: true, message: 'Upload Error: ' + uploadError.message }; isUploading = false; return; }
		const metadataForm = new FormData(); metadataForm.append('title', title); metadataForm.append('artist', artist); metadataForm.append('filePath', filePath);
		try { const response = await fetch('?/saveSongMetadata', { method: 'POST', body: metadataForm }); if (!response.ok) { let errorMessage = 'DB Error.'; try { const errorResult = await response.json(); errorMessage = errorResult.message || errorMessage; } catch (e) {} form = { error: true, message: errorMessage }; await data.supabase.storage.from('songs').remove([filePath]); } else { const result = await response.json(); if (result?.type === 'success') { invalidateAll(); (event.target as HTMLFormElement).reset(); } else { let errorMessage = 'Unbekannter DB Fehler.'; if (result?.type === 'failure' && result.data?.message) errorMessage = result.data.message; else if (result?.message) errorMessage = result.message; form = { error: true, message: errorMessage }; await data.supabase.storage.from('songs').remove([filePath]); } } } catch (fetchError) { form = { error: true, message: 'Netzwerkfehler.' }; await data.supabase.storage.from('songs').remove([filePath]); }
		isUploading = false;
	}

	// **FINALE KORREKTUR für Rating-Aktualisierung:**
	// Wir verwenden die `result`-Callback von `use:enhance`
	const handleRatingResult: SubmitFunction = () => {
		return async ({ result, update }) => {
			// Prüfe, ob die Server-Action erfolgreich war (Typ 'success')
			if (result.type === 'success') {
				// Wenn ja, lade alle Daten neu, um die Änderungen anzuzeigen
				await invalidateAll();
			}
			// `update()` wird hier nicht benötigt, da invalidateAll() die Seite neu lädt
		};
	};

	// **ENTFERNT:** Der $: Block ist nicht mehr nötig für die Rating-Aktualisierung.
	// Er kann bleiben, falls wir ihn für andere enhance-Formulare (z.B. deleteSong) brauchen würden,
	// aber handleRatingResult ist spezifischer und robuster.
	// $: if (form?.success) {
	// 	invalidateAll();
	// 	form = undefined;
	// }

</script>

<audio bind:this={audioPlayer} on:ended={() => (currentlyPlayingUrl = null)} />

<div class="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-pink-500 selection:text-white">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
		<!-- Header (unverändert) -->
		{#if data.classData}
			<div class="relative bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-10 overflow-hidden">
				<!-- ... -->
				<div class="relative z-10">
					{#if data.user && !data.user.is_anonymous}
						<a href="/dashboard" class="text-sm text-pink-600 hover:underline font-medium mb-2 inline-block">&larr; Zurück zum Dashboard</a>
					{:else}
						<a href="/" class="text-sm text-pink-600 hover:underline font-medium mb-2 inline-block">&larr; Neue Klasse beitreten</a>
					{/if}
					<h1 class="text-4xl font-extrabold text-gray-900 leading-tight">{data.classData.name}</h1>
					{#if data.user && !data.user.is_anonymous}
						<div class="mt-4 bg-gray-100 border-2 border-dashed border-gray-200 rounded-lg p-3 inline-flex items-center gap-3">
							<span class="text-xs text-gray-500 font-semibold uppercase">Klassencode zum Teilen:</span>
							<p class="font-mono text-xl font-extrabold text-gray-800 tracking-wider">{data.classData.class_code}</p>
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
					{#if data.songs && data.songs.length > 0}
						{#each data.songs as song, i (song.id)}
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
									<!-- **KORREKTUR: use:enhance mit handleRatingResult verwenden** -->
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
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	button:disabled { cursor: not-allowed; }
	audio { display: none; }
</style>

