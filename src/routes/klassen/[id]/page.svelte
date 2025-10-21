<script lang="ts">
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	// Wir machen die Daten optional, um Fehler abzufangen
	const { classData, songs } = data;
</script>

<!-- HINZUGEFÜGT: Eine #if-Prüfung, die die ganze Seite umschliesst -->
{#if classData}
	<!-- Hier verwenden wir unser "fetziges" Design als Basis -->
	<div class="min-h-screen bg-[#F0F2F5] p-4 sm:p-8">
		<div class="max-w-5xl mx-auto">
			<!-- Klassen-Header -->
			<div class="relative bg-white p-6 sm:p-8 rounded-xl shadow-xl mb-10 overflow-hidden">
				<div
					class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500 via-green-400 to-blue-400 opacity-10 blur-xl scale-110"
				/>
				<div class="relative z-10">
					<a
						href="/dashboard"
						class="text-sm text-pink-600 hover:underline font-medium mb-2 inline-block"
						>&larr; Zurück zum Dashboard</a
					>
					<h1 class="text-4xl font-extrabold text-gray-900 leading-tight">{classData.name}</h1>
					<div
						class="mt-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-3 inline-flex items-center gap-3"
					>
						<span class="text-xs text-gray-500 font-semibold uppercase">Klassencode zum Teilen</span>
						<p class="font-mono text-xl font-extrabold text-gray-800 tracking-wider">
							{classData.class_code}
						</p>
					</div>
				</div>
			</div>

			<!-- Song-Upload-Formular -->
			<div class="bg-white p-6 rounded-lg shadow-md mb-8">
				<h2 class="text-2xl font-bold mb-4">Neuen Song hochladen</h2>
				<form
					method="POST"
					action="?/uploadSong"
					enctype="multipart/form-data"
					class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
				>
					<div class="flex flex-col">
						<label for="title" class="mb-1 font-semibold text-gray-700">Song-Titel</label>
						<input
							type="text"
							id="title"
							name="title"
							required
							class="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
						/>
					</div>
					<div class="flex flex-col">
						<label for="artist" class="mb-1 font-semibold text-gray-700">Interpret</label>
						<input
							type="text"
							id="artist"
							name="artist"
							required
							class="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
						/>
					</div>
					<div class="flex flex-col">
						<label for="audioFile" class="mb-1 font-semibold text-gray-700"
							>Audio-Datei (MP3)</label
						>
						<input
							type="file"
							id="audioFile"
							name="audioFile"
							required
							accept=".mp3,audio/*"
							class="p-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
						/>
					</div>
					<button
						type="submit"
						class="md:col-span-3 w-full mt-2 px-6 py-3 bg-pink-600 text-white font-bold rounded-lg shadow-lg hover:bg-pink-700 transition-all transform hover:scale-105"
					>
						Hochladen
					</button>
				</form>
				{#if form?.error}
					<p class="text-red-500 mt-2">{form.message}</p>
				{/if}
				{#if form?.success}
					<p class="text-green-500 mt-2">Song erfolgreich hochgeladen!</p>
				{/if}
			</div>

			<!-- Hitparade / Song-Liste -->
			<div>
				<h2 class="text-2xl font-bold mb-4">Hitparade</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#if songs && songs.length > 0}
						{#each songs as song, i}
							<div
								class="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-5 border-l-4 border-pink-500 transform hover:-translate-y-1 hover:shadow-xl transition-all duration-200 ease-in-out"
							>
								<div class="flex items-center gap-4">
									<div class="text-3xl font-extrabold text-pink-500 w-10 text-center">
										{i + 1}.
									</div>
									<audio controls src={song.audio_url} class="w-full">
										Your browser does not support the audio element.
									</audio>
								</div>
								<div>
									<h3 class="text-xl font-bold text-gray-900 leading-snug">{song.title}</h3>
									<p class="text-sm text-gray-600 font-medium mt-1">{song.artist}</p>
								</div>
								<div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
									<!-- Hier kommt später die Stern-Bewertung hin -->
									<div class="text-gray-400">Bewertung folgt...</div>
								</div>
							</div>
						{/each}
					{:else}
						<p class="text-gray-500 md:col-span-3 bg-white p-6 rounded-lg shadow-sm">
							Noch keine Songs in dieser Klasse. Lade den ersten hoch!
						</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else}
	<!-- HINZUGEFÜGT: Dieser Block wird angezeigt, wenn die Klasse nicht geladen werden konnte -->
	<div class="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center px-4">
		<div class="max-w-md">
			<h1 class="text-2xl font-bold text-red-600">Fehler 404</h1>
			<p class="mt-2 text-gray-600">
				Die angeforderte Klasse konnte nicht gefunden werden oder du hast keine Berechtigung, sie
				anzusehen.
			</p>
			<a href="/dashboard" class="mt-6 inline-block px-6 py-3 bg-pink-600 text-white font-bold rounded-lg shadow-lg hover:bg-pink-700 transition-colors">
				Zurück zum Dashboard
			</a>
		</div>
	</div>
{/if}

