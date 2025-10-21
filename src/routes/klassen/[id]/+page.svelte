<!--
  Dies ist die Haupt-Ansicht für eine einzelne Klasse – die Hitparade.
  Sie zeigt Klassendetails, eine Liste der Songs und ein Upload-Formular.
  Das Design basiert auf unserem "fetzigen" Entwurf.
-->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { invalidateAll } from '$app/navigation';

	export let data: PageData;
	export let form: ActionData;

	// Diese Variable steuert, welcher Song gerade abgespielt wird.
	let currentlyPlayingUrl: string | null = null;
	let audioPlayer: HTMLAudioElement;

	function playSong(url: string) {
		if (audioPlayer && currentlyPlayingUrl === url) {
			audioPlayer.pause();
			currentlyPlayingUrl = null;
		} else {
			if (audioPlayer) {
				audioPlayer.pause();
			}
			audioPlayer.src = url;
			audioPlayer.play();
			currentlyPlayingUrl = url;
		}
	}

	// Wenn das Formular erfolgreich abgesendet wurde (neuer Song),
	// laden wir die Daten der Seite neu, um die Liste zu aktualisieren.
	$: if (form?.success) {
		invalidateAll();
		const uploadForm = document.getElementById('upload-form') as HTMLFormElement;
		if(uploadForm) uploadForm.reset();
	}
</script>

<!-- Unsichtbarer Audio-Player, den wir per Code steuern -->
<audio bind:this={audioPlayer} on:ended={() => (currentlyPlayingUrl = null)} />

<div class="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-pink-500 selection:text-white">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
		<!-- Header-Bereich mit Klassendetails -->
		{#if data.classData}
			<div class="relative bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-10 overflow-hidden">
				<div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500 via-green-400 to-blue-400 opacity-10 blur-xl scale-110"></div>
				<div class="relative z-10">
					<a href="/dashboard" class="text-sm text-pink-600 hover:underline font-medium mb-2 inline-block">&larr; Zurück zum Dashboard</a>
					<h1 class="text-4xl font-extrabold text-gray-900 leading-tight">{data.classData.name}</h1>
					<div class="mt-4 bg-gray-100 border-2 border-dashed border-gray-200 rounded-lg p-3 inline-flex items-center gap-3">
						<span class="text-xs text-gray-500 font-semibold uppercase">Klassencode zum Teilen:</span>
						<p class="font-mono text-xl font-extrabold text-gray-800 tracking-wider">{data.classData.class_code}</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
			<!-- Linke Spalte: Song-Liste -->
			<div class="lg:col-span-2">
				<h2 class="text-2xl font-bold mb-6">Hitparade 🎵</h2>
				<div class="space-y-4">
					{#if data.songs && data.songs.length > 0}
						{#each data.songs as song, i (song.id)}
							<div class="bg-white p-4 rounded-xl shadow-lg flex items-center gap-4 border-l-4 border-pink-500 transform hover:-translate-y-1 hover:shadow-xl transition-all duration-200 ease-in-out">
								<div class="text-3xl font-extrabold text-pink-500 w-10 text-center">{i + 1}.</div>
								<button on:click={() => playSong(song.audio_url)} class="bg-pink-500 text-white p-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200">
									<!-- Zeigt Play oder Pause Icon basierend auf dem Abspielstatus -->
									{#if currentlyPlayingUrl === song.audio_url}
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6"><path d="M8 5v14l11-7z"/></svg>
									{/if}
								</button>
								<div class="flex-grow">
									<h3 class="text-lg font-bold text-gray-900 leading-snug">{song.title}</h3>
									<p class="text-sm text-gray-600 font-medium mt-1">{song.artist}</p>
								</div>
								<!-- Formular zum Löschen eines Songs -->
								<form method="POST" action="?/deleteSong" use:enhance>
									<input type="hidden" name="songId" value={song.id} />
									<input type="hidden" name="songPath" value={song.audio_url.split('/').slice(-3).join('/')} />
									<button type="submit" class="text-gray-400 hover:text-red-500 transition-colors transform hover:scale-110">
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
									</button>
								</form>
							</div>
						{/each}
					{:else}
						<div class="text-center py-10 px-6 bg-white rounded-xl shadow-md">
							<p class="font-semibold text-gray-500">Noch keine Songs in dieser Klasse. Lade den ersten Song hoch!</p>
						</div>
					{/if}
				</div>
			</div>

			<!-- Rechte Spalte: Song hochladen -->
			<div class="lg:col-span-1">
				<div class="bg-white p-6 rounded-xl shadow-lg sticky top-10">
					<h2 class="text-2xl font-bold mb-4">Neuen Song hochladen</h2>
					<form id="upload-form" method="POST" action="?/uploadSong" enctype="multipart/form-data" class="space-y-4">
						<div>
							<label for="title" class="block text-sm font-medium text-gray-700">Song-Titel</label>
							<input type="text" name="title" id="title" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
						</div>
						<div>
							<label for="artist" class="block text-sm font-medium text-gray-700">Interpret</label>
							<input type="text" name="artist" id="artist" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
						</div>
						<div>
							<label for="audioFile" class="block text-sm font-medium text-gray-700">Audio-Datei (MP3)</label>
							<input type="file" name="audioFile" id="audioFile" required accept=".mp3" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100" />
						</div>
						<button type="submit" class="w-full bg-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-pink-700 transition-colors shadow-lg">
							Hochladen
						</button>
						{#if form?.error}
							<p class="text-red-500 text-sm mt-2">{form.message}</p>
						{/if}
					</form>
				</div>
			</div>
		</div>
	</div>
</div>

